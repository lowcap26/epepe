var SITE = "https://evilpepe.lol/";
var TG_URL = "https://t.me/evilpepelol";

function tweetText() {
  return "$EPEPE burned " + score + " bags.\nDead bags don't come back.\n\n" + TG_URL + "\n@evilpepelol";
}

function scoreCard() {
  var c = document.createElement("canvas");
  c.width = 1200;
  c.height = 675;
  var g = c.getContext("2d");
  g.fillStyle = "#080000";
  g.fillRect(0, 0, 1200, 675);
  var glow = g.createRadialGradient(900, 340, 20, 900, 340, 380);
  glow.addColorStop(0, "rgba(255,70,0,.55)");
  glow.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = glow;
  g.fillRect(0, 0, 1200, 675);
  if (frogImg && frogImg.complete && frogImg.naturalWidth) g.drawImage(frogImg, 680, 78, 520, 520);
  g.textAlign = "left";
  g.fillStyle = "#fff";
  g.font = "bold 42px sans-serif";
  g.fillText("$EPEPE", 70, 90);
  g.fillStyle = "#ff3b14";
  g.font = "bold 72px sans-serif";
  g.fillText("BURNED", 70, 230);
  g.fillStyle = "#fff";
  g.font = "bold 150px sans-serif";
  g.fillText(String(score), 70, 390);
  g.fillStyle = "#ffb020";
  g.font = "bold 28px sans-serif";
  g.fillText("DEAD BAGS DON'T COME BACK", 70, 460);
  g.fillStyle = "#ff5a28";
  g.font = "bold 32px sans-serif";
  g.fillText("t.me/evilpepelol   @evilpepelol", 70, 530);
  return c;
}

function showCard(blob) {
  var old = document.getElementById("scoreShare");
  if (old) old.remove();
  var wrap = document.createElement("div");
  wrap.id = "scoreShare";
  wrap.style.cssText = "position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.88);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px;gap:12px";
  var img = document.createElement("img");
  img.src = URL.createObjectURL(blob);
  img.alt = "score";
  img.style.cssText = "width:min(100%,720px);border:2px solid #ff3b14;border-radius:8px";
  var note = document.createElement("p");
  note.textContent = "Long-press the card → Save Image, then attach it on X";
  note.style.cssText = "color:#ffe7a0;font:700 16px sans-serif;text-align:center;margin:0";
  var row = document.createElement("div");
  row.style.cssText = "display:flex;gap:10px;flex-wrap:wrap;justify-content:center";
  function btn(label, fn) {
    var b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    b.style.cssText = "background:#ff3b14;color:#fff;border:0;padding:12px 16px;font:700 16px sans-serif;border-radius:6px";
    b.onclick = fn;
    return b;
  }
  row.appendChild(btn("Post on X", function () {
    window.open("https://x.com/intent/tweet?text=" + encodeURIComponent(tweetText()) + "&url=" + encodeURIComponent(SITE), "_blank", "noopener");
  }));
  row.appendChild(btn("Close", function () { wrap.remove(); }));
  wrap.appendChild(img);
  wrap.appendChild(note);
  wrap.appendChild(row);
  document.body.appendChild(wrap);
}

var shareBtn = document.getElementById("share");
if (shareBtn) {
  shareBtn.onclick = async function () {
    var text = tweetText();
    var blob = null;
    try {
      blob = await new Promise(function (res, rej) {
        try {
          scoreCard().toBlob(function (b) { b ? res(b) : rej(new Error("blob")); }, "image/png");
        } catch (err) { rej(err); }
      });
    } catch (err) {}
    var isTouch = window.matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 0;
    if (blob && navigator.share && !isTouch) {
      try {
        var file = new File([blob], "epepe-score.png", { type: "image/png" });
        if (!navigator.canShare || navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], text: text + "\n" + SITE, title: "$EPEPE" });
          return;
        }
      } catch (err) {
        if (err && err.name === "AbortError") return;
      }
    }
    if (blob) showCard(blob);
    else {
      window.open("https://x.com/intent/tweet?text=" + encodeURIComponent(text) + "&url=" + encodeURIComponent(SITE), "_blank", "noopener");
    }
  };
}
