/**
 * Visualization 2: "The Poor Just Don't Save Enough"
 * This visualization examines spending and savings patterns across income levels
 * Implemented with D3.js stacked area charts
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log('Visualization 2 loaded');
  
  // Container for the chart
  const chartContainer = document.getElementById('viz2-chart');
  if (!chartContainer) {
      console.error('Chart container not found');
      return;
  }
  
  // Add loading indicator
  chartContainer.innerHTML = '<div class="text-center my-5"><div class="spinner-border text-primary" role="status"></div><p class="mt-3">Loading visualization data...</p></div>';
  
  // Load data
  loadIncomeData();
});

/**
* Load and process income data
*/
async function loadIncomeData() {
  try {
      // First try to load from JSON if already processed
      let processedData = await loadJsonData('data/viz2_data.json').catch(() => null);
      
      if (!processedData) {
          // If JSON not available, display a message
          document.getElementById('viz2-chart').innerHTML = `
              <div class="alert alert-warning">
                  <strong>Data file not found.</strong> Please run the data processor script first.
              </div>
          `;
          return;
      }
      
      // Format data for visualization
      const formattedData = formatDataForVisualization(processedData);
      initVisualization(formattedData, processedData);
      
  } catch (error) {
      console.error('Error loading income data:', error);
      document.getElementById('viz2-chart').innerHTML = `
          <div class="alert alert-danger">
              <strong>Error loading data:</strong> ${error.message}<br>
              Please check the console for more details.
          </div>
      `;
  }
}

/**
* Format data for D3.js visualization
* @param {Object} data - The processed data
* @returns {Object} Data formatted for D3 visualizations
*/
function formatDataForVisualization(data) {
  // For income/spending/savings by income group
  const incomeSpendingByYear = {};
  const ratiosByYear = {};
  
  // Process each year
  data.years.forEach(year => {
      const yearStr = year.toString();
      const yearData = data.yearlyData[yearStr];
      
      if (!yearData) return;
      
      // Income spending data - for income quintiles
      const incomeSpendingData = [];
      data.categories.forEach(category => {
          incomeSpendingData.push({
              category: category,
              Disposable_Income: yearData.income["Disposable Personal Income"][category] || 0,
              Consumption: yearData.income["Personal Consumption Expenditures"][category] || 0,
              Savings: yearData.income["Personal Saving"][category] || 0
          });
      });
      
      incomeSpendingByYear[yearStr] = incomeSpendingData;
      
      // Consumption ratio data - for stacked area
      const ratioData = [];
      data.categories.forEach(category => {
          if (yearData.ratios && yearData.ratios[category]) {
              ratioData.push({
                  category: category,
                  Household: yearData.ratios[category]["Household Consumption Ratio"] || 0,
                  Nondurable: yearData.ratios[category]["Nondurable Goods Ratio"] || 0,
                  Durable: yearData.ratios[category]["Durable Goods Ratio"] || 0,
                  Nonprofit: yearData.ratios[category]["Nonprofit Consumption Ratio"] || 0
              });
          }
      });
      
      ratiosByYear[yearStr] = ratioData;
  });
  
  // For income over time - stacked area chart
  const incomeTimeData = [];
  
  // Structure: [{year: 2004, '0-20%': value, '20-40%': value, ...}, ...]
  data.years.forEach(year => {
      const yearStr = year.toString();
      const yearData = data.yearlyData[yearStr];
      
      if (!yearData) return;
      
      const timePoint = { year: yearStr };
      
      // Add values for each income category
      data.categories.forEach(category => {
          timePoint[category] = yearData.income["Disposable Personal Income"][category] || 0;
      });
      
      incomeTimeData.push(timePoint);
  });
  
  // For consumption over time
  const consumptionTimeData = [];
  
  data.years.forEach(year => {
      const yearStr = year.toString();
      const yearData = data.yearlyData[yearStr];
      
      if (!yearData) return;
      
      const timePoint = { year: yearStr };
      
      // Add values for each income category
      data.categories.forEach(category => {
          timePoint[category] = yearData.income["Personal Consumption Expenditures"][category] || 0;
      });
      
      consumptionTimeData.push(timePoint);
  });
  
  // For savings over time
  const savingsTimeData = [];
  
  data.years.forEach(year => {
      const yearStr = year.toString();
      const yearData = data.yearlyData[yearStr];
      
      if (!yearData) return;
      
      const timePoint = { year: yearStr };
      
      // Add values for each income category
      data.categories.forEach(category => {
          timePoint[category] = yearData.income["Personal Saving"][category] || 0;
      });
      
      savingsTimeData.push(timePoint);
  });
  
  // For consumption ratio over time
  const ratioTimeData = {};
  
  // Initialize with empty arrays for each category
  data.categories.forEach(category => {
      ratioTimeData[category] = [];
  });
  
  // Populate with data
  data.years.forEach(year => {
      const yearStr = year.toString();
      const yearData = data.yearlyData[yearStr];
      
      if (!yearData || !yearData.ratios) return;
      
      // For each income category
      data.categories.forEach(category => {
          if (yearData.ratios[category]) {
              ratioTimeData[category].push({
                  year: yearStr,
                  Household: yearData.ratios[category]["Household Consumption Ratio"] || 0,
                  Nondurable: yearData.ratios[category]["Nondurable Goods Ratio"] || 0,
                  Durable: yearData.ratios[category]["Durable Goods Ratio"] || 0,
                  Nonprofit: yearData.ratios[category]["Nonprofit Consumption Ratio"] || 0,
                  Total: yearData.ratios[category]["Total Consumption Ratio"] || 0
              });
          }
      });
  });
  
  return {
      incomeSpendingByYear,
      ratiosByYear,
      incomeTimeData,
      consumptionTimeData,
      savingsTimeData,
      ratioTimeData,
      categories: data.categories,
      years: data.years
  };
}

