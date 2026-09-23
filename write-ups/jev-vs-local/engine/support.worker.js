import {SUPPORT_MODEL} from './support-config.js?v=8ee67d2c3612bfccb49e';
import {choiceMessages, scoreLetters, EXPLANATION_INSTRUCTIONS} from './support-policy.js?v=8ee67d2c3612bfccb49e';

let library, tokenizer, model, modelInfo;
let chain = Promise.resolve();
const post = (reqId, kind, data) => self.postMessage({reqId, kind, data});
const dispose = result => {
  for (const value of Object.values(result || {})) value?.dispose?.();
};

async function deviceChoice() {
  if (self.navigator?.gpu) {
    let timer;
    const adapter = await Promise.race([
      self.navigator.gpu.requestAdapter().catch(() => null),
      new Promise(resolve => { timer = setTimeout(() => resolve(null), 3000); }),
    ]);
    clearTimeout(timer);
    if (adapter) return {device: 'webgpu', dtype: adapter.features.has('shader-f16') ? 'q4f16' : 'q4'};
  }
  if (typeof WebAssembly !== 'object') throw new Error('This browser cannot run the support model. It needs WebAssembly or WebGPU.');
  return {device: 'wasm', dtype: 'q8'};
}

async function load(reqId) {
  if (model) return modelInfo;
  library ||= await import(SUPPORT_MODEL.engine);
  library.env.allowLocalModels = false;
  library.env.useBrowserCache = true;
  // Works on a normal static origin, including Firefox without COOP/COEP.
  library.env.backends.onnx.wasm.numThreads = 1;
  let selected = await deviceChoice();
  const seen = new Map();
  let lastProgress = 0;
  const progress = e => {
    if (e.file && ['progress', 'done'].includes(e.status)) {
      const old = seen.get(e.file) || {loaded: 0, total: 0};
      seen.set(e.file, {loaded: e.status === 'done' ? (e.total || old.total) : (e.loaded || 0), total: e.total || old.total});
    }
    const now = performance.now();
    if (e.status !== 'done' && now - lastProgress < 100) return;
    lastProgress = now;
    const loaded = [...seen.values()].reduce((n, x) => n + x.loaded, 0);
    const total = Math.max(SUPPORT_MODEL.bytes[selected.dtype], [...seen.values()].reduce((n, x) => n + x.total, 0));
    post(reqId, 'progress', {state: 'loading', detail: {loaded, total, pct: Math.min(100, 100 * loaded / total), ...selected}});
  };
  post(reqId, 'progress', {state: 'loading', detail: selected});
  tokenizer ||= await library.AutoTokenizer.from_pretrained(SUPPORT_MODEL.repo, {revision: SUPPORT_MODEL.revision, progress_callback: progress});
  const initialize = async () => {
    model = await library.AutoModelForCausalLM.from_pretrained(SUPPORT_MODEL.repo, {revision: SUPPORT_MODEL.revision, ...selected, progress_callback: progress});
    post(reqId, 'progress', {state: 'warming', detail: selected});
    const inputs = tokenizer('Hello');
    try { const output = await model.generate({...inputs, max_new_tokens: 1, do_sample: false}); output.dispose?.(); }
    finally { dispose(inputs); }
    modelInfo = {name: SUPPORT_MODEL.name, ...selected, revision: SUPPORT_MODEL.revision};
    return modelInfo;
  };
  try { return await initialize(); }
  catch (error) {
    try { await model?.dispose?.(); } catch { /* A failed device may already be gone. */ }
    model = null;
    if (selected.device !== 'webgpu') throw error;
    selected = {device: 'wasm', dtype: 'q8'};
    seen.clear();
    post(reqId, 'progress', {state: 'loading', detail: {...selected, message: 'WebGPU unavailable; loading the CPU model…'}});
    try { return await initialize(); }
    catch (fallbackError) {
      try { await model?.dispose?.(); } catch { /* Preserve the inference error. */ }
      model = null;
      throw fallbackError;
    }
  }
}

async function choose(args) {
  const keys = Object.keys(args.options);
  if (!keys.length || keys.length > 26) throw new Error('The support decision has invalid options.');
  const tokenIds = keys.map((_, i) => {
    const ids = tokenizer.encode(String.fromCharCode(65 + i), {add_special_tokens: false});
    if (ids.length !== 1) throw new Error('The Qwen answer-letter tokenizer changed.');
    return Number(ids[0]);
  });
  const inputs = tokenizer.apply_chat_template(choiceMessages(args.state, args.instructions, args.options, args.question ?? null), {add_generation_prompt: true, enable_thinking: false, return_dict: true});
  let output;
  try {
    output = await model(inputs);
    const width = output.logits.dims.at(-1);
    const data = output.logits.data;
    const last = data.subarray(data.length - width);
    const result = scoreLetters(last, args.options, tokenIds, output.logits.type === 'float16' && data instanceof Uint16Array);
    if (args.debug) {
      const best = [...last.keys()].sort((a, b) => last[b] - last[a]).slice(0, 12);
      result.debug = {
        promptTail: tokenizer.decode(inputs.input_ids.tolist()[0].slice(-50), {skip_special_tokens: false}),
        promptTokens: inputs.input_ids.dims.at(-1), logitsType: output.logits.type, logitsShape: output.logits.dims,
        letters: tokenIds.map(id => ({id, text: tokenizer.decode([id]), logit: last[id]})),
        topTokens: best.map(id => ({id, text: tokenizer.decode([id]), logit: last[id]})),
      };
    }
    return result;
  } finally { dispose(output); dispose(inputs); }
}

async function explain(args, reqId) {
  const inputs = tokenizer.apply_chat_template([
    {role: 'system', content: EXPLANATION_INSTRUCTIONS},
    {role: 'user', content: args.state},
  ], {add_generation_prompt: true, enable_thinking: false, return_dict: true});
  const start = inputs.input_ids.dims.at(-1);
  const streamer = new library.TextStreamer(tokenizer, {skip_prompt: true, skip_special_tokens: true, callback_function: text => post(reqId, 'token', {text})});
  let output;
  try {
    output = await model.generate({...inputs, max_new_tokens: 160, do_sample: false, repetition_penalty: 1.05, streamer});
    const text = tokenizer.decode(output.tolist()[0].slice(start), {skip_special_tokens: true}).trim();
    if (!text) throw new Error('Qwen did not produce an explanation. Please try again.');
    return {text};
  } finally { output?.dispose?.(); dispose(inputs); }
}

self.onmessage = ({data: {reqId, cmd, args = {}}}) => {
  chain = chain.then(async () => {
    try {
      const info = await load(reqId);
      const result = cmd === 'load' ? info : cmd === 'choose' ? await choose(args) : cmd === 'explain' ? await explain(args, reqId) : null;
      if (!result) throw new Error('Unknown support model command.');
      post(reqId, 'done', result);
    } catch (error) {
      post(reqId, 'error', {message: error?.message || 'The support model could not run in this browser.'});
    }
  });
};
