// イベントログ（app.js の testLog）から 1試合の指標を出し、カードごとに集計する。
// 指標の定義は docs/balance-plan.md §3 に合わせる。

export function gameMetrics(result) {
  const ev = result.events;
  const m = {
    finished: result.finished,
    virtualSeconds: result.virtualSeconds,
    score: result.score,
    totalRuns: result.score[0] + result.score[1],
    runDiff: Math.abs(result.score[0] - result.score[1]),
    winner: result.score[0] > result.score[1] ? "blue" : result.score[1] > result.score[0] ? "red" : "tie",
    pitches: 0, pitchMiss: 0, deadballs: 0, deadballRuns: 0,
    strikesCalled: 0, strikesSwing: 0, balls: 0,
    pa: 0, strikeouts: 0, walks: 0, inplay: 0, fouls: 0,
    hits: [],            // { quality, speed, outs, runs, throws, homerun }
    throws: 0, tagouts: 0, homeruns: 0,
    runsTop: 0, runsBottom: 0,
    halfInnings: 0,
  };
  let play = null;
  const closePlay = () => { if (play) { m.hits.push(play); play = null; } };
  for (const e of ev) {
    switch (e.type) {
      case "pitch":
        closePlay();
        m.pitches++;
        break;
      case "pitchmiss": m.pitchMiss++; break;
      case "deadball": m.deadballs++; m.deadballRuns++; break;
      case "strike": if (e.swing) m.strikesSwing++; else m.strikesCalled++; break;
      case "ball": m.balls++; break;
      case "walk": m.pa++; m.walks++; break;
      case "out":
        if (e.reason === "三振!") { m.pa++; m.strikeouts++; }
        else if (play) play.outs++;
        break;
      case "hit":
        closePlay();
        m.pa++; m.inplay++;
        play = { quality: e.quality, speed: e.speed, impulse: e.impulse, outs: 0, runs: 0, throws: 0, homerun: false };
        break;
      case "foul":
        // 打った（hit）あとにファウルと分かったもの。打席・インプレーから外す
        m.fouls++;
        if (play) { play = null; m.pa--; m.inplay--; }
        break;
      case "throw": m.throws++; if (play) play.throws++; break;
      case "tagout": m.tagouts++; break;
      case "homerun": m.homeruns++; if (play) play.homerun = true; break;
      case "score":
        if (play) play.runs++;
        if (e.isTop) m.runsTop++; else m.runsBottom++;
        break;
      case "change": m.halfInnings++; break;
      default: break;
    }
  }
  closePlay();
  m.inplayOutRate = m.inplay ? m.hits.filter((h) => h.outs > 0).length / m.inplay : null;
  m.secondsPerPitch = m.pitches ? m.virtualSeconds / m.pitches : null;
  return m;
}

function mean(xs) { return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null; }
function median(xs) {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const i = Math.floor(s.length / 2);
  return s.length % 2 ? s[i] : (s[i - 1] + s[i]) / 2;
}
function quantile(xs, q) {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor(q * s.length))];
}
// Wilson 95% 信頼区間
export function wilson(k, n) {
  if (!n) return [null, null];
  const z = 1.96, p = k / n;
  const d = 1 + (z * z) / n;
  const c = (p + (z * z) / (2 * n)) / d;
  const h = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / d;
  return [c - h, c + h];
}

export function aggregate(games) {
  const ms = games.map(gameMetrics);
  const n = ms.length;
  const sum = (f) => ms.reduce((a, m) => a + f(m), 0);
  const pitches = sum((m) => m.pitches);
  const pa = sum((m) => m.pa);
  const inplay = sum((m) => m.inplay);
  const hits = ms.flatMap((m) => m.hits);
  const blueWins = ms.filter((m) => m.winner === "blue").length;
  const redWins = ms.filter((m) => m.winner === "red").length;
  const ties = ms.filter((m) => m.winner === "tie").length;
  return {
    games: n,
    finished: ms.filter((m) => m.finished).length,
    blueWins, redWins, ties,
    blueWinRate: n ? blueWins / n : null,
    blueWinCI: wilson(blueWins, n),
    totalRunsMedian: median(ms.map((m) => m.totalRuns)),
    totalRunsMean: mean(ms.map((m) => m.totalRuns)),
    totalRunsP90: quantile(ms.map((m) => m.totalRuns), 0.9),
    zeroZero: ms.filter((m) => m.totalRuns === 0).length / n,
    oneRunOrTie: ms.filter((m) => m.runDiff <= 1).length / n,
    runsTopShare: (() => { const t = sum((m) => m.runsTop), b = sum((m) => m.runsBottom); return t + b ? t / (t + b) : null; })(),
    secondsMedian: median(ms.map((m) => m.virtualSeconds)),
    secondsPerPitch: pitches ? sum((m) => m.virtualSeconds) / pitches : null,
    pitchesPerPA: pa ? pitches / pa : null,
    paPerGame: pa / n,
    kRate: pa ? sum((m) => m.strikeouts) / pa : null,
    bbRate: pa ? sum((m) => m.walks) / pa : null,
    inplayRate: pa ? inplay / pa : null,
    swingStrikeShare: (() => { const s = sum((m) => m.strikesSwing), c = sum((m) => m.strikesCalled); return s + c ? s / (s + c) : null; })(),
    ballRate: pitches ? sum((m) => m.balls) / pitches : null,
    pitchMissRate: pitches ? sum((m) => m.pitchMiss) / pitches : null,
    deadballRate: pitches ? sum((m) => m.deadballs) / pitches : null,
    deadballRunsShare: (() => { const r = sum((m) => m.totalRuns), d = sum((m) => m.deadballRuns); return r ? d / r : null; })(),
    inplayOutRate: inplay ? hits.filter((h) => h.outs > 0).length / inplay : null,
    inplayRunRate: inplay ? hits.reduce((a, h) => a + h.runs, 0) / inplay : null,
    hrRate: inplay ? sum((m) => m.homeruns) / inplay : null,
    throwsPerInplay: inplay ? sum((m) => m.throws) / inplay : null,
    noThrowShare: inplay ? hits.filter((h) => h.throws === 0).length / inplay : null,
    hitQualityMedian: median(hits.map((h) => h.quality)),
    hitSpeedMedian: median(hits.map((h) => h.speed)),
    hitSpeedP10: quantile(hits.map((h) => h.speed), 0.1),
    hitSpeedP90: quantile(hits.map((h) => h.speed), 0.9),
    // 圧縮前のスイングの勢い。古いログには無いので、あるものだけで出す。
    impulseMedian: median(hits.filter((h) => h.impulse != null).map((h) => h.impulse)),
    halfInningsPerGame: sum((m) => m.halfInnings) / n,
  };
}
