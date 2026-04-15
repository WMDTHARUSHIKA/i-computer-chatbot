(function () {
  const WIDGET_URL = "https://i-computer-chatbot.vercel.app/?embed=1"; // chatbot URL (absolute)
  const PRIMARY = "#6d5dfc";

  if (document.getElementById("icw-launcher") || document.getElementById("icw-frame")) return;

  const style = document.createElement("style");
  style.textContent = `
    #icw-launcher{
      position:fixed; right:24px; bottom:24px; width:56px; height:56px;
      border-radius:999px; border:0; cursor:pointer; z-index:999999;
      background:${PRIMARY}; color:#fff; font-size:20px;
      box-shadow:0 18px 40px rgba(0,0,0,.22);
      display:flex; align-items:center; justify-content:center;
    }
    #icw-frame{
      position:fixed; right:24px; bottom:92px; width:380px; height:560px;
      border:0; border-radius:22px; z-index:999999;
      box-shadow:0 24px 60px rgba(0,0,0,.22);
      display:none; background:#fff;
    }
    @media (max-width:420px){
      #icw-frame{ right:12px; left:12px; width:auto; height:75vh; bottom:84px; }
      #icw-launcher{ right:12px; bottom:12px; }
    }
  `;
  document.head.appendChild(style);

  const frame = document.createElement("iframe");
  frame.id = "icw-frame";
  frame.src = WIDGET_URL;
  frame.allow = "clipboard-write";
  document.body.appendChild(frame);

  const btn = document.createElement("button");
  btn.id = "icw-launcher";
  btn.type = "button";
  btn.textContent = "💬";
  document.body.appendChild(btn);

  btn.addEventListener("click", () => {
    frame.style.display = frame.style.display === "block" ? "none" : "block";
  });
})();