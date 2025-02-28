/**
 * Visualization 1: The Landscape of Financial Advice
 * This file implements:
 * 1. A temporal word cloud showing Google Trends for financial advice
 * 2. Bar chart showing generational decline in financial literacy
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Visualization 1 loading...');
    // Load the visualization data
    loadViz1Data();
});

/**
 * Load visualization data from JSON file
 */
async function loadViz1Data() {
    try {
        // Use relative path for local testing, absolute path for production
        const dataUrl = './js/data/viz1_data.json';
            
        console.log('Loading data from:', dataUrl);
        const data = await loadJsonData(dataUrl);
        
        if (data) {
            console.log('Data loaded successfully');
            initWordCloud(data.wordCloud);
            initLiteracyChart(data.literacy);
        } else {
            // Display error message
            document.getElementById('viz1-wordcloud').innerHTML = 
                '<div class="alert alert-danger">Failed to load visualization data</div>';
            document.getElementById('viz1-chart').innerHTML = 
                '<div class="alert alert-danger">Failed to load visualization data</div>';
        }
    } catch (error) {
        console.error('Error loading visualization data:', error);
        // Display error message
        document.getElementById('viz1-wordcloud').innerHTML = 
            `<div class="alert alert-danger">Error: ${error.message}</div>`;
        document.getElementById('viz1-chart').innerHTML = 
            `<div class="alert alert-danger">Error: ${error.message}</div>`;
    }
}

/**
 * Initialize the word cloud visualization
 * @param {Object} wordCloudData - The word cloud data
 */
function initWordCloud(wordCloudData) {
    // Container for word cloud
    const wordCloudContainer = document.getElementById('viz1-wordcloud');
    if (!wordCloudContainer) {
        console.error('Word cloud container not found');
        return;
    }
    
    // Create word cloud visualization
    function createWordCloud(year) {
        // Clear previous content
        wordCloudContainer.innerHTML = '';
        
        // Create title
        const title = document.createElement('h4');
        title.textContent = `Financial Advice Search Terms (${year})`;
        title.className = 'text-center mb-4';
        wordCloudContainer.appendChild(title);
        
        // Create word cloud area
        const wordCloudArea = document.createElement('div');
        wordCloudArea.style.position = 'relative';
        wordCloudArea.style.height = '300px';
        wordCloudArea.style.width = '100%';
        wordCloudArea.className = 'mb-4';
        wordCloudContainer.appendChild(wordCloudArea);
        
        // Get terms for this year
        const terms = wordCloudData.data[year];
        if (!terms || terms.length === 0) {
            wordCloudArea.innerHTML = '<div class="alert alert-warning">No data available for this year</div>';
            return;
        }
        
        // Add each term
        terms.forEach(term => {
            const termElement = document.createElement('div');
            termElement.textContent = term.term;
            termElement.style.position = 'absolute';
            termElement.style.fontSize = `${term.size}px`;
            termElement.style.fontWeight = '700';
            
            // Convert x,y coordinates from -1,1 range to pixels
            const left = (term.x + 0.5) * 80 + 10; // percentage of container width
            const top = (term.y + 0.5) * 80 + 10;  // percentage of container height
            
            termElement.style.left = `${left}%`;
            termElement.style.top = `${top}%`;
            
            // Color based on term size
            const colorIntensity = Math.min(255, Math.max(100, 255 - (term.size * 5)));
            termElement.style.color = `rgb(${colorIntensity}, ${colorIntensity}, 255)`;
            
            termElement.style.transition = 'all 0.5s ease';
            termElement.style.cursor = 'pointer';
            termElement.style.textShadow = '1px 1px 2px rgba(0,0,0,0.1)';
            termElement.style.transformOrigin = 'center center';
            termElement.style.whiteSpace = 'nowrap';
            
            // Add hover effect
            termElement.addEventListener('mouseover', () => {
                termElement.style.transform = 'scale(1.1)';
                termElement.style.zIndex = '100';
            });
            
            termElement.addEventListener('mouseout', () => {
                termElement.style.transform = 'scale(1)';
                termElement.style.zIndex = '1';
            });
            
            // Add tooltip with search volume information
            termElement.title = `Term: ${term.term}\nRelative Search Volume: ${Math.round((term.size - 10) / 30 * 100)}%`;
            
            wordCloudArea.appendChild(termElement);
        });
        
        // Create year slider if it doesn't exist
        if (!document.getElementById('year-slider')) {
            const sliderContainer = document.createElement('div');
            sliderContainer.className = 'year-slider-container mt-4';
            
            // Add year label
            const yearLabel = document.createElement('div');
            yearLabel.id = 'year-label';
            yearLabel.textContent = year;
            yearLabel.className = 'text-center mb-2 fw-bold fs-5';
            sliderContainer.appendChild(yearLabel);
            
            // Create slider element
            const slider = document.createElement('input');
            slider.type = 'range';
            slider.min = 0;
            slider.max = wordCloudData.years.length - 1;
            slider.value = wordCloudData.years.indexOf(parseInt(year));
            slider.className = 'form-range mb-2';
            slider.id = 'year-slider';
            
            slider.addEventListener('input', (event) => {
                const selectedYear = wordCloudData.years[event.target.value];
                createWordCloud(selectedYear);
                
                // Update year label
                document.getElementById('year-label').textContent = selectedYear;
            });
            
            sliderContainer.appendChild(slider);
            
            // Add year labels
            const sliderLabels = document.createElement('div');
            sliderLabels.className = 'slider-labels d-flex justify-content-between px-2';
            
            wordCloudData.years.forEach((year, index) => {
                // Only show a subset of years to avoid crowding
                if (index % 3 === 0 || index === wordCloudData.years.length - 1) {
                    const label = document.createElement('span');
                    label.textContent = year;
                    label.className = 'small text-muted';
                    sliderLabels.appendChild(label);
                } else {
                    // Add empty span to maintain spacing
                    const emptySpan = document.createElement('span');
                    emptySpan.textContent = '';
                    sliderLabels.appendChild(emptySpan);
                }
            });
            
            sliderContainer.appendChild(sliderLabels);
            wordCloudContainer.appendChild(sliderContainer);
        } else {
            // Update existing year label
            document.getElementById('year-label').textContent = year;
            
            // Update slider value
            const slider = document.getElementById('year-slider');
            slider.value = wordCloudData.years.indexOf(parseInt(year));
        }
    }
    
    // Initialize with the most recent year
    const mostRecentYear = wordCloudData.years[wordCloudData.years.length - 1];
    createWordCloud(mostRecentYear);
}

