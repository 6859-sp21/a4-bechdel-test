// Load data from a URL. You can also have the json file downloaded.
// See https://github.com/d3/d3/blob/master/API.md#fetches-d3-fetch for more options.
// let url = "https://bechdeltest.com/api/v1/getAllMovies"
d3.json("https://raw.githubusercontent.com/6859-sp21/a4-bechdel-test/main/getAllMovies.json").then((bechdelData) => {
  all_data = bechdelData;
  activeData = [];
  // Make a list of Movie Names for Search
  movie_names = []
  for (i=0; i<all_data.length; i++) {
    movie_names.push(all_data[i].title);
  };

  $( "#movie_search_box" ).autocomplete({
    source: movie_names
  });
  // submit movie button
  $("#movie_search_box").keyup(function (e) {
      if (e.keyCode == 13) {
          // Do something
          // console.log('pressed enter');
          find_movie();
      }
  });

  make_stats(all_data);



  // const avgRating = d3.create("div");
  // const avgDecade = d3.create("div");
});

function find_movie(){
  // get the searched movie name
  const search_title = $('#movie_search_box').val();
  index = movie_names.indexOf(search_title)
  if (index != -1){
    //add the movie to the active list and re generate visualization/stats
    activeData.push(all_data[index]);
    make_stats(activeData);
    make_plot(activeData);
  }
};

function make_stats(data) {
  const passingData = data.filter(d => d.rating === 3);
  const passCount = d3.count(passingData, d => d.rating);
  const passRate = Math.round(passCount / d3.count(data, d => d.rating) * 1000 ) / 10; //round to one decimal point

  const avgRating = d3.mean(data, d => d);
  const totalGross = 2000000; //code this as a query

  const abc = [{name: "Pass Rate", value: passRate}, {name: "Average Rating", value: avgRating},
   {name: "Total Domestic Box Office Earnings ($)", value: totalGross}, {name: "Number of Movies", value:activeData.length}];
  // make a list for all three stats
  let container = d3.create('div');
  container.selectAll('div')
    .data(abc)
    .join('div')
    .text(d => `${d.name}: ${d.value}`);

  document.getElementById("stats").appendChild(container.node())
}

