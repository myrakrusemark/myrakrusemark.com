// A separate nearest-example classifier for the game. Scores are similarities,
// never probabilities. These examples are not part of the article benchmark.
export const EXAMPLES = {
  left: ['reverse', 'go left', 'head west', 'steer to port', 'move the submarine left', 'a little to the left'],
  right: ['forward', 'go right', 'head east', 'steer to starboard', 'move the submarine right', 'a little to the right'],
  down: ['dive', 'go deeper', 'descend one level', 'move the submarine down', 'a little deeper'],
  up: ['rise', 'go up', 'ascend one level', 'move the submarine up', 'toward the surface'],
  collect: ['collect the sample', 'pick it up', 'take a sample', 'collect this specimen', 'grab the sample'],
  hold: ['hold position', 'stop moving', 'stay here', 'do not surface yet', 'do not dive', 'don’t go left', 'don’t go right', 'stop descending', 'do not collect the sample'],
  ignore: ['that fish is heading left', 'there is a fish to the right', 'the ocean is beautiful', 'there’s banana bread for you', 'we went diving yesterday', 'the fish swims deeper', 'I like submarines', 'what a beautiful reef'],
};
export function rankExamples(vector, examples, vectors) {
  const best = new Map();
  examples.forEach((e,i) => {
    const similarity = vector.reduce((n,x,j)=> n+x*vectors[i][j],0);
    if (!best.has(e.action) || similarity > best.get(e.action).similarity) best.set(e.action,{...e,similarity});
  });
  return [...best.values()].sort((a,b)=>b.similarity-a.similarity);
}
export const START = {x:1,y:1};
export const SAMPLES = [{x:3,y:2},{x:6,y:3},{x:7,y:1}];
export const REEFS = [{x:4,y:1},{x:4,y:2},{x:2,y:4},{x:5,y:4}];
function singleStep(state, action) {
  const next = {...state, collected:[...state.collected]};
  if (state.complete) return {...next, message:'Expedition complete. Choose Restart dive to play again.'};
  const directions = {left:[-1,0],right:[1,0],up:[0,-1],down:[0,1]};
  if (directions[action]) {
    const [dx,dy]=directions[action], x=state.x+dx, y=state.y+dy;
    if(x<0||x>8||y<0||y>4) return {...next,message:'At the edge of the survey area. Choose another direction.'};
    if(REEFS.some(r=>r.x===x&&r.y===y)) return {...next,bumps:state.bumps+1,message:'Reef ahead. Choose another route.'};
    next.x=x; next.y=y; next.moves++;
    next.message={left:'Moved west.',right:'Moved east.',up:'Moved up one depth.',down:'Dived one depth.'}[action];
  } else if(action==='collect') {
    const at=SAMPLES.findIndex(r=>r.x===state.x&&r.y===state.y);
    if(at<0) next.message='No crystal here. Navigate to one of the glowing numbered crystals.';
    else if(next.collected.includes(at)) next.message='This crystal is already aboard.';
    else {next.collected.push(at);next.message=`Crystal ${at+1} aboard. ${next.collected.length===3?'All three crystals aboard! Return to the HOME beacon to finish the expedition.':`${3-next.collected.length} still to find.`}`;}
  } else next.message=action==='ignore'?'Ignored as conversation. The submarine stayed put.':'Holding position. The submarine stayed put.';
  if(next.collected.length===3&&next.x===START.x&&next.y===START.y) {next.complete=true;next.message=`All three crystals home. Expedition complete in ${next.moves} moves, with ${next.bumps} reef stops.`;}
  return next;
}

// Exact control labels share one grammar for typed and transcribed commands.
export function parseCommand(text) {
  const phrase = text.trim().toLowerCase().replace(/[.!?]+$/, '').trim();
  if (phrase === 'restart dive') return {action:'submarine_reset',slots:{}};
  if (phrase === 'collect') return {action:'submarine_collect',slots:{}};
  const match = /^(dive|rise|forward|reverse)(?:\s+(.+))?$/.exec(phrase);
  if (!match) return null;
  const words = ['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
  const tens = {twenty:20,thirty:30,forty:40,fifty:50,sixty:60,seventy:70,eighty:80,ninety:90};
  const token = match[2];
  let amount = 1;
  if (token) {
    const parts = token.split(/[ -]/);
    amount = /^\d+$/.test(token) ? Number(token) : words.includes(token) ? words.indexOf(token) : tens[token];
    if (parts.length === 2 && tens[parts[0]] && words.indexOf(parts[1]) > 0 && words.indexOf(parts[1]) < 10) amount = tens[parts[0]] + words.indexOf(parts[1]);
  }
  if (!Number.isSafeInteger(amount) || amount < 1) return {error:'Use a whole number of spaces, such as “Forward 3”.'};
  return {action:'submarine_' + {dive:'down',rise:'up',forward:'right',reverse:'left'}[match[1]],slots:{amount}};
}
export function step(state, action, amount = 1) {
  if (!Number.isSafeInteger(amount) || amount < 1) return {...state,message:'Choose a positive whole number of spaces.'};
  if (!['left','right','up','down'].includes(action)) return singleStep(state, action);
  let next = state;
  for (let i=0; i<amount; i++) {
    const previous = next;
    next = singleStep(next, action);
    if (next.complete || (next.x === previous.x && next.y === previous.y)) break;
  }
  const moved = next.moves - state.moves;
  if (amount > 1) next = {...next,message:`Moved ${moved} ${moved === 1 ? 'space' : 'spaces'}. ${next.complete || moved < amount ? next.message : ''}`.trim()};
  return next;
}
