
/* Start page logic */
var CONFIG_KEY = "config";
var SCORE_KEY = "highScore";
var TOTALS_KEY = "totals";

var fillInfo = function () {
  var browser = getBrowserName();
  var bgClass = browserBgClass(browser);
  document.body.classList.add(bgClass);

  var info = getUrlInfo();
  var kvs = [
    ["Browser", browser],
    ["Language", navigator.language || ""],
    ["Origin (host:port)", info.host || ""],
    ["Full URL", info.href]
  ];

  var box = document.getElementById("envInfo");
  for (var i = 0; i < kvs.length; i++) {
    var row = document.createElement("div");
    row.className = "kv";
    var k = document.createElement("div"); k.className = "label"; k.textContent = kvs[i][0];
    var v = document.createElement("div"); v.className = "mono"; v.textContent = kvs[i][1];
    row.appendChild(k); row.appendChild(v);
    box.appendChild(row);
  }

  // Save session config object
  var cfg = {
    lang: navigator.language || "",
    userAgent: browser,
    url: info.origin,
    bgColorClass: bgClass
  };
  saveToStorage("session", CONFIG_KEY, cfg);

  // High score (name - points - date)
  var hsEl = document.getElementById("highScore");
  var hs = loadFromStorage("local", SCORE_KEY);
  if (hs && typeof hs.points === "number") {
    var line = hs.name + " - " + hs.points + " - " + hs.when;
    hsEl.textContent = line;
  } else {
    hsEl.textContent = "No hi ha puntuació actual.";
  }
};

var onClearHighScore = function () {
  var ok = window.confirm("Vols esborrar la puntuació màxima?");
  if (ok) {
    localStorage.removeItem(SCORE_KEY);
    document.getElementById("highScore").textContent = "No hi ha puntuació actual.";
  }
};

var onStartGame = function () {
  var nameInput = document.getElementById("playerName");
  var value = (nameInput.value || "").trim();
  if (!value) {
    window.alert("Has d'informar el nom d'un jugador.");
    return;
  }
  // Save cookie for player name (simple per docs)
  setCookie("player", value, 7);
  // Open game page
  window.location.assign("pages/joc.html");
};

var onLoad = function () {
  fillInfo();
  var cookieName = getCookie("player");
  if (cookieName) {
    document.getElementById("playerName").value = cookieName;
  }
  document.getElementById("btnStart").addEventListener("click", onStartGame);
  document.getElementById("btnClear").addEventListener("click", onClearHighScore);
};

window.addEventListener("DOMContentLoaded", onLoad);
