import express from 'express';
import path from 'path';
import http from 'http';
import fs from 'fs';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';

// Import initial data from mockData
import {
  INITIAL_EQUIPMENT,
  INITIAL_MAINTENANCE,
  INITIAL_USAGE_LOGS,
  INITIAL_NOTIFICATIONS
} from './src/mockData';

const PORT = 3000;
const DB_FILE = path.join(process.cwd(), 'db.json');

const INITIAL_SETTINGS = {
  appName: 'LabCalib',
  appSubtitle: 'Metrologi Lab',
  appLogo: '🔧',
  sidebarBg: 'midnight',
  sidebarOpacity: '85',
  sidebarBlur: 'md'
};

// Database helper functions
function readDb() {
  if (!fs.existsSync(DB_FILE)) {
    const initialData = {
      equipment: INITIAL_EQUIPMENT,
      maintenance: INITIAL_MAINTENANCE,
      usageLogs: INITIAL_USAGE_LOGS,
      notifications: INITIAL_NOTIFICATIONS,
      settings: INITIAL_SETTINGS
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
  try {
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error reading db.json, resetting to defaults:', error);
    const initialData = {
      equipment: INITIAL_EQUIPMENT,
      maintenance: INITIAL_MAINTENANCE,
      usageLogs: INITIAL_USAGE_LOGS,
      notifications: INITIAL_NOTIFICATIONS,
      settings: INITIAL_SETTINGS
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
}

function writeDb(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing to db.json:', error);
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '100mb' }));

  // Create HTTP server
  const server = http.createServer(app);

  // Initialize WebSocket server on the same HTTP server
  const wss = new WebSocketServer({ server });

  // Store active socket clients
  const activeClients = new Set<WebSocket>();

  wss.on('connection', (ws) => {
    activeClients.add(ws);

    // Send current state as initial sync upon connection
    try {
      const db = readDb();
      ws.send(JSON.stringify({
        type: 'STATE_UPDATED',
        data: db
      }));
    } catch (err) {
      console.error('Error sending initial WS state:', err);
    }

    ws.on('close', () => {
      activeClients.delete(ws);
    });

    ws.on('error', (err) => {
      console.error('WebSocket client error:', err);
      activeClients.delete(ws);
    });
  });

  // Broadcast function to send updates to all clients except sender
  function broadcast(payload: any, excludeWs?: WebSocket) {
    const message = JSON.stringify(payload);
    for (const client of activeClients) {
      if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    }
  }

  // REST API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Get full database
  app.get('/api/data', (req, res) => {
    try {
      const db = readDb();
      res.json(db);
    } catch (error) {
      res.status(500).json({ error: 'Failed to read database' });
    }
  });

  // Save partial or full state updates
  app.post('/api/save-state', (req, res) => {
    try {
      const db = readDb();
      const updates = req.body;

      if (updates.equipment !== undefined) db.equipment = updates.equipment;
      if (updates.maintenance !== undefined) db.maintenance = updates.maintenance;
      if (updates.usageLogs !== undefined) db.usageLogs = updates.usageLogs;
      if (updates.notifications !== undefined) db.notifications = updates.notifications;
      if (updates.settings !== undefined) {
        db.settings = { ...db.settings, ...updates.settings };
      }

      writeDb(db);

      // Find the active WebSocket connection to exclude if sent with client metadata (optional)
      // For simplicity, we can broadcast to all clients. If a client receives its own change,
      // it is naturally idempotent since it matches its local state.
      broadcast({
        type: 'STATE_UPDATED',
        data: {
          equipment: updates.equipment,
          maintenance: updates.maintenance,
          usageLogs: updates.usageLogs,
          notifications: updates.notifications,
          settings: updates.settings
        }
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Error saving state:', error);
      res.status(500).json({ error: 'Failed to save state' });
    }
  });

  // Integrate Vite Dev Server Middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
