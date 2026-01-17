"""
Enhanced ML Service for HelixAI - Python service with advanced ML capabilities
"""
import sys
import json
import os
from enhanced_model import EnhancedLungCancerDetector

def load_or_train_enhanced_model():
    """Load existing enhanced model or train a new one."""
    model_path = 'enhanced_lung_cancer_model.joblib'
    
    try:
        # Try to load existing model
        detector = EnhancedLungCancerDetector.load(model_path)
        return detector
    except (FileNotFoundError, Exception):
        # Train new enhanced model if loading fails
        detector = EnhancedLungCancerDetector(
            use_advanced_features=True,
            use_deep_learning=True
        )
        detector.train_enhanced_model(n_samples=8000)
        detector.save(model_path)
        return detector

def predict_sample_enhanced(input_data):
    """Make enhanced prediction for a single sample."""
    try:
        # Load enhanced model
        detector = load_or_train_enhanced_model()
        
        # Convert input data to the format expected by the enhanced model
        sample_data = {
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
        
        # Add advanced features if available
        if 'alcoholConsumption' in input_data:
            sample_data['Alcohol_consumption'] = input_data['alcoholConsumption']
        if 'occupationalExposure' in input_data:
            sample_data['Occupational_exposure'] = input_data['occupationalExposure']
        if 'exerciseFrequency' in input_data:
            sample_data['Exercise_frequency'] = input_data['exerciseFrequency']
        
        # Make enhanced prediction
        result = detector.predict_with_clinical_support(sample_data)
        
        return {
            'success': True,
            'result': result,
            'model_type': 'enhanced',
            'features_used': len(sample_data)
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'model_type': 'enhanced'
        }

def main():
    """Main function to handle command line input."""
    if len(sys.argv) != 2:
        print(json.dumps({'success': False, 'error': 'Invalid arguments'}))
        sys.exit(1)
    
    try:
        # Parse input JSON
        input_data = json.loads(sys.argv[1])
        
        # Make enhanced prediction
        result = predict_sample_enhanced(input_data)
        
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