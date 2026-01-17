# HelixAI ML Integration

This document describes the integration of the lung cancer detection ML model into the HelixAI platform.

## Overview

The ML integration adds real-time lung cancer risk assessment capabilities to HelixAI using a trained XGBoost model that analyzes clinical and genomic biomarkers.

## Features

- **Real-time Predictions**: ML-powered risk assessment through the Lab Analysis interface
- **12 Clinical Features**: Age, sex, smoking history, cfDNA markers, genetic mutations, and CEA levels
- **Risk Stratification**: Low/Medium/High risk categories with tailored recommendations
- **Blockchain Integration**: ML predictions are recorded on the blockchain for immutable audit trails
- **Fallback System**: Graceful degradation to rule-based analysis if ML service fails

## Architecture

```
Frontend (React/TypeScript)
    ↓ HTTP API calls
Backend (Node.js/Express)
    ↓ Python subprocess
ML Service (Python/scikit-learn/XGBoost)
    ↓ Model predictions
Blockchain (Smart Contract)
```

## ML Model Details

### Input Features
- **Age**: Patient age in years
- **Sex**: M/F
- **Smoking Status**: Never/Former/Current
- **Smoking Pack Years**: Years × packs per day
- **cfDNA Total**: Circulating free DNA concentration (ng/mL)
- **Fragment Score**: DNA fragmentation metric (0-1)
- **Short Fragment Ratio**: Proportion of short DNA fragments
- **TP53 Mutation**: Presence of TP53 mutations (0/1)
- **TP53 VAF**: Variant allele frequency for TP53
- **KRAS Mutation**: Presence of KRAS mutations (0/1)
- **KRAS VAF**: Variant allele frequency for KRAS
- **CEA**: Carcinoembryonic antigen level (ng/mL)

### Output
- **Risk Score**: 0-100% probability of lung cancer
- **Risk Level**: Low (<30%), Medium (30-70%), High (>70%)
- **Clinical Analysis**: Detailed interpretation
- **Recommendations**: Personalized follow-up actions

### Model Performance
- **Algorithm**: XGBoost Classifier
- **Training Data**: 2000 synthetic samples with realistic correlations
- **Accuracy**: ~85-90% on test data
- **ROC AUC**: ~0.90-0.95

## Setup Instructions

### Prerequisites
- Python 3.7+
- pip package manager
- Node.js 16+

### Installation Options

#### Option 1: Automated Setup (Recommended)
```bash
cd helix-ai
npm run setup:ml
```
This will:
- Create a Python virtual environment in `server/ml/.venv/`
- Install all Python dependencies in isolation
- Train the ML model
- Verify the setup

#### Option 2: Manual Setup
```bash
cd helix-ai/server/ml

# Create virtual environment (recommended)
python -m venv .venv

# Activate virtual environment
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Train model
python train_model.py
```

#### Option 3: Global Installation (Not Recommended)
```bash
cd helix-ai/server/ml
pip install -r requirements.txt
python train_model.py
```

### Virtual Environment Benefits
- **Isolation**: Prevents conflicts with other Python projects
- **Reproducibility**: Ensures consistent package versions
- **Clean System**: Doesn't pollute global Python installation
- **Easy Cleanup**: Simply delete `.venv` folder to remove everything

### Verification

Test the ML service directly:
```bash
cd helix-ai/server/ml

# If using virtual environment:
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate

python ml_service.py '{"age":"65","sex":"M","smokingStatus":"Former","smokingPackYears":"30","cfDNATotal":"25.5","fragmentScore":"0.65","shortFragmentRatio":"0.35","tp53Mut":"1","tp53VAF":"0.08","krasMut":"0","krasVAF":"0","cea":"5.2"}'
```

## API Endpoints

### POST /api/ml/predict
Predict lung cancer risk for a single sample.

