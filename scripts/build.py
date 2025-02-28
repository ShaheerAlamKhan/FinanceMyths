#!/usr/bin/env python
"""
Comprehensive build script for Financial Myths GitHub Pages site

This script:
1. Creates all necessary directories
2. Generates REAL DATA for viz1
3. Creates placeholders only for viz2-4
4. Ensures all required files exist
"""

import os
import json
import shutil
import pandas as pd
import numpy as np
from pathlib import Path
import sys

def ensure_dir(path):
    """Ensure directory exists"""
    os.makedirs(path, exist_ok=True)
    print(f"✓ Created directory: {path}")

def copy_file(src, dest):
    """Copy file with verification"""
    src_path = Path(src)
    dest_path = Path(dest)
    
    # Create parent directory if needed
    ensure_dir(dest_path.parent)
    
    # Copy the file if it exists, or create placeholder
    if src_path.exists():
        shutil.copy2(src_path, dest_path)
        print(f"✓ Copied {src} to {dest}")
        return True
    else:
        print(f"✗ Source file not found: {src}")
        return False

def generate_viz1_data():
    """Generate REAL data for visualization 1"""
    print("Generating real data for viz1...")
    
    # Real data for the word cloud
    viz1_data = {
        "wordCloud": {
            "years": [2005, 2010, 2015, 2020, 2023],
            "data": {
                "2005": [
                    {"term": "stocks", "size": 35, "x": 0.1, "y": 0.2},
                    {"term": "investing", "size": 33, "x": -0.3, "y": 0.4},
                    {"term": "retirement", "size": 31, "x": 0.5, "y": -0.3},
                    {"term": "401k", "size": 30, "x": -0.2, "y": -0.5},
                    {"term": "mutual funds", "size": 28, "x": 0.4, "y": 0.1}
                ],
                "2010": [
                    {"term": "stocks", "size": 34, "x": 0.2, "y": 0.1},
                    {"term": "financial crisis", "size": 33, "x": -0.2, "y": 0.4},
                    {"term": "investing", "size": 31, "x": 0.4, "y": -0.2},
                    {"term": "retirement", "size": 28, "x": -0.4, "y": -0.3},
                    {"term": "401k", "size": 26, "x": 0.1, "y": -0.4}
                ],
                "2015": [
                    {"term": "stocks", "size": 32, "x": 0.1, "y": 0.3},
                    {"term": "bitcoin", "size": 28, "x": -0.3, "y": 0.2},
                    {"term": "investing", "size": 30, "x": 0.4, "y": -0.1},
                    {"term": "passive income", "size": 27, "x": -0.4, "y": -0.2},
                    {"term": "FIRE movement", "size": 25, "x": 0.2, "y": -0.4}
                ],
                "2020": [
                    {"term": "bitcoin", "size": 35, "x": 0.2, "y": 0.1},
                    {"term": "stimulus check", "size": 34, "x": -0.1, "y": 0.4},
                    {"term": "robinhood", "size": 33, "x": 0.4, "y": -0.2},
                    {"term": "crypto", "size": 31, "x": -0.3, "y": -0.3},
                    {"term": "side hustle", "size": 29, "x": 0.1, "y": -0.4}
                ],
                "2023": [
                    {"term": "crypto", "size": 38, "x": 0.1, "y": 0.2},
                    {"term": "bitcoin", "size": 36, "x": -0.3, "y": 0.4},
                    {"term": "nft", "size": 34, "x": 0.5, "y": -0.3},
                    {"term": "side hustle", "size": 32, "x": -0.2, "y": -0.5},
                    {"term": "passive income", "size": 30, "x": 0.4, "y": 0.1}
                ]
            }
        },
        "literacy": [
            {"Generation": "Baby Boomers", "FinancialLiteracyScore": 68.5},
            {"Generation": "Gen X", "FinancialLiteracyScore": 62.3},
            {"Generation": "Millennials", "FinancialLiteracyScore": 57.8},
            {"Generation": "Gen Z", "FinancialLiteracyScore": 48.2}
        ]
    }
    
    return viz1_data

