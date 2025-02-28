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
import pandas as pd
import numpy as np
from pathlib import Path
import sys

# Add the project root to the Python path
sys.path.append(str(Path(__file__).parent.parent))

# Import data processors
try:
    from src.data_processing.processors.google_trends_processor import (
        fetch_google_trends_data, 
        process_google_trends_data
    )
    print("Successfully imported Google Trends processor")
except ImportError as e:
    print(f"Warning: Failed to import Google Trends processor: {e}")
    print(f"Using dummy functions instead")
    
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
        "personal finance", "budget", "save money", "debt",
        "passive income", "side hustle", "FIRE movement", "financial freedom",
        "stock market", "financial crisis", "stimulus check", "robinhood"
    ]
    
    # Fetch and process Google Trends data
    raw_data = fetch_google_trends_data(search_terms, 2005, 2023)
    processed_data = process_google_trends_data(raw_data)
    
    # Save processed data
    processed_data_path = Path("data/processed/google_trends_processed.csv")
    ensure_dir(processed_data_path.parent)
    processed_data.to_csv(processed_data_path, index=False)
    print(f"Saved processed Google Trends data to {processed_data_path}")
    
    # Generate financial literacy data (synthetic data)
    literacy_data = pd.DataFrame({
        "Generation": ["Baby Boomers", "Gen X", "Millennials", "Gen Z"],
        "FinancialLiteracyScore": [68.5, 62.3, 57.8, 48.2]
    })
    
    literacy_data_path = Path("data/processed/financial_literacy.csv")
    literacy_data.to_csv(literacy_data_path, index=False)
    print(f"Saved financial literacy data to {literacy_data_path}")
    
    # Prepare data for static site (JSON format)
    # Word cloud data
    word_cloud_data = {"years": [], "data": {}}
    
    for year in sorted(processed_data["year"].unique()):
        word_cloud_data["years"].append(int(year))
        year_data = processed_data[processed_data["year"] == year]
        
        # Select top terms by search volume
        top_terms = year_data.nlargest(10, "search_volume")
        
        word_cloud_data["data"][str(year)] = [
            {
                "term": row["term"],
                "size": int(row["normalized_volume"] * 30) + 10,  # Scale for visualization
                "x": float(row["x_position"]), 
                "y": float(row["y_position"])
            }
            for _, row in top_terms.iterrows()
        ]
    
    # Ensure the js/data directory exists
    js_data_path = Path("docs/js/data")
    ensure_dir(js_data_path)
    
    # Save data as JSON for the static site
    json_path = Path("docs/js/data/viz1_data.json")
    
    with open(json_path, 'w') as f:
        json.dump({
            "wordCloud": word_cloud_data,
            "literacy": literacy_data.to_dict(orient="records")
        }, f, indent=2)
    
    print(f"Visualization 1 data saved to {json_path}")

def create_empty_placeholder_files():
    """Create empty placeholder files for the remaining visualizations"""
    print("Creating placeholder files for other visualizations...")
    
    # Ensure js/data directory exists
    js_data_path = Path("docs/js/data")
    ensure_dir(js_data_path)
    
    # Create empty placeholder JSON files for other visualizations
    placeholders = ["viz2_data.json", "viz3_data.json", "viz4_data.json"]
    
    for filename in placeholders:
        file_path = js_data_path / filename
        
        # Create with empty data if it doesn't exist
        if not file_path.exists():
            with open(file_path, 'w') as f:
                json.dump({"status": "placeholder", "message": "Data not yet implemented"}, f, indent=2)
            print(f"Created placeholder {file_path}")

def create_main_js():
    """Create the main.js file if it doesn't exist"""
    main_js_path = Path("docs/js/main.js")
    
    if not main_js_path.exists():
        main_js_content = """
/**
 * Main JavaScript file for Financial Myths Debunked
 * Handles common functionality across the site
 */

document.addEventListener('DOMContentLoaded', function() {
    // Highlight active section in the navigation
    highlightNavigation();
    
    // Add smooth scrolling for navigation links
    setupSmoothScrolling();
});

/**
 * Highlight the current section in the navigation
 */
function highlightNavigation() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    
    // Function to determine which section is currently in view
    function updateNavigation() {
        let currentSectionId = '';
        let minDistance = Number.MAX_VALUE;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const distance = Math.abs(sectionTop - window.scrollY - 100);
            
            if (distance < minDistance) {
                minDistance = distance;
                currentSectionId = section.getAttribute('id');
            }
        });
        
        // Remove active class from all links
        navLinks.forEach(link => {
            link.classList.remove('active');
        });
        
        // Add active class to the current section link
        if (currentSectionId) {
            const currentLink = document.querySelector(`.nav-link[href="#${currentSectionId}"]`);
            if (currentLink) {
                currentLink.classList.add('active');
            }
        }
    }
    
    // Update navigation on scroll
    window.addEventListener('scroll', updateNavigation);
    
    // Initialize on page load
    updateNavigation();
}

/**
 * Set up smooth scrolling for navigation links
 */
function setupSmoothScrolling() {
    document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            // Get the target section id from the href
            const targetId = this.getAttribute('href');
            
            // Only process if it's an internal link
            if (targetId.startsWith('#')) {
                e.preventDefault();
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    // Scroll to the target element
                    window.scrollTo({
                        top: targetElement.offsetTop - 70, // Adjust for navbar height
                        behavior: 'smooth'
                    });
                    
                    // Close the mobile navbar if open
                    const navbarToggler = document.querySelector('.navbar-toggler');
                    const navbarCollapse = document.querySelector('.navbar-collapse');
                    if (navbarCollapse.classList.contains('show')) {
                        navbarToggler.click();
                    }
                }
            }
        });
    });
}

/**
 * Format numbers with commas for thousands
 */
function formatNumber(num) {
    return num.toString().replace(/\\B(?=(\\d{3})+(?!\\d))/g, ",");
}
"""
        with open(main_js_path, 'w') as f:
            f.write(main_js_content)
        print(f"Created {main_js_path}")

def create_empty_js_files():
    """Create empty JS files for unimplemented visualizations"""
    js_dir = Path("docs/js/visualizations")
    ensure_dir(js_dir)
    
    # Only create placeholder files if they don't exist
    placeholder_files = ["viz2.js", "viz3.js", "viz4.js"]
    
    for filename in placeholder_files:
        file_path = js_dir / filename
        
        if not file_path.exists():
            with open(file_path, 'w') as f:
                f.write(f"""
/**
 * {filename} - Placeholder
 * This visualization will be implemented by another team member
 */

document.addEventListener('DOMContentLoaded', function() {{
    console.log("{filename} loaded - visualization not yet implemented");
    
    // Display placeholder message in the visualization container
    const container = document.getElementById('{filename.split(".")[0]}-chart');
    if (container) {{
        container.innerHTML = '<div class="placeholder-message">This visualization is under development</div>';
    }}
}});
""")
            print(f"Created placeholder {file_path}")

def main():
    """Main build script"""
    print("Building Financial Myths Debunked site...")
    
    # Create necessary directories
    for directory in ["data/raw", "data/processed", "docs/js/data"]:
        ensure_dir(directory)
    
    # Generate data for visualization 1
    generate_visualization_1_data()
    
    # Create placeholder files for other visualizations
    create_empty_placeholder_files()
    
    # Create main.js if it doesn't exist
    create_main_js()
    
    # Create empty JS files for unimplemented visualizations
    create_empty_js_files()
    
    print("Build complete!")

if __name__ == "__main__":
    main()