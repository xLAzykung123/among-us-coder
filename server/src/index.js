const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { setupSockets } = require('./socket');

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  /\.vercel\.app$/
];

const io = new Server(server, {
  cors: { 
    origin: allowedOrigins, 
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

setupSockets(io);

const PORT = 3001;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
