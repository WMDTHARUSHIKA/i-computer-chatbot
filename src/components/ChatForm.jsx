import { useRef } from "react";

const ChatForm = ({ onSend, disabled = false }) => {
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (disabled) return;

    const text = inputRef.current?.value.trim();
    if (!text) return;

    inputRef.current.value = "";
    onSend(text);
  };

  return (
    <form className="chat-form" onSubmit={handleSubmit}>
      <input
        ref={inputRef}
        type="text"
        placeholder={disabled ? "Please wait..." : "Message i-Computer Web..."}
        className="message-input"
        required
        autoComplete="off"
        disabled={disabled}
      />
      <button
        type="submit"
        className="send-btn material-symbols-rounded"
        disabled={disabled}
        aria-disabled={disabled}
        aria-label="Send message"
      >
        arrow_upward
      </button>
    </form>
  );
};

export default ChatForm;