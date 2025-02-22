// server/websocket.ts
// import 부분을 다음과 같이 수정
// server/websocket.ts의 import 문을 수정
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import * as express from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket, RawData } from "ws";
import { OpenAIRealtimeClient } from "../lib/openai/client";

const app = express.default(); // express.default() 사용
const server = createServer(app);
const wss = new WebSocketServer({ server });

interface ExtWebSocket extends WebSocket {
  clientId?: string;
}

const clients = new Map<string, OpenAIRealtimeClient>();

wss.on("connection", (ws: ExtWebSocket) => {
  ws.clientId = crypto.randomUUID();

  const messageHandler = (message: any) => {
    console.log("OpenAI Response:", message);
    if (ws.readyState === WebSocket.prototype.OPEN) {
      ws.send(JSON.stringify(message));
    }
  };

  const openAIClient = new OpenAIRealtimeClient(messageHandler);
  if (ws.clientId) {
    clients.set(ws.clientId, openAIClient);
  }

  console.log(`Client connected: ${ws.clientId}`);

  ws.on("message", async (data: RawData) => {
    try {
      const parsed = JSON.parse(data.toString());
      if (!ws.clientId) return;

      const client = clients.get(ws.clientId);

      if (!client) {
        ws.send(JSON.stringify({ error: "Client not found" }));
        return;
      }

      console.log("Received message type:", parsed.type); // 디버깅용 로그 추가

      switch (parsed.type) {
        case "audio":
          client.sendAudio(parsed.audio);
          break;
        case "request_response":
        case "response.create":
          client.requestResponse();
          break;
        case "input_audio_buffer.commit":
          // input_audio_buffer.commit 메시지도 OpenAI로 전달
          client.sendAudio(parsed.audio);
          break;
        default:
          console.warn("Unknown message type:", parsed.type);
      }
    } catch (error) {
      console.error("Error processing message:", error);
      ws.send(JSON.stringify({ error: "Error processing message" }));
    }
  });

  ws.on("close", () => {
    if (!ws.clientId) return;

    console.log(`Client disconnected: ${ws.clientId}`);
    const client = clients.get(ws.clientId);
    if (client) {
      client.close();
      clients.delete(ws.clientId);
    }
  });

  // Send initial connection success message
  ws.send(
    JSON.stringify({
      type: "connection_established",
      clientId: ws.clientId,
    })
  );
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.send("WebSocket server is running");
});

const PORT = process.env.WS_PORT || 3001;

server.listen(PORT, () => {
  console.log(`WebSocket server is running on port ${PORT}`);
});

export default server;