**Request Body**:
```json
{
  "age": "65",
  "sex": "M",
  "smokingStatus": "Former",
  "smokingPackYears": "30",
  "cfDNATotal": "25.5",
  "fragmentScore": "0.65",
  "shortFragmentRatio": "0.35",
  "tp53Mut": "1",
  "tp53VAF": "0.08",
  "krasMut": "0",
  "krasVAF": "0",
  "cea": "5.2"
}
```

**Response**:
```json
{
  "success": true,
  "result": {
    "prediction": 1,
    "probability": 0.78,
    "risk_score": 78,
    "risk_level": "High",
    "analysis": "High probability of early-stage lung cancer detected...",
    "recommendations": [
      "Schedule CT scan within 2 weeks",
      "Consult oncologist immediately",
      "Complete blood panel recommended"
    ]
  }
}
```

### POST /api/ml/initialize
Initialize/retrain the ML model.

## Usage in HelixAI

1. **Navigate to Lab Portal** → Analysis
2. **Select a sequenced sample** from the available list
3. **Input clinical data** in the report form:
   - Patient demographics (age, sex)
   - Smoking history
   - Laboratory results (cfDNA, CEA)
   - Genetic markers (TP53, KRAS)
4. **Run AI Analysis** to get ML-powered predictions
5. **Review results** with risk score and recommendations
6. **Blockchain recording** happens automatically

## File Structure

```
helix-ai/
├── server/
│   ├── ml/
│   │   ├── lung_cancer_model.py      # Core ML model class
│   │   ├── ml_service.py             # API service wrapper
│   │   ├── train_model.py            # Model training script
│   │   └── requirements.txt          # Python dependencies
│   └── server.js                     # Updated with ML endpoints
├── src/pages/lab/
│   └── AnalyzeSample.tsx            # Updated with ML integration
├── setup-ml.js                     # ML setup automation
└── ML_INTEGRATION.md               # This documentation
```

## Troubleshooting

### Common Issues

1. **Python not found**
   - Install Python 3.7+ from python.org
   - Ensure python/python3 is in PATH

2. **Package installation fails**
   - Try: `pip install --upgrade pip`
   - Use virtual environment: `python -m venv venv && source venv/bin/activate`

3. **ML prediction fails**
   - Check server logs for Python errors
   - Verify model file exists: `server/ml/helix_lung_cancer_model.joblib`
   - Test ML service directly (see Verification section)
   - If using virtual environment, ensure it's properly activated

4. **Missing dependencies**
   - With virtual environment: Activate it first, then `pip install -r requirements.txt`
   - Without virtual environment: `cd server/ml && pip install -r requirements.txt`

5. **Virtual environment issues**
   - Delete `.venv` folder and run `npm run setup:ml` again
   - Ensure Python 3.7+ supports `venv` module
   - Try manual virtual environment creation

### Performance Optimization

- **Model Caching**: Model is loaded once and reused for predictions
- **Async Processing**: ML calls don't block the main server thread
- **Fallback Logic**: Rule-based analysis if ML service unavailable
- **Error Handling**: Graceful degradation with user feedback

## Future Enhancements

- **Real Data Integration**: Replace synthetic training data with clinical datasets
- **Model Versioning**: Support for multiple model versions and A/B testing
- **Batch Predictions**: Process multiple samples simultaneously
- **Model Monitoring**: Track prediction accuracy and model drift
- **Advanced Features**: Integration of imaging data, additional biomarkers
- **Federated Learning**: Collaborative model training across institutions

## Security Considerations

- **Input Validation**: All ML inputs are validated before processing
- **Sandboxed Execution**: Python ML service runs in isolated subprocess
- **Audit Trail**: All predictions recorded on blockchain
- **Data Privacy**: No patient data stored in ML service
- **Access Control**: ML endpoints require proper authentication

## Contributing

To contribute to the ML integration:

1. Follow the existing code structure in `server/ml/`
2. Add comprehensive tests for new features
3. Update documentation for any API changes
4. Ensure backward compatibility with existing data
5. Test thoroughly with various input scenarios