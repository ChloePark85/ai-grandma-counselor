"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// server/websocket.ts
// import 부분을 다음과 같이 수정
// server/websocket.ts의 import 문을 수정
const dotenv = __importStar(require("dotenv"));
dotenv.config({ path: ".env.local" });
const express = __importStar(require("express"));
const http_1 = require("http");
const ws_1 = require("ws");
const client_1 = require("../lib/openai/client");
const app = express.default(); // express.default() 사용
const server = (0, http_1.createServer)(app);
const wss = new ws_1.WebSocketServer({ server });
const clients = new Map();
wss.on("connection", (ws) => {
    ws.clientId = crypto.randomUUID();
    const messageHandler = (message) => {
        console.log("OpenAI Response:", message);
        if (ws.readyState === ws_1.WebSocket.prototype.OPEN) {
            ws.send(JSON.stringify(message));
        }
    };
    const openAIClient = new client_1.OpenAIRealtimeClient(messageHandler);
    if (ws.clientId) {
        clients.set(ws.clientId, openAIClient);
    }
    console.log(`Client connected: ${ws.clientId}`);
    ws.on("message", async (data) => {
        try {
            const parsed = JSON.parse(data.toString());
            if (!ws.clientId)
                return;
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
        }
        catch (error) {
            console.error("Error processing message:", error);
            ws.send(JSON.stringify({ error: "Error processing message" }));
        }
    });
    ws.on("close", () => {
        if (!ws.clientId)
            return;
        console.log(`Client disconnected: ${ws.clientId}`);
        const client = clients.get(ws.clientId);
        if (client) {
            client.close();
            clients.delete(ws.clientId);
        }
    });
    // Send initial connection success message
    ws.send(JSON.stringify({
        type: "connection_established",
        clientId: ws.clientId,
    }));
});
// Health check endpoint
app.get("/health", (req, res) => {
    res.send("WebSocket server is running");
});
const PORT = process.env.WS_PORT || 3001;
server.listen(PORT, () => {
    console.log(`WebSocket server is running on port ${PORT}`);
});
exports.default = server;
