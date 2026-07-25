const state = {
  activePointerId: null,
  trail: [],
  pitchPath: [],
  speedHistory: [],
  animationFrameId: 0,
  isPitching: false,
  motionMode: "flight",
  pitchJudged: false,
  bounceCount: 0,
  rollDirection: 1,
  releaseDirectionX: 0,
  releaseDirectionY: -1,
  releaseCurve: 0,
  curveAccelerationX: 0,
  curveRampDuration: 1,
  height: 0,
  initialHeight: 0,
  heightVelocity: 0,
  flightGravity: 0,
  bounceMinY: 0,
  flightElapsed: 0,
  bounceMinTime: 0,
  ballX: 0,
  ballY: 0,
  velocityX: 0,
  velocityY: 0,
  lastReleaseSpeed: 0,
  currentSpeed: 0,
  lastTick: 0,
};

const battingState = {
  activePointerId: null,
  trail: [],
  isRunning: false,
  isBallActive: false,
  isHit: false,
  isResting: false,
  isSwinging: false,
  swingTimer: 0,
  nextPitchAt: 0,
  animationFrameId: 0,
  lastTick: 0,
  ballX: 0,
  ballY: 0,
  velocityX: 0,
  velocityY: 0,
  curveAccelerationX: 0,
  pitchElapsed: 0,
  pitchRawSpeed: 0,
  currentSpeed: 0,
  pitchJudged: false,
  batX: 0,
  batY: 0,
  batBaseX: 0,
  batBaseY: 0,
  batPointerStartX: 0,
  batPointerStartY: 0,
  batAngle: 0,
  batReadyAngle: 0,
  swingStartAngle: 0,
  swingEndAngle: 0,
  swingVelocityX: 0,
  swingVelocityY: 0,
  swingMoveVelocityX: 0,
  swingMoveVelocityY: 0,
  swingSpeed: 0,
  swingPower: 0,
  swingAngularSpeed: 0,
  swingGateSpeed: 0,
  swingElapsed: 0,
  swingLingerTimer: 0,
};

const playingState = {
  // pitcher side
  pitcherPointerId: null,
  pitcherTrail: [],
  pitcherReleaseCurve: 0,
  // 投球を開始した位置（ピッチャーエリア内）。エリアを外れてリリースしても
  // ここからの距離で山なりを決めることで失速させない。
  pitchOriginX: null,
  pitchOriginY: null,
  isPitched: false,
  // この投球がピッチャーエリア（上半分）を出たか。出られなければ投げミス扱い。
  pitchLeftPitcherArea: false,
  // ball physics (pitching-proto identical, Y-axis flipped: +Y = toward batter)
  isRunning: false,
  isBallActive: false,
  isHit: false,
  isResting: false,
  isHomeRun: false,
  pitchJudged: false,
  motionMode: "flight",
  ballX: 0,
  ballY: 0,
  velocityX: 0,
  velocityY: 0,
  // 打球・送球の減衰。送球だけ球速倍率と同率で下げ、届く距離を保ったまま遅くする。
  hitDrag: 1.1,
  curveAccelerationX: 0,
  curveRampDuration: 1,
  currentSpeed: 0,
  pitchRawSpeed: 0,
  flightElapsed: 0,
  bounceMinTime: 0,
  height: 0,
  initialHeight: 0,
  heightVelocity: 0,
  flightGravity: 0,
  bounceCount: 0,
  releaseDirectionX: 0,
  releaseDirectionY: 1,
  releaseCurve: 0,
  rollDirection: 1,
  // batter side
  batterPointerId: null,
  batterTrail: [],
  // バッターの指の位置。デッドボール（ここに投球が当たる）の判定と輪の描画に使う。
  batterFingerX: 0,
  batterFingerY: 0,
  isSwinging: false,
  swingTimer: 0,
  swingElapsed: 0,
  swingLingerTimer: 0,
  swingStartAngle: 0,
  swingEndAngle: 0,
  swingVelocityX: 0,
  swingVelocityY: 0,
  swingMoveVelocityX: 0,
  swingMoveVelocityY: 0,
  swingSpeed: 0,
  swingPower: 0,
  swingAngularSpeed: 0,
  swingGateSpeed: 0,
  batX: 0,
  batY: 0,
  batBaseX: 0,
  batBaseY: 0,
  batPointerStartX: 0,
  batPointerStartY: 0,
  batAngle: 0,
  batReadyAngle: 0,
  // animation
  animationFrameId: 0,
  lastTick: 0,
  nextPitchReadyAt: 0,
  // runners
  runners: [],
  // インプレー状態: 打球発生〜全走者 settle まで true（通常投球を禁止する区切り）
  inPlay: false,
  // 走者ブースト: バッター側連打で加算され、時間で減衰する追加速度（px/s）
  runnerBoost: 0,
  // 深い打球（上壁到達）: 静止後も deepHitPickupDelay 経過まで拾えない
  isDeepHit: false,
  restDelayElapsed: 0,
  // コーナー二塁打ゾーンに届いた打球（深い打球より長い遅延）
  isCornerHit: false,
  // fielder throw state
  isFielderThrow: false,
  // 送球が「生きている」か。拾って投げた瞬間に true、壁に触れた時点で false。
  // 生きた送球が塁に届いたときだけアウトになる（壁の跳ね返りでの偶然アウトを排除）。
  throwIsLive: false,
  wasPickedUp: false,
  pickupX: 0,
  pickupY: 0,
  // swing miss flag (reset per pitch)
  swingMissed: false,
};

const elements = {
  mainScreen: document.getElementById("mainScreen"),
  prototypeScreen: document.getElementById("prototypeScreen"),
  battingScreen: document.getElementById("battingScreen"),
  openPitchPrototype: document.getElementById("openPitchPrototype"),
  openBattingPrototype: document.getElementById("openBattingPrototype"),
  backButton: document.getElementById("backButton"),
  battingBackButton: document.getElementById("battingBackButton"),
  pitchSurface: document.getElementById("pitchSurface"),
  strikeZone: document.getElementById("strikeZone"),
  pitchCall: document.getElementById("pitchCall"),
  debugReleaseSpeed: document.getElementById("debugReleaseSpeed"),
  debugCurrentSpeed: document.getElementById("debugCurrentSpeed"),
  debugReleaseKmh: document.getElementById("debugReleaseKmh"),
  debugCurrentKmh: document.getElementById("debugCurrentKmh"),
  debugVelocity: document.getElementById("debugVelocity"),
  debugCurve: document.getElementById("debugCurve"),
  debugCurveAcceleration: document.getElementById("debugCurveAcceleration"),
  debugCurveBar: document.getElementById("debugCurveBar"),
  pitchTrace: document.getElementById("pitchTrace"),
  speedHistory: document.getElementById("speedHistory"),
  heightDebugBall: document.getElementById("heightDebugBall"),
  heightDebugValue: document.getElementById("heightDebugValue"),
  ball: document.getElementById("ball"),
  hintText: document.getElementById("hintText"),
  battingSurface: document.getElementById("battingSurface"),
  battingStrikeZone: document.getElementById("battingStrikeZone"),
  battingCall: document.getElementById("battingCall"),
  battingDebugRaw: document.getElementById("battingDebugRaw"),
  battingDebugKmh: document.getElementById("battingDebugKmh"),
  battingDebugSwing: document.getElementById("battingDebugSwing"),
  battingDebugPower: document.getElementById("battingDebugPower"),
  battingDebugSwingGate: document.getElementById("battingDebugSwingGate"),
  battingSwingBar: document.getElementById("battingSwingBar"),
  battingDebugBallSpeed: document.getElementById("battingDebugBallSpeed"),
  battingBall: document.getElementById("battingBall"),
  battingContactMissMarker: document.getElementById("battingContactMissMarker"),
  batHitAngle: document.getElementById("batHitAngle"),
  batReflectAngle: document.getElementById("batReflectAngle"),
  bat: document.getElementById("bat"),
  battingHint: document.getElementById("battingHint"),
  openPlayingPrototype: document.getElementById("openPlayingPrototype"),
  openPlayingPrototype3: document.getElementById("openPlayingPrototype3"),
  playingScreen: document.getElementById("playingScreen"),
  playingSurface: document.getElementById("playingSurface"),
  playingStrikeZone: document.getElementById("playingStrikeZone"),
  playingCall: document.getElementById("playingCall"),
  playingDebugKmh: document.getElementById("playingDebugKmh"),
  playingDebugBallSpeed: document.getElementById("playingDebugBallSpeed"),
  playingDebugSwingGate: document.getElementById("playingDebugSwingGate"),
  playingBall: document.getElementById("playingBall"),
  playingBallTail: document.getElementById("playingBallTail"),
  runnerBoostArea: document.getElementById("runnerBoostArea"),
  runnerBoostGaugeFill: document.getElementById("runnerBoostGaugeFill"),
  playingContactMissMarker: document.getElementById("playingContactMissMarker"),
  playingBatHitAngle: document.getElementById("playingBatHitAngle"),
  playingBatReflectAngle: document.getElementById("playingBatReflectAngle"),
  playingBat: document.getElementById("playingBat"),
  playingHint: document.getElementById("playingHint"),
  playingDivider: document.getElementById("playingDivider"),
  playingLabelPitcher: document.getElementById("playingLabelPitcher"),
  playingLabelBatter: document.getElementById("playingLabelBatter"),
  playingRunLabel: document.getElementById("playingRunLabel"),
  playingTopWall: document.getElementById("playingTopWall"),
  playingMound: document.getElementById("playingMound"),
  playingHomeBase: document.getElementById("playingHomeBase"),
  playingBase0: document.getElementById("playingBase0"),
  playingBase1: document.getElementById("playingBase1"),
  playingBase2: document.getElementById("playingBase2"),
  playingRunner0: document.getElementById("playingRunner0"),
  playingRunner1: document.getElementById("playingRunner1"),
  playingRunner2: document.getElementById("playingRunner2"),
  playingRunner3: document.getElementById("playingRunner3"),
  playingRunnerRing0: document.getElementById("playingRunnerRing0"),
  playingRunnerRing1: document.getElementById("playingRunnerRing1"),
  playingRunnerRing2: document.getElementById("playingRunnerRing2"),
  playingRunnerRing3: document.getElementById("playingRunnerRing3"),
  playingTagLabel: document.getElementById("playingTagLabel"),
  playingBatterFinger: document.getElementById("playingBatterFinger"),
  // game UI
  playingStatusBar: document.getElementById("playingStatusBar"),
  statusScoreBlue: document.getElementById("statusScoreBlue"),
  statusScoreRed: document.getElementById("statusScoreRed"),
  statusTeamBlue: document.getElementById("statusTeamBlue"),
  statusTeamRed: document.getElementById("statusTeamRed"),
  statusB0: document.getElementById("statusB0"),
  statusB1: document.getElementById("statusB1"),
  statusB2: document.getElementById("statusB2"),
  statusS0: document.getElementById("statusS0"),
  statusS1: document.getElementById("statusS1"),
  statusO0: document.getElementById("statusO0"),
  statusO1: document.getElementById("statusO1"),
  statusInning: document.getElementById("statusInning"),
  playingOverlay: document.getElementById("playingOverlay"),
  overlayMessage: document.getElementById("overlayMessage"),
  overlaySub: document.getElementById("overlaySub"),
  overlayButton: document.getElementById("overlayButton"),
  playingAreaTop: document.getElementById("playingAreaTop"),
  playingAreaBottom: document.getElementById("playingAreaBottom"),
  playingResetBtn: document.getElementById("playingResetBtn"),
};

// ---- Game State ----
const gameState = {
  inning: 1,
  isTop: true,         // true=表(青軍攻撃), false=裏(赤軍攻撃)
  outs: 0,
  balls: 0,
  strikes: 0,
  score: [0, 0],       // [青軍, 赤軍]
  inningScores: Array.from({ length: 9 }, () => [0, 0]),
  phase: "pregame",    // "pregame"|"playing"|"change"|"gameset"
  maxInnings: 9,
  playToken: 0,
};

function resetGameState() {
  gameState.playToken++;
  gameState.inning = 1;
  gameState.isTop = true;
  gameState.outs = 0;
  gameState.balls = 0;
  gameState.strikes = 0;
  gameState.score = [0, 0];
  gameState.inningScores = Array.from({ length: 9 }, () => [0, 0]);
  gameState.phase = "pregame";
}

function shouldEndOnWalkoff() {
  return !gameState.isTop &&
    gameState.inning === gameState.maxInnings &&
    gameState.score[1] > gameState.score[0];
}

function hasPendingHomeRunScores() {
  return playingState.isHomeRun &&
    playingState.runners.some((runner) => runner.state === "running");
}

function resetAtBat() {
  gameState.balls = 0;
  gameState.strikes = 0;
  updateStatusBar();
}

function updateStatusBar() {
  elements.statusScoreBlue.textContent = gameState.score[0];
  elements.statusScoreRed.textContent = gameState.score[1];

  const inningLabel = `${gameState.inning}回${gameState.isTop ? "表" : "裏"}`;
  elements.statusInning.textContent = inningLabel;

  // チームのスコア表示を現在の担当エリアへ移動する
  elements.statusTeamBlue.className =
    `status-team area-score team-blue ${gameState.isTop ? "is-bottom-score is-batting" : "is-top-score"}`;
  elements.statusTeamRed.className =
    `status-team area-score team-red ${gameState.isTop ? "is-top-score" : "is-bottom-score is-batting"}`;

  // BSO ドット
  const bDots = [elements.statusB0, elements.statusB1, elements.statusB2];
  const sDots = [elements.statusS0, elements.statusS1];
  const oDots = [elements.statusO0, elements.statusO1];
  bDots.forEach((d, i) => d.classList.toggle("is-on", i < gameState.balls));
  sDots.forEach((d, i) => d.classList.toggle("is-on", i < gameState.strikes));
  oDots.forEach((d, i) => d.classList.toggle("is-on", i < gameState.outs));

  // チーム名ラベル（上半分=ピッチャーエリア、下半分=バッターエリア）
  const pitcherName = gameState.isTop ? "赤軍" : "青軍";
  const batterName  = gameState.isTop ? "青軍" : "赤軍";
  elements.playingLabelPitcher.textContent = `${pitcherName}  PITCHER`;
  elements.playingLabelBatter.textContent  = `${batterName}  BATTER`;

  // エリア着色
  const pitcherColor = gameState.isTop ? "team-red"  : "team-blue";
  const batterColor  = gameState.isTop ? "team-blue" : "team-red";
  elements.playingAreaTop.className    = `playing-area-tint is-top-area ${pitcherColor}`;
  elements.playingAreaBottom.className = `playing-area-tint is-bottom-area ${batterColor}`;
  elements.playingLabelPitcher.classList.remove("team-red", "team-blue");
  elements.playingLabelBatter.classList.remove("team-red", "team-blue");
  elements.playingLabelPitcher.classList.add(pitcherColor);
  elements.playingLabelBatter.classList.add(batterColor);
}

function gameProcessStrike() {
  if (gameState.phase !== "playing") return;
  gameState.strikes++;
  updateStatusBar();
  if (gameState.strikes >= 3) {
    const token = gameState.playToken;
    setTimeout(() => {
      if (token !== gameState.playToken || gameState.phase !== "playing") return;
      gameProcessOut("三振!");
    }, 600);
  } else {
    saveGameToDB();
  }
}

function gameProcessBall() {
  if (gameState.phase !== "playing") return;
  gameState.balls++;
  updateStatusBar();
  if (gameState.balls >= 4) {
    const token = gameState.playToken;
    setTimeout(() => {
      if (token !== gameState.playToken || gameState.phase !== "playing") return;
      updatePlayingCall("フォアボール", "is-ball");
      advanceRunnersOnWalk();
      resetAtBat();
      saveGameToDB();
      finishPlayingPitch("READY");
    }, 400);
  } else {
    saveGameToDB();
  }
}

function gameProcessOut(reason) {
  if (gameState.phase !== "playing") return;
  gameState.outs = Math.min(3, gameState.outs + 1);
  updateStatusBar();
  playSfx("out");
  updatePlayingCall(reason || "OUT!", "is-out");
  resetAtBat();
  saveGameToDB();
  if (gameState.outs >= 3) {
    gameState.phase = "change";
    playingState.isRunning = false;
    playingState.isBallActive = false;
    playingState.isPitched = false;
    stopPlayingAnimation();
    stopCrowdCheer();
    clearSaveData();
    const token = gameState.playToken;
    setTimeout(() => {
      if (token !== gameState.playToken || gameState.phase !== "change") return;
      gameDoChange();
    }, 1000);
  }
}

function addRunForBattingTeam() {
  const teamIdx = gameState.isTop ? 0 : 1; // 表=青軍攻撃
  gameState.score[teamIdx]++;
  const inningIdx = gameState.inning - 1;
  if (inningIdx < 9) gameState.inningScores[inningIdx][teamIdx]++;
  updateStatusBar();
}

function gameProcessScore() {
  if (gameState.phase !== "playing") return;
  addRunForBattingTeam();
  saveGameToDB();
  playSfx("score");
  updatePlayingCall("得点！", "is-strike");
  if (shouldEndOnWalkoff() && !hasPendingHomeRunScores()) {
    gameDoGameSet();
    return;
  }
  setTimeout(() => {
    if (elements.playingCall.textContent === "得点！") updatePlayingCall("READY");
  }, 1500);
}

function gameDoChange() {
  if (gameState.phase !== "playing" && gameState.phase !== "change") return;
  gameState.phase = "change";

  // チェンジ: プレイを停止してオーバーレイ表示
  playingState.isRunning = false;
  stopPlayingAnimation();
  resetPlayingState();

  stopCrowdCheer();
  playSoundChime();
  showOverlay("CHANGE!", "", false);
  setTimeout(() => {
    hideOverlay();
    // 表→裏 or 裏→次回
    if (gameState.isTop) {
      gameState.isTop = false;
      // 最終回裏: 負けてる側がピッチャー（赤軍が攻撃）→ 赤軍がすでにリードならゲームセット
      if (gameState.inning === gameState.maxInnings && gameState.score[1] > gameState.score[0]) {
        gameDoGameSet();
        return;
      }
    } else {
      gameState.inning++;
      gameState.isTop = true;
      if (gameState.inning > gameState.maxInnings) {
        gameDoGameSet();
        return;
      }
    }
    gameState.outs = 0;
    gameState.balls = 0;
    gameState.strikes = 0;
    gameState.phase = "playing";
    updateStatusBar();
    saveGameToDB();
    playingState.isRunning = true;
    playingState.animationFrameId = window.requestAnimationFrame(animatePlaying);
    updatePlayingCall("READY");
  }, 1800);
}

function gameDoGameSet() {
  gameState.phase = "gameset";
  gameState.playToken++;
  clearSaveData();
  playingState.isRunning = false;
  stopPlayingAnimation();
  stopRunnerLoop();
  stopHomerunLoop();
  playSfx("gameEnd");
  const [blue, red] = gameState.score;
  let winner;
  if (blue > red) winner = "青軍の勝ち！";
  else if (red > blue) winner = "赤軍の勝ち！";
  else winner = "引き分け！";
  showOverlay("GAME SET!", `青軍 ${blue} - ${red} 赤軍\n${winner}`, true);
}

function showOverlay(message, sub, showButton) {
  elements.overlayMessage.textContent = message;
  elements.overlaySub.textContent = sub;
  elements.overlayButton.classList.toggle("is-hidden", !showButton);
  elements.playingOverlay.classList.remove("is-hidden");
}

function hideOverlay() {
  elements.playingOverlay.classList.add("is-hidden");
}

