import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';

export interface Book {
    id: number;
    title: string;
    author?: string;
    year?: string;
    cover?: string;
}

const PORT = process.env['PORT'] || 3000;
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

let books: Book[] = [];

app.use(express.static('src'));

wss.on('connection', (ws: WebSocket) => {
  console.log('WebSocket connection established');

  ws.on('message', (message) => {
    try {
      const msg = JSON.parse(message.toString());

      if (msg.type === 'getBooks') {
        ws.send(JSON.stringify({ type: 'books', data: books }));
      } else {
        switch (msg.type) {
          case 'addBook':
            books.push(msg.data);
            break;
          case 'updateBook':
            books = books.map((book) => (book.id === msg.data.id ? msg.data : book));
            break;
          case 'removeBook':
            books = books.filter((book) => book.id !== msg.data.id);
            break;
          default:
            console.warn('Unknown message type:', msg.type);
            break;
        }

        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'books', data: books }) );
          }
        });
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`WebSocket server is ready for connections`);
});