/**
* Initialize the visualization with processed data
* @param {Object} formattedData - The formatted data for D3
* @param {Object} rawData - The original processed data
*/
function initVisualization(formattedData, rawData) {
  const chartContainer = document.getElementById('viz2-chart');
  if (!chartContainer) return;
  
  // Clear loading indicator
  chartContainer.innerHTML = '';
  
  // Create main container with responsive layout
  const mainContainer = document.createElement('div');
  mainContainer.className = 'container-fluid p-0';
  chartContainer.appendChild(mainContainer);
  
  // Create row for controls
  const controlsRow = document.createElement('div');
  controlsRow.className = 'row mb-4';
  mainContainer.appendChild(controlsRow);
  
  // Controls container
  const controlsContainer = document.createElement('div');
  controlsContainer.className = 'col-md-12 controls-container';
  controlsRow.appendChild(controlsContainer);
  
  // Create row for charts
  const chartRow = document.createElement('div');
  chartRow.className = 'row';
  mainContainer.appendChild(chartRow);
  
  // Main chart container
  const mainChartContainer = document.createElement('div');
  mainChartContainer.className = 'col-md-12';
  mainChartContainer.id = 'main-chart-container';
  chartRow.appendChild(mainChartContainer);
  
  // Stacked area chart container
  const stackedAreaContainer = document.createElement('div');
  stackedAreaContainer.id = 'stacked-area-container';
  stackedAreaContainer.className = 'viz2-chart-container';
  mainChartContainer.appendChild(stackedAreaContainer);
  
  // Second view container (will toggle with the first)
  const secondViewContainer = document.createElement('div');
  secondViewContainer.id = 'second-view-container';
  secondViewContainer.className = 'viz2-chart-container';
  secondViewContainer.style.display = 'none';
  mainChartContainer.appendChild(secondViewContainer);
  
  // Conclusion container
  const conclusionContainer = document.createElement('div');
  conclusionContainer.className = 'conclusion-container mt-4 p-3 bg-light rounded';
  mainChartContainer.appendChild(conclusionContainer);
  
  // Add controls
  addControls(controlsContainer, formattedData, stackedAreaContainer, secondViewContainer);
  
  // Initialize with default view
  createStackedAreaChart(formattedData.incomeTimeData, formattedData.categories, 
                      'Income Distribution Over Time ($ Billions)', 
                      stackedAreaContainer, 'income');
  
  updateConclusion('income');
}

/**
* Add visualization controls
* @param {HTMLElement} container - The container element
* @param {Object} data - The visualization data
* @param {HTMLElement} mainContainer - Main chart container
* @param {HTMLElement} secondContainer - Secondary chart container
*/
function addControls(container, data, mainContainer, secondContainer) {
  const controlsCard = document.createElement('div');
  controlsCard.className = 'card';
  container.appendChild(controlsCard);
  
  const cardBody = document.createElement('div');
  cardBody.className = 'card-body';
  controlsCard.appendChild(cardBody);
  
  // Row for controls
  const controlsRow = document.createElement('div');
  controlsRow.className = 'row align-items-center';
  cardBody.appendChild(controlsRow);
  
  // Data type selector
  const dataTypeCol = document.createElement('div');
  dataTypeCol.className = 'col-md-8';
  controlsRow.appendChild(dataTypeCol);
  
  const dataTypeLabel = document.createElement('label');
  dataTypeLabel.className = 'form-label fw-bold';
  dataTypeLabel.textContent = 'Select Data View:';
  dataTypeCol.appendChild(dataTypeLabel);
  
  const dataTypeBtnGroup = document.createElement('div');
  dataTypeBtnGroup.className = 'btn-group w-100';
  dataTypeBtnGroup.setAttribute('role', 'group');
  dataTypeCol.appendChild(dataTypeBtnGroup);
  
  // Create data type buttons
  const dataTypes = [
      { id: 'income', label: 'Income Distribution', icon: 'cash-stack' },
      { id: 'consumption', label: 'Consumption Distribution', icon: 'cart' },
      { id: 'savings', label: 'Savings Distribution', icon: 'piggy-bank' },
      { id: 'ratio', label: 'Consumption to Income Ratio', icon: 'percent' }
  ];
  
  dataTypes.forEach((type, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `btn ${index === 0 ? 'btn-primary' : 'btn-outline-primary'}`;
      button.dataset.type = type.id;
      
      // Add icon if available
      if (type.icon) {
          button.innerHTML = `<i class="bi bi-${type.icon} me-1"></i> `;
      }
      
      button.innerHTML += type.label;
      dataTypeBtnGroup.appendChild(button);
      
      // Add click event
      button.addEventListener('click', () => {
          // Update active button
          dataTypeBtnGroup.querySelectorAll('.btn').forEach(btn => {
              btn.classList.remove('btn-primary');
              btn.classList.add('btn-outline-primary');
          });
          button.classList.remove('btn-outline-primary');
          button.classList.add('btn-primary');
          
          // Update visualization based on selected type
          updateVisualization(type.id, data, mainContainer, secondContainer);
      });
  });
  
  // Add legend
  const legendContainer = document.createElement('div');
  legendContainer.className = 'mt-3 legend-container';
  legendContainer.id = 'viz2-legend';
  cardBody.appendChild(legendContainer);
  
  // Initialize legend for income view
  updateLegend('income', data.categories);
}

