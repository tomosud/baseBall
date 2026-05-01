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
  battingBall: document.getElementById("battingBall"),
  batHitAngle: document.getElementById("batHitAngle"),
  batReflectAngle: document.getElementById("batReflectAngle"),
  bat: document.getElementById("bat"),
  battingHint: document.getElementById("battingHint"),
};

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
  battingSwingThreshold: 620,
  battingSwingDuration: 0.033,
  battingHitDragPerSecond: 1.1,
  battingStopSpeed: 18,
  batHitPowerScale: 0.55,
  batMoveScale: 1 / 3,
  batMoveYScale: 1 / 3,
  batVerticalRangeRatio: 1,
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
  state.releaseDirectionY = -1;
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

  const call = getZonePathCall(
    previousX,
    previousY,
    nextX,
    nextY,
    getStrikeZoneRect(),
    "up",
    state.bounceCount > 0,
  );

  if (!call) {
    return;
  }

  state.pitchJudged = true;

  if (call === "strike") {
    updatePitchCall("STRIKE", "is-strike");
    return;
  }

  updatePitchCall("BALL", "is-ball");
}

function applyTopDownBounce() {
  if (state.bounceCount >= physics.maxBounces) {
    state.height = 0;
    state.heightVelocity = 0;
    return;
  }

  const preBounceSpeed = Math.hypot(state.velocityX, state.velocityY);
  const impactVelocity = Math.abs(state.heightVelocity);
  const zone = getStrikeZoneRect();
  const zoneCenterX = (zone.left + zone.right) * 0.5;
  const escapeDirection = state.ballX <= zoneCenterX ? -1 : 1;

  setBallBounced(true);
  state.pitchJudged = true;
  updatePitchCall("Bound!", "is-ball");

  const impactRatio = Math.min(1, impactVelocity / 260);
  const dynamicForwardLoss = physics.bounceForwardLoss * (1 - impactRatio * 0.22);
  const deflectionSpeed = Math.max(Math.abs(state.velocityX) * 0.7, Math.min(120, preBounceSpeed * 0.45));
  state.velocityX = escapeDirection * deflectionSpeed;
  state.velocityY = -Math.max(Math.abs(state.velocityY) * dynamicForwardLoss, physics.minForwardSpeed);
  clampVelocityToSpeed(preBounceSpeed * 0.9);
  state.currentSpeed = Math.hypot(state.velocityX, state.velocityY);

  state.height = 0;

  if (impactVelocity < physics.minBounceUpVelocity) {
    state.heightVelocity = 0;
    startRolling();
    return;
  }

  state.heightVelocity = impactVelocity * physics.bounceHeightLoss;
  state.bounceCount += 1;
}

function startRolling() {
  if (state.motionMode === "rolling") {
    return;
  }

  const preRollSpeed = Math.hypot(state.velocityX, state.velocityY);
  state.motionMode = "rolling";
  state.height = 0;
  state.heightVelocity = 0;

  const currentDirection = normalizeVector(state.velocityX, state.velocityY, state.rollDirection, -0.2);
  const releaseDirection = normalizeVector(
    state.releaseDirectionX,
    state.releaseDirectionY,
    state.rollDirection,
    -0.25,
  );
  const releaseSideWeight = Math.max(0.35, Math.abs(releaseDirection.x) * 1.35);
  const sideFallback = Math.sign(releaseDirection.x || currentDirection.x || state.rollDirection);
  const blendedDirection = normalizeVector(
    currentDirection.x * 0.45 + releaseDirection.x * 1.5 + sideFallback * 0.4,
    currentDirection.y * 0.52 + releaseDirection.y * 0.7,
    sideFallback,
    -0.42,
  );
  const rollSpeed = Math.max(
    physics.rollBaseSpeed,
    Math.min(physics.rollBaseSpeed + state.currentSpeed * physics.rollSpeedFactor, 300),
  );

  state.velocityX = rollSpeed * blendedDirection.x * Math.max(0.9, releaseSideWeight);
  state.velocityY = rollSpeed * blendedDirection.y * 0.5;
  clampVelocityToSpeed(preRollSpeed);
  state.currentSpeed = Math.hypot(state.velocityX, state.velocityY);
  updateHint("転がり中");
}

