import React from 'react';
import ReactDOM from 'react-dom';
import Util from "./util.js";
import Charts from "./charts.js";
import EditableTable from "./editable-table.js";

class ScytheInterface extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};

    //TODO: this is very badly designed, changing the format will affect the backend as well
    this.state.dbKey = "tempDB" + new Date().toISOString() + ".db";
    this.state.connected = false

    // starting with empty chart because we want the database to be connected first
    this.state.panels = [];
    this.state.databaseList = [];

    var request = new Request('/database', 
      { method: 'GET', 
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
    // handle response from the server
    fetch(request)
    .then((response) => response.json())
    .then((responseJson) => {
      this.state.databaseList = responseJson.databases;
      this.setState(this.state.databaseList);
    })
    .catch((error) => {
      console.error(error);
    });

    // tables to be uploaded to the backend database
    //this.createTempDB.bind(this)();
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
      this.setState({connected: true});
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
            var tableName = file.name.replace(/\./g,"_");
            this.transmitDataTable.bind(this)(Util.csvToTable(reader.result, tableName));
          }.bind(this);
          reader.readAsText(file, "UTF-8");
        }).bind(this)(files[i]);
      }
    }
  }
  updateDBKey(val, connected) {
    this.setState({dbKey: val});
    this.setState({connected: connected});
    console.log(val, connected);
  }
  transmitDataTable(table) {
    var dbKey = this.state.dbKey;
    if (dbKey == null) { 
      console.log("Transmission failed due to no database connection.");
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

    var connectedInfo = null;
    var uploadDataBtn = null;
    if (this.state.connected) {
      connectedInfo = <label style={{float: "right", marginRight: "10px", 
                                     fontWeight: "normal", paddingTop: "5px"}}>
                        Online (Connected to {this.state.dbKey})
                      </label>;
    } else {
      connectedInfo = <label style={{float: "right", marginRight: "10px", fontWeight: "normal"}}>
                        Offline Mode (No backend DB connected)
                      </label>;
    }

    if (this.state.connected && this.state.dbKey.startsWith("tempDB")) {
      uploadDataBtn = 
        <label className="btn btn-primary" style={{marginLeft: "5px"}}> Upload Data
          <input onChange={this.loadCSVAndTransfer.bind(this)} className="fileupload" 
            type="file" style={{display: "none"}} name="files[]" multiple />
        </label>;
    }

    return (
      <div id="interactive-panels">
        <div className="btn-group">
          <label className="btn btn-primary" onClick={this.addPanel.bind(this)}>
            <span className="glyphicon glyphicon-plus" /> New Panel</label>
          <label className="btn btn-primary" onClick={this.removePanel.bind(this)}>
            <span className="glyphicon glyphicon-minus" /> Remove Panel</label>
        </div>
        <div className='btn-group' style={{marginLeft: "5px"}}>
          <label data-toggle='dropdown' className={'btn btn-primary dropdown-toggle'} 
                disabled={this.state.panels.length > 0}>
            <span data-label-placement="">Select Backend DB</span> <span className='caret'></span>
          </label>
          <ul className='dropdown-menu'>
            <li onClick={e => this.updateDBKey.bind(this)(null, false)}>
              <input type='radio' name={"dbSelect-offline"} value={"offline"}/>
              <label htmlFor={"dbSelect-offline"}>Offline Mode</label>
            </li>
            <li className="divider"></li>
            {this.state.databaseList.map((d, i) =>
              <li key={i} onClick={e => 
                this.updateDBKey.bind(this)(this.state.databaseList[i], true)}>
                <input type='radio' name={"dbSelect-" + d} value={d}/>
                <label htmlFor={"dbSelect-" + d}>{d}</label>
              </li>)}
            <li className="divider"></li>
            <li onClick={this.createTempDB.bind(this)}>
                <input type='radio' name={"dbSelect-new"} value={"newDB"}/>
                <label htmlFor={"dbSelect-new"}>Create New Database</label>
            </li>
          </ul>
        </div>
        {uploadDataBtn}
        {connectedInfo}
        { this.state.panels.map(x => {return [<br />, x]}) }
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

    // working status of the panel
    this.state.callingScythe = false;
    this.state.callingDB = false;

    // stores json objects of form {query: XXX, data: XXX}, data field is null by default
    this.state.synthesisResult = [];
    this.state.displayOption = {type: "query", queryId: -1, 
                                visDataSrc: "example data", chartType: "hist"};

    this.state.exampleList = [];
    var request = new Request('/examples', 
      { method: 'GET', 
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
    // handle response from the server
    fetch(request)
    .then((response) => response.json())
    .then((responseJson) => {
      this.state.exampleList = responseJson.examples;
      this.setState(this.state.exampleList);
    })
    .catch((error) => {
      console.error(error);
    });

    // a dumb field used to identify stuff...
    this.state.visDivId = "vis" + Util.makeid();
  }
  loadExistingExample(file) {
    console.log(file);

    var req = new Request('/get_example', 
      { method: 'POST', 
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          example_name: file
        })
      });

      // handle response from the server
      fetch(req)
        .then((response) => response.json())
        .then((responseJson) => { 
          if (responseJson.status == "success") {
            this.state.inputTables = [];
            this.setState(this.state.inputTables);
            var content = responseJson.content;
            if (file.endsWith(".csv")) {
              var table = Util.csvToTable(content, file.replace(/\./g,"_"));
              this.state.inputTables.push(table);
              this.setState(this.state.inputTables);
            } else if (file.endsWith(".scythe.txt")) {
              var examples = Util.parseScytheExample(content);
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
          }
        })
        .catch((error) => { 
          if (this.state.connected)
            alert("Failed to obtain file (" + file + ") from backend.");
        });
  }
  uploadExample(evt) {
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
            if (file.name.endsWith(".csv")) {
              var table = Util.csvToTable(reader.result, file.name.replace(/\./g,"_"));
              this.state.inputTables.push(table);
              this.setState(this.state.inputTables);
            } else if (file.name.endsWith(".scythe.txt")) {
              var examples = Util.parseScytheExample(reader.result);
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

    return {name: tableName, content: tableContent, header: tableHeader};
  }
  updateDisplayOption(attr, val) {
    this.state.displayOption[attr] = val;
    this.setState(this.state.displayOption);
  }
  // execute the currently selected query on the database to acquire the result 
  runQueryOnDatabase() {

    // do nothing if connection is not established
    if (this.state.connected == false || this.state.displayOption.queryId == -1)
      return;

    if (this.state.synthesisResult[this.state.displayOption.queryId].data != null)
      return;

    this.setState({callingDB :  true});

    var query = this.state.synthesisResult[this.state.displayOption.queryId].query;
    var dbKey = this.state.dbKey;

    var req = new Request('/query_database', 
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
          this.setState({callingDB :  false});
          this.state.synthesisResult[this.state.displayOption.queryId].data = responseJson.data;
          this.setState(this.state.synthesisResult);
        }
      })
      .catch((error) => { 
        this.setState({callingDB :  false});
        if (this.state.connected)
          alert("Failed to run query on the database (" + dbKey + ")");
      });
  }
  renderDropDownMenu() {
    var options = [];
    var querySelectorName = Util.makeid();
    var displaySelected = "Select Query";
    if (this.state.displayOption.queryId != -1)
      displaySelected = "Query " + (this.state.displayOption.queryId + 1);
    var disableSelect = (this.state.synthesisResult.length == 0);

    // prepare options in the drop down menu
    for (var i = 0; i <= this.state.synthesisResult.length -1; i ++)
      options.push({value: i, 
                    label: 'Query ' + (i + 1), 
                    tempId: Util.makeid(),
                    checked: (this.state.displayOption.queryId == i)});

    var visTargetChoiceName = Util.makeid();
    var visTargetDropDown = 
      [{value: "example data", label: "Output Example", tempId: Util.makeid(), disabled: false,
        checked: (this.state.displayOption.visDataSrc == "example data")},
       {value: "query result", label: "Query Result", tempId: Util.makeid(), 
        checked: (this.state.displayOption.visDataSrc == "query result"), 
        disabled: (disableSelect)}];

    // chartTypeDropDown are created from chartOptions
    var chartTypeChoiceName = Util.makeid();
    var chartTypeDropDown = Charts.getOptions().map(d => { var x = d; x.tempId = Util.makeid(); return x;});

    // Generate the drop down menu in the enhanced drop down fashion
    // When there are multiple note that items in the list should all have the same name
    return <div className='btn-group'>
        <div className='btn-group'>
          <label data-toggle='dropdown' data-placeholder="false"
                 className={'btn btn-default dropdown-toggle'} disabled={disableSelect}>
            {displaySelected + " "}
            <span className='caret'></span>
          </label>
          <ul className='dropdown-menu'>
            {options.map((d, i) =>
              <li key={i}>
                <input type='radio' id={d.tempId} name={querySelectorName} 
                  value={i} checked={this.state.displayOption.visDataSrc == d.value}
                onChange={e => 
                  this.updateDisplayOption.bind(this)("queryId", parseInt(e.target.value))} />
                <label htmlFor={d.tempId}>{d.label}</label>
              </li>)}
          </ul>
        </div>
        <label className={"btn btn-default query-btn"} disabled={disableSelect}
               onClick={e => this.updateDisplayOption.bind(this)("type", "query")}>
          Show Query
        </label>
        <label className={"btn btn-default query-btn"} 
               disabled={disableSelect || this.state.connected==false}
               onClick={this.runQueryOnDatabase.bind(this)}>
          Run on DB
        </label>
        <label className={"btn btn-default query-btn"} disabled={disableSelect}
               onClick={e => this.updateDisplayOption.bind(this)("type", "data")}>
          Show Data
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
          <ul className='dropdown-menu bullet pull-top pull-right'>
            {visTargetDropDown.map((d, i) =>
              <li key={i}>
                <input disabled={d.disabled} type='radio' id={d.tempId} 
                  name={visTargetChoiceName} value={d.value} checked={d.checked}
                  onChange={e => this.updateDisplayOption.bind(this)("visDataSrc", e.target.value)}/>
                <label htmlFor={d.tempId}>{d.label}</label>
              </li>)}
            <li className="divider"></li>
            {chartTypeDropDown.filter((d) => d.filter(this.state.outputTable)).map((d, i) =>
              <li key={i}>
                <input type='radio' id={d.tempId} name={chartTypeChoiceName} value={d.value} 
                  checked={d.checked}
                  onChange={e => this.updateDisplayOption.bind(this)("chartType", e.target.value)}/>
                <label htmlFor={d.tempId}>{d.label}</label>
              </li>)}
          </ul>
        </div>
      </div>;
  }
  componentDidUpdate(prevProps, prevState) {
    // hightlight code
    $('pre code').each(function(i, block) {
      hljs.highlightBlock(block);
    });

    // call jquery to generate visualization
    if (prevState.displayOption.type == "vis") {
        $("#" + prevState.visDivId).empty();
        var visData = null;
        if (prevState.visDataSrc == "example data")
          visData = prevState.outputTable;
        else if (prevState.visDataSrc == "query result")
          visData = prevState.synthesisResult[prevState.displayOption.queryId].data;

        if (visData != null) {
          $("#" + prevState.visDivId).empty();
          Charts.render("#" + prevState.visDivId, visData, prevState.displayOption.chartType);
        }
    }
  }
  renderDisplayPanel() {
    if (this.state.displayOption.type == "query") {
      let content = null;
      if (this.state.displayOption.queryId != -1) {
        return <div className="pnl display-query" style={{display:"block"}}>
                <div className="query_output_container">
                  <pre style={{height:"100%", overflow:"auto", margin: "0 0 5px"}}>
                    <code className="inner-pre sql" style={{fontSize: "12px"}}>
                      {this.state.synthesisResult[this.state.displayOption.queryId].query}
                    </code>
                  </pre>
                </div>
               </div>;
      } else {
        if (this.state.synthesisResult.length == 0)
          if (this.state.callingScythe == false) {
            return <div className="pnl display-query" 
                      style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
                    No query to display yet.
                 </div>;
          } else {
            return <div className="pnl display-query" 
                      style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
                    <img src="./media/gears.gif" style={{width:"50px", height:"50px"}} />
                 </div>;
          }
      }
    } else if (this.state.displayOption.type == "vis") {
      //this.state.displayOption = {type: "query", queryId: -1, visDataSrc: "example data"};
      return <div id={this.state.visDivId} className="pnl display-vis" 
                  style={{display:"block", margin: "10px 5px 5px 5px"}}></div>;
    } else if (this.state.displayOption.type == "data") {
      let content = null;
      if (this.state.displayOption.queryId != -1 
            && this.state.synthesisResult[this.state.displayOption.queryId].data != null) {
        return <div className="pnl display-query" style={{display:"block"}}>
                <div className="query_output_container">
                  <pre style={{maxHeight:"500px", overflow:"scroll", margin: "0 0 5px"}}>
                    <span className="inner-pre" style={{fontSize: "10px"}}>
                    {Util.tableToCSV(this.state.synthesisResult[this.state.displayOption.queryId].data)}
                    </span>
                  </pre>
               </div></div>;
      } else {
        if (this.state.callingDB) {
          return <div className="pnl display-vis" 
                    style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
                    <img src="./media/gears.gif" style={{width:"50px", height:"50px"}} />
                 </div>;
        }
        return <div className="pnl display-vis" 
                    style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
                The data is not yet available, please run the query on database.
              </div>;
      }
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
    this.state.synthesisResult = [];
    this.state.displayOption.queryId = -1;
    this.setState(this.state.displayOption);
    this.setState({callingScythe: true});
    this.setState(this.state.synthesisResult);


    //generates the input to be used by the backend synthesizer
    function tableToScytheStr(table, type) {
      var s = "#" + type + ":" + table.name + "\n\n";
      s += table.header.join(",") + "\n";
      for (var i = 0; i < table.content.length; i ++)
        s += table.content[i].join(",") + "\n";
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
      for (var i in responseJson.queries) {
        this.state.synthesisResult.push({"query": responseJson.queries[i], "data": null});
      }
      this.state.synthesisResult = this.state.synthesisResult.reverse();
      // automatically switching to displaying the first query synthesized
      this.setState({callingScythe: false})
      this.state.displayOption.queryId = 0;
      this.setState(this.state.displayOption);
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
             style={{width: 100+ "%", tableLayout: "fixed", marginTop: "5px"}}>
        <tbody>
          <tr>
            <td style={{width: 35+ "%", verticalAlign:"top", borderRight:1+"px dashed gray"}}>
              <div className="input-example" id={"input-example" + panelId}>
                {this.state.inputTables.map((t, i) =>
                    (<EditableTable refs={"input-table-" + i} key={i} table={t} />))}
              </div>
              <div>
                <div className='input-group input-group-sm input-box constant-panel'>
                  <span className='input-group-addon' 
                        id={'constant-addon' + panelId}>Constants</span>
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
                <EditableTable key="ot" refs="output-table" table={this.state.outputTable} />
              </div>
            </td>
            <td style={{width: 43+ "%", verticalAlign:"middle"}}>
              <div className="vis">
                {this.renderDisplayPanel()}
              </div>
            </td>
          </tr>
          <tr style={{height:0+"px"}}>
            <td style={{borderRight:1+"px dashed gray"}}>
              <div id={"input-panel-btns" + panelId}  style={{marginLeft: "10px", marginRight: "10px"}}>
                <div className="btn-group" style={{marginRight: "10px"}}>
                  <label data-toggle='dropdown' className={'btn btn-primary dropdown-toggle'}>
                    <span data-label-placement="">Load Example</span> <span className="glyphicons glyphicons-chevron-right"></span>
                  </label>
                  <ul className='dropdown-menu bullet pull-middle pull-right'>
                    <li><label>
                        Upload Example (csv, scythe.txt)
                        <input onChange={this.uploadExample.bind(this)} className="fileupload" 
                             type="file" style={{display: "none"}} name="files[]" multiple />
                        </label>
                    </li>
                    <li className="divider"></li>
                    {this.state.exampleList.map((d, i) =>
                      <li key={i} onClick={e => this.loadExistingExample.bind(this)(d)}>
                        <input type='radio' name={"egSelect-" + d} value={d}/>
                        <label htmlFor={"egSelect-" + d}>{d}</label>
                      </li>)}
                  </ul>
                </div>
                <div className="btn-group" 
                     style={{width:"60%", tableLayout: "fixed", borderCollapse: "separate"}}>
                  <label onClick={this.addDefaultInputTable.bind(this)} className="btn btn-primary" 
                         style={{paddingLeft:10+"px", paddingRight:10 + "px"}}>
                    <span className="glyphicon glyphicon-plus" /> Add Table
                  </label>
                  <label onClick={this.removeLastInputTable.bind(this)} className="btn btn-primary" 
                         style={{paddingLeft:10+"px", paddingRight:10 + "px"}}>
                    <span className="glyphicon glyphicon-minus" /> Remove Table
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

ReactDOM.render(
  <ScytheInterface />,
  document.getElementById('wrapper')
);