import {SUPPORT_MODEL} from './support-config.js?v=8ee67d2c3612bfccb49e';
import {FACTS, ROUTES, ANSWERS, BINARY_OPTIONS, ROUTE_INSTRUCTIONS, BINARY_INSTRUCTIONS, classifyQuestion, lookupOrder} from './support-policy.js?v=8ee67d2c3612bfccb49e';

class SupportWorker {
  constructor(onState) { this.onState = onState; this.pending = new Map(); this.next = 0; this.worker = null; this.disposed = false; }
  start() {
    if (this.worker) return;
    this.worker = new Worker(new URL('./support.worker.js?v=8ee67d2c3612bfccb49e', import.meta.url), {type: 'module'});
    this.worker.onmessage = ({data: {reqId, kind, data}}) => {
      const job = this.pending.get(reqId);
      if (!job) return;
      if (kind === 'progress') { this.onState(data.state === 'warming' ? 'loading' : data.state, {...data.detail, ...(data.state === 'warming' ? {message: 'Warming up…'} : {})}); return; }
      if (kind === 'token') { job.onToken?.(data.text); return; }
      clearTimeout(job.timer); this.pending.delete(reqId);
      if (kind === 'error') job.reject(new Error(data.message));
      else job.resolve(data);
    };
    this.worker.onerror = event => this.fail(new Error(event.message || 'The support model worker stopped.'));
    this.worker.onmessageerror = () => this.fail(new Error('The support model returned an unreadable message.'));
  }
  fail(error) {
    this.worker?.terminate(); this.worker = null;
    for (const job of this.pending.values()) { clearTimeout(job.timer); job.reject(error); }
    this.pending.clear(); this.onState('error', {message: error.message});
  }
  dispose() {
    this.disposed = true;
    if (this.worker) {
      this.worker.onmessage = this.worker.onerror = this.worker.onmessageerror = null;
      this.worker.terminate(); this.worker = null;
    }
    for (const job of this.pending.values()) { clearTimeout(job.timer); job.reject(new Error('Model loading was cancelled. Refresh the page to load models again.')); }
    this.pending.clear();
  }
  run(cmd, args = {}, {onToken} = {}) {
    if (this.disposed) return Promise.reject(new Error('Model loading was cancelled. Refresh the page to load models again.'));
    this.start();
    return new Promise((resolve, reject) => {
      const reqId = ++this.next;
      const timer = setTimeout(() => this.fail(new Error(cmd === 'load' ? 'Qwen took too long to load. Check your connection and retry.' : 'Qwen took too long to answer on this device. Please retry.')), cmd === 'load' ? 600000 : 300000);
      this.pending.set(reqId, {resolve, reject, onToken, timer});
      this.worker.postMessage({reqId, cmd, args});
    });
  }
}

// The control flow is separate from model loading so it can be tested with
// model outputs at each real boundary, including the Jev failure branch.
export async function runSupportQuestion(text, {questionType, choose, explain, jev}, onEvent = () => {}) {
  const trace = [];
  async function step(model, fn, detail = {}) {
    onEvent({type: 'start', model, ...detail});
    const start = performance.now(), result = await fn();
    const entry = {model, choice: result.choice || 'Written reply', ms: Math.round(performance.now() - start), ...detail};
    trace.push(entry); onEvent({type: 'finish', ...entry}); return result;
  }
  const done = answer => { const result = {answer, trace}; onEvent({type: 'done', ...result}); return result; };
  const head = await step('Embeddings + classifier', () => questionType(text));
  const record = await step('Order lookup', () => lookupOrder(text));
  if (record.choice === 'Unknown order') return done('I do not have a record for that order. This demo only has order 123, so I cannot tell whether another order has shipped.');
  const state = `${FACTS}\nCustomer: ${text}`;
  let route;
  if (head.choice === 'yes') {
    const binary = await step('Qwen · yes/no', () => choose({state, instructions: BINARY_INSTRUCTIONS, options: BINARY_OPTIONS}));
    if (binary.choice === 'yes' || binary.choice === 'no') return done(binary.choice === 'yes' ? 'Yes.' : 'No.');
    if (binary.choice === 'clarify') route = binary;
    else if (binary.choice !== 'route') throw new Error('The yes/no decision returned an unknown route.');
  }
  route ||= await step('Qwen · support route', () => choose({state, question: text, instructions: ROUTE_INSTRUCTIONS, options: ROUTES}));
  // A proposed clarification gets a second opinion before asking the customer
  // for more information. Keep Qwen's original choice in the trace.
  if (route.choice === 'jev' || route.choice === 'clarify') {
    const detail = route.choice === 'clarify' ? {reason: 'Check Qwen’s proposed clarification before asking the customer.'} : {};
    route = await step('Jev', () => jev(text), detail);
  }
  if (route.choice === 'llm') {
    const result = await step('Qwen · explanation', () => explain({state}, token => onEvent({type: 'token', model: 'Qwen · explanation', text: token})));
    return done(result.text);
  }
  if (!(route.choice in ANSWERS)) throw new Error('The support decision returned an unknown route.');
  return done(ANSWERS[route.choice]);
}