/**
* Update the legend based on the selected data type
* @param {string} dataType - The selected data type
* @param {Array} categories - The data categories
*/
function updateLegend(dataType, categories) {
  const legendContainer = document.getElementById('viz2-legend');
  if (!legendContainer) return;
  
  legendContainer.innerHTML = '';
  
  const legendTitle = document.createElement('div');
  legendTitle.className = 'legend-title mb-2';
  legendTitle.textContent = 'Income Percentiles:';
  legendContainer.appendChild(legendTitle);
  
  const legendItemsContainer = document.createElement('div');
  legendItemsContainer.className = 'd-flex flex-wrap justify-content-start';
  legendContainer.appendChild(legendItemsContainer);
  
  // Get appropriate color scale
  const colorScale = getColorScale(dataType, categories);
  
  // Create legend items
  categories.forEach(category => {
      const legendItem = document.createElement('div');
      legendItem.className = 'legend-item me-4 mb-2 d-flex align-items-center';
      
      const colorSwatch = document.createElement('div');
      colorSwatch.className = 'color-swatch me-1';
      colorSwatch.style.width = '15px';
      colorSwatch.style.height = '15px';
      colorSwatch.style.backgroundColor = colorScale(category);
      
      const label = document.createElement('span');
      label.textContent = category;
      
      legendItem.appendChild(colorSwatch);
      legendItem.appendChild(label);
      legendItemsContainer.appendChild(legendItem);
  });
  
  // If it's the ratio view, add explanation of what the ratio means
  if (dataType === 'ratio') {
      const ratioExplanation = document.createElement('div');
      ratioExplanation.className = 'ratio-explanation mt-2 small text-muted';
      ratioExplanation.innerHTML = 'Note: Values above 100% indicate spending more than income (through borrowing or drawing from savings)';
      legendContainer.appendChild(ratioExplanation);
  }
}

/**
* Update the visualization based on the selected data type
* @param {string} dataType - The selected data type
* @param {Object} data - The visualization data
* @param {HTMLElement} mainContainer - Main chart container
* @param {HTMLElement} secondContainer - Secondary chart container
*/
function updateVisualization(dataType, data, mainContainer, secondContainer) {
  // Update legend
  updateLegend(dataType, data.categories);
  
  // Update conclusion text
  updateConclusion(dataType);
  
  // Update visualization based on data type
  switch (dataType) {
      case 'income':
          // Show income distribution over time
          mainContainer.style.display = 'block';
          secondContainer.style.display = 'none';
          createStackedAreaChart(data.incomeTimeData, data.categories, 
                              'Income Distribution Over Time ($ Billions)', 
                              mainContainer, 'income');
          break;
          
      case 'consumption':
          // Show consumption distribution over time
          mainContainer.style.display = 'block';
          secondContainer.style.display = 'none';
          createStackedAreaChart(data.consumptionTimeData, data.categories, 
                              'Consumption Distribution Over Time ($ Billions)', 
                              mainContainer, 'consumption');
          break;
          
      case 'savings':
          // Show savings distribution over time
          mainContainer.style.display = 'block';
          secondContainer.style.display = 'none';
          createStackedAreaChart(data.savingsTimeData, data.categories, 
                              'Savings Distribution Over Time ($ Billions)', 
                              mainContainer, 'savings');
          break;
          
      case 'ratio':
          // Show ratios by income percentile
          mainContainer.style.display = 'none';
          secondContainer.style.display = 'block';
          createConsumptionRatioCharts(data.ratioTimeData, data.categories, secondContainer);
          break;
  }
}

