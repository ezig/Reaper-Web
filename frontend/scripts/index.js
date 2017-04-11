"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ScytheInterface = function (_React$Component) {
  _inherits(ScytheInterface, _React$Component);

  function ScytheInterface() {
    _classCallCheck(this, ScytheInterface);

    return _possibleConstructorReturn(this, (ScytheInterface.__proto__ || Object.getPrototypeOf(ScytheInterface)).apply(this, arguments));
  }

  _createClass(ScytheInterface, [{
    key: "renderPanel",
    value: function renderPanel(i) {
      return React.createElement(TaskPanel, null);
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
            { id: "add_panel", className: "btn btn-success" },
            React.createElement("span", { className: "glyphicon glyphicon-plus" }),
            " New Panel"
          ),
          React.createElement(
            "button",
            { id: "remove_panel", className: "btn btn-danger" },
            React.createElement("span", { className: "glyphicon glyphicon-minus" }),
            " Remove Panel"
          )
        ),
        this.renderPanel(0)
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
    return _this2;
  }

  _createClass(TaskPanel, [{
    key: "genDefaultTable",
    value: function genDefaultTable(tableName) {

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
    key: "addInputTable",
    value: function addInputTable() {
      var newId = this.state.inputTables.length;
      this.state.inputTables.push(this.genDefaultTable("input_table_" + newId));
      this.setState(this.state.inputTables);
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
                { id: 'constraint-panel' + panelId },
                React.createElement(
                  "div",
                  { className: "input-group input-group-sm input-box constant-panel" },
                  React.createElement(
                    "span",
                    { className: "input-group-addon", id: 'basic-addon1' + panelId },
                    "Constants"
                  ),
                  React.createElement("input", { type: "text", className: "form-control", placeholder: "None",
                    "aria-describedby": 'basic-addon1' + panelId })
                ),
                React.createElement(
                  "div",
                  { className: "input-group input-group-sm input-box aggr-func-panel" },
                  React.createElement(
                    "span",
                    { className: "input-group-addon", id: "basic-addon2\" + panelId + \"" },
                    "Aggregators"
                  ),
                  React.createElement("input", { type: "text", className: "form-control", placeholder: "None",
                    "aria-describedby": 'basic-addon2' + panelId })
                )
              )
            ),
            React.createElement(
              "td",
              { style: { width: 20 + "%", verticalAlign: "top" } },
              React.createElement(
                "div",
                { className: "output-example",
                  id: "output-example" + panelId },
                React.createElement(EditableTable, { refs: "output-table", table: this.state.outputTable })
              )
            ),
            React.createElement(
              "td",
              { style: { width: 43 + "%", verticalAlign: "top" } },
              React.createElement(
                "div",
                { className: "vis", id: "display-panel" + panelId },
                React.createElement("div", { className: "pnl display-query", style: { display: "none" } }),
                React.createElement("div", { className: "pnl display-vis", style: { display: "block" } })
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
                    { id: "add_sub_input_example_btn" + panelId, onClick: this.addInputTable.bind(this),
                      className: "btn btn-primary", style: { paddingLeft: 3 + "px", paddingRight: 3 + "px" } },
                    React.createElement("span", { className: "glyphicon glyphicon-plus" }),
                    " Add Input Table"
                  ),
                  React.createElement(
                    "label",
                    { className: "btn btn-primary" },
                    "Load Data",
                    React.createElement("input", { className: "fileupload", type: "file", style: { display: "none" }, name: "files[]" })
                  )
                )
              )
            ),
            React.createElement(
              "td",
              null,
              React.createElement(
                "div",
                { id: 'synthesize-btn-container' + panelId },
                React.createElement(
                  "div",
                  { className: "buttons", style: { paddingLeft: "10px", paddingRight: "10px" } },
                  React.createElement(
                    "button",
                    { className: "btn btn-primary btn-block" },
                    "Synthesize"
                  )
                )
              )
            ),
            React.createElement(
              "td",
              { style: { textAlign: "center" } },
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

    var _this3 = _possibleConstructorReturn(this, (EditableTable.__proto__ || Object.getPrototypeOf(EditableTable)).call(this, props));

    _this3.state = {};
    _this3.state.tableName = _this3.props.table.tableName;
    _this3.state.header = _this3.props.table.tableHeader;
    _this3.state.table = _this3.props.table.tableContent;
    return _this3;
  }

  _createClass(EditableTable, [{
    key: "getCSVTable",
    value: function getCSVTable() {
      var tableClone = this.state.table.slice();
      tableClone.splice(0, 0, this.state.header);
      var csvString = "";
      for (var i = 0; i < tableClone.length; i++) {
        var s = "";
        for (var j = 0; j < tableClone[i].length; j++) {
          s += tableClone[i][j] + ", ";
        }csvString += s.substring(0, s.length - 2) + "\n";
      }
      return { "name": this.state.tableName, "content": csvString };
    }
  }, {
    key: "updateTableName",
    value: function updateTableName(name) {
      this.state.tableName = name;
      this.setState({ tableName: this.state.tableName });
    }
  }, {
    key: "handleRowDel",
    value: function handleRowDel(rowId) {
      if (this.state.table.length == 1) return;
      this.state.table.splice(rowId, 1);
      this.setState(this.state.table);
    }
  }, {
    key: "handleColDel",
    value: function handleColDel() {
      if (this.state.table[0].length == 1) return;
      this.state.table.map(function (row) {
        return row.splice(-1, 1);
      });
      this.state.header.splice(-1, 1);
      this.setState(this.state.header);
      this.setState(this.state.table);
    }
  }, {
    key: "handleRowAdd",
    value: function handleRowAdd(evt) {
      console.log(this.getCSVTable());
      var id = (+new Date() + Math.floor(Math.random() * 999999)).toString(36);
      var row = [];
      for (var i = 0; i < this.state.table[0].length; i++) {
        row.push(0);
      }this.state.table.push(row);
      this.setState(this.state.table);
    }
  }, {
    key: "handleColAdd",
    value: function handleColAdd(evt) {
      var _this4 = this;

      var id = (+new Date() + Math.floor(Math.random() * 999999)).toString(36);
      this.state.header.splice(this.state.table[0].length, 0, "c" + this.state.table[0].length);
      this.state.table.map(function (row) {
        return row.splice(_this4.state.table[0].length, 0, 0);
      });
      this.setState(this.state.header);
      this.setState(this.state.table);
    }
  }, {
    key: "handleCellUpdate",
    value: function handleCellUpdate(r, c, val) {
      var table = this.state.table.slice();
      var newTable = [];
      for (var i = 0; i < table.length; i++) {
        var newRow = [];
        for (var j = 0; j < table[i].length; j++) {
          if (i == r && j == c) newRow.push(val);else newRow.push(table[i][j]);
        }
        newTable.push(newRow);
      }
      this.setState({ table: newTable });
    }
  }, {
    key: "handleHeaderUpdate",
    value: function handleHeaderUpdate(r, c, val) {
      this.state.header.splice(c, 1, val);
      this.setState(this.state.header);
    }
  }, {
    key: "render",
    value: function render() {
      return React.createElement(
        "div",
        null,
        React.createElement(ETableBody, { onCellUpdate: this.handleCellUpdate.bind(this),
          onRowAdd: this.handleRowAdd.bind(this),
          onRowDel: this.handleRowDel.bind(this),
          onColDel: this.handleColDel.bind(this),
          onColAdd: this.handleColAdd.bind(this),
          updateTableName: this.updateTableName.bind(this),
          onHeadUpdate: this.handleHeaderUpdate.bind(this),
          table: this.state.table,
          tableName: this.state.tableName,
          header: this.state.header })
      );
    }
  }]);

  return EditableTable;
}(React.Component);

var ETableBody = function (_React$Component4) {
  _inherits(ETableBody, _React$Component4);

  function ETableBody() {
    _classCallCheck(this, ETableBody);

    return _possibleConstructorReturn(this, (ETableBody.__proto__ || Object.getPrototypeOf(ETableBody)).apply(this, arguments));
  }

  _createClass(ETableBody, [{
    key: "render",
    value: function render() {
      var _this6 = this;

      return React.createElement(
        "div",
        { style: { border: "dashed 1px #EEE", padding: "2px 2px 2px 2px" } },
        React.createElement("input", { type: "text", value: this.props.tableName, className: "table_name", size: "10",
          onChange: function onChange(e) {
            _this6.props.updateTableName(e.target.value);
          },
          style: { width: "100%", textAlign: "center", border: "none" } }),
        React.createElement(
          "table",
          { className: "table dataTable cell-border" },
          React.createElement(
            "thead",
            null,
            React.createElement(ETableRow, { onCellUpdate: this.props.onHeadUpdate,
              data: { rowContent: this.props.header, rowId: "H" },
              deletable: false })
          ),
          React.createElement(
            "tbody",
            null,
            " ",
            this.props.table.map(function (val, i) {
              return React.createElement(ETableRow, { onCellUpdate: _this6.props.onCellUpdate, data: { rowContent: val, rowId: i },
                deletable: true,
                key: i, onDelEvent: _this6.props.onRowDel });
            })
          )
        ),
        React.createElement(
          "button",
          { type: "button", onClick: this.props.onRowAdd,
            className: "btn btn-super-sm btn-default" },
          "Add Row"
        ),
        React.createElement(
          "button",
          { type: "button", onClick: this.props.onColAdd,
            className: "btn btn-super-sm btn-default" },
          "Add Col"
        ),
        React.createElement(
          "button",
          { type: "button", onClick: this.props.onColDel,
            className: "btn btn-super-sm btn-default" },
          "Del Col"
        )
      );
    }
  }]);

  return ETableBody;
}(React.Component);

var ETableRow = function (_React$Component5) {
  _inherits(ETableRow, _React$Component5);

  function ETableRow() {
    _classCallCheck(this, ETableRow);

    return _possibleConstructorReturn(this, (ETableRow.__proto__ || Object.getPrototypeOf(ETableRow)).apply(this, arguments));
  }

  _createClass(ETableRow, [{
    key: "render",
    value: function render() {
      var _this8 = this;

      var delButton = null;
      if (this.props.deletable) {
        delButton = React.createElement(
          "td",
          { className: "del-cell editable-table-cell" },
          React.createElement("input", { type: "button", onClick: function onClick(e) {
              return _this8.props.onDelEvent(_this8.props.data.rowId);
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
          return React.createElement(ETableCell, { onCellUpdate: _this8.props.onCellUpdate,
            key: _this8.props.data.rowId + "," + i,
            cellData: {
              val: x,
              rowId: _this8.props.data.rowId,
              colId: i
            } });
        }),
        delButton
      );
    }
  }]);

  return ETableRow;
}(React.Component);

var ETableCell = function (_React$Component6) {
  _inherits(ETableCell, _React$Component6);

  function ETableCell() {
    _classCallCheck(this, ETableCell);

    return _possibleConstructorReturn(this, (ETableCell.__proto__ || Object.getPrototypeOf(ETableCell)).apply(this, arguments));
  }

  _createClass(ETableCell, [{
    key: "render",
    value: function render() {
      var _this10 = this;

      return React.createElement(
        "td",
        { className: "editable-table-cell" },
        React.createElement("input", { type: "text", value: this.props.cellData.val,
          onChange: function onChange(e) {
            return _this10.props.onCellUpdate(_this10.props.cellData.rowId, _this10.props.cellData.colId, e.target.value);
          },
          style: { width: "100%", textAlign: "center", border: "none" } })
      );
    }
  }]);

  return ETableCell;
}(React.Component);

ReactDOM.render(React.createElement(ScytheInterface, null), document.getElementById('wrapper'));