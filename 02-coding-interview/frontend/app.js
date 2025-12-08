// frontend/src/App.jsx
import { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';

function App() {
  const [sessionId, setSessionId] = useState('');
  const [code, setCode] = useState('// Start coding here...');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);
  const editorRef = useRef(null);
  const pyodideRef = useRef(null);

  // Initialize Pyodide for Python execution
  useEffect(() => {
    if (language === 'python') {
      loadPyodide();
    }
  }, [language]);

  const loadPyodide = async () => {
    try {
      const { loadPyodide } = await import('pyodide');
      pyodideRef.current = await loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/'
      });
    } catch (error) {
      console.error('Failed to load Pyodide:', error);
    }
  };

  // Create new session
  const createSession = async () => {
    try {
      const response = await fetch(`${API_URL}/api/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      setSessionId(data.sessionId);
      connectWebSocket(data.sessionId);
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  // Join existing session
  const joinSession = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/sessions/${id}`);
      if (response.ok) {
        const data = await response.json();
        setSessionId(id);
        setCode(data.code);
        setLanguage(data.language);
        connectWebSocket(id);
      } else {
        alert('Session not found');
      }
    } catch (error) {
      console.error('Failed to join session:', error);
    }
  };

  // WebSocket connection
  const connectWebSocket = (id) => {
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      setConnected(true);
      ws.send(JSON.stringify({ type: 'join', sessionId: id }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'init':
          setCode(data.code);
          setLanguage(data.language);
          break;
        case 'code_update':
          setCode(data.code);
          break;
        case 'language_update':
          setLanguage(data.language);
          break;
      }
    };

    ws.onclose = () => {
      setConnected(false);
    };

    wsRef.current = ws;
  };

  // Handle code changes
  const handleCodeChange = (value) => {
    setCode(value);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'code_change',
        code: value
      }));
    }
  };

  // Handle language change
  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'language_change',
        language: newLang
      }));
    }
  };

  // Execute code
  const executeCode = async () => {
    setIsExecuting(true);
    setOutput('');

    try {
      if (language === 'javascript') {
        // Capture console.log
        const logs = [];
        const originalLog = console.log;
        console.log = (...args) => logs.push(args.join(' '));

        try {
          // eslint-disable-next-line no-eval
          eval(code);
          setOutput(logs.join('\n') || 'Execution completed successfully');
        } catch (error) {
          setOutput(`Error: ${error.message}`);
        } finally {
          console.log = originalLog;
        }
      } else if (language === 'python') {
        if (!pyodideRef.current) {
          setOutput('Loading Python environment...');
          await loadPyodide();
        }

        if (pyodideRef.current) {
          try {
            const result = await pyodideRef.current.runPythonAsync(code);
            setOutput(result !== undefined ? String(result) : 'Execution completed successfully');
          } catch (error) {
            setOutput(`Error: ${error.message}`);
          }
        }
      }
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  // Copy session link
  const copySessionLink = () => {
    const link = `${window.location.origin}?session=${sessionId}`;
    navigator.clipboard.writeText(link);
    alert('Link copied to clipboard!');
  };

  // Check for session in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const session = params.get('session');
    if (session) {
      joinSession(session);
    }
  }, []);

  return (
    <div className="app">
      <header className="header">
        <h1>🚀 Collaborative Coding Interview</h1>
        <div className="status">
          <span className={connected ? 'connected' : 'disconnected'}>
            {connected ? '● Connected' : '○ Disconnected'}
          </span>
        </div>
      </header>

      {!sessionId ? (
        <div className="welcome">
          <h2>Welcome to Collaborative Coding</h2>
          <div className="actions">
            <button onClick={createSession} className="btn-primary">
              Create New Session
            </button>
            <div className="join-session">
              <input
                type="text"
                placeholder="Enter session ID to join"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    joinSession(e.target.value);
                  }
                }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="workspace">
          <div className="toolbar">
            <div className="session-info">
              <span>Session: {sessionId.substring(0, 8)}...</span>
              <button onClick={copySessionLink} className="btn-small">
                📋 Copy Link
              </button>
            </div>
            <div className="language-selector">
              <label>Language: </label>
              <select value={language} onChange={handleLanguageChange}>
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
              </select>
            </div>
            <button 
              onClick={executeCode} 
              disabled={isExecuting}
              className="btn-primary"
            >
              {isExecuting ? '⏳ Running...' : '▶️ Run Code'}
            </button>
          </div>

          <div className="editor-container">
            <Editor
              height="60vh"
              language={language}
              value={code}
              onChange={handleCodeChange}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                roundedSelection: false,
                scrollBeyondLastLine: false,
                automaticLayout: true
              }}
            />
          </div>

          {output && (
            <div className="output">
              <h3>Output:</h3>
              <pre>{output}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
