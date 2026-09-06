var CA = "0xf646e3d650795ec693960f874b906a1b8db91c76";
var PAIR = "0x5627b7ea910e292b565f7f31824bc9018c1a804d";
var BURN = "0x0000000000000000000000000000000000000369";
var X_URL = "https://x.com/evilpepelol";
var PEPE = "pepe.png";
var frogImg = new Image();
frogImg.crossOrigin = "anonymous";
frogImg.src = PEPE;
var hero = document.querySelector("img.pepe");
if (hero) hero.src = PEPE;

function money(n) {
  if (n == null || !isFinite(n)) return "—";
  if (n >= 1e6) return "$" + (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return "$" + (n / 1e3).toFixed(1) + "K";
  return "$" + n.toFixed(0);
}
function compact(n) {
  if (n == null || !isFinite(n)) return "—";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return Math.round(n).toLocaleString();
}
function setChg(id, val) {
  var el = document.getElementById(id);
  if (!el) return;
  if (val == null || !isFinite(Number(val))) {
    el.textContent = "—";
    el.className = "";
    return;
  }
  var n = Number(val);
  el.textContent = (n >= 0 ? "+" : "") + n.toFixed(2) + "%";
  el.className = n >= 0 ? "up" : "dn";
}
async function loadStats() {
  try {
    var r = await fetch("https://api.dexscreener.com/latest/dex/tokens/" + CA);
    var j = await r.json();
    var p = (j.pairs || []).find(function (x) { return (x.pairAddress || "").toLowerCase() === PAIR; }) || (j.pairs || [])[0];
    if (!p) return;
    document.getElementById("price").textContent = p.priceUsd ? "$" + Number(p.priceUsd).toPrecision(4) : "—";
    setChg("chg1h", p.priceChange && p.priceChange.h1);
    setChg("chg", p.priceChange && p.priceChange.h24);
    document.getElementById("mcap").textContent = money(p.marketCap || p.fdv);
    document.getElementById("liq").textContent = money(p.liquidity && p.liquidity.usd);
    var vol = money(p.volume && p.volume.h24);
    document.getElementById("vol").textContent = vol;
    var vt = document.getElementById("volTop");
    if (vt) vt.textContent = vol;
    document.getElementById("buys").textContent = p.txns && p.txns.h24 && p.txns.h24.buys != null ? String(p.txns.h24.buys) : "—";
  } catch (e) {}
  try {
    var b = await fetch("https://api.scan.pulsechain.com/api?module=account&action=tokenbalance&contractaddress=" + CA + "&address=" + BURN);
    var bj = await b.json();
    var raw = Number(bj.result || 0);
    if (isFinite(raw) && raw > 0) document.getElementById("burned").textContent = compact(raw / 1e18);
  } catch (e) {}
}
loadStats();
setInterval(loadStats, 60000);

document.getElementById("copyca").onclick = function () {
  if (navigator.clipboard) navigator.clipboard.writeText(CA);
  this.querySelector("span").textContent = "Copied";
};
document.getElementById("copyburn").onclick = function () {
  if (navigator.clipboard) navigator.clipboard.writeText(BURN);
  this.querySelector("span").textContent = "Copied";
};

function scoreCard() {
  var c = document.createElement("canvas");
  c.width = 1200; c.height = 675;
  var g = c.getContext("2d");
  g.fillStyle = "#080000"; g.fillRect(0, 0, 1200, 675);
  var glow = g.createRadialGradient(900, 340, 20, 900, 340, 380);
  glow.addColorStop(0, "rgba(255,70,0,.55)"); glow.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = glow; g.fillRect(0, 0, 1200, 675);
  if (frogImg.complete && frogImg.naturalWidth) g.drawImage(frogImg, 680, 78, 520, 520);
  g.textAlign = "left";
  g.fillStyle = "#fff"; g.font = "42px sans-serif"; g.fillText("$EPEPE", 70, 90);
  g.fillStyle = "#ff3b14"; g.font = "72px sans-serif"; g.fillText("BURNED", 70, 230);
  g.fillStyle = "#fff"; g.font = "150px sans-serif"; g.fillText(String(score), 70, 390);
  g.fillStyle = "#ffb020"; g.font = "28px sans-serif"; g.fillText("DEAD BAGS DON'T COME BACK", 70, 460);
  g.fillStyle = "#ff5a28"; g.font = "44px sans-serif"; g.fillText("@evilpepelol", 70, 530);
  return c;
}
function tweetText() {
  return "$EPEPE burned " + score + " bags. Dead bags don't come back.\n\n@evilpepelol\n" + X_URL;
}
document.getElementById("share").onclick = async function () {
  var text = tweetText();
  try {
    var blob = await new Promise(function (res, rej) {
      try { scoreCard().toBlob(function (b) { b ? res(b) : rej(new Error("blob")); }, "image/png"); }
      catch (err) { rej(err); }
    });
    var file = new File([blob], "epepe-score.png", { type: "image/png" });
    if (navigator.share) {
      try {
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], text: text, title: "$EPEPE" });
          return;
        }
        await navigator.share({ text: text, url: X_URL, title: "$EPEPE" });
        return;
      } catch (err) { if (err && err.name === "AbortError") return; }
    }
  } catch (err) {}
  window.open("https://x.com/intent/tweet?text=" + encodeURIComponent(text) + "&url=" + encodeURIComponent(X_URL), "_blank", "noopener");
};

