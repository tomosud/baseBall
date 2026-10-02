// 腕前カードの総当たりで試合を回し、現状の数値でのバランス（試合の形）を測る。
//
//   node run-baseline.js [--games 20] [--innings 3] [--parallel 4] [--skills novice,mid,expert] [--out docs/balance]
//
// 出力:
//   <out>/raw/baseline-<日時>.json   全試合のイベントログ（再集計用）
//   <out>/baseline-<日時>.md         集計レポート
import fs from "node:fs";
import zlib from "node:zlib";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { startServer } from "./lib/server.js";
import { launchBrowser } from "./lib/browser.js";
import { playGame } from "./lib/game.js";
import { aggregate } from "./lib/metrics.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function arg(name, def) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : def;
}
const GAMES = Number(arg("games", 20));
const INNINGS = Number(arg("innings", 3));
const PARALLEL = Number(arg("parallel", 4));
const SKILLS = arg("skills", "novice,mid,expert").split(",");
const OUT = path.resolve(ROOT, arg("out", "docs/balance"));
const BAT_LEAD = Number(arg("batLead", 0.16));
// 既定 35 はボット側の既定と同じ。2026-10-02 以前は引数がボットに届かず常に 35 で回っていたので、比較のため揃える。
const BAT_SWEET = Number(arg("batSweet", 35));
const LABEL = arg("label", "baseline");
// physics の上書き（JSON）。例: --physics '{"batHitPowerScale":0.4}'
const PHYSICS = JSON.parse(arg("physics", "{}"));

const JP = { novice: "初級", mid: "中級", expert: "上級" };

// カード: 全組み合わせ（表裏の偏りを打ち消すため、青/赤の入れ替えも別カードとして回す）
const cells = [];
for (const b of SKILLS) for (const r of SKILLS) cells.push({ blue: b, red: r });

const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 13).replace("T", "-");
fs.mkdirSync(path.join(OUT, "raw"), { recursive: true });

const server = await startServer();
const browser = await launchBrowser();
const results = [];
const t0 = Date.now();
try {
  const queue = [];
  let seed = 1000;
  for (const c of cells) for (let g = 0; g < GAMES; g++) queue.push({ ...c, seed: seed++ });
  let done = 0;
  const worker = async () => {
    while (queue.length) {
      const job = queue.shift();
      const r = await playGame(browser, server.url, {
        innings: INNINGS, teams: { blue: job.blue, red: job.red }, seed: job.seed,
        batLead: BAT_LEAD, batSweetOffset: BAT_SWEET, physics: PHYSICS,
      });
      results.push({ ...r, cell: `${job.blue}-${job.red}` });
      done++;
      if (done % 10 === 0 || done === cells.length * GAMES) {
        const el = (Date.now() - t0) / 1000;
        console.log(`${done}/${cells.length * GAMES} 試合  ${el.toFixed(0)}s  (${(el / done).toFixed(1)}s/試合)`);
      }
    }
  };
  await Promise.all(Array.from({ length: PARALLEL }, worker));
} finally {
  await browser.close();
  await server.close();
}

// ---- 保存 ----
const rawPath = path.join(OUT, "raw", `${LABEL}-${stamp}.json`);
// 生データは数MBになるので gzip で置く（zcat で戻せる）
fs.writeFileSync(`${rawPath}.gz`, zlib.gzipSync(JSON.stringify({ innings: INNINGS, games: GAMES, skills: SKILLS, batLead: BAT_LEAD, batSweet: BAT_SWEET, physics: PHYSICS, results })));

// ---- 集計 ----
const byCell = {};
for (const r of results) (byCell[r.cell] ||= []).push(r);
const agg = Object.fromEntries(Object.entries(byCell).map(([k, v]) => [k, aggregate(v)]));

const pct = (v) => (v === null || v === undefined ? "-" : `${(v * 100).toFixed(0)}%`);
const num = (v, d = 1) => (v === null || v === undefined ? "-" : Number(v).toFixed(d));
const cellName = (k) => k.split("-").map((s) => JP[s] || s).join(" vs ");

let md = `# ベースライン計測 ${stamp}\n\n`;
md += `- 形式: ${INNINGS}回制 / カードあたり ${GAMES} 試合 / 腕前 ${SKILLS.map((s) => JP[s]).join("・")}\n`;
md += `- 盤面 420×860、物理パラメータ: ${Object.keys(PHYSICS).length ? JSON.stringify(PHYSICS) : "現在値（変更なし）"}。打者定数 lead=${BAT_LEAD}s, sweet=${BAT_SWEET}px\n`;
md += `- 生データ: \`${path.relative(ROOT, rawPath)}\`\n\n`;

