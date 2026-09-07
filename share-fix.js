var SITE = "https://evilpepe.lol/?v=card";
var TG_URL = "https://t.me/evilpepelol";
function tweetText() {
  return "$EPEPE burned " + score + " bags. Dead bags don't come back.\n\n" + TG_URL + "\n@evilpepelol\n" + SITE;
}
var shareBtn = document.getElementById("share");
if (shareBtn) {
  shareBtn.onclick = function () {
    var text = tweetText();
    window.open("https://x.com/intent/tweet?text=" + encodeURIComponent(text) + "&url=" + encodeURIComponent(SITE), "_blank", "noopener");
  };
}
