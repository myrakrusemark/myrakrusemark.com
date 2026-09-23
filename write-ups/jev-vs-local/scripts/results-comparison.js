import {loadOfficialResults} from './official-data.js?v=e59fd3176d3189aa58c0';
const names={jev:'Jev',head:'Embeddings + head',layers:'LLM lower layers',llm:'Bare LLM',nli:'NLI',decider:'Decider',laya:'Laya'};
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pct=v=>`${(100*v).toFixed(1).replace(/\.0$/,'')}%`;
const formatTime=v=>v<1000?`${Math.round(v)} ms`:`${(v/1000).toFixed(2)} s`;
const reasons={language:'This checks three languages and mixed-language passages.',question:'Quoted and indirect questions do not count, but polite yes/no requests do.',multilabel:'A review counts as correct only when every aspect label is right.',sentiment:'A rating is correct when the selected 1–5 category matches the rubric; this is not free-form numeric scoring.',priority:'The rule separates widespread outages from smaller problems.',duplicates:'Shared wording is not enough: the reports must identify the same failure.',verification:'The answer must follow the supplied passage, including when evidence is missing.',candidate:'Every requirement must be met; sometimes no option qualifies.',ranking:'All three results must be in the right order. Tied scores do not count as a correct order.',nextstep:'The next action depends on the procedure and its prerequisites.',escalation:'The rule separates clear requests, ambiguous requests, and unsupported requests.',newrouting:'The team descriptions change, so memorizing old category names is not enough.',policy:'Changing the policy can change the answer to the same request.',newcommands:'A recognized command may be unavailable, in which case the answer must be “none.” Every method got this one right, so it tells us little.',newextract:'The question changes, and the requested value may be absent.',voice:'Quoted commands must be separated from instructions addressed to the computer.',triage:'Fixed support categories are something a trained local classifier can learn.',extract:'The model must choose the requested date rather than another date in the document.',destructive:'The rule distinguishes deleting or sending data from previewing it or canceling deletion.',riddles:'A small change in the stated requirement can reverse the correct practical action.',intent:'Six intents from the public BANKING77 dataset.',sentiment_binary:'Positive or negative, from public Yelp reviews.'};
// Labeled training data the two trained methods saw (counted from the datasets).
const training={intent:'192 labeled messages',sentiment_binary:'128 labeled reviews',language:'16 labeled examples',question:'12 labeled examples',multilabel:'16 labeled reviews',sentiment:'20 labeled examples',priority:'12 labeled examples',duplicates:'8 labeled examples',verification:'12 labeled examples',candidate:'8 labeled examples',ranking:'4 labeled queries',nextstep:'12 labeled examples',escalation:'12 labeled examples',newrouting:'8 labeled examples',policy:'16 labeled examples',newcommands:'8 labeled examples',newextract:'8 labeled examples',voice:'12 labeled examples',triage:'12 labeled examples',extract:'8 labeled examples',destructive:'16 labeled examples',riddles:'8 labeled examples'};
const groupOrder=[['public','Public data'],['stable','Stable labels'],['changing','Changing choices']];
export const groupOf=t=>t.cohort==='Public-data pilot'?'public':t.methods.head?.variant==='head'?'changing':'stable';
export const matchesJev=(t,key)=>{const s=t.methods[key],j=t.methods.jev;return !!s&&!!j&&s.correct/s.n>=j.correct/j.n;};
export function coverage(data){
 const tasks=Object.values(data.tasks),local=Object.keys(names).filter(k=>k!=='jev');
 const byMethod=Object.fromEntries(local.map(k=>[k,tasks.filter(t=>matchesJev(t,k)).length]));
 const covered=tasks.filter(t=>local.some(k=>matchesJev(t,k)));
 const deciderGaps=tasks.filter(t=>!matchesJev(t,'decider'));
 return {total:tasks.length,byMethod,covered:covered.length,uncovered:tasks.filter(t=>!covered.includes(t)).map(t=>t.id),deciderGaps:deciderGaps.length,gapsFilled:deciderGaps.filter(t=>covered.includes(t)).length};
}
const joinNames=values=>values.length===1?values[0]:values.slice(0,-1).join(', ')+' and '+values.at(-1);
export function resultTake(t){
 const j=t.methods.jev,local=Object.keys(names).filter(k=>k!=='jev');
 const better=local.filter(k=>t.methods[k].accuracy>j.accuracy),equal=local.filter(k=>t.methods[k].accuracy===j.accuracy);
 if(equal.length===local.length)return `All seven methods scored ${pct(j.accuracy)}.`;
 return [better.length?`${joinNames(better.map(k=>names[k]))} scored higher than Jev’s ${pct(j.accuracy)}.`:'',equal.length?`${joinNames(equal.map(k=>names[k]))} matched Jev’s ${pct(j.accuracy)}.`:'',!better.length&&!equal.length?`No local method matched Jev’s ${pct(j.accuracy)} here.`:''].filter(Boolean).join(' ');
}
export async function mountComparison(root) {
let timings={tasks:{}};
function updateTimes(){
 for(const el of root.querySelectorAll('[data-timing-method]')){
  const t=timings.tasks?.[el.dataset.timingTask]?.[el.dataset.timingMethod];
  const hosts=el.dataset.timingMethod==='jev'?[['hosted','Hosted']]:[['laptop','Laptop'],['bs-gpu','GPU workstation']];
  const jev=timings.tasks?.[el.dataset.timingTask]?.jev?.hosted?.median_ms;
  el.innerHTML=hosts.map(([key,label])=>{
   const ms=t?.[key]?.median_ms;
   const faster=key!=='hosted'&&Number.isFinite(ms)&&Number.isFinite(jev)&&ms<jev;
   return `${label}: ${Number.isFinite(ms)?formatTime(ms):'Not measured'}${faster?' <span role="img" aria-label="Faster than hosted Jev" title="Faster than hosted Jev on this test">⚡</span>':''}`;
  }).join(' · ');
 }
}
const detail=root.querySelector('[data-result-detail]'),controls=root.querySelector('[data-result-cases]');
try{
 const data=await loadOfficialResults();
 timings=data.timing;
 const tasks=Object.values(data.tasks),c=coverage(data);
 const note=root.querySelector('.preview-note');note.hidden=true;note.textContent=`A local method equaled or beat Jev on ${c.covered} of ${c.total} tests. Decider alone matched ${c.byMethod.decider}; other local methods equaled or beat Jev on ${c.gapsFilled} of the ${c.deciderGaps} tests where Decider fell short.`;
 const header=`<div class="cov-head" aria-hidden="true"><span>Test</span><span class="cov-marks">${Object.keys(names).map(k=>`<span class="cov-column-label" title="${k==='nli'?'Natural language inference':names[k]}">${names[k]}</span>`).join('')}</span></div>`;
 controls.innerHTML=header+groupOrder.map(([g,label])=>{
  const rows=tasks.filter(t=>groupOf(t)===g);
  if(!rows.length)return '';
  return `<p class="cov-group">${label}</p>`+rows.map(t=>{
   const who=Object.keys(names).filter(k=>k!=='jev'&&matchesJev(t,k)).map(k=>names[k]);
   const marks=Object.keys(names).map(k=>`<i class="cov-mark ${k==='jev'?'is-jev':matchesJev(t,k)?'is-match':''}"></i>`).join('');
   const sr=who.length?`Equal to or better than Jev: ${who.join(', ')}.`:'No local method equaled Jev.';
   return `<div class="cov-row${who.length?'':' cov-none'}"><button type="button" data-case="${esc(t.id)}" data-voice-exact${['voice','language','question','ranking'].includes(t.id)?' data-try-command':''}>${esc(t.name)}</button><span class="cov-marks" role="img" aria-label="${esc(sr)}" title="${esc(sr)}">${marks}</span></div>`;
  }).join('');
 }).join('');
 controls.querySelectorAll('[data-case]').forEach(b=>b.addEventListener('click',()=>render(data.tasks[b.dataset.case])));
 function cohortNote(t){
  if(!t.cleanCohort)return '';
  return `<p class="cohort-note">These scores use nine test reviews, excluding three reviews that repeat training examples.</p>`;
 }
 function render(t){
  controls.querySelectorAll('[data-case]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.case===t.id)));
  const lead=resultTake(t);
  const unit=t.kind==='multilabel'?'test reviews':t.kind==='ranking'?'test rankings':t.kind==='score'?'test ratings':'test answers';
  const bars=Object.entries(names).map(([k,n])=>{const s=t.methods[k];const hit=k!=='jev'&&matchesJev(t,k);return `<div class="accuracy-bar${k==='jev'?' is-jev':''}${hit?' is-match':''}"><div class="method-name">${n}${s?`<small>${s.correct} / ${s.n} correct${hit?(s.accuracy>t.methods.jev.accuracy?' · beats Jev':' · matches Jev'):''}</small>`:''}</div>${s?`<progress aria-label="${n}: ${s.correct} of ${s.n} correct" max="100" value="${s.accuracy*100}"></progress><strong>${pct(s.accuracy)}</strong>`:'<span class="waiting-track"></span><span class="pending">Not measured</span>'}<small class="method-timing" data-timing-method="${k}" data-timing-task="${esc(t.id)}"></small></div>`}).join('');
  let examplePrompt=t.example.prompt,exampleAnswer=t.example.answer;
  // Present the saved ranking passages in a shuffled order; the answer follows the same permutation.
  if(t.id==='ranking'){
   const parts=examplePrompt.split('Rank these results:\n');
   const items=parts[1]?.split(/\n(?=\d+\. )/).map(item=>item.replace(/^\d+\. /,''));
   const order=[2,0,1];
   if(items?.length===3){
    examplePrompt=parts[0]+'Rank these results from most to least useful:\n'+order.map((i,n)=>`${n+1}. ${items[i]}`).join('\n');
    exampleAnswer=exampleAnswer.split(' → ').map(v=>order.indexOf(Number(v)-1)+1).join(' → ');
   }
  }
  const [promptBody,optionText]=examplePrompt.split(/\n\nOptions:\s*/);
  const expectedOption=({intent:'card arrival',sentiment_binary:'Negative sentiment'})[t.id]||exampleAnswer;
  const optionPills=optionText?`<div class="prompt-options" role="list" aria-label="Answer options">${optionText.split(' | ').map(option=>{const correct=option===expectedOption;return `<span class="prompt-option${correct?' prompt-option-correct':''}" role="listitem">${correct?'<span aria-hidden="true">✓</span> <span class="option-sr-only">Correct answer: </span>':''}${esc(option)}</span>`;}).join('')}</div>`:`<div class="prompt-options" aria-label="Expected answer"><span class="prompt-option prompt-option-correct"><span aria-hidden="true">✓</span> <span class="option-sr-only">Correct answer: </span>${esc(exampleAnswer)}</span></div>`;
  const trainedWith=training[t.id]?`Embeddings + head and LLM lower layers trained on ${training[t.id]}; the other five methods saw none.`:'';
  const variant=groupOf(t)==='changing'?'The head here is the candidate adapter, which scores each answer choice.':'The head here embeds only the input text and uses a classifier trained for these labels. Its GPU timing has not been measured.';
  const rankingNote=t.id==='ranking'?' The models scored each result on its own; the list above just shows them together.':'';
  detail.innerHTML=`<span class="pill">${esc(t.cohort==='Public-data pilot'?'Public data':'Small authored test')}</span>${t.cleanCohort?' <span class="pill pill-clean">Repeated reviews removed</span>':''}<h2>${esc(t.name)}</h2><div class="prompt-example"><p class="example-title">EXAMPLE PROMPT</p><p class="prompt-text">${esc(promptBody)}</p>${optionPills}</div><div class="chart-label"><span>ACCURACY</span><span>${t.methods.jev?.n??''} ${unit}</span></div><div class="accuracy-bars">${bars}</div><p class="short-take">${lead} ${esc(reasons[t.id]||'')}${rankingNote}</p>${cohortNote(t)}<details class="evidence"><summary data-voice-exact>Test details and limitations</summary><p>${esc(trainedWith)} ${esc(variant)}</p><p>${esc(t.caveat)}</p><p>Times are median response per decision after warm-up, over three passes of every test input. Laptop: Ryzen 7 250, CPU. GPU workstation: RTX 2060 with a Ryzen 5 5600X. Local times exclude any network; hosted Jev’s include it. ⚡ means faster than hosted Jev on this test, not equally accurate. A review includes all three labels in one Jev request; other methods score its aspects separately. Rankings include all three result scores. Runs use the latest completed measurement for each method and input adapter; see the conditions below.</p><p><a href="#methods">How I tested</a></p></details>`;
  updateTimes();
 }
 render(data.tasks.voice||tasks[0]);
}catch(e){console.error('comparison:',e);detail.textContent='Results could not be loaded. Please reload the page.';}
}
