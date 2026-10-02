// 1試合だけ回して、イベントの内訳と所要時間を出す動作確認。
//   node smoke.js [blueSkill] [redSkill] [innings] [seed]
import { startServer } from "./lib/server.js";
import { launchBrowser } from "./lib/browser.js";
import { playGame } from "./lib/game.js";

const [blue = "expert", red = "expert", innings = "3", seed = "1"] = process.argv.slice(2);

const server = await startServer();
const browser = await launchBrowser();
try {
  const t0 = Date.now();
  let lastLog = 0;
  const result = await playGame(browser, server.url, {
    innings: Number(innings),
    teams: { blue, red },
    seed: Number(seed),
    onProgress: (s) => {
      if (s.now - lastLog >= 60000) {
        lastLog = s.now;
        console.log(`  仮想 ${(s.now / 1000).toFixed(0)}s  ${s.inning}回${s.isTop ? "表" : "裏"}  ${s.score[0]}-${s.score[1]}`);
      }
    },
  });
  const wall = (Date.now() - t0) / 1000;
  const counts = {};
  for (const e of result.events) counts[e.type] = (counts[e.type] || 0) + 1;
  console.log(`終了: ${result.finished}  得点 ${result.score[0]}-${result.score[1]}  仮想 ${result.virtualSeconds.toFixed(0)}s  実時間 ${wall.toFixed(1)}s`);
  console.log("イニング別:", JSON.stringify(result.inningScores.slice(0, result.innings)));
  console.log("イベント:", JSON.stringify(counts));
  const last = result.events.slice(-12).map((e) => `${(e.t / 1000).toFixed(1)}s ${e.type}`);
  console.log("末尾:", last.join(" | "));
} finally {
  await browser.close();
  await server.close();
}
