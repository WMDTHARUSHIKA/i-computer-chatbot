import ChatbotIcon from "./ChatbotIcon";

export default function ChatMessage({ chat }) {
  const isUser = chat.role === "user";

  return (
    <div className={`w-full flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        {/* Receiver avatar (left only) */}
        {!isUser && (
          <div className="w-9 h-9 rounded-full bg-black text-[#f1f0e9] flex items-center justify-center shrink-0">
            <ChatbotIcon className="text-white" />
          </div>
        )}

        {/* Bubble */}
        <div
          className={[
            "max-w-[78%] px-4 py-3 text-[14px] leading-relaxed rounded-2xl",
            isUser
              ? "bg-black text-white rounded-br-md"
              : "bg-white/70 text-black rounded-bl-md",
            chat.isError ? "bg-red-50 text-red-700" : "",
          ].join(" ")}
          style={{ whiteSpace: "pre-wrap" }}
        >
          {chat.text}
        </div>
      </div>
    </div>
  );
}