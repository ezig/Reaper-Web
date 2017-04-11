class ScytheInterface extends React.Component {
  renderPanel(i) {
    return <TaskPanel />;
  }
  render() {
    return (
      <div id="interactive-panels">
        <div className="buttons">
          <button id="add_panel" className="btn btn-success">
            <span className="glyphicon glyphicon-plus"></span> New Panel</button>
          <button id="remove_panel" className="btn btn-danger">
            <span className="glyphicon glyphicon-minus"></span> Remove Panel</button>
        </div>
        {this.renderPanel(0)}
      </div>
    );
  }
}

class TaskPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.state.inputTables = [];
    this.state.inputTables.push(this.genDefaultTable("input_table_0"));
    this.state.outputTable = this.genDefaultTable("output_table");
  }
  genDefaultTable(tableName) {

    var defaultTableRowNum = 3;
    var defaultTableColNum = 3;

    var tableHeader = [];
    var tableContent = [];
    for (var r = 0; r < defaultTableRowNum; r ++) {
      var row = [];
      for (var c = 0; c < defaultTableColNum; c ++) {
        row.push(0);
      }
      tableContent.push(row);
    }
    for (var c = 0; c < defaultTableColNum; c ++)
      tableHeader.push("c" + c);

    return {tableName: tableName, tableContent: tableContent, tableHeader: tableHeader};
  }
  renderInputTables() {
    return this.state.inputTables.map( 
        (t, i) => (<EditableTable refs={"input-table-" + i} key={i} table={t} />));
  }
  addInputTable() {
    var newId = this.state.inputTables.length;
    this.state.inputTables.push(this.genDefaultTable("input_table_" + newId));
    this.setState(this.state.inputTables);
  }
  render() {
    {/* the id of the panel */}
    var panelId = this.props.value;
    return (
      <table id={"panel"  + panelId} className="ipanel dash-box" 
             style={{width: 100+ "%", tableLayout: "fixed"}}>
        <tbody>
          <tr>
            <td style={{width: 35+ "%", verticalAlign:"top", borderRight:1+"px dashed gray"}}>
              <div className="input-example" id={"input-example" + panelId}>
                {this.renderInputTables()}
              </div>
              <div id={'constraint-panel' + panelId}>
                <div className='input-group input-group-sm input-box constant-panel'>
                  <span className='input-group-addon' id={'basic-addon1' + panelId}>Constants</span>
                  <input type='text' className='form-control' placeholder='None' 
                         aria-describedby={'basic-addon1' + panelId} />
                </div>
                <div className='input-group input-group-sm input-box aggr-func-panel'>
                  <span className='input-group-addon' id='basic-addon2" + panelId + "'>Aggregators</span>
                  <input type='text' className='form-control' placeholder='None' 
                          aria-describedby={'basic-addon2' + panelId} />
                </div>
              </div>
            </td>
            <td style={{width: 20+ "%", verticalAlign:"top"}}>
              <div className="output-example" 
                   id={"output-example" + panelId}><EditableTable refs="output-table" table={this.state.outputTable} /></div>
            </td>
            <td style={{width: 43+ "%", verticalAlign:"top"}}>
              <div className="vis"  id={"display-panel" + panelId}>
                <div className="pnl display-query" style={{display:"none"}}></div>
                <div className="pnl display-vis" style={{display:"block"}}></div>
              </div>
            </td>
          </tr>
          <tr style={{height:0+"px"}}>
            <td style={{borderRight:1+"px dashed gray"}}>
              <div id={"input-panel-btns" + panelId}>
                <div className="buttons btn-group btn-group-justified" 
                     style={{paddingLeft:10 + "px", paddingRight:10 + "px"}}>
                  <label id={"add_sub_input_example_btn" + panelId} onClick={this.addInputTable.bind(this)}
                         className="btn btn-primary" style={{paddingLeft:3+"px", paddingRight:3 + "px"}}>
                    <span className="glyphicon glyphicon-plus"></span> Add Input Table
                  </label>
                  <label className="btn btn-primary">
                    Load Data
                    <input className="fileupload" type="file" style={{display: "none"}} name="files[]" />
                  </label>
                </div>
              </div>
            </td>
            <td><div id={'synthesize-btn-container' + panelId}>
                  <div className="buttons" style={{paddingLeft:"10px", paddingRight:"10px"}}>
                    <button className="btn btn-primary btn-block">Synthesize</button>
                  </div>
                </div></td>
            <td style={{textAlign:"center"}}>
              <div className="buttons btn-group" 
                   style={{margin:"0 auto", paddingLeft:10+"px", paddingRight:10+"px"}}>
                <div className='btn-group' id={"query-choice" + panelId}>
                  <label className="btn btn-default query-btn">Query</label>
                  <label data-toggle='dropdown' className='viz-query-choice btn btn-default dropdown-toggle' 
                         data-placeholder="false"><span className='caret'></span>
                  </label>
                  <ul className='dropdown-menu' ></ul>
                </div>
                {/*below is the visualization choice panel, note that items in the list should all have the same name*/}
                <div className='btn-group' id={'vis-choice' + panelId}>
                  <label className="btn btn-default vis-btn">Visualization</label>
                  <label data-toggle='dropdown' className='btn btn-default dropdown-toggle' 
                         data-placeholder="false"><span className='caret'></span></label>
                  <ul className='dropdown-menu'>
                    <li>
                      <input type='radio' id={'vis_data_' + panelId + '_1'} 
                             name={'vis_data_' + panelId} value='1' defaultChecked />
                      <label htmlFor={'vis_data_' + panelId + '_1'}>Example Output</label>
                    </li>
                    <li>
                      <input type='radio' id={'vis_data_' + panelId + '_2'} name={'vis_data_' + panelId} value='2' />
                      <label htmlFor={'vis_data_' + panelId + '_2'}>Full Output</label>
                    </li>
                    <li className='divider'></li>
                    <li>
                      <input type='radio' id={'vis_type_' + panelId + '_1'} 
                             name={'vis_type' + panelId} value='1' defaultChecked />
                      <label htmlFor={'vis_type_' + panelId + '_1'}><i className='icon-edit'></i> Histogram</label>
                    </li>
                    <li>
                      <input type='radio' id={'vis_type_' + panelId + '_2'} name={'vis_type' + panelId} value='2' />
                      <label htmlFor={'vis_type_' + panelId + '_2'}><i className='icon-remove'></i> 3D Histogram</label>
                    </li>
                  </ul>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    );
  }
}

class EditableTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.state.tableName = this.props.table.tableName;
    this.state.header = this.props.table.tableHeader;
    this.state.table = this.props.table.tableContent;
  }
  getCSVTable() {
    var tableClone = this.state.table.slice();
    tableClone.splice(0, 0, this.state.header);
    var csvString = "";
    for (var i = 0; i < tableClone.length; i++) {
      var s = "";
      for (var j = 0; j < tableClone[i].length; j ++)
        s += tableClone[i][j] + ", ";
      csvString += s.substring(0, s.length-2) + "\n";
    }
    return {"name": this.state.tableName, "content": csvString};
  }
  updateTableName(name) {
    this.state.tableName = name;
    this.setState({tableName: this.state.tableName});
  }
  handleRowDel(rowId) {
    if (this.state.table.length == 1)
      return;
    this.state.table.splice(rowId, 1);
    this.setState(this.state.table);
  }
  handleColDel() {
    if (this.state.table[0].length == 1)
      return;
    this.state.table.map(row => row.splice(-1, 1));
    this.state.header.splice(-1, 1);
    this.setState(this.state.header);
    this.setState(this.state.table);
  }
  handleRowAdd(evt) {
    console.log(this.getCSVTable());
    var id = (+ new Date() + Math.floor(Math.random() * 999999)).toString(36);
    var row = [];
    for (var i = 0; i < this.state.table[0].length; i ++)
      row.push(0);
    this.state.table.push(row);
    this.setState(this.state.table);
  }
  handleColAdd(evt) {
    var id = (+ new Date() + Math.floor(Math.random() * 999999)).toString(36);
    this.state.header.splice(this.state.table[0].length, 0, "c" + this.state.table[0].length);
    this.state.table.map(row => row.splice(this.state.table[0].length, 0, 0));
    this.setState(this.state.header);
    this.setState(this.state.table);
  }
  handleCellUpdate(r, c, val) {
    var table = this.state.table.slice();
    var newTable = []
    for (var i = 0; i < table.length; i ++) {
      var newRow = [];
      for (var j = 0; j < table[i].length; j ++) {
        if (i == r && j == c)
          newRow.push(val);
        else
          newRow.push(table[i][j]);
      }
      newTable.push(newRow);
    }
    this.setState({table: newTable});
  }
  handleHeaderUpdate(r, c, val) {
    this.state.header.splice(c, 1, val);
    this.setState(this.state.header);
  }
  render() {
    return (
      <div>
        <ETableBody onCellUpdate={this.handleCellUpdate.bind(this)} 
                      onRowAdd={this.handleRowAdd.bind(this)} 
                      onRowDel={this.handleRowDel.bind(this)}
                      onColDel={this.handleColDel.bind(this)}
                      onColAdd={this.handleColAdd.bind(this)}
                      updateTableName={this.updateTableName.bind(this)}
                      onHeadUpdate={this.handleHeaderUpdate.bind(this)} 
                      table={this.state.table}
                      tableName={this.state.tableName}
                      header={this.state.header}/>
      </div>);}
}

class ETableBody extends React.Component {
  render() {
    return (
      <div style={{border: "dashed 1px #EEE", padding: "2px 2px 2px 2px"}}>
      <input type='text' value= {this.props.tableName} className="table_name" size="10"
            onChange={e => {this.props.updateTableName(e.target.value)}}
            style={{ width: "100%", textAlign: "center", border: "none"}} />
        <table className="table dataTable cell-border">
          <thead> 
            <ETableRow onCellUpdate={this.props.onHeadUpdate} 
                    data={{rowContent: this.props.header, rowId: "H"}}
                    deletable={false} />
          </thead>
          <tbody> {this.props.table.map((val, i) =>
              (<ETableRow onCellUpdate={this.props.onCellUpdate} data={{rowContent: val, rowId: i}} 
                   deletable={true}
                  key={i} onDelEvent={this.props.onRowDel}/>))}
          </tbody>
        </table>
        <button type="button" onClick={this.props.onRowAdd} 
              className="btn btn-super-sm btn-default">Add Row</button>
        <button type="button" onClick={this.props.onColAdd} 
                className="btn btn-super-sm btn-default">Add Col</button>
        <button type="button" onClick={this.props.onColDel} 
                className="btn btn-super-sm btn-default">Del Col</button>
      </div>
    );
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
          return <ETableCell onCellUpdate={this.props.onCellUpdate}
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

ReactDOM.render(
  <ScytheInterface />,
  document.getElementById('wrapper')
);