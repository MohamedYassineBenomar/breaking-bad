
/* Game page logic: function expressions only, createElement only, no innerHTML */

var CONFIG_KEY = "config";
var SCORE_KEY = "highScore";
var TOTALS_KEY = "totals";

var state = {
  secret: "",
  masked: [],
  errors: 0,
  maxErrors: 9,
  streak: 0,
  score: 0,
  used: {},
  started: false,
  totalGames: 0,
  gamesWon: 0
};

var A2Z = (function () {
  var arr = [];
  for (var c = 65; c <= 90; c++) { arr.push(String.fromCharCode(c)); }
  return arr;
})();

var byId = function (id) { return document.getElementById(id); };

var applyBgFromConfig = function () {
  var cfg = loadFromStorage("session", CONFIG_KEY);
  if (cfg && cfg.bgColorClass) {
    document.body.classList.add(cfg.bgColorClass);
    var langEl = byId("browserLang");
    if (langEl) { langEl.textContent = cfg.lang || ""; }
  }
};

var setBalloonStage = function () {
  var el = byId("balloon");
  // Simple SVG label (no external images). 9 stages.
  var stage = state.errors;
  var svg = 'data:image/svg+xml;charset=utf-8,' +
    encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160">' +
      '<rect x="0" y="0" width="160" height="160" fill="white" stroke="#999"/>' +
      '<circle cx="80" cy="70" r="'+ (70 - stage*6) +'" stroke="black" fill="none" stroke-width="2" />' +
      '<text x="80" y="150" font-size="16" text-anchor="middle">' + stage + ' / 9</text>' +
    '</svg>');
  el.setAttribute("src", svg);
};

var updateSlotsView = function () {
  var slots = byId("wordSlots");
  // Build string with spaces
  var s = "";
  for (var i = 0; i < state.masked.length; i++) {
    s += state.masked[i] + " ";
  }
  slots.textContent = s.trim();
};

var setLettersDisabled = function (disabled) {
  var container = byId("letters");
  var buttons = container.getElementsByTagName("button");
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].disabled = disabled;
  }
  if (disabled) { container.classList.add("disabled"); } else { container.classList.remove("disabled"); }
};

var buildLetters = function () {
  var container = byId("letters");
  for (var i = 0; i < A2Z.length; i++) {
    var b = document.createElement("button");
    b.type = "button";
    b.textContent = A2Z[i];
    (function (letter, btn) {
      btn.addEventListener("click", function () {
        onLetter(letter, btn);
      });
    })(A2Z[i], b);
    container.appendChild(b);
  }
  setLettersDisabled(true);
};

var resetGameVisuals = function () {
  state.masked = [];
  state.errors = 0;
  state.streak = 0;
  state.score = 0;
  state.used = {};
  state.started = false;
  byId("score").textContent = "0";
  byId("errors").textContent = "0";
  byId("result").textContent = "";
  var container = byId("letters");
  var buttons = container.getElementsByTagName("button");
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].classList.remove("used");
  }
  setLettersDisabled(true);
  setBalloonStage();
  document.body.classList.remove("success");
  document.body.classList.remove("fail");
};

var validateSecret = function (w) {
  if (!w) { window.alert("Has d'introduir una paraula."); return false; }
  if (w.length < 4) { window.alert("La paraula ha de tenir almenys 4 lletres."); return false; }
  // Reject numbers
  var hasNum = /[0-9]/.test(w);
  if (hasNum) { window.alert("La paraula no pot contenir números."); return false; }
  return true;
};

var startGame = function () {
  var input = byId("secret");
  var w = (input.value || "").trim().toUpperCase();
  if (!validateSecret(w)) { return; }
  state.secret = w;
  state.masked = [];
  for (var i = 0; i < w.length; i++) { state.masked.push("_"); }
  state.started = true;
  input.disabled = true;
  byId("btnStart").disabled = true;
  updateSlotsView();
  setLettersDisabled(false);
};

