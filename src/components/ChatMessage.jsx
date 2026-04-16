import ChatbotIcon from "./ChatbotIcon";

export default function ChatMessage({ chat }) {
  // ✅ sender = user (RIGHT), receiver = model/bot (LEFT)
  const isSender = chat.role === "user";

  return (
    <div
      className={`message ${isSender ? "user-message" : "bot-message"} ${
        chat.isError ? "error" : ""
      }`}
    >
      {/* show avatar only for receiver (left) */}
      {!isSender && (
        <div className="bot-icon-wrapper" aria-hidden="true">
          <ChatbotIcon />
        </div>
      )}

      <div className="message-text-container">
        <div className="message-text" style={{ whiteSpace: "pre-wrap" }}>
          {chat.text}
        </div>
      </div>
    </div>
  );
}