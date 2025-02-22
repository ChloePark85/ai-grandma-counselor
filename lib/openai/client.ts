// lib/openai/client.ts
import WebSocket from "ws";

export class OpenAIRealtimeClient {
  private ws: WebSocket;
  private messageHandler: (message: any) => void;

  constructor(messageHandler: (message: any) => void) {
    this.messageHandler = messageHandler;
    this.ws = this.connect();
  }

  private connect(): WebSocket {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    console.log("Connecting to OpenAI Realtime API...");

    const ws = new WebSocket(
      "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01",
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "OpenAI-Beta": "realtime=v1",
        },
      }
    );

    ws.on("open", () => {
      console.log("Connected to OpenAI");
      this.setupGrandmaPersona();
    });

    ws.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString());
        console.log("OpenAI Raw Message:", data.toString()); // 원본 메시지 로깅
        console.log("OpenAI Parsed Message:", message); // 파싱된 메시지 로깅
        this.messageHandler(message);
      } catch (error) {
        console.error("Failed to parse OpenAI message:", error);
      }
    });

    ws.on("error", (error) => {
      console.error("OpenAI WebSocket error:", error);
    });

    return ws;
  }

  private setupGrandmaPersona() {
    console.log("Setting up Grandma persona...");
    this.ws.send(
      JSON.stringify({
        type: "session.update",
        session: {
          voice: "coral",
          instructions: `You are a wise, caring grandmother figure who listens with empathy and provides emotional support. 
        Your voice should be warm, gentle, and soothing. Speak at a measured pace. 
        Use simple, clear language and occasionally share life wisdom through gentle stories or metaphors. 
        Always maintain a supportive, non-judgmental tone. 
        If the person seems distressed, prioritize emotional validation before offering advice.`,
        },
      })
    );
  }

  public sendAudio(audioData: string) {
    if (this.ws.readyState === WebSocket.OPEN) {
      console.log("Sending audio data...");
      this.ws.send(
        JSON.stringify({
          type: "input_audio_buffer.append",
          audio: audioData,
        })
      );
    } else {
      console.error("WebSocket not open. Current state:", this.ws.readyState);
    }
  }

  // lib/openai/client.ts의 requestResponse 함수 수정
  public requestResponse() {
    if (this.ws.readyState === WebSocket.OPEN) {
      console.log("Requesting response...");

      // 먼저 audio buffer를 commit 합니다
      this.ws.send(
        JSON.stringify({
          type: "input_audio_buffer.commit",
        })
      );

      // response.create에서 text와 audio 모달리티를 모두 요청
      this.ws.send(
        JSON.stringify({
          type: "response.create",
          response: {
            modalities: ["text", "audio"], // audio 모달리티 추가
            voice: "coral", // 사용할 음성 지정
          },
        })
      );
    } else {
      console.error("WebSocket not open. Current state:", this.ws.readyState);
    }
  }

  public close() {
    if (this.ws.readyState === WebSocket.OPEN) {
      console.log("Closing OpenAI connection...");
      this.ws.close();
    }
  }
}
