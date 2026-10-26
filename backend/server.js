import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

/**
 * Inicialização da aplicação Express e do servidor HTTP com suporte a WebSockets.
 */
const app = express();
const server = http.createServer(app);

// Configuração do CORS permitindo requisições de origens locais (Vite / Ionic / Mobile)
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH'],
  },
});

app.use(cors());
app.use(express.json());

/**
 * Interface em memória para armazenamento dos chamados.
 * Inicializada com ocorrências padrão para simulação.
 */
let reports = [
  {
    id: 1,
    date: '28/09/2026 - 10:15',
    status: 'Pendente',
    address: 'Rua do Príncipe, 526 - Boa Vista, Recife - PE',
    reason: 'Agressão física - Código Amarelo',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Rua+do+Principe+526+Boa+Vista+Recife+PE',
  },
  {
    id: 2,
    date: '28/09/2026 - 10:08',
    status: 'Pendente',
    address: 'Avenida Conselheiro Aguiar, 1748 - Boa Viagem, Recife - PE',
    reason: 'Ameaça - Código Roxo',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Avenida+Conselheiro+Aguiar+1748+Boa+Viagem+Recife+PE',
  },
  {
    id: 3,
    date: '28/09/2026 - 09:54',
    status: 'Pendente',
    address: 'Rua da Aurora, 295 - Boa Vista, Recife - PE',
    reason: 'Violência psicológica - Código Azul',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Rua+da+Aurora+295+Boa+Vista+Recife+PE',
  },
  {
    id: 4,
    date: '28/09/2026 - 09:32',
    status: 'Em Atendimento',
    address: 'Estrada do Encanamento, 721 - Casa Forte, Recife - PE',
    reason: 'Descumprimento de medida protetiva - Código Azul',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Estrada+do+Encanamento+721+Casa+Forte+Recife+PE',
  },
];

/**
 * Rota GET /api/reports
 * Retorna todos os chamados registrados.
 */
app.get('/api/reports', (req, res) => {
  res.json(reports);
});

/**
 * Rota POST /api/reports
 * Cadastra uma nova denúncia (enviada pela mulher ou pela polícia)
 * e notifica todos os clientes conectados via WebSocket imediatamente.
 */
app.post('/api/reports', (req, res) => {
  const newReport = {
    id: req.body.id || Date.now(),
    date: req.body.date,
    status: req.body.status || 'Pendente',
    address: req.body.address,
    reason: req.body.reason,
    mapsUrl: req.body.mapsUrl,
    hasSharedLocation: req.body.hasSharedLocation || false,
  };

  reports.unshift(newReport);

  // Emite evento em tempo real para os policiais conectados
  io.emit('new_report', newReport);

  res.status(201).json(newReport);
});

/**
 * Rota PATCH /api/reports/:id/status
 * Atualiza o status de atendimento da ocorrência (Ex.: 'Em Atendimento', 'Concluído')
 * e notifica todos os operadores conectados.
 */
app.patch('/api/reports/:id/status', (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body;

  const report = reports.find((r) => r.id === id);
  if (!report) {
    return res.status(404).json({ error: 'Chamado não encontrado' });
  }

  report.status = status;

  // Notifica todos os painéis policiais conectados sobre a atualização
  io.emit('update_report_status', { id, status });

  res.json(report);
});

/**
 * Conexões WebSocket
 */
io.on('connection', (socket) => {
  console.log(`[Socket.IO] Cliente conectado: ${socket.id}`);

  // Envia lista atualizada de chamados para o cliente que acabou de se conectar
  socket.emit('initial_reports', reports);

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Cliente desconectado: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`[Backend Denúncia] Servidor em execução na porta ${PORT}`);
  console.log(`API REST:    http://localhost:${PORT}/api/reports`);
  console.log(`WebSocket:   ws://localhost:${PORT}`);
  console.log(`======================================================\n`);
});
