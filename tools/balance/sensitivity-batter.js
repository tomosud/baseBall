// 打者の操作誤差（タイミング σ・位置 σ）に対する、接触率・当たりの質・HR率の感度。
// 「どれだけ正確に振れれば HR になるか」を数字にする。投手は中級固定、走者・守備は関係しない。
//   node sensitivity-batter.js
import { startServer } from "./lib/server.js";
import { launchBrowser } from "./lib/browser.js";
import { playGame } from "./lib/game.js";

const PITCHER_MID = { aimSigma: 22, swipeMin: 1100, swipeMax: 2200, curveProb: 0.5, curveDeg: 7, zoneMix: [0.5, 0.3, 0.2], deadballProb: 0, thinkMin: 300, thinkMax: 500, learnRate: 0.3 };
const RUNNER = { tapRate: 3, tapCv: 0.4, dodgeProb: 0, dodgeReact: 0, dodgeMs: 0 };
const FIELDER = { reactMs: 200, repickMs: 300, leadSigma: 0.1, aimSigma: 7, leadModel: "constant" };

async function cell(browser, url, timingSigma, posSigma, seed) {
  const batter = { timingSigma, posSigma, swipeMin: 1800, swipeMax: 1800, discipline: 1, chaseMargin: 0, fingerOffset: 150, fingerSigma: 0, dodgeRadius: 0 };
  const team = { pitcher: PITCHER_MID, batter, runner: RUNNER, fielder: FIELDER };
  const r = await playGame(browser, url, { innings: 3, teams: { blue: team, red: team }, seed });
  const ev = r.events;
  const swings = ev.filter((e) => e.type === "hit" || (e.type === "strike" && e.swing)).length;
  const hits = ev.filter((e) => e.type === "hit");
  const qs = hits.map((e) => e.quality).sort((a, b) => a - b);
  return {
    swings, hits: hits.length,
    contact: hits.length / Math.max(1, swings),
    qMed: qs.length ? qs[Math.floor(qs.length / 2)] : 0,
    hr: ev.filter((e) => e.type === "homerun").length / Math.max(1, hits.length),
    spdMed: hits.length ? hits.map((e) => e.speed).sort((a, b) => a - b)[Math.floor(hits.length / 2)] : 0,
  };
}

const server = await startServer();
const browser = await launchBrowser();
try {
  const timings = [0.02, 0.04, 0.06, 0.09, 0.12, 0.16];
  const positions = [5, 15, 30];
  console.log("timingσ(s) posσ(px) swings hits contact qMed  HR率  打球速度中央");
  for (const t of timings) {
    const row = await Promise.all(positions.map((p, i) => cell(browser, server.url, t, p, 101 + i)));
    row.forEach((c, i) => console.log(`${t.toFixed(2)}       ${String(positions[i]).padStart(3)}     ${String(c.swings).padStart(5)} ${String(c.hits).padStart(4)}  ${c.contact.toFixed(2)}  ${c.qMed.toFixed(2)}  ${(c.hr * 100).toFixed(0).padStart(3)}%  ${c.spdMed.toFixed(0)}`));
  }
} finally {
  await browser.close();
  await server.close();
}
