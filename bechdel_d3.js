// Load data from a URL. You can also have the json file downloaded.
// See https://github.com/d3/d3/blob/master/API.md#fetches-d3-fetch for more options.
// let url = "https://raw.githubusercontent.com/6859-sp21/a4-bechdel-test/main/movies.csv"
d3.csv("https://raw.githubusercontent.com/6859-sp21/a4-bechdel-test/main/movies.csv").then((bechdelData) => {
  all_data = bechdelData.filter(d => parseInt(d.rating) !== -1);
  activeData = [];

  // Make a list of Movie Names for Search
  movie_names = []
  movie_names = all_data.map(m => m.title);

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
  make_plot(activeData)

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
  $("div#stats").empty(); // prevent accumulation of stats

  const passData = data.filter(d => parseInt(d.rating) === 3);
  const passCount = d3.count(passData, d => d.rating);
  const passRate = Math.round(passCount / d3.count(data, d => d.rating) * 10**3) / 10; // round to one decimal point

  const avgIMDbRating = Math.round(d3.mean(data, d => d.imdb_rating) * 10) / 10; // round to one decimal point

  const avgDomGross = Math.round(d3.mean(data, d => d.domgross) / 10**5) / 10; // in millions, round to one decimal point

  const stats = [{name: "Bechdel Test Pass Rate", value: `${passRate}%`},
                 {name: "Average IMDb Rating", value: avgIMDbRating},
                 {name: "Average Domestic Box Office Gross", value: `$${avgDomGross}M`}];
                //  {name: "Number of Movies", value:activeData.length}];

  const container = d3.select('div#stats');
  container.selectAll('div#statvalue')
    .data(stats)
    .join('div')
    .attr('class', 'statvalue')
    .style('width', 100 / 3 + '%')
    .style('display', 'flex')
    .style('justify-content', 'center')
    .style('font-size', '3em')
    .text(d => d.value);
  container.selectAll('div#statname')
    .data(stats)
    .join('div')
    .attr('class', 'statname')
    .style('width', 100 / 3 + '%')
    .style('display', 'flex')
    .style('justify-content', 'center')
    .text(d => d.name);
}

function make_plot(data) {
  // NOT SUNBURST -> RADIAL STACKED BAR CHART
  // need to restructure dataset to be hierarchical (if rating is 3, create all children up to rating?)
    // need helper function 
    // array of objects, mapping movie name to bechdel test score at the very least

  // should only be passing in active data (for movies we're interested in querying)
  // adapted from https://bl.ocks.org/denjn5/e1cdbbe586ac31747b4a304f8f86efa5
  const width = 1000;
  const height = 1000;
  const outerRadius = Math.min(width / height) / 2;
  const innerRadius = 200;

  const color = d3.scaleOrdinal(d3.schemeCategory10);

  // let svg = d3.select("#vis")
  //   .append("svg")
  //   .attr("width", width)
  //   .attr("height", height)
  //   .append("g")
  //   .attr("transform", "translate(" + width/2 + "," + height/2 + ")");

  // let barScale = d3.scale.linear()
  //   .domain([0, data.length])
  //   .range([0, 3]);
  
  y = d3.scaleRadial()
    // .domain([0, 3])
    .domain([0, d3.max(data, d => d.rating)])
    .range([innerRadius, outerRadius])
  
  x = d3.scaleBand()
    .domain(data.map(d => d.title))
    .range([0, 2* Math.PI])
    .align(0)
  
  arc = d3.arc()
    .innerRadius(d => y(d[0]))
    .outerRadius(d => y(d[1]))
    .startAngle(d => x(d.data.title))
    .endAngle(d => x(d.data.title) + x.bandwidth())
    .padAngle(0.01)
    .padRadius(innerRadius)
  
  const svg = d3.select("#vis")
      .attr("viewBox", `${-width / 2} ${-height / 2} ${width} ${height}`)
      .style("width", "100%")
      .style("height", "auto")
      .style("font", "10px sans-serif");

  svg.append("g")
    .selectAll("g")
    .data(data)
    .join("g")
      // .attr("fill", d => z(d.key))
    .selectAll("path")
    .data(d => d)
    .join("path")
      .attr("d", arc);
  console.log(svg.node())
  return svg.node();
  
}
  