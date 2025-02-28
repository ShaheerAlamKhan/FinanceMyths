#!/usr/bin/env python
"""
Build script for Financial Myths Debunked GitHub Pages site

This script:
1. Processes raw data into processed format
2. Generates static JSON files with visualization data
3. Copies all necessary files to the docs/ directory
"""

import os
import json
import shutil
import pandas as pd
import numpy as np
from pathlib import Path
import plotly.graph_objects as go
import plotly.express as px
import plotly.io as pio

# Add the project root to the Python path
import sys
sys.path.append(str(Path(__file__).parent.parent))

# Import data processors
try:
    from src.data_processing.processors.google_trends_processor import (
        fetch_google_trends_data, 
        process_google_trends_data
    )
except ImportError:
    print("Warning: Google Trends processor not found. Using dummy data.")
    
    # Dummy data functions if imports fail
    def fetch_google_trends_data(search_terms, start_year, end_year):
        """Generate dummy Google Trends data"""
        years = list(range(start_year, end_year + 1))
        data = []
        
        for year in years:
            for term in search_terms:
                # Simulate increasing popularity for newer terms
                if term in ["crypto", "nft", "fintech"]:
                    base_volume = max(0, (year - 2010) * 10)
                else:
                    base_volume = 100 - max(0, (year - 2010) * 5)
                    
                # Add some randomness
                volume = max(0, min(100, base_volume + np.random.normal(0, 10)))
                
                data.append({
                    "year": year,
                    "term": term,
                    "search_volume": volume
                })
        
        return pd.DataFrame(data)

    def process_google_trends_data(data):
        """Process dummy Google Trends data"""
        processed = data.copy()
        
        # Normalize search volumes for each year
        for year in processed["year"].unique():
            year_mask = processed["year"] == year
            max_volume = processed.loc[year_mask, "search_volume"].max()
            
            if max_volume > 0:  # Avoid division by zero
                processed.loc[year_mask, "normalized_volume"] = processed.loc[year_mask, "search_volume"] / max_volume
            else:
                processed.loc[year_mask, "normalized_volume"] = 0
        
        # Calculate positions for word cloud (simplified approach)
        for year in processed["year"].unique():
            year_data = processed[processed["year"] == year]
            num_terms = len(year_data)
            
            # Create a spiral layout
            angles = np.linspace(0, 8 * np.pi, num_terms)
            radii = np.linspace(0, 1, num_terms)
            
            x_positions = radii * np.cos(angles)
            y_positions = radii * np.sin(angles)
            
            processed.loc[processed["year"] == year, "x_position"] = x_positions
            processed.loc[processed["year"] == year, "y_position"] = y_positions
        
        # Assign colors based on search volume
        processed["color"] = processed["normalized_volume"].apply(
            lambda x: f"rgb({int(255 * (1 - x))}, {int(255 * (1 - x))}, 255)"
        )
        
        return processed

def ensure_dir(path):
    """Ensure directory exists"""
    os.makedirs(path, exist_ok=True)

def generate_visualization_1_data():
    """Generate data for Visualization 1: Financial Advice Landscape"""
    print("Generating data for Visualization 1...")
    
    # Define search terms
    search_terms = [
        "investing", "stocks", "bonds", "mutual funds", 
        "retirement", "401k", "ira", "financial advisor",
        "crypto", "bitcoin", "nft", "fintech",
        "personal finance", "budget", "save money", "debt"
    ]
    
    # Fetch and process Google Trends data
    raw_data = fetch_google_trends_data(search_terms, 2005, 2023)
    processed_data = process_google_trends_data(raw_data)
    
    # Save processed data
    processed_data_path = Path("data/processed/google_trends_processed.csv")
    ensure_dir(processed_data_path.parent)
    processed_data.to_csv(processed_data_path, index=False)
    
    # Generate financial literacy data (dummy data)
    literacy_data = pd.DataFrame({
        "Generation": ["Baby Boomers", "Gen X", "Millennials", "Gen Z"],
        "FinancialLiteracyScore": [68.5, 62.3, 57.8, 48.2]
    })
    
    literacy_data_path = Path("data/processed/financial_literacy.csv")
    literacy_data.to_csv(literacy_data_path, index=False)
    
    # Prepare data for static site (JSON format)
    # Word cloud data
    word_cloud_data = {"years": [], "data": {}}
    
    for year in sorted(processed_data["year"].unique()):
        word_cloud_data["years"].append(int(year))
        year_data = processed_data[processed_data["year"] == year]
        
        # Select top terms by search volume
        top_terms = year_data.nlargest(8, "search_volume")
        
        word_cloud_data["data"][str(year)] = [
            {
                "term": row["term"],
                "size": int(row["normalized_volume"] * 40) + 10,  # Scale for visualization
                "x": float(row["x_position"]), 
                "y": float(row["y_position"])
            }
            for _, row in top_terms.iterrows()
        ]
    
    # Save data as JSON for the static site
    json_path = Path("docs/js/data/viz1_data.json")
    ensure_dir(json_path.parent)
    
    with open(json_path, 'w') as f:
        json.dump({
            "wordCloud": word_cloud_data,
            "literacy": literacy_data.to_dict(orient="records")
        }, f, indent=2)
    
    print(f"Visualization 1 data saved to {json_path}")

