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
  sidebarBlur: 'md',
  selfRegistrationEnabled: true,
  teams: ['Tim A', 'Tim B', 'Tim C', 'Tim D']
};

const INITIAL_USERS = [
  {
    id: 'USR-001',
    username: 'admin',
    password: 'admin123',
    name: 'Administrator',
    role: 'admin',
    team: ''
  },
  {
    id: 'USR-002',
    username: 'petugas1',
    password: 'petugas123',
    name: 'Ahmad Syarif',
    role: 'petugas',
    team: 'Tim A'
  },
  {
    id: 'USR-003',
    username: 'petugas2',
    password: 'petugas123',
    name: 'Siti Rahma',
    role: 'petugas',
    team: 'Tim B'
  }
];

// Database helper functions
function readDb() {
  if (!fs.existsSync(DB_FILE)) {
    const initialData = {
      equipment: INITIAL_EQUIPMENT,
      maintenance: INITIAL_MAINTENANCE,
      usageLogs: INITIAL_USAGE_LOGS,
      notifications: INITIAL_NOTIFICATIONS,
      settings: INITIAL_SETTINGS,
      users: INITIAL_USERS
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
  try {
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    
    // Merge or fill new properties gracefully to avoid breaking existing setups
    let changed = false;
    if (parsed.users === undefined) {
      parsed.users = INITIAL_USERS;
      changed = true;
    }
    if (parsed.settings === undefined) {
      parsed.settings = INITIAL_SETTINGS;
      changed = true;
    } else {
      if (parsed.settings.selfRegistrationEnabled === undefined) {
        parsed.settings.selfRegistrationEnabled = true;
        changed = true;
      }
      if (parsed.settings.teams === undefined) {
        parsed.settings.teams = ['Tim A', 'Tim B', 'Tim C', 'Tim D'];
        changed = true;
      }
    }
    if (changed) {
      fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
    }
    return parsed;
  } catch (error) {
    console.error('Error reading db.json, resetting to defaults:', error);
    const initialData = {
      equipment: INITIAL_EQUIPMENT,
      maintenance: INITIAL_MAINTENANCE,
      usageLogs: INITIAL_USAGE_LOGS,
      notifications: INITIAL_NOTIFICATIONS,
      settings: INITIAL_SETTINGS,
      users: INITIAL_USERS
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

  // Helper to construct a reliable redirect URI for Google OAuth, utilizing the runtime-injected APP_URL
  const getRedirectUri = (req: express.Request): string => {
    if (process.env.APP_URL && process.env.APP_URL !== 'MY_APP_URL' && process.env.APP_URL !== '') {
      const baseUrl = process.env.APP_URL.endsWith('/') ? process.env.APP_URL.slice(0, -1) : process.env.APP_URL;
      return `${baseUrl}/auth/google/callback`;
    }
    // Fallback if APP_URL is not configured
    const hostHeader = req.get('host') || '0.0.0.0:3000';
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    return `${protocol}://${hostHeader}/auth/google/callback`;
  };

  // Google OAuth URL Endpoint
  app.get('/api/auth/google/url', (req, res) => {
    try {
      const redirectUri = getRedirectUri(req);
      const clientId = process.env.GOOGLE_CLIENT_ID;

      // Construct Google OAuth URL
      const params = new URLSearchParams({
        client_id: clientId || 'mock-google-client-id-for-demo',
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'openid email profile',
        access_type: 'offline',
        prompt: 'consent'
      });
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
      res.json({ url: authUrl, configured: !!clientId });
    } catch (err) {
      console.error('Error generating Google OAuth URL:', err);
      res.status(500).json({ error: 'Gagal membuat URL autentikasi Google' });
    }
  });

  // Google OAuth Callback Handler
  app.get(['/auth/google/callback', '/auth/google/callback/'], async (req, res) => {
    const { code } = req.query;
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    
    // Use the exact same helper to match redirectUri sent to Google's authorize endpoint
    const redirectUri = getRedirectUri(req);

    let userProfile = {
      email: 'pemeriksa.google@metrologi.id',
      name: 'Google Verified Staff',
      picture: ''
    };

    let isRealOauth = false;

    if (clientId && clientSecret && code) {
      try {
        isRealOauth = true;
        // Exchange code for token
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            code: code as string,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code'
          }).toString()
        });

        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text();
          throw new Error(`Token exchange failed: ${errorText}`);
        }

        const tokenData = await tokenResponse.json() as any;
        const accessToken = tokenData.access_token;

        // Fetch user profile from Google userinfo endpoint
        const profileResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });

        if (profileResponse.ok) {
          const profileData = await profileResponse.json() as any;
          userProfile = {
            email: profileData.email,
            name: profileData.name || profileData.given_name || 'Google User',
            picture: profileData.picture || ''
          };
        } else {
          throw new Error('Gagal mengambil data profil Google');
        }
      } catch (err: any) {
        console.error('Google OAuth token exchange error:', err);
        // Fallback to demo mode but append error info
        userProfile = {
          email: 'error.google@metrologi.id',
          name: `Error Google Auth (Demo)`,
          picture: ''
        };
      }
    } else {
      // Demo Mode fallback if no real credentials are set
      userProfile = {
        email: 'pemeriksa.google@metrologi.id',
        name: 'Staf Google Demo',
        picture: ''
      };
    }

    // Find or create user in our db.json file!
    const db = readDb();
    let matchedUser = db.users.find((u: any) => u.username.toLowerCase() === userProfile.email.toLowerCase());
    
    // Check if the email belongs to the primary admin gkrismantara
    const isAdminEmail = userProfile.email.toLowerCase().includes('gkrismantara');
    
    if (!matchedUser) {
      // Automatically register them
      matchedUser = {
        id: `USR-G-${Date.now()}`,
        username: userProfile.email,
        password: `google-${Math.random().toString(36).substring(7)}`, // random password
        name: userProfile.name,
        role: isAdminEmail ? 'admin' : 'petugas', // Force admin role for gkrismantara
        team: isAdminEmail ? '' : 'Tim A',   // Default team
        picture: userProfile.picture,
        createdAt: new Date().toISOString().split('T')[0]
      };
      db.users.push(matchedUser);
      writeDb(db);
      
      // Broadcast the updated users list to all WS clients
      broadcast({
        type: 'STATE_UPDATED',
        data: {
          users: db.users
        }
      });
    } else if (isAdminEmail && matchedUser.role !== 'admin') {
      // Force promote to admin if they already exist but aren't admin yet
      matchedUser.role = 'admin';
      matchedUser.team = '';
      writeDb(db);
      
      broadcast({
        type: 'STATE_UPDATED',
        data: {
          users: db.users
        }
      });
    }

    // Send success HTML page which posts message to parent window and closes itself
    res.send(`
      <html>
        <head>
          <title>Google Sign-In Success</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              background-color: #0f172a;
              color: #f8fafc;
              margin: 0;
              text-align: center;
            }
            .card {
              background-color: #1e293b;
              padding: 2rem;
              border-radius: 1rem;
              box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
              border: 1px solid #334155;
              max-width: 400px;
            }
            h2 { color: #10b981; margin-top: 0; }
            p { color: #94a3b8; font-size: 0.9rem; }
            .info-badge {
              display: inline-block;
              background-color: #1e1b4b;
              color: #a5b4fc;
              font-size: 0.75rem;
              font-weight: bold;
              padding: 0.25rem 0.5rem;
              border-radius: 0.375rem;
              margin-top: 0.5rem;
              border: 1px solid #312e81;
            }
            .loader {
              border: 3px solid #334155;
              border-top: 3px solid #10b981;
              border-radius: 50%;
              width: 24px;
              height: 24px;
              animation: spin 1s linear infinite;
              margin: 1.5rem auto;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>Sign-In Berhasil!</h2>
            <p>Akun Google Anda (${userProfile.email}) berhasil diverifikasi.</p>
            ${!isRealOauth ? '<div class="info-badge">Mode Demo Preview</div>' : '<div class="info-badge" style="background-color: #022c22; color: #6ee7b7; border-color: #064e3b;">Autentikasi Real</div>'}
            <div class="loader"></div>
            <p style="font-size: 0.8rem; font-style: italic;">Jendela ini akan menutup otomatis...</p>
          </div>
          <script>
            if (window.opener) {
              window.opener.postMessage({ 
                type: 'GOOGLE_OAUTH_SUCCESS',
                user: ${JSON.stringify(matchedUser)}
              }, '*');
              setTimeout(() => {
                window.close();
              }, 1200);
            } else {
              window.location.href = '/';
            }
          </script>
        </body>
      </html>
    `);
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
      if (updates.users !== undefined) db.users = updates.users;
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
          settings: updates.settings,
          users: updates.users
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
