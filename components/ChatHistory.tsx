// app/components/ChatHistory.tsx
"use client";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface ChatHistoryProps {
  messages: Message[];
}

export const ChatHistory = ({ messages }: ChatHistoryProps) => {
  return (
    <div className="flex flex-col gap-4 p-4 h-96 overflow-y-auto bg-warm-50 rounded-lg">
      {messages.length === 0 && (
        <div className="text-center text-warm-500 italic">
          Start talking with Grandma...
        </div>
      )}
      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex ${
            message.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`
              max-w-[80%] p-3 rounded-lg
              ${
                message.role === "user"
                  ? "bg-warm-200 text-warm-800"
                  : "bg-white border border-warm-200 text-warm-900"
              }
            `}
          >
            {message.content}
            <div className="text-xs text-warm-500 mt-1">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
