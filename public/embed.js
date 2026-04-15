// public/embed.js
(function () {
  // ✅ Chatbot URL (embed mode opens chat UI immediately inside iframe)
  const WIDGET_URL = "https://i-computer-chatbot.vercel.app/?embed=1";

  // Colors
  const BG = "#000000";
  const FG = "#F1F0E9";
  const HOVER = "#111111";

  // Layout
  const GAP = 24;
  const BTN = 56;

  // Prevent double injection
  if (document.getElementById("icw-launcher") || document.getElementById("icw-frame")) return;

  const CHAT_SVG = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3c3.9 0 7 2.9 7 6.5V14c0 1.7-1.3 3-3 3h-1v2a1 1 0 0 1-1.6.8L10.7 17H8c-1.7 0-3-1.3-3-3V9.5C5 5.9 8.1 3 12 3Z"/>
    </svg>
  `;

  // ✅ Close "X" icon (like your image)
  const CLOSE_SVG = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 6L18 18" fill="none" stroke="${FG}" stroke-width="2.8" stroke-linecap="round"/>
      <path d="M18 6L6 18" fill="none" stroke="${FG}" stroke-width="2.8" stroke-linecap="round"/>
    </svg>
  `;

  const style = document.createElement("style");
  style.textContent = `
    #icw-launcher{
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
      transition: background .15s ease, transform .15s ease;
      -webkit-tap-highlight-color: transparent;
    }
    #icw-launcher:hover{ background:${HOVER}; transform: translateY(-1px); }
    #icw-launcher:active{ transform: translateY(0); }

    #icw-launcher svg{ width:26px; height:26px; display:block; }
    #icw-launcher .icw-chat svg path{ fill:${FG}; }
    /* close svg uses stroke already */

    #icw-frame{
      position:fixed;
      right:${GAP}px;
      bottom:${GAP + BTN + 12}px;
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
        bottom:${12 + BTN + 12}px;
        border-radius:18px;
      }
      #icw-launcher{
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

  // single button (toggles icon)
  const btn = document.createElement("button");
  btn.id = "icw-launcher";
  btn.type = "button";
  btn.setAttribute("aria-label", "Open chat");
  btn.innerHTML = `<span class="icw-chat">${CHAT_SVG}</span>`;
  document.body.appendChild(btn);

  const openChat = () => {
    frame.style.display = "block";
    btn.setAttribute("aria-label", "Close chat");
    btn.innerHTML = `<span class="icw-close">${CLOSE_SVG}</span>`;
  };

  const closeChat = () => {
    frame.style.display = "none";
    btn.setAttribute("aria-label", "Open chat");
    btn.innerHTML = `<span class="icw-chat">${CHAT_SVG}</span>`;
  };

  const toggle = () => {
    const isOpen = frame.style.display === "block";
    if (isOpen) closeChat();
    else openChat();
  };

  btn.addEventListener("click", toggle);

  // ESC closes
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && frame.style.display === "block") closeChat();
  });
})();