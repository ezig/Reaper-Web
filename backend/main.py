# Main api routes for frontend

import os
import local_subprocess32
from local_subprocess32 import check_output, PIPE, TimeoutExpired
from datetime import datetime
import sqlite3

from flask import Flask, render_template, request, jsonify

template_dir = os.path.abspath('../frontend')
static_dir = os.path.abspath('../frontend')
app = Flask(__name__,template_folder=template_dir, static_folder=static_dir)
app.debug = True
synthesizer_time_limit = 30

# Index page for GET
@app.route('/')
def index():
    return render_template('ae_index.html') 

# Index page for GET
@app.route('/demo')
def demo():
    return render_template('index.html')

@app.route('/<path:path>')
def static_proxy(path):
  # send_static_file will guess the correct MIME type
  return app.send_static_file(path)

# file upload 
@app.route('/upload_file', methods = ['POST'])
def upload_file():
    file_content = request.form.get('content')
    file_name = os.path.abspath("../frontend/static/temp")
    f = open(file_name, "w")
    f.write(file_coddntent)
    return file_name

@app.route('/run_query', methods = ['POST'])
def run_query():
    request_data = request.get_json()
    if (not "query" in request_data) or (not "dbKey" in request_data):
        return False
    query = request_data["query"]
    target_db = request_data['dbKey']

# create and destruct temp db
@app.route('/create_temp_db', methods = ['POST'])
def create_temp_db():
    db_key = "tempDB" + (datetime.now().isoformat()) + ".db"
    conn = sqlite3.connect(db_key)
    print "Temporary database (" + db_key + ") created and opened successfully"
    return jsonify({"dbKey": db_key})

@app.route('/insert_csv_table', methods=['POST'])
def insert_csv_table():
    request_data = request.get_json()
    if ("db_key" in request_data and "table" in request_data):
        dbKey = request_data["db_key"]
        table = request_data["table"]
        conn = sqlite3.connect(dbKey)
        cursor = conn.cursor()
        # careful! if the table already exists in the database, we would simply insert rows into it
        cursor.execute("CREATE TABLE IF NOT EXISTS %s (%s);" % (table["name"], ",".join(table["header"])))
        cursor.executemany("INSERT INTO %s (%s) VALUES (%s);" 
            % (table["name"], ",".join(table["header"]), ",".join("?"*len(table["header"]))), table["content"])
        conn.commit()
        conn.close()
        print ("table %s(%s) successfully uploaded to database %s" 
                % (table["name"], ",".join(table["header"]), dbKey))
        return jsonify({"status": "success"})
    return jsonify({"status": "failed"}) 

@app.route('/destruct_temp_db')
def destruct_temp_db():
    request_data = request.get_json()
    if "dbKey" in request_data:
        os.remove(request_data["dbKey"])

# Synthesizer api call
@app.route('/scythe', methods = ['POST'])
def synthesize():

    request_data = request.get_json()

    if not "example" in request_data:
        return jsonify({
            "status": "error",
            "message": "Wrong data format."
        })

    tempfile_name = "tmp" + (datetime.now().isoformat())

    example = request_data['example']
    text_file = open(tempfile_name, "w+")
    text_file.write(example)
    text_file.close()

    try:
        output = check_output(['java', '-jar', 'Scythe.jar', tempfile_name, 'StagedEnumerator', '-aggr'], 
                                stdin=PIPE, stderr=PIPE, timeout=synthesizer_time_limit)
    
        # parse the synthesis result to extract queries
        lines = output.splitlines()
        queries = []

        current = ""
        start_collect = False
        for line in lines:
            if "[No." in line:
                start_collect = True
                if current != "":
                    queries.append(current)
                current = ""
            elif start_collect:
                current += line + "\n"
            else:
                continue
        os.remove(tempfile_name)
        return jsonify({
            "status": "success",
            "queries": queries
        })
    except TimeoutExpired:
        os.remove(tempfile_name)
        return jsonify({
            "status": "error",
            "message": "Timeout (" + str(synthesizer_time_limit) + " seconds)"
        })
