const state = {
  activePointerId: null,
  trail: [],
  animationFrameId: 0,
  isPitching: false,
  motionMode: "flight",
  pitchJudged: false,
  bounceCount: 0,
  travelSinceBounce: 0,
  nextBounceDistance: 0,
  rollDirection: 1,
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
  ball: document.getElementById("ball"),
  hintText: document.getElementById("hintText"),
};

const physics = {
  dragPerSecond: 1.2,
  sideDragPerSecond: 3.8,
  minForwardSpeed: 180,
  bounceForwardLoss: 0.72,
  bounceForwardBoost: 90,
  maxBounces: 3,
  rollTriggerSpeed: 255,
  rollBaseSpeed: 220,
  rollSpeedFactor: 0.26,
  rollDragPerSecond: 2.6,
  rollStopSpeed: 24,
  rollTopBand: 56,
};

function updatePitchCall(text, kind = "") {
  elements.pitchCall.textContent = text;
  elements.pitchCall.classList.remove("is-strike", "is-ball");

  if (kind) {
    elements.pitchCall.classList.add(kind);
  }
}

function updateDebug() {
  elements.debugReleaseSpeed.textContent = state.lastReleaseSpeed.toFixed(0);
  elements.debugCurrentSpeed.textContent = state.currentSpeed.toFixed(0);
  elements.debugVelocity.textContent = `${state.velocityX.toFixed(0)} / ${state.velocityY.toFixed(0)}`;
}

function resetPitchState() {
  state.motionMode = "flight";
  state.pitchJudged = false;
  state.bounceCount = 0;
  state.travelSinceBounce = 0;
  state.nextBounceDistance = 0;
  state.rollDirection = 1;
  state.lastReleaseSpeed = 0;
  state.currentSpeed = 0;
  state.velocityX = 0;
  state.velocityY = 0;
  state.lastTick = 0;
  updatePitchCall("未判定");
  updateDebug();
}

function getStrikeZoneRect() {
  const surfaceRect = elements.pitchSurface.getBoundingClientRect();
  const zoneRect = elements.strikeZone.getBoundingClientRect();

  return {
    left: zoneRect.left - surfaceRect.left,
    right: zoneRect.right - surfaceRect.left,
    y: zoneRect.top - surfaceRect.top,
  };
}

function judgePitchOnPath(previousX, previousY, nextX, nextY) {
  if (state.pitchJudged) {
    return;
  }

  const zone = getStrikeZoneRect();
  const crossedLine = previousY > zone.y && nextY <= zone.y;

  if (!crossedLine) {
    return;
  }

  state.pitchJudged = true;
  const ratio = (zone.y - previousY) / Math.max(nextY - previousY, -0.0001);
  const lineX = previousX + (nextX - previousX) * ratio;

  if (lineX >= zone.left && lineX <= zone.right) {
    updatePitchCall("STRIKE", "is-strike");
    return;
  }

  updatePitchCall("BALL", "is-ball");
}

function applyTopDownBounce() {
  if (state.bounceCount >= physics.maxBounces) {
    return;
  }

  const slowFactor = Math.min(1, Math.max(0, (4200 - state.lastReleaseSpeed) / 3200));

  state.velocityX *= 0.45;
  state.velocityY = -Math.max(
    Math.abs(state.velocityY) * physics.bounceForwardLoss + physics.bounceForwardBoost * (1 - slowFactor * 0.35),
    physics.minForwardSpeed,
  );
  state.bounceCount += 1;
  state.travelSinceBounce = 0;
  state.nextBounceDistance = Math.max(56, state.nextBounceDistance * (0.78 + slowFactor * 0.08));
}

function startRolling() {
  if (state.motionMode === "rolling") {
    return;
  }

  state.motionMode = "rolling";
  state.travelSinceBounce = 0;
  state.nextBounceDistance = 0;

  const rollSpeed = Math.max(
    physics.rollBaseSpeed,
    Math.min(physics.rollBaseSpeed + state.currentSpeed * physics.rollSpeedFactor, 420),
  );

  state.velocityX = rollSpeed * state.rollDirection;
  state.velocityY = 0;
  state.currentSpeed = Math.abs(state.velocityX);
  updateHint("転がり中");
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
  const rect = elements.pitchSurface.getBoundingClientRect();

  if (state.motionMode === "flight") {
    const dragFactor = Math.exp(-physics.dragPerSecond * deltaSeconds);
    const sideDragFactor = Math.exp(-physics.sideDragPerSecond * deltaSeconds);

    state.velocityX *= sideDragFactor;
    state.velocityY *= dragFactor;

    if (state.velocityY > -physics.minForwardSpeed) {
      state.velocityY = -physics.minForwardSpeed;
    }

    const deltaX = state.velocityX * deltaSeconds;
    const deltaY = state.velocityY * deltaSeconds;

    state.ballX += deltaX;
    state.ballY += deltaY;
    state.travelSinceBounce += Math.hypot(deltaX, deltaY);

    if (state.nextBounceDistance > 0 && state.travelSinceBounce >= state.nextBounceDistance) {
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
    state.velocityY = 0;
    state.ballX += state.velocityX * deltaSeconds;
    state.currentSpeed = Math.abs(state.velocityX);
  }

  setBallPosition(state.ballX, state.ballY);

  judgePitchOnPath(previousX, previousY, state.ballX, state.ballY);

  if (!state.pitchJudged && (state.ballX < -28 || state.ballX > rect.width + 28)) {
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
    stopPitchAnimation();
    hideBall();
    updateHint("もう一度、指を置いて上にスワイプ");
    state.currentSpeed = 0;
    state.velocityX = 0;
    state.velocityY = 0;
    updateDebug();
    return;
  }

  state.animationFrameId = window.requestAnimationFrame(animatePitch);
}

function startPitch(vector) {
  stopPitchAnimation();
  state.motionMode = "flight";
  state.pitchJudged = false;
  state.bounceCount = 0;
  state.travelSinceBounce = 0;
  state.isPitching = true;
  state.lastTick = 0;
  state.rollDirection = vector.velocityX >= 0 ? 1 : -1;
  state.velocityX = vector.velocityX * 0.18;
  state.velocityY = Math.min(vector.velocityY, -physics.minForwardSpeed);
  state.lastReleaseSpeed = vector.speed;
  state.currentSpeed = vector.speed;
  state.nextBounceDistance = Math.max(64, Math.min(170, 110 - (vector.speed - 2200) * 0.014));
  updatePitchCall("判定待ち");
  updateHint("投球中");
  updateDebug();
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

  if (!vector || vector.deltaY > -18 || vector.speed < 120) {
    updateHint("上方向にもう少し強くスワイプ");
    state.lastReleaseSpeed = vector ? vector.speed : 0;
    updateDebug();
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