const physics = {
  speedScale: 1.0,
  dragPerSecond: 1.2,
  sideDragPerSecond: 2.4,
  minForwardSpeed: 180,
  maxForwardSpeed: 840,
  maxSideSpeed: 240,
  bounceForwardLoss: 0.72,
  bounceForwardBoost: 90,
  maxBounces: 3,
  rollTriggerSpeed: 255,
  rollBaseSpeed: 170,
  rollSpeedFactor: 0.18,
  rollDragPerSecond: 2.6,
  rollStopSpeed: 8,
  rollTopBand: 56,
  curveMaxAcceleration: 650,
  curveMinDuration: 0.22,
  curveMaxDuration: 1.25,
  curveSpeedReference: 700,
  softReleaseSpeed: 110,
  softReleaseForwardSpeed: 150,
  releaseHeight: 42,
  releaseHeightSpeedFactor: 0.003,
  heightGravity: 220,
  bounceHeightLoss: 0.35,
  minBounceUpVelocity: 52,
  battingMinRawSpeed: 3000,
  battingMaxRawSpeed: 4500,
  battingSpeedScale: 0.18,
  battingContactTopAllowance: 4,
  battingSwingThreshold: 330,
  battingSwingDuration: 0.065,
  batContactRadius: 35,
  battingHitDragPerSecond: 1.1,
  // 「デッドボール」の表示時間（ms）。カウントが動かず得点だけ入る特殊な結果なので、
  // 見落とさないよう他のコールよりかなり長く出す。
  deadBallCallHoldMs: 3600,
  // デッドボール判定の半径（px）。バッターの指に出る輪の見た目と同じ値を使う。
  deadBallRadius: 26,
  // 得点が飛んでいく演出の時間（ms）
  deadBallPointFlightMs: 700,
  // 投げミス（ピッチャーエリアを出られなかった投球）後、投げ直しを受け付けるまでの間隔（ms）。
  // 何も起きなかった扱いなので、通常のプレー終了より短くしてテンポを切らさない。
  pitchMissRetryDelayMs: 350,
  // 拾って走者を刺しにいく送球の球速倍率。投球と打球は等倍のまま。
  // 速度と減衰を同率で落とすので、届く距離は変わらず到達までの時間だけ 1/倍率 に延びる。
  fielderThrowSpeedFactor: 0.6,
  battingStopSpeed: 18,
  battingRestSpeed: 90,
  battingEdgeBounceRestitution: 0.62,
  // フィールダー送球が壁に当たったときの反発。打球（0.62）よりずっと低く、
  // 跳ね返らずにその場へ落ちる。壁を使った偶然の送球が成立しないようにする。
  fielderThrowEdgeBounceRestitution: 0.16,
  // 強い打球（青表示）の速度しきい値。見た目のみで、ホームラン判定には使わない。
  homeRunSpeedThreshold: 200,
  // ホームランに必要な「上壁到達時の残り飛距離 ÷ 本塁〜上壁の距離」。
  // 盤面に対する比で判定することで、画面の高さが変わっても難度が変わらない。
  homeRunClearRatio: 0.18,
  // ホームランに必要な当たりの質（芯度×スクエア度、0〜1）。
  // 打球速度は px/s の絶対値なので、盤面が小さい画面ほど上の比率条件は緩くなる。
  // 無次元の当たりの質でも門番することで、画面サイズによらず「芯で捉えた一撃」に絞る。
  homeRunHitQuality: 0.8,
  ballRadius: 7,
  batHitPowerScale: 0.55,
  batMoveScale: 1,
  batMoveYScale: 1,
  batVerticalRangeRatio: 2,
  batDownRangeScale: 1.5,
  batLength: 59,
  batRestAngle: Math.PI / 8,
  batMaxLoadAngle: Math.PI / 2.4,
  batLoadDragDistance: 170,
  // フィールダーがボールをピックアップ後に引っ張れる最大距離（これ以上は弾くしかできない）
  fielderPickupMaxDrag: 72,
  // スイング角度のアナログばらつき（ラジアン）
  battingSwingAngleVariation: 0.05,
  // スイング後の接触猶予時間（秒）
  // スイング時間 0.065 と合わせて約 0.15 秒の接触ウィンドウになる（振り遅れ／早振りの緩和）
  battingSwingLingerDuration: 0.085,
  // 打球カーブ継承時の減衰レート（1/秒）
  hitBallCurveDecayRate: 1.5,
  // 打球カーブ適用の最小加速度閾値
  hitBallCurveThreshold: 0.5,
  // 走者の基本速度（px/s）: タップしないと割と遅い
  runnerBaseSpeed: 78,
  // フォアボール自動進塁の速度（px/s）: タップ無効なので待たせないよう速め
  walkAdvanceSpeed: 124,
  // 走者ブースト: バッター側の連打1回あたりの加速量（px/s）
  // 上限78に対して1タップ17 → 満タンに5連打、維持に秒3回程度の本当の連打が必要
  runnerBoostPerTap: 17,
  // 走者ブーストの上限（px/s）: 基本78+上限78=最大156px/s
  runnerBoostMax: 78,
  // 走者ブーストの減衰速度（px/s^2）: 連打の手応えを残すため緩やかに落とす
  runnerBoostDecayPerSecond: 46,
  // アウト発生時に残った走者へ与えるブースト（上限に対する比率）
  // 「1つアウトが出ると芋づるで全員アウト」を走者側の反撃で抑える
  runnerBoostOnOutRatio: 0.55,
  // プレー終了後に次の投球を受け付けるまでのクールダウン（ms）
  playEndPitchCooldownMs: 900,
  // 深い打球（上壁到達）が静止後に拾えるようになるまでの遅延（秒）
  deepHitPickupDelay: 0.7,
  // 速度テールの長さ係数と最大長（px）
  ballTailLengthScale: 0.14,
  ballTailMaxLength: 110,
  ballTailMinSpeed: 140,
  // コーナー二塁打ゾーン: 上壁沿い左右コーナーの幅（画面幅比）と高さ（px）
  cornerZoneWidthRatio: 0.2,
  cornerZoneHeight: 70,
  // コーナーゾーンに届いた打球が拾えるまでの遅延（秒）: 深い打球よりさらに長い
  cornerZonePickupDelay: 1.2,
  // --- ピッチャーマウンド ---
  // 通常投球はこの円の中からしか開始できない。ゲームの流れの中での
  // 意図しないタップが投球開始になってしまうのを防ぐ。
  // 中心円は塁（18px）の倍くらい、周囲の円はやや大きく取る。
  moundCenterRadius: 18,
  moundRadius: 46,
  // マウンドの奥行き。0=2塁の位置、1=ディバイダー（バッター側の境界）。
  // 小さいほどバッターから遠ざかる。
  moundDepthRatio: 0.3,
  // --- 投球のエリア越え許容 ---
  // ピッチャーエリアを超える長いスワイプは指が終端で自然に緩むため、
  // 直近 35ms だけを見ると球速がほぼゼロになり「失速」して見える。
  // 直近 pitchReleaseGraceMs の中の最速サンプルを拾い、その pitchReleaseGraceRatio まで戻す。
  pitchReleaseGraceMs: 140,
  pitchReleaseGraceRatio: 0.82,
  // リリース位置がエリアを外れても、投げ始めた位置からの距離で山なりの高さを決める。
  // これにより深いリリースでも地面近くの追加ドラッグ帯に早々と落ちない。
  pitchArcOriginRatio: 0.72,
  // 着地間際に掛かる追加ドラッグ（1/秒）。大きいほど手前で失速する。
  pitchGroundDragPerSecond: 0.9,
};

function updateHeightDebug() {
  const clampedHeight = Math.max(0, Math.min(state.height, 72));
  const verticalOffset = (clampedHeight / 72) * 112;
  elements.heightDebugBall.style.transform = `translate(-50%, ${-verticalOffset}px)`;
  elements.heightDebugValue.textContent = clampedHeight.toFixed(1);
}

function normalizeVector(x, y, fallbackX = 0, fallbackY = -1) {
  const magnitude = Math.hypot(x, y);

  if (magnitude < 0.0001) {
    return { x: fallbackX, y: fallbackY };
  }

  return {
    x: x / magnitude,
    y: y / magnitude,
  };
}

function compressScreenVelocity(value, limit) {
  return Math.tanh(value / limit) * limit;
}

function rawToKmh(rawSpeed) {
  return (rawSpeed / 4000) * 100;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

function getTrailCurve(trail) {
  if (trail.length < 4) {
    return 0;
  }

  const segments = [];

  for (let index = 1; index < trail.length; index += 1) {
    const previous = trail[index - 1];
    const next = trail[index];
    const dx = next.x - previous.x;
    const dy = next.y - previous.y;
    const length = Math.hypot(dx, dy);

    if (length < 3) {
      continue;
    }

    segments.push({
      x: dx / length,
      y: dy / length,
      length,
    });
  }

  if (segments.length < 2) {
    return 0;
  }

  let signedTurn = 0;
  let totalDistance = segments[0].length;

  for (let index = 1; index < segments.length; index += 1) {
    const previous = segments[index - 1];
    const next = segments[index];
    const cross = previous.x * next.y - previous.y * next.x;
    const dot = previous.x * next.x + previous.y * next.y;
    const segmentWeight = Math.min(1, Math.min(previous.length, next.length) / 18);

    signedTurn += Math.atan2(cross, dot) * segmentWeight;
    totalDistance += next.length;
  }

  const firstPoint = trail[0];
  const lastPoint = trail[trail.length - 1];
  const directDistance = Math.hypot(lastPoint.x - firstPoint.x, lastPoint.y - firstPoint.y);
  const bendRatio = directDistance > 0 ? clamp(totalDistance / directDistance - 1, 0, 1) : 1;

  return clamp((signedTurn / Math.PI) * (0.35 + bendRatio * 0.65), -1, 1);
}

function getTrailReleaseVector(trail, sampleAgeMs = 35) {
  if (trail.length < 2) {
    return null;
  }

  const lastPoint = trail[trail.length - 1];
  let basePoint = trail[0];

  for (let index = trail.length - 2; index >= 0; index -= 1) {
    const candidate = trail[index];

    if (lastPoint.timeStamp - candidate.timeStamp >= sampleAgeMs) {
      basePoint = candidate;
      break;
    }
  }

  const deltaTime = Math.max(lastPoint.timeStamp - basePoint.timeStamp, 16);
  const deltaX = lastPoint.x - basePoint.x;
  const deltaY = lastPoint.y - basePoint.y;

  return {
    deltaX,
    deltaY,
    velocityX: (deltaX / deltaTime) * 1000,
    velocityY: (deltaY / deltaTime) * 1000,
    speed: (Math.hypot(deltaX, deltaY) / deltaTime) * 1000,
    curve: getTrailCurve(trail),
  };
}

// リリース直前で指が緩んでも球速を維持するための許容付きリリースベクトル。
// 直近 graceMs の範囲で最も速かったサンプル窓を探し、終端サンプルがそれより
// 大きく遅い場合だけ、その最速窓の向き・速度（の graceRatio 倍）を採用する。
// ピッチャーエリアを超える長いスワイプは終端で必ず減速するため、この許容がないと
// 「エリアを超えて投げると失速する」挙動になる。
function getTrailReleaseVectorWithGrace(trail, sampleAgeMs, graceMs, graceRatio) {
  const base = getTrailReleaseVector(trail, sampleAgeMs);

  if (!base || trail.length < 3) {
    return base;
  }

  const lastPoint = trail[trail.length - 1];
  let best = null;

  for (let end = trail.length - 1; end >= 1; end -= 1) {
    if (lastPoint.timeStamp - trail[end].timeStamp > graceMs) {
      break;
    }

    for (let start = end - 1; start >= 0; start -= 1) {
      if (trail[end].timeStamp - trail[start].timeStamp < sampleAgeMs && start > 0) {
        continue;
      }

      const deltaTime = Math.max(trail[end].timeStamp - trail[start].timeStamp, 16);
      const deltaX = trail[end].x - trail[start].x;
      const deltaY = trail[end].y - trail[start].y;
      const speed = (Math.hypot(deltaX, deltaY) / deltaTime) * 1000;

      if (!best || speed > best.speed) {
        best = { deltaX, deltaY, deltaTime, speed };
      }
      break;
    }
  }

  if (!best) {
    return base;
  }

  const graceSpeed = best.speed * graceRatio;

  if (base.speed >= graceSpeed || best.speed < 0.0001) {
    return base;
  }

  return {
    deltaX: best.deltaX,
    deltaY: best.deltaY,
    velocityX: (best.deltaX / best.deltaTime) * 1000 * graceRatio,
    velocityY: (best.deltaY / best.deltaTime) * 1000 * graceRatio,
    speed: graceSpeed,
    curve: base.curve,
  };
}

function createSoftReleaseVectorFrom(vector) {
  const forwardSpeed = physics.softReleaseForwardSpeed * physics.speedScale;

  if (vector) {
    const rawSpeed = Math.hypot(vector.velocityX, vector.velocityY);
    if (rawSpeed > 10) {
      const nx = vector.velocityX / rawSpeed;
      const ny = vector.velocityY / rawSpeed;
      return {
        deltaX: vector.deltaX,
        deltaY: vector.deltaY,
        velocityX: nx * forwardSpeed,
        velocityY: ny * forwardSpeed,
        speed: forwardSpeed,
        curve: 0,
      };
    }
  }

  return {
    deltaX: 0,
    deltaY: 6,
    velocityX: 0,
    velocityY: forwardSpeed,
    speed: forwardSpeed,
    curve: 0,
  };
}

function getZoneRect(surfaceElement, zoneElement) {
  const surfaceRect = surfaceElement.getBoundingClientRect();
  const zoneRect = zoneElement.getBoundingClientRect();

  return {
    left: zoneRect.left - surfaceRect.left,
    right: zoneRect.right - surfaceRect.left,
    top: zoneRect.top - surfaceRect.top,
    bottom: zoneRect.bottom - surfaceRect.top,
  };
}

function getZonePathCall(previousX, previousY, nextX, nextY, zone, direction, hasBounced = false) {
  const lineY = direction === "down" ? zone.top : zone.bottom;
  const crossedZone =
    direction === "down"
      ? previousY < lineY && nextY >= lineY
      : previousY > lineY && nextY <= lineY;

  if (!crossedZone) {
    return null;
  }

  const deltaY = nextY - previousY;

  if (Math.abs(deltaY) < 0.0001) {
    return null;
  }

  const ratio = (lineY - previousY) / deltaY;
  const lineX = previousX + (nextX - previousX) * ratio;

  return lineX >= zone.left && lineX <= zone.right && !hasBounced ? "strike" : "ball";
}

function clampPitchModelVelocityToSpeed(model, maxSpeed) {
  const currentSpeed = Math.hypot(model.velocityX, model.velocityY);

  if (currentSpeed <= maxSpeed || currentSpeed < 0.0001) {
    return;
  }

  const scale = maxSpeed / currentSpeed;
  model.velocityX *= scale;
  model.velocityY *= scale;
}

function launchPitchModel(model, vector, zone, options = {}) {
  model.motionMode = "flight";
  model.pitchJudged = false;
  model.bounceCount = 0;
  model.lastTick = 0;
  model.rollDirection = vector.velocityX >= 0 ? 1 : -1;

  const releaseDirection = normalizeVector(
    vector.velocityX,
    vector.velocityY,
    model.rollDirection,
    options.forwardFallbackY ?? 1,
  );
  model.releaseDirectionX = releaseDirection.x;
  model.releaseDirectionY = releaseDirection.y;
  model.releaseCurve = clamp(vector.curve || 0, -1, 1);

  const scaledVelocityX = vector.velocityX * physics.speedScale;
  const scaledVelocityY = vector.velocityY * physics.speedScale;
  const scaledSpeed = vector.speed * physics.speedScale;
  const curveSpeedFactor = clamp(scaledSpeed / physics.curveSpeedReference, 0.7, 3.2);
  model.curveAccelerationX = model.releaseCurve * physics.curveMaxAcceleration * curveSpeedFactor;
  model.curveRampDuration = clamp(
    physics.curveMaxDuration / curveSpeedFactor,
    physics.curveMinDuration,
    physics.curveMaxDuration,
  );

  const rdX = model.releaseDirectionX;
  const rdY = model.releaseDirectionY;
  const scaledForward = scaledVelocityX * rdX + scaledVelocityY * rdY;
  const scaledSide = scaledVelocityX * (-rdY) + scaledVelocityY * rdX;
  const forwardV = compressScreenVelocity(scaledForward, physics.maxForwardSpeed);
  const sideV = compressScreenVelocity(scaledSide * 0.45, physics.maxSideSpeed);
  model.velocityX = forwardV * rdX + sideV * (-rdY);
  model.velocityY = forwardV * rdY + sideV * rdX;

  const screenSpeed = Math.hypot(model.velocityX, model.velocityY);
  if (screenSpeed > 0.001 && screenSpeed < physics.minForwardSpeed) {
    const minScale = physics.minForwardSpeed / screenSpeed;
    model.velocityX *= minScale;
    model.velocityY *= minScale;
  }

  // 球速倍率。速度と減衰を同率で落とすと、到達距離（速度÷減衰）を保ったまま
  // 軌道が時間方向へ引き伸ばされる。速度だけ落とすと届く距離まで縮んでしまう。
  const speedFactor = options.speedFactor ?? 1;
  if (speedFactor !== 1) {
    model.velocityX *= speedFactor;
    model.velocityY *= speedFactor;
  }
  // 打球・送球の減衰（animatePlaying の isHit / isFielderThrow 側で使う）
  model.hitDrag = physics.battingHitDragPerSecond * speedFactor;

  model.flightGravity = Math.max(120, physics.heightGravity - Math.min(90, scaledSpeed * 0.018));

  const baseHeight = Math.min(92, physics.releaseHeight + scaledSpeed * physics.releaseHeightSpeedFactor * 2.2);
  const zoneCenterX = (zone.left + zone.right) * 0.5;
  const zoneCenterY = (zone.top + zone.bottom) * 0.5;
  const distToZone = Math.max(0, (zoneCenterX - model.ballX) * rdX + (zoneCenterY - model.ballY) * rdY);
  const travelSpeed = Math.hypot(model.velocityX, model.velocityY);
  const drag = physics.dragPerSecond;
  const arcHeightForDistance = (distance) =>
    travelSpeed > distance * drag
      ? 0.5 * model.flightGravity * (-Math.log(1 - (distance * drag) / travelSpeed) / drag) ** 2 * 1.1
      : 0;

  let minHeightForZone = arcHeightForDistance(distToZone);

  // 投げ始めた位置（＝ピッチャーエリア内）からの距離でも山なりを見積もり、高いほうを採る。
  // リリース点がエリアを外れて深くなっても、投球はきちんと浮いたまま届く。
  if (options.arcOriginX !== undefined && options.arcOriginY !== undefined) {
    const originDist = Math.max(
      0,
      (zoneCenterX - options.arcOriginX) * rdX + (zoneCenterY - options.arcOriginY) * rdY,
    );
    minHeightForZone = Math.max(
      minHeightForZone,
      arcHeightForDistance(originDist * physics.pitchArcOriginRatio),
    );
  }

  model.initialHeight = Math.min(400, Math.max(baseHeight, minHeightForZone));
  model.height = model.initialHeight;
  model.heightVelocity = 0;
  model.flightElapsed = 0;
  model.bounceMinTime = 0.38 + Math.min(0.22, scaledSpeed / 12000);
  model.currentSpeed = options.useRawCurrentSpeed ? scaledSpeed : Math.hypot(model.velocityX, model.velocityY);

  return {
    scaledSpeed,
    screenSpeed: Math.hypot(model.velocityX, model.velocityY),
  };
}

function applyPitchModelBounce(model, zone, options = {}) {
  if (model.bounceCount >= physics.maxBounces) {
    model.height = 0;
    model.heightVelocity = 0;
    return false;
  }

  const preBounceSpeed = Math.hypot(model.velocityX, model.velocityY);
  const impactVelocity = Math.abs(model.heightVelocity);
  const zoneCenterX = (zone.left + zone.right) * 0.5;
  const escapeDirection = model.ballX <= zoneCenterX ? -1 : 1;

  model.height = 0;
  if (!options.noJudge) model.pitchJudged = true;

  const impactRatio = Math.min(1, impactVelocity / 260);
  const dynamicForwardLoss = physics.bounceForwardLoss * (1 - impactRatio * 0.22);
  const newSpeed = Math.max(preBounceSpeed * dynamicForwardLoss, physics.minForwardSpeed);
  const dirX = preBounceSpeed > 0.001 ? model.velocityX / preBounceSpeed : 0;
  const dirY = preBounceSpeed > 0.001 ? model.velocityY / preBounceSpeed : 0;
  model.velocityX = dirX * newSpeed;
  model.velocityY = dirY * newSpeed;

  const deflectionMag = Math.min(50, preBounceSpeed * 0.18);
  model.velocityX += -dirY * deflectionMag * escapeDirection;
  model.velocityY += dirX * deflectionMag * escapeDirection;
  clampPitchModelVelocityToSpeed(model, preBounceSpeed * 0.9);
  model.currentSpeed = Math.hypot(model.velocityX, model.velocityY);

  if (impactVelocity < physics.minBounceUpVelocity) {
    model.heightVelocity = 0;
    if (options.startRolling) {
      options.startRolling();
    }
    return true;
  }

  model.heightVelocity = impactVelocity * physics.bounceHeightLoss;
  model.bounceCount += 1;
  return true;
}

function startPitchModelRolling(model) {
  if (model.motionMode === "rolling") {
    return;
  }

  const preRollSpeed = Math.hypot(model.velocityX, model.velocityY);
  model.motionMode = "rolling";
  model.height = 0;
  model.heightVelocity = 0;

  const rdX = model.releaseDirectionX;
  const rdY = model.releaseDirectionY;
  const currentDirection = normalizeVector(model.velocityX, model.velocityY, rdX, rdY);
  const releaseDirection = normalizeVector(rdX, rdY, model.rollDirection, rdY);
  const sideFallback = Math.sign(releaseDirection.x || currentDirection.x || model.rollDirection);
  const blendedDirection = normalizeVector(
    currentDirection.x * 0.45 + releaseDirection.x * 1.5 + sideFallback * 0.4,
    currentDirection.y * 0.52 + releaseDirection.y * 0.7,
    sideFallback,
    rdY,
  );
  const rollSpeed = Math.max(
    physics.rollBaseSpeed,
    Math.min(physics.rollBaseSpeed + model.currentSpeed * physics.rollSpeedFactor, 300),
  );

  model.velocityX = rollSpeed * blendedDirection.x;
  model.velocityY = rollSpeed * blendedDirection.y;
  clampPitchModelVelocityToSpeed(model, preRollSpeed);
  model.currentSpeed = Math.hypot(model.velocityX, model.velocityY);
}

function getDefaultBatModelPosition(surfaceElement, getZone) {
  const rect = surfaceElement.getBoundingClientRect();
  const zone = getZone();
  const zoneCenterX = (zone.left + zone.right) * 0.5;
  const x = clamp(zoneCenterX - physics.batLength * 0.5, 16, rect.width - physics.batLength - 16);
  const y = (zone.top + zone.bottom) * 0.5;

  return { x, y };
}

function placeBatModelOnSwingLine(model, surfaceElement, getZone, setPosition, pointerX = null, pointerY = null) {
  const rect = surfaceElement.getBoundingClientRect();
  const zone = getZone();
  const x =
    pointerX === null
      ? model.batBaseX
      : model.batBaseX + (pointerX - model.batPointerStartX) * physics.batMoveScale;
  const clampedX = clamp(x, 12, rect.width - physics.batLength - 12);
  const zoneHeight = zone.bottom - zone.top;
  const verticalHalfRange = (zoneHeight * physics.batVerticalRangeRatio) * 0.5;
  const y =
    pointerY === null
      ? model.batBaseY
      : model.batBaseY + (pointerY - model.batPointerStartY) * physics.batMoveYScale;
  const zoneCenterY = (zone.top + zone.bottom) * 0.5;
  const clampedY = clamp(y, model.batBaseY - verticalHalfRange, model.batBaseY + verticalHalfRange * physics.batDownRangeScale);
  const loadRatio =
    pointerY === null ? 0 : clamp((pointerY - model.batPointerStartY) / physics.batLoadDragDistance, 0, 1);
  const readyAngle =
    physics.batRestAngle + (physics.batMaxLoadAngle - physics.batRestAngle) * loadRatio;
  model.batReadyAngle = readyAngle;
  setPosition(clampedX, clampedY, readyAngle);
}

function startBatModelSwing(model, batElement, vector) {
  if (model.isSwinging) {
    return false;
  }

  model.isSwinging = true;
  model.swingTimer = physics.battingSwingDuration;
  model.swingElapsed = 0;
  model.swingStartAngle = model.batReadyAngle || physics.batRestAngle;
  // 速いスイングほど振り抜き角度が大きくなる（アナログ感）+ 小さなランダムばらつき
  const swingSpeedAboveThreshold = Math.max(0, vector.speed - physics.battingSwingThreshold);
  const swingSpeedRatio = clamp(swingSpeedAboveThreshold / physics.battingSwingThreshold, 0, 1);
  const swingAnalogVariation = (Math.random() - 0.5) * physics.battingSwingAngleVariation;
  model.swingEndAngle = -(model.swingStartAngle + swingSpeedRatio * 0.15 + swingAnalogVariation);
  model.swingVelocityX = vector.velocityX;
  model.swingVelocityY = vector.velocityY;
  model.swingMoveVelocityX = vector.velocityX * physics.batMoveScale;
  model.swingMoveVelocityY = vector.velocityY * physics.batMoveYScale;
  model.swingSpeed = vector.speed;
  model.swingAngularSpeed =
    Math.abs(model.swingEndAngle - model.swingStartAngle) / physics.battingSwingDuration;
  model.swingPower = 0;
  batElement.classList.add("is-swinging");
  batElement.classList.remove("is-hit");
  return true;
}

function distanceToBatModelSegment(model, x, y) {
  const closest = getBatModelClosestPoint(model, x, y);

  return Math.hypot(x - closest.x, y - closest.y);
}

function checkBatModelContact(model, prevX, prevY) {
  // Exact swept collision: min distance between ball-path segment and bat segment
  const bax = model.batX;
  const bay = model.batY;
  const bbx = bax + Math.cos(model.batAngle) * physics.batLength;
  const bby = bay + Math.sin(model.batAngle) * physics.batLength;

  function ptSeg(px, py, ax, ay, bx, by) {
    const dx = bx - ax, dy = by - ay;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return Math.hypot(px - ax, py - ay);
    const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lenSq));
    return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
  }

  // Segment intersection check (if ball path crosses bat → instant hit)
  const d1x = model.ballX - prevX, d1y = model.ballY - prevY;
  const d2x = bbx - bax, d2y = bby - bay;
  const denom = d1x * d2y - d1y * d2x;
  if (Math.abs(denom) > 1e-10) {
    const t = ((bax - prevX) * d2y - (bay - prevY) * d2x) / denom;
    const u = ((bax - prevX) * d1y - (bay - prevY) * d1x) / denom;
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) return true;
  }

  const minDist = Math.min(
    ptSeg(prevX, prevY, bax, bay, bbx, bby),
    ptSeg(model.ballX, model.ballY, bax, bay, bbx, bby),
    ptSeg(bax, bay, prevX, prevY, model.ballX, model.ballY),
    ptSeg(bbx, bby, prevX, prevY, model.ballX, model.ballY),
  );
  return minDist <= physics.batContactRadius;
}

