const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const routes = require('./routes'); // <--- Importa as rotas

const app = express();

app.use(cors());
app.use(express.json());

// Usa todas as rotas definidas no arquivo routes.js
app.use('/api', routes); // Prefixo /api para ficar organizado (ex: /api/login)

// Configuração Frontend Estático
const clientPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientPath));

// Configuração Socket.io
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

io.on('connection', (socket) => {
  console.log(`Socket conectado: ${socket.id}`);
  
  // Exemplo: Entrar em uma sala específica da mesa
  socket.on('join_room', (gameId) => {
    socket.join(gameId);
    console.log(`Socket ${socket.id} entrou na mesa ${gameId}`);
  });
});

// Qualquer rota não-API manda pro React
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(clientPath, 'index.html'));
});

server.listen(3001, () => {
  console.log('🚀 SERVIDOR RODANDO NA 3001');
});