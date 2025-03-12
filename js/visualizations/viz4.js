// /**
//  * Visualization 4
//  * This file will contain the code for visualization 4
//  */

// document.addEventListener('DOMContentLoaded', function() {
//   console.log('Visualization 4 loaded');
  
//   // Container for the chart
//   const chartContainer = document.getElementById('viz4-chart');
//   if (!chartContainer) {
//       console.error('Chart container not found');
//       return;
//   }
  
//   // Display a placeholder message
//   chartContainer.innerHTML = '<div class="placeholder-message p-5 text-center">'+
//     '<h5>This visualization is under development</h5>'+
//     '<p>It will be implemented by another team member.</p></div>';
  
//   // When ready to implement, load data and create visualization:
//   /*
//   loadJsonData('data/viz.json')
//     .then(data => {
//       if (data) {
//         // Create visualization here
//       }
//     })
//     .catch(error => {
//       console.error('Error loading data:', error);
//       chartContainer.innerHTML = '<div class="alert alert-danger">Error loading data</div>';
//     });
//   */
// });

// document.addEventListener('DOMContentLoaded', function() {
//   console.log('Visualization 4 loaded');
  
//   const chartContainer = document.getElementById('viz4-chart');
//   if (!chartContainer) {
//       console.error('Chart container not found');
//       return;
//   }
  
//   // Load the JSON data
//   fetch('data/redistribution_data.json')
//       .then(response => response.json())
//       .then(data => {
//           if (data) {
//               createChoroplethMap(data);
//           }
//       })
//       .catch(error => {
//           console.error('Error loading data:', error);
//           chartContainer.innerHTML = '<div class="alert alert-danger">Error loading data</div>';
//       });
// });

// function createChoroplethMap(data) {
//   const chartContainer = document.getElementById('viz4-chart');
  
//   // Extract country names and redistribution values
//   const countryNames = data.map(d => d.country);
//   const values = data.map(d => d.redistribution_relative);
  
//   // Use country names directly
//   const trace = {
//       type: 'choropleth',
//       locations: countryNames,
//       locationmode: 'country names',
//       z: values,
//       text: countryNames,
//       colorscale: [[0, 'rgb(255,0,0)'], [1, 'rgb(0,128,0)']],
//       reversescale: true,
//       colorbar: { title: 'Redistribution Effectiveness (%)' }
//   };
  
//   const layout = {
//       title: 'Global Redistribution Effectiveness',
//       geo: {
//           projection: { type: 'robinson' }
//       }
//   };
  
//   Plotly.newPlot(chartContainer, [trace], layout);
// }

// Visualization 4 - Choropleth Map for Redistribution Effectiveness

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
}