function createSoftReleaseVector(vector) {
  const rawX = vector ? vector.velocityX : 0;
  const side = rawX * 0.1 * physics.speedScale;
  const forwardSpeed = physics.softReleaseForwardSpeed * physics.speedScale;

  return {
    deltaX: vector ? vector.deltaX : 0,
    deltaY: vector ? vector.deltaY : -6,
    velocityX: Math.max(-physics.softReleaseSpeed, Math.min(side, physics.softReleaseSpeed)),
    velocityY: -forwardSpeed,
    speed: Math.hypot(Math.max(-physics.softReleaseSpeed, Math.min(side, physics.softReleaseSpeed)), forwardSpeed),
    curve: 0,
  };
}

function showMainScreen() {
  stopPitchAnimation();
  stopBattingAnimation();
  hideBall();
  hideBattingBall();
  elements.prototypeScreen.classList.add("is-hidden");
  elements.battingScreen.classList.add("is-hidden");
  elements.mainScreen.classList.remove("is-hidden");
}

function showPrototypeScreen() {
  stopBattingAnimation();
  elements.mainScreen.classList.add("is-hidden");
  elements.battingScreen.classList.add("is-hidden");
  elements.prototypeScreen.classList.remove("is-hidden");
  state.speedHistory = [];
  elements.hintText.textContent = "指を置いて位置を決めて、上にスワイプして投げる";
  resetPitchState();
}

