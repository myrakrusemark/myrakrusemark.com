const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const examples=['Can I return order 123?','Where is order 123?','Explain the difference between a refund and store credit.','Has order 999 shipped?'];
const nodeFor=name=>name.startsWith('Embeddings')?'head':name==='Order lookup'?'lookup':name.includes('yes/no')?'binary':name.includes('support route')?'route':name==='Jev'?'jev':'llm';
const titles={head:'Identify the question type',lookup:'Look up the order',binary:'Can we answer yes or no?',route:'Choose how to help',jev:'Ask Jev to choose',llm:'Write an explanation',answer:'Answer the customer'};
const actors={head:'Embeddings + classifier',lookup:'Record lookup · no AI',binary:'Qwen3-0.6B',route:'Qwen3-0.6B',jev:'Jev',llm:'Qwen3-0.6B'};
const captions={head:'Is the customer asking a yes/no question?',lookup:'Check the demo’s saved order record',binary:'Use the order details and shop policy',route:'Use a prepared reply or ask another model',jev:'Choose a reply; double-check proposed clarifications',llm:'Use only the supplied order details and policy',answer:'Your answer will appear here'};
const processing={head:'Identifying the question type…',lookup:'Looking up the order…',binary:'Checking whether the facts support yes or no…',route:'Choosing how to help…',jev:'Jev is choosing the next step…',llm:'Qwen is writing an explanation…'};
function describeChoice(key,choice,text){
 if(key==='head')return {yes:'Yes/no question',no:'Not a yes/no question'}[choice]||choice;
 if(key==='lookup'){
  if(choice==='Unknown order')return 'Order not found — ask for more information';
  return /\border\s*#?\s*123\b/i.test(text)?'Order 123 found':'Demo order and shop policy available';
 }
 if(key==='binary')return {yes:'The facts support “yes”',no:'The facts support “no”',route:'Needs more than a yes/no answer',clarify:'Proposed clarification — Jev will check'}[choice]||choice;
 if(key==='llm')return 'Explanation written';
 if(key==='route'&&choice==='clarify')return 'Proposed clarification — Jev will check';
 return {tracking:'Use the saved delivery status',returns:'Use the return instructions',refund:'Use the refund timing information',clarify:'Ask for more information or explain the demo’s limits',llm:'Ask Qwen to write an explanation',jev:'Ask Jev to choose the next step'}[choice]||choice;
}
const colors={question:'#73825c',head:'#537b67',lookup:'#967632',binary:'#b06c4e',route:'#b06c4e',jev:'#4b79a0',llm:'#846498',answer:'#60813e'};
const links=[['question','head'],['head','lookup'],['lookup','binary'],['lookup','route'],['lookup','answer'],['binary','route'],['binary','answer'],['binary','jev'],['route','jev'],['route','llm'],['route','answer'],['jev','llm'],['jev','answer'],['llm','answer']];
export async function mount(el, {support} = {}){
 if(!support)throw new Error('The browser support engine is unavailable.');
 const node=(key)=>`<div class="flow-node flow-${key}" data-node="${key}"><span class="flow-actor">${actors[key]}</span><strong>${titles[key]}</strong><small data-outcome>${captions[key]}</small><span class="flow-spinner" aria-hidden="true"></span></div>`;
 el.innerHTML=`<div class="support-demo"><header class="support-brand"><img src="assets/customer-service-router.svg?v=e59fd3176d3189aa58c0" alt="" width="48" height="48"><h3>Customer service router</h3></header>
 <form data-support-form><label for="support-question">How may I help you?</label><div class="support-input"><input id="support-question" maxlength="1000" placeholder="Can I return order 123?" required><button class="btn" data-voice-exact type="submit">Ask support</button></div></form>
 <div class="support-examples">${examples.map((t,i)=>`<button class="btn" type="button" data-support-example data-voice-exact${i<2?' data-try-command':''}>${esc(t)}</button>`).join('')}</div>
 <p class="support-status" role="status" data-support-status>Preloading browser models…</p><button class="btn" type="button" data-support-retry hidden>Retry model loading</button>
 <p class="small support-privacy">Fictional orders only. The models run in your browser; a Jev handoff sends your question to the hosted service. Please use the demo examples, without personal details.</p>
 <div class="decision-flow" aria-label="Live decision flow"><svg class="flow-wires" aria-hidden="true"></svg>
 <div class="flow-node flow-question" data-node="question"><strong data-flow-question>Your question enters here</strong></div>
 ${node('head')}${node('lookup')}${node('binary')}${node('route')}${node('jev')}${node('llm')}
 <div class="flow-node flow-answer" data-node="answer"><strong>Answer the customer</strong><small data-outcome>${captions.answer}</small><div class="support-answer" data-support-answer hidden></div></div>
 </div>
 <section class="support-timings" data-support-timings aria-labelledby="support-timings-title" hidden><h4 id="support-timings-title">Decision timings</h4><ol class="support-trace" data-support-trace aria-label="Actual decision path"></ol></section>
 <details><summary data-voice-exact>Shop facts and how this works</summary><p>Order 123 is an unopened desk lamp, delivered 12 days ago. Unopened items qualify for returns within 30 days. Refunds return money to the original payment method; store credit is a balance for a future purchase. After receipt, refunds take 5–7 business days; store credit takes 1 business day. Other orders are unknown.</p><p>The question goes through the local head and an order-record check first. Unknown orders go straight to clarification. Qwen scores answer letters to answer a yes/no question or reroute it. The same Qwen model can choose a canned reply, propose asking for missing information, hand off to Jev, or request an LLM explanation. A proposed clarification goes to Jev for a second opinion before we ask the customer: Jev may confirm it, find a prepared answer, or request an explanation. This is a routing rule; Qwen’s original choice remains visible.</p><p>Faint lines show possible routes. Colored lines show this question’s actual route. Processing indicators follow the actual browser inference and network handoff. The question classifier uses bge-small embeddings. At each decision node, Qwen scores answer letters; it generates words only when the route asks for an explanation. Its answer scores are not calibrated confidence estimates. Models stay loaded; timings exclude startup. Experimental routing, not a validated support service. Models can choose the wrong branch. A Jev handoff sends the question and fictional shop facts to the hosted service. No store actions are performed.</p></details></div>`;
 const q=s=>el.querySelector(s);let busy=false,ready=false,last='question',outcome='idle';const taken=new Set(),signals=new Map();const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 function draw(moving=null){
  const flow=q('.decision-flow'),box=flow.getBoundingClientRect(),svg=q('.flow-wires');svg.setAttribute('viewBox',`0 0 ${box.width} ${box.height}`);
  function rect(key){const r=q(`[data-node="${key}"]`).getBoundingClientRect();return {x:r.left-box.left,y:r.top-box.top,w:r.width,h:r.height};}
  const paths=links.map(([from,to])=>{
   const a=rect(from),b=rect(to);let d;
   if(Math.abs(a.y-b.y)<5){const x=a.x+a.w,y=a.y+a.h/2,tx=b.x,ty=b.y+b.h/2;d=`M${x},${y} C${x+18},${y} ${tx-18},${ty} ${tx},${ty}`;}
   else if(to==='answer'&&from!=='llm'&&from!=='jev'){
    const left=from==='lookup'||from==='binary',x=left?a.x:a.x+a.w,y=a.y+a.h/2,rail=left?5:box.width-5,tx=left?b.x:b.x+b.w,ty=b.y+b.h/2;d=`M${x},${y} H${rail} V${ty} H${tx}`;
   }else{
    const x=a.x+a.w/2,y=a.y+a.h,tx=b.x+b.w/2,ty=b.y;d=`M${x},${y} C${x},${y+(ty-y)/2} ${tx},${y+(ty-y)/2} ${tx},${ty}`;
   }
   const key=from+'>'+to,active=taken.has(key),color=colors[to],age=performance.now()-(signals.get(key)??-10000),animate=age<1100&&!reduced.matches;
   return `<path d="${d}" style="--wire-color:${color}" class="flow-edge ${active?'traversed':''} ${busy&&to===last?'incoming':''}" marker-end="url(#support-arrow)"/>${animate?`<g class="flow-signal" style="color:${color}"><circle r="8" fill="currentColor" opacity=".16"><animateMotion dur="1.1s" begin="-${age/1000}s" path="${d}" fill="freeze"/></circle><circle r="3.5" fill="currentColor"><animateMotion dur="1.1s" begin="-${age/1000}s" path="${d}" fill="freeze"/></circle><animate attributeName="opacity" from="1" to="0" begin="${Math.max(0,900-age)/1000}s" dur=".2s" fill="freeze"/></g>`:''}`;
  });svg.innerHTML='<defs><marker id="support-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10z" fill="context-stroke"/></marker></defs>'+paths.join('');
 }
 function move(key){const edge=last+'>'+key;if(last!==key){taken.add(edge);signals.set(edge,performance.now());}last=key;draw(edge);}
 function event(data){
  if(data.type==='error')throw Error(data.error);
  if(data.type==='start'){
   q('.support-demo').classList.add('is-processing');
   const key=nodeFor(data.model);move(key);q(`[data-node="${key}"]`).classList.add('processing');q(`[data-node="${key}"] [data-outcome]`).textContent=data.reason||processing[key];q('[data-support-status]').textContent=data.reason||processing[key];
  }else if(data.type==='finish'){
   const choice=describeChoice(nodeFor(data.model),data.choice,q('[data-flow-question]').textContent);
   const n=q(`[data-node="${nodeFor(data.model)}"]`);n.classList.remove('processing');n.classList.add('visited');n.querySelector('[data-outcome]').textContent='✓ '+choice;
   q('[data-support-trace]').insertAdjacentHTML('beforeend',`<li><strong>${esc(data.model)}</strong> → ${esc(choice)}${data.reason?` <span>${esc(data.reason)}</span>`:''} <small>${(data.ms/1000).toFixed(1)} s</small></li>`);
  }else if(data.type==='token'){
   q('[data-support-answer]').hidden=false;q('[data-support-answer]').textContent+=data.text;
  }else if(data.type==='done'){
   q('.support-demo').classList.remove('is-processing');
   q('[data-support-answer]').textContent=data.answer;q('[data-support-answer]').hidden=false;q('[data-node="answer"] [data-outcome]').textContent='';q('[data-node="answer"]').classList.add('visited');move('answer');q('[data-support-status]').textContent='Done. Follow the lit path to see how your reply was chosen.';
  }
 }
 new ResizeObserver(()=>draw()).observe(q('.decision-flow'));requestAnimationFrame(()=>draw());
 function updateReady(status){
  ready=status.ready;
  const failed=Object.values(status.models).filter(m=>m.state==='error');
  q('[data-support-retry]').hidden=!failed.length;q('[data-support-retry]').disabled=busy;
  if(!busy){
   if(status.cancelled)q('[data-support-status]').textContent='Models stopped. Refresh the page to load them again.';
   else if(failed.length)q('[data-support-status]').textContent=failed.map(m=>`${m.name}: ${m.detail.message||'could not load'}`).join(' ');
   else if(!ready){const loading=Object.values(status.models).find(m=>m.state!=='ready');q('[data-support-status]').textContent=`${loading?.name||'Browser models'}: ${loading?.detail.message||'loading…'}`;}
   else if(outcome==='idle')q('[data-support-status]').textContent='Models loaded in your browser. Ready for your question.';
  }
  el.querySelectorAll('button:not([data-support-retry])').forEach(b=>b.disabled=busy||!ready);
 }
 support.subscribe(updateReady);
 q('[data-support-retry]').addEventListener('click',()=>{q('[data-support-retry]').hidden=true;support.preload().catch(()=>{});});
 async function ask(text){
  if(busy)return false;
  if(!ready){q('[data-support-status]').textContent=support.snapshot().cancelled?'Models stopped. Refresh the page to load them again.':'The support models are still loading or unavailable.';return false;}
  if(!text.trim())return false;busy=true;outcome='running';q('input').value=text;last='question';taken.clear();signals.clear();
  q('[data-flow-question]').textContent=text;q('[data-node="question"]').classList.add('visited');q('[data-support-answer]').hidden=true;q('[data-support-answer]').textContent='';q('[data-support-timings]').hidden=true;q('[data-support-trace]').innerHTML='';
  for(const [key,caption] of Object.entries(captions)){const n=q(`[data-node="${key}"]`);n.classList.remove('visited','processing','failed');n.querySelector('[data-outcome]').textContent=caption;}
  draw();q('[data-support-status]').textContent='Starting the browser decision…';el.querySelectorAll('button').forEach(b=>b.disabled=true);
  try{
   await support.ask(text,{onEvent:event});
   outcome='complete';q('[data-support-timings]').hidden=false;return true;
  }catch(e){outcome='failed';q('[data-support-timings]').hidden=true;q('[data-support-answer]').hidden=true;q('[data-support-answer]').textContent='';q('[data-support-status]').textContent=e.message;el.querySelectorAll('.processing').forEach(n=>{n.classList.remove('processing');n.classList.add('failed');n.querySelector('[data-outcome]').textContent='Could not finish';});return false;}
  finally{busy=false;q('.support-demo').classList.remove('is-processing');draw();updateReady(support.snapshot());}
 }
 q('form').addEventListener('submit',e=>{e.preventDefault();ask(q('input').value);});el.querySelectorAll('[data-support-example]').forEach(b=>b.addEventListener('click',()=>ask(b.textContent)));
 return {ask,visibilityScoped:true,commandElement:q('.support-demo'),commands:{support_ask:slots=>ask(slots.text)},parseCommand(text){const m=text.match(/^ask support\s+(.+)/i);return m?{action:'support_ask',slots:{text:m[1]}}:null;},examples:[{text:'Ask support Can I return order 123?',action:'support_ask'}]};
}
