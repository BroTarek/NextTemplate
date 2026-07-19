import { useSyncExternalStore } from "react";
let comments: unknown = []
const subscribers = new Set<unknown>()

const subscribe = (callback: any) => {
    subscribers.add(callback)
    return () => subscribers.delete(callback)
}

const notify = () => {
    subscribers.forEach((callback: any) => callback())
}
const fetchLiveUpdates = () => {
    const eventSource = new EventSource("");
    eventSource.onmessage = (event) => {
        const comments = JSON.parse(event.data)// server sent events send text data only
        comments.forEach((Comment: any) => {
            comments.push(Comment)
        });
        notify()
    }
    eventSource.onerror = (event) => {
        eventSource.close()
    }

    return () => {
        eventSource.close()
    }
}
fetchLiveUpdates()
export const useCommentaryStore = () => {
    return useSyncExternalStore(subscribe, () => comments)
}