// Shared loading status for independent browser models. A support-model error
// must never make the page's embedding or speech model appear unavailable.
export function modelRows({browser, support, localSpeech, speech, cancelled = false}) {
  const rows = [
    {id:'embedding', name:'bge-small', ...browser},
    {id:'support-head', name:'Support classifier', ...(support?.head || {state:'waiting'})},
    {id:'qwen', name:'Qwen3-0.6B', ...(support?.qwen || {state:'waiting'})},
  ];
  if (localSpeech) rows.push(
    {id:'silero', name:'Silero VAD', ...(speech?.silero || {state:'waiting'})},
    {id:'whisper', name:'Whisper-tiny', ...(speech?.whisper || {state:'waiting'})},
  );
  return cancelled ? rows.map(row => ({...row, state: 'cancelled', detail: null})) : rows;
}

// Only reported download bytes produce a percentage. Queued work and model
// initialization have their own tracks, so neither pretends to be measured.
export function modelProgress({state, detail}) {
  if (state === 'ready') return {kind: 'ready', value: 100};
  if (state === 'error' || state === 'cancelled') return {kind: state, value: null};
  if (!state || state === 'waiting' || /^Waiting\b/i.test(detail?.message || '')) return {kind: 'pending', value: null};
  const pct = detail?.pct ?? (detail?.total > 0 ? 100 * detail.loaded / detail.total : null);
  if (detail?.phase === 'warm' || /^(?:Warming|Starting|Initializing)\b/i.test(detail?.message || '') || pct >= 100) return {kind: 'starting', value: null};
  if (Number.isFinite(pct)) return {kind: 'download', value: Math.min(100, Math.max(0, pct))};
  return {kind: 'active', value: null};
}

export function modelStatusText(row) {
  const progress = modelProgress(row);
  if (progress.kind === 'ready') return 'Ready';
  if (progress.kind === 'error') return 'Could not load';
  if (progress.kind === 'cancelled') return 'Stopped';
  if (progress.kind === 'pending') return 'Waiting…';
  if (progress.kind === 'starting') return 'Starting…';
  return progress.kind === 'download' ? `Loading ${Math.round(progress.value)}%` : 'Loading…';
}

export const allModelsReady = rows => rows.length > 0 && rows.every(row => row.state === 'ready');
export const voiceModelsReady = rows => rows.filter(row => ['embedding','silero','whisper'].includes(row.id)).every(row => row.state === 'ready');
