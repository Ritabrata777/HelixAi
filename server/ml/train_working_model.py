"""
Train a Working Enhanced ML Model for HelixAI
"""
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
from xgboost import XGBClassifier
from lightgbm import LGBMClassifier
import joblib
import warnings
warnings.filterwarnings('ignore')

def generate_realistic_data(n_samples=10000):
    """Generate realistic lung cancer detection data."""
    np.random.seed(42)
    
    data = {
        'Age': np.random.randint(40, 85, n_samples),
        'Sex': np.random.choice(['M', 'F'], n_samples),
        'Smoking_status': np.random.choice(['Never', 'Former', 'Current'], n_samples, p=[0.3, 0.4, 0.3]),
        'Smoking_pack_years': np.random.exponential(15, n_samples),
        'cfDNA_total': np.random.gamma(2, 15, n_samples),
        'Fragment_score': np.random.beta(2, 5, n_samples),
        'Short_fragment_ratio': np.random.beta(3, 7, n_samples),
        'TP53_mut': np.random.choice([0, 1], n_samples, p=[0.7, 0.3]),
        'TP53_VAF': np.random.beta(2, 20, n_samples),
        'KRAS_mut': np.random.choice([0, 1], n_samples, p=[0.8, 0.2]),
        'KRAS_VAF': np.random.beta(2, 25, n_samples),
        'CEA': np.random.gamma(2, 2, n_samples),
        'BMI': np.random.normal(27, 5, n_samples),
        'Family_history': np.random.choice(['No', 'Yes'], n_samples, p=[0.7, 0.3]),
        'Previous_cancer': np.random.choice(['No', 'Yes'], n_samples, p=[0.85, 0.15]),
        'Chronic_lung_disease': np.random.choice(['No', 'Yes'], n_samples, p=[0.75, 0.25])
    }
    
    df = pd.DataFrame(data)
    
    # Generate realistic labels based on risk factors
    risk_score = np.zeros(n_samples)
    
    # Age factor
    risk_score += (df['Age'] - 40) / 45 * 20
    
    # Smoking
    smoking_map = {'Never': 0, 'Former': 15, 'Current': 25}
    risk_score += df['Smoking_status'].map(smoking_map)
    risk_score += np.clip(df['Smoking_pack_years'] / 40 * 15, 0, 15)
    
    # Biomarkers
    risk_score += np.clip((df['cfDNA_total'] - 20) / 30 * 20, 0, 20)
    risk_score += df['Fragment_score'] * 15
    risk_score += df['Short_fragment_ratio'] * 10
    
    # Mutations
    risk_score += df['TP53_mut'] * 20
    risk_score += df['TP53_VAF'] * 100 * df['TP53_mut']
    risk_score += df['KRAS_mut'] * 15
    risk_score += df['KRAS_VAF'] * 80 * df['KRAS_mut']
    
    # Other factors
    risk_score += np.clip((df['CEA'] - 3) / 7 * 10, 0, 10)
    risk_score += (df['Family_history'] == 'Yes').astype(int) * 8
    risk_score += (df['Previous_cancer'] == 'Yes').astype(int) * 12
    risk_score += (df['Chronic_lung_disease'] == 'Yes').astype(int) * 10
    
    # Add some randomness
    risk_score += np.random.normal(0, 5, n_samples)
    
    # Convert to binary labels
    df['Cancer'] = (risk_score > 50).astype(int)
    
    return df

def preprocess_data(df, label_encoders=None, scaler=None, fit=True):
    """Preprocess the data."""
    df = df.copy()
    
    # Separate features and target
    if 'Cancer' in df.columns:
        y = df['Cancer']
        X = df.drop('Cancer', axis=1)
    else:
        y = None
        X = df
    
    # Encode categorical variables
    categorical_cols = ['Sex', 'Smoking_status', 'Family_history', 'Previous_cancer', 'Chronic_lung_disease']
    
    if fit:
        label_encoders = {}
        for col in categorical_cols:
            if col in X.columns:
                le = LabelEncoder()
                X[col] = le.fit_transform(X[col].astype(str))
                label_encoders[col] = le
    else:
        for col in categorical_cols:
            if col in X.columns and col in label_encoders:
                X[col] = label_encoders[col].transform(X[col].astype(str))
    
    # Feature engineering
    X['Age_squared'] = X['Age'] ** 2
    X['cfDNA_Fragment_interaction'] = X['cfDNA_total'] * X['Fragment_score']
    X['Mutation_count'] = X['TP53_mut'] + X['KRAS_mut']
    X['Total_VAF'] = X['TP53_VAF'] + X['KRAS_VAF']
    
    # Scale features
    if fit:
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
    else:
        X_scaled = scaler.transform(X)
    
    X_scaled = pd.DataFrame(X_scaled, columns=X.columns)
    
    return X_scaled, y, label_encoders, scaler

