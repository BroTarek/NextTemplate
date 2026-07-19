import { useSyncExternalStore } from "react";

export interface Notification {
    id: number;
    text: string;
    type: string;
}

let notifications: Notification[] = [];
const subscribers = new Set<() => void>();

const subscribe = (callback: () => void) => {
    subscribers.add(callback);
    return () => subscribers.delete(callback);
};

const notify = () => {
    subscribers.forEach((callback) => callback());
};

// Singleton connection manager
let eventSource: EventSource | null = null;

const connectSSE = () => {
    if (typeof window === 'undefined') return; // Don't run on server
    if (eventSource) return;

    eventSource = new EventSource("/api/notifications");

    eventSource.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            notifications = [...notifications, data]; // Create new array for React to detect change
            notify();
        } catch (e) {
            console.error("Failed to parse notification", e);
        }
    };

    eventSource.onerror = (event) => {
        console.error("SSE Error", event);
        eventSource?.close();
        eventSource = null;
        // Optionally implement reconnection logic here
        setTimeout(connectSSE, 5000);
    };
};

export const useNotificationStore = () => {
    // Initiate connection on first use (safe if called multiple times)
    if (typeof window !== 'undefined' && !eventSource) {
        connectSSE();
    }
    return useSyncExternalStore(subscribe, () => notifications, () => []);
};
