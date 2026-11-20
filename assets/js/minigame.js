/* Coffee Fox Studio — mini-jeu "Attrape les grains" */
window.CFMiniGame = (() => {
  "use strict";

  const W = 420;
  const H = 560;
  const GROUND = H - 22;
  const MUG_W = 62;
  const MUG_H = 52;
  const MUG_TOP = GROUND - MUG_H;

  let canvas, ctx, els, ready = false;
  let state = null;
  let raf = 0;
  let last = 0;
  let best = 0;
  const keys = { left: false, right: false };
  const stars = Array.from({ length: 40 }, () => ({
    x: Math.random() * W,
    y: Math.random() * (H - 120),
    r: Math.random() * 1.3 + .3,
    p: Math.random() * Math.PI * 2
  }));

  const ach = id => window.CFAchievements && window.CFAchievements.unlock(id);

  function loadBest() {
    try { return parseInt(localStorage.getItem("cfs-best") || "0", 10) || 0; } catch (e) { return 0; }
  }

  function saveBest(v) {
    try { localStorage.setItem("cfs-best", String(v)); } catch (e) {}
  }

  function setup() {
    if (ready) return;
    ready = true;

    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");
    els = {
      dialog: document.getElementById("gameDialog"),
      score: document.getElementById("gScore"),
      best: document.getElementById("gBest"),
      lives: document.getElementById("gLives"),
      overlay: document.getElementById("gOverlay"),
      title: document.getElementById("gOverlayTitle"),
      text: document.getElementById("gOverlayText"),
      start: document.getElementById("gStart")
    };

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    best = loadBest();
    els.best.textContent = best;

    const aim = e => {
      if (!state) return;
      const r = canvas.getBoundingClientRect();
      state.targetX = ((e.clientX - r.left) / r.width) * W;
    };
    canvas.addEventListener("pointermove", aim);
    canvas.addEventListener("pointerdown", aim);

    window.addEventListener("keydown", e => {
      if (!els.dialog.open) return;
      const k = e.key.toLowerCase();
      if (k === "arrowleft" || k === "q" || k === "a") { keys.left = true; e.preventDefault(); }
      if (k === "arrowright" || k === "d") { keys.right = true; e.preventDefault(); }
      if ((k === " " || k === "enter") && !(state && state.running) && document.activeElement !== els.start) {
        e.preventDefault();
        startGame();
      }
    });

    window.addEventListener("keyup", e => {
      const k = e.key.toLowerCase();
      if (k === "arrowleft" || k === "q" || k === "a") keys.left = false;
      if (k === "arrowright" || k === "d") keys.right = false;
    });

    els.start.addEventListener("click", startGame);
  }

  function freshState(running) {
    return {
      running,
      x: W / 2,
      targetX: W / 2,
      items: [],
      parts: [],
      floats: [],
      score: 0,
      lives: 3,
      combo: 0,
      t: 0,
      spawn: .6,
      shake: 0,
      hurt: 0,
      fill: 0
    };
  }

  /* ---------- Boucle ---------- */
  function startGame() {
    if (state && state.running) return;
    state = freshState(true);
    keys.left = keys.right = false;
    els.overlay.classList.add("hidden");
    updateHud();
    ach("barista");
    canvas.focus({ preventScroll: true });
  }

  function gameOver() {
    state.running = false;
    let record = "";
    if (state.score > best) {
      best = state.score;
      saveBest(best);
      els.best.textContent = best;
      record = "<br><b class=\"gold\">Nouveau record !</b>";
    }
    els.title.textContent = state.score >= 150 ? "Légendaire !" : state.score >= 50 ? "Bien infusé !" : "Game over";
    els.text.innerHTML = "Score : <b>" + state.score + "</b> · Record : <b>" + best + "</b>" + record;
    els.start.textContent = "Rejouer";
    setTimeout(() => {
      els.overlay.classList.remove("hidden");
      els.start.focus({ preventScroll: true });
    }, 700);
  }

  function loop(t) {
    const dt = Math.min(.05, (t - last) / 1000 || 0);
    last = t;
    if (state.running) update(dt);
    updateEffects(dt);
    draw(t);
    raf = requestAnimationFrame(loop);
  }

  function spawnItem(diff) {
    const r = Math.random();
    const gold = .06;
    const bug = Math.min(.38, .16 + diff * .045);
    const type = r < gold ? "gold" : r < gold + bug ? "bug" : "bean";
    state.items.push({
      type,
      x: 26 + Math.random() * (W - 52),
      y: -20,
      r: type === "bug" ? 13 : type === "gold" ? 12 : 11,
      vy: (125 + Math.random() * 70) * (.75 + diff * .25),
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - .5) * 4,
      sway: 10 + Math.random() * 20,
      phase: Math.random() * Math.PI * 2
    });
  }

  function update(dt) {
    const s = state;
    s.t += dt;
    const diff = 1 + s.t / 25;

    const dir = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
    if (dir) s.targetX += dir * 560 * dt;
    s.targetX = Math.max(MUG_W / 2 + 4, Math.min(W - MUG_W / 2 - 14, s.targetX));
    s.x += (s.targetX - s.x) * Math.min(1, dt * 14);

    s.spawn -= dt;
    if (s.spawn <= 0) {
      spawnItem(diff);
      s.spawn = Math.max(.24, .85 / diff) * (.7 + Math.random() * .6);
    }

    for (let i = s.items.length - 1; i >= 0; i--) {
      const it = s.items[i];
      it.y += it.vy * dt;
      it.x += Math.cos(s.t * 2 + it.phase) * it.sway * dt;
      it.rot += it.vr * dt;

      const caught =
        it.y + it.r > MUG_TOP &&
        it.y - it.r < MUG_TOP + 20 &&
        Math.abs(it.x - s.x) < MUG_W / 2 + it.r * .4;

      if (caught) {
        s.items.splice(i, 1);
        if (it.type === "bug") {
          s.lives--;
          s.combo = 0;
          s.shake = .35;
          s.hurt = .4;
          burst(it.x, MUG_TOP, "#e0533d", 16);
          floatText(it.x, MUG_TOP - 10, "-1 ♥", "#e0533d");
          els.lives.classList.remove("hit");
          void els.lives.offsetWidth;
          els.lives.classList.add("hit");
          if (s.lives <= 0) gameOver();
        } else {
          s.combo++;
          const mult = s.combo >= 20 ? 3 : s.combo >= 10 ? 2 : 1;
          const pts = (it.type === "gold" ? 5 : 1) * mult;
          s.score += pts;
          s.fill = Math.min(1, s.fill + .03);
          burst(it.x, MUG_TOP, it.type === "gold" ? "#f5c04a" : "#c98a5a", it.type === "gold" ? 18 : 8);
          floatText(it.x, MUG_TOP - 10, "+" + pts + (mult > 1 ? " ×" + mult : ""), it.type === "gold" ? "#f5c04a" : "#f3e6d6");
          if (s.score >= 50) ach("score50");
          if (s.score >= 150) ach("score150");
        }
        updateHud();
        continue;
      }

      if (it.y - it.r > H) {
        s.items.splice(i, 1);
        if (it.type !== "bug") s.combo = 0;
      }
    }
  }

  function updateEffects(dt) {
    const s = state;
    s.shake = Math.max(0, s.shake - dt);
    s.hurt = Math.max(0, s.hurt - dt);
    s.fill = Math.max(0, s.fill - dt * .02);

    for (let i = s.parts.length - 1; i >= 0; i--) {
      const p = s.parts[i];
      p.life -= dt;
      if (p.life <= 0) { s.parts.splice(i, 1); continue; }
      p.vy += 420 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }

    for (let i = s.floats.length - 1; i >= 0; i--) {
      const f = s.floats[i];
      f.life -= dt;
      f.y -= 40 * dt;
      if (f.life <= 0) s.floats.splice(i, 1);
    }
  }

  function burst(x, y, color, n) {
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (Math.random() - .5) * Math.PI * 1.3;
      const sp = 90 + Math.random() * 180;
      state.parts.push({
        x, y, color,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        r: 1.5 + Math.random() * 2.5,
        life: .5 + Math.random() * .4,
        max: .9
      });
    }
  }

  function floatText(x, y, text, color) {
    state.floats.push({ x, y, text, color, life: .9 });
  }

  function updateHud() {
    els.score.textContent = state.score;
    const l = Math.max(0, state.lives);
    els.lives.textContent = "♥".repeat(l) + "♡".repeat(3 - l);
    els.lives.setAttribute("aria-label", l + " vie" + (l > 1 ? "s" : ""));
  }

  /* ---------- Dessin ---------- */
  function rrect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawBackground(t) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#22160f");
    g.addColorStop(1, "#3a2416");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    stars.forEach(st => {
      ctx.globalAlpha = .25 + .25 * Math.sin(t * .002 + st.p);
      ctx.fillStyle = "#f3e6d6";
      ctx.beginPath();
      ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    ctx.fillStyle = "rgba(0,0,0,.28)";
    ctx.fillRect(0, GROUND, W, H - GROUND);
    ctx.fillStyle = "rgba(232,116,44,.25)";
    ctx.fillRect(0, GROUND, W, 2);
  }

  function drawBean(x, y, r, rot, gold) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    if (gold) {
      ctx.shadowColor = "#f5c04a";
      ctx.shadowBlur = 16;
    }
    ctx.fillStyle = gold ? "#f5c04a" : "#7a4a2a";
    ctx.beginPath();
    ctx.ellipse(0, 0, r, r * .68, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = gold ? "#b8861f" : "#2a1a12";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-r * .75, 0);
    ctx.quadraticCurveTo(0, r * .35, r * .75, 0);
    ctx.stroke();
    ctx.restore();
  }

  function drawBug(x, y, r, t) {
    ctx.save();
    ctx.translate(x, y);
    const wiggle = Math.sin(t * .02) * 2;
    ctx.strokeStyle = "#2a1a12";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(-r * .6, i * 5);
      ctx.lineTo(-r - 4, i * 7 + wiggle * i);
      ctx.moveTo(r * .6, i * 5);
      ctx.lineTo(r + 4, i * 7 - wiggle * i);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(-3, -r);
    ctx.quadraticCurveTo(-7, -r - 8, -10, -r - 6 + wiggle);
    ctx.moveTo(3, -r);
    ctx.quadraticCurveTo(7, -r - 8, 10, -r - 6 - wiggle);
    ctx.stroke();

    ctx.fillStyle = "#e0533d";
    ctx.beginPath();
    ctx.ellipse(0, 2, r * .8, r, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#2a1a12";
    ctx.beginPath();
    ctx.arc(0, -r * .7, r * .45, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,.45)";
    ctx.beginPath();
    ctx.moveTo(0, -r * .3);
    ctx.lineTo(0, r);
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,.75)";
    ctx.beginPath();
    ctx.arc(-4, 0, 2, 0, Math.PI * 2);
    ctx.arc(4, 5, 1.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawPlayer(t) {
    const s = state;
    const x = s.x;
    const top = MUG_TOP;
    const bob = Math.sin(t * .006) * 1.5;

    // Le renard caché dans la tasse
    const hy = top - 4 + bob;
    ctx.fillStyle = "#e8742c";
    ctx.beginPath();
    ctx.moveTo(x - 21, hy - 2);
    ctx.lineTo(x - 15, hy - 26);
    ctx.lineTo(x - 4, hy - 12);
    ctx.moveTo(x + 21, hy - 2);
    ctx.lineTo(x + 15, hy - 26);
    ctx.lineTo(x + 4, hy - 12);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, hy + 6, 22, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = "#3b2417";
    ctx.beginPath();
    ctx.moveTo(x - 17, hy - 6);
    ctx.lineTo(x - 14.5, hy - 19);
    ctx.lineTo(x - 9, hy - 11);
    ctx.moveTo(x + 17, hy - 6);
    ctx.lineTo(x + 14.5, hy - 19);
    ctx.lineTo(x + 9, hy - 11);
    ctx.fill();
    ctx.fillStyle = "#f3e6d6";
    ctx.beginPath();
    ctx.ellipse(x - 11, hy + 3, 7, 4, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 11, hy + 3, 7, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1a110c";
    const blink = (t % 3600) < 120 ? .3 : 1;
    ctx.beginPath();
    ctx.ellipse(x - 8, hy - 3, 2.8, 3.4 * blink, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 8, hy - 3, 2.8, 3.4 * blink, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tasse
    ctx.strokeStyle = "#eadac6";
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(x + MUG_W / 2, top + 24, 11, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();

    ctx.fillStyle = s.hurt > 0 ? "#f3b0a4" : "#f3e6d6";
    rrect(x - MUG_W / 2, top, MUG_W, MUG_H, 10);
    ctx.fill();
    ctx.fillStyle = "#e8742c";
    ctx.fillRect(x - MUG_W / 2, top + 15, MUG_W, 7);

    // Niveau de café
    if (s.fill > 0) {
      ctx.fillStyle = "rgba(59,36,23,.25)";
      const h = (MUG_H - 30) * s.fill;
      ctx.fillRect(x - MUG_W / 2 + 6, top + MUG_H - 6 - h, MUG_W - 12, h);
    }

    if (s.combo >= 10) {
      ctx.font = "600 12px Inter, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = "#f5c04a";
      ctx.fillText("COMBO ×" + (s.combo >= 20 ? 3 : 2), x, top + 44);
    }
  }

  function draw(t) {
    const s = state;
    ctx.save();
    if (s.shake > 0) {
      const m = s.shake * 18;
      ctx.translate((Math.random() - .5) * m, (Math.random() - .5) * m);
    }

    drawBackground(t);

    s.items.forEach(it => {
      if (it.type === "bug") drawBug(it.x, it.y, it.r, t);
      else drawBean(it.x, it.y, it.r, it.rot, it.type === "gold");
    });

    drawPlayer(t);

    s.parts.forEach(p => {
      ctx.globalAlpha = Math.max(0, p.life / p.max);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.font = "700 16px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    s.floats.forEach(f => {
      ctx.globalAlpha = Math.min(1, f.life * 2);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x, f.y);
    });
    ctx.globalAlpha = 1;

    if (s.hurt > 0) {
      ctx.fillStyle = "rgba(224,83,61," + (s.hurt * .35) + ")";
      ctx.fillRect(0, 0, W, H);
    }
    ctx.restore();
  }

  /* ---------- API ---------- */
  function open() {
    setup();
    state = freshState(false);
    els.title.textContent = "Prêt, barista ?";
    els.text.innerHTML =
      "Attrape les <b>grains de café</b> avec la tasse.<br>" +
      "Les <b class=\"gold\">grains dorés</b> valent 5 points.<br>" +
      "Évite les <b class=\"bug\">bugs</b> : 3 vies, pas une de plus.";
    els.start.textContent = "Jouer";
    els.overlay.classList.remove("hidden");
    updateHud();
    cancelAnimationFrame(raf);
    last = performance.now();
    raf = requestAnimationFrame(loop);
    setTimeout(() => els.start.focus({ preventScroll: true }), 50);
  }

  function stop() {
    cancelAnimationFrame(raf);
    if (state) state.running = false;
    keys.left = keys.right = false;
  }

  return { open, stop };
})();
