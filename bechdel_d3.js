// Load data from a URL. You can also have the json file downloaded.
// See https://github.com/d3/d3/blob/master/API.md#fetches-d3-fetch for more options.
// let url = "https://raw.githubusercontent.com/6859-sp21/a4-bechdel-test/main/movies.csv"
d3.csv("https://raw.githubusercontent.com/6859-sp21/a4-bechdel-test/main/movies.csv").then((bechdelData) => {
  all_data = bechdelData.filter(d => parseInt(d.rating) !== -1);
  activeData = [];

  // Make a list of Movie Names for Search
  movie_names = []
  movie_names = all_data.map(m => m.title+', '+m.year);

  $( "#movie_search_box" ).autocomplete({
    source: movie_names,
    select: function(event, ui) {
        if(ui.item){
            // $('#movie_search_box').val(ui.item.value); //default functionality.
            find_movie(ui.item.value);
            $('#movie_search_box').val('');
            return false;
        }
    }
  });
  // submit movie button
  $("#movie_search_box").keyup(function (e) {
      if (e.keyCode == 13) {
          // Do something
          // console.log('pressed enter');
          find_movie($('#movie_search_box').val());
      }
  });

  make_stats(all_data);
  make_plot(all_data.slice(1600))

});

function find_movie(search_title){
  // get the searched movie name
  // const search_title = $('#movie_search_box').val();
  index = movie_names.indexOf(search_title)
  if (index != -1){
    //add the movie to the active list and re generate visualization/stats
    activeData.push(all_data[index]);
    make_stats(activeData);
    make_plot(activeData);
    $('#movie_search_box').val('');
  }
};

function sortDataByRatings(data) {
  function compareRating(a,b) {
    let comparison = 0;
    if (a.rating > b.rating) {
      comparison = 1
    } else if (a.rating < b.rating) {
      comparison = 01
    } return comparison;
  }
  sortedData = [...data]
  sortedData.sort(compareRating)
  return sortedData
}


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
    .style('font-size', '36px')
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
  let checked = false;
  $("div#vis").empty(); // prevent accumulation of stats
  console.log(data)
  const margin = 200;
  const colorScale = d3.scaleOrdinal()
    .domain([0, 1, 2, 3])
    .range(d3.schemeTableau10)

  // set the dimensions and margins of the graph
  var width = 1000,
      height = 700,
      innerRadius = 80,
      outerRadius = width / 2 - margin;   // the outerRadius goes from the middle of the SVG area to the border

  // append the svg object to the body of the page
  var svg = d3.select("div#vis")
    .append("svg")
    .attr("viewBox", `${-width / 2} ${-height / 2} ${width} ${height}`)
    .style("width", "100%")
    .style("height", "100%")
    .append("g")
  
  x = d3.scaleBand()
    .domain(data.map(d => d.title))
    .range([0, 2 * Math.PI])
    .align(0)

  y = d3.scaleRadial()
      .domain([0, 3])
      .range([innerRadius+50, outerRadius])

  yAxis = g => g
      .attr("text-anchor", "middle")
      // .call(g => g.append("text")
      //     .attr("y", d => -y(y.ticks(5).pop()))
      //     .attr("dy", "-1em"))
          // .text("Bechdel Test Score"))
      .call(g => g.selectAll("g")
        .data(y.ticks(4))
        .join("g")
          .attr("fill", "none")
          .call(g => g.append("circle")
              .attr("stroke", "#000")
              .attr("stroke-opacity", 0.5)
              .attr("r", y))
          .call(g => g.append("text")
              .attr("y", d => -y(d))
              .attr("dy", "0.35em")
              .attr("stroke", "#fff")
              .attr("stroke-width", 5)
              .text(y.tickFormat(4, "s"))
           .clone(true)
              .attr("fill", "#000")
              .attr("stroke", "none")))


  arc = d3.arc()
    .innerRadius(innerRadius)
    .outerRadius(d => y(parseInt(d.rating)))
    .startAngle(d => x(d.title))
    .endAngle(d => x(d.title) + x.bandwidth())
    .padAngle(0.03)
    .padRadius(innerRadius)

  function arcTween(a) {
      console.log(a)
      console.log(this._current)
      var i = d3.interpolate(this._current, a);
      this._current = i(0);
      return function(t) {
        return arc(i(t));
      };
    }
  svg.append("g")
    .selectAll("path")
    .data(data)
    .enter()
    .append("path")
      .attr("fill", d => colorScale(d.rating))
      .attr("d", arc)
      .each(function(d) {this._current = d})
      .transition().duration(750).attrTween("d", arcTween)


  // tooltips
  var tooltip = d3.select("div#stats").append("div")
    .attr("class", "tooltip")
      .style("position", "absolute")
      .style("z-index", "10")
      .style("visibility", "hidden")
      .style("background", "white")
      .style("padding", "10px")
      .style("border-radius", "10px")
      .style("width", "300px")

  svg.selectAll("path")
    .on("mouseover", function(event, d) {
      tooltip.transition()
        .duration(200)
        .style("opacity", 0.9)
        .style("visibility", "visible")})
    .on("mousemove", function(event, d) {
      d3.select(this)
        .style("opacity", 0.5)
      tooltip.html("Movie Title: " + d.title)
        .style("top",(event.pageY-10)+"px").style("left",(event.pageX+10)+"px")
    })  
    .on("mouseout", function(){
      tooltip.transition()
        .duration(300)
        .style("opacity", 0)
        .style("visiblity", 'hidden')
      d3.select(this)
        .style("opacity", 1.0)})

  //  sorting
  function change() {
    if (checked) {
      svg.selectAll("path")
      .sort(function(a, b) {return b.rating - a.rating})

    } else{
      arc.sort(function(a, b){return a.rating - b.rating})
    }
  }

  d3.select("input").on("change", change);

 
  // add movie titles
  // svg.append("g")
  //     .selectAll("g")
  //     .data(data)
  //     .enter()
  //     .append("g")
  //       .attr("text-anchor", function(d) { return (x(d.title) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "end" : "start"; })
  //       .attr("transform", function(d) { return "rotate(" + ((x(d.title) + x.bandwidth() / 2) * 180 / Math.PI - 90) + ")"+"translate(" + (y(d.rating)+10) + ",0)"; })
  //     .append("text")
  //       .text(function(d){return(d.title)})
  //       .attr("transform", function(d) { return (x(d.title) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "rotate(180)" : "rotate(0)"; })
  //       .style("font-size", "14px")
  //       .attr("alignment-baseline", "middle")

    // add y axis labels
    svg.append("g")
      .call(yAxis)
    

}

function change_genre() {
  var e = document.getElementById("select_genre");
  var genre = e.options[e.selectedIndex].text;
  genre_data = all_data.filter(d => d.genre.match(genre));
  make_stats(genre_data);
  make_plot(genre_data);
}