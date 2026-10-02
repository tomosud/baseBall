# バランス計測ハーネス

本物の `app.js` を Playwright（headless Chromium）で開き、ページ内に仮想時計を入れて高速再生する。
物理の別実装は持たない。ゲーム側のフックは `app.js` の `TEST_MODE`（`?test=1`）だけで有効になる。

計画の全体は `docs/balance-plan.md`、結果は `docs/balance/` に日付付きで置く。

## 準備

```sh
cd tools/balance
npm install
npx playwright install chromium   # クラウド環境では不要（/opt/pw-browsers を自動検出）
```

Chromium の場所を指定したいときは `YAKYU_CHROMIUM=/path/to/chrome`。

## 使い方

| コマンド | 内容 |
| --- | --- |
| `node micro.js` | README の既存計測（走者の速度曲線・避け性能）を再現する健全性テスト |
| `node smoke.js expert expert 3 1` | 1試合だけ回してイベント内訳を出す（青・赤の腕前、回数、シード） |
| `node calibrate.js` | 打者ボットの定数（振り始めリード・芯のオフセット）を決める |
| `node record.js --blue mid --red mid --seconds 60` | ボット同士の試合を mp4 にする（コマ撮り。指の位置を赤丸で表示）。中身を目で確かめる用 |
| `node record.js --solo --red mid --skip 30 --seconds 40` | ひとりで遊ぶモード（裏で盤面が回る）を撮る。青側もボットが操作する |
| `node run-baseline.js --games 20 --innings 3 --parallel 4` | 腕前総当たりで試合を回し、`docs/balance/` にレポートを書く |

`run-baseline.js` の主な引数: `--skills novice,mid,expert` `--batLead 0.08` `--batSweet 25` `--label baseline` `--out docs/balance`

## 構成

```
tools/balance/
  lib/server.js          リポジトリ直下を配信する静的サーバ
  lib/vclock.browser.js  ページ内の仮想時計（rAF/setTimeout/performance.now/Date を同期で進める）
  lib/browser.js         ページを開く・試合を始める・状態を読む
  lib/game.js            1試合を回してイベントログを返す
  lib/metrics.js         イベントログ → 指標（docs/balance-plan.md §3）
  （ボット本体はリポジトリ直下の cpu.js。ひとりで遊ぶときの CPU と同じもの。index.html が読み込む）
```

## 仕組みのメモ

- **仮想時計**: Playwright の `page.clock` はタイマー1本ごとに実イベントループへ戻るので 1フレーム 4ms 近くかかった。
  自作の同期時計に替えて仮想1秒あたり 5〜20ms（実時間の 50〜200 倍速）。rAF は 60fps 固定なので `dt` は常に 1/60 秒。
- **入力**: 合成 `PointerEvent` を `#playingSurface` に流す。`event.timeStamp` は偽装できないので、
  `app.js` 側は `TEST_MODE` のとき `performance.now()` を使う（`eventTime`）。`setPointerCapture` は合成イベントでは例外になるので try/catch。
- **乱数**: `Math.random` をシード付き（mulberry32）に差し替える。同じシードなら同じ試合になる。
- **ボットの定数**: 打者の「振り始めリード」「芯のオフセット」は腕前ではなく操作の機構で決まる値なので、
  `calibrate.js` で接触率と当たりの質が最大になる値を測って固定する。腕前の差はその上に乗せる誤差で表す。
- **投手の学習**: 曲げ方向ごとに「狙いと実際の通過点のズレ」を指数移動平均で覚えて補正する。
  人が投げながら覚える補正の近似で、学習率が腕前。

## 既知の限界

- ボットの腕前パラメータ（`PRESETS`）は仮置き。実プレイの記録で校正するまでは「相対比較」に使う。
- 守備ボットは「刺せる走者がいない」と判断したら投げない。人はダメ元で投げることもある。
- 仮想時計は CSS トランジションを進めないが、判定には関係ない。