/**
* Create the main stacked area chart
* @param {Array} data - The data for the chart
* @param {Array} categories - The categories to include
* @param {string} title - The chart title
* @param {HTMLElement} container - The container element
* @param {string} chartType - The type of chart (income, consumption, or savings)
*/
function createStackedAreaChart(data, categories, title, container, chartType) {
  // Clear the container
  container.innerHTML = '';
  
  // Add title
  const chartTitle = document.createElement('h5');
  chartTitle.className = 'text-center mb-4';
  chartTitle.textContent = title;
  container.appendChild(chartTitle);
  
  // Set dimensions and margins
  const margin = {top: 40, right: 30, bottom: 50, left: 80};
  const width = container.clientWidth - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;
  
  // Create SVG
  const svg = d3.select(container)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
  
  // Get color scale based on chart type
  const color = getColorScale(chartType, categories);
  
  // For savings view, use a different approach because of negative values
  if (chartType === 'savings') {
      createSavingsChart(data, categories, title, svg, width, height, color);
  } else {
      // Format the data for stacking
      const stack = d3.stack()
          .keys(categories)
          .order(d3.stackOrderNone)
          .offset(d3.stackOffsetNone);
      
      const stackedData = stack(data);
      
      // Create scales
      const x = d3.scaleLinear()
          .domain(d3.extent(data, d => +d.year))
          .range([0, width]);
      
      const y = d3.scaleLinear()
          .domain([0, d3.max(stackedData, d => d3.max(d, d => d[1]))])
          .nice()
          .range([height, 0]);
      
      // Create the area generator
      const area = d3.area()
          .x(d => x(+d.data.year))
          .y0(d => y(d[0]))
          .y1(d => y(d[1]))
          .curve(d3.curveMonotoneX); // Smooth curve
      
      // Add areas
      svg.selectAll('.area')
          .data(stackedData)
          .join('path')
          .attr('class', 'area')
          .attr('fill', d => color(d.key))
          .attr('d', area)
          .attr('opacity', 0.8)
          .on('mouseover', function(event, d) {
              d3.select(this)
                  .transition()
                  .duration(200)
                  .attr('opacity', 1);
                  
              // Highlight this layer in the legend
              d3.select(`.legend-item:nth-child(${categories.indexOf(d.key) + 1})`)
                  .style('font-weight', 'bold');
          })
          .on('mouseout', function(event, d) {
              d3.select(this)
                  .transition()
                  .duration(200)
                  .attr('opacity', 0.8);
                  
              // Remove highlight from legend
              d3.select(`.legend-item:nth-child(${categories.indexOf(d.key) + 1})`)
                  .style('font-weight', 'normal');
          });
      
      // Add X axis
      const xAxis = svg.append('g')
          .attr('transform', `translate(0,${height})`)
          .call(d3.axisBottom(x).tickFormat(d => d.toString()).ticks(data.length > 10 ? 10 : data.length));
      
      // Rotate x-axis labels for better readability
      xAxis.selectAll('text')
          .style('text-anchor', 'end')
          .attr('dx', '-.8em')
          .attr('dy', '.15em')
          .attr('transform', 'rotate(-45)');
      
      // Add Y axis
      svg.append('g')
          .call(d3.axisLeft(y).ticks(10).tickFormat(d => `${d3.format(',.0f')(d)}B`));
      
      // Add X axis label
      svg.append('text')
          .attr('text-anchor', 'middle')
          .attr('x', width / 2)
          .attr('y', height + margin.bottom - 5)
          .text('Year')
          .attr('fill', '#666');
      
      // Add Y axis label
      svg.append('text')
          .attr('text-anchor', 'middle')
          .attr('transform', 'rotate(-90)')
          .attr('y', -margin.left + 20)
          .attr('x', -height / 2)
          .text('Billions of Dollars ($)')
          .attr('fill', '#666');
      
      // Add tooltip
      const tooltip = d3.select('body').append('div')
          .attr('class', 'tooltip')
          .style('opacity', 0)
          .style('position', 'absolute')
          .style('background-color', 'rgba(255, 255, 255, 0.9)')
          .style('border', '1px solid #ddd')
          .style('border-radius', '4px')
          .style('padding', '10px')
          .style('box-shadow', '0 2px 4px rgba(0,0,0,0.1)')
          .style('pointer-events', 'none')
          .style('z-index', 1000);
      
      // Add invisible overlay for hover detection
      const bisect = d3.bisector(d => +d.year).left;
      
      svg.append('rect')
          .attr('width', width)
          .attr('height', height)
          .style('fill', 'none')
          .style('pointer-events', 'all')
          .on('mousemove', function(event) {
              // Get mouse position
              const [mouseX] = d3.pointer(event, this);
              
              // Get year at cursor position
              const x0 = x.invert(mouseX);
              const i = bisect(data, x0, 1);
              const d0 = data[i - 1];
              const d1 = data[i] || d0;
              const d = x0 - d0.year > d1.year - x0 ? d1 : d0;
              
              // Position vertical line
              verticalLine
                  .attr('x1', x(+d.year))
                  .attr('x2', x(+d.year))
                  .style('opacity', 1);
              
              // Update tooltip content
              let tooltipContent = `<strong>Year: ${d.year}</strong><br>`;
              categories.forEach(category => {
                  const value = d[category];
                  tooltipContent += `<span style="color: ${color(category)}">● </span>${category}: ${value.toFixed(1)}B<br>`;
              });
              
              // Add total
              const total = categories.reduce((acc, curr) => acc + d[curr], 0);
              tooltipContent += `<strong>Total: ${total.toFixed(1)}B</strong>`;
              
              // Position and show tooltip
              tooltip
                  .html(tooltipContent)
                  .style('left', `${event.pageX + 15}px`)
                  .style('top', `${event.pageY - 28}px`)
                  .style('opacity', 1);
          })
          .on('mouseout', function() {
              verticalLine.style('opacity', 0);
              tooltip.style('opacity', 0);
          });
      
      // Add vertical line for hover
      const verticalLine = svg.append('line')
          .attr('class', 'vertical-line')
          .attr('y1', 0)
          .attr('y2', height)
          .style('stroke', '#999')
          .style('stroke-width', 1)
          .style('stroke-dasharray', '5,5')
          .style('opacity', 0);
      
      // Add a title
      svg.append('text')
          .attr('x', width / 2)
          .attr('y', -margin.top / 2)
          .attr('text-anchor', 'middle')
          .style('font-size', '16px')
          .style('font-weight', 'bold')
          .text(title);
  }
}

