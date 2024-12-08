interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatHistoryProps {
  messages: Message[];
}

export const ChatHistory = ({ messages }: ChatHistoryProps) => {
  return (
    <div className="flex flex-col gap-4 p-4 h-96 overflow-y-auto">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`p-3 rounded-lg max-w-[80%] ${
            message.role === "user"
              ? "bg-blue-100 ml-auto"
              : "bg-gray-100 mr-auto"
          }`}
        >
          {message.content}
        </div>
      ))}
    </div>
  );
};
