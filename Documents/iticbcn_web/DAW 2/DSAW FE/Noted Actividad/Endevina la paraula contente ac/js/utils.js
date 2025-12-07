
// All code uses function expressions (no arrow functions, no innerHTML).
// Utilities limited to topics covered in the provided doc: objects, window, BOM, cookies, session/local/localStorage.

// Cookie helpers (pattern shown in the slides)
var setCookie = function (key, value, days) {
  var expires = "";
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + (days*24*60*60*1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = key + "=" + value + expires + "; path=/";
};

var getCookie = function (key) {
  var cookies = document.cookie.split(';');
  for (var i = 0; i < cookies.length; i++) {
    var cookie = cookies[i].trim();
    var parts = cookie.split('=');
    if (parts[0] === key) { return parts[1]; }
  }
  return null;
};

var deleteCookie = function (key) {
  document.cookie = key + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
};

// Browser detection -> simple mapping to classes
var getBrowserName = function () {
  var ua = navigator.userAgent;
  if (ua.indexOf("Edg/") !== -1) return "Edge";
  if (ua.indexOf("Chrome/") !== -1 && ua.indexOf("Chromium") === -1) return "Chrome";
  if (ua.indexOf("Firefox/") !== -1) return "Firefox";
  if (ua.indexOf("Safari/") !== -1 && ua.indexOf("Chrome/") === -1) return "Safari";
  return "Other";
};

var browserBgClass = function (name) {
  if (name === "Chrome") return "chrome-bg";
  if (name === "Firefox") return "firefox-bg";
  if (name === "Safari") return "safari-bg";
  if (name === "Edge") return "edge-bg";
  return "other-bg";
};

// Read current URL info per docs
var getUrlInfo = function () {
  return {
    href: window.location.href,
    origin: window.location.origin,
    host: window.location.host,
    hostname: window.location.hostname,
    port: window.location.port || "",
    protocol: window.location.protocol
  };
};

// JSON helpers for storage
var saveToStorage = function (type, key, obj) {
  var json = JSON.stringify(obj);
  if (type === "local") localStorage.setItem(key, json);
  if (type === "session") sessionStorage.setItem(key, json);
};


var loadFromStorage = function (type, key) {
  var raw = (type === "local") ? localStorage.getItem(key) : sessionStorage.getItem(key);
  if (!raw) return null;
  // Basic guard without using exceptions: only parse if it looks like JSON object/array
  var first = raw.charAt(0);
  if (first !== "{" && first !== "[") { return null; }
  return JSON.parse(raw);
};