def generate_visualization_2_data():
    """Generate data for Visualization 2: Savings Reality"""
    print("Generating placeholder for Visualization 2...")
    
    # Create placeholder/dummy data for now
    income_brackets = ["Bottom 20%", "Lower Middle 20%", "Middle 20%", "Upper Middle 20%", "Top 20%"]
    
    expenses_data = []
    for bracket in income_brackets:
        # Different expense proportions based on income bracket
        if bracket == "Bottom 20%":
            housing = 40
            food = 20
            healthcare = 15
            transportation = 15
            other = 8
            savings = 2
        elif bracket == "Lower Middle 20%":
            housing = 35
            food = 15
            healthcare = 12
            transportation = 15
            other = 15
            savings = 8
        elif bracket == "Middle 20%":
            housing = 30
            food = 15
            healthcare = 10
            transportation = 15
            other = 15
            savings = 15
        elif bracket == "Upper Middle 20%":
            housing = 25
            food = 12
            healthcare = 10
            transportation = 10
            other = 23
            savings = 20
        else:  # Top 20%
            housing = 20
            food = 10
            healthcare = 5
            transportation = 5
            other = 25
            savings = 35
            
        expenses_data.append({
            "income_bracket": bracket,
            "housing": housing,
            "food": food,
            "healthcare": healthcare,
            "transportation": transportation,
            "other": other,
            "savings": savings
        })
    
    # Save as JSON
    json_path = Path("docs/js/data/viz2_data.json")
    ensure_dir(json_path.parent)
    
    with open(json_path, 'w') as f:
        json.dump(expenses_data, f, indent=2)
    
    print(f"Visualization 2 placeholder data saved to {json_path}")

def generate_visualization_3_data():
    """Generate data for Visualization 3: Investment Returns"""
    print("Generating placeholder for Visualization 3...")
    
    # Create placeholder for Sankey diagram data
    nodes = ["Bottom 20%", "Lower Middle 20%", "Middle 20%", "Upper Middle 20%", "Top 20%",
             "Inheritance", "Stocks", "Real Estate", "Business Equity", "Other Investments",
             "Bottom 20% End", "Lower Middle 20% End", "Middle 20% End", "Upper Middle 20% End", "Top 20% End"]
    
    # Source, target, value
    links = [
        # From starting wealth to investment types (Bottom 20%)
        [0, 5, 5],  # Bottom 20% -> Inheritance
        [0, 6, 10], # Bottom 20% -> Stocks
        [0, 7, 3],  # Bottom 20% -> Real Estate
        [0, 8, 1],  # Bottom 20% -> Business Equity
        [0, 9, 2],  # Bottom 20% -> Other Investments
        
        # Lower Middle 20%
        [1, 5, 10],
        [1, 6, 25],
        [1, 7, 12],
        [1, 8, 5],
        [1, 9, 8],
        
        # Middle 20%
        [2, 5, 15],
        [2, 6, 45],
        [2, 7, 30],
        [2, 8, 10],
        [2, 9, 10],
        
        # Upper Middle 20%
        [3, 5, 25],
        [3, 6, 75],
        [3, 7, 65],
        [3, 8, 30],
        [3, 9, 15],
        
        # Top 20%
        [4, 5, 95],
        [4, 6, 120],
        [4, 7, 90],
        [4, 8, 100],
        [4, 9, 45],
        
        # From investment types to ending wealth
        # Inheritance
        [5, 10, 2],  # Inheritance -> Bottom 20% End
        [5, 11, 3],  # Inheritance -> Lower Middle 20% End
        [5, 12, 10], # Inheritance -> Middle 20% End
        [5, 13, 30], # Inheritance -> Upper Middle 20% End
        [5, 14, 105],# Inheritance -> Top 20% End
        
        # Stocks
        [6, 10, 5],
        [6, 11, 20],
        [6, 12, 35],
        [6, 13, 80],
        [6, 14, 135],
        
        # Real Estate
        [7, 10, 2],
        [7, 11, 10],
        [7, 12, 25],
        [7, 13, 60],
        [7, 14, 103],
        
        # Business Equity
        [8, 10, 1],
        [8, 11, 3],
        [8, 12, 7],
        [8, 13, 25],
        [8, 14, 110],
        
        # Other Investments
        [9, 10, 2],
        [9, 11, 5],
        [9, 12, 8],
        [9, 13, 15],
        [9, 14, 50]
    ]
    
    # Save as JSON
    json_path = Path("docs/js/data/viz3_data.json")
    ensure_dir(json_path.parent)
    
    with open(json_path, 'w') as f:
        json.dump({
            "nodes": nodes,
            "links": links
        }, f, indent=2)
    
    print(f"Visualization 3 placeholder data saved to {json_path}")

