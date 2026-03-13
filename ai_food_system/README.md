# AI-Powered Food Scarcity and Surplus Prediction System

An AI-powered web application that predicts food scarcity, normal supply, or surplus for various crops in Andhra Pradesh, India. Built with a full-stack architecture utilizing Python, Scikit-Learn, FastAPI, and React.js.

## System Architecture

1. **Dataset Generation Layer**: Python scripts synthesize historical agricultural data for Andhra Pradesh districts including crop yield, population demand, weather features.
2. **Machine Learning Pipeline**: Random Forest, XGBoost, and Logistic Regression models are trained and evaluated to map `Production` vs `Demand`. The best pipeline (with `StandardScaler` and `OneHotEncoder`) is exported via joblib.
3. **Prediction API**: A FastAPI service exposing a `/predict` endpoint that takes region, population, and crop inputs and returns the predicted label along with a confidence score.
4. **React Frontend**: A modern, glassmorphism-themed React.js frontend bootstrapped with Vite that acts as the user interface for the AI models.

## Repository Structure

```
ai_food_system/
├── backend/
│   ├── requirements.txt         # Python dependencies
│   ├── dataset_generator.py     # Creates synthetic AP agricultural dataset
│   ├── model_training.py        # ML training pipeline building and exporting
│   └── prediction_api.py        # FastAPI server
└── frontend/
    ├── package.json             # Node dependencies
    ├── vite.config.js           # Vite builder settings
    ├── index.html               # VDOM entry
    └── src/                     # React components and Glassmorphic CSS
```

## Running the Project Locally

### 1. Setup the Backend (Machine Learning & API)

Ensure you have Python 3.8+ installed.

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Generate the synthetic historical dataset inside backend/data/
python dataset_generator.py

# Train the ML models and save the best pipeline to backend/models/
python model_training.py

# Start the Prediction FastAPI Server (runs on http://localhost:8000)
uvicorn prediction_api:app --reload
```

### 2. Setup the Frontend (React UI)

Ensure you have Node.js and NPM installed. Open a new terminal window.

```bash
cd frontend

# Install dependencies
npm install

# Start the Vite development server (runs typically on http://localhost:5173)
npm run dev
```

## Usage
Once both the API and the React UI are running, visit `http://localhost:5173` in your browser. 
Select the district in Andhra Pradesh, input the population metric and the estimated crop factors to generate a live AI prediction.

## Future Deployment
For deployment, refer to standard hosting configurations:
- **Backend API**: Can be hosted on Render or Heroku using `uvicorn prediction_api:app --host 0.0.0.0 --port $PORT`.
- **Frontend App**: Can be built using `npm run build` and hosted statically via Vercel or Netlify.
