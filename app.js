const state = {
  activePointerId: null,
  trail: [],
  animationFrameId: 0,
  isPitching: false,
  ballX: 0,
  ballY: 0,
  velocityX: 0,
  velocityY: 0,
  lastTick: 0,
};

const elements = {
  mainScreen: document.getElementById("mainScreen"),
  prototypeScreen: document.getElementById("prototypeScreen"),
  openPitchPrototype: document.getElementById("openPitchPrototype"),
  backButton: document.getElementById("backButton"),
  pitchSurface: document.getElementById("pitchSurface"),
  ball: document.getElementById("ball"),
  hintText: document.getElementById("hintText"),
};

function showMainScreen() {
  stopPitchAnimation();
  elements.prototypeScreen.classList.add("is-hidden");
  elements.mainScreen.classList.remove("is-hidden");
}

function showPrototypeScreen() {
  elements.mainScreen.classList.add("is-hidden");
  elements.prototypeScreen.classList.remove("is-hidden");
  elements.hintText.textContent = "指を置いて位置を決めて、上にスワイプして投げる";
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

  state.ballX += state.velocityX * deltaSeconds;
  state.ballY += state.velocityY * deltaSeconds;

  setBallPosition(state.ballX, state.ballY);

  const rect = elements.pitchSurface.getBoundingClientRect();
  const isOutside =
    state.ballX < -40 ||
    state.ballX > rect.width + 40 ||
    state.ballY < -40 ||
    state.ballY > rect.height + 40;

  if (isOutside) {
    stopPitchAnimation();
    hideBall();
    updateHint("もう一度、指を置いて上にスワイプ");
    return;
  }

  state.animationFrameId = window.requestAnimationFrame(animatePitch);
}

function startPitch(vector) {
  stopPitchAnimation();
  state.isPitching = true;
  state.lastTick = 0;
  state.velocityX = vector.velocityX;
  state.velocityY = vector.velocityY;
  updateHint("投球中");
  state.animationFrameId = window.requestAnimationFrame(animatePitch);
}

function beginPointerControl(event) {
  if (state.activePointerId !== null) {
    return;
  }

  stopPitchAnimation();
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

  if (!vector || vector.deltaY > -18 || vector.speed < 240) {
    updateHint("上方向にもう少し強くスワイプ");
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