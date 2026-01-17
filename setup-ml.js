#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🧬 HelixAI ML Setup');
console.log('==================');

const mlDir = path.join(__dirname, 'server', 'ml');

// Check if Python is available
function checkPython() {
    return new Promise((resolve) => {
        const python = spawn('python', ['--version']);
        python.on('close', (code) => {
            if (code === 0) {
                resolve('python');
            } else {
                const python3 = spawn('python3', ['--version']);
                python3.on('close', (code) => {
                    resolve(code === 0 ? 'python3' : null);
                });
            }
        });
    });
}

// Create virtual environment
function createVirtualEnv(pythonCmd) {
    return new Promise((resolve, reject) => {
        const venvPath = path.join(mlDir, '.venv');
        
        if (fs.existsSync(venvPath)) {
            console.log('✅ Virtual environment already exists');
            resolve();
            return;
        }
        
        console.log('\n🔧 Creating Python virtual environment...');
        
        const venv = spawn(pythonCmd, ['-m', 'venv', '.venv'], {
            cwd: mlDir,
            stdio: 'inherit'
        });
        
        venv.on('close', (code) => {
            if (code === 0) {
                console.log('✅ Virtual environment created');
                resolve();
            } else {
                reject(new Error('Failed to create virtual environment'));
            }
        });
    });
}

// Get virtual environment Python path
function getVenvPython() {
    const venvPath = path.join(mlDir, '.venv');
    const isWindows = process.platform === 'win32';
    
    if (isWindows) {
        return path.join(venvPath, 'Scripts', 'python.exe');
    } else {
        return path.join(venvPath, 'bin', 'python');
    }
}

// Install Python dependencies
function installDependencies(pythonCmd) {
    return new Promise((resolve, reject) => {
        console.log('\n📦 Installing Python dependencies...');
        
        const pip = spawn(pythonCmd, ['-m', 'pip', 'install', '-r', 'requirements.txt'], {
            cwd: mlDir,
            stdio: 'inherit'
        });
        
        pip.on('close', (code) => {
            if (code === 0) {
                console.log('✅ Dependencies installed successfully');
                resolve();
            } else {
                reject(new Error('Failed to install dependencies'));
            }
        });
    });
}

// Train the ML model
function trainModel(pythonCmd) {
    return new Promise((resolve, reject) => {
        console.log('\n🤖 Training Enhanced ML model...');
        console.log('   This may take several minutes due to advanced features...');
        
        const train = spawn(pythonCmd, ['train_enhanced_model.py'], {
            cwd: mlDir,
            stdio: 'inherit'
        });
        
        train.on('close', (code) => {
            if (code === 0) {
                console.log('✅ Enhanced model trained successfully');
                resolve();
            } else {
                // Fallback to basic model if enhanced training fails
                console.log('⚠️ Enhanced model training failed, trying basic model...');
                const basicTrain = spawn(pythonCmd, ['train_model.py'], {
                    cwd: mlDir,
                    stdio: 'inherit'
                });
                
                basicTrain.on('close', (basicCode) => {
                    if (basicCode === 0) {
                        console.log('✅ Basic model trained successfully');
                        resolve();
                    } else {
                        reject(new Error('Both enhanced and basic model training failed'));
                    }
                });
            }
        });
    });
}

// Main setup function
async function setup() {
    try {
        // Check Python availability
        console.log('\n🔍 Checking Python installation...');
        const pythonCmd = await checkPython();
        
        if (!pythonCmd) {
            console.error('❌ Python not found. Please install Python 3.7+ and try again.');
            process.exit(1);
        }
        
        console.log(`✅ Found ${pythonCmd}`);
        
        // Check if ML directory exists
        if (!fs.existsSync(mlDir)) {
            console.error('❌ ML directory not found');
            process.exit(1);
        }
        
        // Create virtual environment
        await createVirtualEnv(pythonCmd);
        
        // Use virtual environment Python
        const venvPython = getVenvPython();
        if (fs.existsSync(venvPython)) {
            console.log('🐍 Using virtual environment Python');
            pythonCmd = venvPython;
        }
        
        // Install dependencies
        await installDependencies(pythonCmd);
        
        // Train model
        await trainModel(pythonCmd);
        
        console.log('\n🎉 HelixAI ML setup complete!');
        console.log('\nNext steps:');
        console.log('1. Start the server: npm run server');
        console.log('2. Start the frontend: npm run dev');
        console.log('3. Navigate to the Lab Analysis page to test ML predictions');
        
    } catch (error) {
        console.error('\n❌ Setup failed:', error.message);
        console.log('\nTroubleshooting:');
        console.log('- Ensure Python 3.7+ is installed');
        console.log('- Check that pip is available');
        console.log('- Try running: pip install -r server/ml/requirements.txt');
        process.exit(1);
    }
}

setup();