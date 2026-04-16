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

const createDefaultHistory = () => [
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

function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultHistory();

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return createDefaultHistory();

    return parsed
      .filter((m) => m && typeof m.role === "string" && typeof m.text === "string")
      .map((m) => ({ ...m, isError: Boolean(m.isError) }));
  } catch {
    return createDefaultHistory();
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

  // ✅ In embed mode open immediately (no internal launcher click required)
  const [isOpen, setIsOpen] = useState(isEmbed ? true : false);

  const [chatHistory, setChatHistory] = useState(() => loadHistory());
  const [isLoading, setIsLoading] = useState(false);

  const chatBodyRef = useRef(null);
  const historyRef = useRef(chatHistory);
  const abortRef = useRef(null);

  useEffect(() => {
    historyRef.current = chatHistory;
  }, [chatHistory]);

  // ✅ Add class to remove background in embed mode (CSS will handle it)
  useEffect(() => {
    if (!isEmbed) return;

    document.documentElement.classList.add("chat-embed");
    document.body.classList.add("chat-embed");

    return () => {
      document.documentElement.classList.remove("chat-embed");
      document.body.classList.remove("chat-embed");
    };
  }, [isEmbed]);

  // Auto-scroll when open (embed is always open)
  useEffect(() => {
    const openNow = isEmbed || isOpen;
    if (!openNow) return;

    const el = chatBodyRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [chatHistory, isOpen, isEmbed]);

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
    }
  }, [isOpen, isEmbed]);

  // ✅ NEW: reset/refresh chat history
  const handleResetChat = () => {
    // Optional confirm (remove if you don't want popup)
    const ok = window.confirm("Clear chat history?");
    if (!ok) return;

    abortRef.current?.abort?.();
    setIsLoading(false);

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }

    setChatHistory(createDefaultHistory());
  };

  const setPlaceholderText = (placeholderId, text, isError = false) => {
    setChatHistory((prev) =>
      prev.map((m) => (m.id === placeholderId ? { ...m, text, isError } : m))
    );
  };

  const generateBotResponse = async (historyForApi, placeholderId) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY; // preferred
    const apiUrlFromEnv = import.meta.env.VITE_API_URL; // optional

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

    // cancel any in-flight request
    abortRef.current?.abort?.();
    const controller = new AbortController();
    abortRef.current = controller;

    const headers = { "Content-Type": "application/json" };
    if (!apiUrlFromEnv) headers["x-goog-api-key"] = apiKey;

    const context = buildCompanyContext();
    const contents = [
      { role: "user", parts: [{ text: context }] }, // context only for API
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

        // silent retries
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

    setIsLoading(true);

    const userMsg = { id: makeId(), role: "user", text, isError: false };
    const placeholderId = makeId();
    const base = historyRef.current;

    // UI: user message + placeholder once
    setChatHistory([
      ...base,
      userMsg,
      { id: placeholderId, role: "model", text: "Thinking...", isError: false },
    ]);

    // API: don't include placeholder
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

        {/* ✅ NEW: Header actions (Refresh + Close) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="material-symbols-rounded header-action-btn"
            onClick={handleResetChat}
            aria-label="Refresh chat"
            title="Refresh chat"
          >
            refresh
          </button>

          {/* ✅ hide close arrow in embed (close handled by website button) */}
          {!isEmbed && (
            <button
              type="button"
              className="material-symbols-rounded header-arrow"
              onClick={() => setIsOpen(false)}
              aria-label="Close chatbot"
              title="Close"
            >
              keyboard_arrow_down
            </button>
          )}
        </div>
      </div>

      <div className="chatbot-body" ref={chatBodyRef}>
        {chatHistory.map((chat) => (
          <ChatMessage key={chat.id} chat={chat} />
        ))}
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
          onClick={() => setIsOpen(true)}
          aria-label="Open chatbot"
        >
          <ChatbotIcon className="text-white" />
        </button>
      )}

      {isOpen && ChatPopup}
    </div>
  );
}