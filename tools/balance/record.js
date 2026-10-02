// ボット同士の試合を動画にする（テストが実際に何をしているかを目で見る用）。
//
//   node record.js [--blue mid] [--red mid] [--seconds 60] [--seed 1] [--fps 30] [--physics '{...}'] [--out <path.mp4>]
//
// 仮想時計を 1/fps 秒ずつ進めてスクリーンショットを撮り、ffmpeg で mp4 にまとめる。
// 実時間で録画すると早送りの映像が飛ぶので、コマ撮りにしている。
// ボットの合成ポインタ入力は画面に出ないので、指の位置を丸で重ねて描く（赤 = 押している、灰 = 離した直後）。
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { startServer } from "./lib/server.js";
import { launchBrowser, openGamePage, startGame, applyPhysics, runFor } from "./lib/browser.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const BOTS_SRC = fs.readFileSync(path.resolve(ROOT, "tools/balance/bots.browser.js"), "utf-8");

function arg(name, def) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : def;
}
const BLUE = arg("blue", "mid");
const RED = arg("red", "mid");
const SECONDS = Number(arg("seconds", 60));
const SEED = Number(arg("seed", 1));
const FPS = Number(arg("fps", 30));
const PHYSICS = JSON.parse(arg("physics", "{}"));
const OUT = path.resolve(arg("out", `record-${BLUE}-${RED}-s${SEED}.mp4`));

// 指の位置の表示。ゲーム側には触れず、document の捕捉フェーズで拾うだけ。
const TOUCH_OVERLAY = () => {
  const dots = new Map();
  const dot = (id) => {
    if (!dots.has(id)) {
      const d = document.createElement("div");
      d.style.cssText = "position:fixed;width:26px;height:26px;margin:-13px 0 0 -13px;border-radius:50%;"
        + "pointer-events:none;z-index:99999;border:3px solid #fff;box-shadow:0 0 4px #000";
      document.body.appendChild(d);
      dots.set(id, d);
    }
    return dots.get(id);
  };
  const show = (e, color) => {
    const d = dot(e.pointerId);
    d.style.left = `${e.clientX}px`;
    d.style.top = `${e.clientY}px`;
    d.style.background = color;
    d.style.display = "block";
  };
  document.addEventListener("pointerdown", (e) => show(e, "rgba(230,40,40,0.75)"), true);
  document.addEventListener("pointermove", (e) => { if (e.buttons || e.pressure) show(e, "rgba(230,40,40,0.75)"); }, true);
  document.addEventListener("pointerup", (e) => {
    show(e, "rgba(120,120,120,0.6)");
    const d = dot(e.pointerId);
    setTimeout(() => { d.style.display = "none"; }, 150);
  }, true);
};

const frameDir = fs.mkdtempSync(path.join(os.tmpdir(), "yakyu-rec-"));
const server = await startServer();
const browser = await launchBrowser();
try {
  const { context, page } = await openGamePage(browser, server.url, { seed: SEED });
  await applyPhysics(page, PHYSICS);
  await startGame(page, 3);
  await page.evaluate(TOUCH_OVERLAY);
  await page.addScriptTag({ content: BOTS_SRC });
  await page.evaluate((cfg) => window.__yakyuBots.start(cfg), { teams: { blue: BLUE, red: RED } });

  const frames = Math.round(SECONDS * FPS);
  const step = 1000 / FPS;
  for (let i = 0; i < frames; i++) {
    await runFor(page, step);
    await page.screenshot({ path: path.join(frameDir, `f${String(i).padStart(5, "0")}.png`) });
    if (i % (FPS * 10) === 0) console.log(`${(i / FPS).toFixed(0)}s / ${SECONDS}s`);
    const phase = await page.evaluate(() => window.__yakyuTest.gameState.phase);
    if (phase === "gameset") break;
  }
  await context.close();
} finally {
  await browser.close();
  await server.close();
}

const r = spawnSync("ffmpeg", [
  "-y", "-loglevel", "error", "-framerate", String(FPS), "-i", path.join(frameDir, "f%05d.png"),
  "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "28", "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2", OUT,
], { stdio: "inherit" });
fs.rmSync(frameDir, { recursive: true, force: true });
if (r.status !== 0) process.exit(r.status ?? 1);
console.log(`書き出し: ${OUT}`);
