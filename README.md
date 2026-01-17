# HelixAI - Blockchain-Powered Medical Sample Tracking

A decentralized application for tracking medical samples through their entire journey from collection to AI-powered analysis, secured by blockchain technology.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MetaMask browser extension
- MongoDB (local or cloud)

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Blockchain
```bash
npm run blockchain:setup
```

### 3. Configure Environment
Update `.env` with your values:
```env
# MongoDB Connection
REACT_APP_MONGODB_URI=your_mongodb_connection_string

# Polygon Amoy Testnet
REACT_APP_POLYGON_AMOY_RPC=https://rpc-amoy.polygon.technology
REACT_APP_CONTRACT_ADDRESS=your_deployed_contract_address

# Backend API
REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Deploy Smart Contract (Optional)
```bash
# Add your private key to .env first
PRIVATE_KEY=your_wallet_private_key

# Deploy to Polygon Amoy
npm run deploy
```

### 5. Start the Application
```bash
# Start both frontend and backend
npm run dev:full

# Or start separately:
npm run server  # Backend on port 5000
npm start       # Frontend on port 3000
```

## 🔧 Blockchain Setup

### MetaMask Configuration
1. Install MetaMask extension
2. Add Polygon Amoy Testnet:
   - Network Name: Polygon Amoy Testnet
   - RPC URL: https://rpc-amoy.polygon.technology
   - Chain ID: 80002
   - Currency: MATIC
   - Block Explorer: https://amoy.polygonscan.com/

### Get Test MATIC
Visit [Polygon Faucet](https://faucet.polygon.technology/) to get free test MATIC for transactions.

## 📱 How It Works

### 4-Step Process
1. **Collection** - Nurse scans QR code, generates Hash #1
2. **Transport** - Logistics pickup, generates Hash #2  
3. **Sequencing** - Lab runs Low-Pass WGS, generates Hash #3
4. **AI Analysis** - AI processes data, generates Hash #4

### User Portal
- Track samples with transaction ID
- View blockchain-verified journey
- Access AI-generated risk reports

### Lab Portal  
- Scan and register new samples
- Run AI analysis on sequenced data
- View processing history

## 🛠 Development

### Available Scripts
- `npm start` - Start frontend
- `npm run server` - Start backend
- `npm run dev:full` - Start both frontend and backend
- `npm run setup` - Run blockchain setup
- `npm run compile` - Compile smart contracts
- `npm run deploy` - Deploy contracts to Amoy

### Project Structure
```
├── contracts/           # Smart contracts
├── src/
│   ├── components/      # React components
│   ├── context/         # Blockchain & Wallet contexts
│   ├── pages/           # Application pages
│   └── App.tsx         # Main app component
├── server/             # Express.js backend
├── scripts/            # Deployment scripts
└── artifacts/          # Compiled contracts
```

## 🔐 Security Features

- **Immutable Blockchain Records** - All sample steps recorded on Polygon
- **Hash Verification** - Each step generates cryptographic proof
- **Wallet Authentication** - MetaMask integration for secure access
- **Data Integrity** - MongoDB + blockchain dual storage

## 🌐 Network Status

The app shows a real-time blockchain connection status indicator:
- 🟢 Green: Connected to Polygon Amoy
- 🟡 Yellow: Wrong network (switch to Amoy)
- 🔴 Red: Wallet disconnected

## 📊 Sample Data Flow

```
Collection → Transport → Sequencing → AI Analysis
    ↓           ↓           ↓           ↓
  Hash #1    Hash #2     Hash #3     Hash #4
    ↓           ↓           ↓           ↓
 Blockchain  Blockchain  Blockchain  Blockchain
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

**"Wallet not connected"**
- Install MetaMask and connect your wallet
- Make sure you're on Polygon Amoy testnet

**"Contract not deployed"**
- Run `npm run deploy` to deploy the smart contract
- Update `REACT_APP_CONTRACT_ADDRESS` in `.env`

**"Server connection failed"**
- Start the backend with `npm run server`
- Check MongoDB connection string

**"Transaction failed"**
- Ensure you have test MATIC in your wallet
- Check network connection
- Try refreshing and reconnecting wallet

For more help, check the console logs for detailed error messages.