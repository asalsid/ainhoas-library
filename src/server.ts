import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';

const PORT = process.env['PORT'] || 3000;
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const clients = new Set<WebSocket>();
const sseClients = new Map<number, any>();

let books = [
  { id: 1, title: "1984", author: "George Orwell", year: "1949", genre: "Dystopian" },
  { id: 2, title: "To Kill a Mockingbird", author: "Harper Lee", year: "1960", genre: "Fiction" },
  { id: 3, title: "The Great Gatsby", author: "F. Scott Fitzgerald", year: "1925", genre: "Fiction" }
];

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  next();
});

app.use(express.json());

app.get('/api/books', (req, res) => {
  console.log('New HTTP connection');
  res.json(books);
});

// Server-Sent Events endpoint
app.get('/api/books/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  // Send initial data
  res.write(`data: ${JSON.stringify(books)}\n\n`);
  
  // Store this connection to send updates
  const clientId = Date.now();
  sseClients.set(clientId, res);
  
  req.on('close', () => {
    sseClients.delete(clientId);
  });
});

app.get('/api/books/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const book = books.find(b => b.id === id);
  if (book) {
    res.json(book);
  } else {
    res.status(404).json({ error: 'Book not found' });
  }
});

app.post('/api/books', (req, res) => {
  const newBook = { ...req.body, id: Math.max(...books.map(b => b.id)) + 1 };
  books.push(newBook);
  
  // Notify SSE clients
  sseClients.forEach(client => {
    client.write(`data: ${JSON.stringify(books)}\n\n`);
  });
  
  res.status(201).json(newBook);
});

app.put('/api/books/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const bookIndex = books.findIndex(b => b.id === id);
  if (bookIndex !== -1) {
    books[bookIndex] = { ...req.body, id };
    
    // Notify SSE clients
    sseClients.forEach(client => {
      client.write(`data: ${JSON.stringify(books)}\n\n`);
    });
    
    res.json(books[bookIndex]);
  } else {
    res.status(404).json({ error: 'Book not found' });
  }
});

app.delete('/api/books/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const bookIndex = books.findIndex(b => b.id === id);
  if (bookIndex !== -1) {
    books.splice(bookIndex, 1);
    
    // Notify SSE clients
    sseClients.forEach(client => {
      client.write(`data: ${JSON.stringify(books)}\n\n`);
    });
    
    res.status(204).send();
  } else {
    res.status(404).json({ error: 'Book not found' });
  }
});

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
      
      const response = JSON.stringify({ type: 'books', data: books });
      clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(response);
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
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`REST API available at http://localhost:${PORT}/api/books`);
  console.log(`WebSocket server is ready for connections`);
});
