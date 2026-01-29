<p align="center">
  <img src="https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React"/>
  <img src="https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js"/>
  <img src="https://img.shields.io/badge/Polygon-Amoy-8247E5?style=for-the-badge&logo=polygon&logoColor=white" alt="Polygon"/>
  <img src="https://img.shields.io/badge/Solidity-Smart%20Contracts-363636?style=for-the-badge&logo=solidity&logoColor=white" alt="Solidity"/>
  <img src="https://img.shields.io/badge/Python-ML%20Engine-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python"/>
</p>

<h1 align="center">🧬 HelixAI</h1>

<p align="center">
  <strong>AI-Powered Lung Cancer Risk Analysis with Blockchain-Verified Medical Sample Tracking</strong>
</p>

<p align="center">
  A next-generation healthcare platform combining machine learning, blockchain technology, and advanced biomarker analysis to revolutionize early lung cancer detection.
</p>

---

## 🌟 Overview

**HelixAI** is a decentralized medical diagnostics platform that tracks biological samples through their entire journey—from collection to AI-powered analysis—with every step cryptographically secured on the Polygon blockchain. Our enhanced ML model analyzes cfDNA biomarkers, genetic mutations, and clinical factors to provide accurate lung cancer risk assessments.

### Key Highlights

| Feature | Description |
|---------|-------------|
| 🔬 **AI Analysis** | LightGBM-based ML model with 92%+ confidence for risk prediction |
| ⛓️ **Blockchain Verified** | Every sample step recorded immutably on Polygon Amoy |
| 📊 **Comprehensive Reports** | PDF generation with detailed clinical insights |
| 🔒 **Secure Access** | MetaMask wallet authentication |
| 🏥 **Dual Portals** | Separate interfaces for patients and laboratories |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                          HelixAI Platform                            │
├──────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐   │
│  │   User Portal   │    │   Lab Portal    │    │  Landing Page   │   │
│  │  (React + TS)   │    │  (React + TS)   │    │                 │   │
│  └────────┬────────┘    └────────┬────────┘    └─────────────────┘   │
│           │                      │                                   │
│           └──────────┬───────────┘                                   │
│                      ▼                                               │
│  ┌─────────────────────────────────────────────────────────────┐     │
│  │                    Blockchain Context                       │     │
│  │              (MetaMask + ethers.js + Polygon)               │     │
│  └─────────────────────────-─┬─────────────────────────────────┘     │
│                              │                                       │
├──────────────────────────────┼───────────────────────────────────────┤
│                              ▼                                       │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │                     Express.js Backend                       │    │
│  │     ┌──────────────┐    ┌──────────────┐    ┌────────────┐   │    │
│  │     │  MongoDB     │    │  ML Service  │    │    PDF     │   │    │
│  │     │  (Mongoose)  │    │  (Python)    │    │  Generator │   │    │
│  │     └──────────────┘    └──────────────┘    └────────────┘   │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────────┐   │
│  │                   Polygon Amoy Testnet                        │   │
│  │                   SampleTracker.sol                           │   │
│  └───────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Sample Tracking Flow

The platform tracks each sample through a 4-step blockchain-verified journey:

```
   Collection          Transport          Sequencing         AI Analysis
       │                   │                   │                   │
       ▼                   ▼                   ▼                   ▼
   ┌───────┐           ┌───────┐           ┌───────┐           ┌───────┐
   │ QR    │─────────▶│Pickup │──────────▶│ Lab   │─────────▶│ ML    │
   │ Scan  │           │       │           │ WGS   │           │ Model │
   └───────┘           └───────┘           └───────┘           └───────┘
       │                   │                   │                   │
       ▼                   ▼                   ▼                   ▼
   Hash #1             Hash #2             Hash #3             Hash #4
       │                   │                   │                   │
       └───────────────────┴───────────────────┴───────────────────┘
                                   │
                                   ▼
                          ┌───────────────┐
                          │   Polygon     │
                          │   Blockchain  │
                          └───────────────┘
```

---

## 🧠 ML Model Features

Our enhanced machine learning pipeline analyzes multiple biomarkers:

### Input Biomarkers

| Category | Biomarkers |
|----------|------------|
| **Demographics** | Age, Sex, BMI |
| **Smoking History** | Status, Pack-years |
| **cfDNA Markers** | Total cfDNA (ng/mL), Fragment Score, Short Fragment Ratio |
| **Genetic Mutations** | TP53 (mutation + VAF), KRAS (mutation + VAF) |
| **Tumor Markers** | CEA (ng/mL) |
| **Clinical History** | Family History, Previous Cancer, Chronic Lung Disease |

### Model Output

- **Risk Score**: 0-100% probability of early-stage lung cancer
- **Confidence Level**: Model certainty (typically 85-92%)
- **Risk Factors**: Identified contributing factors
- **Clinical Alerts**: Urgent findings requiring attention
- **Recommendations**: Personalized next steps

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+
- **Python** 3.8+ (for ML service)
- **MetaMask** browser extension
- **MongoDB** (local or Atlas cloud)

### Installation

```bash
# Clone the repository
git clone https://github.com/Ritabrata777/HelixAi.git
cd helix-ai

# Install frontend dependencies
npm install

# Install backend dependencies
cd server && npm install && cd ..

# Setup ML environment (optional, for enhanced predictions)
npm run setup:ml
```

### Configuration

Create a `.env` file in the root directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/helixai

# Polygon Amoy Testnet
REACT_APP_POLYGON_AMOY_RPC=https://rpc-amoy.polygon.technology
REACT_APP_CONTRACT_ADDRESS=your_deployed_contract_address

# Backend API
REACT_APP_API_URL=http://localhost:5000