function make_plot(data) {
  //code to make the d3 visualization Circular Bar Chart?
  return
}
  // // 2. Setting up variables that describe our chart's space.
  // const height = 400;
  // const width = 500;;
  // const margin = ({top: 10, right: 10, bottom: 20, left: 20});

  // // // 3. Create a SVG we will use to make our chart.
  // // // See https://developer.mozilla.org/en-US/docs/Web/SVG for more on SVGs.
  // const svg = d3.create('svg')
  //   .attr('width', width)
  //   .attr('height', height);


  // // 5. Drawing our points
  // const symbol = d3.symbol();
  // const g = svg.append('g')
  //   .classed('marks', true)

  //   // helper that tackles selection and cluster color in the absence of a selection
  //   function getClusterColor(datum) {
  //     if (datum.hasOwnProperty("selected") && !datum.selected) {
  //       return "lightgray";
  //     }
  //     return colorScale(datum.cluster);
  //   };

  // //*********************************************************************
  // // Draw our histogram
  // const width_histo = 500,
  //       height_histo = 150,
  //       margin_histo = {top: 10, right: 0, bottom: 20, left: 150};

  // const svg_histo = d3.create('svg')
  //   .attr('width', width_histo)
  //   .attr('height', height_histo);

  // // Helper function to nicely aggregate the data to plot on the histogram
  // // output: [{key: 0, value: 495927174}, {key: 1, value: 355392405}, ...{key: 5, value: 854125031}]
  // const aggregate_Histo = (data) => d3.rollups(
  //   data.filter(d => (d.year === year && (!d.hasOwnProperty('selected') || d.selected == true))),
  //   vals => d3.sum(vals, d => d.pop),
  //   d => d.cluster
  // ).map(d => ({key: d[0], value: d[1]}));

  // const rawAggregate = aggregate_Histo(gapminder);

  // const xScale_Histo = d3.scaleLinear()
  //   .domain([0, d3.max(rawAggregate, d => d.value)])
  //   .range([margin_histo.left, width_histo - margin_histo.right])
  //   .nice();

  // const yScale_Histo = d3.scaleBand()
  //   .domain(rawAggregate.map(d => d.key))
  //   .range([height_histo - margin_histo.bottom, margin_histo.top])
  //   .padding(0.1);

  // svg_histo.append('g')
  //   .classed('x-axis', true)
  //   .attr('transform', `translate(0, ${height_histo - margin_histo.bottom})`)
  //   .call(d3.axisBottom(xScale_Histo).ticks(3));

  // const continents = ['South Asia',
  //   'Europe & Central Asia',
  //   'Sub-Saharan Africa',
  //   'America',
  //   'East Asia & Pacific',
  //   'Middle East & North Africa'];

  // svg_histo.append('g')
  //   .classed('y-axis', true)
  //   .attr('transform', `translate(${margin_histo.left}, 0)`)
  //   .call(d3.axisLeft(yScale_Histo).tickFormat((d,i) => continents[d]));

  // const g_hist = svg_histo.append('g')
  //   .classed('marks', true);

  // //histogram datajoin
  // function dataJoinHisto(rawData = gapminder) {
  //   const data = aggregate_Histo(rawData);
  //   // console.log(data);

  //   g_hist.selectAll('rect')
  //     .data(data)
  //     // // join without animation:
  //     // .join('rect')
  //     //   .attr('x', margin_histo.left)
  //     //   .attr('y', d => yScale_Histo(d.key))
  //     //   .attr('width', d => xScale_Histo(d.value) - margin_histo.left)
  //     //   .attr('height', yScale_Histo.bandwidth())
  //     //   .style('fill', d => colorScale(d.key))
  //     // // To animate the changes instead:
  //     .join(
  //       enter => enter.append("rect")
  //           .attr("fill", d => colorScale(d.key))
  //           .attr('x', margin_histo.left)
  //           .attr('y', d => yScale_Histo(d.key))
  //           .attr('height', yScale_Histo.bandwidth())
  //         .call(enter => enter.transition().duration(1000)
  //           .attr('width', d => xScale_Histo(d.value) - margin_histo.left)),
  //       update => update
  //           .attr("fill", d => colorScale(d.key))
  //           .attr('y', d => yScale_Histo(d.key))
  //           // .attr('width', d => xScale_Histo(d.value) - margin_histo.left),
  //         .call(update => update.transition().duration(200)
  //           .attr('width', d => xScale_Histo(d.value) - margin_histo.left)),
  //       exit => exit
  //         .call(exit => exit.transition().duration(1000)
  //           .attr('width', d => xScale_Histo(0) - margin_histo.left)
  //           .remove())
  //     );

  // }
  // //*********************************************************************

  // //scatter plot datajoin
  // function dataJoin(rawData = gapminder) {
  //     const data = rawData.filter(d => d.year === year);

  //     g.selectAll('path')
  //         .data(data)
  //         .join('path')
  //           .classed('country', true) // can reference these marks like css, i.e. 'path.country'
  //           .attr('transform', d => `translate(${xScale(d.fertility)}, ${yScale(d.life_expect)})`)
  //           .attr('fill', d => getClusterColor(d))
  //           .attr('fill-opacity', 0.7)
  //           .attr('d', d => symbol())
  //   }


  // // Helper to draw both the scatter plot and the histogram
  // function chartsDataJoin(rawData = gapminder) {
  //   dataJoin(rawData);

  //   // this is for the histogram
  //   dataJoinHisto(rawData);
  // };

  // chartsDataJoin();

  // //6. Drawing our x-axis
  // svg.append('g')
  // .attr('transform', `translate(0, ${height - margin.bottom})`)
  // .call(d3.axisBottom(xScale))
  // // Add x-axis title 'text' element.
  // .append('text')
  //   .attr('text-anchor', 'end')
  //   .attr('fill', 'black')
  //   .attr('font-size', '12px')
  //   .attr('font-weight', 'bold')
  //   .attr('x', width - margin.right)
  //   .attr('y', -10)
  //   .text('Fertility');

  // //7. Drawing our y-axis
  // svg.append('g')
  //   .attr('transform', `translate(${margin.left}, 0)`)
  //   .call(d3.axisLeft(yScale))
  //   // Add y-axis title 'text' element.
  //   .append('text')
  //     .attr('transform', `translate(20, ${margin.top}) rotate(-90)`)
  //     .attr('text-anchor', 'end')
  //     .attr('fill', 'black')
  //     .attr('font-size', '12px')
  //     .attr('font-weight', 'bold')
  //     .text('Life Expectancy');

  // //8.  Adding a background label for the year.
  // const yearLabel = svg.append('text')
  //   .attr('x', 40)
  //   .attr('y', height - margin.bottom - 20)
  //   .attr('fill', '#ccc')
  //   .attr('font-family', 'Helvetica Neue, Arial')
  //   .attr('font-weight', 500)
  //   .attr('font-size', 80)
  //   .text(year);

  // // 9. Adding a brush to allow selecting a sub-region
  // const brush = d3.brush()  // Add the brush feature using the d3.brush function
  //   // initialise the brush area
  //   .extent([[0, 0], [width, height]]) // wrong
  //   .extent([[margin.left, 0], [width, height-margin.bottom]])
  //   .on("start brush end", brushed)

  // // 10. append element and call brush
  // svg.select("g.marks")
  //     .attr("class", "brush")
  //     .call(brush)

  // // 11. add brush callback to handle brush event
  // function brushed(event) {
  //   const coords = event.selection; // [[x0, y0], [x1, y1]] for 2D brushes; [x0, x1] or [y0, y1] for 1D brushes
  //   if (coords) {
  //     const [[x0, y0], [x1, y1]] = coords;

  //     // augment the data with a field "selected" which is set to true only
  //     // for points within the brush selection
  //     const brushedData = gapminder.map(d => {
  //       return {
  //         ...d,
  //         selected: x0 <= xScale(d.fertility) && xScale(d.fertility) < x1 && y0 <= yScale(d.life_expect) && yScale(d.life_expect) < y1
  //       };
  //     });

  //     chartsDataJoin(brushedData);
  //   }
  // };

  // // 12. adding a clear on double click
  // svg.on('dblclick', (event, d) => {
  //   // gapminder data is not augmented with the "selected" field above,
  //   // so getClusterColor knows to not grey things out
  //   chartsDataJoin(gapminder);
  // });

  // document.getElementById("chart").appendChild(svg.node());

  // //add the histogram below the graph
  // document.getElementById("chart").appendChild(svg_histo.node());
