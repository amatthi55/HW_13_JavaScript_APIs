from flask import Flask, render_template, jsonify

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, inspect

import pandas as pd

engine = create_engine("sqlite:///belly_button_biodiversity.sqlite")

Base = automap_base()

Base.prepare(engine, reflect=True)

Samples = Base.classes.samples



app = Flask(__name__)


@app.route("/")
def echo():
    
    return render_template("index.html")

@app.route("/names")
def names():
    
    inspector = inspect(engine)

    sample_names = inspector.get_columns('samples')

    sample_return = []

    for name in sample_names[1:154]:
        sample_return.append(name["name"])


    return jsonify(sample_return)

@app.route("/otu")
def otu():

    Otu = Base.classes.otu

    session = Session(engine)


    return_otu = []

    Otu_names = session.query(Otu.lowest_taxonomic_unit_found).all()

    for element in Otu_names:
        return_otu.append(element[0])
    
    return jsonify(return_otu)


@app.route('/metadata/<sample>')
def meta(sample):

    Meta = Base.classes.samples_metadata

    session = Session(engine)

    id = sample[3:]

    query = session.query(Meta).filter(Meta.SAMPLEID == id)

    row = query.first()

    return_meta = [ {
        'AGE': int(row.AGE),
        'BBTYPE': row.BBTYPE,
        'ETHNICITY': row.ETHNICITY,
        'GENDER': row.GENDER,
        'LOCATION': row.LOCATION,
        'SAMPLEID': int(row.SAMPLEID)
    }]


    return jsonify(return_meta)    

@app.route('/wfreq/<sample>')
def wf(sample):

    Meta = Base.classes.samples_metadata

    session = Session(engine)

    id = sample[3:]

    query = session.query(Meta).filter(Meta.SAMPLEID == id)

    row = query.first()

    return_wash = [ int(row.WFREQ)]



    return jsonify(return_wash) 


@app.route('/samples/<sample>')
def samples(sample):

    Samples = Base.classes.samples

    session = Session(engine)

    sampleid = sample 

    filterobject = getattr(Samples, sampleid)

    query = session.query(Samples).filter(filterobject != 0)

    otu_ids = []
    sample_values = []


    for element in query.all():
        filterobject2 = getattr(element, sampleid)
        sample_values.append(filterobject2)
        otu_ids.append(element.otu_id)
        
    sample_DF = pd.DataFrame({"otu_ids":otu_ids, "sample_values":sample_values})

    sample_DF = sample_DF.sort_values("sample_values", ascending = False)

    return_dict = {"otu_ids":sample_DF["otu_ids"].tolist(),"sample_values": sample_DF["sample_values"].tolist() }

    return jsonify([return_dict])


if __name__ == "__main__":
    app.run(debug=True)
