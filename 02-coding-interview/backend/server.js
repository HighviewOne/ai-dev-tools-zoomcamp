// backend/server.js
const express = require('express');
const { WebSocketServer } = require('ws');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Store active sessions
const sessions = new Map();

// Create session endpoint
app.post('/api/sessions', (req, res) => {
  const sessionId = uuidv4();
  sessions.set(sessionId, {
    id: sessionId,
    code: '// Start coding here...',
    language: 'javascript',
    clients: new Set()
  });
  res.json({ sessionId });
});

// Get session endpoint
app.get('/api/sessions/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const session = sessions.get(sessionId);
  
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  res.json({
    sessionId: session.id,
    code: session.code,
    language: session.language
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// WebSocket server
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  let currentSessionId = null;

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);

      switch (data.type) {
        case 'join':
          currentSessionId = data.sessionId;
          const session = sessions.get(currentSessionId);
          
          if (session) {
            session.clients.add(ws);
            ws.send(JSON.stringify({
              type: 'init',
              code: session.code,
              language: session.language
            }));
          }
          break;

        case 'code_change':
          if (currentSessionId) {
            const session = sessions.get(currentSessionId);
            if (session) {
              session.code = data.code;
              // Broadcast to all clients except sender
              session.clients.forEach(client => {
                if (client !== ws && client.readyState === 1) {
                  client.send(JSON.stringify({
                    type: 'code_update',
                    code: data.code
                  }));
                }
              });
            }
          }
          break;

        case 'language_change':
          if (currentSessionId) {
            const session = sessions.get(currentSessionId);
            if (session) {
              session.language = data.language;
              // Broadcast to all clients
              session.clients.forEach(client => {
                if (client.readyState === 1) {
                  client.send(JSON.stringify({
                    type: 'language_update',
                    language: data.language
                  }));
                }
              });
            }
          }
          break;
      }
    } catch (error) {
      console.error('WebSocket error:', error);
    }
  });

  ws.on('close', () => {
    if (currentSessionId) {
      const session = sessions.get(currentSessionId);
      if (session) {
        session.clients.delete(ws);
      }
    }
  });
});

module.exports = { app, server };
