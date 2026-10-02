// Playwright で index.html?test=1 を開き、仮想時計（page.clock）で高速再生するための土台。
// ゲーム側のフックは app.js 末尾付近の window.__yakyuTest（TEST_MODE）を参照。
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

// README の計測基準サイズ（420×860）。本塁→一塁 385px などの既存実測はこの寸法。
export const DEFAULT_VIEWPORT = { width: 420, height: 860 };

function findChromium() {
  if (process.env.YAKYU_CHROMIUM) return process.env.YAKYU_CHROMIUM;
  // クラウド環境では /opt/pw-browsers に同梱の Chromium を使う（playwright install 不要）
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (base && fs.existsSync(base)) {
    const dir = fs.readdirSync(base).find((d) => /^chromium-\d+$/.test(d));
    if (dir) {
      const candidate = path.join(base, dir, "chrome-linux", "chrome");
      if (fs.existsSync(candidate)) return candidate;
    }
  }
  return undefined; // Playwright 既定（npx playwright install chromium 済みの環境）
}

export async function launchBrowser() {
  const executablePath = findChromium();
  return chromium.launch({
    headless: true,
    executablePath,
    args: ["--autoplay-policy=no-user-gesture-required"],
  });
}

const VCLOCK_SRC = fs.readFileSync(
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), "vclock.browser.js"),
  "utf-8",
);

// 仮想時計を ms ぶん進める（rAF は 60fps 刻み、setTimeout/setInterval は期限順）。
export async function runFor(page, ms) {
  await page.evaluate((m) => window.__vclock.advance(m), ms);
}

// 1ページ = 1試合分の盤面。仮想時計は goto より前に入れておかないとゲーム側の rAF を掴めない。
export async function openGamePage(browser, serverUrl, { viewport = DEFAULT_VIEWPORT, seed = 1 } = {}) {
  const context = await browser.newContext({ viewport, hasTouch: true, isMobile: true });
  const page = await context.newPage();
  page.on("pageerror", (err) => console.error("[page error]", err.message));
  await page.addInitScript({ content: VCLOCK_SRC });
  await page.goto(`${serverUrl}/index.html?test=1&seed=${seed}`, { waitUntil: "load" });
  await page.waitForFunction(() => Boolean(window.__yakyuTest));
  // 乱数を差し替えて再現可能にする（mulberry32）
  await page.evaluate((s) => {
    let a = s >>> 0;
    Math.random = function seeded() {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }, seed);
  return { context, page };
}

// タイトル画面から試合を開始し、PLAY BALL! のオーバーレイ（1200ms）が消えるまで進める。
export async function startGame(page, innings = 3) {
  await page.evaluate((n) => {
    const id = n === 3 ? "openPlayingPrototype3" : "openPlayingPrototype";
    document.getElementById(id).click();
  }, innings);
  await runFor(page, 1300);
  const phase = await page.evaluate(() => window.__yakyuTest.gameState.phase);
  if (phase !== "playing") throw new Error(`game did not start (phase=${phase})`);
}

// physics の上書き。走者判定半径（const）は対象外なので tune 側で扱う。
export async function applyPhysics(page, overrides) {
  if (!overrides || Object.keys(overrides).length === 0) return;
  await page.evaluate((o) => Object.assign(window.__yakyuTest.physics, o), overrides);
}

export async function readState(page) {
  return page.evaluate(() => {
    const t = window.__yakyuTest;
    return {
      phase: t.gameState.phase,
      inning: t.gameState.inning,
      isTop: t.gameState.isTop,
      score: [...t.gameState.score],
      inningScores: t.gameState.inningScores.map((r) => [...r]),
      now: performance.now(),
    };
  });
}

export async function readEvents(page) {
  return page.evaluate(() => window.__yakyuTest.events.slice());
}
