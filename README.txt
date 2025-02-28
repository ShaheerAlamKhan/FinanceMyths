# Financial Myths Debunked

An interactive, data-driven examination of common financial advice and misconceptions, deployed with GitHub Pages.

## Project Overview

This project aims to create a data-driven interactive pamphlet that:
1. Examines the landscape of financial advice
2. Analyzes and disproves select financial "proverbs"
3. Demonstrates how misleading financial advice harms vulnerable populations
4. Provides data-backed indicators of financial success

## Visualizations

The project consists of four main visualizations:

1. **The Landscape of Financial Advice Today**
   - Temporal word cloud showing Google Trends for financial advice
   - Bar chart showing generational decline in financial literacy

2. **"The Poor Just Don't Save Enough"**
   - Stacked bar chart showing expenses as proportion of income across wealth brackets

3. **"Anyone Can Get Rich Through Investing"**
   - Sankey diagram tracing wealth movement across percentiles

4. **"Free Market Economic Growth Benefits All Citizens"**
   - Analysis comparing economic growth with changes in income distribution

## Getting Started

### Prerequisites

- Python 3.8+
- Git

### Local Development Setup

1. Clone the repository:
   ```
   git clone https://github.com/your-username/financial-myths-debunked.git
   cd financial-myths-debunked
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Build the site:
   ```
   python scripts/build.py
   ```

5. Preview the site locally:
   You can use any simple HTTP server to preview the site. For example:
   ```
   cd docs
   python -m http.server 8000
   ```
   Then visit http://localhost:8000 in your browser.

## Project Structure

```
financial-myths-debunked/
├── data/                 # All datasets
│   ├── raw/              # Original data
│   └── processed/        # Cleaned data
├── src/                  # Python source code
│   ├── data_processing/  # Data processing scripts
│   └── utils/            # Shared utility functions
├── docs/                 # GitHub Pages website (deployment folder)
│   ├── index.html        # Main page
│   ├── css/              # Stylesheets
│   ├── js/               # JavaScript files
│   └── assets/           # Images, icons, and other static assets
├── scripts/              # Build scripts
│   └── build.py          # Script to generate static visualizations
└── notebooks/            # Jupyter notebooks for exploration
```

## Development Workflow

### Working on Visualizations

Each visualization consists of:
1. A data processor in `src/data_processing/processors/`
2. Data generation code in `scripts/build.py`
3. Visualization code in `docs/js/visualizations/`
4. A section in `docs/index.html`

### Parallel Development Process

1. **Fork the repository** (if you're not a direct collaborator)
2. **Create a new branch** for your visualization
3. **Develop your visualization** following these steps:
   - Create a data processor in `src/data_processing/processors/`
   - Add data generation code to `scripts/build.py`
   - Create a visualization script in `docs/js/visualizations/`
   - Update the visualization section in `docs/index.html`
4. **Build and test** your changes locally
5. **Submit a pull request** for review

### GitHub Pages Deployment

The site is automatically deployed to GitHub Pages when changes are pushed to the `main` branch. The deployment process:

1. Runs the build script (`scripts/build.py`)
2. Generates all static files in the `docs/` directory
3. Deploys the `docs/` directory to GitHub Pages

You can also manually trigger a deployment by running the GitHub Action workflow.

## Contributing

Each team member should:

1. Work on their assigned visualization
2. Follow the code style guidelines
3. Write clear commit messages
4. Document their code and data processing steps
5. Test their visualization before submitting a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.