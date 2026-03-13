from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import pandas as pd
import joblib
import os

app = FastAPI(title="AI Food Scarcity Prediction API")

# Enable CORS for frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins, restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the model and label encoder globally (if they exist)
# In a real scenario, this would check if models exist and load them at startup.
MODEL_PATH = "models/best_model_pipeline.joblib"
LABEL_ENCODER_PATH = "models/label_encoder.joblib"

pipeline = None
label_encoder = None

@app.on_event("startup")
def load_model():
    global pipeline, label_encoder
    if os.path.exists(MODEL_PATH) and os.path.exists(LABEL_ENCODER_PATH):
        pipeline = joblib.load(MODEL_PATH)
        label_encoder = joblib.load(LABEL_ENCODER_PATH)
        print("Model and Label Encoder loaded successfully.")
    else:
        print("Warning: Model files not found. Please run model_training.py first.")

class PredictionRequest(BaseModel):
    region: str
    population: int
    season: str
    crop: str
    rainfall: float = 800.0  # Default or fetched from a weather API
    temperature: float = 28.5  # Default or fetched from a weather API
    area_cultivated: float = 10000.0 # Default assumption if user doesn't provide

class PredictionResponse(BaseModel):
    prediction: str
    confidence: float
    message: str
    recommendation: Optional[str] = None

@app.post("/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest):
    if pipeline is None or label_encoder is None:
        raise HTTPException(status_code=503, detail="Model is not loaded. Please train the model first.")

    # Convert request to DataFrame
    input_data = pd.DataFrame([{
        'District': request.region,
        'Crop': request.crop,
        'Season': request.season,
        'Population': request.population,
        'Rainfall': request.rainfall,
        'Temperature': request.temperature,
        'Area_Cultivated': request.area_cultivated
    }])

    try:
        # Predict probability
        probs = pipeline.predict_proba(input_data)[0]
        # Predict class
        pred_class_idx = pipeline.predict(input_data)[0]
        
        # Get probability of predicted class
        confidence = float(probs[pred_class_idx])
        
        # Decode label
        predicted_label = label_encoder.inverse_transform([pred_class_idx])[0]

        message = ""
        recommendation = None
        if predicted_label == "Scarcity":
            message = "Warning: Predicted production is less than demand."
            # Find an alternative crop with lower water footprint (e.g., if Rice, suggest Maize/Groundnut)
            if request.crop == "Rice":
                recommendation = "Consider rotating to Maize or Groundnut which require less water."
            elif request.crop == "Sugarcane":
                recommendation = "Consider shifting to Cotton or pulses due to expected scarcity."
            else:
                recommendation = "Consider drought-resistant variants or investing in better irrigation."
        elif predicted_label == "Surplus":
            message = "Good news: Expected a surplus in production."
            recommendation = "Consider export opportunities or improving storage infrastructure to prevent waste."
        else:
            message = "Supply is expected to meet demand normally."
            recommendation = "Maintain current practices."

        return PredictionResponse(
            prediction=predicted_label,
            confidence=round(confidence * 100, 2),
            message=message,
            recommendation=recommendation
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def root():
    return {"message": "Welcome to the AI Food Scarcity Prediction API. Use the /predict endpoint for predictions."}
