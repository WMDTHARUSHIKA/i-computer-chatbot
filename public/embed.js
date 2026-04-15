// public/embed.js
(function () {
  // ✅ Use production chatbot URL + embed mode (opens chat immediately)
  const WIDGET_URL = "https://i-computer-chatbot.vercel.app/?embed=1";

  // ✅ Customize colors here
  const BUTTON_BG = "#000000";   // launcher button background
  const ICON_COLOR = "#F1F0E9";  // launcher icon color
  const HOVER_BG = "#111111";

  // Prevent double injection
  if (document.getElementById("icw-launcher") || document.getElementById("icw-frame")) return;

  // Styles for button + iframe
  const style = document.createElement("style");
  style.textContent = `
    #icw-launcher{
      position:fixed;
      right:24px;
      bottom:24px;
      width:56px;
      height:56px;
      border-radius:999px;
      border:0;
      cursor:pointer;
      z-index:999999;
      background:${BUTTON_BG};
      color:${ICON_COLOR};
      box-shadow:0 18px 40px rgba(0,0,0,.22);
      display:flex;
      align-items:center;
      justify-content:center;
      transition: background .15s ease, transform .15s ease;
    }
    #icw-launcher:hover{
      background:${HOVER_BG};
      transform: translateY(-1px);
    }
    #icw-launcher:active{
      transform: translateY(0);
    }
    #icw-launcher svg{
      width:24px;
      height:24px;
      fill:${ICON_COLOR};
      display:block;
    }

    #icw-frame{
      position:fixed;
      right:24px;
      bottom:92px;
      width:380px;
      height:560px;
      border:0;
      border-radius:22px;
      z-index:999999;
      box-shadow:0 24px 60px rgba(0,0,0,.22);
      display:none;
      background:transparent;
    }

    @media (max-width:420px){
      #icw-frame{
        right:12px;
        left:12px;
        width:auto;
        height:75vh;
        bottom:84px;
        border-radius:18px;
      }
      #icw-launcher{
        right:12px;
        bottom:12px;
      }
    }
  `;
  document.head.appendChild(style);

  // Create iframe
  const frame = document.createElement("iframe");
  frame.id = "icw-frame";
  frame.src = WIDGET_URL;
  frame.allow = "clipboard-write";
  frame.style.background = "transparent";
  frame.setAttribute("loading", "lazy");
  frame.setAttribute("title", "i-Computer Chatbot");
  document.body.appendChild(frame);

  // Create launcher button
  const btn = document.createElement("button");
  btn.id = "icw-launcher";
  btn.type = "button";
  btn.setAttribute("aria-label", "Open chat");
  btn.innerHTML = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3c3.9 0 7 2.9 7 6.5V14c0 1.7-1.3 3-3 3h-1v2a1 1 0 0 1-1.6.8L10.7 17H8c-1.7 0-3-1.3-3-3V9.5C5 5.9 8.1 3 12 3Z"/>
    </svg>
  `;
  document.body.appendChild(btn);

  // Toggle open/close
  const toggle = () => {
    const open = frame.style.display === "block";
    frame.style.display = open ? "none" : "block";
    btn.setAttribute("aria-label", open ? "Open chat" : "Close chat");
  };

  btn.addEventListener("click", toggle);

  // Optional: close when pressing ESC
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && frame.style.display === "block") {
      frame.style.display = "none";
      btn.setAttribute("aria-label", "Open chat");
    }
  });
})();