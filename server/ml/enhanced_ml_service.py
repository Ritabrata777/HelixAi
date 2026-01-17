"""
Enhanced ML Service using the trained model
"""
import sys
import json
import numpy as np
import pandas as pd
import joblib
import warnings
warnings.filterwarnings('ignore')

def load_model():
    """Load the trained enhanced model."""
    try:
        model_package = joblib.load('server/ml/enhanced_lung_cancer_model.joblib')
        return model_package
    except FileNotFoundError:
        print(json.dumps({'success': False, 'error': 'Model not found. Please train the model first.'}))
        sys.exit(1)

def preprocess_input(input_data, label_encoders, scaler, feature_names):
    """Preprocess input data to match training format."""
    # Create dataframe
    data = {
        'Age': int(input_data['age']),
        'Sex': input_data['sex'],
        'Smoking_status': input_data['smokingStatus'],
        'Smoking_pack_years': float(input_data.get('smokingPackYears', 0)),
        'cfDNA_total': float(input_data['cfDNATotal']),
        'Fragment_score': float(input_data['fragmentScore']),
        'Short_fragment_ratio': float(input_data['shortFragmentRatio']),
        'TP53_mut': int(input_data['tp53Mut']),
        'TP53_VAF': float(input_data.get('tp53VAF', 0)),
        'KRAS_mut': int(input_data['krasMut']),
        'KRAS_VAF': float(input_data.get('krasVAF', 0)),
        'CEA': float(input_data['cea']),
        'BMI': float(input_data.get('bmi', 25)),
        'Family_history': input_data.get('familyHistory', 'No'),
        'Previous_cancer': input_data.get('previousCancer', 'No'),
        'Chronic_lung_disease': input_data.get('chronicLungDisease', 'No')
    }
    
    df = pd.DataFrame([data])
    
    # Encode categorical variables
    categorical_cols = ['Sex', 'Smoking_status', 'Family_history', 'Previous_cancer', 'Chronic_lung_disease']
    for col in categorical_cols:
        if col in df.columns and col in label_encoders:
            df[col] = label_encoders[col].transform(df[col].astype(str))
    
    # Feature engineering (same as training)
    df['Age_squared'] = df['Age'] ** 2
    df['cfDNA_Fragment_interaction'] = df['cfDNA_total'] * df['Fragment_score']
    df['Mutation_count'] = df['TP53_mut'] + df['KRAS_mut']
    df['Total_VAF'] = df['TP53_VAF'] + df['KRAS_VAF']
    
    # Scale features
    X_scaled = scaler.transform(df)
    X_scaled = pd.DataFrame(X_scaled, columns=feature_names)
    
    return X_scaled