/**
* Create a specialized chart for savings data
* @param {Array} data - The data for the chart
* @param {Array} categories - The categories to include
* @param {string} title - The chart title
* @param {d3.Selection} svg - The SVG selection
* @param {number} width - Chart width
* @param {number} height - Chart height
* @param {Function} colorScale - The color scale to use
*/
function createSavingsChart(data, categories, title, svg, width, height, colorScale) {
  // Create scales
  const x = d3.scaleLinear()
      .domain(d3.extent(data, d => +d.year))
      .range([0, width]);
  
  // Find the min and max values across all categories
  const allValues = [];
  data.forEach(d => {
      categories.forEach(cat => {
          allValues.push(d[cat]);
      });
  });
  
  const yMin = d3.min(allValues);
  const yMax = d3.max(allValues);
  const absMax = Math.max(Math.abs(yMin), Math.abs(yMax));
  
  // Create y scale with buffer for negative values
  const y = d3.scaleLinear()
      .domain([Math.min(0, yMin * 1.1), Math.max(0, yMax * 1.1)]) // Add 10% padding
      .nice()
      .range([height / 2, 0]); // Upper half for positive values
  
  const yNeg = d3.scaleLinear()
      .domain([Math.min(0, yMin * 1.1), 0]) // Only negative values
      .nice()
      .range([height, height / 2]); // Lower half for negative values
  
  // Create line generator
  const line = d3.line()
      .x(d => x(+d.year))
      .y(d => d.value >= 0 ? y(d.value) : yNeg(d.value))
      .curve(d3.curveMonotoneX);
  
  // Create area generator for positive values
  const posArea = d3.area()
      .x(d => x(+d.year))
      .y0(d => y(0))
      .y1(d => y(Math.max(0, d.value)))
      .curve(d3.curveMonotoneX);
  
  // Create area generator for negative values
  const negArea = d3.area()
      .x(d => x(+d.year))
      .y0(d => yNeg(0))
      .y1(d => yNeg(Math.min(0, d.value)))
      .curve(d3.curveMonotoneX);
  
  // Draw a center line at 0
  svg.append('line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', y(0))
      .attr('y2', y(0))
      .attr('stroke', '#000')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3');
  
  // Add a label for center line
  svg.append('text')
      .attr('x', 5)
      .attr('y', y(0) - 5)
      .style('font-size', '10px')
      .text('$0');
  
  // Draw lines and areas for each category
  categories.forEach((category, i) => {
      // Prepare data for this category
      const categoryData = data.map(d => ({
          year: +d.year,
          value: d[category]
      }));
      
      // Draw area for positive values
      svg.append('path')
          .datum(categoryData)
          .attr('class', 'pos-area')
          .attr('fill', colorScale(category))
          .attr('opacity', 0.7)
          .attr('d', posArea);
      
      // Draw area for negative values
      svg.append('path')
          .datum(categoryData)
          .attr('class', 'neg-area')
          .attr('fill', colorScale(category))
          .attr('opacity', 0.7)
          .attr('d', negArea);
      
      // Draw line connecting points
      svg.append('path')
          .datum(categoryData)
          .attr('class', 'line')
          .attr('fill', 'none')
          .attr('stroke', colorScale(category))
          .attr('stroke-width', 2)
          .attr('d', line);
      
      // Add point markers on the line
      svg.selectAll(`.point-${i}`)
          .data(categoryData)
          .join('circle')
          .attr('class', `point-${i}`)
          .attr('cx', d => x(d.year))
          .attr('cy', d => d.value >= 0 ? y(d.value) : yNeg(d.value))
          .attr('r', 4)
          .attr('fill', colorScale(category))
          .attr('stroke', '#fff')
          .attr('stroke-width', 1)
          .attr('data-category', category)
          .on('mouseover', function(event, d) {
              // Highlight the point
              d3.select(this)
                  .transition()
                  .duration(200)
                  .attr('r', 6);
              
              // Highlight the category in the legend
              d3.select(`.legend-item:nth-child(${categories.indexOf(category) + 1})`)
                  .style('font-weight', 'bold');
              
              // Create tooltip
              const tooltip = d3.select('body').append('div')
                  .attr('class', 'savings-tooltip')
                  .style('position', 'absolute')
                  .style('background-color', 'rgba(255, 255, 255, 0.9)')
                  .style('border', '1px solid #ddd')
                  .style('border-radius', '4px')
                  .style('padding', '10px')
                  .style('box-shadow', '0 2px 4px rgba(0,0,0,0.1)')
                  .style('z-index', 1000)
                  .style('opacity', 0);
              
              // Format tooltip content
              let tooltipContent = `<strong>Year: ${d.year}</strong><br>`;
              tooltipContent += `<span style="color: ${colorScale(category)}">● </span>`;
              tooltipContent += `${category} Income Group: `;
              
              if (d.value < 0) {
                  tooltipContent += `-${Math.abs(d.value).toFixed(1)} Billion (negative savings)`;
              } else {
                  tooltipContent += `${d.value.toFixed(1)} Billion`;
              }
              
              // Position and show tooltip
              tooltip
                  .html(tooltipContent)
                  .style('left', `${event.pageX + 15}px`)
                  .style('top', `${event.pageY - 28}px`)
                  .transition()
                  .duration(200)
                  .style('opacity', 1);
              
              // Store the tooltip reference
              d3.select(this).datum().tooltip = tooltip;
          })
          .on('mouseout', function(event, d) {
              // Restore point size
              d3.select(this)
                  .transition()
                  .duration(200)
                  .attr('r', 4);
              
              // Remove legend highlight
              d3.select(`.legend-item:nth-child(${categories.indexOf(category) + 1})`)
                  .style('font-weight', 'normal');
              
              // Hide and remove tooltip
              if (d.tooltip) {
                  d.tooltip
                      .transition()
                      .duration(200)
                      .style('opacity', 0)
                      .remove();
              }
          });
  });
  
  // Add year labels on x-axis
  const years = data.map(d => +d.year);
  const yearStep = Math.ceil(years.length / 10); // Show approx. 10 labels
  
  const xAxis = svg.append('g')
      .attr('transform', `translate(0,${y(0)})`) // Position at 0 line
      .call(d3.axisBottom(x)
          .tickValues(years.filter((d, i) => i % yearStep === 0))
          .tickFormat(d => d.toString()));
  
  // Rotate x-axis labels for better readability
  xAxis.selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)');
  
  // Add Y axis ticks for positive values
  svg.append('g')
      .call(d3.axisLeft(y)
          .ticks(5)
          .tickFormat(d => `${d3.format(',.0f')(d)}B`));
  
  // Add Y axis ticks for negative values
  svg.append('g')
      .call(d3.axisLeft(yNeg)
          .ticks(5)
          .tickFormat(d => `${d3.format(',.0f')(d)}B`));
  
  // Add X axis label
  svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('x', width / 2)
      .attr('y', height + 40)
      .text('Year')
      .attr('fill', '#666');
  
  // Add Y axis label
  svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('y', -60)
      .attr('x', -height / 2)
      .text('Billions of Dollars ($)')
      .attr('fill', '#666');
  
  // Add a title
  svg.append('text')
      .attr('x', width / 2)
      .attr('y', -15)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text(title);
  
  // Add explanation of negative values
  svg.append('text')
      .attr('x', width - 10)
      .attr('y', 10)
      .attr('text-anchor', 'end')
      .style('font-size', '12px')
      .style('fill', '#666')
      .text('Note: Negative values indicate spending more than income');
}

