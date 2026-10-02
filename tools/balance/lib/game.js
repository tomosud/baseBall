// 1試合を回してイベントログと結果を返す。
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { openGamePage, startGame, applyPhysics, readState, readEvents, runFor } from "./browser.js";

const BOTS_SRC = fs.readFileSync(
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../bots.browser.js"),
  "utf-8",
);

// 仮想時計の上限（秒）。ボットが詰まったときに無限に回らないための保険。
const MAX_VIRTUAL_SECONDS = { 3: 1500, 9: 4000 };

export async function playGame(browser, serverUrl, {
  innings = 3,
  teams,            // { blue: "expert"|"mid"|"novice"|{...}, red: ... }
  seed = 1,
  physics = {},
  batLead,
  batSweetOffset,
  chunkMs = 2000,
  onProgress,
} = {}) {
  const { context, page } = await openGamePage(browser, serverUrl, { seed });
  try {
    await applyPhysics(page, physics);
    await startGame(page, innings);
    await page.addScriptTag({ content: BOTS_SRC });
    await page.evaluate((cfg) => window.__yakyuBots.start(cfg), { teams, batLead, batSweetOffset });

    const limit = MAX_VIRTUAL_SECONDS[innings] * 1000;
    let elapsed = 0;
    let state = await readState(page);
    while (state.phase !== "gameset" && elapsed < limit) {
      await runFor(page, chunkMs);
      elapsed += chunkMs;
      state = await readState(page);
      if (onProgress) onProgress(state);
    }
    const events = await readEvents(page);
    return {
      innings,
      teams,
      seed,
      physics,
      finished: state.phase === "gameset",
      virtualSeconds: state.now / 1000,
      score: state.score,
      inningScores: state.inningScores,
      events,
    };
  } finally {
    await context.close();
  }
}
