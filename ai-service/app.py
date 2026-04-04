import os
import io
import re
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import pytesseract
from transformers import pipeline
import pandas as pd
from prophet import Prophet
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Security: Only allow requests from the Node.js backend
allowed_origin = os.getenv('ALLOWED_ORIGIN', '*')
CORS(app, resources={r"/*": {"origins": allowed_origin}})

# Initialize ML Models (Lazy loading or global based on memory constraints)
# For a production app, these would be robustly deployed, but here they run in the same container.
print("Loading NLP Models (Zero-Shot Classifier & Sentiment)...")
try:
    classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")
    sentiment_analyzer = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")
except Exception as e:
    print(f"Warning: Failed to load HuggingFace models. {e}")
    classifier = None
    sentiment_analyzer = None

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'OK', 'service': 'agro-ai-microservice'})

@app.route('/ocr', methods=['POST'])
def process_ocr():
    data = request.json
    image_url = data.get('imageUrl')
    
    if not image_url:
        return jsonify({'error': 'imageUrl is required'}), 400

    try:
        response = requests.get(image_url)
        img = Image.open(io.BytesIO(response.content))
        
        # Perform OCR
        raw_text = pytesseract.image_to_string(img)
        
        # Extract rudimentary fields using Regex
        aadhaar_match = re.search(r'\b\d{4}\s\d{4}\s\d{4}\b', raw_text)
        pan_match = re.search(r'\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b', raw_text)
        
        extracted_fields = {}
        if aadhaar_match:
            extracted_fields['aadhaar'] = aadhaar_match.group()
        if pan_match:
            extracted_fields['pan'] = pan_match.group()

        # Simulated Confidence Score (Tesseract doesn't give a fast global score out-of-the-box in basic bindings)
        # We will estimate confidence based on dictionary words or assume a baseline.
        confidence = 0.85 
        if len(raw_text.strip()) < 10:
            confidence = 0.2

        return jsonify({
            'rawText': raw_text,
            'extractedFields': extracted_fields,
            'confidence': confidence
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/nlp/analyze', methods=['POST'])
def analyze_nlp():
    data = request.json
    text = data.get('text')
    
    if not text:
        return jsonify({'error': 'text is required'}), 400

    try:
        if not classifier or not sentiment_analyzer:
            # Fallback if models didn't load
            return jsonify({
                'detectedCategory': 'other',
                'urgencyScore': 0.5,
                'sentimentScore': 0.5,
                'keywords': []
            }), 200

        # Sentiment
        sent_result = sentiment_analyzer(text)[0]
        # NEGATIVE / POSITIVE
        sentiment_score = sent_result['score'] if sent_result['label'] == 'POSITIVE' else (1 - sent_result['score'])

        # Categorization
        candidate_labels = [
            'subsidy delay', 'wrong rejection', 'officer misconduct', 
            'insurance issue', 'land record error', 'scheme query'
        ]
        class_result = classifier(text, candidate_labels)
        detected_category = class_result['labels'][0].replace(' ', '_')
        
        # Urgency scoring heuristic
        urgency_labels = ['urgent', 'emergency', 'desperate', 'routine', 'inquiry']
        urgency_result = classifier(text, urgency_labels)
        urgent_score = 0.0
        for i, label in enumerate(urgency_result['labels']):
            if label in ['urgent', 'emergency', 'desperate']:
                urgent_score += urgency_result['scores'][i]

        return jsonify({
            'detectedCategory': detected_category,
            'urgencyScore': min(round(urgent_score * 1.5, 2), 1.0),
            'sentimentScore': round(sentiment_score, 2),
            'keywords': [] # Simplified for now, could use KeyBERT
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/predict', methods=['POST'])
def predict_trends():
    data = request.json
    historical_data = data.get('historicalData', [])
    forecast_days = data.get('forecastDays', 30)
    
    if not historical_data or len(historical_data) < 5:
        return jsonify({'error': 'Not enough historical data provided. Minimum 5 datapoints required.'}), 400

    try:
        df = pd.DataFrame(historical_data)
        df.rename(columns={'date': 'ds', 'count': 'y'}, inplace=True)
        df['ds'] = pd.to_datetime(df['ds'])

        m = Prophet(daily_seasonality=True, yearly_seasonality=False)
        m.fit(df)
        
        future = m.make_future_dataframe(periods=forecast_days)
        forecast = m.predict(future)
        
        # Filter to only the future predictions
        future_forecast = forecast[['ds', 'yhat']].tail(forecast_days)
        
        results = [
            {'date': row['ds'].strftime('%Y-%m-%d'), 'predictedVolume': max(0, int(row['yhat']))}
            for _, row in future_forecast.iterrows()
        ]

        return jsonify({
            'forecastDays': forecast_days,
            'predictions': results
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5002))
    app.run(host='0.0.0.0', port=port)