/**
* Create consumption ratio charts
* @param {Object} ratioData - The ratio data for all income categories
* @param {Array} categories - The categories to include
* @param {HTMLElement} container - The container element
*/
function createConsumptionRatioCharts(ratioData, categories, container) {
  // Clear the container
  container.innerHTML = '';
  
  // Add title
  const chartTitle = document.createElement('h5');
  chartTitle.className = 'text-center mb-4';
  chartTitle.textContent = 'Consumption to Income Ratio by Income Level (%)';
  container.appendChild(chartTitle);
  
  // Create grid container
  const gridContainer = document.createElement('div');
  gridContainer.className = 'row';
  container.appendChild(gridContainer);
  
  // Loop through categories and create a chart for each
  categories.forEach(category => {
      // Create column for this chart
      const chartCol = document.createElement('div');
      chartCol.className = 'col-md-6 mb-4';
      gridContainer.appendChild(chartCol);
      
      // Create chart container
      const chartContainer = document.createElement('div');
      chartContainer.className = 'ratio-chart-container';
      chartContainer.style.height = '300px';
      chartCol.appendChild(chartContainer);
      
      // Create chart if data exists
      if (ratioData[category] && ratioData[category].length > 0) {
          createRatioLineChart(ratioData[category], category, chartContainer);
      } else {
          chartContainer.innerHTML = '<div class="alert alert-warning">No data available</div>';
      }
  });
  
  // Add explanation of components
  const explanationContainer = document.createElement('div');
  explanationContainer.className = 'col-md-12 mt-2';
  gridContainer.appendChild(explanationContainer);
  
  const explanationCard = document.createElement('div');
  explanationCard.className = 'card';
  explanationContainer.appendChild(explanationCard);
  
  const cardBody = document.createElement('div');
  cardBody.className = 'card-body';
  explanationCard.appendChild(cardBody);
  
  const explanationTitle = document.createElement('h6');
  explanationTitle.textContent = 'Consumption Components';
  cardBody.appendChild(explanationTitle);
  
  const row = document.createElement('div');
  row.className = 'row mt-3';
  cardBody.appendChild(row);
  
  // Component descriptions
  const components = [
      {
          title: 'Household Consumption',
          color: '#1f77b4',
          items: ['Housing and utilities', 'Health care', 'Transportation services', 'Food services & accommodations']
      },
      {
          title: 'Nondurable Goods',
          color: '#FFD700',
          items: ['Food & beverages (off-premises)', 'Clothing and footwear', 'Gasoline & energy goods']
      },
      {
          title: 'Durable Goods',
          color: '#ff7f0e',
          items: ['Motor vehicles & parts', 'Furnishings & household equipment', 'Recreational goods']
      }
  ];
  
  components.forEach(component => {
      const col = document.createElement('div');
      col.className = 'col-md-4';
      row.appendChild(col);
      
      const componentTitle = document.createElement('div');
      componentTitle.className = 'd-flex align-items-center mb-2';
      col.appendChild(componentTitle);
      
      const colorBox = document.createElement('div');
      colorBox.style.width = '12px';
      colorBox.style.height = '12px';
      colorBox.style.backgroundColor = component.color;
      colorBox.style.marginRight = '6px';
      componentTitle.appendChild(colorBox);
      
      const titleText = document.createElement('strong');
      titleText.textContent = component.title;
      componentTitle.appendChild(titleText);
      
      const itemsList = document.createElement('ul');
      itemsList.className = 'small mb-0 ps-3';
      col.appendChild(itemsList);
      
      component.items.forEach(item => {
          const listItem = document.createElement('li');
          listItem.textContent = item;
          itemsList.appendChild(listItem);
      });
  });
}

