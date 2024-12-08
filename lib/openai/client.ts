// lib/openai/client.ts
import WebSocket from "ws";

export class OpenAIRealtimeClient {
  private ws: WebSocket;
  private messageHandler: (message: any) => void;

  constructor(messageHandler: (message: any) => void) {
    this.messageHandler = messageHandler;
    this.ws = this.connect();
  }

  private connect() {
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
      this.setupGrandmaPersona();
    });

    ws.on("message", (data) => {
      const message = JSON.parse(data.toString());
      this.messageHandler(message);
    });

    return ws;
  }

  private setupGrandmaPersona() {
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
    this.ws.send(
      JSON.stringify({
        type: "input_audio_buffer.append",
        audio: audioData,
      })
    );
  }

  public requestResponse() {
    this.ws.send(
      JSON.stringify({
        type: "response.create",
      })
    );
  }

  public close() {
    this.ws.close();
  }
}
