import ChatbotIcon from "./ChatbotIcon";

export default function ChatMessage({ chat }) {
  const isBot = chat.role === "model";

  return (
    <div className={`icw-msg ${isBot ? "icw-bot" : "icw-user"} ${chat.isError ? "icw-error" : ""}`}>
      {isBot && (
        <div className="icw-bot-avatar" aria-hidden="true">
          <ChatbotIcon className="icw-bot-avatar-icon" />
        </div>
      )}

      <div className="icw-bubble" style={{ whiteSpace: "pre-line" }}>
        {chat.text}
      </div>
    </div>
  );
}