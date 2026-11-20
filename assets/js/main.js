/* ==========================================================
   Coffee Fox Studio — page "bientôt disponible"
   ========================================================== */

/* ---------- CONFIGURATION : c'est ici que vous modifiez le site ---------- */
const CONFIG = {
  // Mettez l'URL de vos réseaux. Laissez "" pour masquer un lien.
  links: {
    discord: "",
    tiktok: "",
    instagram: "",
    x: "",
    youtube: "",
    itch: "",
    steam: ""
  },

  // Adresse de contact. Laissez "" pour masquer le bouton "Nous écrire".
  email: "",

  // Phrases tapées à la machine sous le titre
  phrases: [
    "Notre site infuse doucement…",
    "Le renard moud les grains un par un.",
    "Notre premier jeu de gestion se prépare dans l'ombre.",
    "4 devs, 1 renard, beaucoup trop de café.",
    "Revenez bientôt, le café sera chaud."
  ],

  // Répliques du renard quand on clique dessus
  quips: [
    "Hé ! Pas touche à mon café.",
    "Un renard sans café, c'est un renard qui bug.",
    "Encore un clic et je publie le jeu… non, je rigole.",
    "Patience, le meilleur café est le plus lent.",
    "Tu veux pas plutôt jouer au mini-jeu ?",
    "Je code, donc je suis (fatigué)."
  ],

  // Le renard s'endort après ce délai sans activité (ms)
  sleepAfter: 20000
};

