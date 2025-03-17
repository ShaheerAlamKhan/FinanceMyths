/**
 * Visualization 3: "Anyone Can Get Rich Through Investing?"
 * This visualization shows how wealth mobility occurs across different starting wealth quintiles
 * and examines the relationship between investing and wealth accumulation.
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log('Visualization 3 loaded');
  
  // Container for the chart
  const chartContainer = document.getElementById('viz3-chart');
  if (!chartContainer) {
      console.error('Chart container not found');
      return;
  }
  
  // Add loading indicator
  chartContainer.innerHTML = '<div class="text-center my-5"><div class="spinner-border text-primary" role="status"></div><p class="mt-3">Loading visualization data...</p></div>';
  
  // Load data
  loadAndProcessData();
});

/**
 * Load and process data for visualization
 */
async function loadAndProcessData() {
  try {
    const data = await loadData();
    if (data) {
      createVisualization(data);
    } else {
      // Display placeholder if data not available
      document.getElementById('viz3-chart').innerHTML = `
        <div class="alert alert-warning">
          <strong>Data not available.</strong> Please ensure the data file is properly loaded.
        </div>
      `;
    }
  } catch (error) {
    console.error('Error loading data:', error);
    document.getElementById('viz3-chart').innerHTML = `
      <div class="alert alert-danger">
        <strong>Error loading data:</strong> ${error.message}<br>
        Please check the console for more details.
      </div>
    `;
  }
}

/**
 * Load the data from JSON file
 */
