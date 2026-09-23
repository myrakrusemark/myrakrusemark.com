import { EXAMPLES, rankExamples, START, SAMPLES, REEFS, step, parseCommand } from '../../engine/expedition.js?v=8ee67d2c3612bfccb49e';
const INITIAL=()=>({...START,collected:[],moves:0,bumps:0,complete:false});
const px=x=>65+x*76, py=y=>74+y*66;
export async function mount(el,{judge}) {
  let state=INITIAL(), busy=false, vectors=null, model=null, generation=0, reef=null;
  const examples=Object.entries({...EXAMPLES,reset:['restart the dive','start the expedition again','reset the submarine']}).flatMap(([action,texts])=>texts.map(text=>({action,text})));
  el.innerHTML=`<div class="dive-header"><span class="dive-label">REEF EXPEDITION / 01</span><span data-dive-status>3 crystals to find</span></div>
  <div class="ocean" tabindex="0" role="group" aria-label="Submarine survey. Focus here to steer with arrow keys; space collects a sample.">
    <div class="reef-viewport">
    <svg class="ocean-fallback" viewBox="0 0 740 410" role="img" aria-label="Survey grid: home at column 2, depth 2. Samples at column 4 depth 3, column 7 depth 4, and column 8 depth 2. Reefs at column 5 depths 2 and 3, column 3 depth 5, and column 6 depth 5.">
      <defs><linearGradient id="sea" x2="0" y2="1"><stop stop-color="#163f4a"/><stop offset="1" stop-color="#071e29"/></linearGradient><radialGradient id="glow"><stop stop-color="#ace8c4" stop-opacity=".25"/><stop offset="1" stop-color="#ace8c4" stop-opacity="0"/></radialGradient><pattern id="grid" width="76" height="66" patternUnits="userSpaceOnUse" x="27" y="41"><path d="M76 0H0V66" fill="none" stroke="#96bdc3" stroke-opacity=".09"/></pattern></defs>
      <rect width="740" height="410" fill="url(#sea)"/><path d="M0 16 Q90 38 185 18T370 18T555 18T740 18" fill="none" stroke="#9cdac8" stroke-opacity=".3"/>
      <rect x="27" y="41" width="684" height="330" fill="url(#grid)"/>
      <path d="M0 393 Q70 352 141 381T310 379T480 392T620 378T740 389V410H0Z" fill="#244744"/>
      ${[0,1,2,3,4].map(y=>`<text x="14" y="${py(y)+4}" class="depth-mark">${(y+1)*10}</text>`).join('')}
      <g class="home-buoy" transform="translate(${px(START.x)},${py(START.y)})"><path d="M0 -90V-14" stroke="#afc3b1" stroke-dasharray="3 5" opacity=".5"/><circle r="23" fill="none" stroke="#a8d9cd" stroke-dasharray="3 5"/><text y="-31" text-anchor="middle">HOME</text></g>
      ${REEFS.map(r=>`<g transform="translate(${px(r.x)},${py(r.y)})"><path d="M-25 24L-19 -8 -8 0 0 -23 10 0 21 -7 28 24Z" fill="#35635e" stroke="#59877a"/><path d="M-10 20L-5 -3M9 17L13 3" stroke="#8ea989" opacity=".5"/></g>`).join('')}
      ${SAMPLES.map((r,i)=>`<g class="sample" data-sample="${i}" transform="translate(${px(r.x)},${py(r.y)})"><circle r="35" fill="url(#glow)"/><path d="M0 -13L12 0 0 13 -12 0Z" fill="#aee7be"/><text y="30" text-anchor="middle">${i+1}</text></g>`).join('')}
      <g data-sub class="sub"><path d="M-28 -8L-38 -15V15L-28 8" fill="#c47b48"/><rect x="-9" y="-21" width="15" height="14" rx="4" fill="#f0ba65"/><path d="M-1 -21V-28H9" stroke="#f0ba65" stroke-width="4" fill="none"/><rect x="-30" y="-14" width="61" height="29" rx="15" fill="#f0ba65"/><circle cx="12" r="8" fill="#0e3441" stroke="#ffe0a0" stroke-width="3"/><circle cx="-8" r="5" fill="#0e3441" stroke="#ffe0a0" stroke-width="2"/><path d="M32 -5L57 -17V17L32 6" fill="#ffe7a2" opacity=".08"/></g>
    </svg>
    <div class="reef-score" role="group" aria-label="Expedition score">
      <div><strong data-count>0 / 3</strong><span>crystals</span></div>
      <div><strong data-depth>20 m</strong><span>depth</span></div>
    </div>
    <div class="reef-return" data-return role="status" hidden><strong>All crystals aboard. Return home!</strong><span>Reach the glowing HOME beacon to finish.</span></div>
    <div class="reef-wordmark"><span>MANTA / 01</span><strong>Sunlit sanctuary</strong><small role="status" data-receipt>Collect all three crystals, then return home.</small></div>
    <div class="reef-hud" aria-hidden="true">
      <div class="reef-markers">${['01','02','03','HOME'].map((n,i)=>`<span class="reef-marker marker-${i}" data-reef-marker>${n}</span>`).join('')}</div>
      <div class="reef-sonar"><span>SONAR <i></i></span><svg viewBox="0 0 144 80">
        ${Array.from({length:45},(_,i)=>`<circle cx="${8+(i%9)*16}" cy="${8+Math.floor(i/9)*16}" r="1" fill="#8dd8ca" opacity=".25"/>`).join('')}
        ${REEFS.map(r=>`<rect x="${3+r.x*16}" y="${3+r.y*16}" width="10" height="10" rx="2" fill="#7c9b92"/>`).join('')}
        <circle cx="${8+START.x*16}" cy="${8+START.y*16}" r="6" fill="none" stroke="#acebd5" stroke-width=".7"/>
        ${SAMPLES.map((r,i)=>`<path data-sonar-sample="${i}" d="M0 -4L4 0 0 4 -4 0Z" transform="translate(${8+r.x*16},${8+r.y*16})" fill="${['#8affd9','#d5adff','#ffdf8f'][i]}"/>`).join('')}
        <circle data-sonar-sub r="3.2" fill="#ffcf76" stroke="#fff3c7" stroke-width="1"/>
      </svg></div>
      <div class="reef-compass"><span data-location>20 M · SECTOR 02</span><small>← REVERSE <b>·</b> FORWARD →</small></div>
      <div class="reef-proximity" data-proximity hidden>Crystal in reach · Collect</div>
      <div class="reef-finish" data-finish hidden><span>MISSION COMPLETE</span><strong>A little treasure.<br>A perfect return.</strong><p>All three crystals are safely home.</p></div>
    </div>
    </div>
  </div>
  <div class="dive-bottom"><div class="manual" role="group" aria-label="Submarine controls"><button class="btn" data-manual="down">Dive</button><button class="btn" data-manual="up">Rise</button><button class="btn" data-manual="right">Forward</button><button class="btn" data-manual="left">Reverse</button><button class="btn" data-manual="collect">Collect</button></div><button class="btn" data-reset>Restart dive</button></div>
  <p class="st-caption">Click a control or say its name in the bottom bar. Add a number to move that many spaces: “Forward 3” or “Dive two”. No number means one space.</p>

`;
  const q=s=>el.querySelector(s);
  function render(options){
    q('[data-sub]').style.transform=`translate(${px(state.x)}px,${py(state.y)}px)`;
    q('[data-count]').textContent=`${state.collected.length} / 3`;q('[data-depth]').textContent=`${(state.y+1)*10} m`;
    q('[data-dive-status]').textContent=state.complete?'Expedition complete':state.collected.length===3?'Return to the home beacon':`${3-state.collected.length} ${state.collected.length===2?'crystal':'crystals'} to find`;
    SAMPLES.forEach((_,i)=>{
      q(`[data-sample="${i}"]`).classList.toggle('collected',state.collected.includes(i));
      q(`[data-sonar-sample="${i}"]`).style.opacity=state.collected.includes(i)?'.12':'1';
    });
    q('[data-sonar-sub]').setAttribute('cx',8+state.x*16);q('[data-sonar-sub]').setAttribute('cy',8+state.y*16);
    q('[data-location]').textContent=`${(state.y+1)*10} M · SECTOR ${String(state.x+1).padStart(2,'0')}`;
    const atCrystal=SAMPLES.some((r,i)=>r.x===state.x&&r.y===state.y&&!state.collected.includes(i));
    q('[data-proximity]').hidden=!atCrystal;
    q('[data-manual="collect"]').classList.toggle('in-reach',atCrystal);
    q('[data-finish]').hidden=!state.complete;
    const returning=state.collected.length===3&&!state.complete;
    q('[data-return]').hidden=!returning;
    q('.reef-viewport').classList.toggle('returning-home',returning);
    reef?.update(state,options);
    q('.ocean').setAttribute('aria-label',`Submarine at column ${state.x+1}, depth ${(state.y+1)*10} meters. ${state.collected.length} of 3 crystals aboard. Arrow keys steer; space collects.`);
    el.classList.toggle('dive-complete',state.complete);
  }
  function act(action, amount=1){
    state=step(state,action,amount);render();
    q('[data-receipt]').textContent=state.message;

  }
  const id = action => action === 'ignore' ? 'none' : `submarine_${action}`;
  const pageExamples = ['scroll down', 'scroll up', 'back to the top', 'go to the results', 'go to the conclusion', 'go to the map', 'show examples', 'show commands', 'change the model', 'stop listening', 'open settings', 'click the first button'];
  const candidates = [...examples, ...pageExamples.map(text => ({action:'page',text}))];
  let preparing = null;
  async function interpret(text, base) {
    // Navigation and named-control operations still belong to the page router.
    if (/^(?:scroll|go to|back to|show (?:examples|commands)|(?:start|stop) listening|(?:change|switch|use|load) (?:the )?model|(?:click|press|tap|open|expand|collapse) )/i.test(text)) return null;
    if (busy) throw new Error('The submarine is still reading the previous command');
    busy = true;
    const token = generation;
    try {
      if(model!==judge.rung.id||!vectors){
        if (!preparing) preparing = judge.embedFresh(candidates.map(e=>e.text)).then(v => {vectors=v;model=judge.rung.id;}).finally(()=>{preparing=null;});
        await preparing;
      }
      const t=performance.now(), [v]=await judge.embedFresh([text]);
      const ranked=rankExamples(v,candidates,vectors), ms=performance.now()-t;
      if(token!==generation) return null;
      const first=ranked[0],gap=first.similarity-ranked[1].similarity;
      if(first.action==='page') return null;
      if(first.similarity<.55 && base.band==='act' && base.kind==='page') return null;
      const options=ranked.filter(r=>r.action!=='page');
      return {text, station:'submarine', scoreKind:'similarity', addressed:null, kind:'submarine', ms:Math.max(1,Math.round(ms)),
        action:{choice:id(first.action), confidence:gap, probs:Object.fromEntries(options.map(r=>[id(r.action),r.similarity]))},
        band:first.action==='ignore'?'ignore':first.similarity<.55||gap<.025?'ask':'act',
        slots:{decisionMs:Math.max(1,Math.round(ms))},
        match:`Closest example: “${first.text}” (${first.similarity.toFixed(3)} similarity). Lead over next action: ${gap.toFixed(3)}. These are similarities, not probabilities.`};
    } finally {busy=false;}
  }
  function reset(){generation++;state=INITIAL();q('[data-receipt]').textContent='Collect all three crystals, then return home.';render({reset:true});}
  const commands = Object.fromEntries(Object.keys(EXAMPLES).filter(a=>a!=='ignore').map(a=>[id(a),slots=>{
    act(a, slots?.amount ?? 1);
  }]));
  commands.submarine_reset = reset;
  el.addEventListener('click',e=>{const b=e.target.closest('[data-manual]');if(b){act(b.dataset.manual);}});
  q('.ocean').addEventListener('keydown',e=>{const a={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down',' ':'collect'}[e.key];if(a){e.preventDefault();act(a);}});
  q('[data-reset]').addEventListener('click',reset);
  judge.onStatus(s=>{if(s.status!=='ready'){vectors=null;model=null;}});
  render();
  // Load the local renderer without delaying controls or the page command router.
  import('../reef-scene.js?v=8ee67d2c3612bfccb49e').then(({createReefScene})=>{
    reef=createReefScene(q('.reef-viewport'),state);
    addEventListener('pagehide', e=>{if(!e.persisted)reef?.dispose();});
  }).catch(err=>console.warn('The reef is using its 2D view.',err));
  return {commands, interpret, parseCommand, visibilityScoped:true, commandElement:q('.ocean'),
    examples:[{text:'Dive',action:'submarine_down',try:true},{text:'Rise',action:'submarine_up'},{text:'Reverse',action:'submarine_left'},{text:'Forward',action:'submarine_right'},{text:'Forward 3',action:'submarine_right',slots:{amount:3},try:true},{text:'Collect',action:'submarine_collect',try:true},{text:'hold position',action:'submarine_hold'},{text:'do not surface yet',action:'submarine_hold'},{text:'that fish is heading left'},{text:'Restart dive',action:'submarine_reset'}],
    onDecision(d){
      if(d.station!=='submarine')return;
      if(d.band==='ask')q('[data-receipt]').textContent='Holding position. Choose what you meant in the bottom bar.';
      if(d.band==='ignore')q('[data-receipt]').textContent='Ignored as conversation. The submarine stayed put.';
    },
  };
}
