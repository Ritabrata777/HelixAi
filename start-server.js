#!/usr/bin/env node

import { spawn } from 'child_process';

console.log('🚀 Starting HelixAI Backend Server...\n');

// Start the server
const serverProcess = spawn('node', ['server/server.js'], {
    stdio: 'inherit',
    cwd: process.cwd()
});

serverProcess.on('error', (error) => {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
});

serverProcess.on('close', (code) => {
    console.log(`\n📡 Server process exited with code ${code}`);
    process.exit(code);
});

// Handle Ctrl+C
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    serverProcess.kill('SIGINT');
});