function getBatModelClosestPoint(model, x, y) {
  const ax = model.batX;
  const ay = model.batY;
  const bx = ax + Math.cos(model.batAngle) * physics.batLength;
  const by = ay + Math.sin(model.batAngle) * physics.batLength;
  const dx = bx - ax;
  const dy = by - ay;
  const lengthSquared = dx * dx + dy * dy;
  const ratio = lengthSquared > 0 ? clamp(((x - ax) * dx + (y - ay) * dy) / lengthSquared, 0, 1) : 0;
  const closestX = ax + dx * ratio;
  const closestY = ay + dy * ratio;

  return { x: closestX, y: closestY };
}

function getBatModelHitRatio(model, x, y) {
  const ax = model.batX;
  const ay = model.batY;
  const bx = ax + Math.cos(model.batAngle) * physics.batLength;
  const by = ay + Math.sin(model.batAngle) * physics.batLength;
  const dx = bx - ax;
  const dy = by - ay;
  const lengthSquared = dx * dx + dy * dy;

  return lengthSquared > 0 ? clamp(((x - ax) * dx + (y - ay) * dy) / lengthSquared, 0, 1) : 0;
}

function reflectBallFromBatModel(model, options) {
  const batDirection = normalizeVector(Math.cos(model.batAngle), Math.sin(model.batAngle), 1, 0);
  let normalX = -batDirection.y;
  let normalY = batDirection.x;
  let incomingDot = model.velocityX * normalX + model.velocityY * normalY;

  if (incomingDot > 0) {
    normalX *= -1;
    normalY *= -1;
    incomingDot = -incomingDot;
  }

  const reflectedX = model.velocityX - 2 * incomingDot * normalX;
  const reflectedY = model.velocityY - 2 * incomingDot * normalY;
  const reflectedMag = Math.hypot(reflectedX, reflectedY);

  const swingDirection = normalizeVector(model.swingVelocityX, model.swingVelocityY, 0, -1);
  const hitRatio = getBatModelHitRatio(model, model.ballX, model.ballY);
  const radius = physics.batLength * hitRatio;
  const angularDirection = model.swingEndAngle >= model.swingStartAngle ? 1 : -1;
  const signedAngularSpeed = model.swingAngularSpeed * angularDirection;
  const tangentVelocityX = -Math.sin(model.batAngle) * signedAngularSpeed * radius;
  const tangentVelocityY = Math.cos(model.batAngle) * signedAngularSpeed * radius;
  const contactVelocityX = model.swingMoveVelocityX + tangentVelocityX;
  const contactVelocityY = model.swingMoveVelocityY + tangentVelocityY;
  const localBatSpeed = Math.hypot(contactVelocityX, contactVelocityY);
  const impulse = localBatSpeed * physics.batHitPowerScale;
  model.swingPower = impulse;
  const contactDirection = normalizeVector(contactVelocityX, contactVelocityY, swingDirection.x, swingDirection.y);

  // A: バット面上の当たり位置 → 仰角に影響（上端 = フライ、下端 = ゴロ）
  const closest = getBatModelClosestPoint(model, model.ballX, model.ballY);
  const perpX = -Math.sin(model.batAngle);
  const perpY = Math.cos(model.batAngle);
  const impactOffset = ((model.ballX - closest.x) * perpX + (model.ballY - closest.y) * perpY) / physics.batContactRadius;

  // B: バット法線反射のY成分を打球方向に加味
  const normalReflectY = reflectedMag > 0 ? reflectedY / reflectedMag : 0;

  // C: スイング速度が速いほど低い弾道（ライナー）
  const speedFactor = clamp(impulse / 350, 0, 1);

  // D: 芯度（バット中央寄りで当てるほど高い）
  const sweetSpot = clamp(1 - Math.abs(hitRatio - 0.6) * 1.4, 0.35, 1);

  // E: スクエア度（バット法線と入射方向が直角に近いほど高い）
  const incomingMag = Math.hypot(model.velocityX, model.velocityY);
  const squareness = incomingMag > 0.0001
    ? clamp(Math.abs(incomingDot) / incomingMag, 0.3, 1)
    : 0.6;

  // 当たりの質（芯度×スクエア度）。芯フィードバック表示用に保存する。
  model.lastHitQuality = sweetSpot * (0.6 + 0.4 * squareness);

  // 横方向は sign に潰さず、反射ベクトルとスイング寄与を連続値としてブレンドする。
  // 反射（バット角度）の比重を上げることで、バットの構え角度と当てる位置による
  // 引っ張り/流しの意図的な打ち分けを効かせる（スイング方向は補正程度）。
  const blendX = reflectedX * 0.6 + contactDirection.x * impulse * 0.4;
  const blendY = reflectedY * 0.6 + contactDirection.y * impulse * 0.4;

  // 上下バイアス。impulse スケールに乗せて、速度感と弾道の一貫性を保つ。
  // Y軸は画面下方向が正なので、上方向に飛ばすにはマイナスに倒す。
  const verticalBiasScale = Math.max(impulse, 80);
  const launchVx = blendX;
  const launchVy = blendY
                 + normalReflectY * impulse * 0.25       // B: 法線反射Y
                 + impactOffset * verticalBiasScale * 0.45 // A: 当たり位置（下端 = ゴロ、上端 = フライ）
                 + (speedFactor - 0.3) * verticalBiasScale * 0.18; // C: 速いスイング = 低め

  // 打球速度：弱当たり（芯外し・かすり）は弱く、芯+スクエアでしっかり強くなる。
  // 下限を 150 まで下げ、強さの幅を確保。
  const launchSpeed = clamp(
    120 + impulse * sweetSpot * (0.55 + 0.55 * squareness)
        + model.currentSpeed * 0.08 * sweetSpot,
    150,
    980
  );

  const launchDirection = normalizeVector(launchVx, launchVy, 0, -1);

  model.velocityX = launchDirection.x * launchSpeed;
  model.velocityY = launchDirection.y * launchSpeed;
  model.currentSpeed = Math.hypot(model.velocityX, model.velocityY);
  model.isHit = true;
  model.pitchJudged = true;
  // 投球カーブの20%を打球に引き継ぐ（カーブ球を打つと打球もカーブする）
  model.curveAccelerationX *= 0.2;
  if (options.missMarkerElement) {
    options.missMarkerElement.classList.add("is-hidden");
  }
  options.batElement.classList.add("is-hit");
  options.hitAngleElement.classList.remove("is-hidden");
  options.hitAngleElement.style.transform = `translate(${model.batX}px, ${model.batY}px) rotate(${model.batAngle}rad)`;
  const reflectAngle = Math.atan2(model.velocityY, model.velocityX);
  options.reflectAngleElement.classList.remove("is-hidden");
  options.reflectAngleElement.style.transform = `translate(${model.ballX}px, ${model.ballY}px) rotate(${reflectAngle}rad)`;
  options.updateCall("HIT");
  if (options.hintElement) {
    options.hintElement.textContent = "HIT";
  }
}

function applyHitBallEdgeBounce(model, rect) {
  const margin = 8;
  if (model.ballX <= margin && model.velocityX < 0) {
    model.ballX = margin;
    model.velocityX *= -physics.battingEdgeBounceRestitution;
    model.velocityY *= physics.battingEdgeBounceRestitution;
  } else if (model.ballX >= rect.width - margin && model.velocityX > 0) {
    model.ballX = rect.width - margin;
    model.velocityX *= -physics.battingEdgeBounceRestitution;
    model.velocityY *= physics.battingEdgeBounceRestitution;
  }

  if (model.ballY <= margin && model.velocityY < 0) {
    model.ballY = margin;
    model.velocityY *= -physics.battingEdgeBounceRestitution;
    model.velocityX *= physics.battingEdgeBounceRestitution;
  } else if (model.ballY >= rect.height - margin && model.velocityY > 0) {
    model.ballY = rect.height - margin;
    model.velocityY *= -physics.battingEdgeBounceRestitution;
    model.velocityX *= physics.battingEdgeBounceRestitution;
  }
}

function updateContactableBall(ballElement, isContactable) {
  ballElement.classList.toggle("is-contactable", isContactable);
}

function showContactMissMarker(markerElement, x, y) {
  markerElement.classList.remove("is-hidden");
  markerElement.style.transform = `translate(${x}px, ${y}px)`;
  window.setTimeout(() => {
    markerElement.classList.add("is-hidden");
  }, 280);
}

function clampVelocityToSpeed(maxSpeed) {
  const currentSpeed = Math.hypot(state.velocityX, state.velocityY);

  if (currentSpeed <= maxSpeed || currentSpeed < 0.0001) {
    return;
  }

  const scale = maxSpeed / currentSpeed;
  state.velocityX *= scale;
  state.velocityY *= scale;
}

function updatePitchCall(text, kind = "") {
  elements.pitchCall.textContent = text;
  elements.pitchCall.classList.remove("is-strike", "is-ball");

  if (kind) {
    elements.pitchCall.classList.add(kind);
  }
}

function setBallBounced(isBounced) {
  elements.ball.classList.toggle("is-bounced", isBounced);
  elements.heightDebugBall.classList.toggle("is-bounced", isBounced);
}

function resetPitchTrace() {
  state.pitchPath = [];
  elements.pitchTrace.classList.remove("is-visible");
  elements.pitchTrace.innerHTML = "";
}

function recordPitchPath() {
  state.pitchPath.push({ x: state.ballX, y: state.ballY });
  state.pitchPath = state.pitchPath.slice(-240);
}

function showPitchTrace() {
  if (state.pitchPath.length < 2) {
    return;
  }

  const segments = [];

  for (let index = 1; index < state.pitchPath.length; index += 1) {
    const previous = state.pitchPath[index - 1];
    const next = state.pitchPath[index];
    const dx = next.x - previous.x;
    const dy = next.y - previous.y;
    const length = Math.hypot(dx, dy);

    if (length < 0.2) {
      continue;
    }

    const angle = Math.atan2(dy, dx);
    segments.push(
      `<i class="pitch-trace-segment" style="left:${previous.x.toFixed(1)}px;top:${previous.y.toFixed(
        1,
      )}px;width:${length.toFixed(1)}px;transform:rotate(${angle.toFixed(4)}rad)"></i>`,
    );
  }

  elements.pitchTrace.innerHTML = segments.join("");
  elements.pitchTrace.classList.add("is-visible");
}

function updateCurveDebug(curve) {
  const normalizedCurve = clamp(curve, -1, 1);
  const acceleration = state.isPitching
    ? state.curveAccelerationX
    : normalizedCurve * physics.curveMaxAcceleration;

  elements.debugCurve.textContent = normalizedCurve.toFixed(2);
  elements.debugCurveAcceleration.textContent = acceleration.toFixed(0);
  elements.debugCurveBar.classList.toggle("is-negative", normalizedCurve < 0);

  if (normalizedCurve < 0) {
    elements.debugCurveBar.style.left = `${50 + normalizedCurve * 50}%`;
  } else {
    elements.debugCurveBar.style.left = "50%";
  }

  elements.debugCurveBar.style.width = `${Math.abs(normalizedCurve) * 50}%`;
}

function updateDebug() {
  elements.debugReleaseSpeed.textContent = state.lastReleaseSpeed.toFixed(0);
  elements.debugCurrentSpeed.textContent = state.currentSpeed.toFixed(0);
  elements.debugReleaseKmh.textContent = rawToKmh(state.lastReleaseSpeed).toFixed(1);
  elements.debugCurrentKmh.textContent = rawToKmh(state.currentSpeed).toFixed(1);
  elements.debugVelocity.textContent = `${state.velocityX.toFixed(0)} / ${state.velocityY.toFixed(0)}`;
  updateCurveDebug(state.releaseCurve);
  const historyItems = Array.from({ length: 5 }, (_, index) => state.speedHistory[index] ?? null);

  elements.speedHistory.innerHTML = historyItems
    .map((value, index) => `<li>${index + 1}. ${value === null ? "-" : value.toFixed(0)}</li>`)
    .join("");
}

function pushSpeedHistory(value) {
  state.speedHistory.unshift(value);
  state.speedHistory = state.speedHistory.slice(0, 5);
}

function resetPitchState() {
  resetPitchTrace();
  state.motionMode = "flight";
  state.pitchJudged = false;
  state.bounceCount = 0;
  state.rollDirection = 1;
  state.releaseDirectionX = 0;
  state.releaseDirectionY = 0;
  state.releaseCurve = 0;
  state.curveAccelerationX = 0;
  state.curveRampDuration = physics.curveMaxDuration;
  state.height = 0;
  state.initialHeight = 0;
  state.heightVelocity = 0;
  state.flightGravity = physics.heightGravity;
  state.bounceMinY = 0;
  state.flightElapsed = 0;
  state.bounceMinTime = 0;
  state.lastReleaseSpeed = 0;
  state.currentSpeed = 0;
  state.velocityX = 0;
  state.velocityY = 0;
  state.lastTick = 0;
  setBallBounced(false);
  updatePitchCall("未判定");
  updateDebug();
  updateHeightDebug();
}

function getStrikeZoneRect() {
  return getZoneRect(elements.pitchSurface, elements.strikeZone);
}

function judgePitchOnPath(previousX, previousY, nextX, nextY) {
  if (state.pitchJudged) {
    return;
  }

  const zone = getStrikeZoneRect();
  const prevInZone =
    previousX >= zone.left && previousX <= zone.right && previousY >= zone.top && previousY <= zone.bottom;
  const nextInZone = nextX >= zone.left && nextX <= zone.right && nextY >= zone.top && nextY <= zone.bottom;

  if (!nextInZone) {
    return;
  }

  state.pitchJudged = true;

  if (state.bounceCount > 0 || prevInZone) {
    updatePitchCall("BALL", "is-ball");
    return;
  }

  updatePitchCall("STRIKE", "is-strike");
}

function applyTopDownBounce() {
  setBallBounced(true);
  updatePitchCall("Bound!", "is-ball");
  applyPitchModelBounce(state, getStrikeZoneRect(), { startRolling });
}

function startRolling() {
  startPitchModelRolling(state);
  updateHint("rolling");
}

function createSoftReleaseVector(vector) {
  return createSoftReleaseVectorFrom(vector);
}

// Playing prototype: forward direction is +Y (downward toward batter)
function createPlayingSoftReleaseVector(vector) {
  return createSoftReleaseVectorFrom(vector);
}

function showMainScreen() {
  stopPitchAnimation();
  stopBattingAnimation();
  stopPlayingAnimation();
  hideBall();
  hideBattingBall();
  hidePlayingBall();
  elements.prototypeScreen.classList.add("is-hidden");
  elements.battingScreen.classList.add("is-hidden");
  elements.playingScreen.classList.add("is-hidden");
  elements.mainScreen.classList.remove("is-hidden");
}

function showPrototypeScreen() {
  stopBattingAnimation();
  stopPlayingAnimation();
  elements.mainScreen.classList.add("is-hidden");
  elements.battingScreen.classList.add("is-hidden");
  elements.playingScreen.classList.add("is-hidden");
  elements.prototypeScreen.classList.remove("is-hidden");
  state.speedHistory = [];
  elements.hintText.textContent = "指を置いて位置を決めて、下にスワイプして投げる";
  resetPitchState();
}

function showBattingScreen() {
  stopPitchAnimation();
  stopPlayingAnimation();
  hideBall();
  hidePlayingBall();
  elements.mainScreen.classList.add("is-hidden");
  elements.prototypeScreen.classList.add("is-hidden");
  elements.playingScreen.classList.add("is-hidden");
  elements.battingScreen.classList.remove("is-hidden");
  resetBattingState();
  battingState.isRunning = true;
  battingState.nextPitchAt = performance.now() + 500;
  battingState.animationFrameId = window.requestAnimationFrame(animateBatting);
}

