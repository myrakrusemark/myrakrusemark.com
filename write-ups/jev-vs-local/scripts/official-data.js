// One current result set for every article chart and headline. Research archives
// remain immutable inputs to scripts/build-official-results.py.
let pending;
const METHODS=['jev','head','layers','llm','nli','decider','laya'];
const validScore=s=>s&&Number.isInteger(s.correct)&&Number.isInteger(s.n)&&s.n>0&&s.correct>=0&&s.correct<=s.n&&Number.isFinite(s.accuracy)&&Math.abs(s.accuracy-s.correct/s.n)<1e-12;
export function validateOfficialResults(raw){
 if(!raw||raw.schema_version!==1||raw.complete!==true||!raw.tasks||!raw.timing?.tasks||!raw.provenance?.selection_policy)throw Error('Official results are unavailable or invalid');
 const entries=Object.entries(raw.tasks);
 if(entries.length!==22||Object.keys(raw.timing.tasks).length!==entries.length)throw Error('Official results have an incomplete task set');
 if(raw.provenance.raw_head_task_ids?.length!==16||raw.provenance.candidate_head_task_ids?.length!==6)throw Error('Official method conditions are missing');
 for(const [id,task] of entries){
  if(task.id!==id||!METHODS.every(key=>validScore(task.methods?.[key]))||!raw.timing.tasks[id])throw Error(`Official results are invalid for ${id}`);
  for(const key of METHODS){
   const hosts=key==='jev'?['hosted']:key==='head'&&task.methods.head.variant==='raw_head'?['laptop']:['laptop','bs-gpu'];
   if(!hosts.every(host=>raw.timing.tasks[id][key]?.[host]))throw Error(`Official timing is missing for ${id}/${key}`);
  }
  for(const [method,hosts] of Object.entries(raw.timing.tasks[id])){
   if(!METHODS.includes(method))throw Error(`Unknown timing method: ${method}`);
   for(const value of Object.values(hosts))if(!Number.isFinite(value?.median_ms)||value.median_ms<=0||!Number.isFinite(value.p95_ms)||value.p95_ms<=0)throw Error(`Official timing is invalid for ${id}/${method}`);
  }
  for(const method of ['jev',...(task.methods.head.variant==='raw_head'?['head']:[])]){
   const score=task.methods[method];
   if(score.accuracy_passes?.length!==3||!score.accuracy_passes.every(s=>validScore(s)&&s.correct===score.correct&&s.n===score.n))throw Error(`Official accuracy passes are invalid for ${id}/${method}`);
  }
  if(task.methods.head.variant==='raw_head'&&raw.timing.tasks[id].head?.['bs-gpu'])throw Error(`Superseded GPU timing present for ${id}`);
 }
 return raw;
}
export function loadOfficialResults(){
 pending??=fetch(new URL('../data/official-results.json?v=8ee67d2c3612bfccb49e',import.meta.url),{cache:'no-cache'})
  .then(response=>{if(!response.ok)throw Error('Official results could not be loaded');return response.json();})
  .then(validateOfficialResults);
 return pending;
}
// Exact score ties and strict improvements stay distinct. Timing ties use 1%.
export function summarizeOfficialResults(data){
 const tasks=Object.values(data.tasks),local=METHODS.filter(key=>key!=='jev');
 const byMethod=Object.fromEntries(local.map(key=>[key,{matched:0,beat:0,atLeast:0}]));
 const uncovered=[];
 for(const task of tasks){
  const jev=task.methods.jev;let covered=false;
  for(const method of local){
   const s=task.methods[method],delta=s.correct*jev.n-jev.correct*s.n;
   if(delta>=0){byMethod[method].atLeast++;covered=true;byMethod[method][delta===0?'matched':'beat']++;}
  }
  if(!covered)uncovered.push(task.id);
 }
 const ids=data.provenance.raw_head_task_ids;
 const rawRows=ids.map(id=>{
  const t=data.tasks[id],raw=data.timing.tasks[id].head.laptop.median_ms,jev=data.timing.tasks[id].jev.hosted.median_ms;
  return {id,raw,jev,matched:t.methods.head.correct*t.methods.jev.n>=t.methods.jev.correct*t.methods.head.n,
   speed:Math.abs(raw-jev)<=.01*jev?'tie':raw<jev?'faster':'slower'};
 });
 return {total:tasks.length,covered:tasks.length-uncovered.length,uncovered,byMethod,
  rawHead:{total:rawRows.length,matched:rawRows.filter(r=>r.matched).length,
   faster:rawRows.filter(r=>r.speed==='faster').length,tied:rawRows.filter(r=>r.speed==='tie').length,
   slower:rawRows.filter(r=>r.speed==='slower').length,matchedFaster:rawRows.filter(r=>r.matched&&r.speed==='faster').length,rows:rawRows}};
}
