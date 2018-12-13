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
  });
    // BONUS: Build the Gauge Chart
    // buildGauge(response.WFREQ);
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
      title: "Culture Population"
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
      title: "Top 10 Species"
    };

    Plotly.newPlot('pie',[pieTrace],pieLayout)
    // HINT: You will need to use slice() to grab the top 10 sample_values,
    // otu_ids, and labels (10 each).

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
