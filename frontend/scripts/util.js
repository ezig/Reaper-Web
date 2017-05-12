"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// replacing linebreaks etc with html things

var Util = function () {
  function Util() {
    _classCallCheck(this, Util);
  }

  _createClass(Util, null, [{
    key: "htmlForTextWithEmbeddedNewlines",
    value: function htmlForTextWithEmbeddedNewlines(text) {
      String.prototype.replaceAll = function (search, replacement) {
        var target = this;
        return target.split(search).join(replacement);
      };
      var htmls = [];
      var lines = text.replaceAll("\\r", "").replaceAll("\t", "    ").replaceAll(/ /g, ' ').split(/\\n/);
      // The temporary <div/> is to perform HTML entity encoding reliably.
      // Don't need jQuery but then you need to struggle with browser
      // differences in innerText/textContent yourself
      var tmpDiv = jQuery(document.createElement('div'));
      for (var i = 0; i < lines.length; i++) {
        htmls.push(tmpDiv.text(lines[i]).html());
      }
      return htmls.join("<br>");
    }
  }, {
    key: "makeid",
    value: function makeid() {
      var text = "";
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      for (var i = 0; i < 10; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }return text;
    }
  }, {
    key: "tableToCSV",
    value: function tableToCSV(table) {
      var csvStr = "";
      csvStr += table["header"].join(", ") + "\n";
      for (var i = 0; i < table["content"].length; i++) {
        csvStr += table["content"][i].join(", ") + "\n";
      }
      return csvStr;
    }
  }, {
    key: "csvToTable",
    value: function csvToTable(csvStr, name) {
      if (csvStr.constructor === Array) csvStr = csvStr.join("\r\n");
      var csvdata = d3.csvParse(csvStr);
      var header = [];
      var content = [];
      for (var i = 0; i < csvdata.columns.length; i++) {
        header.push(csvdata.columns[i]);
      }for (var i = 0; i < csvdata.length; i++) {
        var row = [];
        for (var j = 0; j < csvdata.columns.length; j++) {
          var cell = csvdata[i][csvdata.columns[j]].trim();
          row.push(cell);
        }
        content.push(row);
      }
      return { name: name, content: content, header: header };
    }
  }, {
    key: "parseScytheExample",
    value: function parseScytheExample(str) {
      var content = str.split(/\r?\n/);
      var i = 0;
      var inputTables = [];
      var outputTable = null;
      while (i < content.length) {
        if (content[i].startsWith("#")) {
          var segName = content[i].substring(1);
          var segContent = [];
          i += 1;
          while (i < content.length && !content[i].startsWith("#")) {
            if (!(content[i].trim() == "")) segContent.push(content[i]);
            i++;
          }
          if (segName.startsWith("input")) {
            var baseTableName = segName.substring("input".length);
            if (baseTableName == "") baseTableName = "input";else baseTableName = baseTableName.substring(1);
            inputTables.push(Util.csvToTable(segContent, baseTableName));
          } else if (segName.startsWith("output")) {
            outputTable = Util.csvToTable(segContent, "output");
          }
        } else {
          i += 1;
        }
      }
      return { inputTables: inputTables, outputTable: outputTable };
    }
  }]);

  return Util;
}();

exports.default = Util;