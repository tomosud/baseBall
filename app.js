const state = {
  activePointerId: null,
  trail: [],
  speedHistory: [],
  animationFrameId: 0,
  isPitching: false,
  motionMode: "flight",
  pitchJudged: false,
  bounceCount: 0,
  rollDirection: 1,
  releaseDirectionX: 0,
  releaseDirectionY: -1,
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

const elements = {
  mainScreen: document.getElementById("mainScreen"),
  prototypeScreen: document.getElementById("prototypeScreen"),
  openPitchPrototype: document.getElementById("openPitchPrototype"),
  backButton: document.getElementById("backButton"),
  pitchSurface: document.getElementById("pitchSurface"),
  strikeZone: document.getElementById("strikeZone"),
  pitchCall: document.getElementById("pitchCall"),
  debugReleaseSpeed: document.getElementById("debugReleaseSpeed"),
  debugCurrentSpeed: document.getElementById("debugCurrentSpeed"),
  debugVelocity: document.getElementById("debugVelocity"),
  speedHistory: document.getElementById("speedHistory"),
  heightDebugBall: document.getElementById("heightDebugBall"),
  heightDebugValue: document.getElementById("heightDebugValue"),
  ball: document.getElementById("ball"),
  hintText: document.getElementById("hintText"),
};

const physics = {
  speedScale: 0.7,
  dragPerSecond: 1.2,
  sideDragPerSecond: 3.8,
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
  softReleaseSpeed: 110,
  softReleaseForwardSpeed: 150,
  releaseHeight: 42,
  releaseHeightSpeedFactor: 0.003,
  heightGravity: 220,
  bounceHeightLoss: 0.35,
  minBounceUpVelocity: 52,
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

function updateDebug() {
  elements.debugReleaseSpeed.textContent = state.lastReleaseSpeed.toFixed(0);
  elements.debugCurrentSpeed.textContent = state.currentSpeed.toFixed(0);
  elements.debugVelocity.textContent = `${state.velocityX.toFixed(0)} / ${state.velocityY.toFixed(0)}`;
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
  state.motionMode = "flight";
  state.pitchJudged = false;
  state.bounceCount = 0;
  state.rollDirection = 1;
  state.releaseDirectionX = 0;
  state.releaseDirectionY = -1;
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
  const surfaceRect = elements.pitchSurface.getBoundingClientRect();
  const zoneRect = elements.strikeZone.getBoundingClientRect();

  return {
    left: zoneRect.left - surfaceRect.left,
    right: zoneRect.right - surfaceRect.left,
    top: zoneRect.top - surfaceRect.top,
    bottom: zoneRect.bottom - surfaceRect.top,
  };
}

function judgePitchOnPath(previousX, previousY, nextX, nextY) {
  if (state.pitchJudged) {
    return;
  }

  const zone = getStrikeZoneRect();
  const crossedZone = previousY > zone.bottom && nextY <= zone.bottom;

  if (!crossedZone) {
    return;
  }

  const deltaY = nextY - previousY;

  if (Math.abs(deltaY) < 0.0001) {
    return;
  }

  state.pitchJudged = true;
  const ratio = (zone.bottom - previousY) / deltaY;
  const lineX = previousX + (nextX - previousX) * ratio;

  if (lineX >= zone.left && lineX <= zone.right && state.bounceCount === 0) {
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
  };
}

function showMainScreen() {
  stopPitchAnimation();
  hideBall();
  elements.prototypeScreen.classList.add("is-hidden");
  elements.mainScreen.classList.remove("is-hidden");
}

function showPrototypeScreen() {
  elements.mainScreen.classList.add("is-hidden");
  elements.prototypeScreen.classList.remove("is-hidden");
  state.speedHistory = [];
  elements.hintText.textContent = "指を置いて位置を決めて、上にスワイプして投げる";
  resetPitchState();
}

function stopPitchAnimation() {
  if (state.animationFrameId) {
    window.cancelAnimationFrame(state.animationFrameId);
    state.animationFrameId = 0;
  }

  state.isPitching = false;
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

  const cutoff = timeStamp - 120;
  state.trail = state.trail.filter((point) => point.timeStamp >= cutoff).slice(-8);
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
  };
}

function updateHint(text) {
  elements.hintText.textContent = text;
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
    const heightRatio = state.initialHeight > 0 ? Math.max(0, Math.min(1, state.height / state.initialHeight)) : 0;
    const forwardFloor = physics.minForwardSpeed * Math.pow(heightRatio, 1.35) * 0.42;

    state.velocityX *= sideDragFactor;
    state.velocityY *= dragFactor;

    if (state.height < 28 && state.heightVelocity < 0) {
      const groundFactor = state.height / 28;
      const approachDrag = Math.exp(-2.0 * (1 - groundFactor) * deltaSeconds);
      state.velocityX *= approachDrag;
      state.velocityY *= approachDrag;
    }

    if (forwardFloor > 0 && state.velocityY > -forwardFloor) {
      state.velocityY = -forwardFloor;
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
    state.ballX < -80 ||
    state.ballX > rect.width + 80;

  const isRollFinished = state.motionMode === "rolling" && state.currentSpeed <= physics.rollStopSpeed;

  if (isOutside || isRollFinished) {
    if (!state.pitchJudged) {
      state.pitchJudged = true;
      updatePitchCall("BALL", "is-ball");
    }

    stopPitchAnimation();
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
  const scaledVelocityX = vector.velocityX * physics.speedScale;
  const scaledVelocityY = vector.velocityY * physics.speedScale;
  const scaledSpeed = vector.speed * physics.speedScale;
  state.velocityX = compressScreenVelocity(scaledVelocityX * 0.45, physics.maxSideSpeed);
  state.velocityY = Math.min(
    compressScreenVelocity(scaledVelocityY, physics.maxForwardSpeed),
    -physics.minForwardSpeed * physics.speedScale * 0.55,
  );
  state.initialHeight = Math.min(92, physics.releaseHeight + scaledSpeed * physics.releaseHeightSpeedFactor * 2.2);
  state.height = state.initialHeight;
  state.heightVelocity = 0;
  state.flightGravity = Math.max(120, physics.heightGravity - Math.min(90, scaledSpeed * 0.018));
  const zone = getStrikeZoneRect();
  state.bounceMinY = zone.top + (state.ballY - zone.top) * 0.2;
  state.flightElapsed = 0;
  state.bounceMinTime = 0.38 + Math.min(0.22, scaledSpeed / 12000);
  state.lastReleaseSpeed = scaledSpeed;
  state.currentSpeed = scaledSpeed;
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

  if (vector.deltaY > -18 || vector.speed < 120) {
    const softVector = createSoftReleaseVector(vector);
    state.lastReleaseSpeed = softVector.speed;
    updateHint("弱いリリース");
    startPitch(softVector);
    return;
  }

  startPitch(vector);
}

elements.openPitchPrototype.addEventListener("click", showPrototypeScreen);
elements.backButton.addEventListener("click", showMainScreen);

elements.pitchSurface.addEventListener("pointerdown", beginPointerControl);
elements.pitchSurface.addEventListener("pointermove", movePointerControl);
elements.pitchSurface.addEventListener("pointerup", endPointerControl);
elements.pitchSurface.addEventListener("pointercancel", endPointerControl);

showMainScreen();