md += `## 1. 勝敗と得点（試合の形）\n\n`;
md += `| カード（青 vs 赤） | 試合 | 完了 | 青勝率 (95%CI) | 引分 | 合計得点 中央値 / 平均 / p90 | 0-0 | 1点差以内 | 表の得点比 | 試合時間 中央値 |\n|---|---|---|---|---|---|---|---|---|---|\n`;
for (const [k, a] of Object.entries(agg)) {
  md += `| ${cellName(k)} | ${a.games} | ${a.finished} | ${pct(a.blueWinRate)} (${pct(a.blueWinCI[0])}–${pct(a.blueWinCI[1])}) | ${a.ties} | ${num(a.totalRunsMedian, 0)} / ${num(a.totalRunsMean)} / ${num(a.totalRunsP90, 0)} | ${pct(a.zeroZero)} | ${pct(a.oneRunOrTie)} | ${pct(a.runsTopShare)} | ${num(a.secondsMedian / 60)}分 |\n`;
}

md += `\n## 2. 打席の内訳\n\n`;
md += `| カード | 打席/試合 | 球数/打席 | 三振 | 四球 | インプレー | 空振り率(ストライク中) | ボール率 | 投げミス | デッドボール/球 | DB得点比 |\n|---|---|---|---|---|---|---|---|---|---|---|\n`;
for (const [k, a] of Object.entries(agg)) {
  md += `| ${cellName(k)} | ${num(a.paPerGame)} | ${num(a.pitchesPerPA, 2)} | ${pct(a.kRate)} | ${pct(a.bbRate)} | ${pct(a.inplayRate)} | ${pct(a.swingStrikeShare)} | ${pct(a.ballRate)} | ${pct(a.pitchMissRate)} | ${pct(a.deadballRate)} | ${pct(a.deadballRunsShare)} |\n`;
}

md += `\n## 3. インプレー（打球が出たあと）\n\n`;
md += `| カード | アウト率 | 得点/打球 | HR率 | 送球/打球 | 送球なし | 当たりの質 中央値 | 打球速度 p10/中央/p90 | impulse 中央値 |\n|---|---|---|---|---|---|---|---|---|\n`;
for (const [k, a] of Object.entries(agg)) {
  md += `| ${cellName(k)} | ${pct(a.inplayOutRate)} | ${num(a.inplayRunRate, 2)} | ${pct(a.hrRate)} | ${num(a.throwsPerInplay, 2)} | ${pct(a.noThrowShare)} | ${num(a.hitQualityMedian, 2)} | ${num(a.hitSpeedP10, 0)} / ${num(a.hitSpeedMedian, 0)} / ${num(a.hitSpeedP90, 0)} | ${num(a.impulseMedian, 0)} |\n`;
}

md += `\n## 4. 腕前差の反映度\n\n`;
md += `同じカードの青赤入れ替えを合算した「上手い側の勝率」。\n\n| 対戦 | 試合 | 上手い側の勝率 (95%CI) | 引分 |\n|---|---|---|---|\n`;
const rank = Object.fromEntries(SKILLS.map((s, i) => [s, i]));
const pairs = new Map();
for (const r of results) {
  const [b, rd] = r.cell.split("-");
  if (b === rd) continue;
  const hi = rank[b] > rank[rd] ? b : rd, lo = hi === b ? rd : b;
  const key = `${hi}>${lo}`;
  const p = pairs.get(key) || { n: 0, hiWins: 0, ties: 0 };
  p.n++;
  const blueWon = r.score[0] > r.score[1], redWon = r.score[1] > r.score[0];
  if (!blueWon && !redWon) p.ties++;
  else if ((blueWon && b === hi) || (redWon && rd === hi)) p.hiWins++;
  pairs.set(key, p);
}
for (const [key, p] of pairs) {
  const [hi, lo] = key.split(">");
  const ci = (await import("./lib/metrics.js")).wilson(p.hiWins, p.n);
  md += `| ${JP[hi]} vs ${JP[lo]} | ${p.n} | ${pct(p.hiWins / p.n)} (${pct(ci[0])}–${pct(ci[1])}) | ${p.ties} |\n`;
}

md += `\n## 読み方\n\n`;
md += `- 「完了」が試合数より少ないカードは、仮想時間の上限（3回制 1500秒）までに試合が終わらなかったもの。アウトが取れずイニングが進まない状態を意味する。\n`;
md += `- 「送球なし」は、打球が出たのに守備が一度も投げなかった割合。拾えるようになった時点で刺せる走者がいない（間に合わない）と判断した打球。\n`;
md += `- 「表の得点比」は 50% が理想。表（青攻撃）と裏（赤攻撃）で仕様差はないので、ここが偏るなら上下反転や最終回裏のサヨナラが効いている。\n`;
md += `- ボットの腕前パラメータは \`cpu.js\` の PRESETS。実プレイで校正するまでは仮置き。\n`;

const mdPath = path.join(OUT, `${LABEL}-${stamp}.md`);
fs.writeFileSync(mdPath, md);
console.log(`\n書き出し: ${path.relative(ROOT, mdPath)}`);
console.log(md);
