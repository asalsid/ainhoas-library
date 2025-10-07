import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';

const PORT = process.env['PORT'] || 3000;
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const clients = new Set<WebSocket>();

let books = [
  { id: 1, title: "1984", author: "George Orwell", year: "1949", genre: "Dystopian" },
  { id: 2, title: "To Kill a Mockingbird", author: "Harper Lee", year: "1960", genre: "Fiction" },
  { id: 3, title: "The Great Gatsby", author: "F. Scott Fitzgerald", year: "1925", genre: "Fiction" },
  { id: 4, title: "Moby Dick", author: "Herman Melville", year: "1851", genre: "Fiction" },
  { id: 5, title: "Pride and Prejudice", author: "Jane Austen", year: "1813", genre: "Romance" },
  { id: 6, title: "The Catcher in the Rye", author: "J.D. Salinger", year: "1951", genre: "Fiction" },
  { id: 7, title: "The Hobbit", author: "J.R.R. Tolkien", year: "1937", genre: "Fantasy" }
];

app.use(express.static('src'));

wss.on('connection', (ws: WebSocket) => {
  console.log('New WebSocket connection');
  clients.add(ws);

  ws.on('message', (message) => {
    try {
      const msg = JSON.parse(message.toString());
      switch (msg.type) {
        case 'getBooks':
          ws.send(JSON.stringify({ type: 'books', data: books }));
          return;
        case 'addBook':
          const newBook = { ...msg.data, id: Math.max(...books.map(b => b.id)) + 1 };
          books.push(newBook);
          break;
        case 'updateBook':
          books = books.map((book) => (book.id === msg.data.id ? msg.data : book));
          break;
        case 'removeBook':
          books = books.filter((book) => book.id !== msg.data.id);
          break;
        default:
          ws.emit('error', 'Unknown message type:', msg.type);
          return;
      }
      
      clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'books', data: books }));
        }
      });
    } catch (error) {
      ws.emit('error', 'Invalid message format');
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
  });
});

server.listen(PORT, () => {
  console.log(`WebSocket Server available at http://localhost:${PORT}`);
});
