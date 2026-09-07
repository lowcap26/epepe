function paintBlack(img) {
  if (img.dataset.blacked) return;
  function go() {
    try {
      var c = document.createElement("canvas");
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      var g = c.getContext("2d");
      g.drawImage(img, 0, 0);
      var d = g.getImageData(0, 0, c.width, c.height);
      var p = d.data;
      var w = c.width, h = c.height;
      function isBg(i) {
        var r = p[i], gv = p[i + 1], b = p[i + 2], a = p[i + 3];
        if (a < 20) return true;
        var mx = Math.max(r, gv, b), mn = Math.min(r, gv, b);
        return (mx >= 198 && mx - mn <= 30) || (mx >= 168 && mx - mn <= 16);
      }
      var seen = new Uint8Array(w * h);
      var q = [];
      function push(x, y) {
        if (x >= 0 && y >= 0 && x < w && y < h) q.push(y * w + x);
      }
      for (var x = 0; x < w; x++) { push(x, 0); push(x, h - 1); }
      for (var y = 0; y < h; y++) { push(0, y); push(w - 1, y); }
      while (q.length) {
        var i = q.pop();
        if (seen[i]) continue;
        seen[i] = 1;
        var off = i * 4;
        if (!isBg(off)) continue;
        p[off] = 0; p[off + 1] = 0; p[off + 2] = 0; p[off + 3] = 255;
        var xx = i % w, yy = (i - xx) / w;
        push(xx + 1, yy); push(xx - 1, yy); push(xx, yy + 1); push(xx, yy - 1);
      }
      g.putImageData(d, 0, 0);
      img.dataset.blacked = "1";
      img.src = c.toDataURL("image/png");
    } catch (err) {}
  }
  if (img.complete && img.naturalWidth) go();
  else img.addEventListener("load", go);
}
document.querySelectorAll("img.nobg").forEach(paintBlack);
