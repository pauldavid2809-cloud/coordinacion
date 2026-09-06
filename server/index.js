import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import os from 'os';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { ElectionManager } from './electionManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json({ limit: '15mb' }));

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Serve uploads
app.use('/uploads', express.static(UPLOADS_DIR));

// Configure Multer for candidate photos
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `candidato_${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

// Initialize Election Manager
const electionManager = new ElectionManager(io);

// Get primary local IPv4 address
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const PORT = process.env.PORT || 3001;
const LOCAL_IP = getLocalIp();

// --- REST Endpoints ---
app.get('/api/seminaristas', (req, res) => {
  res.json(electionManager.seminaristas);
});

app.get('/api/state', (req, res) => {
  res.json(electionManager.getPublicState());
});

app.get('/api/network-info', (req, res) => {
  const isProd = fs.existsSync(path.join(__dirname, '..', 'dist'));
  const clientPort = isProd ? PORT : 5173;
  res.json({
    localIp: LOCAL_IP,
    backendPort: PORT,
    frontendPort: clientPort,
    voteUrl: `http://${LOCAL_IP}:${clientPort}/votar`,
    tvUrl: `http://${LOCAL_IP}:${clientPort}/tv`,
    adminUrl: `http://${LOCAL_IP}:${clientPort}/admin`
  });
});

app.post('/api/upload-photo', upload.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se subió ninguna imagen' });
  }
  const photoUrl = `/uploads/${req.file.filename}`;
  const candidateId = req.body.candidateId;
  if (candidateId) {
    electionManager.updateCandidatePhoto(candidateId, photoUrl);
  }
  res.json({ success: true, photoUrl });
});

// Alternative REST endpoint for mobile voting
app.post('/api/vote', (req, res) => {
  const result = electionManager.castVote(req.body);
  if (result.error) {
    return res.status(400).json(result);
  }
  res.json(result);
});

// REST endpoint to reset election
app.post('/api/reset', (req, res) => {
  const result = electionManager.resetElection();
  res.json(result);
});

// --- WebSockets ---
io.on('connection', (socket) => {
  // Send state immediately on connection
  socket.emit('election:state', electionManager.getPublicState());

  socket.on('election:get_state', () => {
    socket.emit('election:state', electionManager.getPublicState());
  });

  socket.on('election:update_config', (data, callback) => {
    const res = electionManager.updateConfig(data);
    if (callback) callback(res);
  });

  socket.on('election:start_round_1', (callback) => {
    const res = electionManager.startRound1();
    if (callback) callback(res);
  });

  socket.on('election:trigger_suspense', ({ round }, callback) => {
    const res = electionManager.triggerSuspense(round || 1);
    if (callback) callback(res);
  });

  socket.on('election:reveal_results', ({ round }, callback) => {
    const res = electionManager.revealResults(round || 1);
    if (callback) callback(res);
  });

  socket.on('election:start_round_2', (callback) => {
    const res = electionManager.startRound2();
    if (callback) callback(res);
  });

  socket.on('election:go_to_coordinations', (callback) => {
    const res = electionManager.goToCoordinations();
    if (callback) callback(res);
  });

  socket.on('election:cast_vote', (data, callback) => {
    const res = electionManager.castVote(data);
    if (callback) callback(res);
  });

  socket.on('coordination:assign', ({ seminaristaId, coordinationKey }, callback) => {
    const res = electionManager.assignSeminaristaToCoordination(seminaristaId, coordinationKey);
    if (callback) callback(res);
  });

  socket.on('coordination:set_coordinator', ({ coordinationKey, seminaristaId }, callback) => {
    const res = electionManager.setAreaCoordinator(coordinationKey, seminaristaId);
    if (callback) callback(res);
  });

  socket.on('election:reset', (callback) => {
    const res = electionManager.resetElection();
    if (callback) callback(res);
  });
});

// Serve compiled frontend if dist directory exists
const DIST_DIR = path.join(__dirname, '..', 'dist');
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/socket.io')) {
      return next();
    }
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

server.listen(PORT, '0.0.0.0', () => {
  const isProd = fs.existsSync(DIST_DIR);
  const clientPort = isProd ? PORT : 5173;
  console.log(`\n======================================================`);
  console.log(`🏛️  SISTEMA ELECTORAL - SEMINARIO MAYOR SANTO TOMÁS DE AQUINO`);
  console.log(`======================================================`);
  console.log(`📡 Servidor Backend activo en: http://localhost:${PORT}`);
  console.log(`🌐 IP de Red Local: http://${LOCAL_IP}:${PORT}`);
  console.log(`📺 Enlace para el Televisor: http://${LOCAL_IP}:${clientPort}/tv`);
  console.log(`📱 Enlace para Votación Móvil: http://${LOCAL_IP}:${clientPort}/votar`);
  console.log(`📱 Enlace para Tablet del Padre: http://${LOCAL_IP}:${clientPort}/admin`);
  console.log(`======================================================\n`);
});
