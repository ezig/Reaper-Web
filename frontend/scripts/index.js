"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function makeid() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 10; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }return text;
}

function tableToCSV(table) {
  var csvStr = "";
  csvStr += table["header"].join(", ") + "\n";
  for (var i = 0; i < table["content"].length; i++) {
    csvStr += table["content"][i].join(", ") + "\n";
  }
  return csvStr;
}

function csvToTable(csvStr, name) {
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

function parseScytheExample(str) {
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
        inputTables.push(csvToTable(segContent, baseTableName));
      } else if (segName.startsWith("output")) {
        outputTable = csvToTable(segContent, "output");
      }
    } else {
      i += 1;
    }
  }
  return { inputTables: inputTables, outputTable: outputTable };
}

var ScytheInterface = function (_React$Component) {
  _inherits(ScytheInterface, _React$Component);

  function ScytheInterface(props) {
    _classCallCheck(this, ScytheInterface);

    var _this = _possibleConstructorReturn(this, (ScytheInterface.__proto__ || Object.getPrototypeOf(ScytheInterface)).call(this, props));

    _this.state = {};

    //TODO: this is very badly designed, changing the format will affect the backend as well
    _this.state.dbKey = "tempDB" + new Date().toISOString() + ".db";
    _this.state.connected = false;

    // starting with empty chart because we want the database to be connected first
    _this.state.panels = [];
    _this.state.databaseList = [];

    var request = new Request('/database', { method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    // handle response from the server
    fetch(request).then(function (response) {
      return response.json();
    }).then(function (responseJson) {
      _this.state.databaseList = responseJson.databases;
      _this.setState(_this.state.databaseList);
    }).catch(function (error) {
      console.error(error);
    });

    // tables to be uploaded to the backend database
    //this.createTempDB.bind(this)();
    return _this;
  }

  _createClass(ScytheInterface, [{
    key: "addPanel",
    value: function addPanel() {
      this.state.panels.push(React.createElement(TaskPanel, { key: this.state.panels.length, dbKey: this.state.dbKey }));
      this.setState(this.state.panels);
    }
  }, {
    key: "removePanel",
    value: function removePanel() {
      if (this.state.panels.length == 0) return;
      this.state.panels.splice(-1, 1);
      this.setState(this.state.panels);
    }
  }, {
    key: "createTempDB",
    value: function createTempDB() {
      var _this2 = this;

      // make a request to the server
      var request = new Request('/create_temp_db', { method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 'db_key': this.state.dbKey })
      });
      // handle response from the server
      // return the promise
      fetch(request).then(function (response) {
        return response.json();
      }).then(function (responseJson) {
        console.log("Databased successfully created on server: " + responseJson.dbKey);
        _this2.setState({ connected: true });
      }).catch(function (error) {
        console.error(error);
      });
    }
  }, {
    key: "loadCSVAndTransfer",
    value: function loadCSVAndTransfer(evt) {
      // When the control has changed, there are new files
      if (!window.FileReader) {
        return alert('FileReader API is not supported by your browser.');
      }
      var files = evt.target.files;
      this.state.inputTables = [];
      this.setState(this.state.inputTables);
      if (files) {
        //this.state.inputTables = [];
        for (var i = 0; i < files.length; i++) {
          // bind the function to "this" to update the react state
          (function (file, t) {
            var reader = new FileReader();
            if (file.size > 5000000) {
              alert("[Error] Input example file " + file.name + "(" + file.size / 1000 + "kB) exceeds the tool size limit (5MB).");
              return;
            }
            // bind the function to "this" to update the react state
            reader.onload = function () {
              var tableName = file.name.replace(/\./g, "_");
              this.transmitDataTable.bind(this)(csvToTable(reader.result, tableName));
            }.bind(this);
            reader.readAsText(file, "UTF-8");
          }).bind(this)(files[i]);
        }
      }
    }
  }, {
    key: "updateDBKey",
    value: function updateDBKey(val, connected) {
      this.setState({ dbKey: val });
      this.setState({ connected: connected });
      console.log(val, connected);
    }
  }, {
    key: "transmitDataTable",
    value: function transmitDataTable(table) {
      var dbKey = this.state.dbKey;
      if (dbKey == null) {
        console.log("Transmission failed due to no database connection.");
        return;
      }
      var transRequest = new Request('/insert_csv_table', { method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          'table': table,
          'db_key': dbKey
        })
      });

      // handle response from the server
      fetch(transRequest).then(function (response) {
        return response.json();
      }).then(function (responseJson) {
        console.log(responseJson);
      }).catch(function (error) {
        console.error(error);
      });
    }
  }, {
    key: "render",
    value: function render() {
      var _this3 = this;

      var connectedInfo = null;
      var uploadDataBtn = null;
      if (this.state.connected) {
        connectedInfo = React.createElement(
          "label",
          { style: { float: "right", marginRight: "10px",
              fontWeight: "normal", paddingTop: "5px" } },
          "Online (Connected to ",
          this.state.dbKey,
          ")"
        );
      } else {
        connectedInfo = React.createElement(
          "label",
          { style: { float: "right", marginRight: "10px", fontWeight: "normal" } },
          "Offline Mode (No backend DB connected)"
        );
      }

      if (this.state.connected && this.state.dbKey.startsWith("tempDB")) {
        uploadDataBtn = React.createElement(
          "label",
          { className: "btn btn-primary", style: { marginLeft: "5px" } },
          " Upload Data",
          React.createElement("input", { onChange: this.loadCSVAndTransfer.bind(this), className: "fileupload",
            type: "file", style: { display: "none" }, name: "files[]", multiple: true })
        );
      }

      return React.createElement(
        "div",
        { id: "interactive-panels" },
        React.createElement(
          "div",
          { className: "btn-group" },
          React.createElement(
            "label",
            { className: "btn btn-primary", onClick: this.addPanel.bind(this) },
            React.createElement("span", { className: "glyphicon glyphicon-plus" }),
            " New Panel"
          ),
          React.createElement(
            "label",
            { className: "btn btn-primary", onClick: this.removePanel.bind(this) },
            React.createElement("span", { className: "glyphicon glyphicon-minus" }),
            " Remove Panel"
          )
        ),
        React.createElement(
          "div",
          { className: "btn-group", style: { marginLeft: "5px" } },
          React.createElement(
            "label",
            { "data-toggle": "dropdown", className: 'btn btn-primary dropdown-toggle',
              disabled: this.state.panels.length > 0 },
            React.createElement(
              "span",
              { "data-label-placement": "" },
              "Select Backend DB"
            ),
            " ",
            React.createElement("span", { className: "caret" })
          ),
          React.createElement(
            "ul",
            { className: "dropdown-menu" },
            React.createElement(
              "li",
              { onClick: function onClick(e) {
                  return _this3.updateDBKey.bind(_this3)(null, false);
                } },
              React.createElement("input", { type: "radio", name: "dbSelect-offline", value: "offline" }),
              React.createElement(
                "label",
                { htmlFor: "dbSelect-offline" },
                "Offline Mode"
              )
            ),
            React.createElement("li", { className: "divider" }),
            this.state.databaseList.map(function (d, i) {
              return React.createElement(
                "li",
                { key: i, onClick: function onClick(e) {
                    return _this3.updateDBKey.bind(_this3)(_this3.state.databaseList[i], true);
                  } },
                React.createElement("input", { type: "radio", name: "dbSelect-" + d, value: d }),
                React.createElement(
                  "label",
                  { htmlFor: "dbSelect-" + d },
                  d
                )
              );
            }),
            React.createElement("li", { className: "divider" }),
            React.createElement(
              "li",
              { onClick: this.createTempDB.bind(this) },
              React.createElement("input", { type: "radio", name: "dbSelect-new", value: "newDB" }),
              React.createElement(
                "label",
                { htmlFor: "dbSelect-new" },
                "Create New Database"
              )
            )
          )
        ),
        uploadDataBtn,
        connectedInfo,
        this.state.panels.map(function (x) {
          return [React.createElement("br", null), x];
        })
      );
    }
  }]);

  return ScytheInterface;
}(React.Component);

