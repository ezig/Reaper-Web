'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _util = require('./util.js');

var _util2 = _interopRequireDefault(_util);

var _charts = require('./charts.js');

var _charts2 = _interopRequireDefault(_charts);

var _editableTable = require('./editable-table.js');

var _editableTable2 = _interopRequireDefault(_editableTable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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
    key: 'addPanel',
    value: function addPanel() {
      this.state.panels.push(_react2.default.createElement(TaskPanel, { key: this.state.panels.length, dbKey: this.state.dbKey }));
      this.setState(this.state.panels);
    }
  }, {
    key: 'removePanel',
    value: function removePanel() {
      if (this.state.panels.length == 0) return;
      this.state.panels.splice(-1, 1);
      this.setState(this.state.panels);
    }
  }, {
    key: 'createTempDB',
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
    key: 'loadCSVAndTransfer',
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
              this.transmitDataTable.bind(this)(_util2.default.csvToTable(reader.result, tableName));
            }.bind(this);
            reader.readAsText(file, "UTF-8");
          }).bind(this)(files[i]);
        }
      }
    }
  }, {
    key: 'updateDBKey',
    value: function updateDBKey(val, connected) {
      this.setState({ dbKey: val });
      this.setState({ connected: connected });
      console.log(val, connected);
    }
  }, {
    key: 'transmitDataTable',
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
    key: 'render',
    value: function render() {
      var _this3 = this;

      var connectedInfo = null;
      var uploadDataBtn = null;
      if (this.state.connected) {
        connectedInfo = _react2.default.createElement(
          'label',
          { style: { float: "right", marginRight: "10px",
              fontWeight: "normal", paddingTop: "5px" } },
          'Online (Connected to ',
          this.state.dbKey,
          ')'
        );
      } else {
        connectedInfo = _react2.default.createElement(
          'label',
          { style: { float: "right", marginRight: "10px", fontWeight: "normal" } },
          'Offline Mode (No backend DB connected)'
        );
      }

      if (this.state.connected && this.state.dbKey.startsWith("tempDB")) {
        uploadDataBtn = _react2.default.createElement(
          'label',
          { className: 'btn btn-primary', style: { marginLeft: "5px" } },
          ' Upload Data',
          _react2.default.createElement('input', { onChange: this.loadCSVAndTransfer.bind(this), className: 'fileupload',
            type: 'file', style: { display: "none" }, name: 'files[]', multiple: true })
        );
      }

      return _react2.default.createElement(
        'div',
        { id: 'interactive-panels' },
        _react2.default.createElement(
          'div',
          { className: 'btn-group' },
          _react2.default.createElement(
            'label',
            { className: 'btn btn-primary', onClick: this.addPanel.bind(this) },
            _react2.default.createElement('span', { className: 'glyphicon glyphicon-plus' }),
            ' New Panel'
          ),
          _react2.default.createElement(
            'label',
            { className: 'btn btn-primary', onClick: this.removePanel.bind(this) },
            _react2.default.createElement('span', { className: 'glyphicon glyphicon-minus' }),
            ' Remove Panel'
          )
        ),
        _react2.default.createElement(
          'div',
          { className: 'btn-group', style: { marginLeft: "5px" } },
          _react2.default.createElement(
            'label',
            { 'data-toggle': 'dropdown', className: 'btn btn-primary dropdown-toggle',
              disabled: this.state.panels.length > 0 },
            _react2.default.createElement(
              'span',
              { 'data-label-placement': '' },
              'Select Backend DB'
            ),
            ' ',
            _react2.default.createElement('span', { className: 'caret' })
          ),
          _react2.default.createElement(
            'ul',
            { className: 'dropdown-menu' },
            _react2.default.createElement(
              'li',
              { onClick: function onClick(e) {
                  return _this3.updateDBKey.bind(_this3)(null, false);
                } },
              _react2.default.createElement('input', { type: 'radio', name: "dbSelect-offline", value: "offline" }),
              _react2.default.createElement(
                'label',
                { htmlFor: "dbSelect-offline" },
                'Offline Mode'
              )
            ),
            _react2.default.createElement('li', { className: 'divider' }),
            this.state.databaseList.map(function (d, i) {
              return _react2.default.createElement(
                'li',
                { key: i, onClick: function onClick(e) {
                    return _this3.updateDBKey.bind(_this3)(_this3.state.databaseList[i], true);
                  } },
                _react2.default.createElement('input', { type: 'radio', name: "dbSelect-" + d, value: d }),
                _react2.default.createElement(
                  'label',
                  { htmlFor: "dbSelect-" + d },
                  d
                )
              );
            }),
            _react2.default.createElement('li', { className: 'divider' }),
            _react2.default.createElement(
              'li',
              { onClick: this.createTempDB.bind(this) },
              _react2.default.createElement('input', { type: 'radio', name: "dbSelect-new", value: "newDB" }),
              _react2.default.createElement(
                'label',
                { htmlFor: "dbSelect-new" },
                'Create New Database'
              )
            )
          )
        ),
        uploadDataBtn,
        connectedInfo,
        this.state.panels.map(function (x) {
          return [_react2.default.createElement('br', null), x];
        })
      );
    }
  }]);

  return ScytheInterface;
}(_react2.default.Component);

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

    _this4.state.exampleList = [];
    var request = new Request('/examples', { method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    // handle response from the server
    fetch(request).then(function (response) {
      return response.json();
    }).then(function (responseJson) {
      _this4.state.exampleList = responseJson.examples;
      _this4.setState(_this4.state.exampleList);
    }).catch(function (error) {
      console.error(error);
    });

    // a dumb field used to identify stuff...
    _this4.state.visDivId = "vis" + _util2.default.makeid();
    return _this4;
  }

  _createClass(TaskPanel, [{
    key: 'loadExistingExample',
    value: function loadExistingExample(file) {
      var _this5 = this;

      console.log(file);

      var req = new Request('/get_example', { method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          example_name: file
        })
      });

      // handle response from the server
      fetch(req).then(function (response) {
        return response.json();
      }).then(function (responseJson) {
        if (responseJson.status == "success") {
          _this5.state.inputTables = [];
          _this5.setState(_this5.state.inputTables);
          var content = responseJson.content;
          if (file.endsWith(".csv")) {
            var table = _util2.default.csvToTable(content, file.replace(/\./g, "_"));
            _this5.state.inputTables.push(table);
            _this5.setState(_this5.state.inputTables);
          } else if (file.endsWith(".scythe.txt")) {
            var examples = _util2.default.parseScytheExample(content);
            _this5.state.inputTables = examples.inputTables;
            _this5.setState(_this5.state.inputTables);

            // This one is not the desired!
            // It only updates the state in panel but will not propogate to the subelement, 
            // since the child is binded to the old value,
            // they no longer points to the same memory object
            //this.state.outputTable = examples.outputTable;
            _this5.state.outputTable.header = examples.outputTable.header;
            _this5.state.outputTable.content = examples.outputTable.content;
            _this5.state.outputTable.name = examples.outputTable.name;
            _this5.setState(_this5.state.outputTable);
          }
        }
      }).catch(function (error) {
        if (_this5.state.connected) alert("Failed to obtain file (" + file + ") from backend.");
      });
    }
  }, {
    key: 'uploadExample',
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
                var table = _util2.default.csvToTable(reader.result, file.name.replace(/\./g, "_"));
                this.state.inputTables.push(table);
                this.setState(this.state.inputTables);
              } else if (file.name.endsWith(".scythe.txt")) {
                var examples = _util2.default.parseScytheExample(reader.result);
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
    key: 'genDefaultTable',
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
    key: 'updateDisplayOption',
    value: function updateDisplayOption(attr, val) {
      this.state.displayOption[attr] = val;
      this.setState(this.state.displayOption);
    }
    // execute the currently selected query on the database to acquire the result 

  }, {
    key: 'runQueryOnDatabase',
    value: function runQueryOnDatabase() {
      var _this6 = this;

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
          _this6.setState({ callingDB: false });
          _this6.state.synthesisResult[_this6.state.displayOption.queryId].data = responseJson.data;
          _this6.setState(_this6.state.synthesisResult);
        }
      }).catch(function (error) {
        _this6.setState({ callingDB: false });
        if (_this6.state.connected) alert("Failed to run query on the database (" + dbKey + ")");
      });
    }
  }, {
    key: 'renderDropDownMenu',
    value: function renderDropDownMenu() {
      var _this7 = this;

      var options = [];
      var querySelectorName = _util2.default.makeid();
      var displaySelected = "Select Query";
      if (this.state.displayOption.queryId != -1) displaySelected = "Query " + (this.state.displayOption.queryId + 1);
      var disableSelect = this.state.synthesisResult.length == 0;

      // prepare options in the drop down menu
      for (var i = 0; i <= this.state.synthesisResult.length - 1; i++) {
        options.push({ value: i,
          label: 'Query ' + (i + 1),
          tempId: _util2.default.makeid(),
          checked: this.state.displayOption.queryId == i });
      }var visTargetChoiceName = _util2.default.makeid();
      var visTargetDropDown = [{ value: "example data", label: "Output Example", tempId: _util2.default.makeid(), disabled: false,
        checked: this.state.displayOption.visDataSrc == "example data" }, { value: "query result", label: "Query Result", tempId: _util2.default.makeid(),
        checked: this.state.displayOption.visDataSrc == "query result",
        disabled: disableSelect }];

      // chartTypeDropDown are created from chartOptions
      var chartTypeChoiceName = _util2.default.makeid();
      var chartTypeDropDown = _charts2.default.getOptions().map(function (d) {
        var x = d;x.tempId = _util2.default.makeid();return x;
      });

      // Generate the drop down menu in the enhanced drop down fashion
      // When there are multiple note that items in the list should all have the same name
      return _react2.default.createElement(
        'div',
        { className: 'btn-group' },
        _react2.default.createElement(
          'div',
          { className: 'btn-group' },
          _react2.default.createElement(
            'label',
            { 'data-toggle': 'dropdown', 'data-placeholder': 'false',
              className: 'btn btn-default dropdown-toggle', disabled: disableSelect },
            displaySelected + " ",
            _react2.default.createElement('span', { className: 'caret' })
          ),
          _react2.default.createElement(
            'ul',
            { className: 'dropdown-menu' },
            options.map(function (d, i) {
              return _react2.default.createElement(
                'li',
                { key: i },
                _react2.default.createElement('input', { type: 'radio', id: d.tempId, name: querySelectorName,
                  value: i, checked: _this7.state.displayOption.visDataSrc == d.value,
                  onChange: function onChange(e) {
                    return _this7.updateDisplayOption.bind(_this7)("queryId", parseInt(e.target.value));
                  } }),
                _react2.default.createElement(
                  'label',
                  { htmlFor: d.tempId },
                  d.label
                )
              );
            })
          )
        ),
        _react2.default.createElement(
          'label',
          { className: "btn btn-default query-btn", disabled: disableSelect,
            onClick: function onClick(e) {
              return _this7.updateDisplayOption.bind(_this7)("type", "query");
            } },
          'Show Query'
        ),
        _react2.default.createElement(
          'label',
          { className: "btn btn-default query-btn",
            disabled: disableSelect || this.state.connected == false,
            onClick: this.runQueryOnDatabase.bind(this) },
          'Run on DB'
        ),
        _react2.default.createElement(
          'label',
          { className: "btn btn-default query-btn", disabled: disableSelect,
            onClick: function onClick(e) {
              return _this7.updateDisplayOption.bind(_this7)("type", "data");
            } },
          'Show Data'
        ),
        _react2.default.createElement(
          'div',
          { className: 'btn-group' },
          _react2.default.createElement(
            'label',
            { className: 'btn btn-default query-btn',
              onClick: function onClick(e) {
                return _this7.updateDisplayOption.bind(_this7)("type", "vis");
              } },
            'Show Chart'
          ),
          _react2.default.createElement(
            'label',
            { 'data-toggle': 'dropdown', className: 'btn btn-default dropdown-toggle',
              'data-placeholder': 'false' },
            _react2.default.createElement('span', { className: 'caret' })
          ),
          _react2.default.createElement(
            'ul',
            { className: 'dropdown-menu bullet pull-top pull-right' },
            visTargetDropDown.map(function (d, i) {
              return _react2.default.createElement(
                'li',
                { key: i },
                _react2.default.createElement('input', { disabled: d.disabled, type: 'radio', id: d.tempId,
                  name: visTargetChoiceName, value: d.value, checked: d.checked,
                  onChange: function onChange(e) {
                    return _this7.updateDisplayOption.bind(_this7)("visDataSrc", e.target.value);
                  } }),
                _react2.default.createElement(
                  'label',
                  { htmlFor: d.tempId },
                  d.label
                )
              );
            }),
            _react2.default.createElement('li', { className: 'divider' }),
            chartTypeDropDown.filter(function (d) {
              return d.filter(_this7.state.outputTable);
            }).map(function (d, i) {
              return _react2.default.createElement(
                'li',
                { key: i },
                _react2.default.createElement('input', { type: 'radio', id: d.tempId, name: chartTypeChoiceName, value: d.value,
                  checked: d.checked,
                  onChange: function onChange(e) {
                    return _this7.updateDisplayOption.bind(_this7)("chartType", e.target.value);
                  } }),
                _react2.default.createElement(
                  'label',
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
    key: 'componentDidUpdate',
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
          _charts2.default.render("#" + prevState.visDivId, visData, prevState.displayOption.chartType);
        }
      }
    }
  }, {
    key: 'renderDisplayPanel',
    value: function renderDisplayPanel() {
      if (this.state.displayOption.type == "query") {
        var content = null;
        if (this.state.displayOption.queryId != -1) {
          return _react2.default.createElement(
            'div',
            { className: 'pnl display-query', style: { display: "block" } },
            _react2.default.createElement(
              'div',
              { className: 'query_output_container' },
              _react2.default.createElement(
                'pre',
                { style: { height: "100%", overflow: "auto", margin: "0 0 5px" } },
                _react2.default.createElement(
                  'code',
                  { className: 'inner-pre sql', style: { fontSize: "12px" } },
                  this.state.synthesisResult[this.state.displayOption.queryId].query
                )
              )
            )
          );
        } else {
          if (this.state.synthesisResult.length == 0) if (this.state.callingScythe == false) {
            return _react2.default.createElement(
              'div',
              { className: 'pnl display-query',
                style: { display: "flex", alignItems: "center", justifyContent: "center" } },
              'No query to display yet.'
            );
          } else {
            return _react2.default.createElement(
              'div',
              { className: 'pnl display-query',
                style: { display: "flex", alignItems: "center", justifyContent: "center" } },
              _react2.default.createElement('img', { src: './media/gears.gif', style: { width: "50px", height: "50px" } })
            );
          }
        }
      } else if (this.state.displayOption.type == "vis") {
        //this.state.displayOption = {type: "query", queryId: -1, visDataSrc: "example data"};
        return _react2.default.createElement('div', { id: this.state.visDivId, className: 'pnl display-vis',
          style: { display: "block", margin: "10px 5px 5px 5px" } });
      } else if (this.state.displayOption.type == "data") {
        var _content = null;
        if (this.state.displayOption.queryId != -1 && this.state.synthesisResult[this.state.displayOption.queryId].data != null) {
          return _react2.default.createElement(
            'div',
            { className: 'pnl display-query', style: { display: "block" } },
            _react2.default.createElement(
              'div',
              { className: 'query_output_container' },
              _react2.default.createElement(
                'pre',
                { style: { maxHeight: "500px", overflow: "scroll", margin: "0 0 5px" } },
                _react2.default.createElement(
                  'span',
                  { className: 'inner-pre', style: { fontSize: "10px" } },
                  _util2.default.tableToCSV(this.state.synthesisResult[this.state.displayOption.queryId].data)
                )
              )
            )
          );
        } else {
          if (this.state.callingDB) {
            return _react2.default.createElement(
              'div',
              { className: 'pnl display-vis',
                style: { display: "flex", alignItems: "center", justifyContent: "center" } },
              _react2.default.createElement('img', { src: './media/gears.gif', style: { width: "50px", height: "50px" } })
            );
          }
          return _react2.default.createElement(
            'div',
            { className: 'pnl display-vis',
              style: { display: "flex", alignItems: "center", justifyContent: "center" } },
            'The data is not yet available, please run the query on database.'
          );
        }
      }
    }
  }, {
    key: 'updateConstants',
    value: function updateConstants(evt) {
      this.setState({ constants: evt.target.value });
    }
  }, {
    key: 'updateAggrFunc',
    value: function updateAggrFunc(evt) {
      this.setState({ aggrFunc: evt.target.value });
    }
  }, {
    key: 'addDefaultInputTable',
    value: function addDefaultInputTable() {
      var newId = this.state.inputTables.length;
      this.state.inputTables.push(this.genDefaultTable("input_table_" + newId));
      this.setState(this.state.inputTables);
    }
  }, {
    key: 'removeLastInputTable',
    value: function removeLastInputTable() {
      this.state.inputTables.splice(-1, 1);
      this.setState(this.state.inputTables);
      if (this.state.inputTables.length == 0) this.addDefaultInputTable();
    }
  }, {
    key: 'invokeScythe',
    value: function invokeScythe() {
      var _this8 = this;

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
          _this8.state.synthesisResult.push({ "query": responseJson.queries[i], "data": null });
        }
        _this8.state.synthesisResult = _this8.state.synthesisResult.reverse();
        // automatically switching to displaying the first query synthesized
        _this8.setState({ callingScythe: false });
        _this8.state.displayOption.queryId = 0;
        _this8.setState(_this8.state.displayOption);
        _this8.setState(_this8.state.synthesisResult);
      }).catch(function (error) {
        console.error(error);
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var _this9 = this;

      {/* the id of the panel */}
      var panelId = this.props.value;
      return _react2.default.createElement(
        'table',
        { id: "panel" + panelId, className: 'ipanel dash-box',
          style: { width: 100 + "%", tableLayout: "fixed", marginTop: "5px" } },
        _react2.default.createElement(
          'tbody',
          null,
          _react2.default.createElement(
            'tr',
            null,
            _react2.default.createElement(
              'td',
              { style: { width: 35 + "%", verticalAlign: "top", borderRight: 1 + "px dashed gray" } },
              _react2.default.createElement(
                'div',
                { className: 'input-example', id: "input-example" + panelId },
                this.state.inputTables.map(function (t, i) {
                  return _react2.default.createElement(_editableTable2.default, { refs: "input-table-" + i, key: i, table: t });
                })
              ),
              _react2.default.createElement(
                'div',
                null,
                _react2.default.createElement(
                  'div',
                  { className: 'input-group input-group-sm input-box constant-panel' },
                  _react2.default.createElement(
                    'span',
                    { className: 'input-group-addon',
                      id: 'constant-addon' + panelId },
                    'Constants'
                  ),
                  _react2.default.createElement('input', { type: 'text', className: 'form-control', placeholder: 'None',
                    onChange: this.updateConstants.bind(this),
                    'aria-describedby': 'constant-addon' + panelId })
                ),
                _react2.default.createElement(
                  'div',
                  { className: 'input-group input-group-sm input-box aggr-func-panel' },
                  _react2.default.createElement(
                    'span',
                    { className: 'input-group-addon', id: 'aggr-addon' + panelId },
                    'Aggregators'
                  ),
                  _react2.default.createElement('input', { type: 'text', className: 'form-control', placeholder: '(Optional)',
                    onChange: this.updateAggrFunc.bind(this),
                    'aria-describedby': 'aggr-addon' + panelId })
                )
              )
            ),
            _react2.default.createElement(
              'td',
              { style: { width: 20 + "%", verticalAlign: "top" } },
              _react2.default.createElement(
                'div',
                { className: 'output-example' },
                _react2.default.createElement(_editableTable2.default, { key: 'ot', refs: 'output-table', table: this.state.outputTable })
              )
            ),
            _react2.default.createElement(
              'td',
              { style: { width: 43 + "%", verticalAlign: "middle" } },
              _react2.default.createElement(
                'div',
                { className: 'vis' },
                this.renderDisplayPanel()
              )
            )
          ),
          _react2.default.createElement(
            'tr',
            { style: { height: 0 + "px" } },
            _react2.default.createElement(
              'td',
              { style: { borderRight: 1 + "px dashed gray" } },
              _react2.default.createElement(
                'div',
                { id: "input-panel-btns" + panelId, style: { marginLeft: "10px", marginRight: "10px" } },
                _react2.default.createElement(
                  'div',
                  { className: 'btn-group', style: { marginRight: "10px" } },
                  _react2.default.createElement(
                    'label',
                    { 'data-toggle': 'dropdown', className: 'btn btn-primary dropdown-toggle' },
                    _react2.default.createElement(
                      'span',
                      { 'data-label-placement': '' },
                      'Load Example'
                    ),
                    ' ',
                    _react2.default.createElement('span', { className: 'glyphicons glyphicons-chevron-right' })
                  ),
                  _react2.default.createElement(
                    'ul',
                    { className: 'dropdown-menu bullet pull-middle pull-right' },
                    _react2.default.createElement(
                      'li',
                      null,
                      _react2.default.createElement(
                        'label',
                        null,
                        'Upload Example (csv, scythe.txt)',
                        _react2.default.createElement('input', { onChange: this.uploadExample.bind(this), className: 'fileupload',
                          type: 'file', style: { display: "none" }, name: 'files[]', multiple: true })
                      )
                    ),
                    _react2.default.createElement('li', { className: 'divider' }),
                    this.state.exampleList.map(function (d, i) {
                      return _react2.default.createElement(
                        'li',
                        { key: i, onClick: function onClick(e) {
                            return _this9.loadExistingExample.bind(_this9)(d);
                          } },
                        _react2.default.createElement('input', { type: 'radio', name: "egSelect-" + d, value: d }),
                        _react2.default.createElement(
                          'label',
                          { htmlFor: "egSelect-" + d },
                          d
                        )
                      );
                    })
                  )
                ),
                _react2.default.createElement(
                  'div',
                  { className: 'btn-group',
                    style: { width: "60%", tableLayout: "fixed", borderCollapse: "separate" } },
                  _react2.default.createElement(
                    'label',
                    { onClick: this.addDefaultInputTable.bind(this), className: 'btn btn-primary',
                      style: { paddingLeft: 10 + "px", paddingRight: 10 + "px" } },
                    _react2.default.createElement('span', { className: 'glyphicon glyphicon-plus' }),
                    ' Add Table'
                  ),
                  _react2.default.createElement(
                    'label',
                    { onClick: this.removeLastInputTable.bind(this), className: 'btn btn-primary',
                      style: { paddingLeft: 10 + "px", paddingRight: 10 + "px" } },
                    _react2.default.createElement('span', { className: 'glyphicon glyphicon-minus' }),
                    ' Remove Table'
                  )
                )
              )
            ),
            _react2.default.createElement(
              'td',
              null,
              _react2.default.createElement(
                'div',
                { className: 'buttons', style: { paddingLeft: "10px", paddingRight: "10px" } },
                _react2.default.createElement(
                  'button',
                  { className: 'btn btn-primary btn-block',
                    onClick: this.invokeScythe.bind(this) },
                  'Synthesize'
                )
              )
            ),
            _react2.default.createElement(
              'td',
              { style: { textAlign: "center" } },
              this.renderDropDownMenu()
            )
          )
        )
      );
    }
  }]);

  return TaskPanel;
}(_react2.default.Component);

_reactDom2.default.render(_react2.default.createElement(ScytheInterface, null), document.getElementById('wrapper'));