import Chat from "@/components/Chat";
import Notifications from "@/components/Notifications";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white p-8 font-[family-name:var(--font-geist-sans)]">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <header className="text-center space-y-4 py-12">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            Real-Time Dashboard
          </h1>
          <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
            Demonstrating WebSockets for bi-directional live chat and Server-Sent Events (SSE) for one-way live notifications, managed via <code className="bg-neutral-800 px-2 py-1 rounded text-sm text-blue-300">useSyncExternalStore</code>.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Chat />
          <Notifications />
        </div>
        
      </div>
    </main>
  );
}