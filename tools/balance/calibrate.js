// 打者ボットの機械的な定数（振り始めリード・芯のオフセット）を決める。
// 誤差ゼロの打者に中級投手を投げさせ、接触率と当たりの質が最大になる組を探す。
// これは「上級者が体で覚えている値」の近似で、腕前の差はこの上に乗せる誤差で表す。
//   node calibrate.js
import { startServer } from "./lib/server.js";
import { launchBrowser } from "./lib/browser.js";
import { playGame } from "./lib/game.js";

const PERFECT_BATTER = {
  timingSigma: 0, posSigma: 0, swipeMin: 1800, swipeMax: 1800, discipline: 1, chaseMargin: 0,
  fingerOffset: 150, fingerSigma: 0, dodgeRadius: 0, load: 0.6,
};
// 走者・守備は関係ないので最弱にして試合を短く回す
const base = (presetName, botsPresets) => ({ ...botsPresets[presetName], batter: PERFECT_BATTER });

async function runCell(browser, serverUrl, { lead, offset, seed }) {
  // プリセットはページ側にあるので、名前を渡して page 内で合成する代わりにここで固定値を書く
  const mid = {
    pitcher: { aimSigma: 22, swipeMin: 1100, swipeMax: 2200, curveProb: 0.5, curveDeg: 7, zoneMix: [0.5, 0.3, 0.2], deadballProb: 0, thinkMin: 300, thinkMax: 500, learnRate: 0.3 },
    batter: PERFECT_BATTER,
    runner: { tapRate: 3, tapCv: 0.4, dodgeProb: 0, dodgeReact: 0, dodgeMs: 0 },
    fielder: { reactMs: 200, repickMs: 300, leadSigma: 0.1, aimSigma: 7, leadModel: "constant" },
  };
  const r = await playGame(browser, serverUrl, {
    innings: 3, teams: { blue: mid, red: mid }, seed, batLead: lead, batSweetOffset: offset,
  });
  const ev = r.events;
  const swings = ev.filter((e) => e.type === "hit" || (e.type === "strike" && e.swing)).length;
  const hits = ev.filter((e) => e.type === "hit");
  const q = hits.reduce((a, e) => a + e.quality, 0) / Math.max(1, hits.length);
  const spd = hits.map((e) => e.speed).sort((a, b) => a - b);
  const med = spd.length ? spd[Math.floor(spd.length / 2)] : 0;
  return { pitches: ev.filter((e) => e.type === "pitch").length, swings, hits: hits.length, contact: hits.length / Math.max(1, swings), q, medSpeed: med, hr: ev.filter((e) => e.type === "homerun").length };
}

const server = await startServer();
const browser = await launchBrowser();
try {
  const leads = [0.04, 0.08, 0.12, 0.16, 0.2];
  const offsets = [15, 25, 35, 45];
  console.log("lead  offset  pitches swings hits contact  q     medSpd  HR");
  const results = [];
  for (const lead of leads) {
    const row = await Promise.all(offsets.map((offset, i) => runCell(browser, server.url, { lead, offset, seed: 11 + i })));
    row.forEach((c, i) => {
      results.push({ lead, offset: offsets[i], ...c });
      console.log(`${lead.toFixed(2)}  ${String(offsets[i]).padStart(4)}    ${String(c.pitches).padStart(5)} ${String(c.swings).padStart(6)} ${String(c.hits).padStart(4)}  ${c.contact.toFixed(2)}   ${c.q.toFixed(2)}  ${c.medSpeed.toFixed(0).padStart(5)}  ${c.hr}`);
    });
  }
  const best = results.filter((r) => r.swings >= 10).sort((a, b) => (b.contact * (0.5 + b.q)) - (a.contact * (0.5 + a.q)))[0];
  console.log("best:", JSON.stringify(best));
} finally {
  await browser.close();
  await server.close();
}
