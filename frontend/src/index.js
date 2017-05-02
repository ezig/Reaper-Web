function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < 10; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

class ScytheInterface extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    //TODO: this is very badly designed, changing the format will affect the backend as well
    this.state.dbKey = "tempDB" + new Date().toISOString() + ".db";

    this.state.panels = [];
    this.state.panels.push(<TaskPanel key={this.state.panels.length}  dbKey={this.state.dbKey}/>);

    // tables to be uploaded to the backend database
    this.state.tableQueue = [];
    this.createTempDB.bind(this)();
  }
  addPanel() {
    this.state.panels.push(<TaskPanel key={this.state.panels.length} dbKey={this.state.dbKey} />);
    this.setState(this.state.panels);
  }
  removePanel() {
    if (this.state.panels.length == 0) 
      return;
    this.state.panels.splice(-1, 1);
    this.setState(this.state.panels);
  }
  createTempDB() {
    // make a request to the server
    var request = new Request('/create_temp_db', 
      { method: 'POST', 
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({'db_key': this.state.dbKey })
      });
    // handle response from the server
    // return the promise
    fetch(request)
    .then((response) => response.json())
    .then((responseJson) => {
      console.log("Databased successfully created on server: " + responseJson.dbKey);
      for (var t in this.state.tableQueue) {
        this.transmitDataTable.bind(this)(t);
      }
      this.state.tableQueue = [];
      this.setState(this.state.tableQueue);
    })
    .catch((error) => {
      console.error(error);
    });
  }
  loadCSVAndTransfer(evt) {
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
            alert("[Error] Input example file " + file.name 
              + "(" + (file.size / 1000) + "kB) exceeds the tool size limit (5MB).");
            return;
          }
          // bind the function to "this" to update the react state
          reader.onload = function () {
            var csvdata = d3.csvParse(reader.result);
            var table = {name: file.name.replace(/\./g,"_"), content: [], header: []};
            for (var i = 0; i < csvdata.columns.length; i ++) 
              table.header.push(csvdata.columns[i]);
            for (var i = 0; i < csvdata.length; i++) {
              var row = [];
              for (var j = 0; j < csvdata.columns.length; j ++) {
                var cell = csvdata[i][csvdata.columns[j]].trim();
                row.push(cell);
              }
              table.content.push(row);
            }
            this.transmitDataTable.bind(this)(table);
          }.bind(this);
          reader.readAsText(file, "UTF-8");
        }).bind(this)(files[i]);
      }
    }
  }
  transmitDataTable(table) {
    var dbKey = this.state.dbKey;
    if (dbKey == null) { 
      this.state.tableQueue.push(table);
      return;
    }
    var transRequest = new Request('/insert_csv_table', 
    { method: 'POST', 
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        'table': table,
        'db_key': dbKey
      })
    });

    // handle response from the server
    fetch(transRequest)
      .then((response) => response.json())
      .then((responseJson) => { console.log(responseJson); })
      .catch((error) => { console.error(error); });
  }
  render() {
    return (
      <div id="interactive-panels">
        <div className="buttons btn-group">
          <label className="btn btn-primary" onClick={this.addPanel.bind(this)}>
            <span className="glyphicon glyphicon-plus" /> New Panel</label>
          <label className="btn btn-primary" onClick={this.removePanel.bind(this)}>
            <span className="glyphicon glyphicon-minus" /> Remove Panel</label>
          <label className="btn btn-primary">
            Upload Data
            <input onChange={this.loadCSVAndTransfer.bind(this)} className="fileupload" 
                   type="file" style={{display: "none"}} name="files[]" multiple />
          </label>
        </div>
        { this.state.panels.map(x => {return [x, <br />]}) }
      </div>);
  }
}

class TaskPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.state.inputTables = [];
    this.state.inputTables.push(this.genDefaultTable("input_table_0"));
    this.state.outputTable = this.genDefaultTable("output_table");
    this.state.constants = "";
    this.state.aggrFunc = "";
    this.state.dbKey = this.props.dbKey; // get DB key from the parent

    // stores json objects of form {query: XXX, data: XXX}
    this.state.synthesisResult = [];
    this.state.displayOption = {type: "query", queryId: -1, visDataSrc: "example data"};
  }
  uploadInputTables(evt) {

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
            alert("[Error] Input example file " + file.name 
                + "(" + (file.size / 1000) + "kB) exceeds the tool size limit (50kB).");
            return;
          }

          // bind the function to "this" to update the react state
          reader.onload = function () {
            var csvdata = d3.csvParse(reader.result);

            var header = [];
            var fileName = file.name.replace(/\./g,"_");
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
            var table = {tableName: fileName, tableContent: content, tableHeader: header};
            this.state.inputTables.push(table);
            this.setState(this.state.inputTables);
          }.bind(this);
          reader.readAsText(file, "UTF-8");
        }).bind(this)(files[i]);
      }
    }
  }
  genDefaultTable(tableName) {
    /* generate a default 3x3 table*/

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
  updateDisplayOption(attr, val) {
    this.state.displayOption[attr] = val;
    this.setState(this.state.displayOption);
  }
  // execute the currently selected query on the database to acquire the result 
  runQueryOnDatabase() {

    console.log(this.state);

    if (this.state.synthesisResult[this.state.displayOption.queryId].data != null)
      return;

    var query = this.state.synthesisResult[this.state.displayOption.queryId].query;
    var dbKey = this.state.dbKey;

    var req = new Request('/query_temp_db', 
    { method: 'POST', 
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: query,
        db_key: dbKey,
      })
    });

    // handle response from the server
    fetch(req)
      .then((response) => response.json())
      .then((responseJson) => { 
        console.log(responseJson);
        if (responseJson.status == "success") {
          console.log("Successfully executed query.");
          this.state.synthesisResult[this.state.displayOption.queryId].data = responseJson.data;
          this.setState(this.state.synthesisResult);
        }
      })
      .catch((error) => { console.error(error); });
  }
  renderDropDownMenu() {
    var options = [];
    var querySelectorName = makeid();
    var displaySelected = "Select One";
    if (this.state.displayOption.queryId != -1)
      displaySelected = "Query " + (this.state.displayOption.queryId + 1);
    var disableSelect = (this.state.synthesisResult.length == 0);
    
    // prepare options in the drop down menu
    for (var i = 0 ; i < this.state.synthesisResult.length; i ++)
      options.push({value: i, 
                    label: 'Query ' + (i + 1), 
                    tempId: makeid(), 
                    checked: (this.state.displayOption.queryId == i)});
    
    var visTypeChoiceName = makeid();
    var visTypeDropDown = [{value: "example data", label: "Output Example", tempId: makeid(), disabled: false,
                            checked: (this.state.displayOption.visDataSrc == "example data")},
                          {value: "query result", label: "Query Result", tempId: makeid(), 
                           checked: (this.state.displayOption.visDataSrc == "query result"), 
                           disabled: disableSelect}];

    // Generate the drop down menu in the enhanced drop down fashion
    // When there are multiple note that items in the list should all have the same name
    return <div className='btn-group'>
            <div className='btn-group'>
              <label data-toggle='dropdown' data-placeholder="false"
                     className={'btn btn-default dropdown-toggle ' + (disableSelect ? "disabled" : "")}>
                {displaySelected + " "}
                <span className='caret'></span>
              </label>
              <ul className='dropdown-menu'>
                {options.map((d, i) =>
                  <li key={i}>
                    <input type='radio' id={d.tempId} name={querySelectorName} value={i} checked={d.checked}
                    onChange={e => this.updateDisplayOption.bind(this)("queryId", parseInt(e.target.value))} />
                    <label htmlFor={d.tempId}>{d.label}</label>
                  </li>)}
              </ul>
            </div>
            <label className={"btn btn-default query-btn " + (disableSelect ? "disabled" : "")}
                   onClick={e => this.updateDisplayOption.bind(this)("type", "query")}>
              Show Query
            </label>
            <label className={"btn btn-default query-btn " + (disableSelect ? "disabled" : "")}
                   onClick={this.runQueryOnDatabase.bind(this)}>
              Run on DB
            </label>
            <div className='btn-group'>
              <label className="btn btn-default query-btn"
                     onClick={e => this.updateDisplayOption.bind(this)("type", "vis")}>
                Show Chart
              </label>
              <label data-toggle='dropdown' className='btn btn-default dropdown-toggle'
                     data-placeholder="false">
                <span className='caret'></span>
              </label>
              <ul className='dropdown-menu'>
                {visTypeDropDown.map((d, i) =>
                  <li key={i}>
                    <input disabled={d.disabled} type='radio' id={d.tempId} name={visTypeChoiceName} 
                      value={d.value} checked={d.checked}
                      onChange={e => this.updateDisplayOption.bind(this)("visDataSrc", e.target.value)}/>
                    <label htmlFor={d.tempId}>{d.label}</label>
                  </li>)}
              </ul>
            </div>
          </div>;
  }
  renderDisplayPanel() {
    if (this.state.displayOption.type == "query") {
      let content = null;
      if (this.state.displayOption.queryId != -1) {
        return <div className="pnl display-query" style={{display:"block"}}>
                <div className="query_output_container">
                  <pre style={{height:"100%", overflow:"auto", margin: "0 0 5px"}}>
                  <span className="inner-pre" style={{fontSize: "12px"}}>
                    {this.state.synthesisResult[this.state.displayOption.queryId].query}
                  </span>
                </pre></div>
               </div>;
      } else {
        if (this.state.synthesisResult.length == 0)
          return <div className="pnl display-query" style={{display:"block"}}>
                    Query not yet available.
                  </div>;
        else
          return <div className="pnl display-query" style={{display:"block"}}>
                  Query synthesized, select a result to display.
                  </div>;
      }
    }
    if (this.state.displayOption.type == "vis") {
      return <div className="pnl display-vis" style={{display:"block"}}>
                {this.state.displayOption.content}
              </div>;
    }
  }
  updateConstants(evt) {
    this.setState({constants: evt.target.value});
  }
  updateAggrFunc(evt) {
    this.setState({aggrFunc: evt.target.value});
  }
  addDefaultInputTable() {
    var newId = this.state.inputTables.length;
    this.state.inputTables.push(this.genDefaultTable("input_table_" + newId));
    this.setState(this.state.inputTables);
  }
  removeLastInputTable() {
    this.state.inputTables.splice(-1, 1);
    this.setState(this.state.inputTables);
    if (this.state.inputTables.length == 0)
      this.addDefaultInputTable();
  }
  invokeScythe() {
    //generates the input to be used by the backend synthesizer
    function tableToScytheStr(table, type) {
      var s = "#" + type + ":" + table.tableName + "\n\n";
      s += table.tableHeader.join(",") + "\n";
      for (var i = 0; i < table.tableContent.length; i ++)
        s += table.tableContent[i].join(",") + "\n";
      s += "\n";
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
    scytheInputString += "#constraint\n\n{\n  \"constants\": [" 
                          + parseFormatCommaDelimitedStr(constantStr) + "],\n" 
                          + "  \"aggregation_functions\": [" 
                          + parseFormatCommaDelimitedStr(aggrFuncStr) + "]\n}\n";

    console.log(scytheInputString);

    // make a request to the server
    var scytheRequest = new Request('/scythe', 
      { 
        method: 'POST', 
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ example: scytheInputString})
      });

    // handle response from the server
    fetch(scytheRequest)
    .then((response) => response.json())
    .then((responseJson) => {
      if (responseJson.status == "error")
        console.log(responseJson.status.message);
      this.state.synthesisResult = [];
      for (var i in responseJson.queries) {
        this.state.synthesisResult.push({"query": responseJson.queries[i], "data": null});
      }
      this.setState(this.state.synthesisResult);
    })
    .catch((error) => {
      console.error(error);
    });
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
              <div>
                <div className='input-group input-group-sm input-box constant-panel'>
                  <span className='input-group-addon' id={'constant-addon' + panelId}>Constants</span>
                  <input type='text' className='form-control' placeholder='None' 
                         onChange={this.updateConstants.bind(this)} 
                         aria-describedby={'constant-addon' + panelId} />
                </div>
                <div className='input-group input-group-sm input-box aggr-func-panel'>
                  <span className='input-group-addon' id={'aggr-addon' + panelId}>Aggregators</span>
                  <input type='text' className='form-control' placeholder='(Optional)' 
                          onChange={this.updateAggrFunc.bind(this)} 
                          aria-describedby={'aggr-addon' + panelId} />
                </div>
              </div>
            </td>
            <td style={{width: 20+ "%", verticalAlign:"top"}}>
              <div className="output-example">
                <EditableTable refs="output-table" table={this.state.outputTable} />
              </div>
            </td>
            <td style={{width: 43+ "%", verticalAlign:"top"}}>
              <div className="vis">
                {this.renderDisplayPanel()}
              </div>
            </td>
          </tr>
          <tr style={{height:0+"px"}}>
            <td style={{borderRight:1+"px dashed gray"}}>
              <div id={"input-panel-btns" + panelId}>
                <div className="buttons btn-group btn-group-justified" 
                     style={{paddingLeft:10 + "px", paddingRight:10 + "px"}}>
                  <label onClick={this.addDefaultInputTable.bind(this)} className="btn btn-primary" 
                         style={{paddingLeft:3+"px", paddingRight:3 + "px"}}>
                    <span className="glyphicon glyphicon-plus" /> Add Table
                  </label>
                  <label onClick={this.removeLastInputTable.bind(this)} className="btn btn-primary" 
                         style={{paddingLeft:3+"px", paddingRight:3 + "px"}}>
                    <span className="glyphicon glyphicon-minus" /> Remove Table
                  </label>
                  <label className="btn btn-primary">
                    Load Example
                    <input onChange={this.uploadInputTables.bind(this)} className="fileupload" 
                           type="file" style={{display: "none"}} name="files[]" multiple />
                  </label>
                </div>
              </div>
            </td>
            <td>
              <div className="buttons" style={{paddingLeft:"10px", paddingRight:"10px"}}>
                <button className="btn btn-primary btn-block" 
                        onClick={this.invokeScythe.bind(this)}>Synthesize</button>
              </div>
            </td>
            <td style={{textAlign:"center"}}>
              {this.renderDropDownMenu()}
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
    this.state.table = this.props.table;
  }
  getCSVTable() {
    var tableClone = this.state.table.tableContent.slice();
    tableClone.splice(0, 0, this.state.table.tableHeader);
    var csvString = "";
    for (var i = 0; i < tableClone.length; i++) {
      var s = "";
      for (var j = 0; j < tableClone[i].length; j ++)
        s += tableClone[i][j] + ", ";
      csvString += s.substring(0, s.length-2) + "\n";
    }
    return {"name": this.state.table.tableName, "content": csvString};
  }
  updateTableName(name) {
    this.state.table.tableName = name;
    this.setState(this.state.table);
  }
  handleRowDel(rowId) {
    if (this.state.table.tableContent.length == 1)
      return;
    this.state.table.tableContent.splice(rowId, 1);
    this.setState(this.state.table);
  }
  handleColDel() {
    if (this.state.table.tableContent[0].length == 1)
      return;
    this.state.table.tableContent.map(row => row.splice(-1, 1));
    this.state.table.tableHeader.splice(-1, 1);
    this.setState(this.state.table.tableHeader);
    this.setState(this.state.table.tableContent);
  }
  handleRowAdd(evt) {
    console.log(this.getCSVTable());
    var id = (+ new Date() + Math.floor(Math.random() * 999999)).toString(36);
    var row = [];
    for (var i = 0; i < this.state.table.tableContent[0].length; i ++)
      row.push(0);
    this.state.table.tableContent.push(row);
    this.setState(this.state.table);
  }
  handleColAdd(evt) {
    var id = (+ new Date() + Math.floor(Math.random() * 999999)).toString(36);
    this.state.table.tableHeader.splice(this.state.table.tableContent[0].length, 
            0, "c" + this.state.table.tableContent[0].length);
    this.state.table.tableContent.map(row => row.splice(this.state.table.tableContent[0].length, 0, 0));
    this.setState(this.state.table);
  }
  handleCellUpdate(r, c, val) {
    this.state.table.tableContent[r][c] = val;
    this.setState(this.state.table);
  }
  handleHeaderUpdate(r, c, val) {
    this.state.table.tableHeader.splice(c, 1, val);
    this.setState(this.state.table.tableHeader);
  }
  render() {
    return (
      <div style={{border: "dashed 1px #EEE", padding: "2px 2px 2px 2px"}}>
        <input type='text' value= {this.state.table.tableName} className="table_name" size="10"
              onChange={e => {this.updateTableName.bind(this)(e.target.value)}}
              style={{ width: "100%", textAlign: "center", border: "none", marginBottom: "2px"}} />
        <table className="table dataTable cell-border">
          <thead> 
            <ETableRow onCellUpdate={this.handleHeaderUpdate.bind(this)} 
                    data={{rowContent: this.state.table.tableHeader, rowId: "H"}}
                    deletable={false} />
          </thead>
          <tbody> {this.state.table.tableContent.map((val, i) =>
              <ETableRow onCellUpdate={this.handleCellUpdate.bind(this)} data={{rowContent: val, rowId: i}} 
                  deletable={true} key={i} onDelEvent={this.handleRowDel.bind(this)} />)}
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

ReactDOM.render(
  <ScytheInterface />,
  document.getElementById('wrapper')
);