# For contract deployment (optional)
PRIVATE_KEY=your_wallet_private_key

# Google AI (for PDF chat feature)
GOOGLE_API_KEY=your_gemini_api_key
```

### Running the Application

```bash
# Start both frontend and backend concurrently
npm run dev:full

# Or start separately:
npm run server     # Backend on port 5000
npm run dev        # Frontend on port 3000
```

---

## 🔧 Blockchain Setup

### MetaMask Configuration

Add Polygon Amoy Testnet to MetaMask:

| Setting | Value |
|---------|-------|
| **Network Name** | Polygon Amoy Testnet |
| **RPC URL** | `https://rpc-amoy.polygon.technology` |
| **Chain ID** | `80002` |
| **Currency Symbol** | POL |
| **Block Explorer** | `https://amoy.polygonscan.com/` |

### Get Test MATIC

Visit the [Polygon Faucet](https://faucet.polygon.technology/) to receive free test MATIC for transactions.

### Deploy Smart Contract

```bash
# Compile the contract
npm run compile

# Deploy to Polygon Amoy
npm run deploy
```

---

## 📁 Project Structure

```
helix-ai/
├── 📂 contracts/
│   └── SampleTracker.sol      # Solidity smart contract
├── 📂 server/
│   ├── server.js              # Express.js backend
│   ├── 📂 ml/
│   │   ├── enhanced_ml_service.py
│   │   ├── train_model.py
│   │   └── *.joblib           # Trained models
│   └── 📂 routes/
│       └── pdf.js             # PDF generation routes
├── 📂 src/
│   ├── App.tsx                # Main React app
│   ├── 📂 ai/
│   │   └── flows/             # Genkit AI flows
│   ├── 📂 components/
│   │   ├── Navbar.tsx
│   │   └── *.tsx
│   ├── 📂 context/
│   │   ├── BlockchainContext.tsx
│   │   └── WalletContext.tsx
│   ├── 📂 pages/
│   │   ├── LandingPage.tsx
│   │   ├── 📂 lab/            # Lab portal pages
│   │   └── 📂 user/           # User portal pages
│   ├── 📂 services/
│   │   └── pdfService.ts
│   └── 📂 utils/
│       └── pdfGenerator.ts
├── 📂 scripts/
│   └── deploy.js              # Contract deployment
├── package.json
└── README.md
```

---

## 🖥️ Portals

### 👤 User Portal

- **Register/Login** with personal details (name, age, DOB, address, phone, email)
- **Track Samples** using transaction ID or Patient ID
- **View Journey** – blockchain-verified 4-step progress
- **Download Reports** – AI-generated PDF with risk analysis
- **Chat with PDF** – Ask questions about your report using AI

### 🔬 Lab Portal

- **Connect Wallet** via MetaMask
- **View Test Requests** from registered patients
- **Accept/Reject Requests** – manage incoming patient tests
- **Register Samples** – QR code scanning and sample entry
- **Run AI Analysis** – process sequenced data through ML model
- **Transport Samples** – update sample location and status
- **Generate Reports** – create blockchain-verified PDF reports

---

## 📊 Network Status Indicator

The application displays real-time blockchain connection status:

| Status | Meaning |
|--------|---------|
| 🟢 **Green** | Connected to Polygon Amoy |
| 🟡 **Yellow** | Wrong network – switch to Amoy |
| 🔴 **Red** | Wallet disconnected |

---

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js frontend (Turbopack) |
| `npm run server` | Start Express.js backend |
| `npm run dev:full` | Start both frontend and backend |
| `npm run build` | Build production bundle |
| `npm run compile` | Compile Solidity contracts |
| `npm run deploy` | Deploy contract to Polygon Amoy |
| `npm run setup:ml` | Setup Python ML environment |
| `npm run blockchain:setup` | Full blockchain setup |

---

## 🔐 Security Features

- **🔗 Immutable Records** – All sample steps permanently stored on Polygon
- **🔒 Cryptographic Hashing** – Each step generates unique verification hash
- **👛 Wallet Authentication** – Secure MetaMask integration
- **🗄️ Dual Storage** – MongoDB + blockchain for data integrity
- **📄 Verified Reports** – PDFs include blockchain transaction hashes

---

## 🆘 Troubleshooting

<details>
<summary><strong>"Wallet not connected"</strong></summary>

1. Install MetaMask browser extension
2. Connect your wallet to the site
3. Switch to Polygon Amoy testnet

</details>

<details>
<summary><strong>"Contract not deployed"</strong></summary>

1. Add your private key to `.env`
2. Run `npm run deploy`
3. Update `REACT_APP_CONTRACT_ADDRESS` in `.env`

</details>

<details>
<summary><strong>"Transaction failed"</strong></summary>

1. Ensure you have test MATIC (use faucet)
2. Check network connection
3. Try resetting MetaMask account (Settings → Advanced → Clear activity)
4. Refresh and reconnect wallet

</details>

<details>
<summary><strong>"ML analysis not working"</strong></summary>

1. Ensure Python 3.8+ is installed
2. Run `npm run setup:ml` to install dependencies
3. Check that model files exist in `server/ml/`
4. Verify backend is running on port 5000

</details>

---

## 🛣️ Roadmap

- [ ] Multi-chain support (Ethereum, Arbitrum)
- [ ] Mobile app (React Native)
- [ ] Real-time notifications
- [ ] Integration with hospital EHR systems
- [ ] FDA compliance pathway
- [ ] Multi-language support

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** – see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Ritabrata**

- GitHub: [@Ritabrata777](https://github.com/Ritabrata777)

---

<p align="center">
  <strong>🧬 HelixAI – Revolutionizing Early Cancer Detection with AI & Blockchain 🧬</strong>
</p>