function stopPitchAnimation() {
  if (state.animationFrameId) {
    window.cancelAnimationFrame(state.animationFrameId);
    state.animationFrameId = 0;
  }

  state.isPitching = false;
}

function stopBattingAnimation() {
  if (battingState.animationFrameId) {
    window.cancelAnimationFrame(battingState.animationFrameId);
    battingState.animationFrameId = 0;
  }

  battingState.isRunning = false;
}

function showBall() {
  elements.ball.classList.remove("is-hidden");
}

function hideBall() {
  elements.ball.classList.add("is-hidden");
}

function setBallPosition(x, y) {
  state.ballX = x;
  state.ballY = y;
  elements.ball.style.transform = `translate(${x}px, ${y}px)`;
}

function getSurfacePoint(event) {
  const rect = elements.pitchSurface.getBoundingClientRect();

  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

function pushTrailPoint(x, y, timeStamp) {
  state.trail.push({ x, y, timeStamp });

  const cutoff = timeStamp - 260;
  state.trail = state.trail.filter((point) => point.timeStamp >= cutoff).slice(-18);
  state.releaseCurve = getReleaseCurve();
  updateCurveDebug(state.releaseCurve);
}

function getReleaseCurve() {
  return getTrailCurve(state.trail);
}

function getReleaseVector() {
  return getTrailReleaseVector(state.trail, 35);
}

function updateHint(text) {
  elements.hintText.textContent = text;
}

function updateBattingCall(text, kind = "") {
  elements.battingCall.textContent = text;
  elements.battingCall.classList.remove("is-strike", "is-ball");

  if (kind) {
    elements.battingCall.classList.add(kind);
  }
}

function updateBattingDebug() {
  elements.battingDebugRaw.textContent = battingState.pitchRawSpeed.toFixed(0);
  elements.battingDebugKmh.textContent = rawToKmh(battingState.pitchRawSpeed).toFixed(1);
  elements.battingDebugSwing.textContent = battingState.swingSpeed.toFixed(0);
  elements.battingDebugPower.textContent = battingState.swingPower.toFixed(0);
  elements.battingDebugSwingGate.textContent = `${battingState.swingGateSpeed.toFixed(0)} / ${physics.battingSwingThreshold}`;
  elements.battingSwingBar.style.width = `${clamp(
    (battingState.swingGateSpeed / physics.battingSwingThreshold) * 100,
    0,
    100,
  ).toFixed(1)}%`;
  elements.battingSwingBar.classList.toggle("is-ready", battingState.swingGateSpeed >= physics.battingSwingThreshold);
  elements.battingDebugBallSpeed.textContent = battingState.currentSpeed.toFixed(0);
}

function getBattingStrikeZoneRect() {
  return getZoneRect(elements.battingSurface, elements.battingStrikeZone);
}

function isBallInBattingContactBand() {
  const zone = getBattingStrikeZoneRect();

  return battingState.ballY >= zone.top - physics.battingContactTopAllowance && battingState.ballY <= zone.bottom;
}

function setBattingBallPosition(x, y) {
  battingState.ballX = x;
  battingState.ballY = y;
  elements.battingBall.style.transform = `translate(${x}px, ${y}px)`;
}

function showBattingBall() {
  elements.battingBall.classList.remove("is-hidden");
}

function hideBattingBall() {
  elements.battingBall.classList.add("is-hidden");
  updateContactableBall(elements.battingBall, false);
}

function setBatPosition(x, y, angle = battingState.batAngle) {
  battingState.batX = x;
  battingState.batY = y;
  battingState.batAngle = angle;
  elements.bat.style.transform = `translate(${x}px, ${y}px) rotate(${angle}rad)`;
}

function getDefaultBatPosition() {
  return getDefaultBatModelPosition(elements.battingSurface, getBattingStrikeZoneRect);
}

function placeBatOnSwingLine(pointerX = null, pointerY = null) {
  placeBatModelOnSwingLine(
    battingState,
    elements.battingSurface,
    getBattingStrikeZoneRect,
    setBatPosition,
    pointerX,
    pointerY,
  );
}

function hideBatDebugAngles() {
  elements.batHitAngle.classList.add("is-hidden");
  elements.batReflectAngle.classList.add("is-hidden");
  elements.battingContactMissMarker.classList.add("is-hidden");
}

function showBatHitAngle() {
  elements.batHitAngle.classList.remove("is-hidden");
  elements.batHitAngle.style.transform = `translate(${battingState.batX}px, ${battingState.batY}px) rotate(${battingState.batAngle}rad)`;
}

function showBatReflectAngle() {
  const angle = Math.atan2(battingState.velocityY, battingState.velocityX);
  elements.batReflectAngle.classList.remove("is-hidden");
  elements.batReflectAngle.style.transform = `translate(${battingState.ballX}px, ${battingState.ballY}px) rotate(${angle}rad)`;
}

function pushBattingTrailPoint(x, y, timeStamp) {
  battingState.trail.push({ x, y, timeStamp });
  const cutoff = timeStamp - 140;
  battingState.trail = battingState.trail.filter((point) => point.timeStamp >= cutoff).slice(-10);
}

function getBattingPointerVector() {
  if (battingState.trail.length < 2) {
    return { velocityX: 0, velocityY: 0, speed: 0 };
  }

  const lastPoint = battingState.trail[battingState.trail.length - 1];
  let basePoint = battingState.trail[0];

  for (let index = battingState.trail.length - 2; index >= 0; index -= 1) {
    const candidate = battingState.trail[index];

    if (lastPoint.timeStamp - candidate.timeStamp >= 30) {
      basePoint = candidate;
      break;
    }
  }

  const deltaTime = Math.max(lastPoint.timeStamp - basePoint.timeStamp, 16);
  const velocityX = ((lastPoint.x - basePoint.x) / deltaTime) * 1000;
  const velocityY = ((lastPoint.y - basePoint.y) / deltaTime) * 1000;

  return {
    velocityX,
    velocityY,
    speed: Math.hypot(velocityX, velocityY),
  };
}

function startBattingSwing(vector) {
  if (startBatModelSwing(battingState, elements.bat, vector)) {
    updateBattingDebug();
  }
}

function distanceToBatSegment(x, y) {
  return distanceToBatModelSegment(battingState, x, y);
}

function getBatHitRatio(x, y) {
  return getBatModelHitRatio(battingState, x, y);
}

function reflectBallFromBat() {
  reflectBallFromBatModel(battingState, {
    batElement: elements.bat,
    hitAngleElement: elements.batHitAngle,
    reflectAngleElement: elements.batReflectAngle,
    missMarkerElement: elements.battingContactMissMarker,
    updateCall: updateBattingCall,
    hintElement: elements.battingHint,
  });
}

function applyBattingEdgeBounce(rect) {
  applyHitBallEdgeBounce(battingState, rect);
}

function resetBattingState() {
  stopBattingAnimation();
  battingState.activePointerId = null;
  battingState.trail = [];
  battingState.isBallActive = false;
  battingState.isHit = false;
  battingState.isResting = false;
  battingState.isSwinging = false;
  battingState.swingTimer = 0;
  battingState.nextPitchAt = 0;
  battingState.lastTick = 0;
  battingState.pitchRawSpeed = 0;
  battingState.currentSpeed = 0;
  battingState.pitchJudged = false;
  battingState.swingSpeed = 0;
  battingState.swingPower = 0;
  battingState.swingMoveVelocityX = 0;
  battingState.swingMoveVelocityY = 0;
  battingState.swingAngularSpeed = 0;
  battingState.swingGateSpeed = 0;
  battingState.swingElapsed = 0;
  battingState.swingLingerTimer = 0;
  battingState.batAngle = physics.batRestAngle;
  battingState.batReadyAngle = physics.batRestAngle;
  battingState.swingStartAngle = physics.batRestAngle;
  battingState.swingEndAngle = -physics.batRestAngle;
  elements.bat.classList.remove("is-swinging", "is-hit");
  elements.battingBall.classList.remove("is-resting");
  updateContactableBall(elements.battingBall, false);
  hideBatDebugAngles();
  hideBattingBall();
  const batPosition = getDefaultBatPosition();
  battingState.batBaseX = batPosition.x;
  battingState.batBaseY = batPosition.y;
  setBatPosition(batPosition.x, batPosition.y, physics.batRestAngle);
  updateBattingCall("READY");
  updateBattingDebug();
}

function spawnBattingPitch() {
  const rect = elements.battingSurface.getBoundingClientRect();
  const zone = getBattingStrikeZoneRect();
  const zoneCenterX = (zone.left + zone.right) * 0.5;
  const rawSpeed = physics.battingMinRawSpeed + Math.random() * (physics.battingMaxRawSpeed - physics.battingMinRawSpeed);
  const speedY = rawSpeed * physics.battingSpeedScale;
  const startX = clamp(zoneCenterX + (Math.random() - 0.5) * 240, 24, rect.width - 24);
  const targetX = zoneCenterX + (Math.random() - 0.5) * 150;
  const startY = -24;
  const travelTime = Math.max(0.45, (zone.top - startY) / speedY);

  battingState.pitchRawSpeed = rawSpeed;
  battingState.currentSpeed = rawSpeed;
  battingState.velocityX = (targetX - startX) / travelTime;
  battingState.velocityY = speedY;
  battingState.curveAccelerationX = (Math.random() - 0.5) * 260;
  battingState.pitchElapsed = 0;
  battingState.pitchJudged = false;
  battingState.isBallActive = true;
  battingState.isHit = false;
  battingState.isResting = false;
  elements.bat.classList.remove("is-hit");
  elements.battingBall.classList.remove("is-resting");
  updateContactableBall(elements.battingBall, false);
  hideBatDebugAngles();
  setBattingBallPosition(startX, startY);
  showBattingBall();
  updateBattingCall("WAIT");
  elements.battingHint.textContent = "Move and swing.";
  updateBattingDebug();
}

function finishBattingPitch(message = "READY") {
  battingState.isBallActive = false;
  hideBattingBall();
  updateBattingCall(message);
  battingState.nextPitchAt = performance.now() + 700;
}

function animateBatting(timeStamp) {
  if (!battingState.isRunning) {
    return;
  }

  if (!battingState.lastTick) {
    battingState.lastTick = timeStamp;
  }

  const deltaSeconds = Math.min((timeStamp - battingState.lastTick) / 1000, 0.032);
  battingState.lastTick = timeStamp;

  if (!battingState.isBallActive && timeStamp >= battingState.nextPitchAt) {
    spawnBattingPitch();
  }

  if (battingState.isSwinging) {
    battingState.swingTimer -= deltaSeconds;
    battingState.swingElapsed += deltaSeconds;
    const swingProgress = clamp(battingState.swingElapsed / physics.battingSwingDuration, 0, 1);
    const swingEase = 1 - (1 - swingProgress) * (1 - swingProgress);
    const swingAngle =
      battingState.swingStartAngle + (battingState.swingEndAngle - battingState.swingStartAngle) * swingEase;
    setBatPosition(battingState.batX, battingState.batY, swingAngle);

    if (battingState.swingTimer <= 0) {
      battingState.isSwinging = false;
      elements.bat.classList.remove("is-swinging");
      setBatPosition(battingState.batX, battingState.batY, battingState.swingEndAngle);
      // スイング終了後に短い接触猶予ウィンドウを設ける（少し早いスイングでも当たるように）
      battingState.swingLingerTimer = physics.battingSwingLingerDuration;
    }
  }

  if (battingState.isBallActive) {
    const previousX = battingState.ballX;
    const previousY = battingState.ballY;
    const rect = elements.battingSurface.getBoundingClientRect();

    if (!battingState.isHit) {
      battingState.pitchElapsed += deltaSeconds;
      battingState.velocityX += battingState.curveAccelerationX * deltaSeconds;
    } else {
      const hitDragFactor = Math.exp(-physics.battingHitDragPerSecond * deltaSeconds);
      battingState.velocityX *= hitDragFactor;
      battingState.velocityY *= hitDragFactor;
      // 引き継いだ投球カーブを打球に適用（時間とともに減衰）
      if (Math.abs(battingState.curveAccelerationX) > physics.hitBallCurveThreshold) {
        battingState.velocityX += battingState.curveAccelerationX * deltaSeconds;
        battingState.curveAccelerationX *= Math.exp(-physics.hitBallCurveDecayRate * deltaSeconds);
      }
    }

    battingState.ballX += battingState.velocityX * deltaSeconds;
    battingState.ballY += battingState.velocityY * deltaSeconds;
    battingState.currentSpeed = Math.hypot(battingState.velocityX, battingState.velocityY);
    setBattingBallPosition(battingState.ballX, battingState.ballY);
    updateContactableBall(
      elements.battingBall,
      battingState.isBallActive && !battingState.isHit && !battingState.pitchJudged,
    );

    if (battingState.isHit) {
      updateContactableBall(elements.battingBall, false);
      applyBattingEdgeBounce(rect);
      setBattingBallPosition(battingState.ballX, battingState.ballY);
    }

    // リンガータイマー更新（スイング終了後の接触猶予）
    if (battingState.swingLingerTimer > 0) {
      battingState.swingLingerTimer = Math.max(0, battingState.swingLingerTimer - deltaSeconds);
    }

    if (
      (battingState.isSwinging || battingState.swingLingerTimer > 0) &&
      !battingState.isHit &&
      (!battingState.pitchJudged || isBallInBattingContactBand()) &&
      checkBatModelContact(battingState, previousX, previousY)
    ) {
      updateContactableBall(elements.battingBall, false);
      reflectBallFromBat();
    }

    if (!battingState.pitchJudged && !battingState.isHit) {
      const call = getZonePathCall(
        previousX,
        previousY,
        battingState.ballX,
        battingState.ballY,
        getBattingStrikeZoneRect(),
        "down",
      );

      if (call) {
        battingState.pitchJudged = true;
        updateBattingCall(call === "strike" ? "STRIKE" : "BALL", call === "strike" ? "is-strike" : "is-ball");
      }
    }

    const isOutside =
      battingState.ballY > rect.height + 80 ||
      battingState.ballY < -120 ||
      battingState.ballX < -120 ||
      battingState.ballX > rect.width + 120;
    const isResting = battingState.isHit && !battingState.isResting && battingState.currentSpeed <= physics.battingRestSpeed;
    const isStopped = battingState.isHit && battingState.currentSpeed <= physics.battingStopSpeed;

    if (isResting) {
      battingState.isResting = true;
      elements.battingBall.classList.add("is-resting");
    }

    if (isStopped) {
      battingState.isBallActive = false;
      battingState.nextPitchAt = performance.now() + 700;
    } else if (isOutside) {
      finishBattingPitch(battingState.isHit ? "HIT" : battingState.pitchJudged ? elements.battingCall.textContent : "BALL");
    }
  }

  updateBattingDebug();
  battingState.animationFrameId = window.requestAnimationFrame(animateBatting);
}

function animatePitch(timeStamp) {
  if (!state.isPitching) {
    return;
  }

  if (!state.lastTick) {
    state.lastTick = timeStamp;
  }

  const deltaSeconds = Math.min((timeStamp - state.lastTick) / 1000, 0.032);
  state.lastTick = timeStamp;

  const previousX = state.ballX;
  const previousY = state.ballY;
  const previousHeight = state.height;
  const rect = elements.pitchSurface.getBoundingClientRect();

  if (state.motionMode === "flight") {
    state.flightElapsed += deltaSeconds;
    const dragFactor = Math.exp(-physics.dragPerSecond * deltaSeconds);
    const sideDragFactor = Math.exp(-physics.sideDragPerSecond * deltaSeconds);
    state.velocityX *= sideDragFactor;
    state.velocityY *= dragFactor;

    if (state.bounceCount === 0 && Math.abs(state.curveAccelerationX) > 0.0001) {
      const curveRamp = clamp(state.flightElapsed / state.curveRampDuration, 0, 1);
      state.velocityX += state.curveAccelerationX * curveRamp * deltaSeconds;
    }

    if (state.height < 28 && state.heightVelocity < 0) {
      const groundFactor = state.height / 28;
      const approachDrag = Math.exp(-2.0 * (1 - groundFactor) * deltaSeconds);
      state.velocityX *= approachDrag;
      state.velocityY *= approachDrag;
    }

    const deltaX = state.velocityX * deltaSeconds;
    const deltaY = state.velocityY * deltaSeconds;

    state.ballX += deltaX;
    state.ballY += deltaY;

    state.heightVelocity -= state.flightGravity * deltaSeconds;
    state.height += state.heightVelocity * deltaSeconds;

    const landedBeforeZone = previousHeight > 0 && state.height <= 0 && !state.pitchJudged;

    if (state.flightElapsed >= state.bounceMinTime && landedBeforeZone && state.heightVelocity < 0) {
      applyTopDownBounce();
    }

    state.currentSpeed = Math.hypot(state.velocityX, state.velocityY);

    const readyToRollBySpeed = state.currentSpeed <= physics.rollTriggerSpeed;
    const readyToRollByPosition =
      state.pitchJudged &&
      (state.ballY >= rect.height - physics.rollTopBand ||
        state.ballY <= physics.rollTopBand ||
        state.ballX <= physics.rollTopBand ||
        state.ballX >= rect.width - physics.rollTopBand);

    if (state.bounceCount > 0 && (readyToRollBySpeed || readyToRollByPosition)) {
      startRolling();
    }
  } else {
    const rollDragFactor = Math.exp(-physics.rollDragPerSecond * deltaSeconds);

    state.velocityX *= rollDragFactor;
    state.velocityY *= rollDragFactor;
    state.ballX += state.velocityX * deltaSeconds;
    state.ballY += state.velocityY * deltaSeconds;
    state.currentSpeed = Math.hypot(state.velocityX, state.velocityY);
  }

  setBallPosition(state.ballX, state.ballY);
  recordPitchPath();
  updateHeightDebug();

  judgePitchOnPath(previousX, previousY, state.ballX, state.ballY);

  const zone = getStrikeZoneRect();

  if (!state.pitchJudged && (state.ballX < -28 || state.ballX > rect.width + 28)) {
    state.pitchJudged = true;
    updatePitchCall("BALL", "is-ball");
  }

  updateDebug();

  const isOutside =
    state.ballY > rect.height + 40 ||
    state.ballY < -80 ||
    state.ballX < -80 ||
    state.ballX > rect.width + 80;

  const isRollFinished = state.motionMode === "rolling" && state.currentSpeed <= physics.rollStopSpeed;
  const isFlightFinished =
    state.motionMode === "flight" &&
    state.flightElapsed > 0.35 &&
    state.height <= 0 &&
    state.currentSpeed <= physics.rollStopSpeed;

  if (isOutside || isRollFinished || isFlightFinished) {
    if (!state.pitchJudged) {
      state.pitchJudged = true;
      updatePitchCall("BALL", "is-ball");
    }

    stopPitchAnimation();
    showPitchTrace();
    hideBall();
    updateHint("もう一度、指を置いて下にスワイプ");
    state.height = 0;
    state.heightVelocity = 0;
    state.currentSpeed = 0;
    state.velocityX = 0;
    state.velocityY = 0;
    updateDebug();
    updateHeightDebug();
    return;
  }

  state.animationFrameId = window.requestAnimationFrame(animatePitch);
}

function startPitch(vector) {
  stopPitchAnimation();
  state.isPitching = true;
  const launch = launchPitchModel(state, vector, getStrikeZoneRect(), { useRawCurrentSpeed: true });
  state.bounceMinY = 0;
  state.lastReleaseSpeed = launch.scaledSpeed;
  state.nextBounceDistance = Math.max(64, Math.min(170, 110 - (launch.scaledSpeed - 2200) * 0.014));
  recordPitchPath();
  pushSpeedHistory(launch.scaledSpeed);
  updatePitchCall("Judging");
  updateHint("Pitching");
  updateDebug();
  updateHeightDebug();
  state.animationFrameId = window.requestAnimationFrame(animatePitch);
}

function beginPointerControl(event) {
  if (state.activePointerId !== null) {
    return;
  }

  stopPitchAnimation();
  resetPitchState();
  state.activePointerId = event.pointerId;
  elements.pitchSurface.setPointerCapture(event.pointerId);

  const point = getSurfacePoint(event);
  state.trail = [];
  showBall();
  setBallPosition(point.x, point.y);
  pushTrailPoint(point.x, point.y, event.timeStamp);
  updateHint("そのまま投げたい方向にスワイプして投げる");
}

function movePointerControl(event) {
  if (event.pointerId !== state.activePointerId) {
    return;
  }

  const point = getSurfacePoint(event);
  setBallPosition(point.x, point.y);
  pushTrailPoint(point.x, point.y, event.timeStamp);
}

function endPointerControl(event) {
  if (event.pointerId !== state.activePointerId) {
    return;
  }

  const point = getSurfacePoint(event);
  setBallPosition(point.x, point.y);
  pushTrailPoint(point.x, point.y, event.timeStamp);

  const vector = getReleaseVector();
  state.activePointerId = null;
  state.trail = [];

  if (!vector) {
    const softVector = createSoftReleaseVector(null);
    state.lastReleaseSpeed = softVector.speed;
    updateHint("弱いリリース");
    startPitch(softVector);
    return;
  }

  if (vector.speed < 120) {
    const softVector = createSoftReleaseVector(vector);
    state.lastReleaseSpeed = softVector.speed;
    updateHint("弱いリリース");
    startPitch(softVector);
    return;
  }

  startPitch(vector);
}

function getBattingSurfacePoint(event) {
  const rect = elements.battingSurface.getBoundingClientRect();

  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

function beginBattingPointer(event) {
  if (battingState.activePointerId !== null) {
    return;
  }

  battingState.activePointerId = event.pointerId;
  elements.battingSurface.setPointerCapture(event.pointerId);
  const point = getBattingSurfacePoint(event);
  const batPosition = getDefaultBatPosition();
  battingState.trail = [];
  battingState.batBaseX = batPosition.x;
  battingState.batBaseY = batPosition.y;
  battingState.batPointerStartX = point.x;
  battingState.batPointerStartY = point.y;
  battingState.batReadyAngle = physics.batRestAngle;
  hideBatDebugAngles();
  setBatPosition(batPosition.x, batPosition.y, physics.batRestAngle);
  pushBattingTrailPoint(point.x, point.y, event.timeStamp);
}

function moveBattingPointer(event) {
  if (event.pointerId !== battingState.activePointerId) {
    return;
  }

  const point = getBattingSurfacePoint(event);
  if (!battingState.isSwinging) {
    placeBatOnSwingLine(point.x, point.y);
  }
  pushBattingTrailPoint(point.x, point.y, event.timeStamp);

  const vector = getBattingPointerVector();
  battingState.swingGateSpeed = Math.max(0, -vector.velocityY);
  updateBattingDebug();

  if (battingState.swingGateSpeed >= physics.battingSwingThreshold) {
    startBattingSwing(vector);
  }
}

function endBattingPointer(event) {
  if (event.pointerId !== battingState.activePointerId) {
    return;
  }

  const point = getBattingSurfacePoint(event);
  if (!battingState.isSwinging) {
    placeBatOnSwingLine(point.x, point.y);
  }
  pushBattingTrailPoint(point.x, point.y, event.timeStamp);
  battingState.activePointerId = null;
  battingState.trail = [];
}

elements.openPitchPrototype?.addEventListener("click", showPrototypeScreen);
elements.openBattingPrototype?.addEventListener("click", showBattingScreen);
elements.openPlayingPrototype?.addEventListener("click", () => showPlayingScreen(9));
elements.openPlayingPrototype3?.addEventListener("click", () => showPlayingScreen(3));
elements.backButton?.addEventListener("click", showMainScreen);
elements.battingBackButton?.addEventListener("click", showMainScreen);
elements.overlayButton?.addEventListener("click", () => { showPlayingScreen(gameState.maxInnings || 9); });

// リセットボタン長押し（3秒）
let cancelResetHold = () => {};
(function () {
  let holdTimer = null;
  const btn = elements.playingResetBtn;
  const indicator = document.getElementById("holdIndicator");
  const indicatorBar = document.getElementById("holdIndicatorBar");
  const choiceOverlay = document.getElementById("resetChoiceOverlay");
  const btn3 = document.getElementById("resetChoice3");
  const btn9 = document.getElementById("resetChoice9");

  function showIndicator() {
    indicatorBar.classList.remove("is-filling");
    void indicatorBar.offsetWidth;
    indicator.classList.remove("is-hidden");
    indicatorBar.classList.add("is-filling");
  }

  function hideIndicator() {
    indicator.classList.add("is-hidden");
    indicatorBar.classList.remove("is-filling");
  }

  // 指を離したとき: タイマー中なら取り消すだけ。タイマー発火済みならオーバーレイはそのまま残す
  function releaseHold() {
    if (holdTimer === null) return; // タイマー発火済み → 何もしない
    clearTimeout(holdTimer);
    holdTimer = null;
    btn.classList.remove("is-holding");
    hideIndicator();
  }

  // 外部（画面遷移など）から全リセットするとき
  function fullReset() {
    clearTimeout(holdTimer);
    holdTimer = null;
    btn.classList.remove("is-holding");
    hideIndicator();
    choiceOverlay.classList.add("is-hidden");
  }

  cancelResetHold = fullReset;

  function startHold(e) {
    if (!playingState.isRunning) return;
    e.preventDefault();
    e.stopPropagation();
    btn.classList.add("is-holding");
    showIndicator();
    holdTimer = setTimeout(() => {
      holdTimer = null; // 発火済みのマーク
      if (!playingState.isRunning) { fullReset(); return; }
      hideIndicator();
      btn.classList.remove("is-holding");
      choiceOverlay.classList.remove("is-hidden");
    }, 3000);
  }

  let choosing = false;
  function chooseInnings(n) {
    return (e) => {
      if (choosing) return;
      choosing = true;
      e.preventDefault();
      e.stopPropagation();
      fullReset();
      showPlayingScreen(n);
      setTimeout(() => { choosing = false; }, 500);
    };
  }
  btn3.addEventListener("pointerdown", chooseInnings(3));
  btn9.addEventListener("pointerdown", chooseInnings(9));
  btn3.addEventListener("click", chooseInnings(3));
  btn9.addEventListener("click", chooseInnings(9));

  btn.addEventListener("pointerdown", startHold);
  btn.addEventListener("pointerup", releaseHold);
  btn.addEventListener("pointercancel", releaseHold);
  btn.addEventListener("pointerleave", releaseHold);
})();

elements.pitchSurface.addEventListener("pointerdown", beginPointerControl);
elements.pitchSurface.addEventListener("pointermove", movePointerControl);
elements.pitchSurface.addEventListener("pointerup", endPointerControl);
elements.pitchSurface.addEventListener("pointercancel", endPointerControl);

elements.battingSurface.addEventListener("pointerdown", beginBattingPointer);
elements.battingSurface.addEventListener("pointermove", moveBattingPointer);
elements.battingSurface.addEventListener("pointerup", endBattingPointer);
elements.battingSurface.addEventListener("pointercancel", endBattingPointer);

// ===== Playing Prototype A =====

function getPlayingStrikeZoneRect() {
  return getZoneRect(elements.playingSurface, elements.playingStrikeZone);
}

function setPlayingBallPosition(x, y) {
  playingState.ballX = x;
  playingState.ballY = y;
  elements.playingBall.style.transform = `translate(${x}px, ${y}px)`;
}

function showPlayingBall() {
  elements.playingBall.classList.remove("is-hidden");
}

function hidePlayingBall() {
  elements.playingBall.classList.add("is-hidden");
  elements.playingBallTail.classList.add("is-hidden");
  updateContactableBall(elements.playingBall, false);
}

// 打球・送球の速度を尻尾（テール）で表現する。速いほど長い。
function updatePlayingBallTail() {
  const el = elements.playingBallTail;
  const show =
    playingState.isBallActive &&
    (playingState.isHit || playingState.isFielderThrow) &&
    playingState.currentSpeed >= physics.ballTailMinSpeed;
  if (!show) {
    el.classList.add("is-hidden");
    return;
  }
  const length = Math.min(
    physics.ballTailMaxLength,
    (playingState.currentSpeed - physics.ballTailMinSpeed) * physics.ballTailLengthScale + 12,
  );
  // テールは進行方向の逆側へ伸ばす
  const angle = Math.atan2(-playingState.velocityY, -playingState.velocityX);
  el.style.width = `${length}px`;
  el.style.transform = `translate(${playingState.ballX}px, ${playingState.ballY}px) rotate(${angle}rad)`;
  el.classList.toggle("is-blue", elements.playingBall.classList.contains("is-blue-hit"));
  el.classList.remove("is-hidden");
}

function stopPlayingAnimation() {
  if (playingState.animationFrameId) {
    window.cancelAnimationFrame(playingState.animationFrameId);
    playingState.animationFrameId = 0;
  }
  playingState.isRunning = false;
}

function setPlayingBatPosition(x, y, angle) {
  playingState.batX = x;
  playingState.batY = y;
  playingState.batAngle = angle;
  elements.playingBat.style.transform = `translate(${x}px, ${y}px) rotate(${angle}rad)`;
}

function getDefaultPlayingBatPosition() {
  return getDefaultBatModelPosition(elements.playingSurface, getPlayingStrikeZoneRect);
}

function placePlayingBatOnSwingLine(pointerX, pointerY) {
  placeBatModelOnSwingLine(
    playingState,
    elements.playingSurface,
    getPlayingStrikeZoneRect,
    setPlayingBatPosition,
    pointerX,
    pointerY,
  );
}

function distanceToPlayingBatSegment(x, y) {
  return distanceToBatModelSegment(playingState, x, y);
}

function getPlayingBatHitRatio(x, y) {
  return getBatModelHitRatio(playingState, x, y);
}

function isPlayingBallInContactBand() {
  const zone = getPlayingStrikeZoneRect();
  return playingState.ballY >= zone.top - physics.battingContactTopAllowance && playingState.ballY <= zone.bottom;
}

function updatePlayingCall(text, kind = "") {
  if (text === "HIT" || text === "SWING!" || text === "READY") {
    text = "";
    kind = "";
  }

  elements.playingCall.textContent = text;
  elements.playingCall.classList.remove("is-strike", "is-ball", "is-out", "is-miss", "is-dead");
  if (kind) elements.playingCall.classList.add(kind);

  if (text === "STRIKE" || text === "BALL" || text === PITCH_MISS_TEXT || text === DEAD_BALL_TEXT) {
    // 投げミス／デッドボールはカウントが動かないぶん見落としやすいので長めに出す
    const holdMs =
      text === DEAD_BALL_TEXT ? physics.deadBallCallHoldMs :
      text === PITCH_MISS_TEXT ? 1000 : 550;
    setTimeout(() => {
      if (elements.playingCall.textContent === text) {
        updatePlayingCall("");
      }
    }, holdMs);
  }
}

function updatePlayingDebug() {
  elements.playingDebugKmh.textContent = rawToKmh(playingState.pitchRawSpeed).toFixed(1);
  elements.playingDebugBallSpeed.textContent = playingState.currentSpeed.toFixed(0);
  elements.playingDebugSwingGate.textContent = `${playingState.swingGateSpeed.toFixed(0)} / ${physics.battingSwingThreshold}`;
}

// ---- Playing bases & runners ----

const RUNNER_COLORS = ["color-0", "color-1", "color-2"];

function getUnusedRunnerColor() {
  const usedColors = new Set(playingState.runners.map((r) => r.colorClass));
  return RUNNER_COLORS.find((colorClass) => !usedColors.has(colorClass)) || RUNNER_COLORS[0];
}

function placeRunnerOnBase(runner, baseIndex, bases) {
  const base = bases[baseIndex];
  runner.x = base.x;
  runner.y = base.y;
  runner.fromX = base.x;
  runner.fromY = base.y;
  runner.toBaseIndex = baseIndex;
  runner.progress = 1;
  runner.state = "safe";
}

function createSafeRunner(baseIndex, bases) {
  const base = bases[baseIndex];
  return {
    id: Date.now() + Math.random(),
    x: base.x,
    y: base.y,
    fromX: base.x,
    fromY: base.y,
    toBaseIndex: baseIndex,
    progress: 1,
    state: "safe",
    colorClass: getUnusedRunnerColor(),
    speed: 118,
    route: [],
  };
}

function advanceRunnersOnWalk() {
  const rect = elements.playingSurface.getBoundingClientRect();
  const bases = getPlayingBasePositions(rect);
  const home = getPlayingHomePlate(rect);
  const safeRunners = playingState.runners.filter((runner) => runner.state === "safe");
  const runnerByBase = new Map(safeRunners.map((runner) => [runner.toBaseIndex, runner]));

  // 強制進塁: 各塁のランナーをアニメーションで次の塁へ走らせる
  if (runnerByBase.has(0)) {
    if (runnerByBase.has(1)) {
      if (runnerByBase.has(2)) {
        // 3塁ランナー → ホームへ走りスコア
        const runnerAt3rd = runnerByBase.get(2);
        runnerAt3rd.fromX = runnerAt3rd.x;
        runnerAt3rd.fromY = runnerAt3rd.y;
        runnerAt3rd.toBaseIndex = bases.length; // ホーム
        runnerAt3rd.progress = 0;
        runnerAt3rd.state = "running";
        runnerAt3rd.fromWalk = true;
        runnerAt3rd.route = [];
      }
      // 2塁ランナー → 3塁へ
      const runnerAt2nd = runnerByBase.get(1);
      runnerAt2nd.fromX = runnerAt2nd.x;
      runnerAt2nd.fromY = runnerAt2nd.y;
      runnerAt2nd.toBaseIndex = 2;
      runnerAt2nd.progress = 0;
      runnerAt2nd.state = "running";
      runnerAt2nd.fromWalk = true;
      runnerAt2nd.route = [];
    }
    // 1塁ランナー → 2塁へ
    const runnerAt1st = runnerByBase.get(0);
    runnerAt1st.fromX = runnerAt1st.x;
    runnerAt1st.fromY = runnerAt1st.y;
    runnerAt1st.toBaseIndex = 1;
    runnerAt1st.progress = 0;
    runnerAt1st.state = "running";
    runnerAt1st.fromWalk = true;
    runnerAt1st.route = [];
  }

  playingState.runners = playingState.runners.filter((runner) => runner.state !== "out" && runner.state !== "scored");
  if (!playingState.runners.some((runner) => (runner.state === "safe" || runner.state === "running") && runner.toBaseIndex === 0)) {
    const usedColors = new Set(playingState.runners.map((r) => r.colorClass));
    const colorClass = RUNNER_COLORS.find((c) => !usedColors.has(c)) || RUNNER_COLORS[0];
    playingState.runners.push({
      id: Date.now() + Math.random(),
      x: home.x,
      y: home.y,
      fromX: home.x,
      fromY: home.y,
      toBaseIndex: 0,
      progress: 0,
      state: "running",
      colorClass,
      speed: 94,
      fromWalk: true,
      route: [],
    });
  }
  elements.playingRunLabel.textContent = "フォアボール";
  renderPlayingRunners();
}

function getPlayingBasePositions(rect) {
  const topWallY = getPlayingTopWallY();
  // 塁は壁から離して内側に置く:
  // - 1塁/3塁を側壁から離すことで、壁際に静止した打球が塁の当たり半径に重なる
  //   「壁アシストのタダ取りアウト」を防ぐ
  // - 2塁を上壁から離すことで、深い打球（上壁到達）が2塁のすぐ横に止まって
  //   ピックアップ即アウトになる事故を防ぎ、外野リング（塁の外側の空間）を作る
  return [
    { x: rect.width * 0.86, y: rect.height * 0.47 }, // 1塁（右・内側）
    { x: rect.width * 0.50, y: topWallY + 76 },      // 2塁（上壁から距離を取る）
    { x: rect.width * 0.14, y: rect.height * 0.47 }, // 3塁（左・内側）
  ];
}

function getPlayingHomePlate(rect) {
  // ストライクゾーンのCSS位置に合わせてサーフェス寸法から直接計算
  // .playing-strike-zone: bottom: 84px, height: 36px, 水平中央
  const safeBottom = 0; // env(safe-area-inset-bottom) は JS からは取得しにくいためゼロ近似
  const zoneBottom = rect.height - 84 - safeBottom;
  const zoneHeight = 36;
  const zoneTop = zoneBottom - zoneHeight;
  return { x: rect.width * 0.5, y: zoneTop + zoneHeight / 2 };
}

// マウンドの位置と大きさ。2塁とディバイダー（ピッチャーエリアの下端）の中間に置く。
// 半径はピッチャーエリアの高さに追従させる。エリアが低い画面で円がエリアを埋めると
// 「マウンドからしか投げ始められない」という制約が意味を失うため。
function getPlayingMound(rect) {
  const topWallY = getPlayingTopWallY();
  const dividerY = rect.height * 0.5;
  const areaHeight = Math.max(0, dividerY - topWallY);
  const radius = clamp(areaHeight * 0.22, 28, physics.moundRadius);
  const centerRadius = radius * (physics.moundCenterRadius / physics.moundRadius);

  const secondBaseY = getPlayingBasePositions(rect)[1].y;
  const raw = secondBaseY + (dividerY - secondBaseY) * physics.moundDepthRatio;
  // 上壁からの余白に加えて、2塁と円が重ならない位置も下限にする
  const minY = Math.max(topWallY + radius + 12, secondBaseY + radius + 18);
  const maxY = dividerY - radius - 8;
  // 画面が極端に低い場合でもピッチャーエリア内に収める（maxY を優先）
  return {
    x: rect.width * 0.5,
    y: Math.min(maxY, Math.max(minY, raw)),
    radius,
    centerRadius,
  };
}

function isInsidePlayingMound(x, y) {
  const mound = getPlayingMound(elements.playingSurface.getBoundingClientRect());
  return Math.hypot(x - mound.x, y - mound.y) <= mound.radius;
}

// 描画は判定と同じ値から組み立て、見た目と当たり判定がズレないようにする
function updatePlayingMoundDOM() {
  const mound = getPlayingMound(elements.playingSurface.getBoundingClientRect());
  const el = elements.playingMound;
  el.style.width = `${mound.radius * 2}px`;
  el.style.height = `${mound.radius * 2}px`;
  el.style.marginLeft = `${-mound.radius}px`;
  el.style.marginTop = `${-mound.radius}px`;
  el.style.transform = `translate(${mound.x}px, ${mound.y}px)`;

  const centerEl = el.firstElementChild;
  if (centerEl) {
    centerEl.style.width = `${mound.centerRadius * 2}px`;
    centerEl.style.height = `${mound.centerRadius * 2}px`;
    centerEl.style.marginLeft = `${-mound.centerRadius}px`;
    centerEl.style.marginTop = `${-mound.centerRadius}px`;
  }
}

function updatePlayingHomBaseDOM() {
  const rect = elements.playingSurface.getBoundingClientRect();
  const home = getPlayingHomePlate(rect);
  elements.playingHomeBase.style.transform = `translate(${home.x}px, ${home.y}px) rotate(45deg)`;
}

function showPlayingScore() {
  gameProcessScore();
}

function updatePlayingBasesDOM() {
  updatePlayingMoundDOM();
  const rect = elements.playingSurface.getBoundingClientRect();
  const bases = getPlayingBasePositions(rect);
  const baseEls = [elements.playingBase0, elements.playingBase1, elements.playingBase2];
  bases.forEach((base, i) => {
    baseEls[i].style.transform = `translate(${base.x}px, ${base.y}px) rotate(45deg)`;
  });
}

function spawnRunnerOnHit() {
  const rect = elements.playingSurface.getBoundingClientRect();
  const bases = getPlayingBasePositions(rect);
  const home = getPlayingHomePlate(rect);

  // 既存のセーフランナーを1塁進塁させる（3塁セーフはホームへ）
  for (const runner of playingState.runners) {
    if (runner.state === "safe") {
      runner.fromWalk = false;
      const nextBase = runner.toBaseIndex + 1;
      const fromPos = runner.toBaseIndex < bases.length ? bases[runner.toBaseIndex] : home;
      runner.fromX = fromPos.x;
      runner.fromY = fromPos.y;
      runner.x = runner.fromX;
      runner.y = runner.fromY;
      runner.route = [];
      if (nextBase > bases.length) {
        // すでにホーム走中などは無視
        runner.state = "scored";
      } else if (nextBase === bases.length) {
        // 3塁 → ホーム
        runner.toBaseIndex = bases.length; // ホーム用
        runner.progress = 0;
        runner.state = "running";
      } else {
        runner.toBaseIndex = nextBase;
        runner.progress = 0;
        runner.state = "running";
      }
    }
  }

  // スコアしたランナーを削除
  playingState.runners = playingState.runners.filter((r) => r.state !== "scored");

  // バッターランナーを常に追加（走者が満塁でも打者は1塁へ走る）
  const usedColors = new Set(playingState.runners.map((r) => r.colorClass));
  const colorClass = RUNNER_COLORS.find((c) => !usedColors.has(c)) || RUNNER_COLORS[0];
  playingState.runners.push({
    id: Date.now(),
    x: home.x,
    y: home.y,
    fromX: home.x,
    fromY: home.y,
    toBaseIndex: 0,
    progress: 0,
    state: "running",
    colorClass,
    speed: 94,
    route: [],
  });

  playingState.inPlay = true;
  playingState.runnerBoost = 0;
  elements.playingRunLabel.textContent = "RUN！RUN！RUN！";
  renderPlayingRunners();
  saveGameToDB();
}

function applyRunnerBoostTap(tapX, tapY) {
  if (!hasActiveRunners()) return;
  playingState.runnerBoost = Math.min(
    physics.runnerBoostMax,
    playingState.runnerBoost + physics.runnerBoostPerTap,
  );
  if (tapX !== undefined) spawnBoostRipple(tapX, tapY);
}

// 連打タップ位置に波紋を出す（アニメーション終了後に自動削除）
function spawnBoostRipple(x, y) {
  const ripple = document.createElement("div");
  ripple.className = "boost-tap-ripple";
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  elements.playingSurface.appendChild(ripple);
  setTimeout(() => ripple.remove(), 500);
}

function updateRunnerBoostGauge() {
  elements.runnerBoostGaugeFill.style.width =
    `${(playingState.runnerBoost / physics.runnerBoostMax) * 100}%`;
}

function updatePlayingRunners(dt) {
  const rect = elements.playingSurface.getBoundingClientRect();
  const bases = getPlayingBasePositions(rect);
  const home = getPlayingHomePlate(rect);
  let runnersSettled = false;

  if (playingState.runnerBoost > 0) {
    playingState.runnerBoost = Math.max(
      0,
      playingState.runnerBoost - physics.runnerBoostDecayPerSecond * dt,
    );
  }
  updateRunnerBoostGauge();

  for (const runner of playingState.runners) {
    if (runner.state === "out" || runner.state === "scored") continue;

    if (runner.state !== "running") continue;

    const target = runner.toBaseIndex < bases.length ? bases[runner.toBaseIndex] : home;
    const dx = target.x - runner.fromX;
    const dy = target.y - runner.fromY;
    const dist = Math.hypot(dx, dy);

    // ルートの次の塁へ進む共通処理
    const advanceToNextInRoute = () => {
      runner.x = target.x;
      runner.y = target.y;
      playSfx("baseReach");

      // アウトは走者に当てたときだけ成立する。塁に到達しただけでは何も起きない。

      if (runner.route && runner.route.length > 0) {
        // まだ次の塁がある → 続けて走る
        const nextIndex = runner.route.shift();
        runner.fromX = target.x;
        runner.fromY = target.y;
        runner.toBaseIndex = nextIndex;
        runner.progress = 0;
        // state は "running" のまま
      } else if (runner.toBaseIndex >= bases.length) {
        runner.state = "scored";
        runnersSettled = true;
        showPlayingScore();
      } else {
        runner.state = "safe";
        runner.fromWalk = false;
        runnersSettled = true;
      }
    };

    if (dist < 0.001) {
      advanceToNextInRoute();
      continue;
    }

    // フォアボール進塁はタップ無効のため速めの固定速度、それ以外は基本速度+連打ブースト
    const moveSpeed = runner.fromWalk
      ? physics.walkAdvanceSpeed
      : physics.runnerBaseSpeed + playingState.runnerBoost;
    runner.progress += (moveSpeed * dt) / dist;

    if (runner.progress >= 1) {
      runner.progress = 1;
      advanceToNextInRoute();
    } else {
      runner.x = runner.fromX + dx * runner.progress;
      runner.y = runner.fromY + dy * runner.progress;
    }
  }

  // scored を削除
  playingState.runners = playingState.runners.filter((r) => r.state !== "scored");

  renderPlayingRunners();
  if (runnersSettled && !hasActiveRunners()) saveGameToDB();
}

function renderPlayingRunners() {
  const rect = elements.playingSurface.getBoundingClientRect();
  const bases = getPlayingBasePositions(rect);
  const runnerEls = [elements.playingRunner0, elements.playingRunner1, elements.playingRunner2, elements.playingRunner3];

  // 全て非表示・色クリア
  runnerEls.forEach((el) => {
    el.classList.add("is-hidden");
    el.classList.remove("color-0", "color-1", "color-2", "is-boosted");
  });

  playingState.runners.forEach((runner, i) => {
    if (i >= runnerEls.length) return;
    if (runner.state === "out" || runner.state === "scored") return;

    const el = runnerEls[i];
    el.classList.remove("is-hidden");
    el.classList.add(runner.colorClass);
    // 連打ブースト中の走者にオーラを付ける（フォアボール進塁は対象外）
    el.classList.toggle(
      "is-boosted",
      runner.state === "running" && !runner.fromWalk && playingState.runnerBoost > 30,
    );

    // 方向: 走っているなら目標塁/ホームへ、セーフなら次の方向を向く
    let dx, dy;
    const rect2 = rect; // same rect
    const home = getPlayingHomePlate(rect2);
    if (runner.state === "running") {
      const target = runner.toBaseIndex < bases.length ? bases[runner.toBaseIndex] : home;
      dx = target.x - runner.x;
      dy = target.y - runner.y;
    } else {
      const nextIndex = runner.toBaseIndex + 1;
      const next = nextIndex < bases.length ? bases[nextIndex] : home;
      dx = next.x - runner.x;
      dy = next.y - runner.y;
    }

    const deg = Math.atan2(dy, dx) * (180 / Math.PI);
    el.style.transform = `translate(${runner.x}px, ${runner.y}px) rotate(${deg}deg)`;
  });

  updatePlayingMode();
  updatePlayingThrowTargets();
  if (hasActiveRunners()) { startCrowdCheer(); } else { stopCrowdCheer(); }
}

// 送球の的は塁ではなく走者。狙える走者に赤い点滅とリングを付ける。
function updatePlayingThrowTargets() {
  const ringEls = [elements.playingRunnerRing0, elements.playingRunnerRing1,
                   elements.playingRunnerRing2, elements.playingRunnerRing3];
  const runnerEls = [elements.playingRunner0, elements.playingRunner1,
                     elements.playingRunner2, elements.playingRunner3];

  runnerEls.forEach((el, index) => {
    const runner = playingState.runners[index];
    const taggable = !!runner && runner.state === "running" && !runner.fromWalk;
    el.classList.toggle("is-target", taggable);

    const ring = ringEls[index];
    ring.classList.toggle("is-hidden", !taggable);
    if (taggable) {
      ring.style.left = `${runner.x}px`;
      ring.style.top = `${runner.y}px`;
    }
  });
}

// 走者に当てる判定の半径（走者スプライトは34x20px）。
// アウトはこの判定のみで成立する。塁に送球しても何も起きない。
const PLAYING_RUNNER_HIT_RADIUS = 24;

// 点と線分の距離。送球は1フレームで大きく進むため、線分で走査して抜けを防ぐ。
function distancePointToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared === 0) return Math.hypot(px - ax, py - ay);
  const t = clamp(((px - ax) * dx + (py - ay) * dy) / lengthSquared, 0, 1);
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

// アウト処理の共通ロジック（走者に送球が当たったときだけ呼ばれる）
function applyRunnerTagOut(outRunner) {
  outRunner.state = "out";
  spawnRunnerTagBurst(outRunner.x, outRunner.y);
  renderPlayingRunners();

  // アウトランナー削除（少し後）— IDで絞り込むことでレースコンディションを防ぐ
  const outRunnerId = outRunner.id;
  setTimeout(() => {
    playingState.runners = playingState.runners.filter((r) => r.id !== outRunnerId);
    renderPlayingRunners();
  }, 500);

  const stillHasRunners = playingState.runners.some((r) => r !== outRunner && r.state === "running");

  if (stillHasRunners) {
    // アウトが出た瞬間、残った走者に「走れ！」の勢いを与える。
    // ボールは拾いやすいままにしたうえで、芋づる式の連続アウトだけを走者の脚で押し返す。
    playingState.runnerBoost = Math.max(
      playingState.runnerBoost,
      physics.runnerBoostMax * physics.runnerBoostOnOutRatio,
    );
    // 走者がまだいる → ボールを残してフィールダーが拾い直せる状態に。
    // アウトを取った送球はここで死ぬ。次の走者を刺すには拾って投げ直す必要がある。
    updatePlayingCall("OUT!", "is-out");
    gameProcessOut("OUT!");
    playingState.isHit = false;
    playingState.isFielderThrow = true;
    playingState.throwIsLive = false;
    playingState.isResting = true;
    playingState.isBallActive = false;
    playingState.isPitched = false;
    elements.playingBall.classList.add("is-resting");
  } else {
    // 走者がいなくなる → ボール消滅・通常モードへ
    playingState.isBallActive = false;
    playingState.isPitched = false;
    playingState.isFielderThrow = false;
    playingState.throwIsLive = false;
    hidePlayingBall();
    updatePlayingCall("OUT!", "is-out");
    gameProcessOut("OUT!");
  }
}

// 当たった位置に弾ける演出を出す
function spawnRunnerTagBurst(x, y) {
  const burst = document.createElement("div");
  burst.className = "runner-tag-burst";
  burst.style.left = `${x}px`;
  burst.style.top = `${y}px`;
  elements.playingSurface.appendChild(burst);
  setTimeout(() => burst.remove(), 620);
}

// 生きた送球が走っている走者に当たったらアウト。
// prevX/prevY からの線分で判定するので、速い送球でもすり抜けない。
function checkPlayingBallHitsRunners(prevX, prevY) {
  if (!playingState.isBallActive || playingState.isHit) return false;
  // 拾って投げた「生きた送球」だけが走者を刺せる。
  // 壁に当たって跳ね返った球は、拾い直して投げ直すまでアウトを取れない。
  if (!playingState.throwIsLive) return false;

  for (const runner of playingState.runners) {
    // 走っている走者だけが対象。塁上のセーフな走者とフォアボール進塁は当たらない。
    if (runner.state !== "running" || runner.fromWalk) continue;

    const dist = distancePointToSegment(
      runner.x, runner.y, prevX, prevY, playingState.ballX, playingState.ballY,
    );
    if (dist > PLAYING_RUNNER_HIT_RADIUS) continue;

    playSfx("out");
    applyRunnerTagOut(runner);
    return true;
  }

  return false;
}

function reflectPlayingBallFromBat() {
  playSoundKakin();
  reflectBallFromBatModel(playingState, {
    batElement: elements.playingBat,
    hitAngleElement: elements.playingBatHitAngle,
    reflectAngleElement: elements.playingBatReflectAngle,
    missMarkerElement: elements.playingContactMissMarker,
    updateCall: updatePlayingCall,
  });
  // 芯で捉えたら「芯!!」ポップを出す（狙って上達できるように当たりの質を可視化）
  if (playingState.lastHitQuality >= 0.85) {
    spawnSweetSpotPop(playingState.ballX, playingState.ballY);
  }
  playingState.swingMissed = false; // ヒットしたので空振り記録をクリア
  spawnRunnerOnHit();
  resetAtBat();
}

function spawnSweetSpotPop(x, y) {
  const pop = document.createElement("div");
  pop.className = "sweet-spot-pop";
  pop.textContent = "芯!!";
  pop.style.left = `${x}px`;
  pop.style.top = `${y}px`;
  elements.playingSurface.appendChild(pop);
  setTimeout(() => pop.remove(), 800);
}

function applyPlayingBounce() {
  updatePlayingCall("Bound!", "is-ball");
  playSfx("ballDrop");
  applyPitchModelBounce(playingState, getPlayingStrikeZoneRect(), { startRolling: startPlayingRolling, noJudge: true });
  playingState.isResting = true;
  elements.playingBall.classList.add("is-resting");
}

function startPlayingRolling() {
  startPitchModelRolling(playingState);
}

function getPlayingTopWallY() {
  const surfaceRect = elements.playingSurface.getBoundingClientRect();
  const wallRect = elements.playingTopWall.getBoundingClientRect();
  return wallRect.bottom - surfaceRect.top;
}

// 上壁に達した打球がホームランに足りているかを 1.0 基準で返す。
// 残りの飛距離（速度÷減衰）が、本塁〜上壁の距離の homeRunClearRatio 倍あれば 1 以上。
// 盤面の大きさに対する比で見るので、画面の高さが変わっても難度が動かない。
function getHomeRunClearance(model, rect) {
  const drag = model.hitDrag || physics.battingHitDragPerSecond;
  const fieldDepth = Math.max(1, getPlayingHomePlate(rect).y - getPlayingTopWallY());
  const remainingReach = model.currentSpeed / drag;
  return remainingReach / (physics.homeRunClearRatio * fieldDepth);
}

function applyPlayingEdgeBounce(rect) {
  const model = playingState;
  const margin = 8;
  const topWallY = getPlayingTopWallY();
  // 送球は壁でほぼ死ぬ。打球は従来どおり跳ね返る。
  const restitution = model.isFielderThrow
    ? physics.fielderThrowEdgeBounceRestitution
    : physics.battingEdgeBounceRestitution;
  // 壁に触れた送球は「生きた送球」ではなくなる（拾い直して投げ直すまでアウトにできない）
  const killThrow = () => {
    playingState.throwIsLive = false;
  };

  if (model.ballX <= margin && model.velocityX < 0) {
    model.ballX = margin;
    model.velocityX *= -restitution;
    model.velocityY *= restitution;
    killThrow();
  } else if (model.ballX >= rect.width - margin && model.velocityX > 0) {
    model.ballX = rect.width - margin;
    model.velocityX *= -restitution;
    model.velocityY *= restitution;
    killThrow();
  }

  if (model.ballY <= topWallY && model.velocityY < 0) {
    // ホームランは「上壁を越える時点で、さらに盤面の何割ぶん飛べるか」で判定する。
    // 絶対速度で判定していたときは、本塁から上壁までの距離が画面の高さで決まるため、
    // 低い画面ではHRが頻発し、高い画面では最大打球でも一本も出なかった。
    const isBlueHit =
      model.isHit &&
      getHomeRunClearance(model, rect) >= 1 &&
      (model.lastHitQuality ?? 0) >= physics.homeRunHitQuality;
    if (isBlueHit || playingState.isHomeRun) {
      // 青い打球は上辺で反射せず突き抜ける（ホームラン）
      if (isBlueHit && !playingState.isHomeRun) {
        triggerHomeRun();
      }
    } else {
      model.ballY = topWallY;
      model.velocityY *= -restitution;
      model.velocityX *= restitution;
      playSfx("wallBounce");
      killThrow();
      // 上壁まで届いた打球は「深い打球」: 静止後もしばらく拾えない（外野の再現）
      if (model.isHit) {
        playingState.isDeepHit = true;
      }
    }
  } else if (model.ballY >= rect.height - margin && model.velocityY > 0) {
    model.ballY = rect.height - margin;
    model.velocityY *= -restitution;
    model.velocityX *= restitution;
    playSfx("wallBounce");
    killThrow();
  }
}

function triggerHomeRun() {
  if (playingState.isHomeRun) return;
  playingState.isHomeRun = true;

  // 走者全員に残りの塁を順番に回らせてホームインさせる
  const rect = elements.playingSurface.getBoundingClientRect();
  const bases = getPlayingBasePositions(rect);
  for (const runner of playingState.runners) {
    if (runner.state === "out" || runner.state === "scored") continue;
    // 現在向かっている塁の次から home までのルートを作る
    const route = [];
    for (let i = runner.toBaseIndex + 1; i <= bases.length; i++) {
      route.push(i);
    }
    runner.route = route;
    runner.state = "running";
  }
  elements.playingRunLabel.textContent = "ホームラン！";
  updatePlayingCall("ホームラン！", "is-strike");
  startHomeRunCheer();
  // 画面点滅
  elements.playingSurface.classList.add("is-homerun-flash");
  setTimeout(() => elements.playingSurface.classList.remove("is-homerun-flash"), 950);
}

function startPlayingSwing(vector) {
  startBatModelSwing(playingState, elements.playingBat, vector);
}

function resetPlayingState() {
  stopPlayingAnimation();
  playingState.pitcherPointerId = null;
  playingState.pitcherTrail = [];
  playingState.pitcherReleaseCurve = 0;
  playingState.pitchOriginX = null;
  playingState.pitchOriginY = null;
  playingState.isPitched = false;
  playingState.pitchLeftPitcherArea = false;
  playingState.isBallActive = false;
  playingState.isHit = false;
  playingState.isResting = false;
  playingState.isHomeRun = false;
  playingState.isFielderThrow = false;
  playingState.throwIsLive = false;
  playingState.wasPickedUp = false;
  playingState.pickupX = 0;
  playingState.pickupY = 0;
  playingState.pitchJudged = false;
  playingState.motionMode = "flight";
  playingState.currentSpeed = 0;
  playingState.pitchRawSpeed = 0;
  playingState.velocityX = 0;
  playingState.velocityY = 0;
  playingState.hitDrag = physics.battingHitDragPerSecond;
  playingState.height = 0;
  playingState.initialHeight = 0;
  playingState.heightVelocity = 0;
  playingState.flightGravity = 0;
  playingState.bounceCount = 0;
  playingState.flightElapsed = 0;
  playingState.bounceMinTime = 0;
  playingState.curveAccelerationX = 0;
  playingState.curveRampDuration = 1;
  playingState.releaseDirectionX = 0;
  playingState.releaseDirectionY = 0;
  playingState.releaseCurve = 0;
  playingState.rollDirection = 1;
  playingState.batterPointerId = null;
  playingState.batterTrail = [];
  elements.playingBatterFinger.classList.add("is-hidden");
  playingState.isSwinging = false;
  playingState.swingTimer = 0;
  playingState.swingElapsed = 0;
  playingState.swingLingerTimer = 0;
  playingState.swingGateSpeed = 0;
  playingState.lastTick = 0;
  playingState.nextPitchReadyAt = 0;
  playingState.runners = [];
  playingState.inPlay = false;
  playingState.runnerBoost = 0;
  playingState.isDeepHit = false;
  playingState.restDelayElapsed = 0;
  playingState.isCornerHit = false;
  elements.playingBat.classList.remove("is-swinging", "is-hit");
  elements.playingBatHitAngle.classList.add("is-hidden");
  elements.playingBatReflectAngle.classList.add("is-hidden");
  elements.playingBall.classList.remove("is-resting", "is-deep-delay");
  elements.playingContactMissMarker.classList.add("is-hidden");
  updateContactableBall(elements.playingBall, false);
  hidePlayingBall();
  renderPlayingRunners();
  const batPos = getDefaultPlayingBatPosition();
  playingState.batBaseX = batPos.x;
  playingState.batBaseY = batPos.y;
  setPlayingBatPosition(batPos.x, batPos.y, physics.batRestAngle);
  playingState.batAngle = physics.batRestAngle;
  playingState.batReadyAngle = physics.batRestAngle;
  updatePlayingCall("READY");
  updatePlayingDebug();
}

function launchPlayingBall(vector) {
  playSoundWhoosh();
  // 通常投球のみエリア越え許容（山なり維持）を適用する。フィールダー送球は素直な直線。
  const launchOptions =
    !playingState.isFielderThrow && playingState.pitchOriginX !== null
      ? { arcOriginX: playingState.pitchOriginX, arcOriginY: playingState.pitchOriginY }
      : {};
  // 走者を刺しにいく送球だけ球速を落とす。投球は等倍のまま。
  if (playingState.isFielderThrow) {
    launchOptions.speedFactor = physics.fielderThrowSpeedFactor;
  }
  const launch = launchPitchModel(playingState, vector, getPlayingStrikeZoneRect(), launchOptions);
  // 拾って投げた送球だけが「生きた送球」。壁に触れるまでの間だけアウトを取れる。
  playingState.throwIsLive = playingState.isFielderThrow;
  playingState.pitchRawSpeed = clamp(launch.scaledSpeed, physics.battingMinRawSpeed, physics.battingMaxRawSpeed);
  playingState.isBallActive = true;
  playingState.isHit = false;
  playingState.isResting = false;
  playingState.isHomeRun = false;
  playingState.isPitched = true;
  playingState.pitchJudged = false;
  playingState.pitchLeftPitcherArea = false;
  playingState.isDeepHit = false;
  playingState.restDelayElapsed = 0;
  playingState.isCornerHit = false;
  elements.playingBat.classList.remove("is-hit");
  elements.playingBatHitAngle.classList.add("is-hidden");
  elements.playingBatReflectAngle.classList.add("is-hidden");
  elements.playingBall.classList.remove("is-resting");
  elements.playingBall.classList.remove("is-blue-hit");
  elements.playingBall.classList.remove("is-deep-delay");
  updateContactableBall(elements.playingBall, false);
  showPlayingBall();
  updatePlayingCall("SWING!");
  elements.playingHint.textContent = "Batter: swing up!";
  updatePlayingDebug();
}

// ===== デッドボール =====

// バッターの指に出す輪。見た目の半径と判定半径を同じ値から作り、ズレないようにする。
function updateBatterFingerRing() {
  const el = elements.playingBatterFinger;
  const show = playingState.batterPointerId !== null && !playingState.inPlay;

  el.classList.toggle("is-hidden", !show);
  if (!show) return;

  const size = physics.deadBallRadius * 2;
  el.style.width = `${size}px`;
  el.style.height = `${size}px`;
  el.style.marginLeft = `${-physics.deadBallRadius}px`;
  el.style.marginTop = `${-physics.deadBallRadius}px`;
  el.style.left = `${playingState.batterFingerX}px`;
  el.style.top = `${playingState.batterFingerY}px`;
}

function setBatterFinger(x, y) {
  playingState.batterFingerX = x;
  playingState.batterFingerY = y;
  updateBatterFingerRing();
}

// 輪がバラバラに弾ける
function spawnDeadBallBurst(x, y) {
  const pieces = 12;
  for (let i = 0; i < pieces; i += 1) {
    const angle = (Math.PI * 2 * i) / pieces + Math.random() * 0.3;
    const distance = physics.deadBallRadius * (1.6 + Math.random() * 1.4);
    const piece = document.createElement("div");
    piece.className = "dead-ball-piece";
    piece.style.left = `${x + Math.cos(angle) * physics.deadBallRadius}px`;
    piece.style.top = `${y + Math.sin(angle) * physics.deadBallRadius}px`;
    piece.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
    piece.style.setProperty("--dy", `${Math.sin(angle) * distance}px`);
    piece.style.setProperty("--spin", `${(Math.random() - 0.5) * 540}deg`);
    elements.playingSurface.appendChild(piece);
    setTimeout(() => piece.remove(), 700);
  }
}

// 得点をピッチャー側のスコア表示へ飛ばし、着いたところで加点する
function flyDeadBallPointToScore(fromX, fromY, onArrive) {
  const surfaceRect = elements.playingSurface.getBoundingClientRect();
  const targetEl = gameState.isTop ? elements.statusTeamRed : elements.statusTeamBlue;
  const targetRect = targetEl.getBoundingClientRect();
  const toX = targetRect.left - surfaceRect.left + targetRect.width * 0.5;
  const toY = targetRect.top - surfaceRect.top + targetRect.height * 0.5;

  const el = document.createElement("div");
  el.className = `dead-ball-point ${gameState.isTop ? "team-red" : "team-blue"}`;
  el.textContent = "+1";
  el.style.left = `${fromX}px`;
  el.style.top = `${fromY}px`;
  elements.playingSurface.appendChild(el);

  // 1フレーム置いてから transform を変えることで transition を確実に走らせる
  requestAnimationFrame(() => {
    el.style.transform = `translate(${toX - fromX}px, ${toY - fromY}px) scale(0.55)`;
  });

  setTimeout(() => {
    el.remove();
    onArrive();
  }, physics.deadBallPointFlightMs);
}

// 投球がバッターの指に当たった: ピッチャー側に1点
function triggerDeadBall(hitX, hitY) {
  playingState.pitchJudged = true;
  playSfx("wallBounce");
  spawnDeadBallBurst(hitX, hitY);
  elements.playingBatterFinger.classList.add("is-hidden");

  finishPlayingPitch(DEAD_BALL_TEXT);
  updatePlayingCall(DEAD_BALL_TEXT, "is-dead");
  playingState.nextPitchReadyAt = performance.now() + physics.deadBallPointFlightMs + 300;

  flyDeadBallPointToScore(hitX, hitY, () => {
    if (gameState.phase !== "playing") return;
    addRunForPitchingTeam();
    playSfx("score");
    saveGameToDB();
    if (shouldEndOnWalkoff() && !hasPendingHomeRunScores()) gameDoGameSet();
  });

  // 指がまだ乗っていれば輪は復活する
  setTimeout(() => updateBatterFingerRing(), physics.deadBallPointFlightMs);
}

// 守備側（投げている側）に1点。表=青軍攻撃なので、投げているのは裏返しのチーム。
function addRunForPitchingTeam() {
  const teamIdx = gameState.isTop ? 1 : 0;
  gameState.score[teamIdx]++;
  const inningIdx = gameState.inning - 1;
  if (inningIdx < 9) gameState.inningScores[inningIdx][teamIdx]++;
  updateStatusBar();
}

// ピッチャーエリアを出られなかった投球は「投げミス」。
// 手が滑った・置いただけ、といった事故をカウントに残さないための扱い。
function isPitchMiss() {
  return (
    playingState.isPitched &&
    !playingState.isHit &&
    !playingState.isFielderThrow &&
    !playingState.pitchLeftPitcherArea
  );
}

const PITCH_MISS_TEXT = "投げミス";
const DEAD_BALL_TEXT = "デッドボール";

function finishPitchAsMiss() {
  // カウントは動かさない。judged を立てて以降の判定を止めるだけ。
  playingState.pitchJudged = true;
  playSfx("ball");
  finishPlayingPitch(PITCH_MISS_TEXT);
  updatePlayingCall(PITCH_MISS_TEXT, "is-miss");
  // やり直しなので通常より短い間隔で次を受け付ける
  playingState.nextPitchReadyAt = performance.now() + physics.pitchMissRetryDelayMs;
}

function finishPlayingPitch(message = "READY") {
  playingState.swingMissed = false;
  playingState.isBallActive = false;
  hidePlayingBall();
  updatePlayingCall(message);
  playingState.isPitched = false;
  playingState.nextPitchReadyAt = performance.now() + 800;
  elements.playingHint.textContent = "Pitcher: swipe up to pitch  /  Batter: swing up";
  // フィールダーピックアップ／フィールダースロー状態をクリア（ドラッグ制限を次の通常投球に引き継がない）
  // isFielderThrow と isResting も同期してリセットすることで、次の beginPlayingPointer の
  // ballOnField 判定が古い状態を参照しないようにする。
  playingState.wasPickedUp = false;
  playingState.pickupX = 0;
  playingState.pickupY = 0;
  playingState.isFielderThrow = false;
  playingState.throwIsLive = false;
  playingState.isResting = false;
  playingState.isDeepHit = false;
  playingState.restDelayElapsed = 0;
  playingState.isCornerHit = false;
}

function animatePlaying(timeStamp) {
  if (!playingState.isRunning) return;
  if (!playingState.lastTick) playingState.lastTick = timeStamp;
  const dt = Math.min((timeStamp - playingState.lastTick) / 1000, 0.032);
  playingState.lastTick = timeStamp;

  // スイングアニメーション
  if (playingState.isSwinging) {
    playingState.swingTimer -= dt;
    playingState.swingElapsed += dt;
    const progress = clamp(playingState.swingElapsed / physics.battingSwingDuration, 0, 1);
    const ease = 1 - (1 - progress) * (1 - progress);
    const angle = playingState.swingStartAngle + (playingState.swingEndAngle - playingState.swingStartAngle) * ease;
    setPlayingBatPosition(playingState.batX, playingState.batY, angle);
    if (playingState.swingTimer <= 0) {
      playingState.isSwinging = false;
      elements.playingBat.classList.remove("is-swinging");
      setPlayingBatPosition(playingState.batX, playingState.batY, playingState.swingEndAngle);
      // スイング終了後に短い接触猶予ウィンドウを設ける（少し早いスイングでも当たるように）
      // 空振り判定はリンガー終了後まで遅延する
      playingState.swingLingerTimer = physics.battingSwingLingerDuration;
    }
  }

  // リンガータイマー処理（スイング終了後の接触猶予期間）
  if (playingState.swingLingerTimer > 0) {
    playingState.swingLingerTimer -= dt;
    if (playingState.swingLingerTimer <= 0) {
      playingState.swingLingerTimer = 0;
      // 空振り判定: リンガー終了後にボールが当たっていなければストライク
      if (playingState.isPitched && !playingState.isHit && !playingState.pitchJudged) {
        playingState.swingMissed = true;
        playingState.pitchJudged = true;
        playSoundSwingMiss();
        updatePlayingCall("STRIKE", "is-strike");
        gameProcessStrike();
      }
    }
  }

  if (playingState.isBallActive) {
    const rect = elements.playingSurface.getBoundingClientRect();
    const previousX = playingState.ballX;
    const previousY = playingState.ballY;
    const previousHeight = playingState.height;

    if (!playingState.isHit && !playingState.isFielderThrow) {
      if (playingState.motionMode === "flight") {
        playingState.flightElapsed += dt;
        const dragFactor = Math.exp(-physics.dragPerSecond * dt);
        const sideDragFactor = Math.exp(-physics.sideDragPerSecond * dt);
        playingState.velocityX *= sideDragFactor;
        playingState.velocityY *= dragFactor;

        if (playingState.bounceCount === 0 && Math.abs(playingState.curveAccelerationX) > 0.0001) {
          const curveRamp = clamp(playingState.flightElapsed / playingState.curveRampDuration, 0, 1);
          playingState.velocityX += playingState.curveAccelerationX * curveRamp * dt;
        }

        if (playingState.height < 28 && playingState.heightVelocity < 0) {
          const groundFactor = playingState.height / 28;
          const approachDrag = Math.exp(-physics.pitchGroundDragPerSecond * (1 - groundFactor) * dt);
          playingState.velocityX *= approachDrag;
          playingState.velocityY *= approachDrag;
        }

        playingState.ballX += playingState.velocityX * dt;
        playingState.ballY += playingState.velocityY * dt;
        playingState.heightVelocity -= playingState.flightGravity * dt;
        playingState.height += playingState.heightVelocity * dt;

        // バウンド判定: 着地かつストライクゾーン上方（まだゾーンに届いていない）
        const landedBeforeZone = previousHeight > 0 && playingState.height <= 0 && !playingState.pitchJudged;
        if (playingState.flightElapsed >= playingState.bounceMinTime && landedBeforeZone && playingState.heightVelocity < 0) {
          applyPlayingBounce();
        }

        playingState.currentSpeed = Math.hypot(playingState.velocityX, playingState.velocityY);

        const readyToRollBySpeed = playingState.currentSpeed <= physics.rollTriggerSpeed;
        const readyToRollByPosition =
          playingState.pitchJudged &&
          (playingState.ballY >= rect.height - physics.rollTopBand ||
            playingState.ballY <= physics.rollTopBand ||
            playingState.ballX <= physics.rollTopBand ||
            playingState.ballX >= rect.width - physics.rollTopBand);
        if (playingState.bounceCount > 0 && (readyToRollBySpeed || readyToRollByPosition)) {
          startPlayingRolling();
        }
      } else {
        // rolling
        const rollDragFactor = Math.exp(-physics.rollDragPerSecond * dt);
        playingState.velocityX *= rollDragFactor;
        playingState.velocityY *= rollDragFactor;
        playingState.ballX += playingState.velocityX * dt;
        playingState.ballY += playingState.velocityY * dt;
        playingState.currentSpeed = Math.hypot(playingState.velocityX, playingState.velocityY);
      }
    } else {
      // 打球は等倍、フィールダー送球は launchPitchModel で落とした減衰を使う
      const drag = Math.exp(-(playingState.hitDrag || physics.battingHitDragPerSecond) * dt);
      playingState.velocityX *= drag;
      playingState.velocityY *= drag;
      // 引き継いだ投球カーブを打球に適用（isHit のみ、フィールダー投球には適用しない）
      if (playingState.isHit && Math.abs(playingState.curveAccelerationX) > physics.hitBallCurveThreshold) {
        playingState.velocityX += playingState.curveAccelerationX * dt;
        playingState.curveAccelerationX *= Math.exp(-physics.hitBallCurveDecayRate * dt);
      }
      playingState.ballX += playingState.velocityX * dt;
      playingState.ballY += playingState.velocityY * dt;
      playingState.currentSpeed = Math.hypot(playingState.velocityX, playingState.velocityY);
    }

    setPlayingBallPosition(playingState.ballX, playingState.ballY);
    // Playing プロトではオレンジ（contactable）表示不要

    // 投球がピッチャーエリア（上半分）を出たかを記録する。
    // 一度でも出ていれば正規の投球として判定し、出られなければ投げミス扱いにする。
    if (
      !playingState.pitchLeftPitcherArea &&
      !playingState.isHit &&
      !playingState.isFielderThrow &&
      playingState.ballY >= rect.height * 0.5
    ) {
      playingState.pitchLeftPitcherArea = true;
    }

    // 送球が走者に当たったか（アウトはこれだけ）
    if (!playingState.isHit) { // isFielderThrow も isHit=false なので通過する
      if (checkPlayingBallHitsRunners(previousX, previousY)) {
        updatePlayingRunners(0);
        updatePlayingDebug();
        playingState.animationFrameId = window.requestAnimationFrame(animatePlaying);
        return;
      }
    }

    if (playingState.isHit || playingState.isFielderThrow) {
      updateContactableBall(elements.playingBall, false);
      applyPlayingEdgeBounce(rect);
      setPlayingBallPosition(playingState.ballX, playingState.ballY);

      // コーナー二塁打ゾーン到達判定（打球のみ）
      if (playingState.isHit && !playingState.isCornerHit) {
        const wallY = getPlayingTopWallY();
        const inCornerBand = playingState.ballY <= wallY + physics.cornerZoneHeight;
        const inCornerSide =
          playingState.ballX <= rect.width * physics.cornerZoneWidthRatio ||
          playingState.ballX >= rect.width * (1 - physics.cornerZoneWidthRatio);
        if (inCornerBand && inCornerSide) playingState.isCornerHit = true;
      }

    }

    // 速度二百以上のヒット球は青く表示
    if (playingState.isHit && (playingState.currentSpeed >= physics.homeRunSpeedThreshold || playingState.isHomeRun)) {
      elements.playingBall.classList.add("is-blue-hit");
    } else {
      elements.playingBall.classList.remove("is-blue-hit");
    }

    updatePlayingBallTail();

    // バットとの接触判定
    if (
      (playingState.isSwinging || playingState.swingLingerTimer > 0) &&
      !playingState.isHit &&
      !playingState.isFielderThrow &&
      !playingState.pitchJudged &&
      checkBatModelContact(playingState, previousX, previousY)
    ) {
      updateContactableBall(elements.playingBall, false);
      reflectPlayingBallFromBat();
    }

    // デッドボール: 投球がバッターの指（輪）に当たったらピッチャー側に1点。
    // バット接触判定の後に置くことで、打てた場合はそちらが優先される。
    if (
      !playingState.pitchJudged &&
      !playingState.isHit &&
      !playingState.isFielderThrow &&
      playingState.isPitched &&
      playingState.batterPointerId !== null &&
      !playingState.inPlay
    ) {
      const fingerDist = distancePointToSegment(
        playingState.batterFingerX, playingState.batterFingerY,
        previousX, previousY, playingState.ballX, playingState.ballY,
      );
      if (fingerDist <= physics.deadBallRadius) {
        triggerDeadBall(playingState.batterFingerX, playingState.batterFingerY);
        updatePlayingRunners(dt);
        updatePlayingDebug();
        playingState.animationFrameId = window.requestAnimationFrame(animatePlaying);
        return;
      }
    }

    // ストライクゾーン侵入判定（バウンド済みは常にボール、フィールダー投球は除く）
    if (!playingState.pitchJudged && !playingState.isHit && !playingState.isFielderThrow) {
      const pzone = getPlayingStrikeZoneRect();
      const inZone =
        playingState.ballX >= pzone.left && playingState.ballX <= pzone.right &&
        playingState.ballY >= pzone.top && playingState.ballY <= pzone.bottom;
      if (inZone) {
        playingState.pitchJudged = true;
        const isStrike = playingState.bounceCount === 0;
        updatePlayingCall(isStrike ? "STRIKE" : "BALL", isStrike ? "is-strike" : "is-ball");
        if (isStrike) { playSoundStrike(); gameProcessStrike(); } else { playSoundBall(); gameProcessBall(); }
      }
    }

    // 投球がゾーン横を素通りした場合
    if (!playingState.pitchJudged && !playingState.isHit && !playingState.isFielderThrow) {
      if (playingState.ballX < -28 || playingState.ballX > rect.width + 28) {
        if (isPitchMiss()) {
          finishPitchAsMiss();
          updatePlayingRunners(dt);
          updatePlayingDebug();
          playingState.animationFrameId = window.requestAnimationFrame(animatePlaying);
          return;
        }
        playingState.pitchJudged = true;
        updatePlayingCall("BALL", "is-ball");
        playSoundBall(); gameProcessBall();
      }
    }

    // 休止状態（赤くなる）
    // 以前はピックアップ後に閾値2倍としていたが、battingRestSpeed 90 では再ピックアップが
    // 速すぎて連続アウト（併殺）が簡単になりすぎるため倍率を廃止
    const effectiveRestSpeed = physics.battingRestSpeed;
    if ((playingState.isHit || playingState.isFielderThrow) && !playingState.isResting && playingState.currentSpeed <= effectiveRestSpeed) {
      // 深い打球・コーナー打球は静止後すぐには拾えない（野手が外野まで取りに行く時間）
      const pickupDelay = playingState.isCornerHit
        ? physics.cornerZonePickupDelay
        : physics.deepHitPickupDelay;
      if ((playingState.isDeepHit || playingState.isCornerHit) && playingState.restDelayElapsed < pickupDelay) {
        playingState.restDelayElapsed += dt;
        elements.playingBall.classList.add("is-deep-delay");
      } else {
        playingState.isResting = true;
        elements.playingBall.classList.remove("is-deep-delay");
        elements.playingBall.classList.add("is-resting");
      }
    }

    const isOutside =
      playingState.ballY > rect.height + 80 ||
      playingState.ballY < -80 ||
      playingState.ballX < -80 ||
      playingState.ballX > rect.width + 80;
    const isRollStopped = playingState.motionMode === "rolling" && !playingState.isHit && !playingState.isFielderThrow && playingState.currentSpeed <= physics.rollStopSpeed;
    const isFlightStuck =
      !playingState.isHit &&
      !playingState.isFielderThrow &&
      playingState.motionMode === "flight" &&
      playingState.flightElapsed > 0.35 &&
      playingState.height <= 0 &&
      playingState.currentSpeed <= physics.rollStopSpeed;
    // isResting を条件に含めることで、深い打球の遅延中に isBallActive が落ちて
    // 遅延カウントが止まる（＝永久に拾えなくなる）ことを防ぐ
    const isStopped = (playingState.isHit || playingState.isFielderThrow) && playingState.currentSpeed <= physics.battingStopSpeed && playingState.isResting;

    if (isStopped) {
      // 完全停止: ピッチャーが拾えるように isPitched を false に
      playingState.isBallActive = false;
      playingState.isPitched = false;
      playingState.pitchJudged = false;
      playingState.swingMissed = false;
    } else if (isRollStopped || isFlightStuck || isOutside) {
      // フィールダー送球は投球ではないためボールカウントに影響させない
      if (!playingState.pitchJudged && !playingState.isFielderThrow) {
        if (isPitchMiss()) {
          finishPitchAsMiss();
          updatePlayingRunners(dt);
          updatePlayingDebug();
          playingState.animationFrameId = window.requestAnimationFrame(animatePlaying);
          return;
        }
        playingState.pitchJudged = true;
        updatePlayingCall("BALL", "is-ball");
        playSoundBall(); gameProcessBall();
      }
      finishPlayingPitch(playingState.isHit ? "HIT" : elements.playingCall.textContent);
    }
  }

  updatePlayingRunners(dt);
  updatePlayingDebug();
  playingState.animationFrameId = window.requestAnimationFrame(animatePlaying);
}

function showPlayingScreen(maxInnings = 9) {
  cancelResetHold();
  stopPitchAnimation();
  stopBattingAnimation();
  stopPlayingAnimation();
  hideBall();
  hideBattingBall();
  elements.mainScreen.classList.add("is-hidden");
  elements.prototypeScreen.classList.add("is-hidden");
  elements.battingScreen.classList.add("is-hidden");
  elements.playingScreen.classList.remove("is-hidden");
  clearSaveData();
  resetGameState();
  gameState.maxInnings = maxInnings;
  resetPlayingState();
  updatePlayingBasesDOM();
  gameState.phase = "playing";
  updateStatusBar();
  // PLAY BALL オーバーレイを 1.2s 表示してから試合開始
  playSfx("start");
  showOverlay("PLAY BALL!", "", false);
  playingState.isRunning = false;
  elements.playingResetBtn.style.pointerEvents = "none";
  setTimeout(() => {
    hideOverlay();
    playingState.isRunning = true;
    elements.playingResetBtn.style.pointerEvents = "";
    playingState.animationFrameId = window.requestAnimationFrame(animatePlaying);
  }, 1200);
}

// ---- Playing pointer handlers ----

function getPlayingSurfacePoint(event) {
  const rect = elements.playingSurface.getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
}

function hasActiveRunners() {
  return playingState.runners.some((r) => r.state === "running");
}

function updatePlayingMode() {
  const running = hasActiveRunners();
  const wasRunnerMode = !elements.playingRunLabel.classList.contains("is-hidden");
  // 走者ブーストのタップエリア表示: ブーストが効く状況（インプレー中の走者あり）のみ
  // フォアボール進塁（inPlay=false）ではタップが無効なので表示しない
  elements.runnerBoostArea.classList.toggle("is-hidden", !(running && playingState.inPlay));
  if (running) {
    if (!wasRunnerMode) {
      // 走者モード突入時のみUI切替
      // 打った直後は指が乗ったままなので、デッドボールの輪をここで確実に消す
      elements.playingBatterFinger.classList.add("is-hidden");
      elements.playingMound.classList.add("is-hidden");
      elements.playingDivider.classList.add("is-hidden");
      elements.playingLabelPitcher.classList.add("is-hidden");
      elements.playingLabelBatter.classList.add("is-hidden");
      elements.playingRunLabel.classList.remove("is-hidden");
      elements.playingTagLabel.classList.remove("is-hidden");
      elements.playingHint.textContent = "拾って走者にぶつけるとアウト";
      elements.playingStrikeZone.classList.add("is-hidden");
      elements.playingHomeBase.classList.remove("is-hidden");
    }
    updatePlayingHomBaseDOM();
  } else {
    if (wasRunnerMode) {
      // 通常モード復帰時のみUI切替
      updatePlayingMoundDOM();
      elements.playingMound.classList.remove("is-hidden");
      elements.playingDivider.classList.remove("is-hidden");
      elements.playingLabelPitcher.classList.remove("is-hidden");
      elements.playingLabelBatter.classList.remove("is-hidden");
      elements.playingRunLabel.classList.add("is-hidden");
      elements.playingTagLabel.classList.add("is-hidden");
      elements.playingHint.textContent = "Pitcher: swipe up to pitch  /  Batter: swing up";
      elements.playingStrikeZone.classList.remove("is-hidden");
      elements.playingHomeBase.classList.add("is-hidden");
      // フィールディングモード用のピックアップ状態をクリア（ピッチャーのドラッグ制限を解除）
      playingState.wasPickedUp = false;
      playingState.pickupX = 0;
      playingState.pickupY = 0;
      // ホームラン状態をクリア（全走者得点後に次の投球を許可）
      playingState.isHomeRun = false;
      // プレー終了の区切り: インプレー解除 + 次の投球までクールダウン
      playingState.inPlay = false;
      playingState.runnerBoost = 0;
      playingState.nextPitchReadyAt = performance.now() + physics.playEndPitchCooldownMs;
    }
  }
}

function isTopHalf(y) {
  // 走者が走っている場合は全画面がフィールダーエリア
  if (hasActiveRunners()) return true;
  const rect = elements.playingSurface.getBoundingClientRect();
  return y < rect.height * 0.5;
}

function beginPlayingPointer(event) {
  if (gameState.phase !== "playing" || !playingState.isRunning) return;

  const point = getPlayingSurfacePoint(event);
  if (isTopHalf(point.y)) {
    // ピッチャー側
    // ピックアップ判定: ヒット or フィールダースローが赤くなった（isResting）後のみ拾える
    // ボール位置に十分近い場合のみピックアップ可
    const ballOnField =
      (playingState.isHit || playingState.isFielderThrow) && playingState.isResting;
    const nearBall = ballOnField &&
      Math.hypot(point.x - playingState.ballX, point.y - playingState.ballY) <= 36;

    // 走者ブーストの連打は、フィールダーがボールを掴んで送球を構えている最中でも
    // 必ず受け付ける（マルチタッチ前提）。以前は pitcherPointerId の早期 return に
    // 飲み込まれ、送球モーション中だけ連打が無効になっていた。
    if (!nearBall && playingState.inPlay) {
      const surfaceRect = elements.playingSurface.getBoundingClientRect();
      if (point.y >= surfaceRect.height * 0.5) {
        applyRunnerBoostTap(point.x, point.y);
        return;
      }
    }

    if (playingState.pitcherPointerId !== null) return;

    if (nearBall) {
      playingState.isFielderThrow = true;
      playingState.isBallActive = false;
      playingState.isHit = false;
      playingState.isResting = false;
      playingState.isPitched = false;
      playingState.pitchJudged = false;
      playingState.swingMissed = false;
      playingState.wasPickedUp = true;
      // 拾った瞬間は「まだ投げていない」。投げ直すまでアウトは取れない。
      playingState.throwIsLive = false;
      playingState.pickupX = point.x;
      playingState.pickupY = point.y;
      playingState.isDeepHit = false;
      playingState.restDelayElapsed = 0;
      playingState.isCornerHit = false;
      elements.playingBall.classList.remove("is-resting", "is-deep-delay");
      hidePlayingBall();
    }

    // インプレー中はピックアップ以外で投球を開始できない（区切り）。
    // 下半分のタップは上で走者ブーストとして処理済み。
    if (!nearBall && playingState.inPlay) return;

    if (playingState.isPitched) return; // まだ飛行中

    // フォアボール中（fromWalk の走者が走っている）またはホームラン中は新規投球を禁止。
    // ただし nearBall=true でボールを今拾った直後はフィールダースローを許可。
    const isWalkInProgress = playingState.runners.some((r) => r.state === "running" && r.fromWalk);
    if (!nearBall && (isWalkInProgress || playingState.isHomeRun)) return;


    // プレー終了直後のクールダウン中は次の投球を受け付けない（区切り）
    if (!nearBall && performance.now() < playingState.nextPitchReadyAt) return;

    // 通常投球はマウンドの円の中からしか開始できない。
    // 守備の流れの中でピッチャーエリアを触ったときに、意図せず投球が始まるのを防ぐ。
    // 投げ始めた後は円を出て構わない（リリース位置は自由）。
    if (!nearBall && !isInsidePlayingMound(point.x, point.y)) return;

    // 通常投球開始時（ピックアップなし）はフィールダーピックアップ状態をクリア
    if (!nearBall) {
      playingState.wasPickedUp = false;
      playingState.pickupX = 0;
      playingState.pickupY = 0;
      playingState.isFielderThrow = false;
    }

    // 通常のピッチ開始（またはピックアップ直後のフィールダースロー開始）
    // 投げ始めた位置を記録しておき、エリアを越えてリリースしても山なりを保たせる
    playingState.pitchOriginX = nearBall ? null : point.x;
    playingState.pitchOriginY = nearBall ? null : point.y;
    playingState.pitcherPointerId = event.pointerId;
    elements.playingSurface.setPointerCapture(event.pointerId);
    playingState.pitcherTrail = [];
    setPlayingBallPosition(point.x, point.y);
    showPlayingBall();
    pushPlayingPitcherTrail(point.x, point.y, event.timeStamp);
  } else {
    // バッター側
    if (playingState.batterPointerId !== null) return;
    playingState.batterPointerId = event.pointerId;
    elements.playingSurface.setPointerCapture(event.pointerId);
    const batPos = getDefaultPlayingBatPosition();
    playingState.batterTrail = [];
    playingState.batBaseX = batPos.x;
    playingState.batBaseY = batPos.y;
    playingState.batPointerStartX = point.x;
    playingState.batPointerStartY = point.y;
    playingState.batReadyAngle = physics.batRestAngle;
    setBatterFinger(point.x, point.y);
    elements.playingBatHitAngle.classList.add("is-hidden");
    elements.playingBatReflectAngle.classList.add("is-hidden");
    setPlayingBatPosition(batPos.x, batPos.y, physics.batRestAngle);
    pushPlayingBatterTrail(point.x, point.y, event.timeStamp);
  }
}

function movePlayingPointer(event) {
  const point = getPlayingSurfacePoint(event);
  if (event.pointerId === playingState.pitcherPointerId) {
    // ボールが指に追従（ピックアップ後は最大ドラッグ距離を制限し弾きのみ可能）
    if (!playingState.isBallActive) {
      if (playingState.wasPickedUp) {
        const dx = point.x - playingState.pickupX;
        const dy = point.y - playingState.pickupY;
        const dist = Math.hypot(dx, dy);
        if (dist > physics.fielderPickupMaxDrag) {
          const scale = physics.fielderPickupMaxDrag / dist;
          setPlayingBallPosition(playingState.pickupX + dx * scale, playingState.pickupY + dy * scale);
        } else {
          setPlayingBallPosition(point.x, point.y);
        }
      } else {
        setPlayingBallPosition(point.x, point.y);
      }
    }
    pushPlayingPitcherTrail(point.x, point.y, event.timeStamp);
  } else if (event.pointerId === playingState.batterPointerId) {
    if (!playingState.isSwinging) {
      placePlayingBatOnSwingLine(point.x, point.y);
    }
    setBatterFinger(point.x, point.y);
    pushPlayingBatterTrail(point.x, point.y, event.timeStamp);
    const vec = getPlayingBatterVector();
    playingState.swingGateSpeed = Math.max(0, -vec.velocityY);
    if (playingState.swingGateSpeed >= physics.battingSwingThreshold) {
      startPlayingSwing(vec);
    }
  }
}

function endPlayingPointer(event) {
  const point = getPlayingSurfacePoint(event);
  if (event.pointerId === playingState.pitcherPointerId) {
    pushPlayingPitcherTrail(point.x, point.y, event.timeStamp);
    playingState.pitcherPointerId = null;
    const vector = getPlayingPitcherReleaseVector();
    if (!vector || vector.speed < 120) {
      // 弱投 → 方向保持ソフトリリース
      const fallback = createPlayingSoftReleaseVector(vector);
      launchPlayingBall(fallback);
    } else {
      launchPlayingBall(vector);
    }
    playingState.pitcherTrail = [];
  } else if (event.pointerId === playingState.batterPointerId) {
    if (!playingState.isSwinging) {
      placePlayingBatOnSwingLine(point.x, point.y);
    }
    pushPlayingBatterTrail(point.x, point.y, event.timeStamp);
    playingState.batterPointerId = null;
    playingState.batterTrail = [];
    updateBatterFingerRing();
  }
}

function pushPlayingPitcherTrail(x, y, timeStamp) {
  playingState.pitcherTrail.push({ x, y, timeStamp });
  const cutoff = timeStamp - 260;
  playingState.pitcherTrail = playingState.pitcherTrail.filter((p) => p.timeStamp >= cutoff).slice(-18);
}

function getPlayingPitcherReleaseVector() {
  return getTrailReleaseVectorWithGrace(
    playingState.pitcherTrail,
    35,
    physics.pitchReleaseGraceMs,
    physics.pitchReleaseGraceRatio,
  );
}

function getReleaseCurveFromTrail(trail) {
  return getTrailCurve(trail);
}

function pushPlayingBatterTrail(x, y, timeStamp) {
  playingState.batterTrail.push({ x, y, timeStamp });
  const cutoff = timeStamp - 140;
  playingState.batterTrail = playingState.batterTrail.filter((p) => p.timeStamp >= cutoff).slice(-10);
}

function getPlayingBatterVector() {
  const trail = playingState.batterTrail;
  if (trail.length < 2) return { velocityX: 0, velocityY: 0, speed: 0 };
  const last = trail[trail.length - 1];
  let base = trail[0];
  for (let i = trail.length - 2; i >= 0; i--) {
    if (last.timeStamp - trail[i].timeStamp >= 30) { base = trail[i]; break; }
  }
  const dt = Math.max(last.timeStamp - base.timeStamp, 16);
  const vx = ((last.x - base.x) / dt) * 1000;
  const vy = ((last.y - base.y) / dt) * 1000;
  return { velocityX: vx, velocityY: vy, speed: Math.hypot(vx, vy) };
}

// 画面サイズ・向きが変わったら塁とマウンドの描画位置を作り直す。
// 判定側は毎フレーム rect から計算しているので、描画だけが取り残されるのを防ぐ。
// 特にマウンドは投球開始の当たり判定を兼ねるため、見た目とのズレは操作不能に直結する。
function refreshPlayingLayout() {
  if (elements.playingScreen.classList.contains("is-hidden")) return;
  updatePlayingBasesDOM();
  updatePlayingHomBaseDOM();
  renderPlayingRunners();
}

window.addEventListener("resize", refreshPlayingLayout);
window.addEventListener("orientationchange", refreshPlayingLayout);

elements.playingSurface.addEventListener("pointerdown", beginPlayingPointer);
elements.playingSurface.addEventListener("pointermove", movePlayingPointer);
elements.playingSurface.addEventListener("pointerup", endPlayingPointer);
elements.playingSurface.addEventListener("pointercancel", endPlayingPointer);

// ===== IndexedDB セーブ/ロード =====
const DB_NAME = "baseballGame";
const DB_STORE = "saveData";
const DB_KEY = "gameState";

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = (e) => {
      e.target.result.createObjectStore(DB_STORE);
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = () => reject(req.error);
  });
}