var endGame = function (won) {
  state.started = false;
  var input = byId("secret");
  input.disabled = false;
  byId("btnStart").disabled = false;
  setLettersDisabled(true);
  if (won) {
    document.body.classList.add("success");
  } else {
    document.body.classList.add("fail");
    byId("result").textContent = "Paraula: " + state.secret;
  }
  // Save totals + high score
  saveTotalsAndHighScore(won);
};

var saveTotalsAndHighScore = function (won) {
  var totals = loadFromStorage("local", TOTALS_KEY) || { total: 0, won: 0, best: null };
  totals.total += 1;
  if (won) totals.won += 1;

  var player = getCookie("player") || "Jugador";
  var now = new Date();
  var stamp = now.toLocaleDateString() + " " + now.toLocaleTimeString();

  var hs = loadFromStorage("local", SCORE_KEY);
  if (!hs || (typeof hs.points === "number" && state.score > hs.points)) {
    hs = { name: player, points: state.score, when: stamp };
    saveToStorage("local", SCORE_KEY, hs);
  }
  // For showing highest-point game as day + time + points
  if (!totals.best || state.score > (totals.best.points||0)) {
    totals.best = { when: stamp, points: state.score };
  }
  saveToStorage("local", TOTALS_KEY, totals);
  renderTotals();
};

var renderTotals = function () {
  var totals = loadFromStorage("local", TOTALS_KEY) || { total: 0, won: 0, best: null };
  byId("t_total").textContent = String(totals.total);
  var pct = 0;
  if (totals.total > 0) { pct = Math.round((totals.won * 100) / totals.total); }
  byId("t_won").textContent = String(totals.won) + " (" + pct + "%)";
  if (totals.best) {
    byId("t_best").textContent = totals.best.when + " - " + totals.best.points;
  } else {
    byId("t_best").textContent = "-";
  }
};

var onLetter = function (letter, btn) {
  if (!state.started) return;
  if (state.used[letter]) return;
  state.used[letter] = true;
  btn.classList.add("used");
  btn.disabled = true;

  var count = 0;
  for (var i = 0; i < state.secret.length; i++) {
    if (state.secret[i] === letter) {
      state.masked[i] = letter;
      count += 1;
    }
  }

  if (count > 0) {
    // streak scoring: +1 first, then +2, +3,...
    state.streak += 1;
    var add = state.streak; // 1,2,3,...
    state.score += add;
    // multiply by count of appearances
    if (count > 1) { state.score = state.score * count; }
    updateSlotsView();
    byId("score").textContent = String(state.score);
    // check win
    var solved = true;
    for (var j = 0; j < state.masked.length; j++) {
      if (state.masked[j] === "_") { solved = false; break; }
    }
    if (solved) { endGame(true); }
  } else {
    // wrong
    state.streak = 0;
    state.errors += 1;
    if (state.score > 0) { state.score -= 1; }
    byId("score").textContent = String(state.score);
    byId("errors").textContent = String(state.errors);
    setBalloonStage();
    if (state.errors >= state.maxErrors) { endGame(false); }
  }
};

var onToggleSecret = function () {
  var input = byId("secret");
  if (input.type === "password") { input.type = "text"; }
  else { input.type = "password"; }
};

var onBack = function () {
  var ok = window.confirm("Estàs segur que vols deixar la partida?");
  if (ok) { window.location.assign("../index.html"); }
};

var onOpenInstr = function () {
  window.open("instruccions.html", "Instruccions", "width=400,height=400");
};

var onLoad = function () {
  applyBgFromConfig();
  setBalloonStage();
  buildLetters();
  resetGameVisuals();
  renderTotals();

  var player = getCookie("player") || "";
  byId("playerName").textContent = player;

  byId("btnBack").addEventListener("click", onBack);
  byId("btnInstr").addEventListener("click", onOpenInstr);
  byId("btnStart").addEventListener("click", startGame);
  byId("toggleEye").addEventListener("click", onToggleSecret);
};

window.addEventListener("DOMContentLoaded", onLoad);
