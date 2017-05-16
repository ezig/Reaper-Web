import Util from "./util.js";
import Charts from "./charts.js";
import EditableTable from "./editable-table.js";
import React from 'react';
import ReactTooltip from 'react-tooltip';

class TaskPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.state.inputTables = [];

    if (! ("inputTables" in this.props)) {
      this.state.inputTables.push(this.genDefaultTable("input_table_0"));
    } else {
      this.state.inputTables = this.props.inputTables;
    }

    if (! ("outputTable" in this.props)) {
      this.state.outputTable = this.genDefaultTable("output_table");
    } else { 
      this.state.outputTable = this.props.outputTable;
    }

    this.state.taskDescription = null;
    if ("taskDescription" in this.props) {
      this.state.taskDescription = this.props.taskDescription;
    }
    
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

    // a dumb field used to identify stuff...
    this.state.visDivId = "vis" + Util.makeid();
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
      displaySelected = "Synthesized Query " + (this.state.displayOption.queryId + 1);
    var disableSelect = (this.state.synthesisResult.length == 0);

    // prepare options in the drop down menu
    for (var i = 0; i <= this.state.synthesisResult.length -1; i ++)
      options.push({value: i, 
                    label: 'Synthesized Query ' + (i + 1), 
                    tempId: Util.makeid(),
                    checked: (this.state.displayOption.queryId == i)});

    var visTargetChoiceName = Util.makeid();
    var visTargetDropDown = 
      [{value: "example data", label: "Visualize Output Example", tempId: Util.makeid(), disabled: false,
        checked: (this.state.displayOption.visDataSrc == "example data")},
       {value: "query result", label: "Visualize Query Result", tempId: Util.makeid(), 
        checked: (this.state.displayOption.visDataSrc == "query result"), 
        disabled: (disableSelect)}];

    // chartTypeDropDown are created from chartOptions
    var chartTypeChoiceName = Util.makeid();
    var chartTypeDropDown = Charts.getOptions().map(d => { var x = d; x.tempId = Util.makeid(); return x;});


    var showQueryResultBtn = null;
    var showQueryBtn = null;

    if (! this.state.displayOption.type == "data" && ! disableSelect 
          && this.state.displayOption.queryId != -1 && 
          this.state.synthesisResult[this.state.displayOption.queryId].data != null) {
      showQueryResultBtn = 
            <label className={"btn btn-default query-btn" + (disableSelect ? " disabled" : "")}
              onClick={e => (disableSelect ? (0) : this.updateDisplayOption.bind(this)("type", "data"))}>
              Show Query Result
            </label>;
    }

    if (this.state.displayOption.type != "query") {
      showQueryBtn = <label className={"btn btn-default query-btn" + (disableSelect ? " disabled" : "")}
               onClick={e => (disableSelect ? (0) : this.updateDisplayOption.bind(this)("type", "query"))}>
          Show Query
        </label>;
    }

    var runOnDBBtn = null;
    if (disableSelect)
      runOnDBBtn = 
        <label className="btn btn-default query-btn disabled" onClick={this.runQueryOnDatabase.bind(this)}>
          Run on DB
        </label>;
    else 
      runOnDBBtn = 
        <label className="btn btn-default query-btn" onClick={this.runQueryOnDatabase.bind(this)}
            data-tip="Execute the query on the selected database">
          Run on DB
        </label>;
        
    var visualizeBtn = null;
    if (disableSelect)
      visualizeBtn = <label className="btn btn-default query-btn disabled"
              onClick={e => (disableSelect ? (0) : this.updateDisplayOption.bind(this)("type", "vis"))}>
            Visualize
          </label>;
    else
      visualizeBtn = <label className="btn btn-default query-btn"
              onClick={e => this.updateDisplayOption.bind(this)("type", "vis")}
              data-tip="Select the target data and chart type to build visualization.">
            Visualize
          </label>;

    // Generate the drop down menu in the enhanced drop down fashion
    // When there are multiple note that items in the list should all have the same name
    return <div className='btn-group'>
        <div className='btn-group'>
          <label data-toggle='dropdown' data-placeholder="false"
                 className={'btn btn-default dropdown-toggle' + (disableSelect ? " disabled" : "")}>
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
        {runOnDBBtn}
        <ReactTooltip effect="solid" place="top" multiline={true}/>
        {showQueryBtn}
        {showQueryResultBtn}
        <div className='btn-group'>
          {visualizeBtn}
          <ReactTooltip effect="solid"/>
          <label data-toggle='dropdown' className='btn btn-default dropdown-toggle'
                 data-placeholder="false">
            <span className='caret'></span>
          </label>
          <ul className='dropdown-menu bullet pull-top pull-right'>
            {visTargetDropDown.map((d, i) =>
              <li key={i}>
                <input className={d.disabled? "disabled": ""} type='radio' id={d.tempId} 
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
  componentWillUpdate(prevProps, prevState) {
    $("#" + prevState.visDivId).empty();
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
                      style={{display: "flex", alignItems: "center", justifyContent: "center", marginTop: "5px"}}>
                    No query to display yet.
                 </div>;
          } else {
            return <div className="pnl display-query" 
                      style={{display: "flex", alignItems: "center", justifyContent: "center", marginTop: "5px"}}>
                    <img src="./media/gears.gif" style={{width:"50px", height:"50px"}} />
                 </div>;
          }
      }
    } else if (this.state.displayOption.type == "vis") {
      //this.state.displayOption = {type: "query", queryId: -1, visDataSrc: "example data"};
      return <div id={this.state.visDivId} className="pnl display-vis" 
                  style={{display:"block", marginTop: "5px"}}></div>;
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
    var panelId = Util.makeid();

    var taskDescriptionBanner = null;
    if (this.state.taskDescription != null) {
      var  taskDescriptionBanner = 
        <div style={{fontWeight: "normal", padding: "5px 5px 5px 5px"}}>
            <span className="glyphicon glyphicon-pushpin"></span> <span style={{fontWeight:"bold"}}>Example Task:</span> {this.state.taskDescription}
        </div>;
    }

    return (
      <div style={{margin: "5px 5px 5px 5px"}}>
      {taskDescriptionBanner}
      <table id={"panel"  + panelId} className="ipanel" 
             style={{width: 100+ "%", tableLayout: "fixed", marginTop: "5px"}}>
        <tbody className="dash-box">
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
                  <span className='input-group-addon' 
                        data-tip="Constants (e.g., numbers, dates) that may be used in the query.">?</span>
                </div>
                <ReactTooltip effect="solid"/>
                <div className='input-group input-group-sm input-box aggr-func-panel'>
                  <span className='input-group-addon' id={'aggr-addon' + panelId}>Aggregators</span>
                  <input type='text' className='form-control' placeholder='(Optional)' 
                          onChange={this.updateAggrFunc.bind(this)} 
                          aria-describedby={'aggr-addon' + panelId} />
                  <span className='input-group-addon' 
                        data-tip="Aggregation functions (e.g., max, min, avg) that may be used in the query.">?</span>
                </div>
                <ReactTooltip effect="solid"/>
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
                <div className="btn-group btn-group-justified">
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
      </div>
    );
  }
}

export default TaskPanel;