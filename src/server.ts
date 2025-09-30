import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';

const PORT = process.env['PORT'] || 3000;
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

interface Book {
    id: number;
    title: string;
    author: string;
    year: string;
    genre: string;
}
let books: Book[] = [
  { id: 1, title: "1984", author: "George Orwell", year: "1949", genre: "Dystopian" },
  { id: 2, title: "To Kill a Mockingbird", author: "Harper Lee", year: "1960", genre: "Fiction" },
  { id: 3, title: "The Great Gatsby", author: "F. Scott Fitzgerald", year: "1925", genre: "Fiction" }
];

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