export function createSupportEngine({judge, registry, jevUrl = '/decide', fetcher = (...args) => fetch(...args), workerFactory} = {}) {
  const listeners = new Set();
  const models = {head: {name: 'Support classifier', state: 'waiting', detail: {message: 'Waiting for bge-small…'}}, qwen: {name: SUPPORT_MODEL.name, state: 'waiting', detail: {message: 'Waiting to load…'}}};
  let head = null, loading = null, busy = false, disposed = false, resolveCancelled;
  const cancelledJob = new Promise(resolve => { resolveCancelled = resolve; });
  const controller = new AbortController(), requests = new Set();
  const cancelledError = () => new Error('Model loading was cancelled. Refresh the page to load models again.');
  const checkActive = () => { if (disposed) throw cancelledError(); };
  const active = promise => Promise.race([promise, cancelledJob.then(() => { throw cancelledError(); })]);
  const snapshot = () => ({ready: !disposed && Object.values(models).every(x => x.state === 'ready'), busy, cancelled: disposed, models: Object.fromEntries(Object.entries(models).map(([key, model]) => [key, {...model, detail: {...model.detail}}]))});
  const notify = () => { for (const fn of listeners) { try { fn(snapshot()); } catch { /* One UI subscriber must not break inference. */ } } };
  const state = (key, status, detail = {}) => { if (disposed) return; models[key] = {...models[key], state: status, detail}; notify(); };
  const worker = workerFactory ? workerFactory((status, detail) => state('qwen', status, detail)) : new SupportWorker((status, detail) => state('qwen', status, detail));
  async function loadHead() {
    if (models.head.state === 'ready') return;
    state('head', 'waiting', {message: 'Waiting for bge-small…'});
    try {
      await active(judge.ready());
      checkActive();
      state('head', 'loading', {message: 'Starting classifier…'});
      if (judge.rung?.id !== 'bge-small') throw new Error('The support classifier needs bge-small.');
      const response = await active(fetcher(new URL('../data/support-question-head.json?v=8ee67d2c3612bfccb49e', import.meta.url), {signal: controller.signal}));
      if (!response.ok) throw new Error('The support classifier could not download. Please retry.');
      head = await active(response.json());
      checkActive();
      // Warm and verify the actual browser embedding/head pair before ready.
      classifyQuestion(await active(judge.embed('Has my order shipped?')), head);
      state('head', 'ready', {device: 'browser'});
    } catch (error) { state('head', 'error', {message: error.message}); throw error; }
  }
  async function loadQwen() {
    if (models.qwen.state === 'ready') return;
    state('qwen', 'loading', {message: 'Loading browser model…'});
    try { state('qwen', 'ready', await active(worker.run('load'))); }
    catch (error) { state('qwen', 'error', {message: error.message}); throw error; }
  }
  function preload() {
    if (disposed) return Promise.reject(cancelledError());
    if (snapshot().ready) return Promise.resolve(snapshot());
    if (loading) return loading;
    loading = Promise.allSettled([loadHead(), loadQwen()]).then(results => {
      const failure = results.find(x => x.status === 'rejected');
      if (failure) throw failure.reason;
      return snapshot();
    }).finally(() => { loading = null; });
    return loading;
  }
  async function jev(question) {
    checkActive();
    return scriptedJevDecision(question);
  }

  return {
    preload, snapshot,
    dispose() {
      if (disposed) return;
      disposed = true; busy = false; head = null;
      controller.abort();
      for (const request of requests) request.abort();
      requests.clear();
      worker.dispose?.(); resolveCancelled();
      for (const key of Object.keys(models)) models[key] = {...models[key], state: 'cancelled', detail: {message: 'Refresh the page to load models again.'}};
      notify();
    },
    subscribe(fn) { listeners.add(fn); fn(snapshot()); return () => listeners.delete(fn); },
    async ask(value, {onEvent} = {}) {
      checkActive();
      const text = String(value || '').trim();
      if (!text || text.length > 1000) throw new Error('Enter a question of at most 1,000 characters.');
      if (busy) throw new Error('A question is already being answered.');
      if (!snapshot().ready) throw new Error('The support models are still loading or unavailable.');
      busy = true;
      try {
        return await active(runSupportQuestion(text, {
          questionType: async question => { checkActive(); return classifyQuestion(await active(judge.embed(question)), head); },
          choose: args => { checkActive(); return active(worker.run('choose', args)); },
          explain: (args, onToken) => { checkActive(); return active(worker.run('explain', args, {onToken: text => { if (!disposed) onToken(text); }})); },
          jev,
        }, event => { if (!disposed) onEvent?.(event); }));
      } finally { busy = false; }
    },
  };
}

// Demonstrates the hosted handoff without making a paid request.
// These rules are not Jev inference and are not benchmark measurements.
export function scriptedJevDecision(question) {
  const text = String(question).toLowerCase();
  let choice = 'clarify';
  if (/\b(explain|compare|difference|why|wording)\b/.test(text) || /store credit/.test(text)) choice = 'llm';
  else if (/\b(refund|money back|reimburse)\b/.test(text)) choice = 'refund';
  else if (/\b(return|returns|send back)\b/.test(text)) choice = 'returns';
  else if (/\b(track|tracking|shipment|shipped|delivery|delivered|where.*order)\b/.test(text)) choice = 'tracking';
  return {choice, simulated: true};
}
