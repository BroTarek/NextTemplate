export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  let intervalId: NodeJS.Timeout;

  const stream = new ReadableStream({
    start(controller) {
      // Send an initial connected message
      controller.enqueue(`data: ${JSON.stringify({ id: Date.now(), text: 'Connected to notification stream', type: 'system' })}\n\n`);

      // Mock notifications every 5 seconds
      intervalId = setInterval(() => {
        const notifications = [
          'New message from Alice',
          'Your post was liked',
          'System maintenance in 5 minutes',
          'Bob started following you'
        ];
        const randomNotif = notifications[Math.floor(Math.random() * notifications.length)];
        
        const data = JSON.stringify({
          id: Date.now(),
          text: randomNotif,
          type: 'alert'
        });
        
        try {
          controller.enqueue(`data: ${data}\n\n`);
        } catch (e) {
          clearInterval(intervalId);
        }
      }, 5000);
    },
    cancel() {
      clearInterval(intervalId);
    }
  });

  req.signal.addEventListener('abort', () => {
    clearInterval(intervalId);
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
