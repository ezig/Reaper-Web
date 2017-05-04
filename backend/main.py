# Main api routes for frontend

import os
import local_subprocess32
from local_subprocess32 import check_output, PIPE, TimeoutExpired
from datetime import datetime
import dateutil.parser
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
        # handle the last query
        if current != "":
            queries.append(current)

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


################## Database related services ##############

# check time stamp of all created temporary db and remove those created >30 min ago
def clean_old_temp_db():
    files = [f for f in os.listdir('.') if os.path.isfile(f)]
    for f in files:
        if f.startswith("tempDB") and f.endswith(".db"):
            f_timestamp = dateutil.parser.parse(f[6:-3])
            time_diff = (datetime.now() - f_timestamp.replace(tzinfo=None)).total_seconds()
            if time_diff > 1800:
                print "TempDB %s removed after 1800s of creation." % {f}
                os.remove(f)

# create and destruct temp db
@app.route('/create_temp_db', methods = ['POST'])
def create_temp_db():
    request_data = request.get_json()
    if not "db_key" in request_data:
        return jsonify({"status": "error"})
    db_key = request_data["db_key"]
    conn = sqlite3.connect(db_key)
    print "Temporary database (" + db_key + ") created and opened successfully"
    clean_old_temp_db()
    return jsonify({"status": "success", "dbKey": db_key})

@app.route('/insert_csv_table', methods=['POST'])
def insert_csv_table():
    request_data = request.get_json()
    if ("db_key" in request_data and "table" in request_data):
        db_key = request_data["db_key"]
        table = request_data["table"]
        conn = sqlite3.connect(db_key)
        cursor = conn.cursor()

        col_type = {}
        typed_col = []
        sample_length = 10 if len(table["content"]) > 10 else len(table["content"])
        for col_id in range(0, len(table["header"])):
            values = []
            for i in range(0, sample_length):
                values.append(table["content"][i][col_id])
            ty = try_infer_datatype(values)
            col_type[table["header"][col_id]] = ty
            typed_col.append(table["header"][col_id] + " " + ty)

        # careful! if the table already exists in the database, we would simply insert rows into it
        cursor.execute("CREATE TABLE IF NOT EXISTS %s (%s);" % (table["name"], ",".join(typed_col)))
        cursor.executemany("INSERT INTO %s (%s) VALUES (%s);" 
            % (table["name"], ",".join(table["header"]), 
                ",".join("?"*len(table["header"]))), table["content"])
        conn.commit()
        conn.close()
        print ("table %s(%s) successfully uploaded to database %s" 
                % (table["name"], ",".join(table["header"]), db_key))
        return jsonify({"status": "success"})
    return jsonify({"status": "error"})

MAX_ROW_KEPT = 5000

@app.route('/query_temp_db', methods=['POST'])
def query_temp_db():
    request_data = request.get_json()
    if ("db_key" in request_data) and ("query" in request_data):
        print "Received a query request for database:", request_data["db_key"]
        db_key = request_data["db_key"]
        query = request_data["query"]
        conn = sqlite3.connect(db_key)
        c = conn.cursor()
        c.execute(query)
        table = {}
        table["content"] = []
        table["header"] = None
        count = 0
        table["header"] = [description[0] for description in c.description]
        for row in c:
            count += 1
            if count > MAX_ROW_KEPT:
                break
            table["content"].append(row)
        print table
        return jsonify({"status": "success", "data": table})
    return jsonify({"status": "error"})

# manually destruct a database
@app.route('/destruct_temp_db', methods=['POST'])
def destruct_temp_db():
    request_data = request.get_json()
    if "db_key" in request_data:
        os.remove(request_data["db_key"])

def try_infer_datatype(values):
    
    def infer_one(val):
        try:
            int(val)
            return "INTEGER"
        except:
            pass
        try:
            float(val)
            return "REAL"
        except ValueError:
            pass
        return "TEXT"

    is_int = True
    for v in values:
        ty = infer_one(v)
        if  ty == "TEXT":
            return "TEXT"
        elif ty == "REAL":
            is_int = False

    if is_int:
        return "INTEGER"
    return "REAL"

if __name__ == '__main__':
    print try_infer_datatype(["1s", "2", "3"])

