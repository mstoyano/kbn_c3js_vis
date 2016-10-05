import uiModules from 'ui/modules';
import AggResponseTabifyTabifyProvider from 'ui/agg_response/tabify/tabify';
import errors from 'ui/errors';	

// get the kibana/table_vis module, and make sure that it requires the "kibana" module if it
// didn't already
const module = uiModules.get('kibana/c3_vis', ['kibana']);

const c3 = require('c3');

module.controller('KbnC3VisController', function($scope, $element, Private){

	var previo_zoom = false;
	var hold ="";
    var wold= "";

	$scope.$watchMulti([
		'vis.params.editorPanel',
		'vis.params.enableZoom'
		], function (html) {
    		if (Object.keys(html[0]).length === 0 && html[1] == previo_zoom || !$scope.show_chart) return;
    		previo_zoom = html[1];
    		$scope.chartGen();
  	});

	const tabifyAggResponse = Private(AggResponseTabifyTabifyProvider);
	$scope.$root.editorParams = {};
	var x_axis_values = [];
	var parsed_data = [];
	var chart_labels = {};
	var idchart = $element.children().find(".chartc3");
	const message = 'This chart require more than one data point. Try adding an X-Axis Aggregation.';
	

	// C3JS chart generator!
	$scope.chart = null;
	$scope.chartGen = function(){

		$scope.show_chart = true;
		var config = {};
		config.bindto = idchart[0];
		config.data = {};
		config.data.types = $scope.vis.params.editorPanel.types;
		config.data.colors = $scope.vis.params.editorPanel.colors;
		config.data.columns = parsed_data;
		config.axis = {"x": {"type":"category", "categories": x_axis_values[0]}};
		config.zoom = {"enabled" : $scope.vis.params.enableZoom};
		$scope.chart = c3.generate(config);
		var elem = $(idchart[0]).closest('div.visualize-chart');
        var h = elem.height();
        var w = elem.width();
        $scope.chart.resize({height: h - 50, width: w - 50});


	};


	// Get data from ES
	$scope.processTableGroups = function (tableGroups) {
    	tableGroups.tables.forEach(function (table) {
      		table.columns.forEach(function (column, i) {
      			var data = table.rows;
      			var tmp = [];

      			for (var val in data){
      				tmp.push(data[val][i]);
      			}

      			if (i > 0){
      				chart_labels[column.title] = column.title;
      				tmp.splice(0, 0, column.title);
      				parsed_data.push(tmp);
				} else {
					x_axis_values.push(tmp);
				}

      		});
    	});

    	$scope.$root.editorParams.label = chart_labels;
  	};
	
	$scope.$watch('esResponse', function(resp){
		if (resp) {
			if (!$scope.vis.aggs.bySchemaName['buckets']){
				$scope.waiting = message;
				return;
			}
			x_axis_values.length = 0;
			parsed_data.length = 0;
			chart_labels = {};
      		$scope.processTableGroups(tabifyAggResponse($scope.vis, resp));
      		$scope.chartGen();

		}
    		
	});

	// Automatic resizing of graphics
    $scope.$watch(
    	function () {
	   		var elem = $(idchart[0]).closest('div.visualize-chart');
           	var h = elem.height();
           	var w = elem.width();
           	if (!$scope.chart) return;
	   		if (idchart.length > 0 && h > 0 && w > 0) {
		   		if (hold != h || wold != w) {
	            	$scope.chart.resize({height: h - 50, width: w - 50});
           	 		hold = elem.height();
	          	 	wold = elem.width();
		   		}
           	}      
        }, 
        true
    );

});


