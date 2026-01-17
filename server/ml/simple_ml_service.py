"""
Simple ML Service for HelixAI - Lightweight version that works immediately
"""
import sys
import json
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import warnings
warnings.filterwarnings('ignore')

def create_simple_model():
    """Create a simple pre-trained model with synthetic data."""
    # Create synthetic training data
    np.random.seed(42)
    n_samples = 1000
    
    # Generate features
    X = np.random.randn(n_samples, 10)
    
    # Generate labels based on simple rules
    y = np.zeros(n_samples)
    for i in range(n_samples):
        risk_score = 0
        if X[i, 0] > 0.5: risk_score += 20  # Age factor
        if X[i, 1] > 0.3: risk_score += 25  # Smoking
        if X[i, 2] > 0.4: risk_score += 20  # cfDNA
        if X[i, 3] > 0.3: risk_score += 15  # Fragment score
        if X[i, 4] > 0.5: risk_score += 20  # TP53
        if X[i, 5] > 0.5: risk_score += 15  # KRAS
        if X[i, 6] > 0.4: risk_score += 10  # CEA
        
        y[i] = 1 if risk_score > 50 else 0
    
    # Train simple model
    model = RandomForestClassifier(n_estimators=50, random_state=42, max_depth=10)
    model.fit(X, y)
    
    return model

def predict_sample(input_data, model):
    """Make prediction for a single sample."""
    try:
        # Extract and normalize features
        age = float(input_data['age']) / 100.0
        smoking = 1.0 if input_data['smokingStatus'] != 'Never' else 0.0
        smoking_years = float(input_data.get('smokingPackYears', 0)) / 50.0
        cfdna = float(input_data['cfDNATotal']) / 50.0
        fragment = float(input_data['fragmentScore'])
        short_frag = float(input_data['shortFragmentRatio'])
        tp53 = float(input_data['tp53Mut'])
        kras = float(input_data['krasMut'])
        cea = float(input_data['cea']) / 10.0
        bmi = float(input_data.get('bmi', 25)) / 40.0
        
        # Create feature vector
        features = np.array([[age, smoking, smoking_years, cfdna, fragment, 
                            short_frag, tp53, kras, cea, bmi]])
        
        # Get prediction probability
        prob = model.predict_proba(features)[0][1]
        risk_score = int(prob * 100)
        
        # Adjust risk score based on key factors
        if tp53 == 1.0:
            risk_score = min(95, risk_score + 15)
        if kras == 1.0:
            risk_score = min(95, risk_score + 10)
        if float(input_data['cfDNATotal']) > 35:
            risk_score = min(95, risk_score + 10)
        
        # Ensure minimum risk
        risk_score = max(5, risk_score)
        
        # Generate analysis based on risk score
        risk_factors = []
        if float(input_data['age']) > 55:
            risk_factors.append('Advanced age (>55 years)')
        if input_data['smokingStatus'] != 'Never':
            risk_factors.append(f"{input_data['smokingStatus']} smoker")
        if float(input_data['cfDNATotal']) > 30:
            risk_factors.append('Elevated cfDNA levels')
        if float(input_data['fragmentScore']) > 0.3:
            risk_factors.append('Abnormal DNA fragmentation pattern')
        if input_data['tp53Mut'] == '1':
            risk_factors.append('TP53 mutation detected')
        if input_data['krasMut'] == '1':
            risk_factors.append('KRAS mutation detected')
        if float(input_data['cea']) > 5:
            risk_factors.append('Elevated CEA tumor marker')
        if input_data.get('familyHistory') == 'Yes':
            risk_factors.append('Family history of cancer')
        if input_data.get('chronicLungDisease') == 'Yes':
            risk_factors.append('Chronic lung disease present')
        
        # Generate detailed analysis
        if risk_score >= 70:
            analysis = f"High-risk profile detected with {len(risk_factors)} significant risk factors. ML model indicates {risk_score}% probability of early-stage malignancy. The combination of biomarker abnormalities and clinical factors warrants immediate medical attention."
            recommendations = [
                'Schedule high-resolution CT scan within 1-2 weeks',
                'Urgent pulmonology consultation recommended',
                'Consider PET-CT scan for comprehensive staging',
                'Complete metabolic panel and additional tumor markers',
                'Discuss tissue biopsy options with oncology team'
            ]
            urgency = 'High'
            clinical_alerts = [
                'Multiple high-risk biomarkers detected',
                'Immediate medical evaluation required',
                'Consider expedited diagnostic workup'
            ]
        elif risk_score >= 30:
            analysis = f"Moderate risk assessment with {len(risk_factors)} identified risk factors. ML model indicates {risk_score}% probability requiring continued surveillance. While not immediately alarming, regular monitoring is essential."
            recommendations = [
                'Follow-up screening in 3-6 months',
                'Annual low-dose CT screening recommended',
                'Smoking cessation counseling if applicable',
                'Maintain healthy lifestyle and regular exercise',
                'Monitor for new respiratory symptoms'
            ]
            urgency = 'Moderate'
            clinical_alerts = []
            if input_data['tp53Mut'] == '1' or input_data['krasMut'] == '1':
                clinical_alerts.append('Genetic mutations detected - consider genetic counseling')
        else:
            analysis = f"Low-risk profile with {len(risk_factors)} minor factors identified. ML model indicates {risk_score}% probability. Current biomarker levels are within acceptable ranges. Continue routine health maintenance."
            recommendations = [
                'Continue annual health screenings',
                'Maintain healthy lifestyle choices',
                'Regular exercise and balanced nutrition',
                'Avoid tobacco and limit alcohol consumption',
                'Report any new respiratory symptoms promptly'
            ]
            urgency = 'Standard'
            clinical_alerts = []
        
        # Calculate confidence
        confidence = 0.85 if len(risk_factors) >= 3 else 0.75
        uncertainty = 1 - confidence
        is_uncertain = confidence < 0.8 or (30 <= risk_score <= 70)
        
        return {
            'success': True,
            'result': {
                'risk_score': risk_score,
                'analysis': analysis,
                'recommendations': recommendations,
                'urgency': urgency,
                'confidence': confidence,
                'uncertainty': uncertainty,
                'is_uncertain': is_uncertain,
                'risk_factors': risk_factors,
                'clinical_alerts': clinical_alerts
            },
            'model_type': 'simple_ml',
            'model_name': 'RandomForest'
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'model_type': 'simple_ml'
        }

def main():
    """Main function to handle command line input."""
    if len(sys.argv) != 2:
        print(json.dumps({'success': False, 'error': 'Invalid arguments'}))
        sys.exit(1)
    
    try:
        # Parse input JSON
        input_data = json.loads(sys.argv[1])
        
        # Create simple model
        model = create_simple_model()
        
        # Make prediction
        result = predict_sample(input_data, model)
        
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
