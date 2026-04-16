// src/App.jsx
import { useEffect, useRef, useState } from "react";
import ChatForm from "./components/ChatForm";
import ChatbotIcon from "./components/ChatbotIcon";
import ChatMessage from "./components/ChatMessage";
import { companyInfo, buildCompanyContext } from "./companyInfo";

const STORAGE_KEY = "chat_history_v1";

const makeId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : String(Date.now() + Math.random());

const DEFAULT_HISTORY = [
  {
    id: makeId(),
    role: "model",
    isError: false,
    text:
      `Hi, welcome to ${companyInfo.name} 👋\n` +
      `How can I help you today?\n\n` +
      `You can ask about:\n` +
      `• Website design & development\n` +
      `• E-commerce store setup\n` +
      `• SEO & performance\n` +
      `• Maintenance & support`,
  },
];

const QUICK_QUESTIONS = [
  "When will my order ship?",
  "Track my order",
  "What is your contact info?",
  "What is your exchange policy?",
  "How long does shipping take?",
  "Can I change my shipping address after placing an order?",
];

function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_HISTORY;

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_HISTORY;

    return parsed
      .filter((m) => m && typeof m.role === "string" && typeof m.text === "string")
      .map((m) => ({ ...m, isError: Boolean(m.isError) }));
  } catch {
    return DEFAULT_HISTORY;
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const isBusyStatus = (status) => status === 429 || status === 503;

const tryLocalFallback = (userText) => {
  const t = (userText || "").toLowerCase();

  if (/(where|location|located|address)\b/.test(t)) {
    return `We’re based in ${companyInfo.location}.\nBusiness hours: ${companyInfo.hours}`;
  }

  if (/(contact|email|phone|whatsapp|call)\b/.test(t)) {
    return `You can contact ${companyInfo.shortName} here:\n• Email: ${companyInfo.email}\n• Phone: ${companyInfo.phone}\n• Website: ${companyInfo.website}`;
  }

  if (/(services|what do you do|offer|pricing|price|packages)\b/.test(t)) {
    return `Here are our main services:\n• ${companyInfo.services.join("\n• ")}`;
  }

  return null;
};

export default function App() {
  // ✅ embed mode: when opened as https://.../?embed=1
  const isEmbed =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("embed") === "1";

  // ✅ In embed mode open immediately
  const [isOpen, setIsOpen] = useState(isEmbed ? true : false);

  const [chatHistory, setChatHistory] = useState(() => loadHistory());
  const [isLoading, setIsLoading] = useState(false);

  // ✅ SIMPLE: show the "Instant answers" screen first
  const [showHome, setShowHome] = useState(true);

  const chatBodyRef = useRef(null);
  const historyRef = useRef(chatHistory);
  const abortRef = useRef(null);

  useEffect(() => {
    historyRef.current = chatHistory;
  }, [chatHistory]);

  // ✅ Add class in embed mode (CSS handles background)
  useEffect(() => {
    if (!isEmbed) return;

    document.documentElement.classList.add("chat-embed");
    document.body.classList.add("chat-embed");

    return () => {
      document.documentElement.classList.remove("chat-embed");
      document.body.classList.remove("chat-embed");
    };
  }, [isEmbed]);

  // Auto-scroll (only when not on home screen)
  useEffect(() => {
    const openNow = isEmbed || isOpen;
    if (!openNow) return;
    if (showHome) return;

    const el = chatBodyRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [chatHistory, isOpen, isEmbed, showHome]);

  // Persist
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chatHistory));
    } catch {
      // ignore
    }
  }, [chatHistory]);

  // Abort on unmount
  useEffect(() => {
    return () => abortRef.current?.abort?.();
  }, []);

  // Abort + unlock input when closing popup (NOT in embed mode)
  useEffect(() => {
    if (isEmbed) return;
    if (!isOpen) {
      abortRef.current?.abort?.();
      setIsLoading(false);
      setShowHome(true); // ✅ go back to home when closed
    }
  }, [isOpen, isEmbed]);

  const setPlaceholderText = (placeholderId, text, isError = false) => {
    setChatHistory((prev) =>
      prev.map((m) => (m.id === placeholderId ? { ...m, text, isError } : m))
    );
  };

  const generateBotResponse = async (historyForApi, placeholderId) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const apiUrlFromEnv = import.meta.env.VITE_API_URL;

    const endpoint =
      apiUrlFromEnv ||
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

    const lastUserText =
      [...historyForApi].reverse().find((m) => m.role === "user")?.text || "";

    if (!apiUrlFromEnv && !apiKey) {
      const fallback = tryLocalFallback(lastUserText);
      setPlaceholderText(
        placeholderId,
        fallback ||
          "Error: Missing API key. Add VITE_GEMINI_API_KEY (recommended) or VITE_API_URL in .env, then restart the server.",
        !fallback
      );
      setIsLoading(false);
      return;
    }

    abortRef.current?.abort?.();
    const controller = new AbortController();
    abortRef.current = controller;

    const headers = { "Content-Type": "application/json" };
    if (!apiUrlFromEnv) headers["x-goog-api-key"] = apiKey;

    const context = buildCompanyContext();
    const contents = [
      { role: "user", parts: [{ text: context }] },
      ...historyForApi.map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      })),
    ];

    const payload = JSON.stringify({
      contents,
      generationConfig: { temperature: 0.6, maxOutputTokens: 400 },
    });

    try {
      const maxAttempts = 3;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const res = await fetch(endpoint, {
          method: "POST",
          headers,
          body: payload,
          signal: controller.signal,
        });

        if (isBusyStatus(res.status)) {
          if (attempt < maxAttempts) {
            await sleep(800 * attempt);
            continue;
          }

          const fallback = tryLocalFallback(lastUserText);
          if (fallback) {
            setPlaceholderText(placeholderId, fallback, false);
            return;
          }

          setPlaceholderText(
            placeholderId,
            "The AI model is currently experiencing high demand. Please try again in a moment.",
            true
          );
          return;
        }

        const data = await res.json().catch(() => null);

        if (!res.ok) {
          const msg = data?.error?.message || `HTTP ${res.status}`;
          throw new Error(msg);
        }

        const parts = data?.candidates?.[0]?.content?.parts ?? [];
        const botText = parts.map((p) => p?.text).filter(Boolean).join("").trim();

        if (!botText) throw new Error("Empty response from model.");

        setPlaceholderText(placeholderId, botText, false);
        return;
      }
    } catch (err) {
      const isAbort = err?.name === "AbortError";

      if (!isAbort) {
        const fallback = tryLocalFallback(lastUserText);
        if (fallback) {
          setPlaceholderText(placeholderId, fallback, false);
          setIsLoading(false);
          return;
        }
      }

      setPlaceholderText(
        placeholderId,
        isAbort
          ? "Request canceled. Please try again."
          : `Error: ${err?.message || "Failed to fetch response."}`,
        true
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = (text) => {
    if (isLoading) return;

    // non-embed: ensure open when sending
    if (!isEmbed && !isOpen) setIsOpen(true);

    // ✅ when sending: go to chat screen
    setShowHome(false);
    setIsLoading(true);

    const userMsg = { id: makeId(), role: "user", text, isError: false };
    const placeholderId = makeId();
    const base = historyRef.current;

    setChatHistory([
      ...base,
      userMsg,
      { id: placeholderId, role: "model", text: "Thinking...", isError: false },
    ]);

    generateBotResponse([...base, userMsg], placeholderId);
  };

  const ChatPopup = (
    <div className={`chatbot-popup ${isEmbed ? "chatbot-embed-fill" : ""}`}>
      <div className="chat-header">
        <div className="header-info">
          <div className="header-icon-container">
            <ChatbotIcon className="text-white" />
          </div>
          <h2 className="logo-text">{companyInfo.name}</h2>
        </div>

        {!isEmbed && (
          <button
            type="button"
            className="material-symbols-rounded header-arrow"
            onClick={() => setIsOpen(false)}
            aria-label="Close chatbot"
          >
            keyboard_arrow_down
          </button>
        )}
      </div>

      <div className="chatbot-body" ref={chatBodyRef}>
        {showHome ? (
          <div className="space-y-5">
            {/* Black top card */}
            <div className="rounded-2xl bg-black text-[#f1f0e9] p-5">
              <div className="text-2xl font-semibold">Chat with us</div>
              <div className="mt-2 text-sm opacity-90">
                👋 Hi, message us with any questions. We're happy to help!
              </div>

              <button
                type="button"
                className="mt-5 w-full rounded-xl py-3 font-semibold bg-white/30 hover:bg-white/40 transition-colors"
                onClick={() => setShowHome(false)}
              >
                Return to chat
              </button>
            </div>

            {/* Quick questions */}
            <div className="text-center font-semibold text-black">Instant answers</div>

            <div className="space-y-3">
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  className="w-full text-left rounded-xl px-4 py-4 border border-black/30 bg-white hover:bg-white/70 transition-colors text-black/70 hover:text-black"
                  onClick={() => handleSend(q)}
                  disabled={isLoading}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {chatHistory.map((chat) => (
              <ChatMessage key={chat.id} chat={chat} />
            ))}
          </div>
        )}
      </div>

      <div className="chat-footer">
        <ChatForm onSend={handleSend} disabled={isLoading} />
      </div>
    </div>
  );

  // ✅ EMBED: show chat space immediately
  if (isEmbed) {
    return <div className="chatbot-embed-root">{ChatPopup}</div>;
  }

  // ✅ NORMAL: toggler + popup
  return (
    <div className="chatbot-wrapper">
      {!isOpen && (
        <button
          type="button"
          className="chatbot-launcher"
          onClick={() => {
            setIsOpen(true);
            setShowHome(true); // show home when opened
          }}
          aria-label="Open chatbot"
        >
          <ChatbotIcon className="text-white" />
        </button>
      )}

      {isOpen && ChatPopup}
    </div>
  );
}