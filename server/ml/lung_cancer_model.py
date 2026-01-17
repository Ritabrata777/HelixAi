"""
Lung Cancer Detection ML Model for HelixAI
Integrated version of the original model with simplified interface
"""
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
from xgboost import XGBClassifier
import joblib
import warnings
warnings.filterwarnings('ignore')


class HelixLungCancerDetector:
    """ML model for lung cancer detection integrated with HelixAI."""
    
    FEATURE_COLUMNS = [
        'Age', 'Sex', 'Smoking_status', 'Smoking_pack_years',
        'cfDNA_total', 'Fragment_score', 'Short_fragment_ratio',
        'TP53_mut', 'TP53_VAF', 'KRAS_mut', 'KRAS_VAF', 'CEA'
    ]
    
    def __init__(self, model_type='xgboost'):
        self.model_type = model_type
        self.model = None
        self.scaler = StandardScaler()
        self.label_encoders = {}
        self.feature_importance = None
        self.is_trained = False
        
    def _get_model(self):
        """Initialize the selected model type."""
        if self.model_type == 'xgboost':
            return XGBClassifier(
                n_estimators=100,
                max_depth=6,
                learning_rate=0.1,
                random_state=42,
                eval_metric='logloss'
            )
        else:
            return RandomForestClassifier(
                n_estimators=100,
                max_depth=10,
                random_state=42
            )

    def preprocess(self, df, fit=True):
        """Preprocess features for model training/prediction."""
        df = df.copy()
        
        # Encode categorical variables
        categorical_cols = ['Sex', 'Smoking_status']
        for col in categorical_cols:
            if col in df.columns:
                if fit:
                    self.label_encoders[col] = LabelEncoder()
                    df[col] = self.label_encoders[col].fit_transform(df[col].astype(str))
                else:
                    if col in self.label_encoders:
                        df[col] = self.label_encoders[col].transform(df[col].astype(str))
        
        # Select feature columns
        feature_cols = [c for c in self.FEATURE_COLUMNS if c in df.columns]
        X = df[feature_cols].values
        
        # Scale numerical features
        if fit:
            X = self.scaler.fit_transform(X)
        else:
            X = self.scaler.transform(X)
        
        return X, feature_cols
    
    def train_with_synthetic_data(self, n_samples=2000):
        """Train the model with synthetic data."""
        # Generate synthetic data
        np.random.seed(42)
        
        data = {
            'Age': np.random.randint(40, 85, n_samples),
            'Sex': np.random.choice(['M', 'F'], n_samples),
            'Smoking_status': np.random.choice(['Never', 'Former', 'Current'], n_samples, p=[0.3, 0.35, 0.35]),
            'Smoking_pack_years': np.zeros(n_samples),
            'cfDNA_total': np.random.uniform(5, 50, n_samples),
            'Fragment_score': np.random.uniform(0, 1, n_samples),
            'Short_fragment_ratio': np.random.uniform(0.1, 0.5, n_samples),
            'TP53_mut': np.random.choice([0, 1], n_samples, p=[0.7, 0.3]),
            'TP53_VAF': np.zeros(n_samples),
            'KRAS_mut': np.random.choice([0, 1], n_samples, p=[0.75, 0.25]),
            'KRAS_VAF': np.zeros(n_samples),
            'CEA': np.random.uniform(0, 10, n_samples),
        }
        
        df = pd.DataFrame(data)
        
        # Adjust smoking pack years based on status
        for i in range(n_samples):
            if df.loc[i, 'Smoking_status'] == 'Never':
                df.loc[i, 'Smoking_pack_years'] = 0
            elif df.loc[i, 'Smoking_status'] == 'Former':
                df.loc[i, 'Smoking_pack_years'] = np.random.uniform(5, 40)
            else:
                df.loc[i, 'Smoking_pack_years'] = np.random.uniform(10, 60)
        
        # Set VAF values when mutations are present
        df.loc[df['TP53_mut'] == 1, 'TP53_VAF'] = np.random.uniform(0.01, 0.3, (df['TP53_mut'] == 1).sum())
        df.loc[df['KRAS_mut'] == 1, 'KRAS_VAF'] = np.random.uniform(0.01, 0.25, (df['KRAS_mut'] == 1).sum())
        
        # Generate target with realistic correlations
        risk_score = (
            0.02 * df['Age'] +
            0.5 * (df['Smoking_status'] == 'Current').astype(int) +
            0.3 * (df['Smoking_status'] == 'Former').astype(int) +
            0.01 * df['Smoking_pack_years'] +
            0.02 * df['cfDNA_total'] +
            1.5 * df['Fragment_score'] +
            2.0 * df['Short_fragment_ratio'] +
            1.2 * df['TP53_mut'] +
            3.0 * df['TP53_VAF'] +
            0.8 * df['KRAS_mut'] +
            2.5 * df['KRAS_VAF'] +
            0.1 * df['CEA']
        )
        
        # Convert to probability and generate labels
        prob = 1 / (1 + np.exp(-0.5 * (risk_score - risk_score.mean())))
        df['Lung_Cancer'] = (np.random.random(n_samples) < prob).astype(int)
        
        # Train model
        X, feature_cols = self.preprocess(df, fit=True)
        y = df['Lung_Cancer'].values
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Train model
        self.model = self._get_model()
        self.model.fit(X_train, y_train)
        
        # Evaluate
        y_pred = self.model.predict(X_test)
        y_prob = self.model.predict_proba(X_test)[:, 1]
        
        metrics = {
            'accuracy': accuracy_score(y_test, y_pred),
            'precision': precision_score(y_test, y_pred),
            'recall': recall_score(y_test, y_pred),
            'f1': f1_score(y_test, y_pred),
            'roc_auc': roc_auc_score(y_test, y_prob)
        }
        
        # Feature importance
        if hasattr(self.model, 'feature_importances_'):
            self.feature_importance = dict(zip(feature_cols, self.model.feature_importances_))
        
        self.is_trained = True
        return metrics
    
    def predict_single(self, sample_data):
        """Predict lung cancer probability for a single sample."""
        if not self.is_trained:
            raise ValueError("Model must be trained before making predictions")
        
        # Convert input to DataFrame
        df = pd.DataFrame([sample_data])
        
        # Preprocess
        X, _ = self.preprocess(df, fit=False)
        
        # Make prediction
        prediction = self.model.predict(X)[0]
        probability = self.model.predict_proba(X)[0][1]
        
        # Determine risk level
        if probability >= 0.7:
            risk_level = 'High'
            analysis = 'High probability of early-stage lung cancer detected. cfDNA fragmentation patterns and mutation markers indicate significant cellular abnormalities. Immediate follow-up recommended.'
            recommendations = [
                'Schedule CT scan within 2 weeks',
                'Consult oncologist immediately',
                'Complete blood panel recommended',
                'Consider biopsy if imaging confirms'
            ]
        elif probability >= 0.3:
            risk_level = 'Medium'
            analysis = 'Moderate risk indicators present. Some biomarkers show elevated levels. Regular monitoring and lifestyle modifications advised.'
            recommendations = [
                'Follow-up test in 3 months',
                'Maintain healthy lifestyle',
                'Consider smoking cessation if applicable',
                'Regular monitoring recommended'
            ]
        else:
            risk_level = 'Low'
            analysis = 'Low risk profile. Biomarker levels within normal range. Continue regular health checkups.'
            recommendations = [
                'Annual screening recommended',
                'Maintain healthy lifestyle',
                'Continue regular checkups'
            ]
        
        return {
            'prediction': int(prediction),
            'probability': float(probability),
            'risk_score': int(probability * 100),
            'risk_level': risk_level,
            'analysis': analysis,
            'recommendations': recommendations,
            'feature_importance': self.feature_importance
        }
    
    def save(self, path='helix_lung_cancer_model.joblib'):
        """Save the trained model."""
        if not self.is_trained:
            raise ValueError("Model must be trained before saving")
        
        model_data = {
            'model': self.model,
            'scaler': self.scaler,
            'label_encoders': self.label_encoders,
            'feature_importance': self.feature_importance,
            'model_type': self.model_type,
            'is_trained': self.is_trained
        }
        joblib.dump(model_data, path)
        return path
    
    @classmethod
    def load(cls, path='helix_lung_cancer_model.joblib'):
        """Load a trained model."""
        model_data = joblib.load(path)
        detector = cls(model_type=model_data['model_type'])
        detector.model = model_data['model']
        detector.scaler = model_data['scaler']
        detector.label_encoders = model_data['label_encoders']
        detector.feature_importance = model_data['feature_importance']
        detector.is_trained = model_data['is_trained']
        return detector


if __name__ == "__main__":
    # Train and save model
    detector = HelixLungCancerDetector()
    metrics = detector.train_with_synthetic_data()
    
    print("Model Training Complete!")
    print(f"Accuracy: {metrics['accuracy']:.4f}")
    print(f"ROC AUC: {metrics['roc_auc']:.4f}")
    
    # Save model
    model_path = detector.save()
    print(f"Model saved to: {model_path}")
    
    # Test prediction
    test_sample = {
        'Age': 65,
        'Sex': 'M',
        'Smoking_status': 'Former',
        'Smoking_pack_years': 30,
        'cfDNA_total': 25.5,
        'Fragment_score': 0.65,
        'Short_fragment_ratio': 0.35,
        'TP53_mut': 1,
        'TP53_VAF': 0.08,
        'KRAS_mut': 0,
        'KRAS_VAF': 0.0,
        'CEA': 5.2
    }
    
    result = detector.predict_single(test_sample)
    print(f"\nTest Prediction:")
    print(f"Risk Score: {result['risk_score']}%")
    print(f"Risk Level: {result['risk_level']}")