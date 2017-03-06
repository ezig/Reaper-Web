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
  
  // whitespace on either side of the bars in units of MPG
  var binmargin = .5; 
  var margin = {top: 40, right: 20, bottom: 40, left: 50};
  var height = $(div_id).height() - margin.top - margin.bottom;
  var width = Math.min($(div_id).width() - margin.left - margin.right, $(div_id).height() + 200 - margin.left - margin.right);

  var ymax = 0;
  var cnt_data = {};
  for (var i = 0; i < csvdata.length; i ++) {
    if (csvdata[i].c2 in cnt_data) {
      cnt_data[csvdata[i].c2] ++;
      if (cnt_data[csvdata[i].c2] > ymax)
        ymax = cnt_data[csvdata[i].c2];
    } else {
      cnt_data[csvdata[i].c2] = 1;
      if (cnt_data[csvdata[i].c2] > ymax)
        ymax = cnt_data[csvdata[i].c2];
    }
  }

  var binsize = 1;
  var minbin = 0;
  var maxbin = 60;
  var numbins = (maxbin - minbin) / binsize;
  // Set the limits of the x axis
  var xmin = 0;
  var xmax = 60;

  var binwidth = (width - 0) / 62 - 2 * binmargin;

  histdata = [];
  for (i in cnt_data) {
    dt = { 
      numfill: parseInt(cnt_data[i]), 
      meta: parseInt(i),
    };
    histdata.push(dt);
  }

  // This scale is for determining the widths of the histogram bars
  // Must start at 0 or else x(binsize a.k.a dx) will be negative
  var x = d3.scaleLinear()
  .domain([-1, (xmax - xmin) + 1])
  .range([0, width]);

  // Scale for the placement of the bars
  var y = d3.scaleLinear()
  /*.domain([0, d3.max(histdata, function(d) { 
            return d.numfill; 
          })])*/
  .domain([0, ymax])
  .range([height, 0]);

  var xAxis = d3.axisBottom().scale(x).ticks(10);
  var yAxis = d3.axisLeft().scale(y).ticks(8);

  var tip = d3.tip()
  .attr('class', 'd3-tip')
  .direction('e')
  .offset([0, 20])
  .html(function(d) {
    return '<table id="tiptable">' + "<tr><td>Year: "+ d.meta + "</td></tr><tr><td> Count: " + d.numfill + "</td></tr></table>";
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
         (x(d.meta * binsize) - binwidth / 2) + "," + y(d.numfill) + ")"; })
    .on('mouseover', tip.show)
    .on('mouseout', tip.hide);

  // add rectangles of correct size at correct location
  bar.append("rect")
//    .attr("x",)
    .attr("width", binwidth)
    .style("fill", function(d) {
      if (! isNaN(d.meta)) {
        return "#337ab7";
      } else {
        return "#d9534f";
      }
    })
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
    .text("c3 - c2");//.text("c3 - c2");

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
    .text("count");//.text("Count");
}

function build_pubviz(csvdata, div_id) {

  // whitespace on either side of the bars in units of MPG
  var binmargin = .2; 
  var margin = {top: 40, right: 20, bottom: 40, left: 50};
  var height = $(div_id).height() - margin.top - margin.bottom;
  var width = Math.min($(div_id).width() - margin.left - margin.right, $(div_id).height() + 200 - margin.left - margin.right);

  var xvals = [];
  var yvals = [];
  var data = [];
  var maxcnt = 1;

  xydata = []

  for (var i = 0; i < csvdata.length; i ++) {
    x = Number.parseInt(csvdata[i][csvdata.columns[0]]);
    y = Number.parseInt(csvdata[i][csvdata.columns[1]]);
    z = Number.parseInt(csvdata[i][csvdata.columns[2]]);
    if (z > maxcnt) {
      maxcnt = z; 
    }
    xydata.push([x,y,z]);
    xvals.push[x];
    yvals.push[y];
  }

  // Set the limits of the x axis
  var xmin = 0;
  var xmax = 60;

  // This scale is for determining the widths of the histogram bars
  // Must start at 0 or else x(binsize a.k.a dx) will be negative
  var x = d3.scaleLinear()
            .domain([0, (xmax - xmin)])
            .range([0, width]);

  // Scale for the placement of the bars
  var x2 = d3.scaleLinear()
             .domain([xmin-1, xmax+1])
             .range([0, width]);

  var y = d3.scaleLinear()
            .domain([-1,56])
            .range([height, 0]);

  var xAxis = d3.axisBottom().scale(x2);
  var yAxis = d3.axisLeft().scale(y).ticks(8);

  var tip = d3.tip()
  .attr('class', 'd3-tip')
  .direction('e')
  .offset([0, 20])
  .html(function(d) {
    return '<table id="tiptable"><tr><td>Career Length: ' + d[0] + "</td></tr><tr><td> Most Cited Paper Year: " + d[1] + "</td></tr><tr><td>Count: " + d[2] + "</td></tr></table>";
  });

  // put the graph in the "mpg" div
  var svg = d3.select(div_id).append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
              .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  svg.call(tip);

  // set up the bars
  var bar = svg.selectAll(".circle")
              .data(xydata)
              .enter().append("g")
              .attr("class", "circle")
              .on('mouseover', tip.show)
              .on('mouseout', tip.hide);

  circle_radius = 0.98 * (height / (55+2)) / 2;

  // add rectangles of correct size at correct location
  bar.append("circle")
  .attr("cx", function (d) { return x2(d[0]); })
  .attr("cy", function (d) { return y(d[1]); })
  .attr("r", function (d) { return circle_radius; })
  .style("fill", function(d) { return "#3182BD"; })
  .style("opacity", function(d) {return 0.05 + 0.95 * d[2] / maxcnt; });

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
    .text("c1");

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