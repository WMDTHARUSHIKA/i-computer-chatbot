const ChatbotIcon = ({ className = "" }) => {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 3c3.9 0 7 2.9 7 6.5V14c0 1.7-1.3 3-3 3h-1v2a1 1 0 0 1-1.6.8L10.7 17H8c-1.7 0-3-1.3-3-3V9.5C5 5.9 8.1 3 12 3Z"
        fill="currentColor"
      />
      <path
        d="M9.2 10.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm5.6 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z"
        fill="currentColor"
        opacity="0.35"
      />
    </svg>
  );
};

export default ChatbotIcon;