/**
* Create a line chart for consumption ratio
* @param {Array} data - The data for the chart 
* @param {string} category - The income category
* @param {HTMLElement} container - The container element
*/
function createRatioLineChart(data, category, container) {
  // Set dimensions and margins
  const margin = {top: 30, right: 20, bottom: 50, left: 60};
  const width = container.clientWidth - margin.left - margin.right;
  const height = container.clientHeight - margin.top - margin.bottom;
  
  // Create SVG
  const svg = d3.select(container)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
  
  // Create scales
  const x = d3.scaleLinear()
      .domain(d3.extent(data, d => +d.year))
      .range([0, width]);
  
  const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.Total * 1.1)]) // Add 10% padding
      .range([height, 0]);
  
  // Define colors for different components
  const colors = {
      'Household': '#1f77b4',
      'Nondurable': '#FFD700',
      'Durable': '#ff7f0e',
      'Nonprofit': '#2ca02c'
  };
  
  // Define line generators
  const line = d3.line()
      .x(d => x(+d.year))
      .y(d => y(d.Total))
      .curve(d3.curveMonotoneX);
  
  // Add areas for each component
  const components = ['Household', 'Nondurable', 'Durable', 'Nonprofit'];
  
  // Draw total line
  svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#000')
      .attr('stroke-width', 2)
      .attr('d', line)
      .attr('class', 'total-line');
  
  // Add horizontal line at 100%
  if (y.domain()[1] > 100) {
      svg.append('line')
          .attr('x1', 0)
          .attr('x2', width)
          .attr('y1', y(100))
          .attr('y2', y(100))
          .attr('stroke', '#999')
          .attr('stroke-width', 1)
          .attr('stroke-dasharray', '4,4');
          
      svg.append('text')
          .attr('x', width)
          .attr('y', y(100) - 5)
          .attr('text-anchor', 'end')
          .attr('font-size', '10px')
          .attr('fill', '#666')
          .text('100% of Income');
  }
  
  // Add X axis
  const xAxis = svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d => d.toString()).ticks(5));
  
  // Add Y axis
  svg.append('g')
      .call(d3.axisLeft(y).tickFormat(d => `${d}%`));
  
  // Add X axis label
  svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('x', width / 2)
      .attr('y', height + margin.bottom - 10)
      .text('Year')
      .attr('fill', '#666')
      .attr('font-size', '12px');
  
  // Add chart title
  svg.append('text')
      .attr('x', width / 2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .text(`${category} Income Group`);
  
  // Add points for the total line
  svg.selectAll('.total-point')
      .data(data)
      .join('circle')
      .attr('class', 'total-point')
      .attr('cx', d => x(+d.year))
      .attr('cy', d => y(d.Total))
      .attr('r', 4)
      .attr('fill', '#000')
      .on('mouseover', function(event, d) {
          // Enlarge the point
          d3.select(this)
              .transition()
              .duration(200)
              .attr('r', 6);
              
          // Show tooltip
          const tooltip = d3.select('body').append('div')
              .attr('class', 'temp-tooltip')
              .style('position', 'absolute')
              .style('background-color', 'rgba(255, 255, 255, 0.9)')
              .style('border', '1px solid #ddd')
              .style('border-radius', '4px')
              .style('padding', '10px')
              .style('box-shadow', '0 2px 4px rgba(0,0,0,0.1)')
              .style('z-index', 1000)
              .style('opacity', 0);
              
          let tooltipContent = `<strong>Year: ${d.year}</strong><br>`;
          
          // Add each component
          components.forEach(comp => {
              tooltipContent += `<div style="display: flex; align-items: center; margin-bottom: 3px;">
                  <div style="width: 10px; height: 10px; background-color: ${colors[comp]}; margin-right: 5px;"></div>
                  <span>${comp}: ${d[comp].toFixed(1)}%</span>
              </div>`;
          });
          
          // Add total
          tooltipContent += `<strong>Total: ${d.Total.toFixed(1)}%</strong>`;
          
          // Position and show tooltip
          tooltip
              .html(tooltipContent)
              .style('left', `${event.pageX + 15}px`)
              .style('top', `${event.pageY - 28}px`)
              .transition()
              .duration(200)
              .style('opacity', 1);
              
          // Store the tooltip reference
          d3.select(this).datum().tooltip = tooltip;
      })
      .on('mouseout', function(event, d) {
          // Restore point size
          d3.select(this)
              .transition()
              .duration(200)
              .attr('r', 4);
              
          // Hide and remove tooltip
          if (d.tooltip) {
              d.tooltip
                  .transition()
                  .duration(200)
                  .style('opacity', 0)
                  .remove();
          }
      });
}

