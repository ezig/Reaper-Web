'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var EditableTable = function (_React$Component) {
  _inherits(EditableTable, _React$Component);

  function EditableTable(props) {
    _classCallCheck(this, EditableTable);

    var _this = _possibleConstructorReturn(this, (EditableTable.__proto__ || Object.getPrototypeOf(EditableTable)).call(this, props));

    _this.state = {};
    _this.state.table = _this.props.table;
    return _this;
  }

  _createClass(EditableTable, [{
    key: 'getCSVTable',
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
    key: 'updateTableName',
    value: function updateTableName(name) {
      this.state.table.name = name;
      this.setState(this.state.table);
    }
  }, {
    key: 'handleRowDel',
    value: function handleRowDel(rowId) {
      if (this.state.table.content.length == 1) return;
      this.state.table.content.splice(rowId, 1);
      this.setState(this.state.table);
    }
  }, {
    key: 'handleColDel',
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
    key: 'handleRowAdd',
    value: function handleRowAdd(evt) {
      var id = (+new Date() + Math.floor(Math.random() * 999999)).toString(36);
      var row = [];
      for (var i = 0; i < this.state.table.content[0].length; i++) {
        row.push(0);
      }this.state.table.content.push(row);
      this.setState(this.state.table);
    }
  }, {
    key: 'handleColAdd',
    value: function handleColAdd(evt) {
      var _this2 = this;

      var id = (+new Date() + Math.floor(Math.random() * 999999)).toString(36);
      this.state.table.header.splice(this.state.table.content[0].length, 0, "c" + this.state.table.content[0].length);
      this.state.table.content.map(function (row) {
        return row.splice(_this2.state.table.content[0].length, 0, 0);
      });
      this.setState(this.state.table);
    }
  }, {
    key: 'handleCellUpdate',
    value: function handleCellUpdate(r, c, val) {
      this.state.table.content[r][c] = val;
      this.setState(this.state.table);
    }
  }, {
    key: 'handleHeaderUpdate',
    value: function handleHeaderUpdate(r, c, val) {
      this.state.table.header.splice(c, 1, val);
      this.setState(this.state.table.header);
    }
  }, {
    key: 'render',
    value: function render() {
      var _this3 = this;

      return _react2.default.createElement(
        'div',
        { style: { border: "dashed 1px #EEE", padding: "2px 2px 2px 2px" } },
        _react2.default.createElement('input', { type: 'text', value: this.state.table.name, className: 'table_name', size: '10',
          onChange: function onChange(e) {
            _this3.updateTableName.bind(_this3)(e.target.value);
          },
          style: { width: "100%", textAlign: "center", border: "none", marginBottom: "2px" } }),
        _react2.default.createElement(
          'table',
          { className: 'table dataTable cell-border' },
          _react2.default.createElement(
            'thead',
            null,
            _react2.default.createElement(ETableRow, { onCellUpdate: this.handleHeaderUpdate.bind(this),
              data: { rowContent: this.state.table.header, rowId: "H" },
              deletable: false })
          ),
          _react2.default.createElement(
            'tbody',
            null,
            ' ',
            this.state.table.content.map(function (val, i) {
              return _react2.default.createElement(ETableRow, { onCellUpdate: _this3.handleCellUpdate.bind(_this3),
                data: { rowContent: val, rowId: i }, deletable: true, key: i,
                onDelEvent: _this3.handleRowDel.bind(_this3) });
            })
          )
        ),
        _react2.default.createElement(
          'button',
          { type: 'button', onClick: this.handleRowAdd.bind(this),
            className: 'btn btn-super-sm btn-default' },
          'Add Row'
        ),
        _react2.default.createElement(
          'button',
          { type: 'button', onClick: this.handleColAdd.bind(this),
            className: 'btn btn-super-sm btn-default' },
          'Add Col'
        ),
        _react2.default.createElement(
          'button',
          { type: 'button', onClick: this.handleColDel.bind(this),
            className: 'btn btn-super-sm btn-default' },
          'Del Col'
        )
      );
    }
  }]);

  return EditableTable;
}(_react2.default.Component);

var ETableRow = function (_React$Component2) {
  _inherits(ETableRow, _React$Component2);

  function ETableRow() {
    _classCallCheck(this, ETableRow);

    return _possibleConstructorReturn(this, (ETableRow.__proto__ || Object.getPrototypeOf(ETableRow)).apply(this, arguments));
  }

  _createClass(ETableRow, [{
    key: 'render',
    value: function render() {
      var _this5 = this;

      var delButton = null;
      if (this.props.deletable) {
        delButton = _react2.default.createElement(
          'td',
          { className: 'del-cell editable-table-cell' },
          _react2.default.createElement('input', { type: 'button', onClick: function onClick(e) {
              return _this5.props.onDelEvent(_this5.props.data.rowId);
            },
            value: 'X', className: 'btn btn-default btn-super-sm' })
        );
      } else {
        delButton = _react2.default.createElement('td', null);
      }
      return _react2.default.createElement(
        'tr',
        null,
        this.props.data.rowContent.map(function (x, i) {
          return _react2.default.createElement(ETableCell, { onCellUpdate: _this5.props.onCellUpdate.bind(_this5),
            key: _this5.props.data.rowId + "," + i,
            cellData: {
              val: x,
              rowId: _this5.props.data.rowId,
              colId: i
            } });
        }),
        delButton
      );
    }
  }]);

  return ETableRow;
}(_react2.default.Component);

var ETableCell = function (_React$Component3) {
  _inherits(ETableCell, _React$Component3);

  function ETableCell() {
    _classCallCheck(this, ETableCell);

    return _possibleConstructorReturn(this, (ETableCell.__proto__ || Object.getPrototypeOf(ETableCell)).apply(this, arguments));
  }

  _createClass(ETableCell, [{
    key: 'render',
    value: function render() {
      var _this7 = this;

      return _react2.default.createElement(
        'td',
        { className: 'editable-table-cell' },
        _react2.default.createElement('input', { type: 'text', value: this.props.cellData.val,
          onChange: function onChange(e) {
            return _this7.props.onCellUpdate(_this7.props.cellData.rowId, _this7.props.cellData.colId, e.target.value);
          },
          style: { width: "100%", textAlign: "center", border: "none" } })
      );
    }
  }]);

  return ETableCell;
}(_react2.default.Component);

exports.default = EditableTable;