'use client';

import { useState } from 'react';
import { useChatStore, sendMessage } from '../real_time/useChatStore';

export default function Chat() {
    const messages = useChatStore();
    const [input, setInput] = useState('');

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim()) {
            sendMessage(input);
            setInput('');
        }
    };

    return (
        <div className="flex flex-col h-[500px] border border-neutral-800 rounded-xl overflow-hidden bg-black shadow-2xl">
            <div className="bg-neutral-900 p-4 border-b border-neutral-800">
                <h2 className="text-xl font-bold text-white tracking-tight">Live Chat</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-950">
                {messages.length === 0 ? (
                    <div className="text-neutral-500 text-center italic mt-10">No messages yet...</div>
                ) : (
                    messages.map((msg, idx) => (
                        <div key={msg.id || idx} className={`flex ${msg.sender === 'User' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                                msg.sender === 'User' 
                                    ? 'bg-blue-600 text-white rounded-tr-sm' 
                                    : 'bg-neutral-800 text-neutral-100 rounded-tl-sm'
                            }`}>
                                <div className="text-xs opacity-50 mb-1">{msg.sender}</div>
                                <div>{msg.text}</div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <form onSubmit={handleSend} className="p-4 bg-neutral-900 border-t border-neutral-800 flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-neutral-950 border border-neutral-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button 
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                    Send
                </button>
            </form>
        </div>
    );
}