function showBattingScreen() {
  stopPitchAnimation();
  hideBall();
  elements.mainScreen.classList.add("is-hidden");
  elements.prototypeScreen.classList.add("is-hidden");
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
  if (state.trail.length < 4) {
    return 0;
  }

  const segments = [];

  for (let index = 1; index < state.trail.length; index += 1) {
    const previous = state.trail[index - 1];
    const next = state.trail[index];
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

  const firstPoint = state.trail[0];
  const lastPoint = state.trail[state.trail.length - 1];
  const directDistance = Math.hypot(lastPoint.x - firstPoint.x, lastPoint.y - firstPoint.y);
  const bendRatio = directDistance > 0 ? clamp(totalDistance / directDistance - 1, 0, 1) : 1;
  const curve = (signedTurn / Math.PI) * (0.35 + bendRatio * 0.65);

  return clamp(curve, -1, 1);
}

function getReleaseVector() {
  if (state.trail.length < 2) {
    return null;
  }

  const lastPoint = state.trail[state.trail.length - 1];
  let basePoint = state.trail[0];

  for (let index = state.trail.length - 2; index >= 0; index -= 1) {
    const candidate = state.trail[index];

    if (lastPoint.timeStamp - candidate.timeStamp >= 35) {
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
    curve: getReleaseCurve(),
  };
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
}

function getBattingStrikeZoneRect() {
  return getZoneRect(elements.battingSurface, elements.battingStrikeZone);
}

function isBallInBattingContactBand() {
  const zone = getBattingStrikeZoneRect();

  return battingState.ballY >= zone.top && battingState.ballY <= zone.bottom;
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
}

function setBatPosition(x, y, angle = battingState.batAngle) {
  battingState.batX = x;
  battingState.batY = y;
  battingState.batAngle = angle;
  elements.bat.style.transform = `translate(${x}px, ${y}px) rotate(${angle}rad)`;
}

function getDefaultBatPosition() {
  const rect = elements.battingSurface.getBoundingClientRect();
  const zone = getBattingStrikeZoneRect();
  const zoneCenterX = (zone.left + zone.right) * 0.5;
  const x = clamp(zoneCenterX - physics.batLength * 0.5, 16, rect.width - physics.batLength - 16);
  const y = (zone.top + zone.bottom) * 0.5;

  return { x, y };
}

function placeBatOnSwingLine(pointerX = null, pointerY = null) {
  const rect = elements.battingSurface.getBoundingClientRect();
  const zone = getBattingStrikeZoneRect();
  const x =
    pointerX === null
      ? battingState.batBaseX
      : battingState.batBaseX + (pointerX - battingState.batPointerStartX) * physics.batMoveScale;
  const clampedX = clamp(x, 12, rect.width - physics.batLength - 12);
  const zoneHeight = zone.bottom - zone.top;
  const verticalHalfRange = (zoneHeight * physics.batVerticalRangeRatio) * 0.5;
  const y =
    pointerY === null
      ? battingState.batBaseY
      : battingState.batBaseY + (pointerY - battingState.batPointerStartY) * physics.batMoveYScale;
  const clampedY = clamp(y, battingState.batBaseY - verticalHalfRange, battingState.batBaseY + verticalHalfRange);
  const loadRatio =
    pointerY === null ? 0 : clamp((pointerY - battingState.batPointerStartY) / physics.batLoadDragDistance, 0, 1);
  const readyAngle =
    physics.batRestAngle + (physics.batMaxLoadAngle - physics.batRestAngle) * loadRatio;
  battingState.batReadyAngle = readyAngle;
  setBatPosition(clampedX, clampedY, readyAngle);
}

function hideBatDebugAngles() {
  elements.batHitAngle.classList.add("is-hidden");
  elements.batReflectAngle.classList.add("is-hidden");
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
  if (battingState.isSwinging) {
    return;
  }

  battingState.isSwinging = true;
  battingState.swingTimer = physics.battingSwingDuration;
  battingState.swingElapsed = 0;
  battingState.swingStartAngle = battingState.batReadyAngle || physics.batRestAngle;
  battingState.swingEndAngle = -battingState.swingStartAngle;
  battingState.swingVelocityX = vector.velocityX;
  battingState.swingVelocityY = vector.velocityY;
  battingState.swingMoveVelocityX = vector.velocityX * physics.batMoveScale;
  battingState.swingMoveVelocityY = vector.velocityY * physics.batMoveYScale;
  battingState.swingSpeed = vector.speed;
  battingState.swingAngularSpeed =
    Math.abs(battingState.swingEndAngle - battingState.swingStartAngle) / physics.battingSwingDuration;
  battingState.swingPower = 0;
  elements.bat.classList.add("is-swinging");
  elements.bat.classList.remove("is-hit");
  updateBattingDebug();
}

function distanceToBatSegment(x, y) {
  const ax = battingState.batX;
  const ay = battingState.batY;
  const bx = ax + Math.cos(battingState.batAngle) * physics.batLength;
  const by = ay + Math.sin(battingState.batAngle) * physics.batLength;
  const dx = bx - ax;
  const dy = by - ay;
  const lengthSquared = dx * dx + dy * dy;
  const ratio = lengthSquared > 0 ? clamp(((x - ax) * dx + (y - ay) * dy) / lengthSquared, 0, 1) : 0;
  const closestX = ax + dx * ratio;
  const closestY = ay + dy * ratio;

  return Math.hypot(x - closestX, y - closestY);
}

function getBatHitRatio(x, y) {
  const ax = battingState.batX;
  const ay = battingState.batY;
  const bx = ax + Math.cos(battingState.batAngle) * physics.batLength;
  const by = ay + Math.sin(battingState.batAngle) * physics.batLength;
  const dx = bx - ax;
  const dy = by - ay;
  const lengthSquared = dx * dx + dy * dy;

  return lengthSquared > 0 ? clamp(((x - ax) * dx + (y - ay) * dy) / lengthSquared, 0, 1) : 0;
}

function reflectBallFromBat() {
  const batDirection = normalizeVector(Math.cos(battingState.batAngle), Math.sin(battingState.batAngle), 1, 0);
  let normalX = -batDirection.y;
  let normalY = batDirection.x;
  const incomingDot = battingState.velocityX * normalX + battingState.velocityY * normalY;

  if (incomingDot > 0) {
    normalX *= -1;
    normalY *= -1;
  }

  const reflectedX = battingState.velocityX - 2 * incomingDot * normalX;
  const swingDirection = normalizeVector(
    battingState.swingVelocityX,
    battingState.swingVelocityY,
    0,
    -1,
  );
  const hitRatio = getBatHitRatio(battingState.ballX, battingState.ballY);
  const radius = physics.batLength * hitRatio;
  const angularDirection = battingState.swingEndAngle >= battingState.swingStartAngle ? 1 : -1;
  const signedAngularSpeed = battingState.swingAngularSpeed * angularDirection;
  const tangentVelocityX = -Math.sin(battingState.batAngle) * signedAngularSpeed * radius;
  const tangentVelocityY = Math.cos(battingState.batAngle) * signedAngularSpeed * radius;
  const contactVelocityX = battingState.swingMoveVelocityX + tangentVelocityX;
  const contactVelocityY = battingState.swingMoveVelocityY + tangentVelocityY;
  const localBatSpeed = Math.hypot(contactVelocityX, contactVelocityY);
  const impulse = localBatSpeed * physics.batHitPowerScale;
  battingState.swingPower = impulse;
  const contactDirection = normalizeVector(contactVelocityX, contactVelocityY, swingDirection.x, swingDirection.y);
  const launchSide = normalizeVector(reflectedX * 0.2 + contactDirection.x * impulse, 0, 0, 0).x;
  const launchSpeed = clamp(220 + impulse + battingState.currentSpeed * 0.08, 260, 980);
  const launchDirection = normalizeVector(launchSide * 0.72, contactDirection.y - 0.35, 0, -1);

  battingState.velocityX = launchDirection.x * launchSpeed;
  battingState.velocityY = launchDirection.y * launchSpeed;
  battingState.currentSpeed = Math.hypot(battingState.velocityX, battingState.velocityY);
  battingState.isHit = true;
  battingState.pitchJudged = true;
  elements.bat.classList.add("is-hit");
  showBatHitAngle();
  showBatReflectAngle();
  updateBattingCall("HIT");
  elements.battingHint.textContent = "HIT";
}

function resetBattingState() {
  stopBattingAnimation();
  battingState.activePointerId = null;
  battingState.trail = [];
  battingState.isBallActive = false;
  battingState.isHit = false;
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
  elements.bat.classList.remove("is-hit");
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

    if (battingState.isSwinging && !battingState.isHit && distanceToBatSegment(battingState.ballX, battingState.ballY) <= 16) {
      if (isBallInBattingContactBand()) {
        reflectBallFromBat();
      } else {
        battingState.pitchJudged = true;
        updateBattingCall("MISS", "is-ball");
      }
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
    const isStopped = battingState.isHit && battingState.currentSpeed <= physics.battingStopSpeed;

    if (isOutside || isStopped) {
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

    const zone = getStrikeZoneRect();
    const landedBeforeZone = previousHeight > 0 && state.height <= 0 && state.ballY > zone.bottom;

    if (state.flightElapsed >= state.bounceMinTime && landedBeforeZone && state.heightVelocity < 0) {
      applyTopDownBounce();
    }

    state.currentSpeed = Math.hypot(state.velocityX, state.velocityY);

    const readyToRollBySpeed = state.currentSpeed <= physics.rollTriggerSpeed;
    const readyToRollByPosition = state.pitchJudged && state.ballY <= physics.rollTopBand;

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

  if (!state.pitchJudged && (state.ballX < -28 || state.ballX > rect.width + 28) && state.ballY <= zone.bottom) {
    state.pitchJudged = true;
    updatePitchCall("BALL", "is-ball");
  }

  updateDebug();

  const isOutside =
    state.ballY < -40 ||
    state.ballY > rect.height + 80 ||
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
    updateHint("もう一度、指を置いて上にスワイプ");
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
  state.motionMode = "flight";
  state.pitchJudged = false;
  state.bounceCount = 0;
  state.isPitching = true;
  state.lastTick = 0;
  state.rollDirection = vector.velocityX >= 0 ? 1 : -1;
  const releaseDirection = normalizeVector(vector.velocityX, vector.velocityY, state.rollDirection, -1);
  state.releaseDirectionX = releaseDirection.x;
  state.releaseDirectionY = releaseDirection.y;
  state.releaseCurve = clamp(vector.curve || 0, -1, 1);
  const scaledVelocityX = vector.velocityX * physics.speedScale;
  const scaledVelocityY = vector.velocityY * physics.speedScale;
  const scaledSpeed = vector.speed * physics.speedScale;
  const curveSpeedFactor = clamp(scaledSpeed / physics.curveSpeedReference, 0.7, 3.2);
  state.curveAccelerationX = state.releaseCurve * physics.curveMaxAcceleration * curveSpeedFactor;
  state.curveRampDuration = clamp(
    physics.curveMaxDuration / curveSpeedFactor,
    physics.curveMinDuration,
    physics.curveMaxDuration,
  );
  state.velocityX = compressScreenVelocity(scaledVelocityX * 0.45, physics.maxSideSpeed);
  state.velocityY = compressScreenVelocity(scaledVelocityY, physics.maxForwardSpeed);
  state.heightVelocity = 0;
  state.flightGravity = Math.max(120, physics.heightGravity - Math.min(90, scaledSpeed * 0.018));
  const zone = getStrikeZoneRect();
  const baseHeight = Math.min(92, physics.releaseHeight + scaledSpeed * physics.releaseHeightSpeedFactor * 2.2);
  // ゾームまで着地せずに届くために必要な最低 initialHeight をドラッグ込みで逆算する
  // ballY(t) = ballY_0 + vy*(1-exp(-k*t))/k なので t_zone = -ln(1 - dist*k/vy) / k
  const distToZone = Math.max(0, state.ballY - zone.bottom);
  const vy = Math.abs(state.velocityY);
  const k = physics.dragPerSecond;
  const minHeightForZone =
    vy > distToZone * k
      ? 0.5 * state.flightGravity * (-Math.log(1 - (distToZone * k) / vy) / k) ** 2 * 1.1
      : 0;
  state.initialHeight = Math.min(400, Math.max(baseHeight, minHeightForZone));
  state.height = state.initialHeight;
  state.bounceMinY = zone.top + (state.ballY - zone.top) * 0.2;
  state.flightElapsed = 0;
  state.bounceMinTime = 0.38 + Math.min(0.22, scaledSpeed / 12000);
  state.lastReleaseSpeed = scaledSpeed;
  state.currentSpeed = scaledSpeed;
  recordPitchPath();
  pushSpeedHistory(scaledSpeed);
  state.nextBounceDistance = Math.max(64, Math.min(170, 110 - (scaledSpeed - 2200) * 0.014));
  updatePitchCall("判定待ち");
  updateHint("投球中");
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
  updateHint("そのまま上にスワイプして投げる");
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
elements.backButton.addEventListener("click", showMainScreen);
elements.battingBackButton.addEventListener("click", showMainScreen);

elements.pitchSurface.addEventListener("pointerdown", beginPointerControl);
elements.pitchSurface.addEventListener("pointermove", movePointerControl);
elements.pitchSurface.addEventListener("pointerup", endPointerControl);
elements.pitchSurface.addEventListener("pointercancel", endPointerControl);

elements.battingSurface.addEventListener("pointerdown", beginBattingPointer);
elements.battingSurface.addEventListener("pointermove", moveBattingPointer);
elements.battingSurface.addEventListener("pointerup", endBattingPointer);
elements.battingSurface.addEventListener("pointercancel", endBattingPointer);

showMainScreen();
