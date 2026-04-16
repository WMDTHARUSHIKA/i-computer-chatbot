import ChatbotIcon from "./ChatbotIcon";

export default function ChatMessage({ chat }) {
  // Sender = user (RIGHT), Receiver = model/bot (LEFT)
  const isSender = chat.role === "user";

  return (
    <div className={`message ${isSender ? "user-message" : "bot-message"} ${chat.isError ? "error" : ""}`}>
      {/* Show avatar only for receiver (left side) */}
      {!isSender && (
        <div className="bot-icon-wrapper" aria-hidden="true">
          <ChatbotIcon className="text-white" />
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