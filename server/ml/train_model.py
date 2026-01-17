"""
Train the HelixAI Lung Cancer Detection Model
"""
from lung_cancer_model import HelixLungCancerDetector

def main():
    print("=" * 60)
    print("HelixAI Lung Cancer Detection Model Training")
    print("=" * 60)
    
    # Initialize and train model
    print("\n1. Initializing model...")
    detector = HelixLungCancerDetector(model_type='xgboost')
    
    print("2. Training with synthetic data...")
    metrics = detector.train_with_synthetic_data(n_samples=2000)
    
    print("\n3. Training Results:")
    print(f"   Accuracy:  {metrics['accuracy']:.4f}")
    print(f"   Precision: {metrics['precision']:.4f}")
    print(f"   Recall:    {metrics['recall']:.4f}")
    print(f"   F1 Score:  {metrics['f1']:.4f}")
    print(f"   ROC AUC:   {metrics['roc_auc']:.4f}")
    
    # Feature importance
    if detector.feature_importance:
        print("\n4. Feature Importance:")
        sorted_importance = sorted(detector.feature_importance.items(), key=lambda x: x[1], reverse=True)
        for feature, importance in sorted_importance:
            print(f"   {feature}: {importance:.4f}")
    
    # Save model
    print("\n5. Saving model...")
    model_path = detector.save()
    print(f"   Model saved to: {model_path}")
    
    # Test prediction
    print("\n6. Testing prediction...")
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
    print(f"   Risk Score: {result['risk_score']}%")
    print(f"   Risk Level: {result['risk_level']}")
    print(f"   Analysis: {result['analysis'][:100]}...")
    
    print("\n" + "=" * 60)
    print("Training complete! Model ready for use.")
    print("=" * 60)

if __name__ == "__main__":
    main()