var TaskPanel = function (_React$Component2) {
  _inherits(TaskPanel, _React$Component2);

  function TaskPanel(props) {
    _classCallCheck(this, TaskPanel);

    var _this4 = _possibleConstructorReturn(this, (TaskPanel.__proto__ || Object.getPrototypeOf(TaskPanel)).call(this, props));

    _this4.state = {};
    _this4.state.inputTables = [];
    _this4.state.inputTables.push(_this4.genDefaultTable("input_table_0"));
    _this4.state.outputTable = _this4.genDefaultTable("output_table");
    _this4.state.constants = "";
    _this4.state.aggrFunc = "";
    _this4.state.dbKey = _this4.props.dbKey; // get DB key from the parent

    // working status of the panel
    _this4.state.callingScythe = false;
    _this4.state.callingDB = false;

    // stores json objects of form {query: XXX, data: XXX}, data field is null by default
    _this4.state.synthesisResult = [];
    _this4.state.displayOption = { type: "query", queryId: -1,
      visDataSrc: "example data", chartType: "hist" };

    // a dumb field used to identify stuff...
    _this4.state.visDivId = "vis" + makeid();
    return _this4;
  }

  _createClass(TaskPanel, [{
    key: "uploadExample",
    value: function uploadExample(evt) {
      // When the control has changed, there are new files
      if (!window.FileReader) {
        return alert('FileReader API is not supported by your browser.');
      }
      var files = evt.target.files;
      this.state.inputTables = [];
      this.setState(this.state.inputTables);
      if (files) {
        //this.state.inputTables = [];
        for (var i = 0; i < files.length; i++) {
          // bind the function to "this" to update the react state
          (function (file, t) {
            var reader = new FileReader();
            if (file.size > 50000) {
              alert("[Error] Input example file " + file.name + "(" + file.size / 1000 + "kB) exceeds the tool size limit (50kB).");
              return;
            }
            // bind the function to "this" to update the react state
            reader.onload = function () {
              if (file.name.endsWith(".csv")) {
                var table = csvToTable(reader.result, file.name.replace(/\./g, "_"));
                this.state.inputTables.push(table);
                this.setState(this.state.inputTables);
              } else if (file.name.endsWith(".scythe.txt")) {
                var examples = parseScytheExample(reader.result);
                this.state.inputTables = examples.inputTables;
                this.setState(this.state.inputTables);

                // This one is not the desired! 
                // It only updates the state in panel but will not propogate to the subelement, 
                // since the child is binded to the old value,
                // they no longer points to the same memory object
                //this.state.outputTable = examples.outputTable;
                this.state.outputTable.header = examples.outputTable.header;
                this.state.outputTable.content = examples.outputTable.content;
                this.state.outputTable.name = examples.outputTable.name;
                this.setState(this.state.outputTable);
              }
            }.bind(this);
            reader.readAsText(file, "UTF-8");
          }).bind(this)(files[i]);
        }
      }
    }
  }, {
    key: "genDefaultTable",
    value: function genDefaultTable(tableName) {
      /* generate a default 3x3 table*/

      var defaultTableRowNum = 3;
      var defaultTableColNum = 3;

      var tableHeader = [];
      var tableContent = [];
      for (var r = 0; r < defaultTableRowNum; r++) {
        var row = [];
        for (var c = 0; c < defaultTableColNum; c++) {
          row.push(0);
        }
        tableContent.push(row);
      }
      for (var c = 0; c < defaultTableColNum; c++) {
        tableHeader.push("c" + c);
      }return { name: tableName, content: tableContent, header: tableHeader };
    }
  }, {
    key: "updateDisplayOption",
    value: function updateDisplayOption(attr, val) {
      this.state.displayOption[attr] = val;
      this.setState(this.state.displayOption);
    }
    // execute the currently selected query on the database to acquire the result 

  }, {
    key: "runQueryOnDatabase",
    value: function runQueryOnDatabase() {
      var _this5 = this;

      // do nothing if connection is not established
      if (this.state.connected == false || this.state.displayOption.queryId == -1) return;

      if (this.state.synthesisResult[this.state.displayOption.queryId].data != null) return;

      this.setState({ callingDB: true });

      var query = this.state.synthesisResult[this.state.displayOption.queryId].query;
      var dbKey = this.state.dbKey;

      var req = new Request('/query_database', { method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: query,
          db_key: dbKey
        })
      });

      // handle response from the server
      fetch(req).then(function (response) {
        return response.json();
      }).then(function (responseJson) {
        console.log(responseJson);
        if (responseJson.status == "success") {
          console.log("Successfully executed query.");
          _this5.setState({ callingDB: false });
          _this5.state.synthesisResult[_this5.state.displayOption.queryId].data = responseJson.data;
          _this5.setState(_this5.state.synthesisResult);
        }
      }).catch(function (error) {
        _this5.setState({ callingDB: false });
        if (_this5.state.connected) alert("Failed to run query on the database (" + dbKey + ")");
      });
    }
  }, {
    key: "renderDropDownMenu",
    value: function renderDropDownMenu() {
      var _this6 = this;

      var options = [];
      var querySelectorName = makeid();
      var displaySelected = "Select Query";
      if (this.state.displayOption.queryId != -1) displaySelected = "Query " + (this.state.displayOption.queryId + 1);
      var disableSelect = this.state.synthesisResult.length == 0;

      // prepare options in the drop down menu
      for (var i = 0; i <= this.state.synthesisResult.length - 1; i++) {
        options.push({ value: i,
          label: 'Query ' + (i + 1),
          tempId: makeid(),
          checked: this.state.displayOption.queryId == i });
      }var visTargetChoiceName = makeid();
      var visTargetDropDown = [{ value: "example data", label: "Output Example", tempId: makeid(), disabled: false,
        checked: this.state.displayOption.visDataSrc == "example data" }, { value: "query result", label: "Query Result", tempId: makeid(),
        checked: this.state.displayOption.visDataSrc == "query result",
        disabled: disableSelect }];

      var chartTypeChoiceName = makeid();
      var chartTypeDropDown = [{ value: "hist-1", label: "Histogram (c1)", tempId: makeid(), disabled: false,
        checked: this.state.displayOption.chartType == "hist-1" }, { value: "hist-2", label: "Histogram (c2)", tempId: makeid(), disabled: false,
        checked: this.state.displayOption.chartType == "hist-2" }, { value: "hist-3", label: "Histogram (c2-c1)", tempId: makeid(), disabled: false,
        checked: this.state.displayOption.chartType == "hist-3" }, { value: "2dhist-1", label: "2D Histogram (c1,c2)", tempId: makeid(), disabled: false,
        checked: this.state.displayOption.visDataSrc == "2dhist-1" }, { value: "2dhist-2", label: "2D Histogram (c2-c1,c3-1)", tempId: makeid(), disabled: false,
        checked: this.state.displayOption.visDataSrc == "2dhist-2" }];

      // Generate the drop down menu in the enhanced drop down fashion
      // When there are multiple note that items in the list should all have the same name
      return React.createElement(
        "div",
        { className: "btn-group" },
        React.createElement(
          "div",
          { className: "btn-group" },
          React.createElement(
            "label",
            { "data-toggle": "dropdown", "data-placeholder": "false",
              className: 'btn btn-default dropdown-toggle', disabled: disableSelect },
            displaySelected + " ",
            React.createElement("span", { className: "caret" })
          ),
          React.createElement(
            "ul",
            { className: "dropdown-menu" },
            options.map(function (d, i) {
              return React.createElement(
                "li",
                { key: i },
                React.createElement("input", { type: "radio", id: d.tempId, name: querySelectorName,
                  value: i, checked: d.checked,
                  onChange: function onChange(e) {
                    return _this6.updateDisplayOption.bind(_this6)("queryId", parseInt(e.target.value));
                  } }),
                React.createElement(
                  "label",
                  { htmlFor: d.tempId },
                  d.label
                )
              );
            })
          )
        ),
        React.createElement(
          "label",
          { className: "btn btn-default query-btn", disabled: disableSelect,
            onClick: function onClick(e) {
              return _this6.updateDisplayOption.bind(_this6)("type", "query");
            } },
          "Show Query"
        ),
        React.createElement(
          "label",
          { className: "btn btn-default query-btn", disabled: disableSelect,
            onClick: function onClick(e) {
              return _this6.updateDisplayOption.bind(_this6)("type", "data");
            } },
          "Show Data"
        ),
        React.createElement(
          "label",
          { className: "btn btn-default query-btn",
            disabled: disableSelect || this.state.connected == false,
            onClick: this.runQueryOnDatabase.bind(this) },
          "Run on DB"
        ),
        React.createElement(
          "div",
          { className: "btn-group" },
          React.createElement(
            "label",
            { className: "btn btn-default query-btn",
              onClick: function onClick(e) {
                return _this6.updateDisplayOption.bind(_this6)("type", "vis");
              } },
            "Show Chart"
          ),
          React.createElement(
            "label",
            { "data-toggle": "dropdown", className: "btn btn-default dropdown-toggle",
              "data-placeholder": "false" },
            React.createElement("span", { className: "caret" })
          ),
          React.createElement(
            "ul",
            { className: "dropdown-menu bullet pull-top pull-right" },
            visTargetDropDown.map(function (d, i) {
              return React.createElement(
                "li",
                { key: i },
                React.createElement("input", { disabled: d.disabled, type: "radio", id: d.tempId,
                  name: visTargetChoiceName, value: d.value, checked: d.checked,
                  onChange: function onChange(e) {
                    return _this6.updateDisplayOption.bind(_this6)("visDataSrc", e.target.value);
                  } }),
                React.createElement(
                  "label",
                  { htmlFor: d.tempId },
                  d.label
                )
              );
            }),
            React.createElement("li", { className: "divider" }),
            chartTypeDropDown.map(function (d, i) {
              return React.createElement(
                "li",
                { key: i },
                React.createElement("input", { disabled: d.disabled, type: "radio", id: d.tempId,
                  name: chartTypeChoiceName, value: d.value, checked: d.checked,
                  onChange: function onChange(e) {
                    return _this6.updateDisplayOption.bind(_this6)("chartType", e.target.value);
                  } }),
                React.createElement(
                  "label",
                  { htmlFor: d.tempId },
                  d.label
                )
              );
            })
          )
        )
      );
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate(prevProps, prevState) {
      // hightlight code
      $('pre code').each(function (i, block) {
        hljs.highlightBlock(block);
      });

      // call jquery to generate visualization
      if (prevState.displayOption.type == "vis") {
        $("#" + prevState.visDivId).empty();
        var visData = null;
        if (prevState.visDataSrc == "example data") visData = prevState.outputTable;else if (prevState.visDataSrc == "query result") visData = prevState.synthesisResult[prevState.displayOption.queryId].data;

        if (visData != null) {
          $("#" + prevState.visDivId).empty();
          if (prevState.displayOption.chartType.startsWith("hist")) genHistogram(visData, "#" + prevState.visDivId, prevState.displayOption.chartType);else gen2DHistogram(visData, "#" + prevState.visDivId, prevState.displayOption.chartType);
        }
      }
    }
  }, {
    key: "renderDisplayPanel",
    value: function renderDisplayPanel() {
      if (this.state.displayOption.type == "query") {
        var content = null;
        if (this.state.displayOption.queryId != -1) {
          return React.createElement(
            "div",
            { className: "pnl display-query", style: { display: "block" } },
            React.createElement(
              "div",
              { className: "query_output_container" },
              React.createElement(
                "pre",
                { style: { height: "100%", overflow: "auto", margin: "0 0 5px" } },
                React.createElement(
                  "code",
                  { className: "inner-pre sql", style: { fontSize: "12px" } },
                  this.state.synthesisResult[this.state.displayOption.queryId].query
                )
              )
            )
          );
        } else {
          if (this.state.synthesisResult.length == 0) if (this.state.callingScythe == false) {
            return React.createElement(
              "div",
              { className: "pnl display-query",
                style: { display: "flex", alignItems: "center", justifyContent: "center" } },
              "No query to display yet."
            );
          } else {
            return React.createElement(
              "div",
              { className: "pnl display-query",
                style: { display: "flex", alignItems: "center", justifyContent: "center" } },
              React.createElement("img", { src: "./media/gears.gif", style: { width: "50px", height: "50px" } })
            );
          }
        }
      } else if (this.state.displayOption.type == "vis") {
        //this.state.displayOption = {type: "query", queryId: -1, visDataSrc: "example data"};
        return React.createElement("div", { id: this.state.visDivId, className: "pnl display-vis", style: { display: "block" } });
      } else if (this.state.displayOption.type == "data") {
        var _content = null;
        if (this.state.displayOption.queryId != -1 && this.state.synthesisResult[this.state.displayOption.queryId].data != null) {
          return React.createElement(
            "div",
            { className: "pnl display-query", style: { display: "block" } },
            React.createElement(
              "div",
              { className: "query_output_container" },
              React.createElement(
                "pre",
                { style: { maxHeight: "500px", overflow: "scroll", margin: "0 0 5px" } },
                React.createElement(
                  "span",
                  { className: "inner-pre", style: { fontSize: "10px" } },
                  tableToCSV(this.state.synthesisResult[this.state.displayOption.queryId].data)
                )
              )
            )
          );
        } else {
          if (this.state.callingDB) {
            return React.createElement(
              "div",
              { className: "pnl display-vis",
                style: { display: "flex", alignItems: "center", justifyContent: "center" } },
              React.createElement("img", { src: "./media/gears.gif", style: { width: "50px", height: "50px" } })
            );
          }
          return React.createElement(
            "div",
            { className: "pnl display-vis",
              style: { display: "flex", alignItems: "center", justifyContent: "center" } },
            "The data is not yet available, please run the query on database."
          );
        }
      }
    }
  }, {
    key: "updateConstants",
    value: function updateConstants(evt) {
      this.setState({ constants: evt.target.value });
    }
  }, {
    key: "updateAggrFunc",
    value: function updateAggrFunc(evt) {
      this.setState({ aggrFunc: evt.target.value });
    }
  }, {
    key: "addDefaultInputTable",
    value: function addDefaultInputTable() {
      var newId = this.state.inputTables.length;
      this.state.inputTables.push(this.genDefaultTable("input_table_" + newId));
      this.setState(this.state.inputTables);
    }
  }, {
    key: "removeLastInputTable",
    value: function removeLastInputTable() {
      this.state.inputTables.splice(-1, 1);
      this.setState(this.state.inputTables);
      if (this.state.inputTables.length == 0) this.addDefaultInputTable();
    }
  }, {
    key: "invokeScythe",
    value: function invokeScythe() {
      var _this7 = this;

      this.state.synthesisResult = [];
      this.state.displayOption.queryId = -1;
      this.setState(this.state.displayOption);
      this.setState({ callingScythe: true });
      this.setState(this.state.synthesisResult);

      //generates the input to be used by the backend synthesizer
      function tableToScytheStr(table, type) {
        var s = "#" + type + ":" + table.name + "\n\n";
        s += table.header.join(",") + "\n";
        for (var i = 0; i < table.content.length; i++) {
          s += table.content[i].join(",") + "\n";
        }s += "\n";
        return s;
      }
      var scytheInputString = "";
      for (var i = 0; i < this.state.inputTables.length; i++) {
        scytheInputString += tableToScytheStr(this.state.inputTables[i], "input");
      }
      scytheInputString += tableToScytheStr(this.state.outputTable, "output");

      // get constant and aggregation functions from the constraint panel
      var constantStr = this.state.constants;
      var aggrFuncStr = this.state.aggrFunc;

      // default aggregation functions includes only max, min, and count
      // TODO: thinking whether this can be re designed to utilize
      //   default aggregation functions in Scythe
      if (aggrFuncStr == "") aggrFuncStr = '"max", "min", "count"';

      // a special function that parses and formats the string provided by the user
      function parseFormatCommaDelimitedStr(str) {
        if (str == "") return "";
        return str.split(",").map(function (x) {
          return "\"" + x.trim().replace(/['"]+/g, '') + "\"";
        });
      }

      // the string used as the input to the synthesizer
      scytheInputString += "#constraint\n\n{\n  \"constants\": [" + parseFormatCommaDelimitedStr(constantStr) + "],\n" + "  \"aggregation_functions\": [" + parseFormatCommaDelimitedStr(aggrFuncStr) + "]\n}\n";

      console.log(scytheInputString);

      // make a request to the server
      var scytheRequest = new Request('/scythe', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ example: scytheInputString })
      });

      // handle response from the server
      fetch(scytheRequest).then(function (response) {
        return response.json();
      }).then(function (responseJson) {
        if (responseJson.status == "error") console.log(responseJson.status.message);
        for (var i in responseJson.queries) {
          _this7.state.synthesisResult.push({ "query": responseJson.queries[i], "data": null });
        }
        _this7.state.synthesisResult = _this7.state.synthesisResult.reverse();
        // automatically switching to displaying the first query synthesized
        _this7.setState({ callingScythe: false });
        _this7.state.displayOption.queryId = 0;
        _this7.setState(_this7.state.displayOption);
        _this7.setState(_this7.state.synthesisResult);
      }).catch(function (error) {
        console.error(error);
      });
    }
  }, {
    key: "render",
    value: function render() {
      {/* the id of the panel */}
      var panelId = this.props.value;
      return React.createElement(
        "table",
        { id: "panel" + panelId, className: "ipanel dash-box",
          style: { width: 100 + "%", tableLayout: "fixed", marginTop: "5px" } },
        React.createElement(
          "tbody",
          null,
          React.createElement(
            "tr",
            null,
            React.createElement(
              "td",
              { style: { width: 35 + "%", verticalAlign: "top", borderRight: 1 + "px dashed gray" } },
              React.createElement(
                "div",
                { className: "input-example", id: "input-example" + panelId },
                this.state.inputTables.map(function (t, i) {
                  return React.createElement(EditableTable, { refs: "input-table-" + i, key: i, table: t });
                })
              ),
              React.createElement(
                "div",
                null,
                React.createElement(
                  "div",
                  { className: "input-group input-group-sm input-box constant-panel" },
                  React.createElement(
                    "span",
                    { className: "input-group-addon",
                      id: 'constant-addon' + panelId },
                    "Constants"
                  ),
                  React.createElement("input", { type: "text", className: "form-control", placeholder: "None",
                    onChange: this.updateConstants.bind(this),
                    "aria-describedby": 'constant-addon' + panelId })
                ),
                React.createElement(
                  "div",
                  { className: "input-group input-group-sm input-box aggr-func-panel" },
                  React.createElement(
                    "span",
                    { className: "input-group-addon", id: 'aggr-addon' + panelId },
                    "Aggregators"
                  ),
                  React.createElement("input", { type: "text", className: "form-control", placeholder: "(Optional)",
                    onChange: this.updateAggrFunc.bind(this),
                    "aria-describedby": 'aggr-addon' + panelId })
                )
              )
            ),
            React.createElement(
              "td",
              { style: { width: 20 + "%", verticalAlign: "top" } },
              React.createElement(
                "div",
                { className: "output-example" },
                React.createElement(EditableTable, { key: "ot", refs: "output-table", table: this.state.outputTable })
              )
            ),
            React.createElement(
              "td",
              { style: { width: 43 + "%", verticalAlign: "middle" } },
              React.createElement(
                "div",
                { className: "vis" },
                this.renderDisplayPanel()
              )
            )
          ),
          React.createElement(
            "tr",
            { style: { height: 0 + "px" } },
            React.createElement(
              "td",
              { style: { borderRight: 1 + "px dashed gray" } },
              React.createElement(
                "div",
                { id: "input-panel-btns" + panelId },
                React.createElement(
                  "div",
                  { className: "buttons btn-group btn-group-justified",
                    style: { paddingLeft: 10 + "px", paddingRight: 10 + "px" } },
                  React.createElement(
                    "label",
                    { onClick: this.addDefaultInputTable.bind(this), className: "btn btn-primary",
                      style: { paddingLeft: 3 + "px", paddingRight: 3 + "px" } },
                    React.createElement("span", { className: "glyphicon glyphicon-plus" }),
                    " Add Table"
                  ),
                  React.createElement(
                    "label",
                    { onClick: this.removeLastInputTable.bind(this), className: "btn btn-primary",
                      style: { paddingLeft: 3 + "px", paddingRight: 3 + "px" } },
                    React.createElement("span", { className: "glyphicon glyphicon-minus" }),
                    " Remove Table"
                  ),
                  React.createElement(
                    "label",
                    { className: "btn btn-primary" },
                    "Load Example",
                    React.createElement("input", { onChange: this.uploadExample.bind(this), className: "fileupload",
                      type: "file", style: { display: "none" }, name: "files[]", multiple: true })
                  )
                )
              )
            ),
            React.createElement(
              "td",
              null,
              React.createElement(
                "div",
                { className: "buttons", style: { paddingLeft: "10px", paddingRight: "10px" } },
                React.createElement(
                  "button",
                  { className: "btn btn-primary btn-block",
                    onClick: this.invokeScythe.bind(this) },
                  "Synthesize"
                )
              )
            ),
            React.createElement(
              "td",
              { style: { textAlign: "center" } },
              this.renderDropDownMenu()
            )
          )
        )
      );
    }
  }]);

  return TaskPanel;
}(React.Component);

