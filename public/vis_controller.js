import React from 'react';
import ReactDOM from 'react-dom';
import * as FlexmonsterReact from 'react-flexmonster';



class VisController {
  constructor(el, vis) {
    this.vis = vis;
    this.el = el;

    this.container = document.createElement('div');
    this.container.className = 'myvis-container-div';
	this.container.style = "width:100%;";
    this.el.appendChild(this.container);
    //this.vis.params.decimalSize = "2";
	if ( ! this.vis.getUiState()._mergedState.showGrandTotals) {
		this.vis.params.tColumnChecked = true;
	    this.vis.params.tRowChecked = true;
	}

  }

  destroy() {
    this.el.innerHTML = '';
  }


  render(visData, status) {
    this.container.innerHTML = '';
    //console.log(visData);



    var columnsId =[];
    var columnsName =[];
    var flexTable = [];
	  var flexRow = [{ uniqueName: "[Measures]" }];
	  var flexColumn = [];
	  var flexMeasures = [];


	var tColumnChecked = this.vis.params.tColumnChecked;
	var tRowChecked = this.vis.params.tRowChecked;
  var decimalPlaces = this.vis.params.decimalSize;
	this.showGrandTotals = (tColumnChecked && tRowChecked)?"true":(tColumnChecked?"columns":(tRowChecked?"rows":"false"));
	this.vis.uiStateVal("showGrandTotals", this.showGrandTotals);
	//console.log(decimalPlaces)
	//console.log(tRowChecked)
	//console.log(showGrandTotals)




    for (var i = 0; i < visData["columns"].length; i++) {
	  var clm = visData["columns"][i]

	  var clmName = getColumnName(clm);
	  if (clmName){
	    columnsId.push(clm["id"]);
	    columnsName.push(clmName);
	  }

	  addMetrics(clm, flexMeasures);
	  addTerms(clm, flexColumn, flexRow);
    }

	addCountMetric(visData, flexRow, flexColumn, flexMeasures);


    console.log(columnsId);
    console.log(columnsName);



	// create pivot table data
    for (var rows = 0; rows < visData["rows"].length; rows++) {
      var tempObj={};
      for (var columns = 0; columns < columnsId.length; columns++) {
	    if(columnsName[columns]) {
           tempObj[columnsName[columns]]=visData["rows"][rows][columnsId[columns]];
		}
      }
      flexTable.push(tempObj);
    }
    //console.log(flexTable);


    // add subcontainer to render pivot table
    const metricDiv = document.createElement("div");
    let output = Math.random();
    metricDiv.id = output;
    metricDiv.style = "width:100%;";
    this.container.appendChild(metricDiv);


	// prepare flexmonster report
	const report = {
		dataSource: {
			data: flexTable
		},
		options: {
      showAggregationLabels: false,
			grid: {
				showGrandTotals: this.showGrandTotals
			}
        }
		,
		formats: [
			{
				name: "",
				thousandsSeparator: ".",
				decimalSeparator: ",",
				//maxDecimalPlaces: 0,
        decimalPlaces: decimalPlaces
			}
		],
	    slice: {
			rows: flexRow,
			columns: flexColumn,
			measures: flexMeasures
		}
	}


	// render flexmonster pivot table
	if (flexColumn.length > 0 || flexRow.length > 1) { // flexRow.0 holds [Measures] ,  skip that
		ReactDOM.render(
			<FlexmonsterReact.Pivot width="100%"   componentFolder="https://cdn.flexmonster.com/"  report={report} />,
			//<FlexmonsterReact.Pivot width="100%"   report={report} licenseKey="Z71P-XAB43Y-0F680Y-6O4F3E" />,
			document.getElementById(output)
		);
    }else{
	    ReactDOM.render("Please add slices to draw pivot table", document.getElementById(output))
	}

  }
};

function getColumnName(clm){
   if (clm.aggConfig.params && clm.aggConfig.params.customLabel){
     return clm.aggConfig.params.customLabel;
   }else if (clm.aggConfig._opts.params && clm.aggConfig._opts.params.field){
     return clm.aggConfig._opts.params.field;
   }
}

function getColumnSort(clm){
   if (clm.aggConfig._opts.params && clm.aggConfig._opts.params.orderBy == "_key"){
     return clm.aggConfig._opts.params.order;
   }else{
     return "unsorted";
   }
}

function addMetrics(clm, measures){
	if (clm.aggConfig._opts.type == "avg"){
		var tempObj={};
		tempObj.uniqueName=getColumnName(clm)
		tempObj.aggregation="average"
		measures.push(tempObj);
	}
	if (clm.aggConfig._opts.type == "sum"){
		var tempObj={};
		tempObj.uniqueName=getColumnName(clm)
		tempObj.aggregation="sum"
		measures.push(tempObj);
	}
}

// ad hoc solution for count metric because kibana does not allow field selection for count metric but flexmonster requires that.
// find first row or column to add count metric
function addCountMetric(visData, flexRow, flexColumn, flexMeasures){
   for (var i = 0; i < visData["columns"].length; i++) {
	   var clm = visData["columns"][i];
	   var tempObj={};
	   tempObj.aggregation="count";
	   if (clm.aggConfig._opts.type == "count" && flexRow && flexRow.length > 1){ // flexRow.0 keeps special [Measures] ,  skip that
			tempObj.uniqueName=flexRow[1].uniqueName;
			flexMeasures.push(tempObj);
	   }else if (clm.aggConfig._opts.type == "count" && flexColumn && flexColumn.length > 0){
			tempObj.uniqueName=flexColumn[0].uniqueName;
			flexMeasures.push(tempObj);
	   }

    }
}

function addTerms(clm, flexColumn, flexRow){
    if (clm.aggConfig.__schema.name == "column"){
        var tempObj={};
		tempObj.uniqueName=getColumnName(clm);
		tempObj.sort=getColumnSort(clm);
		flexColumn.push(tempObj);
	}
    if (clm.aggConfig.__schema.name == "row"){
        var tempObj={};
		tempObj.uniqueName=getColumnName(clm);
		tempObj.sort=getColumnSort(clm);
		flexRow.push(tempObj);
	  }
}

export { VisController };
