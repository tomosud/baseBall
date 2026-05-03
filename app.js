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
};

const playingState = {
  // pitcher side
  pitcherPointerId: null,
  pitcherTrail: [],
  pitcherReleaseCurve: 0,
  isPitched: false,
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
  isSwinging: false,
  swingTimer: 0,
  swingElapsed: 0,
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
  // fielder throw state
  isFielderThrow: false,
  wasPickedUp: false,
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
  playingHomeBase: document.getElementById("playingHomeBase"),
  playingBase0: document.getElementById("playingBase0"),
  playingBase1: document.getElementById("playingBase1"),
  playingBase2: document.getElementById("playingBase2"),
  playingRunner0: document.getElementById("playingRunner0"),
  playingRunner1: document.getElementById("playingRunner1"),
  playingRunner2: document.getElementById("playingRunner2"),
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
};

function resetGameState() {
  gameState.inning = 1;
  gameState.isTop = true;
  gameState.outs = 0;
  gameState.balls = 0;
  gameState.strikes = 0;
  gameState.score = [0, 0];
  gameState.inningScores = Array.from({ length: 9 }, () => [0, 0]);
  gameState.phase = "pregame";
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
    setTimeout(() => gameProcessOut("三振!"), 600);
  } else {
    saveGameToDB();
  }
}

