/* Coffee Fox Studio — système de succès (façon Steam), partagé par toutes les pages */
window.CFAchievements = (() => {
  "use strict";

  const LIST = [
    { id: "first_brew",   icon: "☕", title: "Premier café",        desc: "Passer voir le site du studio." },
    { id: "fox_friend",   icon: "🦊", title: "Ami des renards",     desc: "Cliquer sur le renard." },
    { id: "caffeine",     icon: "⚡", title: "Accro à la caféine",  desc: "Cliquer 15 fois sur le renard." },
    { id: "sleepy",       icon: "💤", title: "Berceuse",            desc: "Laisser le renard s'endormir." },
    { id: "night_owl",    icon: "🌙", title: "Oiseau de nuit",      desc: "Visiter le site entre minuit et 5 h." },
    { id: "konami",       icon: "😎", title: "Code secret",         desc: "↑ ↑ ↓ ↓ ← → ← → B A" },
    { id: "barista",      icon: "🎮", title: "Barista débutant",    desc: "Lancer le mini-jeu." },
    { id: "score50",      icon: "🫘", title: "Barista confirmé",    desc: "Faire 50 points au mini-jeu." },
    { id: "score150",     icon: "🏆", title: "Maître torréfacteur", desc: "Faire 150 points au mini-jeu." },
    { id: "lost",         icon: "🧭", title: "Égaré",               desc: "Trouver la page 404." },
    { id: "completionist",icon: "👑", title: "Complétionniste",     desc: "Débloquer tous les autres succès." }
  ];

  const KEY = "cfs-achievements";
  const listeners = [];
  let unlocked = load();
  let container = null;

  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY));
      return Array.isArray(raw) ? raw : [];
    } catch (e) {
      return [];
    }
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(unlocked)); } catch (e) { /* navigation privée */ }
  }

  function ensureContainer() {
    if (container) return;
    container = document.createElement("div");
    container.className = "toasts";
    container.setAttribute("aria-live", "polite");
    document.body.appendChild(container);
  }

  function toast(a) {
    ensureContainer();
    // Une fenêtre modale ouverte passe au-dessus de tout : on y place les notifications
    const host = document.querySelector("dialog[open]") || document.body;
    if (container.parentNode !== host) host.appendChild(container);
    const el = document.createElement("div");
    el.className = "toast";
    el.innerHTML =
      '<div class="toast-icon" aria-hidden="true"></div>' +
      '<div><div class="toast-kicker">Succès débloqué</div>' +
      '<div class="toast-title"></div><div class="toast-desc"></div></div>';
    el.querySelector(".toast-icon").textContent = a.icon;
    el.querySelector(".toast-title").textContent = a.title;
    el.querySelector(".toast-desc").textContent = a.desc;
    container.appendChild(el);
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add("show")));
    setTimeout(() => {
      el.classList.remove("show");
      setTimeout(() => el.remove(), 600);
    }, 4200);
  }

  function notify() { listeners.forEach(fn => { try { fn(); } catch (e) {} }); }

  function unlock(id) {
    if (unlocked.includes(id)) return false;
    const a = LIST.find(x => x.id === id);
    if (!a) return false;
    unlocked.push(id);
    save();
    toast(a);
    notify();

    const others = LIST.filter(x => x.id !== "completionist");
    if (id !== "completionist" && others.every(x => unlocked.includes(x.id))) {
      setTimeout(() => unlock("completionist"), 1200);
    }
    return true;
  }

  function reset() {
    unlocked = [];
    save();
    notify();
  }

  return {
    LIST,
    unlock,
    reset,
    has: id => unlocked.includes(id),
    count: () => unlocked.length,
    total: () => LIST.length,
    onChange: fn => listeners.push(fn)
  };
})();