function saveGameToDB() {
  if (gameState.phase !== "playing") return;
  const savedRunners = playingState.runners
    .filter((r) => r.state === "safe")
    .map((r) => ({ toBaseIndex: r.toBaseIndex, colorClass: r.colorClass }));
  const data = {
    inning: gameState.inning,
    isTop: gameState.isTop,
    outs: gameState.outs,
    balls: gameState.balls,
    strikes: gameState.strikes,
    score: [...gameState.score],
    inningScores: gameState.inningScores.map((r) => [...r]),
    maxInnings: gameState.maxInnings,
    runners: savedRunners,
    savedAt: Date.now(),
  };
  openDB().then((db) => {
    const tx = db.transaction(DB_STORE, "readwrite");
    tx.objectStore(DB_STORE).put(data, DB_KEY);
  }).catch(() => {});
}

function clearSaveData() {
  openDB().then((db) => {
    const tx = db.transaction(DB_STORE, "readwrite");
    tx.objectStore(DB_STORE).delete(DB_KEY);
  }).catch(() => {});
}

function loadGameFromDB() {
  return openDB().then((db) => {
    return new Promise((resolve) => {
      const tx = db.transaction(DB_STORE, "readonly");
      const req = tx.objectStore(DB_STORE).get(DB_KEY);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  }).catch(() => null);
}

function applyLoadedGame(data) {
  gameState.maxInnings = [3, 9].includes(Number(data.maxInnings)) ? Number(data.maxInnings) : 9;
  gameState.inning = clamp(Number(data.inning) || 1, 1, gameState.maxInnings);
  gameState.isTop = Boolean(data.isTop);
  gameState.outs = clamp(Number(data.outs) || 0, 0, 2);
  gameState.balls = clamp(Number(data.balls) || 0, 0, 3);
  gameState.strikes = clamp(Number(data.strikes) || 0, 0, 2);
  gameState.score = Array.isArray(data.score) ? [...data.score] : [0, 0];
  gameState.inningScores = Array.isArray(data.inningScores)
    ? data.inningScores.map((r) => [...r])
    : Array.from({ length: 9 }, () => [0, 0]);
  gameState.phase = "playing";
}

function restoreRunnersFromSave(savedRunners) {
  if (!savedRunners || savedRunners.length === 0) return;
  const rect = elements.playingSurface.getBoundingClientRect();
  const bases = getPlayingBasePositions(rect);
  const home = getPlayingHomePlate(rect);
  playingState.runners = savedRunners.map((r) => {
    const pos = r.toBaseIndex < bases.length ? bases[r.toBaseIndex] : home;
    return {
      id: Date.now() + Math.random(),
      x: pos.x,
      y: pos.y,
      fromX: pos.x,
      fromY: pos.y,
      toBaseIndex: r.toBaseIndex,
      progress: 1,
      state: "safe",
      colorClass: r.colorClass,
      speed: 94,
      fromWalk: false,
      route: [],
    };
  });
  renderPlayingRunners();
}

// ===== Sound Effects =====
// MP3 アセットを使用。短い効果音は同時再生のため都度 new Audio() で生成し、
// ループ系（走者の足音／ホームラン中のざわめき）は単一インスタンスを管理する。

const SOUND_FILES = {
  start:        "assets/sound/airhorn.mp3",         // 試合開始/再開
  hit:          "assets/sound/bat_cheer.mp3",       // 球を打つ
  pitch:        "assets/sound/pitch_throw.mp3",     // ピッチャーが投げる
  runnerLoop:   "assets/sound/runner_dirt.mp3",     // 走者が走る (ループ)
  baseReach:    "assets/sound/sliding.mp3",         // 走者が塁に到着
  wallBounce:   "assets/sound/wall_bounce.mp3",     // ボールが壁に跳ね返る
  ballDrop:     "assets/sound/ball_drop.mp3",       // ボールが落下 (Bound)
  homerunLoop:  "assets/sound/stadium_buzz.mp3",    // ホームラン (ループ)
  homerunCheer: "assets/sound/stadium_cheer.mp3",   // ホームラン (一回)
  out:          "assets/sound/out_beep.mp3",        // アウト
  strike:       "assets/sound/mitt_catch.mp3",      // ストライク
  ball:         "assets/sound/ball_call.mp3",       // ボール判定
  change:       "assets/sound/change_title.mp3",    // チェンジ
  gameEnd:      "assets/sound/cheer_applause.mp3",  // 試合終了
  score:        "assets/sound/score_up.mp3",        // 得点追加
};

const SOUND_VOLUMES = {
  start: 0.7, hit: 0.85, pitch: 0.7,
  runnerLoop: 0.45, baseReach: 0.8,
  wallBounce: 0.6, ballDrop: 0.7,
  homerunLoop: 0.65, homerunCheer: 0.85,
  out: 0.7, strike: 0.8, ball: 0.7, change: 0.8,
  gameEnd: 0.85, score: 0.8,
};

function playSfx(key) {
  const src = SOUND_FILES[key];
  if (!src) return;
  try {
    const a = new Audio(src);
    a.volume = SOUND_VOLUMES[key] ?? 0.7;
    const p = a.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  } catch (_) {}
}

let _runnerLoopAudio = null;
let _homerunLoopAudio = null;

function startRunnerLoop() {
  if (_homerunLoopAudio) return; // ホームラン中は鳴らさない
  if (_runnerLoopAudio) return;
  try {
    const a = new Audio(SOUND_FILES.runnerLoop);
    a.loop = true;
    a.volume = SOUND_VOLUMES.runnerLoop;
    const p = a.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
    _runnerLoopAudio = a;
  } catch (_) {}
}

function stopRunnerLoop() {
  if (!_runnerLoopAudio) return;
  try { _runnerLoopAudio.pause(); } catch (_) {}
  _runnerLoopAudio = null;
}

function startHomerunLoop() {
  stopRunnerLoop();
  if (_homerunLoopAudio) return;
  playSfx("homerunCheer");
  try {
    const a = new Audio(SOUND_FILES.homerunLoop);
    a.loop = true;
    a.volume = SOUND_VOLUMES.homerunLoop;
    const p = a.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
    _homerunLoopAudio = a;
  } catch (_) {}
}

function stopHomerunLoop() {
  if (!_homerunLoopAudio) return;
  try { _homerunLoopAudio.pause(); } catch (_) {}
  _homerunLoopAudio = null;
}

// 旧 WebAudio 合成は MP3 ベースに置き換え。互換のためのラッパー:
function playSoundWhoosh()    { playSfx("pitch"); }
function playSoundKakin()     { playSfx("hit"); }
function playSoundChime()     { playSfx("change"); }
function playSoundStrike()    { playSfx("strike"); }
function playSoundSwingMiss() { playSfx("ball"); }
function playSoundBall()      { playSfx("ball"); }
function startCrowdCheer()    { startRunnerLoop(); }
function stopCrowdCheer()     { stopRunnerLoop(); stopHomerunLoop(); }
function startHomeRunCheer()  { startHomerunLoop(); }
// 起動: セーブデータがあれば自動再開、なければメニュー表示
loadGameFromDB().then((saved) => {
  if (saved) {
    cancelResetHold();
    applyLoadedGame(saved);
    resetPlayingState();
    updateStatusBar();
    elements.mainScreen.classList.add("is-hidden");
    elements.playingScreen.classList.remove("is-hidden");
    updatePlayingBasesDOM();
    restoreRunnersFromSave(saved.runners || []);
    playSfx("start");
    showOverlay("PLAY BALL!", "", false);
    playingState.isRunning = false;
    elements.playingResetBtn.style.pointerEvents = "none";
    setTimeout(() => {
      hideOverlay();
      playingState.isRunning = true;
      elements.playingResetBtn.style.pointerEvents = "";
      playingState.animationFrameId = window.requestAnimationFrame(animatePlaying);
    }, 1200);
  } else {
    resetGameState();
    updateStatusBar();
  }
});

// ===== キャッシュ対策: index.html の更新チェック =====
// styles.css / app.js は index.html 側で ?v=Date.now() を付けて常に最新を取得するが、
// index.html 自体は静的ホスティング（GitHub Pages 等）のキャッシュで古いまま残ることがある。
// 起動時に HEAD リクエストで配信中の Last-Modified を確認し、
// 今表示している HTML より新しければ一度だけリロードして最新に揃える。
async function checkForNewerHtml() {
  try {
    const res = await fetch(window.location.href, { method: "HEAD", cache: "no-store" });
    if (!res.ok) return;
    const remote = res.headers.get("last-modified");
    if (!remote) return;
    const remoteTime = new Date(remote).getTime();
    const localTime = new Date(document.lastModified).getTime();
    if (!Number.isFinite(remoteTime) || !Number.isFinite(localTime)) return;
    // 60秒以上新しい HTML が配信されている場合のみ対象（時計ズレの誤検知を防ぐ）
    if (remoteTime <= localTime + 60000) return;
    // リロードループ防止: 直近60秒以内にリロード済みなら何もしない
    const key = "htmlReloadAt";
    const lastReload = Number(sessionStorage.getItem(key) || 0);
    if (Date.now() - lastReload < 60000) return;
    sessionStorage.setItem(key, String(Date.now()));
    window.location.reload();
  } catch (_) {
    // file:// 直開きやオフライン時は何もしない
  }
}
checkForNewerHtml();
