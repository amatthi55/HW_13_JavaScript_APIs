
//These vars are for making json get requests
var xmlhttp = new XMLHttpRequest();
var url = "http://127.0.0.1:5000/";

var first_charts;


//This function is used to make json get requests

xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        var myArr = JSON.parse(this.responseText);
        myFunction(myArr);
    }
};

xmlhttp.open("GET", url + 'names', true);
xmlhttp.send();


//The below function is the used to fill in the select tag with the id names.
//The function also builds alls of the charts and the sample data table when the webpage 
//is first loaded.


function myFunction(arr) {
    var out = "";
    var i;
    for(i = 0; i < arr.length; i++) {
        out += '<option id =' + arr[i]+'>' + arr[i] + '</option>';
    }
    document.getElementById("selDataset").innerHTML = out;
    first_charts = document.getElementById("BB_940").textContent;
    build_charts(first_charts);
}

//This function build all of the charts and the sample data table whenever a new sample id
//is chosen.

function build_charts(id) {

    var pie_values_10;
    var pie_values;
    var pie_ids_10;
    var pie_ids;
    var pie_labels = [];

    Plotly.d3.json(url +'samples/' +id, function(error, response) {
        pie_values_10 = response[0].sample_values.slice(0 , 10)
        pie_values = response[0].sample_values
        pie_ids_10 = response[0].otu_ids.slice(0 , 10)
        pie_ids = response[0].otu_ids
    });



    Plotly.d3.json(url +'otu', function(error, response) {
       
        //Pie chart
       
        var i;

        for (i = 0; i < pie_ids_10.length; i++) { 
        pie_labels.push(response[pie_ids_10[i] - 1]);
        }; 
               
        var trace1 = {
            type: "pie",
            name: "OTU Samples",
            values: pie_values_10,
            labels: pie_labels,
        };

        var data = [trace1];

        var layout = {
            title: "Top 10 OTU Sample Values for " + id,
            height: 700,
            width: 700,
            legend: {
                x: 0,
                y: -5,
                orientation: 'h',
                }
        }
        

        Plotly.newPlot("pie", data, layout);
    
        
        //Bubble Plot

        var trace1 = {
            x: pie_ids,
            y: pie_values,
            mode: 'markers',
            marker: {
                size: pie_values,
                colorscale : "Rainbow",
                color : pie_ids

            }
        };
            
        var data = [trace1];
            
        var layout = {
        title: 'OTU ID # vs. Sample Value for ' + id,
        showlegend: false,
        height: 600,
        width: 1200,
        xaxis: {
            title: 'OTU ID #',
            titlefont: {
                family: 'Courier New, monospace',
                size: 18,
                color: '#7f7f7f'
            }
            },
        yaxis: {
        title: 'Sample Value',
        titlefont: {
            family: 'Courier New, monospace',
            size: 18,
            color: '#7f7f7f'
        }
        }
        
        };
        
        Plotly.newPlot('bubble', data, layout);

    });
            // Sample MetaData table

        sample__ids = ["AGE","BBTYPE","ETHNICITY","GENDER", "LOCATION", "SAMPLEID"];

        xmlhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                var myArr = JSON.parse(this.responseText);
                myFunction(myArr);
            }
        };

        xmlhttp.open("GET", url + 'metadata/' + id, true);
        xmlhttp.send();
        
        function myFunction(arr) {
            var out = "";
            var i;
            for(i = 0; i < sample__ids.length; i++) {
                out = sample__ids[i] + " : " + arr[0][sample__ids[i]];
            
                document.getElementById(sample__ids[i]).innerHTML = out;
            }
        };

// end of build_charts function

};


//function called when new sample id is selected

function optionChanged(id){

 build_charts(id);  
  
};
 
