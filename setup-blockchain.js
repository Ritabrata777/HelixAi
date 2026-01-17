#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔧 HelixAI Blockchain Setup\n');

// Check if .env exists
if (!fs.existsSync('.env')) {
    console.log('📝 Creating .env file from template...');
    fs.copyFileSync('.env.example', '.env');
    console.log('✅ .env file created. Please update with your values.\n');
}

// Check if contract is compiled
const artifactPath = './artifacts/contracts/SampleTracker.sol/SampleTracker.json';
if (!fs.existsSync(artifactPath)) {
    console.log('🔨 Compiling smart contract...');
    try {
        execSync('npx hardhat compile', { stdio: 'inherit' });
        console.log('✅ Contract compiled successfully\n');
    } catch (error) {
        console.error('❌ Contract compilation failed');
        process.exit(1);
    }
} else {
    console.log('✅ Contract already compiled\n');
}

// Check environment variables
const requiredEnvVars = [
    'REACT_APP_POLYGON_AMOY_RPC',
    'REACT_APP_CONTRACT_ADDRESS',
    'REACT_APP_API_URL'
];

console.log('🔍 Checking environment variables...');
const envContent = fs.readFileSync('.env', 'utf8');
const missingVars = [];

requiredEnvVars.forEach(varName => {
    if (!envContent.includes(`${varName}=`) || envContent.includes(`${varName}=\n`)) {
        missingVars.push(varName);
    }
});

if (missingVars.length > 0) {
    console.log('⚠️  Missing environment variables:');
    missingVars.forEach(varName => {
        console.log(`   - ${varName}`);
    });
    console.log('\n📝 Please update your .env file with the missing values.');
    
    if (missingVars.includes('REACT_APP_CONTRACT_ADDRESS')) {
        console.log('\n🚀 To deploy the contract, run:');
        console.log('   node scripts/deploy.js');
    }
} else {
    console.log('✅ All environment variables configured\n');
}

console.log('🎯 Setup complete! Next steps:');
console.log('   1. Start backend: node start-server.js');
console.log('   2. Start frontend: npm start');
console.log('   3. Connect MetaMask to Polygon Amoy Testnet');
console.log('   4. Get test MATIC from: https://faucet.polygon.technology/');