"""
Google Trends Data Processor

This module fetches and processes Google Trends data for financial advice search terms.
In a real implementation, it would use the pytrends API to fetch actual data.
For this example, we generate synthetic data.
"""

import pandas as pd
import numpy as np
from typing import List, Dict, Any, Optional
from pathlib import Path

def fetch_google_trends_data(search_terms: List[str], 
                             start_year: int, 
                             end_year: int) -> pd.DataFrame:
    """
    Fetch Google Trends data for specified search terms and date range.
    
    In a real implementation, this would use the pytrends library.
    For this example, we'll just create synthetic data.
    
    Args:
        search_terms: List of terms to search for
        start_year: Starting year for the data
        end_year: Ending year for the data
        
    Returns:
        DataFrame with Google Trends data
    """
    # In a real implementation, use pytrends API
    # from pytrends.request import TrendReq
    # pytrends = TrendReq(hl='en-US', tz=360)
    
    # For this example, create synthetic data
    years = list(range(start_year, end_year + 1))
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
    
    return pd.DataFrame(data)

def process_google_trends_data(data: pd.DataFrame) -> pd.DataFrame:
    """
    Process Google Trends data for visualization.
    
    This function:
    1. Normalizes search volumes
    2. Calculates positions for the word cloud
    3. Assigns colors based on search volume
    
    Args:
        data: Raw Google Trends data
        
    Returns:
        Processed DataFrame ready for visualization
    """
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
    # In a real implementation, use a proper word cloud algorithm
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
    # Higher volume = darker blue
    processed["color"] = processed["normalized_volume"].apply(
        lambda x: f"rgb({int(255 * (1 - x))}, {int(255 * (1 - x))}, 255)"
    )
    
    return processed

def save_processed_trends_data(data: pd.DataFrame, output_path: Optional[str] = None) -> None:
    """
    Save processed Google Trends data to CSV.
    
    Args:
        data: Processed data to save
        output_path: Path to save the data (default: data/processed/google_trends_processed.csv)
    """
    if output_path is None:
        output_path = Path("data/processed/google_trends_processed.csv")
    else:
        output_path = Path(output_path)
    
    # Ensure directory exists
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Save data
    data.to_csv(output_path, index=False)
    print(f"Saved processed data to {output_path}")

def main():
    """
    Main function to demonstrate the data processing pipeline.
    """
    # Define search terms
    search_terms = [
        "investing", "stocks", "bonds", "mutual funds", 
        "retirement", "401k", "ira", "financial advisor",
        "crypto", "bitcoin", "nft", "fintech",
        "personal finance", "budget", "save money", "debt",
        "passive income", "side hustle", "FIRE movement", "financial freedom",
        "stock market", "financial crisis", "stimulus check", "robinhood"
    ]
    
    # Fetch data
    raw_data = fetch_google_trends_data(search_terms, 2005, 2023)
    
    # Process data
    processed_data = process_google_trends_data(raw_data)
    
    # Save processed data
    save_processed_trends_data(processed_data)
    
    print("Google Trends data processing complete.")

if __name__ == "__main__":
    main()