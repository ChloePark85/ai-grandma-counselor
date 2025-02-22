// app/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
// app/page.tsx의 import 문 수정
import { useWebSocket } from "../lib/hooks/useWebsocket";
import { AudioProcessor } from "../lib/audio/processor";
import { GrandmaAvatar } from "../components/GrandmaAvatar";
import { AudioControls } from "../components/AudioControls";
import { ChatHistory } from "../components/ChatHistory";

interface Message {
  role: "user" | "assistant";
  content: string; // undefined를 허용하지 않도록 함
  timestamp: number;
}
interface MessageContent {
  type: "text" | "audio";
  text?: string;
  audio?: string;
}

interface OpenAIMessage {
  type: string;
  clientId?: string; // clientId 추가
  item?: {
    type: string;
    content?: MessageContent[];
  };
  error?: {
    message: string;
  };
  response?: any; // response 객체도 추가
}

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const audioProcessorRef = useRef<AudioProcessor | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { isConnected, connect, sendMessage } = useWebSocket({
    onMessage: (message: OpenAIMessage) => {
      if (
        message.type === "conversation.item.created" &&
        message.item?.type === "message" &&
        message.item.content
      ) {
        message.item.content.forEach((item: MessageContent) => {
          if (item.type === "text" && item.text) {
            // text가 있을 때만 메시지에 추가
            const newMessage: Message = {
              role: "assistant",
              content: item.text,
              timestamp: Date.now(),
            };
            setMessages((prev) => [...prev, newMessage]);
          }

          if (item.type === "audio" && item.audio) {
            console.log("Playing audio response");
            const audio = new Audio(`data:audio/wav;base64,${item.audio}`);
            audio.play().catch((error) => {
              console.error("Failed to play audio:", error);
            });
          }
        });
      }
    },
    onError: (error) => {
      console.error("WebSocket error:", error);
      setError("Connection error. Please try again.");
    },
  });

  useEffect(() => {
    connect();
  }, [connect]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleAudioData = (audioData: string) => {
    console.log("Sending audio data..."); // 디버깅용 로그 추가
    sendMessage({
      type: "audio",
      audio: audioData,
    });
  };

  const startRecording = async () => {
    try {
      setError(null);
      if (!audioProcessorRef.current) {
        audioProcessorRef.current = new AudioProcessor(handleAudioData);
      }
      await audioProcessorRef.current.startRecording();
      setIsRecording(true);
    } catch (error) {
      setError(
        "Failed to start recording. Please check your microphone permissions."
      );
      console.error("Failed to start recording:", error);
    }
  };

  const stopRecording = () => {
    if (audioProcessorRef.current) {
      audioProcessorRef.current.stopRecording();
      setIsRecording(false);

      // response.create 대신 request_response 사용
      sendMessage({
        type: "request_response",
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: "🎤 Audio message sent",
          timestamp: Date.now(),
        },
      ]);
    }
  };

  return (
    <main className="min-h-screen bg-warm-50 p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-3xl font-serif text-warm-800 text-center mb-8">
          Talk with Grandma
        </h1>

        <div className="mb-8">
          <GrandmaAvatar />
        </div>

        <div className="mb-8 relative">
          <ChatHistory messages={messages} />
          <div ref={messagesEndRef} />
        </div>

        <div className="flex flex-col items-center gap-4">
          <AudioControls
            onStartRecording={startRecording}
            onStopRecording={stopRecording}
            isRecording={isRecording}
            isConnected={isConnected}
          />

          {error && (
            <div className="text-red-500 text-center text-sm mt-2">{error}</div>
          )}
        </div>
      </div>
    </main>
  );
}
