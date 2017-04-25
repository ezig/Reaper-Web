# Main api routes for frontend

import os
import local_subprocess32
from local_subprocess32 import check_output, PIPE, TimeoutExpired

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
    query = request.form.get('query')
    target_db = request.form.get('database')

# Synthesizer api call
@app.route('/scythe', methods = ['POST'])
def synthesize():

    request_data = request.get_json()

    if not "example" in request_data:
        return jsonify({
            "status": "error",
            "message": "Wrong data format."
        })

    example = request_data['example']
    text_file = open("tmp", "w+")
    text_file.write(example)
    text_file.close()

    try:
        output = check_output(['java', '-jar', 'Scythe.jar', 'tmp', 'StagedEnumerator', '-aggr'], 
                                stdin=PIPE, stderr=PIPE, timeout=synthesizer_time_limit)
    
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
        return jsonify({
            "status": "success",
            "queries": queries
        })
    except TimeoutExpired:
        return jsonify({
            "status": "error",
            "message": "Timeout (" + str(synthesizer_time_limit) + " seconds)"
        })