def generate_analysis(risk_score, input_data):
    """Generate detailed clinical analysis."""
    # Identify risk factors
    risk_factors = []
    
    if int(input_data['age']) > 55:
        risk_factors.append('Advanced age (>55 years)')
    if input_data['smokingStatus'] != 'Never':
        risk_factors.append(f"{input_data['smokingStatus']} smoker with {input_data.get('smokingPackYears', 0)} pack-years")
    if float(input_data['cfDNATotal']) > 30:
        risk_factors.append('Elevated cfDNA levels (>30 ng/mL)')
    if float(input_data['fragmentScore']) > 0.3:
        risk_factors.append('Abnormal DNA fragmentation pattern')
    if float(input_data['shortFragmentRatio']) > 0.35:
        risk_factors.append('Elevated short fragment ratio')
    if input_data['tp53Mut'] == '1':
        vaf = float(input_data.get('tp53VAF', 0))
        risk_factors.append(f'TP53 mutation detected (VAF: {vaf:.2%})')
    if input_data['krasMut'] == '1':
        vaf = float(input_data.get('krasVAF', 0))
        risk_factors.append(f'KRAS mutation detected (VAF: {vaf:.2%})')
    if float(input_data['cea']) > 5:
        risk_factors.append(f'Elevated CEA tumor marker ({input_data["cea"]} ng/mL)')
    if input_data.get('familyHistory') == 'Yes':
        risk_factors.append('Positive family history of cancer')
    if input_data.get('previousCancer') == 'Yes':
        risk_factors.append('Previous cancer diagnosis')
    if input_data.get('chronicLungDisease') == 'Yes':
        risk_factors.append('Chronic lung disease present')
    
    # Generate analysis based on risk score
    if risk_score >= 70:
        analysis = f"High-risk profile detected by enhanced ML model (LightGBM). The model predicts {risk_score}% probability of early-stage lung cancer based on {len(risk_factors)} significant risk factors. The combination of biomarker abnormalities, genetic mutations, and clinical factors indicates substantial concern requiring immediate medical evaluation."
        recommendations = [
            'Schedule high-resolution CT scan within 1-2 weeks',
            'Urgent pulmonology consultation recommended',
            'Consider PET-CT scan for comprehensive staging',
            'Complete metabolic panel and additional tumor markers',
            'Discuss tissue biopsy options with oncology team',
            'Genetic counseling if mutations detected'
        ]
        urgency = 'High'
        clinical_alerts = [
            'Multiple high-risk biomarkers detected',
            'Immediate medical evaluation required',
            'Consider expedited diagnostic workup',
            'Multidisciplinary team consultation recommended'
        ]
    elif risk_score >= 30:
        analysis = f"Moderate risk assessment by enhanced ML model. The model predicts {risk_score}% probability based on {len(risk_factors)} identified risk factors. While not immediately alarming, the presence of concerning biomarkers warrants continued surveillance and proactive health management."
        recommendations = [
            'Follow-up screening in 3-6 months',
            'Annual low-dose CT screening recommended',
            'Smoking cessation counseling if applicable',
            'Maintain healthy lifestyle and regular exercise',
            'Monitor for new respiratory symptoms',
            'Consider repeat biomarker testing in 6 months'
        ]
        urgency = 'Moderate'
        clinical_alerts = []
        if input_data['tp53Mut'] == '1' or input_data['krasMut'] == '1':
            clinical_alerts.append('Genetic mutations detected - consider genetic counseling')
        if float(input_data['cfDNATotal']) > 35:
            clinical_alerts.append('Significantly elevated cfDNA - close monitoring advised')
    else:
        analysis = f"Low-risk profile assessed by enhanced ML model. The model predicts {risk_score}% probability with {len(risk_factors)} minor factors identified. Current biomarker levels are within acceptable ranges. Continue routine health maintenance and standard screening protocols."
        recommendations = [
            'Continue annual health screenings',
            'Maintain healthy lifestyle choices',
            'Regular exercise (150+ minutes/week)',
            'Balanced nutrition with antioxidant-rich foods',
            'Avoid tobacco and limit alcohol consumption',
            'Report any new respiratory symptoms promptly'
        ]
        urgency = 'Standard'
        clinical_alerts = []
    
    # Calculate confidence
    confidence = 0.92 if len(risk_factors) >= 3 else 0.85
    uncertainty = 1 - confidence
    is_uncertain = confidence < 0.85 or (30 <= risk_score <= 70)
    
    return {
        'risk_score': risk_score,
        'analysis': analysis,
        'recommendations': recommendations,
        'urgency': urgency,
        'confidence': confidence,
        'uncertainty': uncertainty,
        'is_uncertain': is_uncertain,
        'risk_factors': risk_factors,
        'clinical_alerts': clinical_alerts
    }

def predict_sample(input_data):
    """Make prediction using the enhanced model."""
    try:
        # Load model
        model_package = load_model()
        model = model_package['model']
        model_name = model_package['model_name']
        label_encoders = model_package['label_encoders']
        scaler = model_package['scaler']
        feature_names = model_package['feature_names']
        metrics = model_package['metrics']
        
        # Preprocess input
        X = preprocess_input(input_data, label_encoders, scaler, feature_names)
        
        # Make prediction
        prediction_proba = model.predict_proba(X)[0][1]
        risk_score = int(prediction_proba * 100)
        
        # Ensure reasonable bounds
        risk_score = max(5, min(95, risk_score))
        
        # Generate detailed analysis
        result = generate_analysis(risk_score, input_data)
        
        return {
            'success': True,
            'result': result,
            'model_type': 'enhanced_ml',
            'model_name': model_name,
            'model_performance': {
                'roc_auc': metrics['roc_auc'],
                'accuracy': metrics['accuracy'],
                'precision': metrics['precision'],
                'recall': metrics['recall']
            }
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'model_type': 'enhanced_ml'
        }

def main():
    """Main function to handle command line input."""
    if len(sys.argv) != 2:
        print(json.dumps({'success': False, 'error': 'Invalid arguments'}))
        sys.exit(1)
    
    try:
        # Parse input JSON
        input_data = json.loads(sys.argv[1])
        
        # Make prediction
        result = predict_sample(input_data)
        
        # Output result as JSON
        print(json.dumps(result))
        
    except json.JSONDecodeError:
        print(json.dumps({'success': False, 'error': 'Invalid JSON input'}))
        sys.exit(1)
    except Exception as e:
        print(json.dumps({'success': False, 'error': str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
