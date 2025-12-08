# AI Agent Instructions for Git

Use these prompts to help with git operations throughout the homework.

## Initial Setup

```
Create a new git repository and make the first commit with the project structure.
```

## After Each Step

```
Review the changes I made and create a meaningful commit message for this step. 
The changes include: [describe what you did]
```

## Specific Git Commands

### Initialize Repository
```bash
git init
git add .
git commit -m "Initial commit: Project structure and setup"
```

### After Question 1 (Initial Implementation)
```bash
git add .
git commit -m "feat: Add initial frontend and backend implementation

- Create Express.js backend with WebSocket support
- Add React frontend with Vite
- Implement session management
- Add real-time code synchronization"
```

### After Question 2 (Integration Tests)
```bash
git add tests/
git add README.md
git commit -m "test: Add integration tests for client-server interaction

- Add Jest test suite
- Test session creation and retrieval
- Test WebSocket connections and broadcasting
- Update README with test commands"
```

### After Question 3 (Concurrently)
```bash
git add package.json
git commit -m "chore: Add concurrently for running client and server together

- Update root package.json with dev script
- Configure concurrent execution of frontend and backend"
```

### After Question 4 (Syntax Highlighting)
```bash
git add frontend/
git commit -m "feat: Add syntax highlighting with Monaco Editor

- Integrate @monaco-editor/react
- Support JavaScript and Python syntax highlighting
- Add language selector in UI"
```

### After Question 5 (Code Execution)
```bash
git add frontend/src/App.jsx
git commit -m "feat: Add code execution with Pyodide

- Implement JavaScript execution with eval
- Add Python execution using Pyodide (WASM)
- Display output in UI"
```

### After Question 6 (Containerization)
```bash
git add Dockerfile
git add .dockerignore
git commit -m "feat: Add Docker containerization

- Create Dockerfile with Node.js 18 Alpine
- Build frontend and backend in single container
- Configure production environment"
```

### After Question 7 (Deployment)
```bash
git add .
git commit -m "docs: Add deployment configuration and instructions

- Add deployment guide for Railway/Render/Heroku
- Update README with deployment steps
- Add environment variable documentation"
```

## Push to GitHub

```bash
# Create repository on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

## View Git Log

```bash
git log --oneline --graph --decorate --all
```

## Useful Git Commands

```bash
# Check status
git status

# View changes
git diff

# Unstage files
git reset HEAD <file>

# Amend last commit
git commit --amend

# Create branch
git checkout -b feature/new-feature

# Push tags
git tag v1.0.0
git push --tags
```