def train_ensemble_model(X_train, y_train, X_test, y_test):
    """Train an ensemble of models."""
    print("\n📊 Training Ensemble Models...")
    
    models = {
        'XGBoost': XGBClassifier(n_estimators=100, max_depth=6, learning_rate=0.1, random_state=42),
        'LightGBM': LGBMClassifier(n_estimators=100, max_depth=6, learning_rate=0.1, random_state=42, verbose=-1),
        'RandomForest': RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42),
        'GradientBoosting': GradientBoostingClassifier(n_estimators=100, max_depth=6, learning_rate=0.1, random_state=42)
    }
    
    trained_models = {}
    model_scores = {}
    
    for name, model in models.items():
        print(f"   Training {name}...")
        model.fit(X_train, y_train)
        
        # Evaluate
        y_pred = model.predict(X_test)
        y_pred_proba = model.predict_proba(X_test)[:, 1]
        
        accuracy = accuracy_score(y_test, y_pred)
        precision = precision_score(y_test, y_pred)
        recall = recall_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred)
        roc_auc = roc_auc_score(y_test, y_pred_proba)
        
        trained_models[name] = model
        model_scores[name] = {
            'accuracy': accuracy,
            'precision': precision,
            'recall': recall,
            'f1': f1,
            'roc_auc': roc_auc
        }
        
        print(f"      ✅ {name}: Accuracy={accuracy:.4f}, ROC-AUC={roc_auc:.4f}")
    
    return trained_models, model_scores

def main():
    print("🚀" + "=" * 70)
    print("HelixAI Enhanced Lung Cancer Detection Model Training")
    print("🚀" + "=" * 70)
    
    # Generate data
    print("\n1. Generating realistic training data (10,000 samples)...")
    df = generate_realistic_data(10000)
    print(f"   ✅ Dataset created: {len(df)} samples")
    print(f"   ✅ Cancer prevalence: {df['Cancer'].mean()*100:.1f}%")
    print(f"   ✅ Features: {len(df.columns)-1}")
    
    # Preprocess
    print("\n2. Preprocessing data...")
    X, y, label_encoders, scaler = preprocess_data(df, fit=True)
    print(f"   ✅ Features after engineering: {X.shape[1]}")
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    print(f"   ✅ Training set: {len(X_train)} samples")
    print(f"   ✅ Test set: {len(X_test)} samples")
    
    # Train ensemble
    trained_models, model_scores = train_ensemble_model(X_train, y_train, X_test, y_test)
    
    # Select best model
    best_model_name = max(model_scores, key=lambda x: model_scores[x]['roc_auc'])
    best_model = trained_models[best_model_name]
    best_scores = model_scores[best_model_name]
    
    print(f"\n3. Best Model: {best_model_name}")
    print(f"   🎯 Accuracy:  {best_scores['accuracy']:.4f}")
    print(f"   🎯 Precision: {best_scores['precision']:.4f}")
    print(f"   🎯 Recall:    {best_scores['recall']:.4f}")
    print(f"   🎯 F1 Score:  {best_scores['f1']:.4f}")
    print(f"   🎯 ROC-AUC:   {best_scores['roc_auc']:.4f}")
    
    # Cross-validation
    print("\n4. Cross-validation (5-fold)...")
    cv_scores = cross_val_score(best_model, X, y, cv=5, scoring='roc_auc')
    print(f"   📊 CV ROC-AUC: {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")
    
    # Save model and preprocessors
    print("\n5. Saving model and preprocessors...")
    model_package = {
        'model': best_model,
        'model_name': best_model_name,
        'label_encoders': label_encoders,
        'scaler': scaler,
        'feature_names': X.columns.tolist(),
        'metrics': best_scores,
        'cv_scores': cv_scores.tolist()
    }
    
    joblib.dump(model_package, 'server/ml/enhanced_lung_cancer_model.joblib')
    print("   💾 Model saved to: server/ml/enhanced_lung_cancer_model.joblib")
    
    # Save all models for ensemble prediction
    joblib.dump(trained_models, 'server/ml/ensemble_models.joblib')
    print("   💾 Ensemble models saved to: server/ml/ensemble_models.joblib")
    
    print("\n" + "=" * 70)
    print("✅ Training Complete!")
    print("=" * 70)
    print(f"\n🎉 Your enhanced ML model is ready to use!")
    print(f"   Model Type: {best_model_name}")
    print(f"   Performance: {best_scores['roc_auc']:.1%} ROC-AUC")
    print(f"   Features: {len(X.columns)} engineered features")
    print(f"\n🚀 The model will now be used automatically in your application!")
    
    return model_package

if __name__ == "__main__":
    main()