var EditableTable = function (_React$Component3) {
  _inherits(EditableTable, _React$Component3);

  function EditableTable(props) {
    _classCallCheck(this, EditableTable);

    var _this8 = _possibleConstructorReturn(this, (EditableTable.__proto__ || Object.getPrototypeOf(EditableTable)).call(this, props));

    _this8.state = {};
    _this8.state.table = _this8.props.table;
    return _this8;
  }

  _createClass(EditableTable, [{
    key: "getCSVTable",
    value: function getCSVTable() {
      var tableClone = this.state.table.content.slice();
      tableClone.splice(0, 0, this.state.table.header);
      var csvString = "";
      for (var i = 0; i < tableClone.length; i++) {
        var s = "";
        for (var j = 0; j < tableClone[i].length; j++) {
          s += tableClone[i][j] + ", ";
        }csvString += s.substring(0, s.length - 2) + "\n";
      }
      return { "name": this.state.table.name, "content": csvString };
    }
  }, {
    key: "updateTableName",
    value: function updateTableName(name) {
      this.state.table.name = name;
      this.setState(this.state.table);
    }
  }, {
    key: "handleRowDel",
    value: function handleRowDel(rowId) {
      if (this.state.table.content.length == 1) return;
      this.state.table.content.splice(rowId, 1);
      this.setState(this.state.table);
    }
  }, {
    key: "handleColDel",
    value: function handleColDel() {
      if (this.state.table.content[0].length == 1) return;
      this.state.table.content.map(function (row) {
        return row.splice(-1, 1);
      });
      this.state.table.header.splice(-1, 1);
      this.setState(this.state.table.header);
      this.setState(this.state.table.content);
    }
  }, {
    key: "handleRowAdd",
    value: function handleRowAdd(evt) {
      var id = (+new Date() + Math.floor(Math.random() * 999999)).toString(36);
      var row = [];
      for (var i = 0; i < this.state.table.content[0].length; i++) {
        row.push(0);
      }this.state.table.content.push(row);
      this.setState(this.state.table);
    }
  }, {
    key: "handleColAdd",
    value: function handleColAdd(evt) {
      var _this9 = this;

      var id = (+new Date() + Math.floor(Math.random() * 999999)).toString(36);
      this.state.table.header.splice(this.state.table.content[0].length, 0, "c" + this.state.table.content[0].length);
      this.state.table.content.map(function (row) {
        return row.splice(_this9.state.table.content[0].length, 0, 0);
      });
      this.setState(this.state.table);
    }
  }, {
    key: "handleCellUpdate",
    value: function handleCellUpdate(r, c, val) {
      this.state.table.content[r][c] = val;
      this.setState(this.state.table);
    }
  }, {
    key: "handleHeaderUpdate",
    value: function handleHeaderUpdate(r, c, val) {
      this.state.table.header.splice(c, 1, val);
      this.setState(this.state.table.header);
    }
  }, {
    key: "render",
    value: function render() {
      var _this10 = this;

      return React.createElement(
        "div",
        { style: { border: "dashed 1px #EEE", padding: "2px 2px 2px 2px" } },
        React.createElement("input", { type: "text", value: this.state.table.name, className: "table_name", size: "10",
          onChange: function onChange(e) {
            _this10.updateTableName.bind(_this10)(e.target.value);
          },
          style: { width: "100%", textAlign: "center", border: "none", marginBottom: "2px" } }),
        React.createElement(
          "table",
          { className: "table dataTable cell-border" },
          React.createElement(
            "thead",
            null,
            React.createElement(ETableRow, { onCellUpdate: this.handleHeaderUpdate.bind(this),
              data: { rowContent: this.state.table.header, rowId: "H" },
              deletable: false })
          ),
          React.createElement(
            "tbody",
            null,
            " ",
            this.state.table.content.map(function (val, i) {
              return React.createElement(ETableRow, { onCellUpdate: _this10.handleCellUpdate.bind(_this10),
                data: { rowContent: val, rowId: i }, deletable: true, key: i,
                onDelEvent: _this10.handleRowDel.bind(_this10) });
            })
          )
        ),
        React.createElement(
          "button",
          { type: "button", onClick: this.handleRowAdd.bind(this),
            className: "btn btn-super-sm btn-default" },
          "Add Row"
        ),
        React.createElement(
          "button",
          { type: "button", onClick: this.handleColAdd.bind(this),
            className: "btn btn-super-sm btn-default" },
          "Add Col"
        ),
        React.createElement(
          "button",
          { type: "button", onClick: this.handleColDel.bind(this),
            className: "btn btn-super-sm btn-default" },
          "Del Col"
        )
      );
    }
  }]);

  return EditableTable;
}(React.Component);

