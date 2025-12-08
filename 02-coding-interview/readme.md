# Collaborative Coding Interview Platform

A real-time collaborative coding platform for conducting technical interviews with multiple participants.

## Features

- 🔗 **Shareable Session Links** - Create unique sessions and share with candidates
- ⚡ **Real-time Collaboration** - Multiple users can edit code simultaneously
- 🎨 **Syntax Highlighting** - Support for JavaScript and Python with Monaco Editor
- 🚀 **Code Execution** - Run code safely in the browser using WASM
- 🔄 **Live Updates** - Changes sync instantly across all connected clients

## Tech Stack

- **Frontend**: React + Vite, Monaco Editor, Pyodide
- **Backend**: Express.js, WebSockets (ws)
- **Real-time**: WebSocket for bidirectional communication
- **Code Execution**: JavaScript (eval), Python (Pyodide/WASM)

## Prerequisites

- Node.js 18+ 
- npm or yarn

## Installation

### Clone the repository

```bash
git clone <your-repo-url>
cd coding-interview-platform
```

### Install dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

## Running the Application

### Development Mode

Run both frontend and backend concurrently:

```bash
npm run dev
```

This will start:
- Backend server on http://localhost:3001
- Frontend dev server on http://localhost:5173

### Production Mode

```bash
# Build frontend
cd frontend
npm run build
cd ..

# Start backend server
npm start
```

## Testing

### Run Integration Tests

```bash
npm test
```

The tests cover:
- Session creation and retrieval
- WebSocket connections
- Real-time code synchronization
- Language switching

## Docker Deployment

### Build Docker Image

```bash
docker build -t coding-interview-platform .
```

### Run Docker Container

```bash
docker run -p 3001:3001 coding-interview-platform
```

Access the application at http://localhost:3001

## Usage

1. **Create a Session**
   - Click "Create New Session" on the homepage
   - A unique session ID will be generated

2. **Share the Link**
   - Click "Copy Link" to copy the session URL
   - Share it with other participants

3. **Collaborate**
   - All participants can edit code in real-time
   - Select language (JavaScript or Python)
   - Run code to see output

4. **Execute Code**
   - Click "Run Code" to execute in the browser
   - JavaScript uses native eval
   - Python uses Pyodide (WebAssembly)

## Project Structure

```
coding-interview-platform/
├── backend/
│   ├── server.js           # Express + WebSocket server
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx         # Main React component
│   │   ├── main.jsx
│   │   └── App.css
│   ├── package.json
│   └── vite.config.js
├── tests/
│   └── integration.test.js
├── Dockerfile
├── package.json            # Root package with scripts
└── README.md
```

## Environment Variables

Create `.env` files if needed:

**Backend (.env)**
```
PORT=3001
```

**Frontend (.env)**
```
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
```

## API Endpoints

### REST API

- `POST /api/sessions` - Create a new session
- `GET /api/sessions/:sessionId` - Get session details
- `GET /health` - Health check

### WebSocket Events

**Client → Server**
- `join` - Join a session
- `code_change` - Update code
- `language_change` - Change programming language

**Server → Client**
- `init` - Initial session state
- `code_update` - Code changed by another user
- `language_update` - Language changed by another user

## Libraries Used

### Syntax Highlighting
- **@monaco-editor/react** (v4.6.0) - Monaco Editor React wrapper
  - Same editor that powers VS Code
  - Built-in syntax highlighting for 100+ languages
  - IntelliSense and autocomplete

### Code Execution
- **Pyodide** (v0.24.1) - Python runtime compiled to WebAssembly
  - Runs Python directly in the browser
  - No server-side execution needed
  - Includes scientific Python packages

## Deployment Options

### Recommended Services

1. **Railway** (Easiest)
   - Connect GitHub repository
   - Auto-deploy on push
   - Free tier available

2. **Render**
   - Free web services
   - Auto-deploy from Git
   - Supports Docker

3. **Heroku**
   - Easy setup with CLI
   - Free tier (with limitations)

4. **DigitalOcean App Platform**
   - $5/month starter
   - Auto-scaling

5. **AWS ECS / Fargate**
   - Most scalable
   - Pay per use

### Deployment Steps (Railway Example)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

## Contributing

Feel free to open issues or submit pull requests!

## License

MIT

## Acknowledgments

Built as part of the AI Dev Tools Zoomcamp by DataTalks.Club