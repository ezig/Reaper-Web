reserved_id_connector = "_-_";

function gen_input_panel_btn(container_id, upload_btn_id, target_div_id) {
	
	target_table_content_id =  target_div_id + reserved_id_connector + "table";

  // get attribute panel_id from the container
  panel_id = $("#" + container_id).attr("current_panel_id");

	html_frame = 
		"<div class=\"buttons btn-group btn-group-justified\" style='padding-left:10px;padding-right:10px;'>\
      <label panel_id='" + panel_id + "' id=\"add_sub_input_example_btn" 
            + panel_id + "\" class=\"btn btn-primary\" style='padding-left:3px; padding-right:3px;'>\
              <span class=\"glyphicon glyphicon-plus\"></span> Add Input Table</label>\
      <label class=\"btn btn-primary\">\
        Load Data\
        <input class=\"fileupload\" target_table_content_id=\"" + target_table_content_id 
        + "\" id=\"" + upload_btn_id + "\" type=\"file\"  style=\"display: none;\" name=\"files[]\">\
      </label>\
    </div>";

  $("#" + container_id).html(html_frame);

  $("#add_sub_input_example_btn" + panel_id).click(function() {
    panel_id = $(this).attr("panel_id");
    
    // extract number of panels
    sub_panel_cnt = parseInt($("#input-example" + panel_id).attr("sub_panel_cnt"));
    sub_panel_cnt += 1;

    // update panel_cnt
    $("#input-example" + panel_id).attr("sub_panel_cnt", String(sub_panel_cnt));
    $("#input-example" + panel_id).append("<div id=\"input-example" + panel_id 
                                           + "sub" + sub_panel_cnt + "\"></div>");

    // update the new table and the adjustable table panel
    gen_adjustable_table_div("input-example" + panel_id + "sub" + sub_panel_cnt, 
                             "itable_" + panel_id + "_" + sub_panel_cnt);
    gen_input_panel_btn("input-panel-btns" + panel_id, 
                        "itable_upload_btn_" + panel_id, "itable_" + panel_id + "_" + sub_panel_cnt);

    // update synthesize btn
    sub_panel_id_list = [];
    for (var i = 1; i <= sub_panel_cnt; i ++) {
      sub_panel_id_list.push("itable_" + panel_id + "_" + i);
    }
    gen_synthesize_btn("synthesize-btn-container" + panel_id, 
                       "synthesize-btn" + panel_id, 
                       sub_panel_id_list,
                       "otable_" + panel_id, 
                       "constraint-panel" + panel_id,
                       "display-panel" + panel_id);
  });

	// event handler for uploading files
  // Add click event handler to button
  $("#" + upload_btn_id).on("change", function () {

		target_id = $(this).attr("target_table_content_id");

    if (! window.FileReader ) {
      return alert( 'FileReader API is not supported by your browser.' );
    }
    var $i = $(this), // Put file input ID here
      input = $i[0]; // Getting the element from jQuery
    if (input.files) {
      for (var i = 0; i < input.files.length; i ++) {
        (function(file) {
          var reader = new FileReader();  
          reader.onload = function () {
          
            // test displaying onload files
            //$('#file-content').append( $( '<div/>' ).html( reader.result ));

            file_content = reader.result;
            input_csv = file_content;
            csvdata = d3.csvParse(file_content);

            header_str = "";
            for (col in csvdata.columns) {
              header_str += "<td class=\"col-md-2\">" + csvdata.columns[col] + "</td>"
            }
            $("#" + target_id + " thead tr").html(header_str);
            body_str = "";
            for (var i = 0; i < csvdata.length; i ++) {
              tr_str = "<tr>";
              for (j in csvdata.columns) {
                var cell = csvdata[i][csvdata.columns[j]].length > 12 ? 
                                (csvdata[i][csvdata.columns[j]].substring(0,12) + "...") 
                                : csvdata[i][csvdata.columns[j]];
                tr_str += "<td>" + cell  + "</td>";
              }
              tr_str += "</tr>";
              body_str += tr_str;
            }
            $("#" + target_id + " tbody").html(body_str);
            $("#" + target_id).editableTableWidget();
          };
          reader.readAsText(file, "UTF-8");
        })(input.files[i]);          
      }
    } else {
      // Handle errors here
      alert( "File not selected or browser incompatible." )
    }
  });
}

