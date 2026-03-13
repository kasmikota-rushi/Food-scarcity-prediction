import pandas as pd
import numpy as np
import os

def generate_agricultural_data(num_records=5000):
    np.random.seed(42)

    districts = [
        'Anantapur', 'Chittoor', 'East Godavari', 'Guntur', 'Krishna', 
        'Kurnool', 'Prakasam', 'Srikakulam', 'Sri Potti Sriramulu Nellore', 
        'Visakhapatnam', 'Vizianagaram', 'West Godavari', 'YSR Kadapa'
    ]
    crops = ['Rice', 'Maize', 'Groundnut', 'Cotton', 'Sugarcane', 'Chilies']
    seasons = ['Kharif', 'Rabi', 'Summer']
    years = list(range(2010, 2024))

    data = {
        'District': np.random.choice(districts, num_records),
        'Crop': np.random.choice(crops, num_records),
        'Season': np.random.choice(seasons, num_records),
        'Year': np.random.choice(years, num_records),
    }

    df = pd.DataFrame(data)

    # Base characteristics for crops
    # Area (hectares)
    df['Area_Cultivated'] = np.random.randint(1000, 50000, size=num_records)
    
    # Rainfall (mm)
    df['Rainfall'] = np.random.uniform(300, 1200, size=num_records)
    
    # Temperature (Celsius)
    df['Temperature'] = np.random.uniform(22.0, 38.0, size=num_records)

    # Population varies roughly by district (in hundred thousands)
    district_pop = {d: np.random.randint(15, 50)*100000 for d in districts}
    df['Population'] = df['District'].map(district_pop)

    # Yield per hectare varies by crop
    yield_multiplier = {
        'Rice': 3.5,
        'Maize': 4.0,
        'Groundnut': 1.5,
        'Cotton': 0.8,
        'Sugarcane': 70.0,
        'Chilies': 2.0
    }
    
    # Base production calculation
    df['Production'] = df['Area_Cultivated'] * df['Crop'].map(yield_multiplier)
    
    # Add some random variance to production based on rainfall and temperature
    df['Production'] = df['Production'] * np.random.uniform(0.7, 1.3, size=num_records)

    # Determine market demand (Base demand per capita based on crop type)
    # E.g., Rice has higher demand
    per_capita_demand = {
        'Rice': 0.1,      # 100 kg per person per year
        'Maize': 0.05,
        'Groundnut': 0.02,
        'Cotton': 0.01,
        'Sugarcane': 0.2,
        'Chilies': 0.005
    }
    
    # Base demand = population * per capita demand
    # Introduce regional/yearly variance
    df['Demand'] = df['Population'] * df['Crop'].map(per_capita_demand) * np.random.uniform(0.8, 1.5, size=num_records)
    
    # Rounding numeric columns
    df['Production'] = df['Production'].round(2)
    df['Demand'] = df['Demand'].round(2)
    df['Rainfall'] = df['Rainfall'].round(2)
    df['Temperature'] = df['Temperature'].round(2)

    os.makedirs('data', exist_ok=True)
    file_path = 'data/agricultural_data.csv'
    df.to_csv(file_path, index=False)
    print(f"Generated {num_records} records of synthetic data at {file_path}")

if __name__ == "__main__":
    generate_agricultural_data()
