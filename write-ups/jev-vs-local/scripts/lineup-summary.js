import {loadOfficialResults} from './official-data.js?v=e59fd3176d3189aa58c0';
const root=globalThis.document?.querySelector('[data-lineup-summary]');
const methods=[['jev','Jev'],['head','Embeddings + head'],['layers','LLM lower layers'],['llm','Bare LLM'],['nli','NLI'],['decider','Decider'],['laya','Laya']];
const blurbs={jev:'Hosted general decision model',head:'Small classifier on embeddings · trained',layers:'Classifier on a small LLM’s middle layer · trained',llm:'Qwen3-0.6B picking an answer letter',nli:'Entailment model scoring each answer',decider:'Local 2B general decision model',laya:'Local decision router'};
const marks={jev:['jev.png','TypeSafe logo for Jev'],head:['head.svg','Embeddings + head method icon'],layers:['qwen.png','Qwen3, the underlying model'],llm:['qwen.png','Qwen3, the underlying model'],nli:['nli.svg','NLI method icon'],decider:['decider.svg','Decider method icon; not an official logo'],laya:['laya.png','Official Laya logo']};
const badges={head:'EH',nli:'NLI',decider:'De'};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const time=ms=>ms<1000?`${Math.round(ms)} ms`:`${(ms/1000).toFixed(2)} s`;
// Example groups per method. A group with tasks shows only when every listed task matched Jev's score.
const strengthsByMethod={
 jev:[['Changing questions and answer choices'],['Multi-label reviews and evidence checks'],['No task-specific training examples']],
 head:[['Command and intent recognition',['voice','intent','newcommands']],['Support routing and escalation',['triage','escalation']],['Ratings, priorities, and next steps',['sentiment','priority','nextstep']],['Duplicate detection and ranking',['duplicates','ranking']]],
 layers:[['Language and yes/no detection',['language','question']],['Commands and support routing',['voice','triage','newrouting']],['Ratings, priorities, and next steps',['sentiment','priority','nextstep']],['Evidence checks and duplicate detection',['verification','duplicates']]],
 llm:[['Choosing from unseen commands',['newcommands']],['Selecting newly requested fields',['newextract']],['Situational choices',['riddles']]],
 nli:[['Routing to newly defined categories',['newrouting']],['Choosing from unseen commands',['newcommands']],['Situational choices',['riddles']]],
 decider:[['Intent and support routing',['intent','triage','newrouting']],['Sentiment and priority decisions',['sentiment','sentiment_binary','priority']],['Evidence checks and field selection',['verification','extract','newextract']],['Changing policies and action checks',['policy','destructive']]],
 laya:[['Evidence checks and candidate selection',['verification','candidate']],['Ranking and support routing',['ranking','triage']],['Unseen commands and requested fields',['newcommands','newextract']]],
};
const icons={laptop:'<path d="M4 3h16v12H4V3zm2 2v8h12V5H6zM1 17h22v3H1v-3z"/>','bs-gpu':'<path d="M2 2h20v15h-8v3h4v2H6v-2h4v-3H2V2zm2 2v11h16V4H4z"/>',hosted:'<path d="M19.35 10.04A7.49 7.49 0 0 0 5.1 8.02 6 6 0 0 0 6 20h13a5 5 0 0 0 .35-9.96z"/>'};
const matched=(accuracy,id,key)=>{const m=accuracy.tasks[id].methods;return m[key].correct/m[key].n>=m.jev.correct/m.jev.n;};
export function stats(values){
 values=values.filter(v=>Number.isFinite(v)&&v>0);
 return values.length?{ready:true,n:values.length,min:Math.min(...values),max:Math.max(...values),mean:values.reduce((a,b)=>a+b,0)/values.length}:{ready:false,n:0};
}
// A range represents all tasks; never average an incomplete GPU condition.
export function officialLanes(data,key){
 const ids=Object.keys(data.tasks),hosts=key==='jev'?[['hosted','Hosted Jev']]:[['laptop','Laptop'],['bs-gpu','GPU workstation']];
 return hosts.map(([host,label])=>{
  const values=ids.map(id=>data.timing.tasks?.[id]?.[key]?.[host]?.median_ms),summary=stats(values);
  return {host,label:`${label} · ${ids.length} tests`,...summary,ready:summary.n===ids.length,status:host==='bs-gpu'?'GPU range not measured':'Not measured'};
 });
}
function track(v,position){
 const text=v.ready?`${v.label}: fastest task ${time(v.min)}, mean ${time(v.mean)}, slowest task ${time(v.max)}`:`${v.label}: ${v.status||'not measured'}`;
 return `<div class="timing-range timing-${v.host}" role="img" title="${esc(text)}" aria-label="${esc(text)}">${v.ready?`<span class="timing-range-segment" style="left:${position(v.min)}%;width:${position(v.max)-position(v.min)}%"></span><span class="timing-range-mean" style="left:${position(v.mean)}%"></span><span class="timing-mean-label" style="left:${position(v.mean)}%">${time(v.mean)}</span>`:`<span class="range-unmeasured">${esc(v.status||'Not measured')}</span>`}</div>`;
}
async function render(){
 try{
  const accuracy=await loadOfficialResults(),timing=accuracy.timing;
  const tasks=Object.values(accuracy.tasks),total=tasks.length;
  const lanes=key=>officialLanes(accuracy,key);
  const all=methods.flatMap(([key])=>lanes(key)).filter(v=>v.ready).flatMap(v=>[v.min,v.max]);
  const decades=Math.max(3,Math.ceil(Math.log10(Math.max(1,...all))));
  const position=ms=>Math.max(0,Math.min(100,Math.log10(Math.max(1,ms))/decades*100));
  const ticks=cls=>`<div class="timing-range-axis ${cls}" aria-hidden="true">${Array.from({length:decades+1},(_,i)=>`<span>${time(10**i)}</span>`).join('')}</div>`;
  const band=r=>r.ready?`--jev-min:${position(r.min)}%;--jev-max:${position(r.max)}%`:'--jev-min:0%;--jev-max:0%';
  const rows=methods.map(([key,name])=>{
   const groups=strengthsByMethod[key].filter(([,ids])=>!ids||ids.every(id=>matched(accuracy,id,key)));
   const strengths=`<ul class="lineup-strengths">${groups.map(([label])=>`<li><span class="strength-check" aria-hidden="true">✓</span><span>${esc(label)}</span></li>`).join('')}</ul>`;
   const identity=badges[key]?`<span class="method-letter-badge badge-${key}" aria-hidden="true">${badges[key]}</span>`:`<img class="method-logo ${key==='layers'||key==='llm'?'method-wordmark':''}" src="assets/methods/${marks[key][0]}?v=e59fd3176d3189aa58c0" alt="" title="${marks[key][1]}" width="40" height="40">`;
   return `<tr class="${key==='head'?'my-solution-row':key==='jev'?'jev-row':''}" data-model="${key}"><th scope="row">${key==='head'?'<span class="my-solution-callout">My solution</span>':''}<div class="method-identity">${identity}<span>${name}</span><small class="method-blurb">${blurbs[key]}</small></div></th><td data-label="Best at">${strengths}</td><td data-label="Response time per decision"><div class="timing-stack">${lanes(key).map(v=>track(v,position)).join('')}</div>${ticks('timing-axis-row')}</td></tr>`;
  }).join('');
  const legend=[['laptop','Laptop CPU'],['bs-gpu','GPU workstation'],['hosted','Hosted Jev']].map(([host,label])=>`<span class="timing-${host}"><span class="legend-swatch" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false">${icons[host]}</svg></span> ${label}</span>`).join('');
  root.innerHTML=`<p class="lineup-caption">Where each method kept up with Jev, and how long it took.</p><div class="range-legend" aria-label="Timing legend">${legend}</div><p class="lineup-scale-note">Across all ${total} tests: bars span task medians, dots mark their mean, and blue shows Jev’s range. Faster is left, on a log scale.</p><table class="lineup-chart" style="${band(stats(tasks.map(t=>timing.tasks?.[t.id]?.jev?.hosted?.median_ms)))}"><thead><tr><th scope="col">Method</th><th scope="col">Best at</th><th scope="col">Response time per decision${ticks('timing-axis-head')}</th></tr></thead><tbody>${rows}</tbody></table>`;
 }catch(e){console.error('lineup:',e);root.textContent='The lineup could not load. Please reload to try again.';}
}
if(root)render();
