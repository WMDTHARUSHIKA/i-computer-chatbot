import ChatbotIcon from "./ChatbotIcon";

export default function ChatMessage({ chat }) {
  // bot if role is "model"
  const isBot = chat.role === "model";

  return (
    <div
      className={`message ${isBot ? "bot-message" : "user-message"} ${
        chat.isError ? "error" : ""
      }`}
    >
      {isBot && (
        <div className="bot-icon-wrapper" aria-hidden="true">
          <ChatbotIcon />
        </div>
      )}

      <div className="message-text-container">
        <div className="message-text" style={{ whiteSpace: "pre-wrap" }}>
          {chat.text}

          {/* time/meta inside bubble like your image */}
          {chat.time && (
            <div className="message-meta">
              {isBot ? `Automated · ${chat.time}` : chat.time}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}