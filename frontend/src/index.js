import React from 'react';
import ReactDOM from 'react-dom';
import Util from "./util.js";
import TaskPanel from "./task-panel.js"

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
      this.state.databaseList = responseJson.databases.filter((x) => (! x.startsWith("temp")));
      this.setState(this.state.databaseList);
    })
    .catch((error) => {
      console.error(error);
    });

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

    // tables to be uploaded to the backend database
    //this.createTempDB.bind(this)();
  }
  addPanel() {
    this.state.panels.push(<TaskPanel key={this.state.panels.length} dbKey={this.state.dbKey} />);
    this.setState(this.state.panels);
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

          var content = responseJson.content;
          if (file.endsWith(".csv")) {
            console.log(file);
            var table = Util.csvToTable(content, file.replace(/\./g,"_"));
            console.log(table);
            var inputTables = [];
            inputTables.push(table);
            var newPanel = <TaskPanel key={this.state.panels.length} 
                                      dbKey={this.state.dbKey} inputTables={inputTables}/>;
            this.state.panels.push(newPanel);
            this.setState(this.state.panels);
          } else if (file.endsWith(".scythe.txt")) {
            var examples = Util.parseScytheExample(content);
            var newPanel = null;
            if (examples.description == null)
              newPanel = <TaskPanel key={this.state.panels.length} dbKey={this.state.dbKey} 
                            inputTables={examples.inputTables} outputTable={examples.outputTable}/>;
            else 
              newPanel = <TaskPanel key={this.state.panels.length} dbKey={this.state.dbKey} 
                            inputTables={examples.inputTables} outputTable={examples.outputTable}
                            taskDescription={examples.description}/>;
            this.state.panels.push(newPanel);
            this.setState(this.state.panels);
          }
        }
      })
      .catch((error) => { 
        if (this.state.connected)
          alert("Failed to obtain file (" + file + ") from backend.");
      });
  }
  /*uploadExample(evt) {
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
              var table = Util.csvToTable(reader.result, file.replace(/\./g,"_"));
              var newPanel = <TaskPanel key={this.state.panels.length} 
                                        dbKey={this.state.dbKey} inputTables={[table]}/>;
              this.state.panels.push(newPanel);
              this.setState(this.state.panels);
            } else if (file.name.endsWith(".scythe.txt")) {
              var examples = Util.parseScytheExample(reader.result);
              var newPanel = null;
              if (examples.description == null)
                newPanel = <TaskPanel key={this.state.panels.length} dbKey={this.state.dbKey} 
                              inputTables={examples.inputTables} outputTable={examples.outputTable}/>;
              else 
                newPanel = <TaskPanel key={this.state.panels.length} dbKey={this.state.dbKey} 
                              inputTables={examples.inputTables} outputTable={examples.outputTable}
                              taskDescription={examples.description}/>;
              this.state.panels.push(newPanel);
              this.setState(this.state.panels);
            }
          }.bind(this);
          reader.readAsText(file, "UTF-8");
        }).bind(this)(files[i]);
      }
    }
  }*/
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

    var dbName = this.state.dbKey;
    if (this.state.dbKey != null && this.state.dbKey.startsWith("temp"))
      dbName = "temp database";

    var connectedInfo = null;
    var uploadDataBtn = null;
    if (this.state.connected) {
      connectedInfo = <label style={{float: "right", 
                                     marginRight: "10px", 
                                     fontWeight: "normal", 
                                     paddingTop: "5px"}}>
                        Online (Connected to {dbName})
                      </label>;
    } else {
      connectedInfo = <label style={{float: "right", 
                                     marginRight: "10px", 
                                     fontWeight: "normal",
                                     paddingTop: "5px"}}>
                        Offline (No backend DB connected)
                      </label>;
    }

    if (this.state.connected && this.state.dbKey.startsWith("tempDB")) {
      uploadDataBtn = 
        <label className="btn btn-secondary btn-default" style={{marginLeft: "5px"}}> Upload data to tempDB (.csv)
          <input onChange={this.loadCSVAndTransfer.bind(this)} className="fileupload" 
            type="file" style={{display: "none"}} name="files[]" multiple />
        </label>;
    }

    var removePanelBtn = null;
    if (this.state.panels.length > 0) {
      removePanelBtn = <label className="btn btn-primary" onClick={this.removePanel.bind(this)}>
            <span className="glyphicon glyphicon-minus" /> Remove Panel</label>
    }

    return (
      <div id="interactive-panels">
        <div style={{textDecoration: "underline", marginBottom: "5px", marginLeft: "5px"}}>
          <span className="glyphicon glyphicon-info-sign"/> Create a panel and provide an input-output example to start your task!</div>
        <div className="btn-group">
          <label className="btn btn-primary" onClick={this.addPanel.bind(this)}>
            <span className="glyphicon glyphicon-plus" /> Empty Panel</label>
          {removePanelBtn}
          <label data-toggle='dropdown' className='btn btn-primary dropdown-toggle'>
            <span data-label-placement="">Load An Example Panel</span> <span className='caret'></span>
          </label>
          <ul className='dropdown-menu bullet pull-right'>
            {this.state.exampleList.map((d, i) =>
              <li key={i} onClick={e => this.loadExistingExample.bind(this)(d)}>
                <input type='radio' name={"egSelect-" + d} value={d}/>
                <label htmlFor={"egSelect-" + d}>{d}</label>
              </li>)}
          </ul>
        </div>
        <div className='btn-group' style={{marginLeft: "5px"}}>
          <label data-toggle='dropdown' className={'btn btn-primary dropdown-toggle ' 
              + (this.state.panels.length > 0 ? " disabled" : "")}>
            <span data-label-placement="">Connect to Database</span> <span className='caret'></span>
          </label>
          <ul className='dropdown-menu'>
            {this.state.databaseList.map((d, i) =>
              <li key={i} onClick={e => 
                this.updateDBKey.bind(this)(this.state.databaseList[i], true)}>
                <input type='radio' name={"dbSelect-" + d} value={d}/>
                <label htmlFor={"dbSelect-" + d}>{d}</label>
              </li>)}
            <li className="divider"></li>
            <li onClick={this.createTempDB.bind(this)}>
                <input type='radio' name={"dbSelect-new"} value={"newDB"}/>
                <label htmlFor={"dbSelect-new"}>Create Temp DB</label>
            </li>
            <li className="divider"></li>
            <li onClick={e => this.updateDBKey.bind(this)(null, false)}>
              <input type='radio' name={"dbSelect-offline"} value={"offline"}/>
              <label htmlFor={"dbSelect-offline"}>Stay Offline</label>
            </li>
          </ul>
        </div>
        {uploadDataBtn}
        {connectedInfo}
        { this.state.panels.map(x => {return x}) }
      </div>);
  }
}

ReactDOM.render(
  <ScytheInterface />,
  document.getElementById('wrapper')
);