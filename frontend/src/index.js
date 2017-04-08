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
  render() {
    {/* the id of the panel */}
    var panelId = this.props.value;
    return (
      <table id={"panel"  + panelId} className="ipanel dash-box" 
             style={{width: 100+ "%", tableLayout: "fixed"}}>
        <tbody>
          <tr>
            <td style={{width: 35+ "%", verticalAlign:top, borderRight:1+"px dashed gray"}}>
              <div className="input-example" id={"input-example" + panelId}>
                <div id={"input-example" + panelId +  "sub" + 1}></div>
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
              <div className="buttons btn-group btn-group-justified" 
                   style={{paddingLeft:10 + "px", paddingRight:10 + "px"}}>
                <label id={"add_sub_input_example_btn" + panelId}
                       className="btn btn-primary" style={{paddingLeft:3+"px", paddingRight:3 + "px"}}>
                        <span className="glyphicon glyphicon-plus"></span> Add Input Table
                </label>
                <label className="btn btn-primary">
                  Load Data
                  <input className="fileupload" type="file"  
                         style={{display: "none"}} name="files[]" />
                </label>
              </div>
            </td>
            <td style={{width: 20+ "%", verticalAlign:top}}>
              <div className="output-example" 
                   id={"output-example" + panelId}><EditableTable rowNum={3} colNum={3} /></div>
              <div className="buttons" style={{paddingLeft:"10px", paddingRight:"10px"}}>
                <button className="btn btn-primary btn-block">Synthesize</button>
              </div>
            </td>
            <td style={{width: 43+ "%", verticalAlign:top}}>
              <div className="vis"  id={"display-panel" + panelId}>
                <div className="pnl display-query" style={{display:"none"}}></div>
                <div className="pnl display-vis" style={{display:"block"}}></div>
              </div>
            </td>
          </tr>
          <tr style={{height:0+"px"}}>
            <td style={{borderRight:1+"px dashed gray"}}>
              <div id={"input-panel-btns" + panelId}>
              </div>
            </td>
            <td><div id={'synthesize-btn-container' + panelId}></div></td>
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
    this.state.rowNum = this.props.rowNum;
    this.state.colNum = this.props.colNum;
    this.state.header = [];
    this.state.table = [];
    for (var r = 0; r < this.state.rowNum; r ++) {
      var row = [];
      for (var c = 0; c < this.state.colNum; c ++) {
        row.push(0);
      }
      this.state.table.push(row);
    }
    for (var c = 0; c < this.state.colNum; c ++)
      this.state.header.push("c" + c);
  }
  handleRowDel(rowId) {
    this.state.table.splice(rowId, 1);
    this.setState(this.state.table);
  };
  handleColDel(colId) {
    this.state.table.map(row => row.splice(colId, 1));
    this.setState(this.state.table);
  }
  handleAddEvent(evt) {
    var id = (+ new Date() + Math.floor(Math.random() * 999999)).toString(36);
    var row = [];
    for (var i = 0; i < this.state.colNum; i ++)
      row.push(0);
    this.state.table.push(row);
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
                      onRowAdd={this.handleAddEvent.bind(this)} 
                      onRowDel={this.handleRowDel.bind(this)} 
                      onHeadUpdate={this.handleHeaderUpdate.bind(this)} 
                      table={this.state.table}
                      header={this.state.header}/>
      </div>);}
}

class ETableBody extends React.Component {
  render() {
    var onCellUpdate = this.props.onCellUpdate;
    return (
      <div>
      <button type="button" onClick={this.props.onRowAdd} 
              className="btn btn-success btn-super-sm pull-right">Add Row</button>
      <button type="button" onClick={this.props.onColAdd} 
              className="btn btn-success btn-super-sm pull-right">Add Col</button>
        <table className="table dataTable cell-border">
          <thead> 
            <ETableRow onCellUpdate={this.props.onHeadUpdate} 
                    data={{rowContent: this.props.header, rowId: "H"}}
                    deletable={false} />
          </thead>
          <tbody> {this.props.table.map((val, i) =>
              (<ETableRow onCellUpdate={onCellUpdate} data={{rowContent: val, rowId: i}} 
                   deletable={true}
                  key={i} onDelEvent={this.props.onRowDel}/>))}
          </tbody>
        </table>
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
                    value="X" className="btn btn-secondary btn-super-sm" />
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