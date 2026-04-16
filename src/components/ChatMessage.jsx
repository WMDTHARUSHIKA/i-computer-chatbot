import ChatbotIcon from "./ChatbotIcon";

export default function ChatMessage({ chat }) {
  const isBot = chat.role === "model"; // bot
  // user example: chat.role === "user"

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
        <div className="message-text" style={{ whiteSpace: "pre-line" }}>
          {chat.text}
        </div>

        {/* Optional (only shows if you pass chat.time) */}
        {chat.time && <div className="message-meta">{chat.time}</div>}
      </div>
    </div>
  );
}