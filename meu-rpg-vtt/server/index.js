const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());

//const server = http.createServer(app);
//arquivos do React (na pasta ../client/dist)
const clientPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientPath));

const server = http.createServer(app);

// Configuração do Socket.io
const io = new Server(server, {
  cors: {
    origin: "*", //padrão do Vite
    methods: ["GET", "POST"]
  }
});

// O que acontece quando alguém conecta
io.on('connection', (socket) => {
  console.log(`✅ Usuário conectado! ID: ${socket.id}`);

  // O servidor pode ouvir eventos aqui
  socket.on('disconnect', () => {
    console.log(`❌ Usuário desconectado! ID: ${socket.id}`);
  });
});

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(clientPath, 'index.html'));
});

// Inicia o servidor na porta 3001
server.listen(3001, () => {
  console.log('🚀 SERVIDOR RODANDO NA PORTA 3001');
});