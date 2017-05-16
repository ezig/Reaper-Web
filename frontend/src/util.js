// replacing linebreaks etc with html things
import * as d3 from "d3";

class Util {

  static htmlForTextWithEmbeddedNewlines(text) {
    String.prototype.replaceAll = function(search, replacement) {
      var target = this;
        return target.split(search).join(replacement);
    };
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

  static makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < 10; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
  }

  static tableToCSV(table) {
    var csvStr = "";
    csvStr += table["header"].join(", ") + "\n";
    for (var i = 0; i < table["content"].length; i ++) {
      csvStr += table["content"][i].join(", ") + "\n";
    }
    return csvStr;
  }

  static csvToTable(csvStr, name) {
    if (csvStr.constructor === Array)
      csvStr = csvStr.join("\r\n");
    var csvdata = d3.csvParse(csvStr);
    var header = [];
    var content = [];
    for (var i = 0; i < csvdata.columns.length; i ++) 
      header.push(csvdata.columns[i]);
    for (var i = 0; i < csvdata.length; i++) {
      var row = [];
      for (var j = 0; j < csvdata.columns.length; j ++) {
        var cell = csvdata[i][csvdata.columns[j]].trim();
        row.push(cell);
      }
      content.push(row);
    }
    return {name: name, content: content, header: header};
  }

  static tableToVegaObject(table) {
    var vegaTable = [];
    for (var i = 0; i < table.content.length; i ++) {
      var rowObject = {};
      for (var j = 0; j < table.header.length; j ++) {
        rowObject[table.header[j]] = table.content[i][j];
      }
      vegaTable.push(rowObject);
    }
    return vegaTable;
  }

  static parseScytheExample(str) {
    var content = str.split(/\r?\n/);
    var i = 0;
    var inputTables = [];
    var outputTable = null;
    var description = null;
    while (i < content.length) {
      if (content[i].startsWith("#")) {
        var segName = content[i].substring(1);
        var segContent = [];
        i += 1;
        while (i < content.length && ! content[i].startsWith("#")) {
          if (! (content[i].trim() == ""))
             segContent.push(content[i]);
          i ++;
        }
        if (segName.startsWith("input")) {
          var baseTableName = segName.substring("input".length);
          if (baseTableName == "") 
            baseTableName = "input"
          else
            baseTableName = baseTableName.substring(1);
          inputTables.push(Util.csvToTable(segContent, baseTableName));
        } else if (segName.startsWith("output")) {
          outputTable = Util.csvToTable(segContent, "output");
        } else if (segName.startsWith("description")) {
          description = segContent;
        }
      } else {
        i += 1;
      }
    }
    return {inputTables: inputTables, outputTable: outputTable, description: description};
  }
}

export default Util;