(() => {
  "use strict";

  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const A = window.CFAchievements;
  const unlock = id => A && A.unlock(id);

  $("#year").textContent = new Date().getFullYear();

  /* ---------- Salutation selon l'heure ---------- */
  const hour = new Date().getHours();
  $("#greeting").textContent =
    hour < 5 ? "Bonsoir, oiseau de nuit" :
    hour < 12 ? "Bonjour, voyageur" :
    hour < 18 ? "Bon après-midi, voyageur" :
    "Bonsoir, voyageur";

  /* ---------- Réseaux & contact ---------- */
  const LABELS = {
    discord: "Discord", tiktok: "TikTok", instagram: "Instagram", x: "X",
    youtube: "YouTube", itch: "itch.io", steam: "Steam"
  };
  const socials = $("#socials");
  const filled = Object.entries(CONFIG.links).filter(([, url]) => url && url.trim());
  if (filled.length) {
    filled.forEach(([key, url]) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = LABELS[key] || key;
      li.appendChild(a);
      socials.appendChild(li);
    });
  } else {
    socials.innerHTML = '<li class="muted">Nos réseaux arrivent bientôt</li>';
  }

  if (CONFIG.email) {
    const c = $("#contactBtn");
    c.href = "mailto:" + CONFIG.email;
    c.hidden = false;
  }

  /* ---------- Titre découpé en lettres ---------- */
  const letters = [];
  $$("[data-split]").forEach(el => {
    const text = el.textContent;
    el.textContent = "";
    [...text].forEach(ch => {
      const s = document.createElement("span");
      s.className = "letter";
      s.textContent = ch;
      el.appendChild(s);
      letters.push(s);
    });
  });

  /* ---------- Écran de chargement puis intro ---------- */
  const loader = $("#loader");
  const t0 = performance.now();
  let introStarted = false;

  function hideLoader() {
    if (introStarted) return;
    introStarted = true;
    const wait = reduced ? 0 : Math.max(0, 1150 - (performance.now() - t0));
    setTimeout(() => {
      loader.classList.add("hidden");
      document.body.classList.add("ready");
      setTimeout(() => loader.remove(), 800);
      runIntro();
    }, wait);
  }

  if (document.readyState === "complete") hideLoader();
  else window.addEventListener("load", hideLoader);
  setTimeout(hideLoader, 3500);

  function runIntro() {
    let delay = reduced ? 0 : 350;
    letters.forEach(l => {
      setTimeout(() => l.classList.add("in"), delay);
      if (!reduced) delay += 60;
    });
    setTimeout(typeLoop, delay + 200);
    setTimeout(startBrew, reduced ? 0 : 900);
    setTimeout(() => unlock("first_brew"), 1800);
    if (hour < 5) setTimeout(() => unlock("night_owl"), 3200);
    scheduleTwitch();
  }

  /* ---------- Texte machine à écrire ---------- */
  const typedEl = $("#typed");
  let pi = 0, ci = 0, deleting = false;

  function typeLoop() {
    const current = CONFIG.phrases[pi];
    if (!deleting) {
      ci++;
      typedEl.textContent = current.slice(0, ci);
      if (ci >= current.length) {
        deleting = true;
        return setTimeout(typeLoop, 2300);
      }
      setTimeout(typeLoop, 42 + Math.random() * 55);
    } else {
      ci--;
      typedEl.textContent = current.slice(0, ci);
      if (ci <= 0) {
        deleting = false;
        pi = (pi + 1) % CONFIG.phrases.length;
        return setTimeout(typeLoop, 380);
      }
      setTimeout(typeLoop, 20);
    }
  }

  /* ---------- Barre d'infusion (bloquée à 87 %, évidemment) ---------- */
  const fill = $("#fill");
  const pctEl = $("#pct");
  const brewText = $("#brewText");
  const brewBox = $("#brew");
  const TARGET = 87;
  let progress = 0;
  let quipTimer = 0;

  function stageText(p) {
    if (p >= TARGET) return "Presque prêt…";
    if (p < 30) return "Torréfaction des grains…";
    if (p < 60) return "Mouture…";
    return "Infusion…";
  }

  function renderBrew() {
    fill.style.width = progress.toFixed(1) + "%";
    pctEl.textContent = Math.floor(progress) + "%";
    brewBox.setAttribute("aria-valuenow", Math.floor(progress));
    if (!quipTimer) brewText.textContent = stageText(progress);
  }

  function startBrew() {
    if (reduced) {
      progress = TARGET;
      return renderBrew();
    }
    (function step() {
      progress += (TARGET - progress) * .012 + .02;
      if (progress >= TARGET) progress = TARGET;
      renderBrew();
      if (progress < TARGET) requestAnimationFrame(step);
    })();
  }

  function say(text, ms = 2600) {
    clearTimeout(quipTimer);
    brewText.textContent = text;
    quipTimer = setTimeout(() => {
      quipTimer = 0;
      brewText.textContent = stageText(progress);
    }, ms);
  }

  /* ---------- Mascotte ---------- */
  const mascot = $("#mascot");
  const pupils = mascot.querySelectorAll(".pupil");
  const headTilt = $("#headTilt");
  const steams = mascot.querySelectorAll(".steam");
  const STEAM_X = [262, 276, 290];
  const mouse = { x: innerWidth / 2, y: innerHeight / 3, active: false };
  let tilt = 0;

  function drawSteam(t) {
    steams.forEach((p, i) => {
      let d = "";
      for (let y = 190; y >= 82; y -= 4) {
        const h = (190 - y) / 108;
        const amp = 2 + h * 8;
        const x = STEAM_X[i] + Math.sin(y * .06 - t * .0022 + i * 2.1) * amp;
        d += (d ? " L" : "M") + x.toFixed(1) + " " + y;
      }
      p.setAttribute("d", d);
    });
  }

  function updateGaze() {
    const r = mascot.getBoundingClientRect();
    const cx = r.left + r.width * (150 / 360);
    const cy = r.top + r.height * (116 / 310);
    const dxm = mouse.x - cx;
    const dym = mouse.y - cy;
    const ang = Math.atan2(dym, dxm);
    const dist = Math.min(1, Math.hypot(dxm, dym) / 300);
    const dx = Math.cos(ang) * 3.2 * dist;
    const dy = Math.sin(ang) * 3.2 * dist;
    pupils.forEach(p => p.setAttribute("transform", `translate(${dx.toFixed(2)} ${dy.toFixed(2)})`));

    const want = mouse.active && !mascot.classList.contains("sleeping")
      ? Math.max(-7, Math.min(7, dxm / 60))
      : 0;
    tilt += (want - tilt) * .08;
    headTilt.setAttribute("transform", `rotate(${tilt.toFixed(2)} 150 175)`);
  }

  function frame(t) {
    drawSteam(t);
    updateGaze();
    requestAnimationFrame(frame);
  }

  if (reduced) drawSteam(0);
  else requestAnimationFrame(frame);

  // Oreilles qui frétillent de temps en temps
  function scheduleTwitch() {
    if (reduced) return;
    setTimeout(() => {
      if (!mascot.classList.contains("sleeping")) {
        const side = Math.random() < .5 ? "twitch-l" : "twitch-r";
        mascot.classList.add(side);
        setTimeout(() => mascot.classList.remove(side), 460);
      }
      scheduleTwitch();
    }, 2500 + Math.random() * 4500);
  }

  // Le renard s'endort si on ne fait rien
  let idleTimer = 0;
  function wake() {
    if (mascot.classList.contains("sleeping")) {
      mascot.classList.remove("sleeping");
      say("Hein ? Je dormais pas, je compilais.");
    }
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      if ($("#gameDialog").open) return wake();
      mascot.classList.add("sleeping");
      unlock("sleepy");
    }, CONFIG.sleepAfter);
  }
  ["pointermove", "pointerdown", "keydown", "scroll", "touchstart"].forEach(ev =>
    window.addEventListener(ev, wake, { passive: true })
  );
  wake();

  // Clic sur le renard
  let clicks = 0;
  let qi = 0;
  function poke(x, y) {
    mascot.classList.remove("jump");
    void mascot.getBoundingClientRect();
    mascot.classList.add("jump");
    burst(x, y);
    clicks++;
    unlock("fox_friend");
    if (clicks >= 15) unlock("caffeine");
    say(clicks === 15 ? "OK, OK, t'as gagné un succès. Contents ?" : CONFIG.quips[qi]);
    qi = (qi + 1) % CONFIG.quips.length;
  }

  mascot.addEventListener("pointerdown", e => e.preventDefault()); // pas de contour de focus à la souris
  mascot.addEventListener("click", e => poke(e.clientX, e.clientY));
  mascot.addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const r = mascot.getBoundingClientRect();
      poke(r.left + r.width / 2, r.top + r.height / 2);
    }
  });

  // Code Konami
  const KONAMI = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"];
  let kIndex = 0;
  window.addEventListener("keydown", e => {
    const k = e.key.toLowerCase();
    kIndex = k === KONAMI[kIndex] ? kIndex + 1 : (k === KONAMI[0] ? 1 : 0);
    if (kIndex === KONAMI.length) {
      kIndex = 0;
      mascot.classList.toggle("cool");
      unlock("konami");
      say(mascot.classList.contains("cool") ? "Trop stylé pour ce monde." : "Bon, je range les lunettes.");
      const r = mascot.getBoundingClientRect();
      burst(r.left + r.width * .42, r.top + r.height * .37);
    }
  });

  /* ---------- Fond : grains de café et braises ---------- */
  const canvas = $("#bg");
  const ctx = canvas.getContext("2d");
  let W = 0, H = 0, particles = [];

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = innerWidth;
    H = innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round(Math.min(75, (W * H) / 20000));
    particles = particles.filter(p => p.burst);
    for (let i = 0; i < count; i++) particles.push(makeParticle(true));
  }

  function makeParticle(anywhere) {
    const bean = Math.random() < .45;
    return {
      bean,
      x: Math.random() * W,
      y: anywhere ? Math.random() * H : H + 20,
      size: bean ? 5 + Math.random() * 6 : 1 + Math.random() * 2,
      vy: bean ? .15 + Math.random() * .3 : .3 + Math.random() * .6,
      vx: (Math.random() - .5) * .2,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - .5) * .01,
      alpha: bean ? .14 + Math.random() * .22 : .3 + Math.random() * .5,
      depth: .3 + Math.random() * .7,
      phase: Math.random() * Math.PI * 2
    };
  }

  function burst(x, y) {
    for (let i = 0; i < 20; i++) {
      const p = makeParticle(true);
      p.bean = Math.random() < .6;
      p.size = p.bean ? 5 + Math.random() * 5 : 1.5 + Math.random() * 2;
      p.x = x;
      p.y = y;
      const a = Math.random() * Math.PI * 2;
      const s = 1.5 + Math.random() * 3.2;
      p.vx = Math.cos(a) * s;
      p.vy = Math.abs(Math.sin(a) * s) + .5;
      p.vr = (Math.random() - .5) * .2;
      p.alpha = .65;
      p.depth = 0;
      p.burst = true;
      particles.push(p);
    }
  }

  function drawBean(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = "#6b4226";
    ctx.beginPath();
    ctx.ellipse(0, 0, p.size, p.size * .68, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#2a1a12";
    ctx.lineWidth = Math.max(1, p.size * .18);
    ctx.beginPath();
    ctx.moveTo(-p.size * .75, 0);
    ctx.quadraticCurveTo(0, p.size * .3, p.size * .75, 0);
    ctx.stroke();
    ctx.restore();
  }

  function drawEmber(p, t) {
    const flicker = .6 + .4 * Math.sin(t * .004 + p.phase);
    ctx.globalAlpha = p.alpha * flicker;
    ctx.fillStyle = "#e8742c";
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * 2.6, 0, Math.PI * 2);
    ctx.globalAlpha *= .18;
    ctx.fill();
    ctx.globalAlpha = p.alpha * flicker;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }

  function animateBg(t) {
    ctx.clearRect(0, 0, W, H);
    const offX = (mouse.x / W - .5) * 14;
    const offY = (mouse.y / H - .5) * 14;

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      if (p.burst) {
        p.vx *= .96;
        p.vy = p.vy * .96 + .01;
        p.alpha *= .985;
        if (p.alpha < .03) { particles.splice(i, 1); continue; }
      }
      p.y -= p.vy;
      p.x += p.vx + Math.sin(t * .001 + p.phase) * .15;
      p.rot += p.vr;

      if (!p.burst && (p.y < -20 || p.x < -30 || p.x > W + 30)) {
        particles[i] = makeParticle(false);
        continue;
      }

      const ox = p.x, oy = p.y;
      p.x += offX * p.depth;
      p.y += offY * p.depth;
      if (p.bean) drawBean(p); else drawEmber(p, t);
      p.x = ox;
      p.y = oy;
    }
    ctx.globalAlpha = 1;
    if (!reduced) requestAnimationFrame(animateBg);
  }

  window.addEventListener("resize", resize);
  resize();
  if (reduced) animateBg(0);
  else requestAnimationFrame(animateBg);

  /* ---------- Halo qui suit la souris ---------- */
  const glow = $("#glow");
  window.addEventListener("pointermove", e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
    if (finePointer) glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
  }, { passive: true });
  document.addEventListener("pointerleave", () => { mouse.active = false; });

  /* ---------- Fenêtres : mini-jeu & succès ---------- */
  const gameDialog = $("#gameDialog");
  const achDialog = $("#achDialog");

  function openDialog(d) {
    if (typeof d.showModal === "function") d.showModal();
    else d.setAttribute("open", "");
  }

  $$("[data-close]").forEach(btn =>
    btn.addEventListener("click", () => btn.closest("dialog").close())
  );

  [gameDialog, achDialog].forEach(d => {
    d.addEventListener("click", e => { if (e.target === d) d.close(); });
  });

  $("#playBtn").addEventListener("click", () => {
    openDialog(gameDialog);
    window.CFMiniGame.open();
  });
  gameDialog.addEventListener("close", () => window.CFMiniGame.stop());

  const achBtn = $("#achBtn");
  const achList = $("#achList");

  function renderAchievements() {
    if (!A) return;
    $("#achCount").textContent = A.count() + "/" + A.total();
    $("#achSummary").textContent = A.count() + " / " + A.total();
    achList.innerHTML = "";
    A.LIST.forEach(a => {
      const got = A.has(a.id);
      const li = document.createElement("li");
      li.className = "ach " + (got ? "unlocked" : "locked");
      li.innerHTML = '<span class="ach-icon" aria-hidden="true"></span><div><div class="ach-title"></div><div class="ach-desc"></div></div>';
      li.querySelector(".ach-icon").textContent = got ? a.icon : "🔒";
      li.querySelector(".ach-title").textContent = a.title;
      li.querySelector(".ach-desc").textContent = a.desc;
      achList.appendChild(li);
    });
  }

  if (A) {
    renderAchievements();
    A.onChange(() => {
      renderAchievements();
      achBtn.classList.remove("bump");
      void achBtn.offsetWidth;
      achBtn.classList.add("bump");
    });
  }

  achBtn.addEventListener("click", () => {
    renderAchievements();
    openDialog(achDialog);
  });

  $("#achReset").addEventListener("click", () => {
    if (A && confirm("Effacer tous vos succès ?")) A.reset();
  });

  /* ---------- Petit mot pour les curieux qui ouvrent la console ---------- */
  console.log(
    "%c☕ Coffee Fox Studio %c\nTu fouilles dans le code ? On aime ça. Essaie le code Konami 😉",
    "font: 800 18px Georgia, serif; color: #e8742c;",
    "font: 13px sans-serif; color: #c9a27e;"
  );
})();
