"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function makeid() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 5; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }return text;
}

var ScytheInterface = function (_React$Component) {
  _inherits(ScytheInterface, _React$Component);

  function ScytheInterface(props) {
    _classCallCheck(this, ScytheInterface);

    var _this = _possibleConstructorReturn(this, (ScytheInterface.__proto__ || Object.getPrototypeOf(ScytheInterface)).call(this, props));

    _this.state = {};
    _this.state.panels = [];
    _this.state.panels.push(React.createElement(TaskPanel, { key: _this.state.panels.length }));
    return _this;
  }

  _createClass(ScytheInterface, [{
    key: "addPanel",
    value: function addPanel() {
      this.state.panels.push(React.createElement(TaskPanel, { key: this.state.panels.length }));
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
    key: "render",
    value: function render() {
      return React.createElement(
        "div",
        { id: "interactive-panels" },
        React.createElement(
          "div",
          { className: "buttons" },
          React.createElement(
            "button",
            { id: "add_panel", className: "btn btn-success", onClick: this.addPanel.bind(this) },
            React.createElement("span", { className: "glyphicon glyphicon-plus" }),
            " New Panel"
          ),
          React.createElement(
            "button",
            { id: "remove_panel", className: "btn btn-danger", onClick: this.removePanel.bind(this) },
            React.createElement("span", { className: "glyphicon glyphicon-minus" }),
            " Remove Panel"
          )
        ),
        this.state.panels.map(function (x) {
          return [x, React.createElement("br", null)];
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

    var _this2 = _possibleConstructorReturn(this, (TaskPanel.__proto__ || Object.getPrototypeOf(TaskPanel)).call(this, props));

    _this2.state = {};
    _this2.state.inputTables = [];
    _this2.state.inputTables.push(_this2.genDefaultTable("input_table_0"));
    _this2.state.outputTable = _this2.genDefaultTable("output_table");
    _this2.state.constants = "";
    _this2.state.aggrFunc = "";

    // stores json objects of form {query: XXX, data: XXX}
    _this2.state.synthesisResult = [];
    _this2.state.displayOption = { type: "vis", queryId: -1 };
    return _this2;
  }

  _createClass(TaskPanel, [{
    key: "uploadInputTables",
    value: function uploadInputTables(evt) {

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
              var csvdata = d3.csvParse(reader.result);

              var header = [];
              var fileName = file.name.replace(/\./g, "_");
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
              var table = { tableName: fileName, tableContent: content, tableHeader: header };
              this.state.inputTables.push(table);
              this.setState(this.state.inputTables);
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
      }return { tableName: tableName, tableContent: tableContent, tableHeader: tableHeader };
    }
  }, {
    key: "renderInputTables",
    value: function renderInputTables() {
      return this.state.inputTables.map(function (t, i) {
        return React.createElement(EditableTable, { refs: "input-table-" + i, key: i, table: t });
      });
    }
  }, {
    key: "updateDisplayOption",
    value: function updateDisplayOption(val) {
      this.state.displayOption.queryId = val;
      this.state.displayOption.type = "query";
      this.setState(this.state.displayOption);
    }
  }, {
    key: "renderDropDownMenu",
    value: function renderDropDownMenu() {
      var _this3 = this;

      var options = [];
      var querySelectorName = makeid();
      for (var i = 0; i < this.state.synthesisResult.length; i++) {
        options.push({ value: i, label: 'Query#' + (i + 1), tempId: makeid(), checked: this.state.displayOption.queryId == i });
      }return React.createElement(
        "div",
        { className: "btn-group" },
        React.createElement(
          "label",
          { className: "btn btn-default query-btn" },
          "Query"
        ),
        React.createElement(
          "label",
          { "data-toggle": "dropdown", className: "viz-query-choice btn btn-default dropdown-toggle",
            "data-placeholder": "false" },
          React.createElement("span", { className: "caret" })
        ),
        React.createElement(
          "ul",
          { className: "dropdown-menu" },
          options.map(function (d, i) {
            return React.createElement(
              "li",
              { key: i },
              React.createElement("input", { type: "radio", onChange: function onChange(e) {
                  return _this3.updateDisplayOption.bind(_this3)(e.target.value);
                }, id: d.tempId, name: querySelectorName, value: i, checked: d.checked }),
              React.createElement(
                "label",
                { htmlFor: d.tempId },
                d.label
              )
            );
          })
        )
      );
    }
  }, {
    key: "renderDisplayPanel",
    value: function renderDisplayPanel() {
      if (this.state.displayOption.type == "query") {
        var content = null;
        if (this.state.displayOption.queryId != null) content = this.state.synthesisResult[this.state.displayOption.queryId].query;
        return React.createElement(
          "div",
          { className: "pnl display-query", style: { display: "block" } },
          React.createElement(
            "div",
            null,
            React.createElement(
              "pre",
              { style: { height: "100%", overflow: "auto", margin: "0 0 5px" } },
              React.createElement(
                "span",
                { className: "inner-pre", style: { fontSize: "12px" } },
                content
              )
            )
          )
        );
      }
      if (this.state.displayOption.type == "vis") {
        return React.createElement(
          "div",
          { className: "pnl display-vis", style: { display: "block" } },
          this.state.displayOption.content
        );
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
    key: "genScytheInputString",
    value: function genScytheInputString() {
      var _this4 = this;

      //generates the input to be used by the backend synthesizer
      function tableToScytheStr(table, type) {
        var s = "#" + type + ":" + table.tableName + "\n\n";
        s += table.tableHeader.join(",") + "\n";
        for (var i = 0; i < table.tableContent.length; i++) {
          s += table.tableContent[i].join(",") + "\n";
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
      // TODO: thinking whether this can be re designed to utilize default aggregation functions in Scythe
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
          _this4.state.synthesisResult.push({ "query": responseJson.queries[i], "data": null });
        }
        _this4.setState(_this4.state.synthesisResult);
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
          style: { width: 100 + "%", tableLayout: "fixed" } },
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
                this.renderInputTables()
              ),
              React.createElement(
                "div",
                null,
                React.createElement(
                  "div",
                  { className: "input-group input-group-sm input-box constant-panel" },
                  React.createElement(
                    "span",
                    { className: "input-group-addon", id: 'constant-addon' + panelId },
                    "Constants"
                  ),
                  React.createElement("input", { type: "text", className: "form-control", placeholder: "None",
                    onChange: this.updateConstants.bind(this), "aria-describedby": 'constant-addon' + panelId })
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
                    onChange: this.updateAggrFunc.bind(this), "aria-describedby": 'aggr-addon' + panelId })
                )
              )
            ),
            React.createElement(
              "td",
              { style: { width: 20 + "%", verticalAlign: "top" } },
              React.createElement(
                "div",
                { className: "output-example" },
                React.createElement(EditableTable, { refs: "output-table", table: this.state.outputTable })
              )
            ),
            React.createElement(
              "td",
              { style: { width: 43 + "%", verticalAlign: "top" } },
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
                    "Load Data",
                    React.createElement("input", { onChange: this.uploadInputTables.bind(this), className: "fileupload",
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
                  { className: "btn btn-primary btn-block", onClick: this.genScytheInputString.bind(this) },
                  "Synthesize"
                )
              )
            ),
            React.createElement(
              "td",
              { style: { textAlign: "center" } },
              this.renderDropDownMenu(),
              React.createElement(
                "div",
                { className: "buttons btn-group",
                  style: { margin: "0 auto", paddingLeft: 10 + "px", paddingRight: 10 + "px" } },
                React.createElement(
                  "div",
                  { className: "btn-group", id: "query-choice" + panelId },
                  React.createElement(
                    "label",
                    { className: "btn btn-default query-btn" },
                    "Query"
                  ),
                  React.createElement(
                    "label",
                    { "data-toggle": "dropdown", className: "viz-query-choice btn btn-default dropdown-toggle",
                      "data-placeholder": "false" },
                    React.createElement("span", { className: "caret" })
                  ),
                  React.createElement("ul", { className: "dropdown-menu" })
                ),
                React.createElement(
                  "div",
                  { className: "btn-group", id: 'vis-choice' + panelId },
                  React.createElement(
                    "label",
                    { className: "btn btn-default vis-btn" },
                    "Visualization"
                  ),
                  React.createElement(
                    "label",
                    { "data-toggle": "dropdown", className: "btn btn-default dropdown-toggle",
                      "data-placeholder": "false" },
                    React.createElement("span", { className: "caret" })
                  ),
                  React.createElement(
                    "ul",
                    { className: "dropdown-menu" },
                    React.createElement(
                      "li",
                      null,
                      React.createElement("input", { type: "radio", id: 'vis_data_' + panelId + '_1',
                        name: 'vis_data_' + panelId, value: "1", defaultChecked: true }),
                      React.createElement(
                        "label",
                        { htmlFor: 'vis_data_' + panelId + '_1' },
                        "Example Output"
                      )
                    ),
                    React.createElement(
                      "li",
                      null,
                      React.createElement("input", { type: "radio", id: 'vis_data_' + panelId + '_2', name: 'vis_data_' + panelId, value: "2" }),
                      React.createElement(
                        "label",
                        { htmlFor: 'vis_data_' + panelId + '_2' },
                        "Full Output"
                      )
                    ),
                    React.createElement("li", { className: "divider" }),
                    React.createElement(
                      "li",
                      null,
                      React.createElement("input", { type: "radio", id: 'vis_type_' + panelId + '_1',
                        name: 'vis_type' + panelId, value: "1", defaultChecked: true }),
                      React.createElement(
                        "label",
                        { htmlFor: 'vis_type_' + panelId + '_1' },
                        React.createElement("i", { className: "icon-edit" }),
                        " Histogram"
                      )
                    ),
                    React.createElement(
                      "li",
                      null,
                      React.createElement("input", { type: "radio", id: 'vis_type_' + panelId + '_2', name: 'vis_type' + panelId, value: "2" }),
                      React.createElement(
                        "label",
                        { htmlFor: 'vis_type_' + panelId + '_2' },
                        React.createElement("i", { className: "icon-remove" }),
                        " 3D Histogram"
                      )
                    )
                  )
                )
              )
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

    var _this5 = _possibleConstructorReturn(this, (EditableTable.__proto__ || Object.getPrototypeOf(EditableTable)).call(this, props));

    _this5.state = {};
    _this5.state.table = _this5.props.table;
    return _this5;
  }

  _createClass(EditableTable, [{
    key: "getCSVTable",
    value: function getCSVTable() {
      var tableClone = this.state.table.tableContent.slice();
      tableClone.splice(0, 0, this.state.table.tableHeader);
      var csvString = "";
      for (var i = 0; i < tableClone.length; i++) {
        var s = "";
        for (var j = 0; j < tableClone[i].length; j++) {
          s += tableClone[i][j] + ", ";
        }csvString += s.substring(0, s.length - 2) + "\n";
      }
      return { "name": this.state.table.tableName, "content": csvString };
    }
  }, {
    key: "updateTableName",
    value: function updateTableName(name) {
      this.state.table.tableName = name;
      this.setState(this.state.table);
    }
  }, {
    key: "handleRowDel",
    value: function handleRowDel(rowId) {
      if (this.state.table.tableContent.length == 1) return;
      this.state.table.tableContent.splice(rowId, 1);
      this.setState(this.state.table);
    }
  }, {
    key: "handleColDel",
    value: function handleColDel() {
      if (this.state.table.tableContent[0].length == 1) return;
      this.state.table.tableContent.map(function (row) {
        return row.splice(-1, 1);
      });
      this.state.table.tableHeader.splice(-1, 1);
      this.setState(this.state.table.tableHeader);
      this.setState(this.state.table.tableContent);
    }
  }, {
    key: "handleRowAdd",
    value: function handleRowAdd(evt) {
      console.log(this.getCSVTable());
      var id = (+new Date() + Math.floor(Math.random() * 999999)).toString(36);
      var row = [];
      for (var i = 0; i < this.state.table.tableContent[0].length; i++) {
        row.push(0);
      }this.state.table.tableContent.push(row);
      this.setState(this.state.table);
    }
  }, {
    key: "handleColAdd",
    value: function handleColAdd(evt) {
      var _this6 = this;

      var id = (+new Date() + Math.floor(Math.random() * 999999)).toString(36);
      this.state.table.tableHeader.splice(this.state.table.tableContent[0].length, 0, "c" + this.state.table.tableContent[0].length);
      this.state.table.tableContent.map(function (row) {
        return row.splice(_this6.state.table.tableContent[0].length, 0, 0);
      });
      this.setState(this.state.table);
    }
  }, {
    key: "handleCellUpdate",
    value: function handleCellUpdate(r, c, val) {
      this.state.table.tableContent[r][c] = val;
      this.setState(this.state.table);
    }
  }, {
    key: "handleHeaderUpdate",
    value: function handleHeaderUpdate(r, c, val) {
      this.state.table.tableHeader.splice(c, 1, val);
      this.setState(this.state.table.tableHeader);
    }
  }, {
    key: "render",
    value: function render() {
      var _this7 = this;

      return React.createElement(
        "div",
        { style: { border: "dashed 1px #EEE", padding: "2px 2px 2px 2px" } },
        React.createElement("input", { type: "text", value: this.state.table.tableName, className: "table_name", size: "10",
          onChange: function onChange(e) {
            _this7.updateTableName.bind(_this7)(e.target.value);
          },
          style: { width: "100%", textAlign: "center", border: "none", marginBottom: "2px" } }),
        React.createElement(
          "table",
          { className: "table dataTable cell-border" },
          React.createElement(
            "thead",
            null,
            React.createElement(ETableRow, { onCellUpdate: this.handleHeaderUpdate.bind(this),
              data: { rowContent: this.state.table.tableHeader, rowId: "H" },
              deletable: false })
          ),
          React.createElement(
            "tbody",
            null,
            " ",
            this.state.table.tableContent.map(function (val, i) {
              return React.createElement(ETableRow, { onCellUpdate: _this7.handleCellUpdate.bind(_this7), data: { rowContent: val, rowId: i },
                deletable: true, key: i, onDelEvent: _this7.handleRowDel.bind(_this7) });
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
      var _this9 = this;

      var delButton = null;
      if (this.props.deletable) {
        delButton = React.createElement(
          "td",
          { className: "del-cell editable-table-cell" },
          React.createElement("input", { type: "button", onClick: function onClick(e) {
              return _this9.props.onDelEvent(_this9.props.data.rowId);
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
          return React.createElement(ETableCell, { onCellUpdate: _this9.props.onCellUpdate.bind(_this9),
            key: _this9.props.data.rowId + "," + i,
            cellData: {
              val: x,
              rowId: _this9.props.data.rowId,
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
      var _this11 = this;

      return React.createElement(
        "td",
        { className: "editable-table-cell" },
        React.createElement("input", { type: "text", value: this.props.cellData.val,
          onChange: function onChange(e) {
            return _this11.props.onCellUpdate(_this11.props.cellData.rowId, _this11.props.cellData.colId, e.target.value);
          },
          style: { width: "100%", textAlign: "center", border: "none" } })
      );
    }
  }]);

  return ETableCell;
}(React.Component);

ReactDOM.render(React.createElement(ScytheInterface, null), document.getElementById('wrapper'));