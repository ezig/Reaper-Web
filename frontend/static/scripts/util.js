var global_table_id = 0;

// The function that creates a table within given div
function tabulate(data, columns, div_id) {

  var table = d3.select(div_id + " .tbl").append("table"),
      thead = table.append("thead"),
      tbody = table.append("tbody");

  table_id = "table" + global_table_id
  table.attr("class", "stripe compact");
  table.attr("id", table_id);
  global_table_id = global_table_id + 1;

  // Append the header row
  thead.append("tr")
    .selectAll("th")
    .data(columns)
    .enter()
    .append("th")
    .text(function (column) {
      return column;
    });

  // Create a row for each object in the data
  var rows = tbody.selectAll("tr")
    .data(data)
    .enter()
    .append("tr");

  // Create a cell in each row for each column
  var cells = rows.selectAll("td")
    .data(function (row) {
      return columns.map(function (column) {
        return {
          column: column,
          value: row[column]
        };
      });
    })
    .enter()
    .append("td")
    .text(function (d) {
      return d.value;
    });

  $("#" + table_id).DataTable( {
      scrollY:        400,
      scrollCollapse: true,
      deferRender:    true,
      paging:         false,
      bFilter: false, 
      bInfo: false,
      "columnDefs": [
        {"className": "dt-center", "targets": "_all"}
      ]
  });

  $('#' + table_id+ " tbody")
    .on( 'click', 'tr', function () {
      $(this).toggleClass('selected');
    });

  return table;
}

// replacing linebreaks etc with html things
String.prototype.replaceAll = function(search, replacement) {
  var target = this;
    return target.split(search).join(replacement);
};
function htmlForTextWithEmbeddedNewlines(text) {
  var htmls = [];
  var lines = text.replaceAll("\\r", "").replaceAll("\t", "    ").replaceAll(/ /g, ' ').split(/\\n/);
  // The temporary <div/> is to perform HTML entity encoding reliably.
  // Don't need jQuery but then you need to struggle with browser
  // differences in innerText/textContent yourself
  var tmpDiv = jQuery(document.createElement('div'));
  for (var i = 0 ; i < lines.length ; i++) {
    htmls.push(tmpDiv.text(lines[i]).html());
  }
  return htmls.join("<br>");
}

// creating histogram
// plot a histogram from mpg data in a .csv file
function gen_histogram(csvdata, div_id) {
  var binsize = 1;
  var minbin = 0;
  var maxbin = csvdata.length;
  console.log(csvdata);
  var numbins = (maxbin - minbin) / binsize;

  // whitespace on either side of the bars in units of MPG
  var binmargin = .2; 
  var margin = {top: 20, right: 10, bottom: 40, left: 50};
  var width = $(div_id).width() - margin.left - margin.right;
  var height = 250 - margin.top - margin.bottom;

  // Set the limits of the x axis
  var xmin = minbin
  var xmax = maxbin

  histdata = new Array(numbins);
  for (var i = 0; i < numbins; i++) {
    histdata[i] = { 
      numfill: parseFloat(csvdata[i].c2), 
      meta: csvdata[i].c2 
    };
  }

  // Fill histdata with y-axis values and meta data
  /*csvdata.forEach(function(d) {
    var bin = Math.floor((+d.c2 - minbin) / binsize);
    if ((bin.toString() != "NaN") && (bin < histdata.length)) {
      histdata[bin].numfill += 1;
      histdata[bin].meta += "<tr><td>" + d.c1 + 
        "</td><td>" + 
        d.c2 + " </td></tr>";
    }
  });*/

  // This scale is for determining the widths of the histogram bars
  // Must start at 0 or else x(binsize a.k.a dx) will be negative
  var x = d3.scaleLinear()
  .domain([0, (xmax - xmin)])
  .range([0, width]);

  var ctnt = [];
  for (var i = 0; i < numbins; i ++) {
    ctnt.push(csvdata[i].c1);
  }

  // Scale for the placement of the bars
  var x2 = d3.scaleLinear()
  .domain([xmin, xmax])
  .range([0, width]);

  var y = d3.scaleLinear()
  .domain([0, d3.max(histdata, function(d) { 
          return d.numfill; 
          })])
  .range([height, 0]);

  var xAxis = d3.axisBottom().scale(x2).tickFormat(function(d) { 
                if (Number.isInteger(d-0.5)) {
                  return ctnt[parseInt(d-0.5)];
                }
                return "";
            });
  var yAxis = d3.axisLeft().scale(y).ticks(8);

  var tip = d3.tip()
  .attr('class', 'd3-tip')
  .direction('e')
  .offset([0, 20])
  .html(function(d) {
    return '<table id="tiptable">' + d.meta + "</table>";
  });

  // put the graph in the "mpg" div
  var svg = d3.select(div_id).append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + 
          margin.top + ")");

  svg.call(tip);

  // set up the bars
  var bar = svg.selectAll(".bar")
  .data(histdata)
  .enter().append("g")
  .attr("class", "bar")
  .attr("transform", function(d, i) { return "translate(" + 
       x2(i * binsize + minbin) + "," + y(d.numfill) + ")"; })
  .on('mouseover', tip.show)
  .on('mouseout', tip.hide);

  // add rectangles of correct size at correct location
  bar.append("rect")
  .attr("x", x(binmargin))
  .attr("width", x(binsize - 2 * binmargin))
  .attr("height", function(d) { return height - y(d.numfill); });

  // add the x axis and x-label
  svg.append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," + height + ")")
  .call(xAxis);
  svg.append("text")
  .attr("class", "xlabel")
  .attr("text-anchor", "middle")
  .attr("x", width / 2)
  .attr("y", height + margin.bottom - 5)
  .text("Diagram");

  // add the y axis and y-label
  svg.append("g")
  .attr("class", "y axis")
  .attr("transform", "translate(0,0)")
  .call(yAxis);
  svg.append("text")
  .attr("class", "ylabel")
  .attr("y", 0 - margin.left) // x and y switched due to rotation
  .attr("x", 0 - (height / 2))
  .attr("dy", "1em")
  .attr("transform", "rotate(-90)")
  .style("text-anchor", "middle")
  .text("c2");
}