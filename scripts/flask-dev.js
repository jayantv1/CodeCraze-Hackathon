#!/usr/bin/env node
const { spawn } = require('node:child_process');
const { existsSync } = require('node:fs');
const path = require('node:path');

const projectRoot = process.cwd();
const venvDir = path.join(projectRoot, '.venv');
let pythonPath;

if (process.platform === 'win32') {
    const candidate = path.join(venvDir, 'Scripts', 'python.exe');
    if (existsSync(candidate)) pythonPath = candidate;
} else {
    const candidate = path.join(venvDir, 'bin', 'python');
    if (existsSync(candidate)) pythonPath = candidate;
}

if (!pythonPath) {
    // Fallbacks
    pythonPath = process.platform === 'win32' ? 'python' : 'python3';
    console.warn('[flask-dev] Could not find .venv python, falling back to', pythonPath);
}

const env = { ...process.env, FLASK_DEBUG: '1', FLASK_APP: 'api/index' };

const args = ['-m', 'flask', 'run', '-p', '5328'];

console.log('[flask-dev] Using', pythonPath, args.join(' '));

const child = spawn(pythonPath, args, { env, stdio: 'inherit' });

child.on('exit', (code, signal) => {
    if (signal) {
        console.log('[flask-dev] Flask exited via signal', signal);
        process.exit(0);
    }
    process.exit(code ?? 0);
});
