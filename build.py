#!/usr/bin/env python
"""
Comprehensive build script for Financial Myths GitHub Pages site
Modified to preserve viz1.js and viz1_data.json
"""

import os
import json
import shutil
from pathlib import Path
import datetime

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
    
    # Copy the file if it exists
    if src_path.exists():
        shutil.copy2(src_path, dest_path)
        print(f"✓ Copied {src} to {dest}")
        return True
    else:
        print(f"✗ Source file not found: {src}")
        return False

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
    
    # Create .nojekyll file with timestamp
    with open("docs/.nojekyll", "w") as f:
        f.write(f"Cache busting timestamp: {datetime.datetime.now()}")
    print("✓ Created .nojekyll file")
    
    # Don't replace these files if they already exist in docs folder
    do_not_replace = ["viz1.js", "viz1_data.json"]
    
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
    
    # Copy files if they don't exist in protected list or aren't in docs already
    for file_info in required_files:
        dest_path = Path(file_info["dest"])
        file_name = dest_path.name
        
        # Skip if the file is in docs and is protected
        if dest_path.exists() and file_name in do_not_replace:
            print(f"⚠️ Not replacing existing {file_name} as it's protected")
            continue
            
        # Try to copy the file
        success = copy_file(file_info["src"], file_info["dest"])
        
        # Create placeholder only if not in protected list
        if not success and file_name not in do_not_replace:
            file_ext = dest_path.suffix
            
            # Create placeholder based on file type
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
    
    # Create placeholder data only for viz2-4
    viz1_data_path = Path("docs/js/data/viz1_data.json")
    if not viz1_data_path.exists():
        print("⚠️ viz1_data.json not found! Creating it...")
        # Code to create viz1_data.json would go here
    
    placeholder_data_files = ["viz2_data.json", "viz3_data.json", "viz4_data.json"]
    for data_file in placeholder_data_files:
        data_path = Path(f"docs/js/data/{data_file}")
        if not data_path.exists():
            with open(data_path, "w") as f:
                json.dump({"status": "placeholder", "message": "Data coming soon"}, f, indent=2)
            print(f"✓ Created placeholder data file: {data_path}")
    
    print("\n✅ Build completed successfully!")

if __name__ == "__main__":
    main()