// target_input_div_id: the div id that contains the input example 
// (same as the one passed to gen_ajustbale_table_div)
function gen_synthesize_btn(container_id, btn_id, target_input_div_id_list, target_output_div_id, 
                            target_constraint_div_id, target_display_panel_id) {

	synthesize_btn = "<div class=\"buttons\" style=\"padding-left:10px;padding-right:10px;\">\
            					<button id=\"" + btn_id + "\" target_input_div_id=\"" 
            						+ serialize_id_list(target_input_div_id_list) + "\" target_output_div_id=\"" 
            						+ target_output_div_id + "\" target_display_panel_id=\"" 
            						+ target_display_panel_id 
                        + "\" class=\"btn btn-primary btn-block\">Synthesize</button>\
          					</div>";

  $("#" + container_id).html(synthesize_btn);

  $("#" + btn_id).on("click", function () {

  	target_input_div_id_list = deserialize_id_list($(this).attr("target_input_div_id"));
  	target_output_div_id = $(this).attr("target_output_div_id");

  	input_table_eg_list = [];
  	for (var i = 0; i < target_input_div_id_list.length; i ++ ) {
  		input_table_eg_list.push(get_generated_table_content(target_input_div_id_list[i]));
  	}
  	output_table_eg = get_generated_table_content(target_output_div_id);

  	var scythe_input_string = "";
  	for (var i = 0; i < input_table_eg_list.length; i ++) {
  		scythe_input_string += "#input:" +  input_table_eg_list[i].table_name + "\n\n";
  		scythe_input_string += input_table_eg_list[i].table_content_str + "\n\n"
  	}

  	scythe_input_string += "#output:" +  output_table_eg.table_name + "\n\n";
  	scythe_input_string += output_table_eg.table_content_str + "\n\n";

    // get constant and aggregation functions from the constraint panel
    constant_string = $("#" + target_constraint_div_id + " .constant-panel input").eq(0).val();
    aggr_function_string = $("#" + target_constraint_div_id + " .aggr-func-panel input").eq(0).val();

    // default aggregation functions includes only max, min, and count
    // TODO: thinking whether this can be re designed to utilize default aggregation functions in Scythe
    if (aggr_function_string == "")
      aggr_function_string = '"max", "min", "count"';

    // a special function that parses and formats the string provided by the user
    function parse_n_format_comma_delimited_str(str) {
      if (str == "")
        return "";
      return str.split(",").map(function(x) {return "\"" + x.trim().replace(/['"]+/g, '') + "\"";});
    }

    // the string used as the input to the synthesizer
    scythe_input_string += "#constraint\n\n{\n  \"constants\": [" 
                          + parse_n_format_comma_delimited_str(constant_string) + "],\n" 
                          + "\"aggregation_functions\": [" 
                          + parse_n_format_comma_delimited_str(aggr_function_string) 
                          + "]\n}\n";

    console.log(scythe_input_string);

		oe_csv_data = d3.csvParse(output_table_eg.table_content_str);

		target_display_panel_id = $(this).attr("target_display_panel_id");

    $.ajax({
      url: '/static/author_career.csv',
      method: 'GET',
      data: {},
      success: function (data) {
        csvdata = d3.csvParse(data);

        // default visualization type
        vis_type = "histogram";
        target_vis_panel_id = target_display_panel_id + " .display-vis";

        id = parseInt(target_display_panel_id.substring(target_display_panel_id.length-1));

        if (vis_type == "2dhistogram") {
          var map = {};
          for (var i = 0; i < csvdata.length; i ++) {
            if (csvdata[i].career_length == "" || csvdata[i].paper_year=="" 
                 || isNaN(csvdata[i].career_length) || isNaN(csvdata[i].paper_year))
              continue;
            x = Number.parseInt(csvdata[i].career_length);
            y = Number.parseInt(csvdata[i].paper_year);
            if (x in map) {
              if (y in map[x]) {
                map[x][y] += 1;
              } else {
                map[x][y] = 1;
              }
            } else {
              map[x] = {};
              map[x][y] = 1;
            }
          }
          map_str_lines = []
          map_str_lines.push("c1,c2,c3");
          for (i in map) {
            for (j in map[i]) {
              map_str_lines.push(i + "," + j + "," + map[i][j]);
            }
          }
          // only set up data but not modification
          $("#" + target_vis_panel_id).prop("full_data", map_str_lines.join("\n"));
        } else if (vis_type == "histogram") {
          histodata = [];
          histodata.push("c1,c2");
          for (i = 0; i < csvdata.length; i ++) {
            if (csvdata[i].career_length == "" || csvdata[i].paper_year=="" 
                || isNaN(csvdata[i].career_length) || isNaN(csvdata[i].paper_year))
              continue;
            c1 = csvdata[i][csvdata.columns[0]];
            c2 = parseInt(csvdata[i][csvdata.columns[1]]);
            histodata.push(c1 + "," + c2);
          }
          histo_data_str = histodata.join("\n");
          $("#" + target_vis_panel_id).prop("full_data", d3.csvParse(histo_data_str));
        } else if (id == 1) {
          histodata = [];
          histodata.push("c1,c2");
          for (i = 0; i < csvdata.length; i ++) {
            if (csvdata[i].career_length == "" || csvdata[i].paper_year=="" 
                || isNaN(csvdata[i].career_length) || isNaN(csvdata[i].paper_year))
              continue;
            c1 = csvdata[i][csvdata.columns[0]];
            c2 = parseInt(csvdata[i][csvdata.columns[2]]);
            histodata.push(c1 + "," + c2);
          }
          histo_data_str = histodata.join("\n");
          $("#" + target_vis_panel_id).prop("full_data", d3.csvParse(histo_data_str));
        }
      }
    });

		$.ajax({
      url: '/scythe',
      method: 'POST',
      data: {
        "example": scythe_input_string
      },
      success: function (data) {

        // the data returned from the backend
      	console.log(data);

        id = target_display_panel_id;
        id_num = target_display_panel_id.substring(target_display_panel_id.length-1);
        query_choice_id = "query-choice" + id_num;

        query_content_list = [];
        for (var i = data.length - 1; i >= 0; i --) {
          temp_tab_content = '<div id="query_inner_' + id + '_tabs_'+ (data.length - i) +'">' 
              + "<pre style=\"height:100%; overflow:auto; margin: 0 0 5px;\"><span id='synthesized_query_" 
              + id + "_" + (data.length-i) + "' class=\"inner-pre\" style=\"font-size: 12px\">" 
              + htmlForTextWithEmbeddedNewlines(data[i]) + '</span></pre></div>';
          query_content_list.push(temp_tab_content);
        }

        concat_links = "";
        for (var i = data.length - 1; i >= 0; i --) {
          temp_link = "<li><input type='radio'"
                        + "id='link_to_query_inner_" + id + "_tabs_" + (data.length - i) 
                        + "' name='link_to_query_inner_" + id + "' value='1' " 
                        + (i == data.length - 1 ? "checked=''" : "" ) + ">"
                        + "<label for='link_to_query_inner_" + id + "_tabs_" 
                        + (data.length - i) + "'> Query#" + (data.length - i) + "</label></li>";
          concat_links += temp_link;
        }

        // the default query content
        query_content = '<div class="query_output_container" id="query_inner' + id + '">'
                        + query_content_list[query_content_list.length - 1] + "</div>";

        $("#" + query_choice_id + " ul").eq(0).html(concat_links);
        $("#" + target_display_panel_id + " .display-query").html(query_content);

        for (var i = data.length - 1; i >= 0; i --) {

          link_id = "link_to_query_inner_" + id + "_tabs_" + (data.length - i);
          display_place_id = "query_inner" + id;
          target_query_content = query_content_list[i];

          $("#" + link_id).prop("query_content", target_query_content);
          $("#" + link_id).prop("display_place_id", display_place_id);

          $("#" + link_id).click(function() {
            $("#" + $(this).prop("display_place_id")).html($(this).prop("query_content"));
          });

          $("#run_synthesized_query_" + id + "_" + (data.length-i)).click(function () {
            alert($("#" + this.id.substring(this.id.indexOf('_') + 1)).text());
          });
        }

        $("#query_inner" + target_display_panel_id + " .display-query").tabs();
        // generate viz-full
      }
    });
  });
}

// serialize and deserialize a list of id
function serialize_id_list(id_list) { return id_list.join("#%#@"); }
function deserialize_id_list(id_list_string) { return id_list_string.split("#%#@"); }

function gen_adjustable_table_div(container_id, table_div_id) {

  default_content = "<tr><td>empty</td><td>empty</td><td>empty</td></tr>\
                <tr><td>empty</td><td>empty</td><td>empty</td></tr>\
                <tr><td>empty</td><td>empty</td><td>empty</td></tr>";

  // generate id's for elements in the table
  table_name_id = table_div_id + reserved_id_connector + "table_name";
  table_content_id = table_div_id + reserved_id_connector + "table";
  insert_row_btn_id = table_div_id + reserved_id_connector + "insert_row_btn";
  delete_row_btn_id = table_div_id + reserved_id_connector + "delete_row_btn";
  insert_col_btn_id = table_div_id + reserved_id_connector + "insert_col_btn";
  delete_col_btn_id = table_div_id + reserved_id_connector + "delete_col_btn";
  control_btn_id = table_div_id + reserved_id_connector + "control_btn";

	html_frame = 
		"<div id=\"" + table_div_id + "\" class=\"tbl\">\
      <table id=\"" + table_content_id + "\" class=\"hover cell-border compact dataTable no-footer\">\
        <thead><tr><td class=\"col-md-2\">c1</td>\
                   <td class=\"col-md-2\">c2</td><td class=\"col-md-2\">c3</th>\
               </tr></thead>\
        <tbody>"
        + default_content +
        "</tbody>\
      </table>\
      <div class=\"buttons\">\
        <input type=\"text\" size=\"10\" class=\"table_name\" id=\"" 
              + table_name_id + "\" value=\"tablename\">\
        <button id=\"" + insert_row_btn_id 
              + "\" class=\"btn btn-super-sm btn-default\">\
              <span class=\"glyphicon glyphicon-plus\"></span> R</button>\
        <button id=\"" + delete_row_btn_id 
              + "\" class=\"btn btn-super-sm btn-default\">\
              <span class=\"glyphicon glyphicon-minus\"></span> R</button>\
        <button id=\"" + insert_col_btn_id 
              + "\" class=\"btn btn-super-sm btn-default\">\
              <span class=\"glyphicon glyphicon-plus\"></span> C</button>\
        <button id=\"" + delete_col_btn_id 
              + "\" class=\"btn btn-super-sm btn-default\">\
              <span class=\"glyphicon glyphicon-minus\"></span> C</button>\
      </div>\
    </div>";

  $("#" + container_id).html(html_frame);
  $("#" + table_content_id).editableTableWidget();

  // add buttons to the table and bind events to them
  $('#' + insert_row_btn_id).click(function () {
    id = this.id.substring(0, this.id.indexOf(reserved_id_connector));
    table_content_id = id + reserved_id_connector + "table";

    row = "<tr>";
    for (i = 0; i < $("#" + table_content_id + " thead td").length; i ++) {
      row += "<td>" + "empty" + "</td>";
    }
    row += "</tr>";
    if ($("#" + table_content_id + ' tbody tr:last').length == 1) {
      $("#" + table_content_id + ' tbody tr:last').after(row);
    } else {
      $("#" + table_content_id + ' tbody').append(row);
    }
    $("#" + table_content_id).editableTableWidget();
  });

  $('#' + delete_row_btn_id).click(function () {
		id = this.id.substring(0, this.id.indexOf(reserved_id_connector));
    table_content_id = id + reserved_id_connector + "table";        
    $("#" + table_content_id + ' tbody tr:last').remove();
  });

  $('#' + insert_col_btn_id).click(function () {
		id = this.id.substring(0, this.id.indexOf(reserved_id_connector));
    table_content_id = id + reserved_id_connector + "table";      
    var c = $("#" + table_content_id + " tbody tr:first td").length;
    //$("#" + table_id + " tbody tr:first").append("<td>" + (c+1)+"</td>");
    $("#" + table_content_id + " thead tr").append("<td class=\"col-md-2\">c" + (c+1) + "</td>");
    $("#" + table_content_id + " tbody tr").append("<td>empty</td>");
    $("#" + table_content_id).editableTableWidget();
  });

  $('#' + delete_col_btn_id).click(function () {
		id = this.id.substring(0, this.id.indexOf(reserved_id_connector));
    table_content_id = id + reserved_id_connector + "table";      
    $("#" + table_content_id + " thead tr td:last").remove();
    $("#" + table_content_id + " tbody").find("tr").find("td:last").remove();
  });
}

function get_generated_table_content(table_div_id) {
	table_content_id = table_div_id + reserved_id_connector + "table";
	table_name_id = table_div_id + reserved_id_connector + "table_name";

	table_name = $("#" + table_name_id)[0].value;

	var ie_content = []
  var row_content = [];
  for (var j = 0; j < $("#" + table_content_id + " thead tr:eq(" + 0 + ") td").length; j ++) {
    row_content.push($("#" + table_content_id + " thead tr:eq(" + 0 + ") td:eq(" + j + ")")[0].innerText);
  }
  ie_content.push(row_content.join(","));
  for (var i = 0; i < $("#" + table_content_id + " tbody tr").length; i ++) {
    var row_content = [];
    for (var j = 0; j < $("#" + table_content_id + " tbody tr:eq(" + i + ") td").length; j ++) {
      row_content.push($("#" + table_content_id + " tbody tr:eq(" + i + ") td:eq(" + j + ")")[0].innerText);
    }
    ie_content.push(row_content.join(","));
  }
  var example_csvstr = ie_content.join("\n");

  result = {};
  result.table_name = table_name;
  result.table_content_str = example_csvstr;

  return result;
}

// the function to create visualization from data, achieved by side effect
function build_visualization(csvdata, target_div_id, vis_type) {
  // clear the diagram
  $(target_div_id).html("");
  if (vis_type == 1)
    gen_histogram(csvdata, target_div_id);
  else if (vis_type == 2)
    build_pubviz(csvdata, target_div_id);
}