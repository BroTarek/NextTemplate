import { useSyncExternalStore } from "react";

export interface ChatMessage {
    id: number;
    text: string;
    sender: string;
}

let messages: ChatMessage[] = [];
const subscribers = new Set<() => void>();

const subscribe = (callback: () => void) => {
    subscribers.add(callback);
    return () => subscribers.delete(callback);
};

const notify = () => {
    subscribers.forEach((callback) => callback());
};

// Singleton connection manager
let socket: WebSocket | null = null;
let isConnecting = false;

const connectWebSocket = () => {
    if (typeof window === 'undefined') return;
    if (socket || isConnecting) return;

    isConnecting = true;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/socket`;
    
    socket = new WebSocket(wsUrl);

    socket.onopen = () => {
        console.log("WebSocket connected");
        isConnecting = false;
    };

    socket.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            messages = [...messages, data];
            notify();
        } catch (e) {
            console.error("Failed to parse chat message", e);
        }
    };

    socket.onerror = (error) => {
        console.error("WebSocket Error:", error);
    };

    socket.onclose = () => {
        console.log("WebSocket disconnected");
        socket = null;
        isConnecting = false;
        // Reconnect after a delay
        setTimeout(connectWebSocket, 3000);
    };
};

export const sendMessage = (text: string) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
            id: Date.now(),
            text,
            sender: 'User'
        }));
    } else {
        console.warn("WebSocket is not connected");
    }
};

export const useChatStore = () => {
    if (typeof window !== 'undefined' && !socket && !isConnecting) {
        connectWebSocket();
    }
    return useSyncExternalStore(subscribe, () => messages, () => []);
};