/**
* Get color scale based on chart type
* @param {string} chartType - The chart type
* @param {Array} categories - The data categories
* @returns {Function} D3 color scale
*/
function getColorScale(chartType, categories) {
  // Different color scales for different chart types
  const colorScales = {
      'income': d3.scaleOrdinal()
          .domain(categories)
          .range(['#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#08519c']), // Blue scale
          
      'consumption': d3.scaleOrdinal()
          .domain(categories)
          .range(['#fee5d9', '#fcbba1', '#fc9272', '#fb6a4a', '#de2d26']), // Red scale
          
      'savings': d3.scaleOrdinal()
          .domain(categories)
          .range(['#edf8e9', '#c7e9c0', '#a1d99b', '#74c476', '#31a354']), // Green scale
          
      'ratio': d3.scaleOrdinal()
          .domain(categories)
          .range(['#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#08519c']) // Blue scale
  };
  
  return colorScales[chartType] || colorScales['income'];
}

/**
* Update the conclusion based on selected visualization type
* @param {string} vizType - The visualization type
*/
function updateConclusion(vizType) {
  const conclusionContainer = document.querySelector('.conclusion-container');
  
  if (vizType === 'income' || vizType === 'consumption') {
      conclusionContainer.innerHTML = `
          <h4>Key Insights: Distribution of Income & Spending</h4>
          <ul class="insights-list mt-3">
              <li>Over time, income inequality has grown, with a greater share going to the top 20% of households.</li>
              <li>Consumption spending is more evenly distributed across income groups than income itself, suggesting that lower income groups spend a higher percentage of their income.</li>
              <li>The top 20% of income earners receive around 45% of all disposable income but account for only about 35% of consumption spending.</li>
              <li>The growing gap between income and consumption for the top quintile indicates increasing concentration of savings among wealthy households.</li>
          </ul>
      `;
  } else if (vizType === 'savings') {
      conclusionContainer.innerHTML = `
          <h4>Key Insights: Savings Reality</h4>
          <ul class="insights-list mt-3">
              <li>The lowest income quintile consistently shows negative savings, indicating borrowing or drawing from existing assets to fund basic consumption.</li>
              <li>The second-lowest quintile (20-40%) often hovers near zero or negative savings, challenging the notion that "everyone can save with proper budgeting".</li>
              <li>Middle income groups (40-60%) show modest savings capacity that is highly vulnerable to economic downturns.</li>
              <li>The top 20% account for the vast majority of all savings in the economy, typically over 75% of total household savings.</li>
              <li>This pattern persists across economic cycles, indicating a structural rather than behavioral limitation on savings for lower-income households.</li>
          </ul>
      `;
  } else {
      conclusionContainer.innerHTML = `
          <h4>Key Insights: Consumption-to-Income Ratios</h4>
          <ul class="insights-list mt-3">
              <li>The lowest income quintile (0-20%) typically spends over 100% of their income on necessities, requiring debt or wealth drawdown to survive.</li>
              <li>Housing costs represent the largest expense burden across all income groups, but disproportionately impact lower incomes.</li>
              <li>Essential spending (housing, food, healthcare, transportation) consumes 80-120% of income for the bottom 40% of households.</li>
              <li>Higher income groups have significantly more discretionary income after meeting basic needs, enabling savings and investment.</li>
              <li>The data challenges the notion that financial insecurity is primarily due to poor spending habits rather than structural income constraints.</li>
          </ul>
      `;
  }
}