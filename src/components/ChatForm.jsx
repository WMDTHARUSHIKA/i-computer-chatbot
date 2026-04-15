import { useRef } from "react";

export default function ChatForm({ onSend, disabled = false }) {
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
        placeholder="Write message"
        className="message-input"
        autoComplete="off"
        disabled={disabled}
        required
      />

      <button
        type="submit"
        className="send-btn material-symbols-rounded"
        disabled={disabled}
        aria-label="Send"
        title="Send"
      >
        send
      </button>
    </form>
  );
}