var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");
var W = 430, H = 640, frog = { x: 100, y: 320 }, things = [], sparks = [], floaters = [];
var score = 0, lives = 3, best = Number(localStorage.getItem("epepeBest") || 0);
var dragging = false, tick = 0, state = "ready", hurt = 0, shake = 0, hitstop = 0;
document.getElementById("best").textContent = best;
function size() {
  var parent = canvas.parentElement;
  var w = Math.max(260, Math.min((parent && parent.clientWidth) || window.innerWidth, 700));
  var h = Math.max(420, Math.floor(Math.min(window.innerHeight * 0.62, w * 1.35)));
  canvas.style.width = w + "px"; canvas.style.height = h + "px";
  var dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.floor(w * dpr); canvas.height = Math.floor(h * dpr);
  W = canvas.width; H = canvas.height;
  if (state !== "play") { frog.x = W * 0.2; frog.y = H * 0.5; }
}
size(); window.addEventListener("resize", size);
function pos(e) {
  var t = (e.touches && e.touches[0]) || e, r = canvas.getBoundingClientRect();
  return { x: (t.clientX - r.left) * (canvas.width / r.width), y: (t.clientY - r.top) * (canvas.height / r.height) };
}
function moveFrog(p) {
  frog.x = Math.max(W * 0.14, Math.min(W * 0.34, p.x));
  frog.y = Math.max(H * 0.14, Math.min(H * 0.86, p.y));
}
function start() {
  state = "play"; score = 0; lives = 3; things = []; sparks = []; floaters = []; tick = 0; hurt = 0; shake = 0; hitstop = 0;
  document.getElementById("score").textContent = 0;
  document.getElementById("lives").textContent = 3;
}
canvas.addEventListener("pointerdown", function (e) {
  e.preventDefault(); if (state !== "play") start();
  dragging = true; moveFrog(pos(e));
  try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
}, { passive: false });
canvas.addEventListener("pointermove", function (e) {
  if (!dragging || state !== "play") return; e.preventDefault(); moveFrog(pos(e));
}, { passive: false });
canvas.addEventListener("pointerup", function () { dragging = false; });
canvas.addEventListener("pointercancel", function () { dragging = false; });
function spawn() {
  var gem = Math.random() < 0.24;
  var wave = 1 + Math.floor(score / 4500);
  things.push({
    kind: gem ? "gem" : "bag",
    x: W + 40,
    y: H * (0.16 + Math.random() * 0.68),
    v: (W / 280) + Math.random() * (W / 300) + wave * (W / 1000),
    r: W * (gem ? 0.042 : 0.05 + Math.random() * 0.016),
    wob: Math.random() * 8
  });
}
function boom(x, y, gem) {
  for (var i = 0; i < 14; i++) sparks.push({
    x: x, y: y,
    vx: (Math.random() - .15) * 9, vy: (Math.random() - .5) * 9,
    life: 18 + Math.random() * 10, gem: !!gem
  });
}
function pop(x, y, text, color) {
  floaters.push({ x: x, y: y, text: text, life: 42, color: color });
}
function loseLife() {
  lives -= 1; hurt = 18; shake = 10; hitstop = 4;
  document.getElementById("lives").textContent = Math.max(0, lives);
  if (lives <= 0) state = "dead";
}
function drawBag(b) {
  ctx.save(); ctx.translate(b.x, b.y + Math.sin((tick + b.wob) / 7) * 4);
  ctx.fillStyle = "#4a2a0c"; ctx.beginPath(); ctx.ellipse(3, 8, b.r * 1.05, b.r * .45, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#7a4318"; ctx.beginPath(); ctx.ellipse(0, 6, b.r, b.r * 1.2, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#c47a2a"; ctx.beginPath(); ctx.ellipse(-b.r * .25, 0, b.r * .35, b.r * .5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#9a5a22"; ctx.beginPath(); ctx.ellipse(0, -4, b.r * .95, b.r * .9, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#2a1608"; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(-b.r * .4, -b.r * .75); ctx.quadraticCurveTo(0, -b.r * 1.35, b.r * .4, -b.r * .75); ctx.stroke();
  ctx.fillStyle = "#140a04"; ctx.font = "bold " + Math.floor(b.r) + "px sans-serif"; ctx.fillText("$", -b.r * .28, b.r * .3);
  ctx.restore();
}
function drawGem(g) {
  var r = g.r;
  ctx.save();
  ctx.translate(g.x, g.y + Math.sin((tick + g.wob) / 6) * 5);
  ctx.rotate(Math.sin((tick + g.wob) / 18) * 0.08);
  ctx.beginPath();
  ctx.moveTo(0, -r * 1.45);
  ctx.lineTo(r * 0.95, -r * 0.15);
  ctx.lineTo(r * 0.55, r * 1.2);
  ctx.lineTo(-r * 0.55, r * 1.2);
  ctx.lineTo(-r * 0.95, -r * 0.15);
  ctx.closePath();
  var grd = ctx.createLinearGradient(-r, -r, r, r);
  grd.addColorStop(0, "#f4ffff");
  grd.addColorStop(0.35, "#7ee7ff");
  grd.addColorStop(0.7, "#2aa0d8");
  grd.addColorStop(1, "#0b4f86");
  ctx.fillStyle = grd; ctx.fill();
  ctx.strokeStyle = "#e8ffff"; ctx.lineWidth = Math.max(2, r * 0.08); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, -r * 1.45); ctx.lineTo(0, r * 1.2);
  ctx.moveTo(-r * 0.95, -r * 0.15); ctx.lineTo(r * 0.95, -r * 0.15);
  ctx.strokeStyle = "rgba(255,255,255,.55)"; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,.85)";
  ctx.beginPath(); ctx.ellipse(-r * 0.28, -r * 0.55, r * 0.16, r * 0.28, -0.4, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
function step() {
  tick++; if (hurt > 0) hurt--; if (shake > 0) shake -= 0.55;
  var mouthX = frog.x + W * 0.1, mouthY = frog.y + H * 0.02;
  var fireW = W * 0.66, fireH = H * 0.075 + Math.sin(tick / 3) * 6;
  if (state === "play") {
    if (tick % Math.max(18, 42 - Math.floor(score / 2800)) === 0) spawn();
  }
  things.forEach(function (b) { if (state === "play") b.x -= b.v; });
  var keep = [];
  things.forEach(function (b) {
    var burned = state === "play" && b.x > mouthX && b.x < mouthX + fireW && Math.abs(b.y - mouthY) < fireH + b.r * 0.85;
    if (burned) {
      if (b.kind === "gem") {
        boom(b.x, b.y, true); pop(b.x, b.y - 20, "NO", "#7ee7ff"); loseLife();
      } else {
        score += 369; boom(b.x, b.y, false); pop(b.x, b.y - 16, "+369", "#ffb020");
        document.getElementById("score").textContent = score;
        if (score > best) { best = score; localStorage.setItem("epepeBest", String(best)); document.getElementById("best").textContent = best; }
      }
      return;
    }
    if (state === "play" && b.x < W * 0.07) {
      if (b.kind === "bag") loseLife();
      return;
    }
    if (b.x > -80) keep.push(b);
  });
  things = keep;
  sparks.forEach(function (s) { s.x += s.vx; s.y += s.vy; s.life--; });
  sparks = sparks.filter(function (s) { return s.life > 0; });
  floaters.forEach(function (f) { f.y -= 1.4; f.life--; });
  floaters = floaters.filter(function (f) { return f.life > 0; });
}
function draw() {
  var ox = shake > 0 ? (Math.random() - 0.5) * shake * 1.4 : 0;
  var oy = shake > 0 ? (Math.random() - 0.5) * shake * 1.4 : 0;
  ctx.setTransform(1, 0, 0, 1, ox, oy);
  ctx.fillStyle = hurt ? "#3a0808" : "#140303"; ctx.fillRect(-20, -20, W + 40, H + 40);
  ctx.fillStyle = "#2a0c08"; ctx.fillRect(0, H * 0.91, W, H * 0.09);
  ctx.fillStyle = "#ff3b14"; ctx.fillRect(0, H * 0.91, W, 4);
  var mouthX = frog.x + W * 0.1, mouthY = frog.y + H * 0.02;
  var fireW = W * 0.66, fireH = H * 0.075 + Math.sin(tick / 3) * 6;
  if (state === "play") {
    var gr = ctx.createLinearGradient(mouthX, mouthY, mouthX + fireW, mouthY);
    gr.addColorStop(0, "rgba(255,245,140,1)"); gr.addColorStop(.28, "rgba(255,90,10,.95)"); gr.addColorStop(1, "rgba(255,20,0,0)");
    ctx.fillStyle = gr; ctx.beginPath(); ctx.ellipse(mouthX + fireW * 0.4, mouthY, fireW * 0.42, fireH, 0, 0, Math.PI * 2); ctx.fill();
  }
  things.forEach(function (b) { if (b.kind === "gem") drawGem(b); else drawBag(b); });
  sparks.forEach(function (s) {
    ctx.fillStyle = s.gem ? "rgba(120,220,255," + (s.life / 20) + ")" : "rgba(255," + (80 + s.life * 6) + ",10," + (s.life / 20) + ")";
    ctx.beginPath(); ctx.arc(s.x, s.y, 5, 0, Math.PI * 2); ctx.fill();
  });
  var sizePx = W * 0.32;
  if (frogImg.complete && frogImg.naturalWidth) {
    var ratio = frogImg.naturalWidth / frogImg.naturalHeight;
    var ih = sizePx, iw = sizePx * ratio;
    ctx.drawImage(frogImg, frog.x - iw * 0.48, frog.y - ih * 0.52, iw, ih);
  }
  floaters.forEach(function (f) {
    ctx.globalAlpha = Math.min(1, f.life / 18);
    ctx.fillStyle = f.color;
    ctx.font = "bold " + Math.floor(W * 0.038) + "px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(f.text, f.x, f.y);
    ctx.globalAlpha = 1;
  });
  ctx.textAlign = "center"; ctx.fillStyle = "#ffe7a0";
  ctx.font = "bold " + Math.floor(W * 0.042) + "px sans-serif";
  if (state === "ready") ctx.fillText("TAP TO IGNITE", W / 2, H * 0.1);
  if (state === "dead") {
    ctx.fillStyle = "rgba(40,0,0,.7)"; ctx.fillRect(0, H * 0.34, W, H * 0.26);
    ctx.fillStyle = "#ff3b14"; ctx.font = "bold " + Math.floor(W * 0.06) + "px sans-serif";
    ctx.fillText("DUMPED", W / 2, H * 0.46);
    ctx.fillStyle = "#fff"; ctx.font = Math.floor(W * 0.035) + "px sans-serif";
    ctx.fillText("burned " + score + "   tap to run it back", W / 2, H * 0.54);
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
var last = performance.now(), acc = 0, STEP = 1000 / 60;
function loop(now) {
  var raw = Math.min(100, now - last); last = now; acc += raw;
  while (acc >= STEP) {
    if (hitstop > 0) hitstop--; else step();
    acc -= STEP;
  }
  draw();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
