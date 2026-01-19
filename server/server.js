const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const { spawn } = require('child_process');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increased limit for PDF data

// MongoDB Connection
const MONGODB_URI = process.env.REACT_APP_MONGODB_URI || 'mongodb://localhost:27017/helixai';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// Models
const SampleSchema = new mongoose.Schema({
    sampleId: { type: String, required: true, unique: true },
    patientId: String,
    status: { type: String, enum: ['collected', 'in-transit', 'sequenced', 'completed'], default: 'collected' },
    currentStep: { type: Number, default: 1 },
    hashes: [String],
    txHashes: [String], // Blockchain transaction hashes
    timeline: [{
        step: Number,
        name: String,
        hash: String,
        txHash: String,
        timestamp: Date,
        details: mongoose.Schema.Types.Mixed,
        verified: Boolean
    }],
    rawDataChecksum: String,
    analysisResult: String,
    riskScore: Number,
    recommendations: [String],
    createdAt: { type: Date, default: Date.now },
    completedAt: Date
});

const TransactionSchema = new mongoose.Schema({
    txId: { type: String, required: true },
    type: { type: String, enum: ['COLLECTION', 'TRANSPORT', 'SEQUENCING', 'AI_ANALYSIS'] },
    sampleId: String,
    hash: String,
    txHash: String, // Blockchain transaction hash
    timestamp: { type: Date, default: Date.now },
    data: mongoose.Schema.Types.Mixed,
    walletAddress: String,
    blockNumber: Number
});

// User Schema - for patient registration
const UserSchema = new mongoose.Schema({
    walletAddress: { type: String, unique: true, sparse: true },
    name: { type: String, required: true },
    age: Number,
    sex: { type: String, enum: ['Male', 'Female', 'Other'] },
    dob: Date,
    address: String,
    phone: String,
    email: String,
    createdAt: { type: Date, default: Date.now }
});

