#!/usr/bin/env python
"""
Generate viz1_data.json for the Financial Myths site

This script:
1. Processes Google Trends data and financial literacy data
2. Outputs a JSON file with the data for visualization 1
"""

import os
import json
import pandas as pd
import numpy as np
from pathlib import Path

def ensure_dir(path):
    """Ensure directory exists"""
    os.makedirs(path, exist_ok=True)
    print(f"✓ Created directory: {path}")

def generate_google_trends_data():
    """Generate synthetic Google Trends data"""
    print("Generating Google Trends data...")
    
    # Define search terms
    search_terms = [
        "investing", "stocks", "bonds", "mutual funds", 
        "retirement", "401k", "ira", "financial advisor",
        "crypto", "bitcoin", "nft", "fintech",
        "personal finance", "budget", "save money", "debt",
        "passive income", "side hustle", "FIRE movement", "financial freedom",
        "stock market", "financial crisis", "stimulus check", "robinhood"
    ]
    
    # Years to generate data for
    start_year = 2005
    end_year = 2023
    years = list(range(start_year, end_year + 1))
    
    # Generate synthetic data
    data = []
    for year in years:
        for term in search_terms:
            # Simulate increasing popularity for newer terms
            if term in ["crypto", "bitcoin", "nft", "fintech"]:
                base_volume = max(0, (year - 2010) * 10)
            elif term in ["passive income", "side hustle", "FIRE movement"]:
                base_volume = max(0, (year - 2015) * 12)
            elif term in ["investing", "stocks", "retirement", "401k"]:
                # Traditional terms have high baseline but slower growth
                base_volume = 70 + max(0, (year - 2005) * 2)
            else:
                base_volume = 50 + np.random.normal(0, 10)
                
            # Add trend changes
            if year >= 2008 and year <= 2010 and term in ["stock market", "financial crisis"]:
                base_volume += 30  # Financial crisis spike
            
            if year >= 2020 and term in ["stimulus check", "robinhood"]:
                base_volume += 40  # Pandemic related
                
            # Add some randomness
            volume = max(0, min(100, base_volume + np.random.normal(0, 10)))
            
            data.append({
                "year": year,
                "term": term,
                "search_volume": volume
            })
    
    # Convert to DataFrame
    df = pd.DataFrame(data)
    
    # Process data for visualization
    processed_df = process_google_trends_data(df)
    
    return processed_df, years

def process_google_trends_data(data):
    """Process Google Trends data for visualization"""
    print("Processing Google Trends data...")
    
    processed = data.copy()
    
    # Normalize search volumes for each year
    for year in processed["year"].unique():
        year_mask = processed["year"] == year
        max_volume = processed.loc[year_mask, "search_volume"].max()
        if max_volume > 0:  # Avoid division by zero
            processed.loc[year_mask, "normalized_volume"] = processed.loc[year_mask, "search_volume"] / max_volume
        else:
            processed.loc[year_mask, "normalized_volume"] = 0
    
    # Calculate positions for word cloud
    for year in processed["year"].unique():
        year_data = processed[processed["year"] == year]
        num_terms = len(year_data)
        
        # Create a spiral layout
        angles = np.linspace(0, 8 * np.pi, num_terms)
        radii = np.linspace(0.2, 1, num_terms)
        
        x_positions = radii * np.cos(angles)
        y_positions = radii * np.sin(angles)
        
        # Sort by search volume so largest terms are placed first
        year_terms_sorted = processed[processed["year"] == year].sort_values("search_volume", ascending=False)
        
        processed.loc[year_terms_sorted.index, "x_position"] = x_positions
        processed.loc[year_terms_sorted.index, "y_position"] = y_positions
    
    # Assign colors based on search volume
    processed["color"] = processed["normalized_volume"].apply(
        lambda x: f"rgb({int(255 * (1 - x))}, {int(255 * (1 - x))}, 255)"
    )
    
    return processed

def generate_financial_literacy_data():
    """Generate synthetic financial literacy data"""
    print("Generating financial literacy data...")
    
    # Generate synthetic data for generations
    literacy_data = pd.DataFrame({
        "Generation": ["Baby Boomers", "Gen X", "Millennials", "Gen Z"],
        "FinancialLiteracyScore": [68.5, 62.3, 57.8, 48.2]
    })
    
    return literacy_data

def format_wordcloud_data(trends_data, years):
    """Format word cloud data for JSON output"""
    print("Formatting word cloud data...")
    
    # Prepare data structure
    word_cloud_data = {"years": years, "data": {}}
    
    for year in sorted(trends_data["year"].unique()):
        year_data = trends_data[trends_data["year"] == year]
        
        # Select top terms by search volume
        top_terms = year_data.nlargest(10, "search_volume")
        
        # Format for the visualization
        word_cloud_data["data"][str(year)] = [
            {
                "term": row["term"],
                "size": int(row["normalized_volume"] * 30) + 10,  # Scale for visualization
                "x": float(row["x_position"]), 
                "y": float(row["y_position"])
            }
            for _, row in top_terms.iterrows()
        ]
    
    return word_cloud_data

def main():
    """Main function to generate visualization data"""
    print("Generating visualization data...")
    
    # Create necessary directories
    ensure_dir("docs/js/data")
    
    # Generate data
    trends_data, years = generate_google_trends_data()
    literacy_data = generate_financial_literacy_data()
    
    # Format word cloud data
    word_cloud_data = format_wordcloud_data(trends_data, years)
    
    # Create JSON output
    viz1_data = {
        "wordCloud": word_cloud_data,
        "literacy": literacy_data.to_dict(orient="records")
    }
    
    # Save to JSON file
    json_path = "docs/js/data/viz1_data.json"
    with open(json_path, 'w') as f:
        json.dump(viz1_data, f, indent=2)
    
    print(f"✓ Saved visualization data to {json_path}")

if __name__ == "__main__":
    main()