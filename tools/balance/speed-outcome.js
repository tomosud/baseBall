// 打球速度（と当たりの質）ごとに、打球の結果（アウト・HR・得点・送球なし）を集計する。
// 試合の形ではなく「この速さの打球はどうなるか」を見るので、物理の値が違う計測を混ぜて使える。
//
//   node speed-outcome.js <raw.json.gz> [...]
import fs from "node:fs";
import zlib from "node:zlib";
import { gameMetrics } from "./lib/metrics.js";

const files = process.argv.slice(2);
if (!files.length) { console.error("usage: node speed-outcome.js <raw.json.gz> ..."); process.exit(1); }
const hits = [];
for (const f of files) {
  const d = JSON.parse(zlib.gunzipSync(fs.readFileSync(f)));
  for (const r of d.results) hits.push(...gameMetrics(r).hits);
}

const pct = (k, n) => (n ? `${Math.round((100 * k) / n)}%` : "-");
function table(title, key, edges) {
  console.log(`\n${title}（打球 ${hits.length}）\n`);
  console.log("| 区間 | 打球 | アウト率 | HR率 | 得点/打球 | 送球なし |\n|---|---|---|---|---|---|");
  for (let i = 0; i < edges.length - 1; i++) {
    const b = hits.filter((h) => h[key] >= edges[i] && h[key] < edges[i + 1]);
    if (!b.length) continue;
    const runs = b.reduce((a, h) => a + h.runs, 0);
    console.log(`| ${edges[i]}–${edges[i + 1]} | ${b.length} | ${pct(b.filter((h) => h.outs > 0).length, b.length)} | ${pct(b.filter((h) => h.homerun).length, b.length)} | ${(runs / b.length).toFixed(2)} | ${pct(b.filter((h) => h.throws === 0).length, b.length)} |`);
  }
}
table("打球速度別", "speed", [150, 300, 400, 500, 600, 650, 700, 750, 800, 850, 900, 950, 981]);
table("当たりの質別", "quality", [0, 0.4, 0.5, 0.6, 0.7, 0.8, 0.85, 0.9, 0.95, 1.01]);