var ETableRow = function (_React$Component4) {
  _inherits(ETableRow, _React$Component4);

  function ETableRow() {
    _classCallCheck(this, ETableRow);

    return _possibleConstructorReturn(this, (ETableRow.__proto__ || Object.getPrototypeOf(ETableRow)).apply(this, arguments));
  }

  _createClass(ETableRow, [{
    key: "render",
    value: function render() {
      var _this12 = this;

      var delButton = null;
      if (this.props.deletable) {
        delButton = React.createElement(
          "td",
          { className: "del-cell editable-table-cell" },
          React.createElement("input", { type: "button", onClick: function onClick(e) {
              return _this12.props.onDelEvent(_this12.props.data.rowId);
            },
            value: "X", className: "btn btn-default btn-super-sm" })
        );
      } else {
        delButton = React.createElement("td", null);
      }
      return React.createElement(
        "tr",
        null,
        this.props.data.rowContent.map(function (x, i) {
          return React.createElement(ETableCell, { onCellUpdate: _this12.props.onCellUpdate.bind(_this12),
            key: _this12.props.data.rowId + "," + i,
            cellData: {
              val: x,
              rowId: _this12.props.data.rowId,
              colId: i
            } });
        }),
        delButton
      );
    }
  }]);

  return ETableRow;
}(React.Component);

var ETableCell = function (_React$Component5) {
  _inherits(ETableCell, _React$Component5);

  function ETableCell() {
    _classCallCheck(this, ETableCell);

    return _possibleConstructorReturn(this, (ETableCell.__proto__ || Object.getPrototypeOf(ETableCell)).apply(this, arguments));
  }

  _createClass(ETableCell, [{
    key: "render",
    value: function render() {
      var _this14 = this;

      return React.createElement(
        "td",
        { className: "editable-table-cell" },
        React.createElement("input", { type: "text", value: this.props.cellData.val,
          onChange: function onChange(e) {
            return _this14.props.onCellUpdate(_this14.props.cellData.rowId, _this14.props.cellData.colId, e.target.value);
          },
          style: { width: "100%", textAlign: "center", border: "none" } })
      );
    }
  }]);

  return ETableCell;
}(React.Component);

ReactDOM.render(React.createElement(ScytheInterface, null), document.getElementById('wrapper'));