function gameProcessBall() {
  if (gameState.phase !== "playing") return;
  gameState.balls++;
  updateStatusBar();
  if (gameState.balls >= 4) {
    setTimeout(() => {
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
  gameState.outs++;
  updateStatusBar();
  updatePlayingCall(reason || "OUT!", "is-out");
  resetAtBat();
  saveGameToDB();
  if (gameState.outs >= 3) {
    setTimeout(gameDoChange, 1000);
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
  updatePlayingCall("得点！", "is-strike");
  setTimeout(() => {
    if (elements.playingCall.textContent === "得点！") updatePlayingCall("READY");
  }, 1500);
}

function gameDoChange() {
  if (gameState.phase !== "playing") return;
  gameState.phase = "change";

  // チェンジ: プレイを停止してオーバーレイ表示
  playingState.isRunning = false;
  stopPlayingAnimation();
  resetPlayingState();

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
  clearSaveData();
  playingState.isRunning = false;
  stopPlayingAnimation();
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
  maxForwardSpeed: 980,
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
  battingSwingThreshold: 350,
  battingSwingDuration: 0.055,
  batContactRadius: 28,
  battingHitDragPerSecond: 1.1,
  battingStopSpeed: 18,
  battingRestSpeed: 60,
  battingEdgeBounceRestitution: 0.62,
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

  model.flightGravity = Math.max(120, physics.heightGravity - Math.min(90, scaledSpeed * 0.018));

  const baseHeight = Math.min(92, physics.releaseHeight + scaledSpeed * physics.releaseHeightSpeedFactor * 2.2);
  const zoneCenterX = (zone.left + zone.right) * 0.5;
  const zoneCenterY = (zone.top + zone.bottom) * 0.5;
  const distToZone = Math.max(0, (zoneCenterX - model.ballX) * rdX + (zoneCenterY - model.ballY) * rdY);
  const travelSpeed = Math.hypot(model.velocityX, model.velocityY);
  const drag = physics.dragPerSecond;
  const minHeightForZone =
    travelSpeed > distToZone * drag
      ? 0.5 * model.flightGravity * (-Math.log(1 - (distToZone * drag) / travelSpeed) / drag) ** 2 * 1.1
      : 0;

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
  model.swingEndAngle = -model.swingStartAngle;
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

  // 横方向は sign に潰さず、反射ベクトルとスイング寄与を連続値としてブレンドする。
  // バット角度やスイング方向のわずかなズレが、そのまま打球の角度に反映される（アナログ感）。
  // 真っすぐ・スクエアに当てれば自然と正面（投手方向）へ飛ぶ。
  const blendX = reflectedX * 0.45 + contactDirection.x * impulse * 0.55;
  const blendY = reflectedY * 0.45 + contactDirection.y * impulse * 0.55;

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

    if (
      battingState.isSwinging &&
      !battingState.isHit &&
      !battingState.pitchJudged &&
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

elements.openPitchPrototype.addEventListener("click", showPrototypeScreen);
elements.openBattingPrototype.addEventListener("click", showBattingScreen);
elements.openPlayingPrototype.addEventListener("click", () => showPlayingScreen(9));
elements.openPlayingPrototype3.addEventListener("click", () => showPlayingScreen(3));
elements.backButton.addEventListener("click", showMainScreen);
elements.battingBackButton.addEventListener("click", showMainScreen);
elements.overlayButton.addEventListener("click", () => { showPlayingScreen(); });

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

  btn3.addEventListener("click", () => { fullReset(); showPlayingScreen(3); });
  btn9.addEventListener("click", () => { fullReset(); showPlayingScreen(9); });

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
  updateContactableBall(elements.playingBall, false);
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
  elements.playingCall.classList.remove("is-strike", "is-ball", "is-out");
  if (kind) elements.playingCall.classList.add(kind);

  if (text === "STRIKE" || text === "BALL") {
    setTimeout(() => {
      if (elements.playingCall.textContent === text) {
        updatePlayingCall("");
      }
    }, 550);
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
    speed: 147,
  };
}

function advanceRunnersOnWalk() {
  const rect = elements.playingSurface.getBoundingClientRect();
  const bases = getPlayingBasePositions(rect);
  const home = getPlayingHomePlate(rect);
  const safeRunners = playingState.runners.filter((runner) => runner.state === "safe");
  const runnerByBase = new Map(safeRunners.map((runner) => [runner.toBaseIndex, runner]));

  if (runnerByBase.has(0)) {
    if (runnerByBase.has(1)) {
      if (runnerByBase.has(2)) {
        addRunForBattingTeam();
        playingState.runners = playingState.runners.filter((runner) => runner !== runnerByBase.get(2));
      }
      placeRunnerOnBase(runnerByBase.get(1), 2, bases);
    }
    placeRunnerOnBase(runnerByBase.get(0), 1, bases);
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
      speed: 118,
      fromWalk: true,
    });
  }
  elements.playingRunLabel.textContent = "フォアボール";
  renderPlayingRunners();
}

function getPlayingBasePositions(rect) {
  const topWallY = getPlayingTopWallY();
  return [
    { x: rect.width * 0.94, y: rect.height * 0.36 }, // 1塁（右端）
    { x: rect.width * 0.50, y: topWallY + 34 }, // 2塁（上壁近く中央）
    { x: rect.width * 0.06, y: rect.height * 0.36 }, // 3塁（左端）
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

function updatePlayingHomBaseDOM() {
  const rect = elements.playingSurface.getBoundingClientRect();
  const home = getPlayingHomePlate(rect);
  elements.playingHomeBase.style.transform = `translate(${home.x}px, ${home.y}px) rotate(45deg)`;
}

function showPlayingScore() {
  gameProcessScore();
}

function updatePlayingBasesDOM() {
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
      const nextBase = runner.toBaseIndex + 1;
      const fromPos = runner.toBaseIndex < bases.length ? bases[runner.toBaseIndex] : home;
      runner.fromX = fromPos.x;
      runner.fromY = fromPos.y;
      runner.x = runner.fromX;
      runner.y = runner.fromY;
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

  // 新しいランナーを追加（最大3人）
  if (playingState.runners.length < 3) {
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
      speed: 118,
    });
  }

  elements.playingRunLabel.textContent = "RUN！RUN！RUN！";
  renderPlayingRunners();
  saveGameToDB();
}

function updatePlayingRunners(dt) {
  const rect = elements.playingSurface.getBoundingClientRect();
  const bases = getPlayingBasePositions(rect);
  const home = getPlayingHomePlate(rect);

  for (const runner of playingState.runners) {
    if (runner.state === "out" || runner.state === "scored") continue;

    if (runner.state !== "running") continue;

    const target = runner.toBaseIndex < bases.length ? bases[runner.toBaseIndex] : home;
    const dx = target.x - runner.fromX;
    const dy = target.y - runner.fromY;
    const dist = Math.hypot(dx, dy);

    if (dist < 0.001) {
      if (runner.toBaseIndex >= bases.length) {
        runner.state = "scored";
        showPlayingScore();
      } else {
        runner.state = "safe";
      }
      runner.x = target.x;
      runner.y = target.y;
      continue;
    }

    runner.progress += (runner.speed * dt) / dist;

    if (runner.progress >= 1) {
      runner.progress = 1;
      runner.x = target.x;
      runner.y = target.y;
      if (runner.toBaseIndex >= bases.length) {
        runner.state = "scored";
        showPlayingScore();
      } else {
        runner.state = "safe";
      }
    } else {
      runner.x = runner.fromX + dx * runner.progress;
      runner.y = runner.fromY + dy * runner.progress;
    }
  }

  // scored を削除
  playingState.runners = playingState.runners.filter((r) => r.state !== "scored");

  renderPlayingRunners();
}

function renderPlayingRunners() {
  const rect = elements.playingSurface.getBoundingClientRect();
  const bases = getPlayingBasePositions(rect);
  const runnerEls = [elements.playingRunner0, elements.playingRunner1, elements.playingRunner2];

  // 全て非表示・色クリア
  runnerEls.forEach((el) => {
    el.classList.add("is-hidden");
    el.classList.remove("color-0", "color-1", "color-2");
  });

  playingState.runners.forEach((runner, i) => {
    if (i >= runnerEls.length) return;
    if (runner.state === "out" || runner.state === "scored") return;

    const el = runnerEls[i];
    el.classList.remove("is-hidden");
    el.classList.add(runner.colorClass);

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
}

function updatePlayingThrowTargets() {
  const targetEls = [elements.playingBase0, elements.playingBase1, elements.playingBase2, elements.playingHomeBase];
  const targetIndexes = new Set(
    playingState.runners
      .filter((runner) => runner.state === "running")
      .map((runner) => runner.toBaseIndex),
  );

  targetEls.forEach((el, index) => {
    el.classList.toggle("is-throw-target", targetIndexes.has(index));
  });
}

function checkPlayingBallHitsBases() {
  if (!playingState.isBallActive || playingState.isHit) return false;

  const rect = elements.playingSurface.getBoundingClientRect();
  const bases = getPlayingBasePositions(rect);
  const home = getPlayingHomePlate(rect);
  const allTargets = [
    ...bases.map((b, i) => ({ pos: b, el: [elements.playingBase0, elements.playingBase1, elements.playingBase2][i], idx: i })),
    { pos: home, el: elements.playingHomeBase, idx: bases.length },
  ];

  for (const { pos, el, idx } of allTargets) {
    const dist = Math.hypot(playingState.ballX - pos.x, playingState.ballY - pos.y);
    if (dist > 26) continue;

    // この塁に向かって走っているランナーを探す（フォアボール走者はアウト対象外）
    const runnerIndex = playingState.runners.findIndex((r) => r.state === "running" && r.toBaseIndex === idx && !r.fromWalk);
    if (runnerIndex === -1) continue;

    // アウト!
    const outRunner = playingState.runners[runnerIndex];
    outRunner.state = "out";
    renderPlayingRunners();

    // 塁を赤くフラッシュ
    el.classList.add("is-tagged");
    setTimeout(() => el.classList.remove("is-tagged"), 800);

    // アウトランナー削除（少し後）— IDで絞り込むことでレースコンディションを防ぐ
    const outRunnerId = outRunner.id;
    setTimeout(() => {
      playingState.runners = playingState.runners.filter((r) => r.id !== outRunnerId);
      renderPlayingRunners();
    }, 500);

    const stillHasRunners = playingState.runners.some((r) => r !== outRunner && r.state === "running");

    if (stillHasRunners) {
      // 走者がまだいる → ボールを残してフィールダーが拾い直せる状態に
      updatePlayingCall("OUT!", "is-out");
      gameProcessOut("OUT!");
      playingState.isHit = false;
      playingState.isFielderThrow = true;
      playingState.isResting = true;
      playingState.isBallActive = false;
      playingState.isPitched = false;
      elements.playingBall.classList.add("is-resting");
    } else {
      // 走者がいなくなる → ボール消滅・通常モードへ
      playingState.isBallActive = false;
      playingState.isPitched = false;
      playingState.isFielderThrow = false;
      hidePlayingBall();
      updatePlayingCall("OUT!", "is-out");
      gameProcessOut("OUT!");
    }
    return true;
  }

  return false;
}

function reflectPlayingBallFromBat() {
  reflectBallFromBatModel(playingState, {
    batElement: elements.playingBat,
    hitAngleElement: elements.playingBatHitAngle,
    reflectAngleElement: elements.playingBatReflectAngle,
    missMarkerElement: elements.playingContactMissMarker,
    updateCall: updatePlayingCall,
  });
  playingState.swingMissed = false; // ヒットしたので空振り記録をクリア
  spawnRunnerOnHit();
  resetAtBat();
}

function applyPlayingBounce() {
  updatePlayingCall("Bound!", "is-ball");
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

function applyPlayingEdgeBounce(rect) {
  const model = playingState;
  const margin = 8;
  const topWallY = getPlayingTopWallY();

  if (model.ballX <= margin && model.velocityX < 0) {
    model.ballX = margin;
    model.velocityX *= -physics.battingEdgeBounceRestitution;
    model.velocityY *= physics.battingEdgeBounceRestitution;
  } else if (model.ballX >= rect.width - margin && model.velocityX > 0) {
    model.ballX = rect.width - margin;
    model.velocityX *= -physics.battingEdgeBounceRestitution;
    model.velocityY *= physics.battingEdgeBounceRestitution;
  }

  if (model.ballY <= topWallY && model.velocityY < 0) {
    const isBlueHit = model.isHit && model.currentSpeed >= 200;
    if (isBlueHit || playingState.isHomeRun) {
      // 青い打球は上辺で反射せず突き抜ける（ホームラン）
      if (isBlueHit && !playingState.isHomeRun) {
        triggerHomeRun();
      }
    } else {
      model.ballY = topWallY;
      model.velocityY *= -physics.battingEdgeBounceRestitution;
      model.velocityX *= physics.battingEdgeBounceRestitution;
    }
  } else if (model.ballY >= rect.height - margin && model.velocityY > 0) {
    model.ballY = rect.height - margin;
    model.velocityY *= -physics.battingEdgeBounceRestitution;
    model.velocityX *= physics.battingEdgeBounceRestitution;
  }
}

function triggerHomeRun() {
  if (playingState.isHomeRun) return;
  playingState.isHomeRun = true;

  // 走者全員をホームへ走らせる
  const rect = elements.playingSurface.getBoundingClientRect();
  const bases = getPlayingBasePositions(rect);
  for (const runner of playingState.runners) {
    if (runner.state === "out" || runner.state === "scored") continue;
    runner.fromX = runner.x;
    runner.fromY = runner.y;
    runner.toBaseIndex = bases.length; // ホーム
    runner.progress = 0;
    runner.state = "running";
  }
  elements.playingRunLabel.textContent = "ホームラン！";
  updatePlayingCall("ホームラン！", "is-strike");
}

function startPlayingSwing(vector) {
  startBatModelSwing(playingState, elements.playingBat, vector);
}

function resetPlayingState() {
  stopPlayingAnimation();
  playingState.pitcherPointerId = null;
  playingState.pitcherTrail = [];
  playingState.pitcherReleaseCurve = 0;
  playingState.isPitched = false;
  playingState.isBallActive = false;
  playingState.isHit = false;
  playingState.isResting = false;
  playingState.isHomeRun = false;
  playingState.wasPickedUp = false;
  playingState.pitchJudged = false;
  playingState.motionMode = "flight";
  playingState.currentSpeed = 0;
  playingState.pitchRawSpeed = 0;
  playingState.velocityX = 0;
  playingState.velocityY = 0;
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
  playingState.isSwinging = false;
  playingState.swingTimer = 0;
  playingState.swingElapsed = 0;
  playingState.swingGateSpeed = 0;
  playingState.lastTick = 0;
  playingState.nextPitchReadyAt = 0;
  playingState.runners = [];
  elements.playingBat.classList.remove("is-swinging", "is-hit");
  elements.playingBatHitAngle.classList.add("is-hidden");
  elements.playingBatReflectAngle.classList.add("is-hidden");
  elements.playingBall.classList.remove("is-resting");
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
  const launch = launchPitchModel(playingState, vector, getPlayingStrikeZoneRect());
  playingState.pitchRawSpeed = clamp(launch.scaledSpeed, physics.battingMinRawSpeed, physics.battingMaxRawSpeed);
  playingState.isBallActive = true;
  playingState.isHit = false;
  playingState.isResting = false;
  playingState.isHomeRun = false;
  playingState.isPitched = true;
  playingState.pitchJudged = false;
  elements.playingBat.classList.remove("is-hit");
  elements.playingBatHitAngle.classList.add("is-hidden");
  elements.playingBatReflectAngle.classList.add("is-hidden");
  elements.playingBall.classList.remove("is-resting");
  elements.playingBall.classList.remove("is-blue-hit");
  updateContactableBall(elements.playingBall, false);
  showPlayingBall();
  updatePlayingCall("SWING!");
  elements.playingHint.textContent = "Batter: swing up!";
  updatePlayingDebug();
}

function finishPlayingPitch(message = "READY") {
  playingState.swingMissed = false;
  playingState.isBallActive = false;
  hidePlayingBall();
  updatePlayingCall(message);
  playingState.isPitched = false;
  playingState.nextPitchReadyAt = performance.now() + 800;
  elements.playingHint.textContent = "Pitcher: swipe up to pitch  /  Batter: swing up";
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
      // 空振り判定: 投球後かつボールが当たっていない
      if (playingState.isPitched && !playingState.isHit && !playingState.pitchJudged) {
        playingState.swingMissed = true;
        playingState.pitchJudged = true;
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
          const approachDrag = Math.exp(-2.0 * (1 - groundFactor) * dt);
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
      const drag = Math.exp(-physics.battingHitDragPerSecond * dt);
      playingState.velocityX *= drag;
      playingState.velocityY *= drag;
      playingState.ballX += playingState.velocityX * dt;
      playingState.ballY += playingState.velocityY * dt;
      playingState.currentSpeed = Math.hypot(playingState.velocityX, playingState.velocityY);
    }

    setPlayingBallPosition(playingState.ballX, playingState.ballY);
    // Playing プロトではオレンジ（contactable）表示不要

    // 投球中: 塁ヒット判定（走者アウト）
    if (!playingState.isHit) { // isFielderThrow も isHit=false なので通過する
      if (checkPlayingBallHitsBases()) {
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
    }

    // 速度二百以上のヒット球は青く表示
    if (playingState.isHit && (playingState.currentSpeed >= 200 || playingState.isHomeRun)) {
      elements.playingBall.classList.add("is-blue-hit");
    } else {
      elements.playingBall.classList.remove("is-blue-hit");
    }

    // バットとの接触判定
    if (
      playingState.isSwinging &&
      !playingState.isHit &&
      !playingState.isFielderThrow &&
      !playingState.pitchJudged &&
      checkBatModelContact(playingState, previousX, previousY)
    ) {
      updateContactableBall(elements.playingBall, false);
      reflectPlayingBallFromBat();
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
        if (isStrike) gameProcessStrike(); else gameProcessBall();
      }
    }

    // 投球がゾーン横を素通りした場合
    if (!playingState.pitchJudged && !playingState.isHit && !playingState.isFielderThrow) {
      if (playingState.ballX < -28 || playingState.ballX > rect.width + 28) {
        playingState.pitchJudged = true;
        updatePlayingCall("BALL", "is-ball");
        gameProcessBall();
      }
    }

    // 休止状態（赤くなる）: 1回目ピックアップ後は閾値2倍で拾いやすく
    const effectiveRestSpeed = physics.battingRestSpeed * (playingState.wasPickedUp ? 2 : 1);
    if ((playingState.isHit || playingState.isFielderThrow) && !playingState.isResting && playingState.currentSpeed <= effectiveRestSpeed) {
      playingState.isResting = true;
      elements.playingBall.classList.add("is-resting");
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
    const isStopped = (playingState.isHit || playingState.isFielderThrow) && playingState.currentSpeed <= physics.battingStopSpeed;

    if (isStopped) {
      // 完全停止: ピッチャーが拾えるように isPitched を false に
      playingState.isBallActive = false;
      playingState.isPitched = false;
      playingState.pitchJudged = false;
      playingState.swingMissed = false;
    } else if (isRollStopped || isFlightStuck || isOutside) {
      if (!playingState.pitchJudged) {
        playingState.pitchJudged = true;
        updatePlayingCall("BALL", "is-ball");
        gameProcessBall();
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
  if (running) {
    if (!wasRunnerMode) {
      // 走者モード突入時のみUI切替
      elements.playingDivider.classList.add("is-hidden");
      elements.playingLabelPitcher.classList.add("is-hidden");
      elements.playingLabelBatter.classList.add("is-hidden");
      elements.playingRunLabel.classList.remove("is-hidden");
      elements.playingHint.textContent = "Fielder: pick up and throw!";
      elements.playingStrikeZone.classList.add("is-hidden");
      elements.playingHomeBase.classList.remove("is-hidden");
    }
    updatePlayingHomBaseDOM();
  } else {
    if (wasRunnerMode) {
      // 通常モード復帰時のみUI切替
      elements.playingDivider.classList.remove("is-hidden");
      elements.playingLabelPitcher.classList.remove("is-hidden");
      elements.playingLabelBatter.classList.remove("is-hidden");
      elements.playingRunLabel.classList.add("is-hidden");
      elements.playingHint.textContent = "Pitcher: swipe up to pitch  /  Batter: swing up";
      elements.playingStrikeZone.classList.remove("is-hidden");
      elements.playingHomeBase.classList.add("is-hidden");
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
    if (playingState.pitcherPointerId !== null) return;

    // ピックアップ判定: ヒット or フィールダースローが赤くなった（isResting）後のみ拾える
    // ボール位置に十分近い場合のみピックアップ可
    const ballOnField =
      (playingState.isHit || playingState.isFielderThrow) && playingState.isResting;
    const nearBall = ballOnField &&
      Math.hypot(point.x - playingState.ballX, point.y - playingState.ballY) <= 36;
    playingState.isFielderThrow = nearBall;
    if (nearBall) {
      playingState.isBallActive = false;
      playingState.isHit = false;
      playingState.isResting = false;
      playingState.isPitched = false;
      playingState.pitchJudged = false;
      playingState.swingMissed = false;
      playingState.wasPickedUp = true;
      elements.playingBall.classList.remove("is-resting");
      hidePlayingBall();
    }

    if (playingState.isPitched) return; // まだ飛行中

    // 通常のピッチ開始
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
    elements.playingBatHitAngle.classList.add("is-hidden");
    elements.playingBatReflectAngle.classList.add("is-hidden");
    setPlayingBatPosition(batPos.x, batPos.y, physics.batRestAngle);
    pushPlayingBatterTrail(point.x, point.y, event.timeStamp);
  }
}

function movePlayingPointer(event) {
  const point = getPlayingSurfacePoint(event);
  if (event.pointerId === playingState.pitcherPointerId) {
    // ボールが指に追従
    if (!playingState.isBallActive) {
      setPlayingBallPosition(point.x, point.y);
    }
    pushPlayingPitcherTrail(point.x, point.y, event.timeStamp);
  } else if (event.pointerId === playingState.batterPointerId) {
    if (!playingState.isSwinging) {
      placePlayingBatOnSwingLine(point.x, point.y);
    }
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
  }
}

function pushPlayingPitcherTrail(x, y, timeStamp) {
  playingState.pitcherTrail.push({ x, y, timeStamp });
  const cutoff = timeStamp - 260;
  playingState.pitcherTrail = playingState.pitcherTrail.filter((p) => p.timeStamp >= cutoff).slice(-18);
}

function getPlayingPitcherReleaseVector() {
  return getTrailReleaseVector(playingState.pitcherTrail, 35);
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
    .filter((r) => r.state !== "out" && r.state !== "scored")
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
      speed: 118,
    };
  });
  renderPlayingRunners();
}

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
