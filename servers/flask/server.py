"""
 * KingTable 2.0.0 Flask development server
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
"""
import os
import json
from flask import Flask, request, render_template, make_response
from bll.collectionmanager import CollectionManager

# set the project root directory as the static folder, you can set others.
root_dir = os.path.dirname(os.getcwd())
rel = os.path.join(root_dir, "..", "httpdocs")
pat = os.path.abspath(rel)
app = Flask(__name__, static_folder=pat)

# set debug to true (this is useful while developing client side code because it gives hot refresh of server)
# however, set it to false when you desire to debug Python code in PyCharm!
app.debug = True
PORT = 44555

LightsManager = CollectionManager("lights.json")
LightsManager2 = CollectionManager("lights2.json")

#   {{ resources("sharedjs")|safe }}
plain_text = {"Content-Type": "text/plain"}
json_type = {"Content-Type": "application/json"}
bad_request = ("Bad Request", 400, plain_text)


class MissingFilters(Exception):
    pass


def normalize_query_string_args(data):
    if "sortBy" in data:
        # sortBy must be converted to an array; or a string
        pass

    return data


def get_filters_data(req):
    data = req.get_json()
    if data is None:
        # maybe the client is sending data through query string?
        qs = req.args
        if qs:
            # client is using query string
            data = normalize_query_string_args(qs.to_dict())
        else:
            raise MissingFilters
    return data


def get_json_response(data):
    res = make_response(json.dumps(data, indent=4))
    res.mimetype = "application/json"
    max_age = 60*15
    res.headers.add("Cache-Control", "max-age=%s" % max_age)
    return res

@app.route("/")
def root():
    return render_template("rhtml-lights.html")

@app.route("/lights")
def lightspage():
    return render_template("rhtml-lights.html")

@app.route("/lights2")
def lights2page():
    return render_template("rhtml-lights2.html")

@app.route("/api/lights", methods=["OPTIONS", "GET", "POST"])
def lights():
    # get the input data from the client:
    try:
        data = get_filters_data(request)
    except MissingFilters:
        return "Missing filters data.", 400, {"Content-Type": "text/plain"}
    result = LightsManager.get_catalog(data)
    return get_json_response(result)

@app.route("/api/lights2", methods=["OPTIONS", "GET", "POST"])
def lights2():
    # get the input data from the client:
    try:
        data = get_filters_data(request)
    except MissingFilters:
        return "Missing filters data.", 400, {"Content-Type": "text/plain"}
    result = LightsManager2.get_catalog(data)
    return get_json_response(result)


@app.route("/<path:path>")
def static_proxy(path):
    return app.send_static_file(path)


if __name__ == "__main__":
    # send_static_file will guess the correct MIME type
    print("...serving static files from: {}".format(pat))
    app.run(host='0.0.0.0', port=PORT, threaded=True)
