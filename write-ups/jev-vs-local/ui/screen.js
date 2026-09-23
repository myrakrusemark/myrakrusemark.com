// The office screen: a small monitor drawn inside the house diagram that shows
// what a kitchen command would have done — volume, mute, brightness, workspace,
// windows, media, screenshot, lock. Pure state + SVG; no model. A command with a
// number sets the level; without one it nudges (up/down) or toggles (mute, play).
const NS = "http://www.w3.org/2000/svg";
const STEP = 10;
const APPS = { launch_terminal: "kitty", launch_browser: "firefox" };
const W = 132, H = 84;   // the panel inside the bezel

export function createScreen(g) {
  const s = { ws: 1, windows: [], time: "9:41", volume: 50, muted: false, brightness: 80, playing: false, track: 1, locked: false, shots: 0 };
  const el = (tag, attrs = {}, text = null) => {
    const n = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    if (text != null) n.textContent = text;
    return n;
  };
  // bezel, panel, stand
  g.append(el("rect", { class: "sc-bezel", x: -6, y: -6, width: W + 12, height: H + 12, rx: 6 }));
  const panel = el("rect", { class: "sc-panel", x: 0, y: 0, width: W, height: H, rx: 2 }); g.append(panel);
  g.append(el("path", { class: "sc-stand", d: `M${W / 2 - 14} ${H + 6} h28 M${W / 2} ${H + 6} v10 M${W / 2 - 22} ${H + 17} h44` }));
  // top bar: workspace badge and a clock that never moves
  g.append(el("rect", { class: "sc-bar", x: 0, y: 0, width: W, height: 11 }));
  const wsT = el("text", { class: "sc-ws", x: 5, y: 8.2 }, "ws 1"); g.append(wsT);
  const clock = el("text", { class: "sc-clock", x: W - 5, y: 8.2, "text-anchor": "end" }, "9:41"); g.append(clock);
  // windows (front = last)
  const winG = el("g", { class: "sc-windows" }); g.append(winG);
  // media + volume strip
  const media = el("text", { class: "sc-media", x: 5, y: H - 13 }, "▶ track 1"); g.append(media);
  g.append(el("rect", { class: "sc-vol-track", x: 5, y: H - 8, width: 78, height: 4, rx: 2 }));
  const volFill = el("rect", { class: "sc-vol-fill", x: 5, y: H - 8, width: 39, height: 4, rx: 2 }); g.append(volFill);
  const volT = el("text", { class: "sc-vol", x: W - 5, y: H - 4, "text-anchor": "end" }, "vol 50%"); g.append(volT);
  // overlays: dimming, lock, flash
  const dim = el("rect", { class: "sc-dim", x: 0, y: 0, width: W, height: H, rx: 2, opacity: 0 }); g.append(dim);
  const lock = el("g", { class: "sc-lock", opacity: 0 });
  lock.append(el("rect", { x: 0, y: 0, width: W, height: H, rx: 2 }));
  lock.append(el("path", { d: `M${W / 2 - 7} ${H / 2 - 2} v-6 a7 7 0 0 1 14 0 v6`, fill: "none" }));
  lock.append(el("rect", { x: W / 2 - 11, y: H / 2 - 2, width: 22, height: 16, rx: 2 }));
  lock.append(el("text", { x: W / 2, y: H / 2 + 26, "text-anchor": "middle" }, "locked")); g.append(lock);
  const flash = el("rect", { class: "sc-flash", x: 0, y: 0, width: W, height: H, rx: 2, opacity: 0 }); g.append(flash);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const tween = (n, from, to, ms = 260) => { if (!reduced && n.animate) n.animate([from, to], { duration: ms, fill: "forwards", easing: "cubic-bezier(0.16,1,0.3,1)" }); else Object.assign(n.style, to); };

  function render() {
    wsT.textContent = `ws ${s.ws}`;
    clock.textContent = s.time;
    winG.replaceChildren();
    s.windows.slice(-3).forEach((w, i, arr) => {
      const off = (arr.length - 1 - i) * 6, front = i === arr.length - 1;
      const x = 10 + off, y = 17 + off * 0.8, ww = W - 20 - off * 2, hh = H - 38;
      const win = el("g", { class: `sc-win${front ? " front" : ""}` });
      win.append(el("rect", { x, y, width: ww, height: hh, rx: 2 }));
      win.append(el("rect", { class: "sc-win-title", x, y, width: ww, height: 8, rx: 2 }));
      win.append(el("text", { x: x + 4, y: y + 6 }, w.title));
      if (front) win.append(el("text", { class: "sc-win-x", x: x + ww - 4, y: y + 6, "text-anchor": "end" }, "×"));
      winG.append(win);
    });
    const v = s.muted ? 0 : s.volume;
    tween(volFill, { width: volFill.getAttribute("width") + "px" }, { width: `${(78 * v) / 100}px` });
    volFill.setAttribute("width", (78 * v) / 100);
    volT.textContent = s.muted ? "muted" : `vol ${s.volume}%`;
    media.textContent = `${s.playing ? "▶" : "❚❚"} track ${s.track}`;
    dim.setAttribute("opacity", ((100 - s.brightness) / 100) * 0.7);
    lock.setAttribute("opacity", s.locked ? 1 : 0);
  }

  // one command in, one line of what it did out
  function apply(action, slots = {}) {
    const n = slots?.number;
    if (s.locked && action !== "lock_screen") return "the screen is locked — say “lock the screen” again to unlock";
    let said;
    switch (action) {
      case "volume_up": case "volume_down": {
        if (n != null) s.volume = clamp(n); else s.volume = clamp(s.volume + (action === "volume_up" ? STEP : -STEP));
        s.muted = false; said = `volume → ${s.volume}%`; break; }
      case "mute": s.muted = !s.muted; said = s.muted ? "muted" : `unmuted · vol ${s.volume}%`; break;
      case "brightness_up": s.brightness = n != null ? clamp(n) : clamp(s.brightness + STEP); said = `brightness → ${s.brightness}%`; break;
      case "switch_workspace": s.ws = n != null && n >= 1 && n <= 9 ? n : (s.ws % 9) + 1; said = `workspace ${s.ws}`; break;
      case "close_window": {
        if (!s.windows.length) { said = "nothing to close"; break; }
        const w = s.windows.pop(); said = `closed ${w.title}`; break; }
      case "launch_terminal": case "launch_browser": s.windows.push({ title: APPS[action] }); said = `opened ${APPS[action]}`; break;
      case "play_pause": s.playing = !s.playing; said = s.playing ? `playing track ${s.track}` : "paused"; break;
      case "next_track": s.track += 1; s.playing = true; said = `track ${s.track}`; break;
      case "screenshot": s.shots += 1; said = `screenshot ${s.shots} saved`;
        if (!reduced && flash.animate) flash.animate([{ opacity: 0.9 }, { opacity: 0 }], { duration: 450, easing: "ease-out" }); break;
      case "lock_screen": s.locked = !s.locked; said = s.locked ? "locked" : "unlocked"; break;
      case "set_time": {
        const tm = slots?.time;
        if (!tm) return slots?.time === null ? "that isn't a time I can set — try “set the time to 3:45 pm”" : "say a time, like “set the time to 3:45 pm”";
        s.time = tm.text; said = `clock → ${tm.text}`; break; }
      default: return null;
    }
    render();
    return said;
  }
  function reset() { Object.assign(s, { ws: 1, windows: [], time: "9:41", volume: 50, muted: false, brightness: 80, playing: false, track: 1, locked: false, shots: 0 }); render(); }
  render();
  return { apply, reset, get state() { return { ...s }; } };
}
const clamp = v => Math.max(0, Math.min(100, Math.round(v)));
