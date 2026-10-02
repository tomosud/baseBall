// ページ内で動くボット（CPU）。本物の app.js に合成 PointerEvent を流して人の操作を再現する。
// index.html が app.js の後に読み込み、window.__yakyuBots.start(config) で起動する。
// 使い道は2つ: ひとりで遊ぶときの相手（片方のチームだけ）と、バランス計測ハーネス（tools/balance、両チーム）。
//
// 役割は4つ（投手・守備 = 守る側のプレイヤー、打者・走者 = 攻める側のプレイヤー）。
// 腕前は「操作の誤差」と「判断の質」のパラメータで表す（docs/balance-plan.md §5）。
// ボットは「上手いAI」ではなく「人の手の癖の近似」なので、上級でも誤差はゼロにしない。
(() => {
  // app.js が公開する口（本番は __yakyuHooks、?test=1 では同じものが __yakyuTest にもある）
  const T = window.__yakyuTest || window.__yakyuHooks;
  if (!T) return;
  const P = T.physics;
  const S = T.playingState;
  const G = T.gameState;
  const surface = T.elements.playingSurface;
  const FRAME = 1000 / 60;
  // 拾った球を持って下がるときの1フレームの移動量（px）。人がさっと引く速さ
  const REPO_STEP = 10;
  const DT = FRAME / 1000;

  const now = () => performance.now();
  const rand = () => Math.random();
  const LOG = [];
  const log = (type, data) => LOG.push({ t: now(), type, ...data });
  const gauss = () => {
    let u = 0, v = 0;
    while (u === 0) u = rand();
    while (v === 0) v = rand();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  const range = (a, b) => a + (b - a) * rand();
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  // ---- 腕前プリセット ----
  const PRESETS = {
    novice: {
      pitcher: { aimSigma: 40, swipeMin: 900, swipeMax: 1500, curveProb: 0.2, curveDeg: 4, zoneMix: [0.7, 0.2, 0.1], deadballProb: 0.0, thinkMin: 800, thinkMax: 1800, learnRate: 0.1 },
      batter: { timingSigma: 0.09, posSigma: 30, swipeMin: 700, swipeMax: 1300, discipline: 0.3, chaseMargin: 60, fingerOffset: 0, fingerSigma: 40, dodgeRadius: 0 },
      runner: { tapRate: 3, tapCv: 0.4, dodgeProb: 0, dodgeReact: 0, dodgeMs: 0 },
      fielder: { reactMs: 500, repickMs: 700, leadSigma: 0.35, aimSigma: 25, leadModel: "current" },
    },
    mid: {
      pitcher: { aimSigma: 22, swipeMin: 1100, swipeMax: 2200, curveProb: 0.5, curveDeg: 7, zoneMix: [0.5, 0.3, 0.2], deadballProb: 0.05, thinkMin: 600, thinkMax: 1400, learnRate: 0.3 },
      batter: { timingSigma: 0.05, posSigma: 15, swipeMin: 1000, swipeMax: 2000, discipline: 0.6, chaseMargin: 30, fingerOffset: 100, fingerSigma: 25, dodgeRadius: 40 },
      runner: { tapRate: 6, tapCv: 0.25, dodgeProb: 0.5, dodgeReact: 350, dodgeMs: 500 },
      fielder: { reactMs: 300, repickMs: 400, leadSigma: 0.2, aimSigma: 14, leadModel: "constant" },
    },
    expert: {
      pitcher: { aimSigma: 10, swipeMin: 1300, swipeMax: 2800, curveProb: 0.7, curveDeg: 12, zoneMix: [0.4, 0.4, 0.2], deadballProb: 0.15, thinkMin: 400, thinkMax: 1000, learnRate: 0.5 },
      batter: { timingSigma: 0.025, posSigma: 7, swipeMin: 1500, swipeMax: 2800, discipline: 0.85, chaseMargin: 12, fingerOffset: 150, fingerSigma: 15, dodgeRadius: 60 },
      runner: { tapRate: 11, tapCv: 0.15, dodgeProb: 0.85, dodgeReact: 180, dodgeMs: 300 },
      fielder: { reactMs: 180, repickMs: 250, leadSigma: 0.1, aimSigma: 7, leadModel: "constant" },
    },
  };

  // 投手の構え（球を掴んでから投げるまで）の長さ（ms）
  const WINDUP_MS = [450, 800];

  // ---- 合成ポインタ ----
  // 人の指の pointerId（小さい整数）とぶつからないよう大きい番号を使う。
  const PID = { pitcher: 1001, batter: 1002, runner: 1003 };
  const down = new Set();
  function dispatch(type, id, x, y) {
    const rect = surface.getBoundingClientRect();
    // 盤面が 180° 回っているとき（ひとりで遊ぶ裏の回）は、盤面座標を画面座標へ鏡映して渡す。
    if (T.isFlipped && T.isFlipped()) { x = rect.width - x; y = rect.height - y; }
    surface.dispatchEvent(
      new PointerEvent(type, {
        bubbles: true,
        cancelable: true,
        pointerId: id,
        pointerType: "touch",
        isPrimary: id === PID.pitcher,
        clientX: rect.left + x,
        clientY: rect.top + y,
      }),
    );
    if (type === "pointerdown") down.add(id);
    if (type === "pointerup" || type === "pointercancel") down.delete(id);
  }
  function releaseAll() {
    for (const id of [...down]) dispatch("pointerup", id, 0, 0);
  }

  // ---- 盤面 ----
  let geom = null;
  function refreshGeom() {
    geom = T.geometry();
    geom.zoneCenterX = (geom.zone.left + geom.zone.right) / 2;
    geom.zoneCenterY = (geom.zone.top + geom.zone.bottom) / 2;
    geom.zoneHalf = (geom.zone.right - geom.zone.left) / 2;
    geom.bases4 = [...geom.bases, geom.home];
  }

  // ---- 投球の先読み（打者・走者が使う）: animatePlaying の flight 式をそのまま回す ----
  function predictPitchAtY(targetY, maxT = 3) {
    let x = S.ballX, y = S.ballY, vx = S.velocityX, vy = S.velocityY;
    let h = S.height, hv = S.heightVelocity, fe = S.flightElapsed, bc = S.bounceCount;
    const ca = S.curveAccelerationX, cr = S.curveRampDuration || 1, g = S.flightGravity || 200;
    if (y >= targetY) return { t: 0, x, bounced: bc > 0 };
    if (S.motionMode !== "flight") {
      // 転がり: 減衰だけ
      for (let t = 0; t < maxT; t += DT) {
        vx *= Math.exp(-P.rollDragPerSecond * DT);
        vy *= Math.exp(-P.rollDragPerSecond * DT);
        x += vx * DT; y += vy * DT;
        if (y >= targetY) return { t, x, bounced: true };
      }
      return null;
    }
    for (let t = 0; t < maxT; t += DT) {
      fe += DT;
      vx *= Math.exp(-P.sideDragPerSecond * DT);
      vy *= Math.exp(-P.dragPerSecond * DT);
      if (bc === 0 && Math.abs(ca) > 0.0001) vx += ca * clamp(fe / cr, 0, 1) * DT;
      if (h < 28 && hv < 0) {
        const ad = Math.exp(-P.pitchGroundDragPerSecond * (1 - h / 28) * DT);
        vx *= ad; vy *= ad;
      }
      x += vx * DT; y += vy * DT;
      hv -= g * DT; h += hv * DT;
      if (h <= 0 && hv < 0) {
        // バウンド: 速度が落ちて高さが残る。打者の判断用なので粗くてよい。
        bc += 1; h = 0;
        vx *= P.bounceForwardLoss; vy *= P.bounceForwardLoss;
        hv = Math.abs(hv) * P.bounceHeightLoss;
      }
      if (y >= targetY) return { t: t + DT, x, bounced: bc > 0 };
    }
    return null;
  }

  // ---- ジェスチャ（1フレーム1ステップで実行） ----
  class Gesture {
    constructor(id, steps) { this.id = id; this.steps = steps; this.i = 0; }
    step() {
      const s = this.steps[this.i++];
      if (s.type !== "wait") dispatch(s.type, this.id, s.x, s.y); // wait = 指を置いたまま1フレーム待つ
      return this.i >= this.steps.length;
    }
  }
  // 直線または一定の折れ角で曲がるスワイプ。最後の向きが target を向くように2回組む。
  function buildSwipe(start, target, speed, frames, turnDeg, id, keepDown = false) {
    const step = speed / 60;
    const turn = (turnDeg * Math.PI) / 180;
    const build = (from, aimFrom) => {
      const hFinal = Math.atan2(target.y - aimFrom.y, target.x - aimFrom.x);
      const pts = [{ x: from.x, y: from.y }];
      let p = { ...from };
      for (let i = 1; i <= frames; i++) {
        const h = hFinal - turn * (frames - i);
        p = { x: p.x + Math.cos(h) * step, y: p.y + Math.sin(h) * step };
        pts.push(p);
      }
      return pts;
    };
    let pts = build(start, start);
    pts = build(start, pts[pts.length - 2]);
    const steps = [{ type: "pointerdown", x: pts[0].x, y: pts[0].y }];
    for (let i = 1; i < pts.length - 1; i++) steps.push({ type: "pointermove", x: pts[i].x, y: pts[i].y });
    const last = pts[pts.length - 1];
    steps.push({ type: keepDown ? "pointermove" : "pointerup", x: last.x, y: last.y });
    return new Gesture(id, steps);
  }

  // ---- 役割 ----
  function walkInProgress() {
    return S.runners.some((r) => r.state === "running" && r.fromWalk);
  }
  function runningRunners() {
    return S.runners.filter((r) => r.state === "running" && !r.fromWalk);
  }

  class Pitcher {
    constructor(skill) {
      this.k = skill; this.gesture = null; this.pitchAt = null; this.waitSince = null;
      // 曲げ方向ごとの「狙いと実際の通過点のズレ」。人が投げながら覚える補正に相当する。
      this.bias = { "-1": 0, "0": 0, "1": 0 };
      this.pending = null;
    }
    observe() {
      const p = this.pending;
      if (!p || !S.isPitched || S.isFielderThrow) return;
      if (S.ballY >= geom.zoneCenterY) {
        const err = S.ballX - p.aimX;
        this.bias[p.key] += (err - this.bias[p.key]) * this.k.learnRate;
        log("pitcher-observe", { key: p.key, err, bias: this.bias[p.key], aimX: p.aimX, x: S.ballX });
        this.pending = null;
      }
    }
    canPitch() {
      return (
        S.pitcherPointerId === null && !S.isPitched && !S.isBallActive && !S.inPlay &&
        !walkInProgress() && !S.isHomeRun && now() >= S.nextPitchReadyAt
      );
    }
    frame() {
      this.observe();
      if (this.gesture) { if (this.gesture.step()) this.gesture = null; return; }
      if (!this.canPitch()) { this.pitchAt = null; this.waitSince = null; return; }
      // 打者が構える（指を置く）のを少し待つ。人は相手の準備を見てから投げる。
      if (S.batterPointerId === null) {
        if (this.waitSince === null) this.waitSince = now();
        if (now() - this.waitSince < 2500) return;
      }
      if (this.pitchAt === null) { this.pitchAt = now() + range(this.k.thinkMin, this.k.thinkMax); return; }
      if (now() < this.pitchAt) return;
      this.pitchAt = null;
      this.throwPitch();
    }
    throwPitch() {
      const k = this.k;
      const m = geom.mound;
      const a = rand() * Math.PI * 2, rr = rand() * m.centerRadius;
      const start = { x: m.x + Math.cos(a) * rr, y: m.y + Math.sin(a) * rr };
      let target;
      if (S.batterPointerId !== null && rand() < k.deadballProb) {
        target = { x: S.batterFingerX, y: S.batterFingerY };
      } else {
        const u = rand();
        let off;
        if (u < k.zoneMix[0]) off = range(-0.6, 0.6) * geom.zoneHalf;          // ど真ん中〜ゾーン内
        else if (u < k.zoneMix[0] + k.zoneMix[1]) off = (rand() < 0.5 ? -1 : 1) * range(0.7, 1.0) * geom.zoneHalf; // 際
        else off = (rand() < 0.5 ? -1 : 1) * range(1.3, 2.2) * geom.zoneHalf; // 外
        target = { x: geom.zoneCenterX + off + gauss() * k.aimSigma, y: geom.zoneCenterY };
      }
      const speed = range(k.swipeMin, k.swipeMax);
      const turn = rand() < k.curveProb ? (rand() < 0.5 ? -1 : 1) * k.curveDeg * range(0.5, 1) : 0;
      const key = String(Math.sign(turn));
      const aimX = target.x;
      target = { x: target.x - this.bias[key], y: target.y };
      this.pending = { aimX, key };
      this.gesture = buildSwipe(start, target, speed, 6, turn, PID.pitcher);
      // 構え: 球を掴んで少し止まってから投げる。掴んでいる間は赤い輪が出るので、打者への「来るぞ」の合図になる
      const holdFrames = Math.round(range(WINDUP_MS[0], WINDUP_MS[1]) / FRAME);
      const [first, ...rest] = this.gesture.steps;
      this.gesture.steps = [first, ...Array.from({ length: holdFrames }, () => ({ type: "wait" })), ...rest];
    }
  }

  class Fielder {
    constructor(skill) { this.k = skill; this.gesture = null; this.pickAt = null; this.threwThisPlay = false; }
    reset() { this.gesture = null; this.pickAt = null; this.threwThisPlay = false; }
    pickable() {
      // 拾える条件はゲーム側と同じ（転がっている遅い打球も拾える）
      const onField = T.isBallPickable ? T.isBallPickable() : (S.isFielderThrow || (S.isHit && S.isResting));
      if (!onField || S.pitcherPointerId !== null || S.isHomeRun || runningRunners().length === 0) return false;
      // 投げた球がまだ生きて飛んでいる間は拾い直さない（人は結果を見てから拾いに行く）。
      // 壁に当たる・止まる・速度が落ちる、のどれかで「外した」と分かる。
      if (S.isFielderThrow && S.isBallActive && S.throwIsLive && S.currentSpeed > 150) return false;
      return true;
    }
    frame() {
      if (this.gesture) { if (this.gesture.step()) this.gesture = null; return; }
      if (!this.pickable()) { this.pickAt = null; return; }
      if (this.pickAt === null) {
        log("fielder-pickable", { resting: S.isResting, fielderThrow: S.isFielderThrow, runners: runningRunners().map((r) => [r.toBaseIndex, +r.progress.toFixed(2)]) });
        this.pickAt = now() + (this.threwThisPlay ? this.k.repickMs : this.k.reactMs) * range(0.8, 1.2);
        return;
      }
      if (now() < this.pickAt) return;
      this.pickAt = null;
      this.throwAtRunner();
    }
    // 送球の到達: 距離(t) = v0/drag * (1 - e^{-drag t})。速度と減衰は fielderThrowSpeedFactor 倍。
    throwAtRunner() {
      const k = this.k;
      const factor = P.fielderThrowSpeedFactor;
      const drag = P.battingHitDragPerSecond * factor;
      const v0max = P.maxForwardSpeed * Math.tanh(4) * factor * 0.97;
      const dragFrames = 3;
      const leadFrames = dragFrames + 1;
      const pick = { x: S.ballX, y: S.ballY };
      let best = null;
      for (const r of runningRunners()) {
        const target = geom.bases4[r.toBaseIndex];
        const dx = target.x - r.fromX, dy = target.y - r.fromY;
        const dist = Math.hypot(dx, dy);
        const ux = dx / dist, uy = dy / dist;
        let v = r.fromWalk ? P.walkAdvanceSpeed : P.runnerBaseSpeed + S.runnerBoost;
        if (k.leadModel === "current") v = 0; // 初級: 今いる場所を狙う
        v *= 1 + gauss() * k.leadSigma;
        const s0 = r.progress * dist + v * (leadFrames * DT);
        // 送球は離した位置から fielderThrowMinTravel 以上飛ばないと当たらない。
        // 当てる点が近すぎるときは、人と同じように球を持ったまま下がってから投げる。
        const minTravel = (P.fielderThrowMinTravel || 0) + 20;
        for (let t = 0.15; t <= 3; t += DT) {
          let release = pick, repoFrames = 0;
          let s = s0 + v * t;
          let px = r.fromX + ux * s, py = r.fromY + uy * s;
          if (Math.hypot(px - pick.x, py - pick.y) < minTravel) {
            // 走者から離れる向き（当てる点 → 拾った位置）へ下がる
            let ax = pick.x - px, ay = pick.y - py;
            const al = Math.hypot(ax, ay);
            if (al < 1) { ax = -ux; ay = -uy; } else { ax /= al; ay /= al; }
            release = { x: clamp(px + ax * (minTravel + 5), 20, geom.width - 20), y: clamp(py + ay * (minTravel + 5), geom.topWallY + 20, geom.height - 20) };
            repoFrames = Math.ceil(Math.hypot(release.x - pick.x, release.y - pick.y) / REPO_STEP);
            s = s0 + v * (t + repoFrames * DT);
            px = r.fromX + ux * s; py = r.fromY + uy * s;
          }
          if (s >= dist) break; // 着いてセーフになる
          const d = Math.hypot(px - release.x, py - release.y) || 1;
          if (d < minTravel - 15) continue;
          const v0 = (d * drag) / (1 - Math.exp(-drag * t));
          if (v0 <= v0max) {
            if (!best || t < best.t) best = { t, px, py, v0, runner: r, release, repoFrames };
            break;
          }
        }
      }
      if (!best) { log("fielder-hold", { runners: runningRunners().length, boost: S.runnerBoost }); return; } // 刺せる走者がいない → 投げずに待つ
      log("fielder-throw", { tInt: best.t, v0: best.v0, toBase: best.runner.toBaseIndex, progress: best.runner.progress, boost: S.runnerBoost });
      const aim = { x: best.px + gauss() * k.aimSigma, y: best.py + gauss() * k.aimSigma };
      // 必要球速 → スワイプ速度（compress の逆関数）。上限張り付きは atanh の発散を避ける。
      const ratio = clamp(best.v0 / factor / P.maxForwardSpeed, 0.05, 0.995);
      const swipe = P.maxForwardSpeed * Math.atanh(ratio);
      this.threwThisPlay = true;
      const throwGesture = buildSwipe(best.release, aim, Math.max(swipe, 300), dragFrames, 0, PID.pitcher);
      if (best.repoFrames > 0) {
        // 拾う → 持ったまま下がる → 投げる
        const steps = [{ type: "pointerdown", x: pick.x, y: pick.y }];
        for (let i = 1; i <= best.repoFrames; i++) {
          const f = i / best.repoFrames;
          steps.push({ type: "pointermove", x: pick.x + (best.release.x - pick.x) * f, y: pick.y + (best.release.y - pick.y) * f });
        }
        const [, ...rest] = throwGesture.steps; // 先頭の pointerdown は不要（もう押している）
        throwGesture.steps = [...steps, ...rest];
      }
      this.gesture = throwGesture;
    }
  }

  class Batter {
    constructor(skill) { this.k = skill; this.gesture = null; this.reset(); }
    reset() {
      this.placed = false; this.finger = null; this.swung = false; this.decided = null; this.loggedNull = false; this.sawPitch = false;
      this.timingErr = 0; this.posErr = 0; this.releaseAt = null; this.loaded = false; this.dodged = false;
    }
    release() {
      if (down.has(PID.batter)) dispatch("pointerup", PID.batter, this.finger ? this.finger.x : 0, this.finger ? this.finger.y : 0);
      this.reset();
    }
    frame() {
      if (this.gesture) { if (this.gesture.step()) this.gesture = null; return; }
      if (S.inPlay || T.hasActiveRunners()) { if (this.placed) this.release(); return; }
      if (this.releaseAt !== null) {
        if (now() >= this.releaseAt) this.release();
        return;
      }
      if (!this.placed) {
        if (S.batterPointerId !== null || S.isPitched) return;
        const k = this.k;
        const side = rand() < 0.5 ? -1 : 1;
        this.finger = {
          x: clamp(geom.zoneCenterX + side * k.fingerOffset + gauss() * k.fingerSigma, 30, geom.width - 30),
          y: geom.zoneCenterY - 20,
        };
        dispatch("pointerdown", PID.batter, this.finger.x, this.finger.y);
        this.placed = true;
        this.timingErr = gauss() * k.timingSigma;
        this.posErr = gauss() * k.posSigma;
        return;
      }
      if (!this.loaded) {
        // 構え: バットを可動範囲の上端（ゾーン上端の手前）まで上げておく。
        // ゾーンに入った瞬間に判定されるので、当てる位置はゾーンより上でないと間に合わない。
        // 下へ引く「ロード」は振り抜き角を増やすが、バットが下がって先端でしか当たらなくなる。
        // スワイプ速度（330px/s）を超えると振ってしまうので、ゆっくり（5px/フレーム）上げる。
        const steps = [];
        const n = 10, total = 50;
        for (let i = 1; i <= n; i++) steps.push({ type: "pointermove", x: this.finger.x, y: this.finger.y - (total * i) / n });
        this.finger.y -= total;
        this.gesture = new Gesture(PID.batter, steps);
        this.loaded = true;
        return;
      }
      // 投球が終わったら（ゾーン判定、または画面端で止まって isPitched が落ちたら）指を離して構え直す。
      // ボール球が下端まで転がる場合は pitchJudged と同時に isPitched が落ちるので、両方を見る。
      const pitchActive = S.isPitched && !S.isFielderThrow;
      if (!pitchActive) {
        if (this.sawPitch) this.releaseAt = now() + 300;
        return;
      }
      this.sawPitch = true;
      if (S.pitchJudged) { this.releaseAt = now() + 300; return; }
      if (this.swung) return;
      // 打者が狙うのはゾーン上端の少し手前（ゾーンに入った瞬間に判定されるので、その前に当てる）
      const contactY = geom.zone.top - 6;
      const pred = predictPitchAtY(contactY);
      if (!pred) { if (!this.loggedNull) { this.loggedNull = true; log("batter-nopred", { ballY: S.ballY, vy: S.velocityY, mode: S.motionMode, h: S.height }); } return; }
      const k = this.k;
      if (this.decided === null) {
        const inZone = Math.abs(pred.x - geom.zoneCenterX) <= geom.zoneHalf + k.chaseMargin;
        this.decided = inZone || (rand() > k.discipline && Math.abs(pred.x - geom.zoneCenterX) < 150) ? "swing" : "take";
        log("batter-decide", { decided: this.decided, predX: pred.x, predT: pred.t, bounced: pred.bounced, batX: S.batX, fingerX: S.batterFingerX });
      }
      // デッドボール回避: 通り道が指に近ければ横へ逃げる（バットも一緒に動いてしまう）
      if (!this.dodged && k.dodgeRadius > 0) {
        const fx = S.batterFingerX, fy = S.batterFingerY;
        const atFinger = predictPitchAtY(fy);
        if (atFinger && Math.abs(atFinger.x - fx) < k.dodgeRadius && pred.t < 0.8) {
          const dir = atFinger.x >= fx ? -1 : 1;
          this.finger.x = clamp(fx + dir * (k.dodgeRadius + 30), 20, geom.width - 20);
          this.gesture = new Gesture(PID.batter, [
            { type: "pointermove", x: fx + dir * 30, y: fy },
            { type: "pointermove", x: this.finger.x, y: fy },
          ]);
          this.dodged = true;
          log("batter-dodge", { fx, predX: atFinger.x });
          return;
        }
      }
      if (this.decided === "take") return;
      // 芯（hitRatio 0.6）を予測到達 x に合わせる。角度は振り始めの構え角で近似。
      // 芯の x はスイング中に角度が変わるので構え角では決まらない。calibrate.js で測った定数を使う。
      const sweetX = S.batX + BAT_SWEET_OFFSET;
      const wantDx = pred.x + this.posErr - sweetX;
      // 振り始め: 到達 lead 秒前に上方向へ速く振る。lead は calibrate.js で決めた値。
      const speed = range(k.swipeMin, k.swipeMax);
      const lead = BAT_LEAD + this.timingErr;
      if (pred.t > lead) {
        // 追従: 指を横へ少し動かして芯を合わせる（1フレームあたり最大 40px）
        if (Math.abs(wantDx) > 2) {
          const mv = clamp(wantDx, -40, 40);
          this.finger.x += mv;
          dispatch("pointermove", PID.batter, this.finger.x, this.finger.y);
        }
        return;
      }
      const steps = [];
      const perFrame = speed / 60;
      for (let i = 1; i <= 5; i++) steps.push({ type: "pointermove", x: this.finger.x, y: this.finger.y - perFrame * i });
      this.finger.y -= perFrame * 5;
      this.gesture = new Gesture(PID.batter, steps);
      this.swung = true;
      log("batter-swing", { predT: pred.t, predX: pred.x, lead, batX: S.batX, batY: S.batY, sweetX, ballY: S.ballY, speed });
    }
  }

  class Runner {
    constructor(skill) { this.k = skill; this.nextTapAt = null; this.pauseUntil = 0; this.lastThrowCount = 0; this.lastPickup = false; }
    reset() { this.nextTapAt = null; this.pauseUntil = 0; }
    frame() {
      if (!S.inPlay || runningRunners().length === 0) { this.reset(); return; }
      const k = this.k;
      // 送球の気配（拾った／投げた）を見て、少しの間だけ止まって読みを外す
      const pickedNow = S.wasPickedUp && S.pitcherPointerId !== null;
      const throwCount = T.throwCount();
      const cue = (pickedNow && !this.lastPickup) || throwCount !== this.lastThrowCount;
      this.lastPickup = pickedNow;
      this.lastThrowCount = throwCount;
      if (cue && k.dodgeProb > 0 && rand() < k.dodgeProb) {
        const start = now() + k.dodgeReact;
        this.pauseUntil = Math.max(this.pauseUntil, start + k.dodgeMs);
        this.pauseFrom = start;
      }
      const t = now();
      if (this.pauseFrom !== undefined && t >= this.pauseFrom && t < this.pauseUntil) return;
      if (this.nextTapAt === null) this.nextTapAt = t;
      if (t < this.nextTapAt) return;
      const x = range(60, geom.width - 60);
      const y = geom.height * P.runnerBoostAreaTopRatio + range(10, geom.height * (1 - P.runnerBoostAreaTopRatio) - 20);
      dispatch("pointerdown", PID.runner, x, y);
      dispatch("pointerup", PID.runner, x, y);
      const interval = (1000 / k.tapRate) * Math.max(0.3, 1 + gauss() * k.tapCv);
      this.nextTapAt = t + interval;
    }
  }

  // 打者の振り始めリード（秒）。calibrate.js で上級ボットの接触率が最大になる値を探して決める。
  let BAT_LEAD = 0.12;
  let BAT_SWEET_OFFSET = 35;

  // ---- 進行 ----
  let running = false;
  let teams = null;
  let roles = null;
  let lastPhase = null;
  let frameCount = 0;

  function sideSkills(side) {
    const spec = teams[side];
    if (!spec) return null;
    return typeof spec === "string" ? PRESETS[spec] : spec;
  }

  // teams の片方を null にすると、そのチームは人が操作する（CPU は手を出さない）。
  function buildRoles() {
    roles = {};
    for (const side of ["blue", "red"]) {
      const k = sideSkills(side);
      if (!k) continue;
      roles[side] = { pitcher: new Pitcher(k.pitcher), fielder: new Fielder(k.fielder), batter: new Batter(k.batter), runner: new Runner(k.runner) };
    }
  }

  let wasInPlay = false;
  // start し直したとき古いループが残らないよう、ループごとに番号を持たせる。
  let loopId = 0;
  function loop(id) {
    if (!running || id !== loopId) return;
    requestAnimationFrame(() => loop(id));
    frame();
  }
  function frame() {
    frameCount++;
    const phase = G.phase;
    if (phase !== lastPhase) {
      releaseAll();
      for (const r of Object.values(roles)) {
        r.batter.reset(); r.fielder.reset(); r.runner.reset();
        r.pitcher.gesture = null;
      }
      // 盤面の寸法は試合中に変わり得る（回転・リサイズ）。区切りごとに測り直す。
      refreshGeom();
      lastPhase = phase;
    }
    if (phase !== "playing" || !S.isRunning) return;
    const attack = G.isTop ? "blue" : "red";
    const defend = G.isTop ? "red" : "blue";
    const att = roles[attack], def = roles[defend];
    if (wasInPlay && !S.inPlay) def?.fielder.reset();
    wasInPlay = S.inPlay;
    if (S.inPlay) {
      def?.fielder.frame();
      att?.runner.frame();
      att?.batter.frame();
    } else {
      def?.pitcher.frame();
      att?.batter.frame();
    }
  }

  window.__yakyuBots = {
    PRESETS,
    start(config) {
      if (running) this.stop();
      teams = config.teams;
      if (config.batLead !== undefined) BAT_LEAD = config.batLead;
      if (config.batSweetOffset !== undefined) BAT_SWEET_OFFSET = config.batSweetOffset;
      refreshGeom();
      buildRoles();
      running = true;
      wasInPlay = false;
      lastPhase = null;
      const id = ++loopId;
      requestAnimationFrame(() => loop(id));
    },
    stop() { running = false; releaseAll(); },
    get running() { return running; },
    log: LOG,
    setBatLead(v) { BAT_LEAD = v; },
    frames: () => frameCount,
  };
})();
