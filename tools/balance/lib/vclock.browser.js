// ページ内の仮想時計。Playwright の page.clock はタイマー1本ごとに実イベントループへ戻るため
// 1フレーム 4ms 近くかかり、試合を回すには遅すぎた。ここでは完全同期で timers を捌く。
// addInitScript で app.js より先に入れる。Node 側は window.__vclock.advance(ms) を呼ぶだけ。
(() => {
  if (window.__vclock) return;
  let nowMs = 0;
  let seq = 0;
  const timers = new Map(); // id -> { at, fn, args, interval }
  const rafs = new Map();   // id -> fn
  const FRAME = 1000 / 60;
  let nextFrameAt = FRAME;

  const perfNow = () => nowMs;
  window.performance.now = perfNow;
  const RealDate = Date;
  const epoch = 1_700_000_000_000; // 固定の起点（保存データの id などに使われるだけ）
  window.Date = class extends RealDate {
    constructor(...args) {
      if (args.length === 0) super(epoch + nowMs);
      else super(...args);
    }
    static now() { return epoch + nowMs; }
  };

  window.setTimeout = (fn, delay = 0, ...args) => {
    const id = ++seq;
    timers.set(id, { at: nowMs + Math.max(0, Number(delay) || 0), fn, args, interval: null });
    return id;
  };
  window.setInterval = (fn, delay = 0, ...args) => {
    const id = ++seq;
    const d = Math.max(1, Number(delay) || 1);
    timers.set(id, { at: nowMs + d, fn, args, interval: d });
    return id;
  };
  window.clearTimeout = window.clearInterval = (id) => { timers.delete(id); };
  window.requestAnimationFrame = (fn) => {
    const id = ++seq;
    rafs.set(id, fn);
    return id;
  };
  window.cancelAnimationFrame = (id) => { rafs.delete(id); };

  function runTimersUntil(limit) {
    // 期限順に1本ずつ。コールバックが新しいタイマーを足しても拾えるように毎回探す。
    for (;;) {
      let bestId = null, best = null;
      for (const [id, t] of timers) {
        if (t.at <= limit && (best === null || t.at < best.at || (t.at === best.at && id < bestId))) { best = t; bestId = id; }
      }
      if (best === null) return;
      nowMs = Math.max(nowMs, best.at);
      if (best.interval !== null) best.at += best.interval; else timers.delete(bestId);
      try { best.fn(...best.args); } catch (err) { console.error("[vclock timer]", err); }
    }
  }

  function runFrame() {
    nowMs = Math.max(nowMs, nextFrameAt);
    const batch = [...rafs.entries()];
    rafs.clear();
    for (const [, fn] of batch) {
      try { fn(nowMs); } catch (err) { console.error("[vclock raf]", err); }
    }
    nextFrameAt += FRAME;
  }

  window.__vclock = {
    now: perfNow,
    advance(ms) {
      const target = nowMs + ms;
      while (nextFrameAt <= target) {
        runTimersUntil(nextFrameAt);
        runFrame();
      }
      runTimersUntil(target);
      nowMs = target;
    },
  };
})();
