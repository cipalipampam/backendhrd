import sys
import json
import pickle
import pandas as pd
import numpy as np
import os

def load_model():
    """Load model, scaler, dan encoders"""
    try:
        # Get the directory where this script is located
        script_dir = os.path.dirname(os.path.abspath(__file__))
        
        with open(os.path.join(script_dir, 'scaler.pkl'), 'rb') as f:
            scaler = pickle.load(f)
        
        with open(os.path.join(script_dir, 'encoders.pkl'), 'rb') as f:
            encoders = pickle.load(f)
        
        with open(os.path.join(script_dir, 'DecisionTree_model.pkl'), 'rb') as f:
            model = pickle.load(f)
        
        return model, scaler, encoders
    except Exception as e:
        raise Exception(f"Error loading model files: {str(e)}")

def preprocess_input(data, encoders, scaler):
    """Preprocess input data"""
    try:
        # Buat DataFrame dari input
        df = pd.DataFrame([data])
        
        # Encode categorical features
        categorical_features = ['departemen', 'pendidikan', 'gender', 'jalur_rekrut']
        
        for feature in categorical_features:
            if feature in encoders and feature in df.columns:
                le = encoders[feature]
                df[feature] = le.transform(df[feature])
        
        # Urutkan kolom sesuai dengan training
        feature_order = [
            'departemen', 'pendidikan', 'gender', 'jalur_rekrut',
            'jumlah_pelatihan', 'umur', 'lama_bekerja', 
            'KPI_>80%', 'penghargaan', 'rata_rata_score_pelatihan'
        ]
        
        df = df[feature_order]
        
        # Scale features
        df_scaled = scaler.transform(df)
        
        return df_scaled
    except Exception as e:
        raise Exception(f"Error preprocessing data: {str(e)}")

def predict(input_data):
    """Main prediction function"""
    try:
        model, scaler, encoders = load_model()
        
        # Preprocess input
        processed_data = preprocess_input(input_data, encoders, scaler)
        
        # Predict
        prediction = model.predict(processed_data)
        prediction_proba = model.predict_proba(processed_data)
        
        result = {
            'prediction': int(prediction[0]),
            'probability': {
                'tidak_promosi': float(prediction_proba[0][0]),
                'promosi': float(prediction_proba[0][1])
            },
            'confidence': float(max(prediction_proba[0]))
        }
        
        return result
    
    except Exception as e:
        return {'error': str(e)}

if __name__ == '__main__':
    try:
        # Baca input dari command line argument
        if len(sys.argv) < 2:
            print(json.dumps({'error': 'No input data provided'}))
            sys.exit(1)
        
        input_json = sys.argv[1]
        input_data = json.loads(input_json)
        
        # Predict
        result = predict(input_data)
        
        # Output hasil sebagai JSON
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({'error': str(e)}))
        sys.exit(1)