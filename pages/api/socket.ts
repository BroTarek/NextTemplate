import { Server as NetServer } from 'http';
import { NextApiRequest } from 'next';
import { Server as ServerIO } from 'ws';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function SocketHandler(req: NextApiRequest, res: any) {
  if (res.socket.server.ws) {
    console.log('Socket is already running');
  } else {
    console.log('Socket is initializing');
    const wss = new ServerIO({ noServer: true });
    res.socket.server.ws = wss;

    res.socket.server.on('upgrade', (request: any, socket: any, head: any) => {
      if (!request.url?.startsWith('/api/socket')) return;
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    });

    wss.on('connection', (ws) => {
      console.log('Client connected');
      ws.on('message', (message) => {
        // Echo the message back to all clients
        const parsedMessage = JSON.parse(message.toString());
        wss.clients.forEach((client) => {
          if (client.readyState === 1) { // OPEN
            client.send(JSON.stringify(parsedMessage));
          }
        });
      });

      // Send a welcome message
      ws.send(JSON.stringify({
        id: Date.now(),
        text: 'Welcome to the chat!',
        sender: 'System'
      }));
    });
  }
  res.end();
}
