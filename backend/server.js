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
    notes: 'Vítima informa que agressor está na frente do imóvel.',
    statusHistory: [
      { status: 'Pendente', timestamp: '28/09/2026 - 10:15', by: 'Sistema (App Mulher)' }
    ]
  },
  {
    id: 2,
    date: '28/09/2026 - 10:08',
    status: 'Pendente',
    address: 'Avenida Conselheiro Aguiar, 1748 - Boa Viagem, Recife - PE',
    reason: 'Ameaça - Código Roxo',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Avenida+Conselheiro+Aguiar+1748+Boa+Viagem+Recife+PE',
    notes: 'Histórico de ameaças reiteradas por mensagem.',
    statusHistory: [
      { status: 'Pendente', timestamp: '28/09/2026 - 10:08', by: 'Sistema (App Mulher)' }
    ]
  },
  {
    id: 3,
    date: '28/09/2026 - 09:54',
    status: 'Concluído',
    address: 'Rua da Aurora, 295 - Boa Vista, Recife - PE',
    reason: 'Violência psicológica - Código Azul',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Rua+da+Aurora+295+Boa+Vista+Recife+PE',
    notes: 'Viatura 1204 no local, prestado acolhimento e lavrado BO.',
    statusHistory: [
      { status: 'Pendente', timestamp: '28/09/2026 - 09:54', by: 'Sistema (App Mulher)' },
      { status: 'Em Atendimento', timestamp: '28/09/2026 - 10:02', by: 'Central Policial (Despacho Viatura)' },
      { status: 'Concluído', timestamp: '28/09/2026 - 10:45', by: 'Central Policial (Conclusão)' }
    ]
  },
  {
    id: 4,
    date: '28/09/2026 - 09:32',
    status: 'Em Atendimento',
    address: 'Estrada do Encanamento, 721 - Casa Forte, Recife - PE',
    reason: 'Descumprimento de medida protetiva - Código Azul',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Estrada+do+Encanamento+721+Casa+Forte+Recife+PE',
    notes: 'Viatura 1008 a caminho.',
    statusHistory: [
      { status: 'Pendente', timestamp: '28/09/2026 - 09:32', by: 'Sistema (App Mulher)' },
      { status: 'Em Atendimento', timestamp: '28/09/2026 - 09:38', by: 'Central Policial (Despacho Viatura)' }
    ]
  },
];

/**
 * Operadores autorizados na Central de Atendimento.
 */
const OPERATORS = [
  { id: '1', username: 'central190', password: '123', name: 'Agente Silva', role: 'Operador de Despacho' },
  { id: '2', username: 'admin', password: 'admin', name: 'Capitã Roberta', role: 'Supervisora Geral' },
];

/**
 * Rota POST /api/login
 * Autentica operadores da central de atendimento.
 */
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = OPERATORS.find(
    (u) => u.username.toLowerCase() === (username || '').trim().toLowerCase() && u.password === (password || '').trim()
  );

  if (!user) {
    return res.status(401).json({ error: 'Credenciais inválidas. Verifique usuário e senha.' });
  }

  // Gera token simples para a sessão
  res.json({
    id: user.id,
    name: user.name,
    role: user.role,
    username: user.username,
    token: `token_${user.username}_${Date.now()}`
  });
});

/**
 * Rota GET /api/reports
 * Retorna todos os chamados registrados.
 */
app.get('/api/reports', (req, res) => {
  res.json(reports);
});

/**
 * Rota GET /api/reports/:id
 * Retorna um chamado específico (usado pela vítima para consultar seu protocolo).
 */
app.get('/api/reports/:id', (req, res) => {
  const id = Number(req.params.id);
  const report = reports.find((r) => r.id === id);
  if (!report) {
    return res.status(404).json({ error: 'Ocorrência não encontrada com o protocolo informado.' });
  }
  res.json(report);
});

/**
 * Rota POST /api/reports
 * Cadastra uma nova denúncia (enviada pela mulher ou pela polícia)
 * e notifica todos os clientes conectados via WebSocket imediatamente.
 */
app.post('/api/reports', (req, res) => {
  const now = new Date();
  const timestampStr = `${now.toLocaleDateString('pt-BR')} - ${now.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;

  const newReport = {
    id: req.body.id || Date.now(),
    date: req.body.date || timestampStr,
    status: req.body.status || 'Pendente',
    address: req.body.address,
    reason: req.body.reason,
    mapsUrl: req.body.mapsUrl,
    hasSharedLocation: req.body.hasSharedLocation || false,
    notes: req.body.notes || '',
    statusHistory: [
      {
        status: req.body.status || 'Pendente',
        timestamp: req.body.date || timestampStr,
        by: req.body.origin || 'App Mulher (Denúncia enviada)'
      }
    ]
  };

  reports.unshift(newReport);

  // Emite evento em tempo real para os clientes conectados
  io.emit('new_report', newReport);

  res.status(201).json(newReport);
});

/**
 * Rota PATCH /api/reports/:id/status
 * Atualiza o status de atendimento da ocorrência (Ex.: 'Em Atendimento', 'Concluído')
 * e notifica todos os operadores e vítimas conectadas.
 */
app.patch('/api/reports/:id/status', (req, res) => {
  const id = Number(req.params.id);
  const { status, operatorName, notes } = req.body;

  const report = reports.find((r) => r.id === id);
  if (!report) {
    return res.status(404).json({ error: 'Chamado não encontrado' });
  }

  const now = new Date();
  const timestampStr = `${now.toLocaleDateString('pt-BR')} - ${now.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;

  report.status = status;
  if (notes) {
    report.notes = notes;
  }

  if (!report.statusHistory) {
    report.statusHistory = [];
  }

  const historyEntry = {
    status,
    timestamp: timestampStr,
    by: operatorName || 'Central Policial'
  };
  report.statusHistory.push(historyEntry);

  // Notifica todos os painéis e apps conectados sobre a atualização
  io.emit('update_report_status', { id, status, statusHistory: report.statusHistory });

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
