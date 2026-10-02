// README「調整のやり方」にある既存計測をハーネス上で再現する健全性テスト。
// ここが README の数字と合わなければ、仮想時計かフックがズレている。
//
//   node micro.js
//
// 1) 走者の速度曲線: 連打 0/3/6/12 回/秒で本塁→一塁の到達時間（README: 25.0 / 6.7 / 3.9 / 2.8 秒）
// 2) 避け性能: 全力で走ってから連打を止め、等速の読みとのズレが判定半径 17px を超えるまでの時間
//    （README: 0.4 秒で 23px、0.6 秒で 46px）
import { startServer } from "./lib/server.js";
import { launchBrowser, openGamePage, startGame, runFor } from "./lib/browser.js";

const FRAME = 1000 / 60;

async function measureHomeToFirst(page, tapsPerSecond) {
  await startGame(page, 3);
  const result = await page.evaluate(async ([rate, frame]) => {
    const t = window.__yakyuTest;
    t.spawnRunnerOnHit();
    const runner = t.playingState.runners[0];
    const start = performance.now();
    let timer = null;
    if (rate > 0) timer = setInterval(() => t.applyRunnerBoostTap(), 1000 / rate);
    // 仮想時計は Node 側が進めるので、ここでは到達を待つ Promise だけ返す
    return new Promise((resolve) => {
      const check = setInterval(() => {
        if (runner.state !== "running") {
          clearInterval(check);
          if (timer) clearInterval(timer);
          resolve({ seconds: (performance.now() - start) / 1000, state: runner.state });
        }
      }, frame);
    });
  }, [tapsPerSecond, FRAME]).catch(() => null);
  return result;
}

async function main() {
  const server = await startServer();
  const browser = await launchBrowser();
  try {
    console.log("== 走者の速度曲線（本塁→一塁） ==");
    for (const rate of [0, 3, 6, 12]) {
      const { context, page } = await openGamePage(browser, server.url);
      const pending = measureHomeToFirst(page, rate);
      // 到達まで最大 30 秒ぶん仮想時計を進める
      for (let i = 0; i < 30; i++) await runFor(page, 1000);
      const r = await pending;
      const geom = await page.evaluate(() => {
        const g = window.__yakyuTest.geometry();
        return Math.hypot(g.bases[0].x - g.home.x, g.bases[0].y - g.home.y);
      });
      console.log(`  秒${rate}回: ${r ? r.seconds.toFixed(2) + "s" : "未到達"}  (距離 ${geom.toFixed(0)}px)`);
      await context.close();
    }

    console.log("== 避け性能（全力→連打停止後の等速読みとのズレ） ==");
    {
      const { context, page } = await openGamePage(browser, server.url);
      await startGame(page, 3);
      const pending = page.evaluate(([frame]) => {
        const t = window.__yakyuTest;
        const p = t.physics;
        t.spawnRunnerOnHit();
        const runner = t.playingState.runners[0];
        // 2 秒間 12 回/秒で全力
        const tapper = setInterval(() => t.applyRunnerBoostTap(), 1000 / 12);
        return new Promise((resolve) => {
          setTimeout(() => {
            clearInterval(tapper);
            const speed = p.runnerBaseSpeed + t.playingState.runnerBoost;
            const x0 = runner.x, y0 = runner.y, t0 = performance.now();
            const samples = [];
            const check = setInterval(() => {
              const elapsed = (performance.now() - t0) / 1000;
              const actual = Math.hypot(runner.x - x0, runner.y - y0);
              const predicted = speed * elapsed;
              samples.push({ elapsed, gap: predicted - actual });
              if (elapsed >= 0.8) {
                clearInterval(check);
                resolve({ speed, samples });
              }
            }, frame);
          }, 2000);
        });
      }, [FRAME]);
      for (let i = 0; i < 4; i++) await runFor(page, 1000);
      const r = await pending;
      const at = (s) => r.samples.find((x) => x.elapsed >= s);
      const over = r.samples.find((x) => x.gap >= 17);
      console.log(`  停止時の速度 ${r.speed.toFixed(0)}px/s`);
      console.log(`  0.4s で ${at(0.4).gap.toFixed(0)}px / 0.6s で ${at(0.6).gap.toFixed(0)}px のズレ`);
      console.log(`  判定半径 17px を超えるまで ${over ? over.elapsed.toFixed(2) + "s" : "超えず"}`);
      await context.close();
    }
  } finally {
    await browser.close();
    await server.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
