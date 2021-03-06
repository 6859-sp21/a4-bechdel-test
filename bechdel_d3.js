// Load data from a URL. You can also have the json file downloaded.
// See https://github.com/d3/d3/blob/master/API.md#fetches-d3-fetch for more options.
// let url = "https://raw.githubusercontent.com/6859-sp21/a4-bechdel-test/main/movies.csv"
d3.csv("https://raw.githubusercontent.com/6859-sp21/a4-bechdel-test/main/movies.csv").then((bechdelData) => {
  all_genre_data = bechdelData.filter(d => parseInt(d.rating) !== -1);
  sorted = false;
  default_data = true;

  document.getElementById('genre_select1').value = "Animation";
  change_genre(1);
  document.getElementById('genre_select2').value = "Romance";
  change_genre(2);
  document.getElementById('genre_select3').value = "Fantasy";
  change_genre(3);
});

d3.json("https://raw.githubusercontent.com/6859-sp21/a4-bechdel-test/main/getAllMovies.json").then((bechdelData1) => {
   all_search_data = bechdelData1;
   all_search_data.sort(function(x, y){
    return d3.ascending(x.year, y.year);
   })
   currentData = all_search_data.slice(8880);
   currentData.sort(function(x, y){
    return d3.ascending(x.id, y.id);
   })
   make_plot(currentData, 0);

   // Make a list of Movie Names for Search
   movie_names = []
   movie_names = all_search_data.map(m => m.title+', '+m.year);

   $( "#movie_search_box" ).autocomplete({
     source: function(request, response) {
        var results = $.ui.autocomplete.filter(movie_names, request.term);

        response(results.slice(0, 100));
    },
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


});

function find_movie(search_title){
  // get the searched movie name
  // const search_title = $('#movie_search_box').val();
  index = movie_names.indexOf(search_title)
  if (index != -1){
    //add the movie to the active list and re generate visualization/stats
    if (currentData.indexOf(all_search_data[index]) === -1){
      if (default_data) {
        currentData = [];
        default_data = false;
      }
      currentData.push(all_search_data[index]);
      sorted = true;
      sortData();
      make_plot(currentData, 0);
      get_user_movies()
    }

    $('#movie_search_box').val('');
  }
};

function make_plot(data, num) {
  $("div#vis" + num).empty(); // prevent accumulation of stats
  const margin = 200;
  const colorScale = d3.scaleOrdinal()
    .domain([0, 1, 2, 3])
    .range(["#fdbf6f", '#b2df8a', "#fb9a99", "#a6cee3"])

  // set the dimensions and margins of the graph
  var width = 1000,
      height = 700,
      innerRadius = 80,
      outerRadius = width / 2 - margin;   // the outerRadius goes from the middle of the SVG area to the border

  // append the svg object to the body of the page
  var svg = d3.select("div#vis" + num)
    .append("svg")
    .attr("viewBox", `${-width / 2} ${-height / 2} ${width} ${height}`)
    .style("width", "100%")
    .style("height", "100%")
    .append("g")

  x = d3.scaleBand()
    .domain(data.map(d => `${d.title} (${d.year}`))
    .range([0, 2 * Math.PI])
    .align(0)

  y = d3.scaleRadial()
      .domain([0, 3])
      .range([innerRadius+50, outerRadius])

  yAxis = g => g
      .attr("text-anchor", "middle")
      .call(g => g.selectAll("g")
        .data(y.ticks(4))
        .join("g")
          .attr("fill", "none")
          .call(g => g.append("circle")
              .attr("stroke", "#000")
              .attr("stroke-opacity", 0.2)
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

// d3 is not sure what is being entered + being updated perhaps
  arc = d3.arc()
    .innerRadius(innerRadius)
    .outerRadius(d => y(parseInt(d.rating)))
    .startAngle(d => x(`${d.title} (${d.year}`))
    .endAngle(d => x(`${d.title} (${d.year}`) + x.bandwidth())
    .padAngle(0.01)
    .padRadius(innerRadius)

  function arcTween(a) {
      var i = d3.interpolate(this._current, a);
      this._current = i(0);
      return function(t) {
        return arc(i(t));
      };
    }
  if (num === 0) {
    svg.selectAll("path")
      .data(data)
      .enter()
      .append("path")
        .attr("fill", d => colorScale(d.rating))
        .attr("d", arc)
        .on("contextmenu", openContextMenu1)
        .each(function(d) {this._current = d})
  } else {
    svg.selectAll("path")
      .data(data)
      .enter()
      .append("path")
        .attr("fill", d => colorScale(d.rating))
        .attr("d", arc)
        .each(function(d) {this._current = d})
  }

  svg.selectAll("path")
    .data(data)
    .transition()
      .duration(750)
      // .attrTween("d", arcTween);

  // svg.selectAll("path")
  //   .data(data)
  //   .exit().remove()


  // center percentage
  let passRate;
  if (data.length > 0) {
    let passData = data.filter(d => parseInt(d.rating) === 3);
    let passCount = d3.count(passData, d => d.rating);
    passRate = Math.round(passCount / d3.count(data, d => d.rating) * 10**3) / 10; // round to one decimal point
  } else {
    passRate = 0
  }


  svg.append("text")
    .attr("text-anchor", "middle")
    .attr('y', -8)
    .attr('font-size', '2em')
    .text(`${passRate}%`)

    svg.append("text")
    .attr("text-anchor", "middle")
    .attr('y', 20)
    .attr('font-size', '2em')
    .text(`passed`)

  // tooltips
  var tooltip = d3.select("div#vis" + num).append("div")
    .attr("class", "tooltip")
      .style("position", "absolute")
      .style("z-index", "10")
      .style("visibility", "hidden")
      .style("background", "white")
      .style("padding", "10px")
      .style("border-radius", "5px")
      .style("width", "200px")

  svg.selectAll("path")
    .on("mouseover", function(event, d) {
      tooltip.transition()
        .duration(200)
        .style("opacity", 0.9)
        .style("visibility", "visible")})
    .on("mousemove", function(event, d) {
      d3.select(this)
        .style("opacity", 0.5)
      tooltip.html("<b>Movie Title:</b> " + d.title + "<br/> <b>Year: </b>" + d.year)
        .style("top",(event.pageY-10)+"px").style("left",(event.pageX+10)+"px")
    })
    .on("mouseout", function(){
      tooltip.transition()
        .duration(300)
        .style("opacity", 0)
        .style("visiblity", 'hidden')
      d3.select(this)
        .style("opacity", 1.0)})

    // add y axis labels
    svg.append("g")
      .call(yAxis)
}

function sortData() {
  if (!sorted) { // sort
    sorted = true;
    currentData.sort(function(x, y){
      return d3.ascending(x.rating, y.rating);
    })
    make_plot(currentData, 0);
  } else { // time to unsort
    sorted=false;
    currentData.sort(function(x, y){
      return d3.ascending(x.id, y.id);
    })
    make_plot(currentData, 0)
  }
}

function toggle_explanation() {
  var x = document.getElementById("explanation");
  var y = document.getElementById("user_list");
  if (x.style.display === "none") {
    x.style.display = "block";
    y.style.display = "none";
  } else {
    x.style.display = "none";
    y.style.display = "block";
    get_user_movies();
  }
}

function get_user_movies() {
  $("ol#user_movies").empty();

  const container = d3.select('ol#user_movies');
  container.selectAll('li')
    .data(currentData)
    .join('li')
    .text(d => d.title + ', ' + d.year);
}

function clearData() {
  currentData = [];
  get_user_movies();
  make_plot(currentData, 0);
}
function removeElement() {
  currentData.splice(menu1.selected, 1);
  get_user_movies();
  make_plot(currentData, 0)
}

// Context Menu Stuff

const menu = new ContextMenu({
      'theme': 'default', // or 'blue'
      'items': [
        {'icon': 'sort', 'name': 'Toggle Sort',  action: () => sortData()  },
        {'icon': 'trash',    'name': 'Clear', action: () => clearData() },
      ]
});

const menu1 = new ContextMenu({
      'theme': 'default', // or 'blue'
      'items': [
        {'icon': 'minus-square', 'name': 'Delete',  action: () => removeElement()  },
        {'icon': 'sort', 'name': 'Toggle Sort',  action: () => sortData()  },
        {'icon': 'trash',    'name': 'Clear', action: () => clearData() },
      ]
});

function openContextMenu1(evt){

  // prevent default event
  evt.preventDefault();
  //pre-remove the
  menu1.selected = (currentData.indexOf(evt.target.__data__));
  // open the menu with a delay
  const time = menu1.isOpen() ? 100 : 0;

  // hide the current menu (if any)
  menu1.hide();
  menu.hide()

  // display menu at mouse click position
  setTimeout(() => { menu1.show(evt.pageX, evt.pageY) }, time);

  // close the menu if the user clicks anywhere on the screen
  document.addEventListener('click', hideContextMenu1, false);

}

function hideContextMenu1(evt){

  // hide the menu
  menu1.hide();

  // remove the listener from the document
  document.removeEventListener('click', hideContextMenu1);

}

function openContextMenu(evt){

  // prevent default event
  evt.preventDefault();

  // open the menu with a delay
  const time = menu.isOpen() ? 100 : 100;

  // hide the current menu (if any)
  menu.hide();
  menu1.hide()

  // display menu at mouse click position
  setTimeout(() => { menu.show(evt.pageX, evt.pageY) }, time);

  // close the menu if the user clicks anywhere on the screen
  document.addEventListener('click', hideContextMenu, false);

}

function hideContextMenu(evt){

  // hide the menu
  menu.hide();

  // remove the listener from the document
  document.removeEventListener('click', hideContextMenu);

}

document.addEventListener('contextmenu', openContextMenu, false);

function change_genre(num) {
  var e = document.getElementById("genre_select" + num);
  var genre = e.options[e.selectedIndex].text;
  var genre_data = all_genre_data.filter(d => d.genre.match(genre));
  genre_data.sort(function(x, y){
    return d3.ascending(x.rating, y.rating);
  })
  make_plot(genre_data, num);
}
