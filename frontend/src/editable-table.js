import React from 'react';
import ReactDOM from 'react-dom';

class EditableTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.state.table = this.props.table;
  }
  getCSVTable() {
    var tableClone = this.state.table.content.slice();
    tableClone.splice(0, 0, this.state.table.header);
    var csvString = "";
    for (var i = 0; i < tableClone.length; i++) {
      var s = "";
      for (var j = 0; j < tableClone[i].length; j ++)
        s += tableClone[i][j] + ", ";
      csvString += s.substring(0, s.length-2) + "\n";
    }
    return {"name": this.state.table.name, "content": csvString};
  }
  updateTableName(name) {
    this.state.table.name = name;
    this.setState(this.state.table);
  }
  handleRowDel(rowId) {
    if (this.state.table.content.length == 1)
      return;
    this.state.table.content.splice(rowId, 1);
    this.setState(this.state.table);
  }
  handleColDel() {
    if (this.state.table.content[0].length == 1)
      return;
    this.state.table.content.map(row => row.splice(-1, 1));
    this.state.table.header.splice(-1, 1);
    this.setState(this.state.table.header);
    this.setState(this.state.table.content);
  }
  handleRowAdd(evt) {
    var id = (+ new Date() + Math.floor(Math.random() * 999999)).toString(36);
    var row = [];
    for (var i = 0; i < this.state.table.content[0].length; i ++)
      row.push(0);
    this.state.table.content.push(row);
    this.setState(this.state.table);
  }
  handleColAdd(evt) {
    var id = (+ new Date() + Math.floor(Math.random() * 999999)).toString(36);
    this.state.table.header.splice(this.state.table.content[0].length, 
            0, "c" + this.state.table.content[0].length);
    this.state.table.content.map(row => row.splice(this.state.table.content[0].length, 0, 0));
    this.setState(this.state.table);
  }
  handleCellUpdate(r, c, val) {
    this.state.table.content[r][c] = val;
    this.setState(this.state.table);
  }
  handleHeaderUpdate(r, c, val) {
    this.state.table.header.splice(c, 1, val);
    this.setState(this.state.table.header);
  }
  render() {
    return (
      <div style={{border: "dashed 1px #EEE", padding: "2px 2px 2px 2px"}}>
        <input type='text' value= {this.state.table.name} className="table_name" size="10"
              onChange={e => {this.updateTableName.bind(this)(e.target.value)}}
              style={{ width: "100%", textAlign: "center", border: "none", marginBottom: "2px"}} />
        <table className="table dataTable cell-border">
          <thead> 
            <ETableRow onCellUpdate={this.handleHeaderUpdate.bind(this)} 
                    data={{rowContent: this.state.table.header, rowId: "H"}}
                    deletable={false} />
          </thead>
          <tbody> {this.state.table.content.map((val, i) =>
              <ETableRow onCellUpdate={this.handleCellUpdate.bind(this)} 
                  data={{rowContent: val, rowId: i}} deletable={true} key={i} 
                  onDelEvent={this.handleRowDel.bind(this)} />)}
          </tbody>
        </table>
        <button type="button" onClick={this.handleRowAdd.bind(this)} 
              className="btn btn-super-sm btn-default">Add Row</button>
        <button type="button" onClick={this.handleColAdd.bind(this)} 
                className="btn btn-super-sm btn-default">Add Col</button>
        <button type="button" onClick={this.handleColDel.bind(this)} 
                className="btn btn-super-sm btn-default">Del Col</button>
      </div>);
  }
}

class ETableRow extends React.Component {
  render() {
    let delButton = null;
    if (this.props.deletable) {
      delButton = (<td className="del-cell editable-table-cell">
              <input type="button" onClick={e => this.props.onDelEvent(this.props.data.rowId)} 
                    value="X" className="btn btn-default btn-super-sm" />
            </td>);
    } else {
      delButton = (<td></td>);
    }
    return (
      <tr>
        {this.props.data.rowContent.map((x, i) => { 
          return <ETableCell onCellUpdate={this.props.onCellUpdate.bind(this)}
            key={this.props.data.rowId + "," + i}
            cellData={{
              val: x,
              rowId: this.props.data.rowId,
              colId: i
            }} />
        })}
        {delButton}
      </tr>
    );
  }
}

class ETableCell extends React.Component {
  render() {
    return (
      <td className="editable-table-cell"> 
        <input type='text' value= {this.props.cellData.val}
            onChange={e => this.props.onCellUpdate(this.props.cellData.rowId, 
                              this.props.cellData.colId, e.target.value)}
            style={{ width: "100%", textAlign: "center", border: "none"}} />
      </td>);
  }
}

export default EditableTable;