/**
 * Initialize the financial literacy chart
 * @param {Array} literacyData - The financial literacy data
 */
function initLiteracyChart(literacyData) {
    // Container for the chart
    const chartContainer = document.getElementById('viz1-chart');
    if (!chartContainer) {
        console.error('Chart container not found');
        return;
    }
    
    // Extract data
    const generations = literacyData.map(d => d.Generation);
    const scores = literacyData.map(d => d.FinancialLiteracyScore);
    
    // Create the chart using Plotly
    const trace = {
        x: generations,
        y: scores,
        type: 'bar',
        marker: {
            color: '#0d6efd',
            opacity: 0.8
        },
        hovertemplate: '<b>%{x}</b><br>Score: %{y:.1f}%<extra></extra>'
    };
    
    const layout = {
        title: 'Financial Literacy by Generation',
        titlefont: {
            size: 18,
            color: '#333'
        },
        xaxis: {
            title: 'Generation',
            titlefont: {
                size: 14,
                color: '#666'
            }
        },
        yaxis: {
            title: 'Financial Literacy Score (%)',
            titlefont: {
                size: 14,
                color: '#666'
            },
            range: [0, 100]
        },
        annotations: [
            {
                x: 3,
                y: scores[3] + 7,
                text: `${((scores[0] - scores[3]) / scores[0] * 100).toFixed(1)}% decline`,
                showarrow: true,
                arrowhead: 2,
                arrowcolor: '#ff4d4d',
                arrowsize: 1,
                arrowwidth: 2,
                ax: -40,
                ay: -40,
                font: {
                    color: '#ff4d4d',
                    size: 14
                }
            }
        ],
        margin: {
            l: 60,
            r: 30,
            t: 50,
            b: 60
        }
    };
    
    const config = {
        responsive: true,
        displayModeBar: false
    };
    
    Plotly.newPlot(chartContainer, [trace], layout, config);
    
    // Add key insight below the chart
    const insightContainer = document.createElement('div');
    insightContainer.className = 'alert alert-info mt-3';
    insightContainer.innerHTML = '<strong>Key Insight:</strong> Despite the increasing volume of financial advice, financial literacy has declined across generations, with Gen Z scoring 29.6% lower than Baby Boomers.';
    chartContainer.parentNode.appendChild(insightContainer);
}

/**
 * Load JSON data from the given URL
 */
async function loadJsonData(url) {
    console.log('Loading data from:', url);
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Data loaded successfully');
        return data;
    } catch (error) {
        console.error(`Failed to load data from ${url}:`, error);
        return null;
    }
}