"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useWebSocket = void 0;
// lib/hooks/useWebSocket.ts
const react_1 = require("react");
const useWebSocket = (options = {}) => {
    const [isConnected, setIsConnected] = (0, react_1.useState)(false);
    const wsRef = (0, react_1.useRef)(null);
    const connect = (0, react_1.useCallback)(() => {
        const ws = new WebSocket(`ws://localhost:${process.env.NEXT_PUBLIC_WS_PORT || 3001}`);
        ws.onopen = () => {
            console.log("WebSocket Connected");
            setIsConnected(true);
        };
        ws.onmessage = (event) => {
            var _a;
            try {
                const message = JSON.parse(event.data);
                (_a = options.onMessage) === null || _a === void 0 ? void 0 : _a.call(options, message);
            }
            catch (error) {
                console.error("Failed to parse WebSocket message:", error);
            }
        };
        ws.onerror = (error) => {
            var _a;
            console.error("WebSocket Error:", error);
            (_a = options.onError) === null || _a === void 0 ? void 0 : _a.call(options, error);
            setIsConnected(false);
        };
        ws.onclose = () => {
            var _a;
            console.log("WebSocket Disconnected");
            setIsConnected(false);
            (_a = options.onClose) === null || _a === void 0 ? void 0 : _a.call(options);
        };
        wsRef.current = ws;
    }, [options]);
    const disconnect = (0, react_1.useCallback)(() => {
        var _a;
        (_a = wsRef.current) === null || _a === void 0 ? void 0 : _a.close();
        wsRef.current = null;
        setIsConnected(false);
    }, []);
    const sendMessage = (0, react_1.useCallback)((message) => {
        var _a;
        if (((_a = wsRef.current) === null || _a === void 0 ? void 0 : _a.readyState) === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(message));
        }
        else {
            console.error("WebSocket is not connected");
        }
    }, []);
    (0, react_1.useEffect)(() => {
        return () => {
            disconnect();
        };
    }, [disconnect]);
    return {
        isConnected,
        connect,
        disconnect,
        sendMessage,
    };
};
exports.useWebSocket = useWebSocket;
