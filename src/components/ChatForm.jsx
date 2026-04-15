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
    <form className="icw-form" onSubmit={handleSubmit}>
      <input
        ref={inputRef}
        className="icw-input"
        type="text"
        placeholder="Write message"
        autoComplete="off"
        disabled={disabled}
        required
      />
      <button
        className="icw-send"
        type="submit"
        disabled={disabled}
        aria-label="Send"
        title="Send"
      >
        <span className="material-symbols-rounded">send</span>
      </button>
    </form>
  );
}