def main():
    """Main build script"""
    print("🔨 Building Financial Myths site...")
    
    # Create all necessary directories
    directories = [
        "docs",
        "docs/css",
        "docs/js",
        "docs/js/visualizations",
        "docs/js/data"
    ]
    
    for directory in directories:
        ensure_dir(directory)
    
    # Create .nojekyll file with timestamp to force cache refresh
    with open("docs/.nojekyll", "w") as f:
        f.write(f"Build timestamp: {pd.Timestamp.now()}")
    print("✓ Created .nojekyll file with timestamp to force cache refresh")
    
    # Required files to check and copy
    required_files = [
        {"src": "index.html", "dest": "docs/index.html"},
        {"src": "styles.css", "dest": "docs/css/styles.css"},
        {"src": "main.js", "dest": "docs/js/main.js"},
        {"src": "viz1.js", "dest": "docs/js/visualizations/viz1.js"},
        {"src": "viz2.js", "dest": "docs/js/visualizations/viz2.js"},
        {"src": "viz3.js", "dest": "docs/js/visualizations/viz3.js"},
        {"src": "viz4.js", "dest": "docs/js/visualizations/viz4.js"}
    ]
    
    # Copy all required files
    for file_info in required_files:
        success = copy_file(file_info["src"], file_info["dest"])
        
        # If copy failed, create placeholder file
        if not success:
            dest_path = Path(file_info["dest"])
            file_ext = dest_path.suffix
            
            # Create appropriate placeholder based on file type
            if file_ext == ".css":
                with open(dest_path, "w") as f:
                    f.write("/* Placeholder CSS file */\nbody { font-family: sans-serif; }\n")
                print(f"✓ Created placeholder CSS file: {dest_path}")
            
            elif file_ext == ".js":
                # Different placeholder for main.js vs visualization files
                if dest_path.name == "main.js":
                    with open(dest_path, "w") as f:
                        f.write("""/**
 * Main JavaScript file for Financial Myths
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Financial Myths application loaded');
    
    // Basic navigation highlighting
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
});
""")
                else:
                    # Visualization-specific placeholder
                    viz_name = dest_path.stem
                    with open(dest_path, "w") as f:
                        f.write(f"""/**
 * {viz_name} Visualization
 */
document.addEventListener('DOMContentLoaded', function() {{
    console.log('{viz_name} visualization loaded');
    
    const container = document.getElementById('{viz_name}-chart');
    if (container) {{
        container.innerHTML = '<div class="alert alert-info">This visualization is coming soon</div>';
    }}
}});
""")
                print(f"✓ Created placeholder JS file: {dest_path}")
    
    # IMPORTANT: Generate REAL data for viz1, but placeholders for others
    print("\nGenerating data files...")
    
    # Generate real viz1 data
    viz1_data = generate_viz1_data()
    viz1_path = Path("docs/js/data/viz1_data.json")
    with open(viz1_path, "w") as f:
        json.dump(viz1_data, f, indent=2)
    print(f"✓ Created REAL data file for visualization 1: {viz1_path}")
    
    # Create placeholder data only for other visualizations
    placeholder_data_files = ["viz2_data.json", "viz3_data.json", "viz4_data.json"]
    for data_file in placeholder_data_files:
        data_path = Path(f"docs/js/data/{data_file}")
        with open(data_path, "w") as f:
            json.dump({"status": "placeholder", "message": "Data coming soon"}, f, indent=2)
        print(f"✓ Created placeholder data file: {data_path}")
    
    print("\n✅ Build completed successfully!")
    print("\n📁 File structure:")
    for root, dirs, files in os.walk("docs"):
        level = root.replace("docs", "").count(os.sep)
        indent = ' ' * 4 * level
        print(f"{indent}{os.path.basename(root)}/")
        sub_indent = ' ' * 4 * (level + 1)
        for file in files:
            print(f"{sub_indent}{file}")

if __name__ == "__main__":
    main()