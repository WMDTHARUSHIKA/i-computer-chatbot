import ChatbotIcon from "./ChatbotIcon";

const ChatMessage = ({ chat }) => {
  return (
    <div
      className={`message ${chat.role === "model" ? "bot" : "user"}-message ${
        chat.isError ? "error" : ""
      }`}
    >
      {chat.role === "model" && (
        <div className="bot-icon-wrapper">
          <ChatbotIcon className="text-white" />
        </div>
      )}

      <div className="message-text-container">
        <p className="message-text" style={{ whiteSpace: "pre-line" }}>
          {chat.text}
        </p>
      </div>
    </div>
  );
};

export default ChatMessage;