// Lab Schema - available labs for testing
const LabSchema = new mongoose.Schema({
    labId: { type: String, unique: true },
    name: { type: String, required: true },
    address: String,
    phone: String,
    city: String,
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

// Test Request Schema - user requests to labs
const TestRequestSchema = new mongoose.Schema({
    requestId: { type: String, unique: true },
    labId: String,
    labName: String,
    userId: String, // wallet address or generated ID
    patientInfo: {
        name: String,
        age: Number,
        sex: String,
        dob: Date,
        address: String,
        phone: String
    },
    status: { type: String, enum: ['pending', 'accepted', 'rejected', 'completed'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: Date
});

const Sample = mongoose.model('Sample', SampleSchema);
const Transaction = mongoose.model('Transaction', TransactionSchema);
const User = mongoose.model('User', UserSchema);
const Lab = mongoose.model('Lab', LabSchema);
const TestRequest = mongoose.model('TestRequest', TestRequestSchema);

// Routes
const pdfRoutes = require('./routes/pdf');
app.use('/api/pdf', pdfRoutes);

// Get all samples
app.get('/api/samples', async (req, res) => {
    try {
        const samples = await Sample.find().sort({ createdAt: -1 });
        res.json(samples);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get sample by ID
app.get('/api/samples/:sampleId', async (req, res) => {
    try {
        const sample = await Sample.findOne({ sampleId: req.params.sampleId });
        if (!sample) return res.status(404).json({ error: 'Sample not found' });
        res.json(sample);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create/Update sample
app.post('/api/samples', async (req, res) => {
    try {
        const { sampleId, ...data } = req.body;
        const sample = await Sample.findOneAndUpdate(
            { sampleId },
            { sampleId, ...data },
            { upsert: true, new: true }
        );
        res.json(sample);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update sample step
app.put('/api/samples/:sampleId/step', async (req, res) => {
    try {
        const { step, timelineEntry, status, txHash, ...updates } = req.body;
        const sample = await Sample.findOne({ sampleId: req.params.sampleId });

        if (!sample) return res.status(404).json({ error: 'Sample not found' });

        sample.currentStep = step;
        sample.status = status;
        if (timelineEntry) sample.timeline.push(timelineEntry);
        if (txHash) sample.txHashes.push(txHash);
        Object.assign(sample, updates);

        await sample.save();
        res.json(sample);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all transactions
app.get('/api/transactions', async (req, res) => {
    try {
        const transactions = await Transaction.find().sort({ timestamp: -1 });
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get transactions by sample
app.get('/api/transactions/sample/:sampleId', async (req, res) => {
    try {
        const transactions = await Transaction.find({ sampleId: req.params.sampleId });
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create transaction
app.post('/api/transactions', async (req, res) => {
    try {
        const transaction = new Transaction(req.body);
        await transaction.save();
        res.json(transaction);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============= USER ROUTES =============

// Register/Update user
app.post('/api/users', async (req, res) => {
    try {
        const { walletAddress, ...userData } = req.body;
        const user = await User.findOneAndUpdate(
            { walletAddress },
            { walletAddress, ...userData },
            { upsert: true, new: true }
        );
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get user by wallet address
app.get('/api/users/:walletAddress', async (req, res) => {
    try {
        const user = await User.findOne({ walletAddress: req.params.walletAddress });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============= LAB ROUTES =============

// Get all labs
app.get('/api/labs', async (req, res) => {
    try {
        const labs = await Lab.find({ isActive: true });
        res.json(labs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Seed labs (run once)
app.post('/api/labs/seed', async (req, res) => {
    try {
        const sampleLabs = [
            { labId: 'LAB-001', name: 'Apollo Diagnostics', address: 'Salt Lake, Sector V', city: 'Kolkata', phone: '033-4040-1234' },
            { labId: 'LAB-002', name: 'Dr. Lal PathLabs', address: 'Andheri West', city: 'Mumbai', phone: '022-4040-5678' },
            { labId: 'LAB-003', name: 'SRL Diagnostics', address: 'Connaught Place', city: 'Delhi', phone: '011-4040-9012' },
            { labId: 'LAB-004', name: 'Thyrocare Technologies', address: 'Turbhe', city: 'Navi Mumbai', phone: '022-4040-3456' },
            { labId: 'LAB-005', name: 'Metropolis Healthcare', address: 'Park Street', city: 'Kolkata', phone: '033-4040-7890' }
        ];

        for (const lab of sampleLabs) {
            await Lab.findOneAndUpdate({ labId: lab.labId }, lab, { upsert: true });
        }
        res.json({ success: true, message: 'Labs seeded successfully', count: sampleLabs.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============= TEST REQUEST ROUTES =============

// Create test request
app.post('/api/test-requests', async (req, res) => {
    try {
        const requestId = `REQ-${Date.now().toString(36).toUpperCase()}`;
        const testRequest = new TestRequest({
            requestId,
            ...req.body,
            createdAt: new Date()
        });
        await testRequest.save();
        res.json(testRequest);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all pending test requests (for labs)
app.get('/api/test-requests/pending', async (req, res) => {
    try {
        const requests = await TestRequest.find({ status: 'pending' }).sort({ createdAt: -1 });
        res.json(requests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all test requests
app.get('/api/test-requests', async (req, res) => {
    try {
        const requests = await TestRequest.find().sort({ createdAt: -1 });
        res.json(requests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update test request (accept/reject)
app.put('/api/test-requests/:requestId', async (req, res) => {
    try {
        const request = await TestRequest.findOneAndUpdate(
            { requestId: req.params.requestId },
            { ...req.body, updatedAt: new Date() },
            { new: true }
        );
        if (!request) return res.status(404).json({ error: 'Request not found' });
        res.json(request);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get pending count
app.get('/api/test-requests/count', async (req, res) => {
    try {
        const count = await TestRequest.countDocuments({ status: 'pending' });
        res.json({ count });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

// ML Prediction endpoint
app.post('/api/ml/predict', async (req, res) => {
    try {
        const inputData = req.body;

        // Validate required fields
        const requiredFields = ['age', 'sex', 'smokingStatus', 'cfDNATotal', 'fragmentScore', 'shortFragmentRatio', 'tp53Mut', 'krasMut', 'cea'];
        const missingFields = requiredFields.filter(field => !inputData.hasOwnProperty(field));

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                error: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        // Determine Python command (prefer virtual environment)
        const mlDir = path.join(__dirname, 'ml');
        const venvPython = process.platform === 'win32'
            ? path.join(mlDir, '.venv', 'Scripts', 'python.exe')
            : path.join(mlDir, '.venv', 'bin', 'python');

        const pythonCmd = require('fs').existsSync(venvPython) ? venvPython : 'python';

        // Use enhanced ML service (trained model with 97.8% ROC-AUC)
        const mlScript = path.join(mlDir, 'enhanced_ml_service.py');

        // Call Python ML service
        const pythonProcess = spawn(pythonCmd, [
            mlScript,
            JSON.stringify(inputData)
        ]);

        let result = '';
        let error = '';

        pythonProcess.stdout.on('data', (data) => {
            result += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            error += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error('Python process error:', error);
                return res.status(500).json({
                    success: false,
                    error: 'ML prediction failed',
                    details: error
                });
            }

            try {
                const prediction = JSON.parse(result);
                res.json(prediction);
            } catch (parseError) {
                console.error('JSON parse error:', parseError);
                res.status(500).json({
                    success: false,
                    error: 'Failed to parse ML result'
                });
            }
        });

    } catch (err) {
        console.error('ML prediction error:', err);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            details: err.message
        });
    }
});

// Initialize ML model (train if needed)
app.post('/api/ml/initialize', async (req, res) => {
    try {
        // Determine Python command (prefer virtual environment)
        const mlDir = path.join(__dirname, 'ml');
        const venvPython = process.platform === 'win32'
            ? path.join(mlDir, '.venv', 'Scripts', 'python.exe')
            : path.join(mlDir, '.venv', 'bin', 'python');

        const pythonCmd = require('fs').existsSync(venvPython) ? venvPython : 'python';

        const pythonProcess = spawn(pythonCmd, [
            path.join(mlDir, 'train_model.py')
        ]);

        let result = '';
        let error = '';

        pythonProcess.stdout.on('data', (data) => {
            result += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            error += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error('Model training error:', error);
                return res.status(500).json({
                    success: false,
                    error: 'Model training failed',
                    details: error
                });
            }

            res.json({
                success: true,
                message: 'Model initialized successfully',
                output: result
            });
        });

    } catch (err) {
        console.error('Model initialization error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to initialize model',
            details: err.message
        });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 HelixAI Server running on port ${PORT}`);
});
