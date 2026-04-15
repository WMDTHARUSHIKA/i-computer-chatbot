// public/embed.js
(function () {
  // ✅ Chatbot URL (embed mode opens chat UI immediately)
  const WIDGET_URL = "https://i-computer-chatbot.vercel.app/?embed=1";

  // ✅ Colors
  const BG = "#000000";
  const FG = "#F1F0E9";
  const HOVER = "#111111";

  // ✅ Layout
  const GAP = 24;
  const BTN = 56; // button size

  // prevent double injection
  if (
    document.getElementById("icw-launcher") ||
    document.getElementById("icw-frame") ||
    document.getElementById("icw-close")
  ) {
    return;
  }

  const CHAT_SVG = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3c3.9 0 7 2.9 7 6.5V14c0 1.7-1.3 3-3 3h-1v2a1 1 0 0 1-1.6.8L10.7 17H8c-1.7 0-3-1.3-3-3V9.5C5 5.9 8.1 3 12 3Z"/>
    </svg>
  `;

  const CLOSE_SVG = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59 7.11 5.7A1 1 0 0 0 5.7 7.11L10.59 12 5.7 16.89a1 1 0 1 0 1.41 1.41L12 13.41l4.89 4.89a1 1 0 0 0 1.41-1.41L13.41 12l4.89-4.89a1 1 0 0 0 0-1.4Z"/>
    </svg>
  `;

  const style = document.createElement("style");
  style.textContent = `
    #icw-frame{
      position:fixed;
      right:${GAP}px;
      bottom:${GAP + BTN + 12}px; /* leave space for close button below */
      width:380px;
      height:560px;
      border:0;
      border-radius:22px;
      z-index:999999;
      box-shadow:0 24px 60px rgba(0,0,0,.22);
      display:none;
      background:transparent;
    }

    #icw-launcher, #icw-close{
      position:fixed;
      right:${GAP}px;
      bottom:${GAP}px;
      width:${BTN}px;
      height:${BTN}px;
      border-radius:999px;
      border:0;
      cursor:pointer;
      z-index:999999;
      background:${BG};
      color:${FG};
      box-shadow:0 18px 40px rgba(0,0,0,.22);
      display:flex;
      align-items:center;
      justify-content:center;
      transition: background .15s ease, transform .15s ease, opacity .15s ease;
    }

    #icw-launcher:hover, #icw-close:hover{
      background:${HOVER};
      transform: translateY(-1px);
    }
    #icw-launcher:active, #icw-close:active{ transform: translateY(0); }

    #icw-launcher svg, #icw-close svg{
      width:26px;
      height:26px;
      fill:${FG};
      display:block;
    }

    /* close button hidden by default */
    #icw-close{ display:none; }

    @media (max-width:420px){
      #icw-frame{
        right:12px;
        left:12px;
        width:auto;
        height:75vh;
        bottom:${12 + BTN + 12}px;
        border-radius:18px;
      }
      #icw-launcher, #icw-close{
        right:12px;
        bottom:12px;
      }
    }
  `;
  document.head.appendChild(style);

  // iframe
  const frame = document.createElement("iframe");
  frame.id = "icw-frame";
  frame.src = WIDGET_URL;
  frame.allow = "clipboard-write";
  frame.style.background = "transparent";
  frame.setAttribute("loading", "lazy");
  frame.setAttribute("title", "Chat widget");
  document.body.appendChild(frame);

  // launcher (chat icon)
  const launcher = document.createElement("button");
  launcher.id = "icw-launcher";
  launcher.type = "button";
  launcher.setAttribute("aria-label", "Open chat");
  launcher.innerHTML = CHAT_SVG;
  document.body.appendChild(launcher);

  // close button (X) — shows AFTER opening chat space
  const closeBtn = document.createElement("button");
  closeBtn.id = "icw-close";
  closeBtn.type = "button";
  closeBtn.setAttribute("aria-label", "Close chat");
  closeBtn.innerHTML = CLOSE_SVG;
  document.body.appendChild(closeBtn);

  const openChat = () => {
    frame.style.display = "block";
    launcher.style.display = "none";
    closeBtn.style.display = "flex";
  };

  const closeChat = () => {
    frame.style.display = "none";
    closeBtn.style.display = "none";
    launcher.style.display = "flex";
  };

  launcher.addEventListener("click", openChat);
  closeBtn.addEventListener("click", closeChat);

  // ESC closes
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && frame.style.display === "block") closeChat();
  });
})();