def generate_visualization_4_data():
    """Generate data for Visualization 4: Economic Growth"""
    print("Generating placeholder for Visualization 4...")
    
    # Create placeholder data - GDP growth vs income growth by percentile
    years = list(range(1980, 2023, 5))
    
    data = []
    gdp_growth = 100
    
    for year in years:
        gdp_growth *= (1 + np.random.normal(0.025, 0.01))  # ~2.5% average growth with variation
        
        # Income growth for different percentiles (higher for top, lower for bottom)
        bottom_20_growth = 100 * (1 + 0.005) ** (year - 1980)  # 0.5% annual growth
        lower_mid_growth = 100 * (1 + 0.01) ** (year - 1980)   # 1% annual growth
        middle_growth = 100 * (1 + 0.015) ** (year - 1980)     # 1.5% annual growth
        upper_mid_growth = 100 * (1 + 0.02) ** (year - 1980)   # 2% annual growth
        top_20_growth = 100 * (1 + 0.035) ** (year - 1980)     # 3.5% annual growth
        top_1_growth = 100 * (1 + 0.05) ** (year - 1980)       # 5% annual growth
        
        # Add some randomness
        bottom_20_growth *= (1 + np.random.normal(0, 0.005))
        lower_mid_growth *= (1 + np.random.normal(0, 0.005))
        middle_growth *= (1 + np.random.normal(0, 0.005))
        upper_mid_growth *= (1 + np.random.normal(0, 0.005))
        top_20_growth *= (1 + np.random.normal(0, 0.01))
        top_1_growth *= (1 + np.random.normal(0, 0.02))
        
        data.append({
            "year": year,
            "gdp_index": round(gdp_growth, 1),
            "bottom_20_income_index": round(bottom_20_growth, 1),
            "lower_mid_income_index": round(lower_mid_growth, 1),
            "middle_income_index": round(middle_growth, 1),
            "upper_mid_income_index": round(upper_mid_growth, 1),
            "top_20_income_index": round(top_20_growth, 1),
            "top_1_income_index": round(top_1_growth, 1)
        })
    
    # Save as JSON
    json_path = Path("docs/js/data/viz4_data.json")
    ensure_dir(json_path.parent)
    
    with open(json_path, 'w') as f:
        json.dump(data, f, indent=2)
    
    print(f"Visualization 4 placeholder data saved to {json_path}")

def copy_static_files():
    """Copy static files to docs directory"""
    print("Copying static files...")
    
    # Ensure docs directory exists
    ensure_dir("docs")
    
    # Create subdirectories if they don't exist
    for subdir in ["css", "js", "assets"]:
        ensure_dir(f"docs/{subdir}")
    
    # Copy directories
    # This is a placeholder - in a real implementation, you would have
    # more static files to copy

def main():
    """Main build script"""
    print("Building Financial Myths Debunked site...")
    
    # Generate data for each visualization
    generate_visualization_1_data()
    generate_visualization_2_data()
    generate_visualization_3_data()
    generate_visualization_4_data()
    
    # Copy static files
    copy_static_files()
    
    print("Build complete!")

if __name__ == "__main__":
    main()