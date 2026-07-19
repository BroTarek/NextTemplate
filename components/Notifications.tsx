'use client';

import { useNotificationStore } from '../real_time/useNotificationStore';

export default function Notifications() {
    const notifications = useNotificationStore();

    return (
        <div className="flex flex-col h-[500px] border border-neutral-800 rounded-xl overflow-hidden bg-black shadow-2xl">
            <div className="bg-neutral-900 p-4 border-b border-neutral-800 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white tracking-tight">Live Notifications</h2>
                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                    {notifications.length}
                </span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-neutral-950">
                {notifications.length === 0 ? (
                    <div className="text-neutral-500 text-center italic mt-10">No new notifications...</div>
                ) : (
                    // Show newest notifications first
                    [...notifications].reverse().map((notif, idx) => (
                        <div key={notif.id || idx} className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 shadow-sm flex items-start gap-3 animate-fade-in-down">
                            <div className="mt-0.5">
                                {notif.type === 'system' ? '⚙️' : '🔔'}
                            </div>
                            <div>
                                <div className="text-white text-sm font-medium">{notif.text}</div>
                                <div className="text-xs text-neutral-500 mt-1">Just now</div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
