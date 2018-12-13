function buildMetadata(sample) {
  // Use `d3.json` to fetch the metadata for a sample
  var sampleMetadata = d3.json(`/metadata/${sample}`).then(function(response){
    // Use d3 to select the Sample MetaData panel
    var metaPanel = d3.select("#sample-metadata")

    // Clear any existing metadata
    metaPanel.html("")

    // add metaData to panel
    Object.entries(response).forEach(function([key,value]) {
      metaPanel.append('p').text(`${key}: ${value}`)
    });
    // Build the Gauge Chart
    buildGauge(response.WFREQ);
  });
}

function buildGauge(wfreq){
  // Trig to calc meter point
  var degrees = 171 - wfreq*18,
       radius = .5;
  var radians = degrees * Math.PI / 180;
  var x = radius * Math.cos(radians);
  var y = radius * Math.sin(radians);

  // Path: may have to change to create a better triangle
  var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
       pathX = String(x),
       space = ' ',
       pathY = String(y),
       pathEnd = ' Z';
  var path = mainPath.concat(pathX,space,pathY,pathEnd);

  var data = [{ type: 'scatter',
     x: [0], y:[0],
      marker: {size: 28, color:'850000'},
      showlegend: false,
      text: wfreq,
      hoverinfo: 'text'},
    { values: [50/10, 50/10, 50/10, 50/10, 50/10, 50/10,
      50/10, 50/10, 50/10, 50/10, 50],
    rotation: 90,
    text: ['9', '8', '7', '6', '5', '4', '3', '2', '1', '0', ''],
    textinfo: 'text',
    textposition:'inside',
    marker: {colors:[
      'rgba(14, 127, 0, .5)',
      'rgba(38, 138, 22, .5)',
      'rgba(62, 149, 44, .5)',
      'rgba(86, 160, 67, .5)',
      'rgba(110, 171, 89, .5)',
      'rgba(135, 182, 112, .5)',
      'rgba(159, 193, 134, .5)',
      'rgba(183, 204, 157, .5)',
      'rgba(207, 215, 179, .5)',
      'rgba(232, 226, 202, .5)',

      'rgba(255, 255, 255, 0)']},
    labels: ['9', '8', '7', '6', '5', '4', '3', '2', '1', '0', ''],
    hoverinfo: 'label',
    hole: .5,
    type: 'pie',
    showlegend: false
  }];

  var layout = {
    shapes:[{
        type: 'path',
        path: path,
        fillcolor: '850000',
        line: {
          color: '850000'
        }
      }],
    title: "<b>Belly Button Washing Frequency</b> <br> Scrubs per Week",
    // height: 1000,
    // width: 1000,
    xaxis: {zeroline:false, showticklabels:false,
               showgrid: false, range: [-1, 1]},
    yaxis: {zeroline:false, showticklabels:false,
               showgrid: false, range: [-1, 1]}
  };

  Plotly.newPlot('gauge', data, layout);

}

function buildCharts(sample) {

  // Use `d3.json` to fetch the sample data for the plots
  var sampleMetadata = d3.json(`/samples/${sample}`).then(function(response){
    // Build a Bubble Chart using the sample data
    bubbleTrace = {
      x: response.otu_ids,
      y: response.sample_values,
      mode: 'markers',
      marker:{
          size: response.sample_values,
          color: response.otu_ids
      },
      text: response.otu_labels
    };

    bubbleLayout={
      xaxis: {title: "Species Id"},
      yaxis: {title: "Species Count"},
      title: "<b>Culture Population</b>"
    };

    Plotly.newPlot('bubble',[bubbleTrace],bubbleLayout)
    // Build a Pie Chart of top 10 species
    // Transpose json to object for easier sorting
    var data = [];
    for(var i=0; i<response.otu_ids.length; i++){
      data.push({
        "otu_ids":response.otu_ids[i],
        "sample_values":response.sample_values[i],
        "otu_labels":response.otu_labels[i]
      })
    }

    // Sort and slice
    var sortedData = data.sort((a,b) => b.sample_values - a.sample_values);
    var top10Data = sortedData.slice(0,10);

    // Transpose back for easier graphing
    var top10 = {otu_ids:[],sample_values:[],otu_labels:[]};
    for (i=0 ;i<10; i++){
      top10.otu_ids.push(top10Data[i].otu_ids);
      top10.sample_values.push(top10Data[i].sample_values);
      top10.otu_labels.push(top10Data[i].otu_labels);
    };

    pieTrace = {
      labels: top10.otu_ids,
      values: top10.sample_values,
      text: top10.otu_labels,
      type: 'pie',
      hoverinfo: 'text',
      textinfo: 'percent'
    };

    pieLayout={
      title: "<b>Top 10 Species</b>"
    };

    Plotly.newPlot('pie',[pieTrace],pieLayout)
  });
}

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });

}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();
