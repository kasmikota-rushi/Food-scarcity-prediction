import pandas as pd
import numpy as np
import os
import joblib

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder, LabelEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, classification_report

def load_and_preprocess_data(filepath='data/agricultural_data.csv'):
    df = pd.read_csv(filepath)

    # Label Creation Logic
    # Food_Balance = Production - Demand
    df['Food_Balance'] = df['Production'] - df['Demand']

    # Label rules
    def get_label(row):
        # Using a 5% buffer for 'Normal'
        lower_bound = row['Demand'] * 0.95
        upper_bound = row['Demand'] * 1.05
        
        if row['Production'] < lower_bound:
            return 'Scarcity'
        elif row['Production'] > upper_bound:
            return 'Surplus'
        else:
            return 'Normal'

    df['Target'] = df.apply(get_label, axis=1)

    # Features and Target
    # User inputs: Region, Population, Season, Crop
    # Also include Rainfall, Temperature
    X = df[['District', 'Crop', 'Season', 'Population', 'Rainfall', 'Temperature', 'Area_Cultivated']]
    y = df['Target']

    # Label encode target
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)
    
    # Save the label classes to know mapping later
    joblib.dump(le, 'models/label_encoder.joblib')

    return X, y_encoded, le.classes_

def train_and_evaluate_models(X, y, target_names):
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    # Define Preprocessor
    categorical_features = ['District', 'Crop', 'Season']
    numeric_features = ['Population', 'Rainfall', 'Temperature', 'Area_Cultivated']

    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numeric_features),
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
        ])

    models = {
        'Logistic Regression': LogisticRegression(max_iter=1000, random_state=42),
        'Random Forest': RandomForestClassifier(n_estimators=100, random_state=42),
        'XGBoost': XGBClassifier(use_label_encoder=False, eval_metric='mlogloss', random_state=42)
    }

    best_model_name = None
    best_model_pipeline = None
    best_accuracy = 0

    print("--- Model Evaluation ---")
    for name, model in models.items():
        pipeline = Pipeline(steps=[('preprocessor', preprocessor), ('model', model)])
        
        pipeline.fit(X_train, y_train)
        y_pred = pipeline.predict(X_test)
        
        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred, average='weighted', zero_division=0)
        rec = recall_score(y_test, y_pred, average='weighted', zero_division=0)
        f1 = f1_score(y_test, y_pred, average='weighted', zero_division=0)
        
        print(f"\\nModel: {name}")
        print(f"Accuracy:  {acc:.4f}")
        print(f"Precision: {prec:.4f}")
        print(f"Recall:    {rec:.4f}")
        print(f"F1-Score:  {f1:.4f}")
        print("Confusion Matrix:")
        print(confusion_matrix(y_test, y_pred))
        print("Classification Report:")
        print(classification_report(y_test, y_pred, target_names=target_names, zero_division=0))

        if acc > best_accuracy:
            best_accuracy = acc
            best_model_name = name
            best_model_pipeline = pipeline

    print(f"\\nBest Model Selected: {best_model_name} with Accuracy Core: {best_accuracy:.4f}")
    
    # Save best model pipeline
    os.makedirs('models', exist_ok=True)
    joblib.dump(best_model_pipeline, 'models/best_model_pipeline.joblib')
    print("Best model pipeline saved to models/best_model_pipeline.joblib")

if __name__ == "__main__":
    X, y, target_names = load_and_preprocess_data()
    train_and_evaluate_models(X, y, target_names)