async function loadData() {
  try {
    const response = await fetch('data/viz3_data.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (e) {
    console.error('Error loading JSON:', e);
    return null;
  }
}

/**
 * Create the main visualization
 */
function createVisualization(data) {
  const chartContainer = document.getElementById('viz3-chart');
  if (!chartContainer) return;
  
  // Clear loading indicator
  chartContainer.innerHTML = '';
  
  // Create the visualization structure
  const visualizationHTML = `
    <div class="container-fluid">
      <!-- Wealth Quintile Legend -->
      <div class="row mb-4">
        <div class="col-md-12">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Wealth Distribution by Quintile</h5>
              <div class="table-responsive">
                <table class="table table-bordered">
                  <thead class="table-light">
                    <tr>
                      <th>Quintile</th>
                      <th>Description</th>
                      <th>Net Worth Range</th>
                      <th>Median Net Worth</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${data.wealthQuintiles.map(q => `
                      <tr>
                        <td><strong>${q.label}</strong></td>
                        <td>${q.description}</td>
                        <td>${q.range}</td>
                        <td>${formatCurrency(q.medianNetWorth || 0)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Wealth Mobility Explorer -->
      <div class="row mb-4">
        <div class="col-md-12">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Wealth Mobility Explorer</h5>
              <p class="text-muted">See the probability of moving between wealth groups over time based on starting position</p>
              <div class="form-group mb-3">
                <label for="startingQuintileSelect">Starting Wealth Position:</label>
                <select class="form-select" id="startingQuintileSelect">
                  ${data.wealthQuintiles.map(q => 
                    `<option value="${q.index}">${q.label}</option>`
                  ).join('')}
                </select>
              </div>
              <div id="mobilityChart" class="viz-container" style="height: 400px;"></div>
              <div class="small text-muted mt-2">
                <i class="bi bi-info-circle"></i> The chart shows the probability of a household ending up in each wealth quintile given their starting position. Darker colors represent higher probabilities.
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Stock Ownership and Returns -->
      <div class="row mb-4">
        <div class="col-md-6">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">Stock Ownership by Wealth Quintile</h5>
              <div id="stockOwnershipChart" class="viz-container" style="height: 350px;"></div>
              <div class="small text-muted mt-2">
                <i class="bi bi-info-circle"></i> Percentage of households in each wealth quintile that own stocks, either directly or through retirement accounts.
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">Investment Returns by Wealth Quintile</h5>
              <div id="returnsChart" class="viz-container" style="height: 350px;"></div>
              <div class="small text-muted mt-2">
                <i class="bi bi-info-circle"></i> Theoretical returns (what everyone should get) vs. actual returns (what people typically experience) across wealth groups.
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Barriers to Wealth Building -->
      <div class="row mb-4">
        <div class="col-md-12">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Barriers to Wealth Building by Quintile</h5>
              <div id="barriersChart" class="viz-container" style="height: 400px;"></div>
              <div class="small text-muted mt-2">
                <i class="bi bi-info-circle"></i> 
                <strong>Debt Burden & Emergency Vulnerability:</strong> Higher values are worse (more financial strain). 
                <strong>Investment Access & Financial Literacy:</strong> Higher values are better (more opportunities and knowledge).
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Key Insights -->
      <div class="row">
        <div class="col-md-12">
          <div class="alert alert-info">
            <h5>Key Insights:</h5>
            <ul class="mb-0">
              <li><strong>Starting Position Matters Most:</strong> The data shows that your starting wealth quintile is the strongest predictor of where you'll end up. Moving from the bottom quintile to the top quintile is extremely rare.</li>
              <li><strong>Investment Access Gap:</strong> While 70-90% of households in the top quintile own stocks, only 10-15% in the bottom quintile do, showing a dramatic investment access gap.</li>
              <li><strong>Returns Aren't Equal:</strong> The same investment yields different effective returns across wealth groups due to fees, emergency withdrawals, and investment options.</li>
              <li><strong>Structural Barriers:</strong> Lower wealth households face multiple overlapping barriers: high debt burdens, limited investment access, lower financial literacy, and vulnerability to emergency expenses.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Add to container
  chartContainer.innerHTML = visualizationHTML;
  
  // Create individual charts
  createMobilityChart(data);
  createStockOwnershipChart(data);
  createReturnsChart(data);
  createBarriersChart(data);
  
  // Add interactivity
  const quintileSelect = document.getElementById('startingQuintileSelect');
  quintileSelect.addEventListener('change', () => {
    const selectedQuintile = parseInt(quintileSelect.value);
    updateMobilityChart(data, selectedQuintile);
  });
}

/**
 * Create the wealth mobility visualization
 */
function createMobilityChart(data) {
  // Default to showing first quintile
  updateMobilityChart(data, 1);
}

/**
 * Update the mobility chart for a specific starting quintile
 */
function updateMobilityChart(data, startQuintile) {
  const mobilityChartContainer = document.getElementById('mobilityChart');
  
  // Get mobility data for this starting quintile
  const selectedData = data.wealthMobility.find(d => d.startQuintile === startQuintile);
  
  // Get quintile labels
  const quintileLabels = data.wealthQuintiles.map(q => q.label);
  
  // Prepare data for Plotly
  const endQuintiles = Array(5).fill(0).map((_, i) => i + 1);
  const probabilities = endQuintiles.map(q => selectedData[`to${q}`] * 100);
  
  // Color gradient: darker blue for higher probabilities
  const colors = probabilities.map(p => {
    const intensity = Math.min(255, Math.max(0, Math.floor(255 - (p * 4))));
    return `rgb(${intensity}, ${intensity}, 255)`;
  });
  
  // Create the bar chart
  const trace = {
    x: quintileLabels,
    y: probabilities,
    type: 'bar',
    marker: {
      color: colors
    },
    text: probabilities.map(p => `${p.toFixed(1)}%`),
    textposition: 'auto'
  };
  
  const layout = {
    title: `Probability of Ending in Each Wealth Quintile<br>Starting from ${data.wealthQuintiles[startQuintile-1].label}`,
    xaxis: {
      title: 'Ending Wealth Quintile'
    },
    yaxis: {
      title: 'Probability (%)',
      range: [0, Math.max(...probabilities) * 1.1]
    },
    margin: { t: 80, b: 80, l: 80, r: 40 }
  };
  
  Plotly.newPlot(mobilityChartContainer, [trace], layout, { responsive: true });
}

/**
 * Create the stock ownership visualization
 */
function createStockOwnershipChart(data) {
  const stockChartContainer = document.getElementById('stockOwnershipChart');
  
  // Get quintile labels
  const quintileLabels = data.wealthQuintiles.map(q => q.label);
  
  // Prepare data for ownership percentage
  const ownershipPercentages = data.stockOwnership.byWealth.map(d => d.ownership);
  
  // Create the traces
  const trace = {
    x: quintileLabels,
    y: ownershipPercentages,
    type: 'bar',
    marker: {
      color: 'rgba(75, 192, 192, 0.7)',
      line: {
        color: 'rgba(75, 192, 192, 1)',
        width: 1
      }
    },
    text: ownershipPercentages.map(p => `${p.toFixed(1)}%`),
    textposition: 'auto'
  };
  
  const layout = {
    title: 'Stock Ownership by Wealth Quintile',
    xaxis: {
      title: ''
    },
    yaxis: {
      title: 'Households Owning Stocks (%)',
      range: [0, 100]
    },
    margin: { t: 50, b: 80, l: 80, r: 40 }
  };
  
  Plotly.newPlot(stockChartContainer, [trace], layout, { responsive: true });
}

/**
 * Create the investment returns visualization
 */
function createReturnsChart(data) {
  const returnsChartContainer = document.getElementById('returnsChart');
  
  // Get quintile labels
  const quintileLabels = data.wealthQuintiles.map(q => q.label);
  
  // Prepare data
  const baseReturns = data.investmentReturns.map(d => d.baseReturn);
  const effectiveReturns = data.investmentReturns.map(d => d.effectiveReturn);
  
  // Create traces
  const baseTrace = {
    x: quintileLabels,
    y: baseReturns,
    type: 'scatter',
    mode: 'lines+markers',
    name: 'Theoretical Market Return',
    line: {
      color: 'rgba(54, 162, 235, 1)',
      width: 2
    }
  };
  
  const effectiveTrace = {
    x: quintileLabels,
    y: effectiveReturns,
    type: 'scatter',
    mode: 'lines+markers',
    name: 'Actual Realized Return',
    line: {
      color: 'rgba(255, 99, 132, 1)',
      width: 2
    }
  };
  
  const layout = {
    title: 'Investment Returns by Wealth Quintile',
    xaxis: {
      title: ''
    },
    yaxis: {
      title: 'Annual Return (%)',
      range: [0, Math.max(...baseReturns) * 1.2]
    },
    legend: {
      orientation: 'h',
      y: -0.2
    },
    margin: { t: 50, b: 100, l: 80, r: 40 }
  };
  
  Plotly.newPlot(returnsChartContainer, [baseTrace, effectiveTrace], layout, { responsive: true });
}

/**
 * Create the barriers visualization
 */
function createBarriersChart(data) {
  const barriersChartContainer = document.getElementById('barriersChart');
  
  // Get quintile labels
  const quintileLabels = data.wealthQuintiles.map(q => q.label);
  
  // Create traces for each barrier type
  const debtTrace = {
    x: quintileLabels,
    y: data.wealthBarriers.map(d => d.debtToIncome),
    name: 'Debt Burden',
    type: 'scatter',
    mode: 'lines+markers',
    line: {
      color: 'rgba(255, 99, 132, 1)',
      width: 2
    }
  };
  
  const accessTrace = {
    x: quintileLabels,
    y: data.wealthBarriers.map(d => d.investmentAccess),
    name: 'Investment Access',
    type: 'scatter',
    mode: 'lines+markers',
    line: {
      color: 'rgba(54, 162, 235, 1)',
      width: 2
    }
  };
  
  const literacyTrace = {
    x: quintileLabels,
    y: data.wealthBarriers.map(d => d.financialLiteracy),
    name: 'Financial Literacy',
    type: 'scatter',
    mode: 'lines+markers',
    line: {
      color: 'rgba(75, 192, 192, 1)',
      width: 2
    }
  };
  
  const emergencyTrace = {
    x: quintileLabels,
    y: data.wealthBarriers.map(d => d.emergencyExpenses),
    name: 'Emergency Vulnerability',
    type: 'scatter',
    mode: 'lines+markers',
    line: {
      color: 'rgba(255, 159, 64, 1)',
      width: 2
    }
  };
  
  const layout = {
    title: 'Structural Barriers to Wealth Building',
    xaxis: {
      title: ''
    },
    yaxis: {
      title: 'Score (0-100)',
      range: [0, 100]
    },
    legend: {
      orientation: 'h',
      y: -0.2
    },
    annotations: [
      {
        x: quintileLabels[0],
        y: data.wealthBarriers[0].debtToIncome,
        xref: 'x',
        yref: 'y',
        text: 'Higher debt burden',
        showarrow: true,
        arrowhead: 2,
        ax: -40,
        ay: -40
      },
      {
        x: quintileLabels[4],
        y: data.wealthBarriers[4].investmentAccess,
        xref: 'x',
        yref: 'y',
        text: 'Better investment access',
        showarrow: true,
        arrowhead: 2,
        ax: 40,
        ay: -40
      }
    ],
    margin: { t: 50, b: 100, l: 80, r: 40 }
  };
  
  Plotly.newPlot(barriersChartContainer, [debtTrace, accessTrace, literacyTrace, emergencyTrace], layout, { responsive: true });
}

/**
 * Format currency values
 */
function formatCurrency(value) {
  if (!value && value !== 0) return 'N/A';
  
  // Format negative values with parentheses
  if (value < 0) {
    return `(${new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
      minimumFractionDigits: 0
    }).format(Math.abs(value))})`;
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0
  }).format(value);
}