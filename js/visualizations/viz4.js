/* Visualization 4 */
function addKeyInsights(chartContainer) {
    // Create insights container
    const insightsContainer = document.createElement('div');
    insightsContainer.className = 'alert alert-info mt-3';
    
    // Add insights content
    insightsContainer.innerHTML = `
        <h5>Key Insights:</h5>
        <ul class="insights-list mb-0">
            <li><strong>Regional Patterns:</strong> Nordic countries show the highest redistribution effectiveness (40-47%), while many developing economies show minimal redistribution (&lt;10%).</li>
            <li><strong>Economic Systems Matter:</strong> The data challenges the myth that unregulated market growth benefits all citizens equally; countries with similar GDP often show dramatically different redistribution patterns.</li>
            <li><strong>Negative Redistribution:</strong> Several countries (including Indonesia, Sri Lanka, and Tanzania) show negative redistribution values, indicating tax and transfer systems that increase inequality.</li>
            <li><strong>Development Paradox:</strong> Some rapidly developing economies show declining redistribution effectiveness despite overall economic growth.</li>
        </ul>
    `;
    
    // Append insights to container
    chartContainer.appendChild(insightsContainer);
}

document.addEventListener('DOMContentLoaded', function() {
  console.log('Visualization 4 loaded');
  
  const chartContainer = document.getElementById('viz4-chart');
  if (!chartContainer) {
      console.error('Chart container not found');
      return;
  }
  
  // Load the JSON data
  fetch('data/redistribution_data.json')
      .then(response => response.json())
      .then(data => {
          if (data) {
              createChoroplethMap(data);
          }
      })
      .catch(error => {
          console.error('Error loading data:', error);
          chartContainer.innerHTML = '<div class="alert alert-danger">Error loading data</div>';
      });
});

function createChoroplethMap(data) {
  const chartContainer = document.getElementById('viz4-chart');
  
  // Extract country names and redistribution values
  const countryNames = data.map(d => d.country);
  const values = data.map(d => d.redistribution_relative);
  
  // Use country names directly
  const trace = {
      type: 'choropleth',
      locations: countryNames,
      locationmode: 'country names',
      z: values,
      text: values.map((val, idx) => `${countryNames[idx]}: ${val.toFixed(2)}%`),
      colorscale: [[0, 'rgb(247,251,255)'], [0.25, 'rgb(222,235,247)'], [0.5, 'rgb(158,202,225)'], [0.75, 'rgb(49,130,189)'], [1, 'rgb(8,81,156)']], // Blue-toned colorscale
      reversescale: true,
      colorbar: { title: 'Redistribution Effectiveness (%)' }
  };
  
  const layout = {
      title: 'Global Redistribution Effectiveness',
      geo: {
          projection: { type: 'robinson' },
          showcoastlines: false, 
          showframe: false
      }
  };
  
  Plotly.newPlot(chartContainer, [trace], layout);
  addKeyInsights(chartContainer)

}