import ChatbotIcon from "./ChatbotIcon";

export default function ChatMessage({ chat }) {
  // bot: role === "model"
  // user: role === "user"
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
        <div className="message-text" style={{ whiteSpace: "pre-line" }}>
          {chat.text}
        </div>
      </div>
    </div>
  );
}