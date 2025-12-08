// tests/integration.test.js
const request = require('supertest');
const WebSocket = require('ws');
const { app, server } = require('../backend/server');

describe('Coding Interview Platform Integration Tests', () => {
  let sessionId;

  afterAll((done) => {
    server.close(done);
  });

  describe('Session Management', () => {
    test('should create a new session', async () => {
      const response = await request(app)
        .post('/api/sessions')
        .expect(200);

      expect(response.body).toHaveProperty('sessionId');
      expect(response.body.sessionId).toBeTruthy();
      sessionId = response.body.sessionId;
    });

    test('should retrieve an existing session', async () => {
      const response = await request(app)
        .get(`/api/sessions/${sessionId}`)
        .expect(200);

      expect(response.body).toHaveProperty('sessionId', sessionId);
      expect(response.body).toHaveProperty('code');
      expect(response.body).toHaveProperty('language');
    });

    test('should return 404 for non-existent session', async () => {
      const response = await request(app)
        .get('/api/sessions/invalid-id')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    test('should check health endpoint', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
    });
  });

  describe('WebSocket Communication', () => {
    let ws1, ws2;

    beforeEach(async () => {
      // Create a new session for WebSocket tests
      const response = await request(app).post('/api/sessions');
      sessionId = response.body.sessionId;
    });

    afterEach(() => {
      if (ws1) ws1.close();
      if (ws2) ws2.close();
    });

    test('should establish WebSocket connection', (done) => {
      ws1 = new WebSocket('ws://localhost:3001');

      ws1.on('open', () => {
        expect(ws1.readyState).toBe(WebSocket.OPEN);
        done();
      });
    });

    test('should join session and receive initial state', (done) => {
      ws1 = new WebSocket('ws://localhost:3001');

      ws1.on('open', () => {
        ws1.send(JSON.stringify({
          type: 'join',
          sessionId: sessionId
        }));
      });

      ws1.on('message', (data) => {
        const message = JSON.parse(data);
        expect(message.type).toBe('init');
        expect(message).toHaveProperty('code');
        expect(message).toHaveProperty('language');
        done();
      });
    });

    test('should broadcast code changes to other clients', (done) => {
      const testCode = 'console.log("Hello World");';
      let clientsConnected = 0;

      ws1 = new WebSocket('ws://localhost:3001');
      ws2 = new WebSocket('ws://localhost:3001');

      const onConnect = () => {
        clientsConnected++;
        if (clientsConnected === 2) {
          // Both connected, send code change from ws1
          ws1.send(JSON.stringify({
            type: 'code_change',
            code: testCode
          }));
        }
      };

      ws1.on('open', () => {
        ws1.send(JSON.stringify({ type: 'join', sessionId }));
        onConnect();
      });

      ws2.on('open', () => {
        ws2.send(JSON.stringify({ type: 'join', sessionId }));
        onConnect();
      });

      // Skip init messages
      let ws1InitReceived = false;
      let ws2InitReceived = false;

      ws1.on('message', (data) => {
        const message = JSON.parse(data);
        if (message.type === 'init') {
          ws1InitReceived = true;
        }
      });

      ws2.on('message', (data) => {
        const message = JSON.parse(data);
        if (message.type === 'init') {
          ws2InitReceived = true;
        } else if (message.type === 'code_update' && ws2InitReceived) {
          expect(message.code).toBe(testCode);
          done();
        }
      });
    });

    test('should broadcast language changes', (done) => {
      ws1 = new WebSocket('ws://localhost:3001');
      ws2 = new WebSocket('ws://localhost:3001');

      let clientsConnected = 0;
      let ws2InitReceived = false;

      const onConnect = () => {
        clientsConnected++;
        if (clientsConnected === 2) {
          ws1.send(JSON.stringify({
            type: 'language_change',
            language: 'python'
          }));
        }
      };

      ws1.on('open', () => {
        ws1.send(JSON.stringify({ type: 'join', sessionId }));
        onConnect();
      });

      ws2.on('open', () => {
        ws2.send(JSON.stringify({ type: 'join', sessionId }));
        onConnect();
      });

      ws2.on('message', (data) => {
        const message = JSON.parse(data);
        if (message.type === 'init') {
          ws2InitReceived = true;
        } else if (message.type === 'language_update' && ws2InitReceived) {
          expect(message.language).toBe('python');
          done();
        }
      });
    });
  });
});
