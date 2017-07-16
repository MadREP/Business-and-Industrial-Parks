/* Script by David J. Waro */

function initialize(){
	createMap();
	$("#right-panel").hide();
};

var map;
var titleLength;

// function to create the map
function createMap() {
	map = L.map('mapid', {
		center: [43.12, -89.3],
		maxBounds: [ [39, -100], [50, -80] ],
		zoom: 8
	});

	// base tile layer
  var basemap = L.tileLayer('http://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png', {
		maxZoom: 16,
		minZoom: 7,
		attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
	}).addTo(map);

	var Hydda_Full = L.tileLayer('http://{s}.tile.openstreetmap.se/hydda/full/{z}/{x}/{y}.png', {
	 maxZoom: 16,
	 minZoom: 7,
	 attribution: 'Tiles courtesy of <a href="http://openstreetmap.se/" target="_blank">OpenStreetMap Sweden</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
	});

	// var mobile = L.easyButton('fa-mobile fa-2x', function(btn, map) {
	// 		onClick: mobileWindow();
	// }).addTo(map);

// https: also suppported.
// var Esri_WorldStreetMap = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
// 	maxZoom: 16,
// 	minZoom: 7,
// 	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
// }).addTo(map);

	var states = new L.GeoJSON.AJAX("data/usStates.geojson", {style: statesStyle});
	var counties = new L.GeoJSON.AJAX("data/counties.geojson", {style: statesStyle});
	var surroundingArea = new L.GeoJSON.AJAX("data/surrounding_area.geojson", {style: statesStyle});
	var madisonRegion = new L.GeoJSON.AJAX("data/madisonRegion.geojson", {style: countyStyle});

	states.addTo(map);
	counties.addTo(map);
	madisonRegion.addTo(map);
	surroundingArea.addTo(map);

	var counter = 0;

	getData(map);

};

// opens up github sit for fullscreen for mobile
function mobileWindow() {
	window.open('https://madrep.github.io/Business-and-Industrial-Parks/');
};

// styling for non-SW region that is more opaque
function statesStyle() {
		return {
				fillColor: 'gray',
				weight: 2,
				opacity: 1,
				color: 'black',
				fillOpacity: 0.7
		};
};

// styling for non-SW region that is more opaque
function countyStyle() {
		return {
				fillColor: 'gray',
				weight: 2,
				opacity: 1,
				color: 'black',
				fillOpacity: 0
		};
};

// function to create search geocoder and load data
function getData(map) {

	// add navigation bar to the map
	L.control.navbar().addTo(map);

	var arcgisOnline = L.esri.Geocoding.arcgisOnlineProvider();

	var searchControl = L.esri.Geocoding.geosearch({
		position: 'topleft',
		providers: [
			arcgisOnline,
			L.esri.Geocoding.mapServiceProvider({
				label: 'States and Counties',
				url: 'https://sampleserver6.arcgisonline.com/arcgis/rest/services/Census/MapServer',
				layers: [2, 3],
				searchFields: ['NAME', 'STATE_NAME', 'Park_Name']
			})
		]
	}).addTo(map);

	  //load the data
	  $.ajax("data/businessParks.geojson", {
	    dataType: "json",
	    success: function(response){

	      //create an attributes array
	      var attributes = processData(response);

	      //call function to create proportional symbols
	      createSymbols(response, map, attributes);

	    } // close to success
	  }); // close to ajax
};

function processData(data){

	  // empty array to hold attributes
	  var attributes = [];

	  // properties of the first feature in the dataset
	  var properties = data.features[0].properties;

	  // push each attribute name into attributes array
	  for (var attribute in properties){

	    // only take attributes with population values
	    if (attribute.indexOf("Park_Name") != "adsfsa"){
	      attributes.push(attribute);
	    };

	  }; // close to for loop

	  // return the array of attributes that meet the if statement to be pushed
	  return attributes;
};

// add circle markers for point features to the map
function createSymbols(data, map, attributes){

  // create a Leaflet GeoJSON layer and add it to the map
  var locationSymbols = L.geoJson(data, {
    pointToLayer: function(feature, latlng){
      	return pointToLayer(feature, latlng, attributes);
    }
  }).addTo(map);

	// call search funtion
  search(map, data, locationSymbols);

}; // close ot createSymbols

// funtion to create the search control
function search (map, data, locationSymbols){

  // new variable search control
  var searchLayer = new L.Control.Search({
    position: 'topleft',  // positions the operator in the top left of the screen
    layer: locationSymbols,  // use locationSymbols as the layer to search through
    propertyName: 'Park_Name',  // search for country name
    marker: false,
    moveToLocation: function (latlng, title, map) {

      // set the view once searched to the circle marker's latlng and zoom
      map.setView(latlng, 14);

    } // close to moveToLocation
  }); // close to var searchLayer

  // add the control to the map
	$("#search-1").append(searchLayer.onAdd(map));

}; // close to search function

// function to create markers layer
function pointToLayer(feature, latlng, attributes, layer){

  // determine which attribute to visualize with proportional symbols
  var attribute = attributes[0];

  // create marker options for circle marker if I decide to use it
  var options = {
    fillColor: "#C4fdad",
    color: "#000",
    weight: 1,
    opacity: 1,
		radius: 10,
    fillOpacity: 0.7
  };

  // For each feature, determine its value for the selected attribute
  var attValue = feature.properties[attribute];

  // assign the marker with the options styling and using the latlng repsectively
  var layer = L.marker(latlng, options);
	var greenIcon;
	var goldIcon;

		if (feature.properties.Park_Name == "Beaver Dam 151 Business Park" ||
				feature.properties.Park_Name == "DeForest Northern Business Park (phase II)" ||
				feature.properties.Park_Name == "State Highway 11 Business Park" ||
				feature.properties.Park_Name == "Gateway Business Park" ||
				feature.properties.Park_Name == "RDC Techlands" ||
				feature.properties.Park_Name == "Liberty Business Park" ||
				feature.properties.Park_Name == "Whitewater University Technology Park" ||
				feature.properties.Park_Name == "North Mendota Energy and Tech. Park") {

			greenIcon = L.icon({
					iconUrl: 'lib/images/green-marker.png',
					shadowUrl:   'lib/images/marker-shadow.png',
					iconSize:    [25, 41],
					iconAnchor:  [12, 41],
					popupAnchor: [1, -34]
			});

			layer = L.marker(latlng, {icon: greenIcon}, options);
		};

		if (feature.properties.Certified_Site == "Gold Shovel") {

			goldIcon = L.icon({
					iconUrl: 'lib/images/gold-marker.png',
					shadowUrl:   'lib/images/marker-shadow.png',
					iconSize:    [25, 41],
					iconAnchor:  [12, 41],
					popupAnchor: [1, -34]
			});

			layer = L.marker(latlng, {icon: goldIcon}, options);
		};

  // panel content string starting with country
  var parkTitle = "<h2><b>" + feature.properties.Park_Name + "</b></h2></p>";

	var panelContent = "<p><b>Community</b>: " + feature.properties.Community_Name + "</p>";
			panelContent += "<p><b>County:</b> " + feature.properties.County + "</p>"
			panelContent += "<p><b>Total Acreage:</b> " + feature.properties.Total_Acreage + "</p>";
			panelContent += "<p><b>Available Acreage:</b> " + feature.properties.Available_Acreage + "</p>";
			panelContent += "<p><b>Purchase Price:</b> " +
												feature.properties.Purchase_Price + "</p>";
			panelContent += "<p><b>Ownership:</b> " + feature.properties.Ownership + "</p>";
			panelContent += "<p><b>TIF District:</b> " + feature.properties.TIF_District + "</p>";
			panelContent += "<p><b>Min. Lot Size (Acres):</b> " + feature.properties.min_lot_size + "</p>";
			panelContent += "<p><b>Max Contiguous Acreage:</b> " + feature.properties.max_contiguous_acreage + "</p>";
			panelContent += "<p><b>Zoning:</b> " + feature.properties.Zoning + "</p>";
			panelContent += "<p><b>Certified Site?</b> " + feature.properties.Certified_Site + "</p>";

			if (feature.properties.Certified_By !== "N/A") {
				panelContent += "<p><b>Certified by:</b> " + feature.properties.Certified_By + "</p>";
			}

			panelContent += "<p><b>Site Contact:</b> " + feature.properties.Contact + "</p>";
			panelContent += "<p><b>Phone:</b> " + feature.properties.Phone + "</p>";
			panelContent += "<p><b>Email:</b> " + feature.properties.Email + "</p>";

	var website = document.createElement("img");
    website.setAttribute("height", "40");
    website.setAttribute("width", "140");

	website.src = 'img/website-out.png';

	$('#website').on({
		mouseover: function(){
			website.src = 'img/website-over.png';
		},
		mouseout: function(){
      website.src = 'img/website-out.png';
    }
	});

	// variable to hold the hyperlink for the websites
  	var href = feature.properties.Website_url;

	if (href !== 'No Website') {
		website.onclick = function() {
    		window.open(feature.properties.Website_url, '_blank');
  		}
	}

  // creates a new popup object
  var popup = new Popup(feature.properties, layer, options.radius);

  // add popup to circle marker
  popup.bindToLayer();

	$("#section-1").on('click', function(){
		map.addLayer(layer);
		if (feature.properties.Certified_Site !== "Yes") {
			layer.remove();
		};

		$('#search').css('left', '315px');
		$('#refresh-background').css('left', '555px');
		$('#cert').css('display', 'block');
		$("#gold").css('display', 'none');
		$("#shovel").css('display', 'none');
		$("#rail-access").css('display', 'none');
		$("#tif-district").css('display', 'none');
		$("#dropdown-counties").css('display', 'none');
		$("#dropdown-sizes").css('display', 'none');
		$("#filter").css("width", "265px");

	});

	$("#section-2").on('click', function(){
		map.addLayer(layer);
		if (feature.properties.Certified_Site !== "Gold Shovel") {
			layer.remove();
		};

		$('#search').css('left', '315px');
		$('#refresh-background').css('left', '555px');
		$('#gold').css('display', 'block');
		$("#cert").css('display', 'none');
		$("#shovel").css('display', 'none');
		$("#rail-access").css('display', 'none');
		$("#tif-district").css('display', 'none');
		$("#dropdown-counties").css('display', 'none');
		$("#dropdown-sizes").css('display', 'none');
		$("#filter").css("width", "265px");

	});

	$("#section-3").on('click', function(){
		map.addLayer(layer);
		if (feature.properties.Certified_Site == "Yes" || feature.properties.Certified_Site == "Gold Shovel") {
			layer.remove();
		};

		$('#search').css('left', '315px');
		$('#refresh-background').css('left', '555px');
		$('#shovel').css('display', 'block');
		$("#gold").css('display', 'none');
		$("#cert").css('display', 'none');
		$("#rail-access").css('display', 'none');
		$("#tif-district").css('display', 'none');
		$("#dropdown-counties").css('display', 'none');
		$("#dropdown-sizes").css('display', 'none');
		$("#filter").css("width", "265px");

	});

	$("#refresh").on('click', function() {
		map.addLayer(layer);

		$('#search').css('left', '170px');
		$('#refresh-background').css('left', '410px');
		$("#tif-district").css('display', 'none');
		$("#rail-access").css('display', 'none');
		$("#dropdown-counties").css('display', 'none');
		$("#dropdown-sizes").css('display', 'none');
		$("#gold").css('display', 'none');
		$("#cert").css('display', 'none');
		$("#shovel").css('display', 'none');
		$("#filter").css("width", "120px");
	});

	$("#county").on('click', function() {

		$('#search').css('left', '315px');
		$('#refresh-background').css('left', '555px');
		$("#dropdown-sizes").css("display", "none");
		$("#tif-district").css('display', 'none');
		$("#rail-access").css('display', 'none');
		$("#filter").css("width", "265px")
		$("#dropdown-counties").css("display", "block");
		$("#gold").css('display', 'none');
		$("#cert").css('display', 'none');
		$("#shovel").css('display', 'none');

	});

	$("#min-lot-size").on('click', function() {

		$('#search').css('left', '315px');
		$('#refresh-background').css('left', '555px');
		$("#dropdown-sizes").css("display", "block");
		$("#dropdown-counties").css("display", "none");
		$("#tif-district").css('display', 'none');
		$("#rail-access").css('display', 'none');
		$("#gold").css('display', 'none');
		$("#cert").css('display', 'none');
		$("#shovel").css('display', 'none');
		$("#filter").css("width", "265px");

	});

	$("#Columbia").on('click', function() {
		map.addLayer(layer);
		if (feature.properties.County !== "Columbia") {
			layer.remove();
		};
	});

	$("#Dane").on('click', function() {
		map.addLayer(layer);
		if (feature.properties.County !== "Dane") {
			layer.remove();
		};
	});

	$("#Dodge").on('click', function() {
		map.addLayer(layer);
		if (feature.properties.County !== "Dodge") {
			layer.remove();
		};
	});

	$("#Iowa").on('click', function() {
		map.addLayer(layer);
		if (feature.properties.County !== "Iowa") {
			layer.remove();
		};
	});

	$("#Green").on('click', function() {
		map.addLayer(layer);
		if (feature.properties.County !== "Green") {
			layer.remove();
		};
	});

	$("#Jefferson").on('click', function() {
		map.addLayer(layer);
		if (feature.properties.County !== "Jefferson") {
			layer.remove();
		};
	});

	$("#Rock").on('click', function() {
		map.addLayer(layer);
		if (feature.properties.County !== "Rock") {
			layer.remove();
		};
	});

	$("#Sauk").on('click', function() {
		map.addLayer(layer);
		if (feature.properties.County !== "Sauk") {
			layer.remove();
		};
	});

	$("#rail").on('click', function() {

		$('#search').css('left', '315px');
		$('#refresh-background').css('left', '555px');
		$("#rail-access").css('display', 'block');
		$("#tif-district").css('display', 'none');
		$("#dropdown-counties").css('display', 'none');
		$("#dropdown-sizes").css('display', 'none');
		$("#gold").css('display', 'none');
		$("#cert").css('display', 'none');
		$("#shovel").css('display', 'none');
		$("#filter").css("width", "265px");

		map.addLayer(layer);
		if (feature.properties.Rail_Access !== "Yes") {
			layer.remove();
		};
	});

	$("#tif").on('click', function() {

		$('#search').css('left', '315px');
		$('#refresh-background').css('left', '555px');
		$("#tif-district").css('display', 'block');
		$("#rail-access").css('display', 'none');
		$("#dropdown-counties").css('display', 'none');
		$("#dropdown-sizes").css('display', 'none');
		$("#gold").css('display', 'none');
		$("#cert").css('display', 'none');
		$("#shovel").css('display', 'none');
		$("#filter").css("width", "265px");

		map.addLayer(layer);
		if (feature.properties.TIF_area !== "Yes") {
			layer.remove();
		};
	});

	$("#break-1").on('click', function() {
		map.addLayer(layer);
		if (feature.properties.smallest_lot > 0.5) {
			layer.remove();
		};
	});

	$("#break-2").on('click', function() {
		map.addLayer(layer);
		if (feature.properties.smallest_lot > 1 || feature.properties.smallest_lot <= 0.5) {
			layer.remove();
		};
	});

	$("#break-3").on('click', function() {
		map.addLayer(layer);
		if (feature.properties.smallest_lot > 2 || feature.properties.smallest_lot <= 1) {
			layer.remove();
		};
	});

	$("#break-4").on('click', function() {
		map.addLayer(layer);
		if (feature.properties.smallest_lot > 5 || feature.properties.smallest_lot <= 2) {
			layer.remove();
		};
	});

	$("#break-5").on('click', function() {
		map.addLayer(layer);
		if (feature.properties.smallest_lot <= 5) {
			layer.remove();
		};
	});

	$("#close").on('click', function() {
		$("#right-panel").css("display", "none");
	});

  // event listeners to open popup on hover
  layer.on({
    mouseover: function(){
      this.openPopup();
    },
    mouseout: function(){
      this.closePopup();
    },
    click: function(e) {
			clickZoom(e);
			$("#right-panel").show();
      		$("#park-title").html(parkTitle);
			$("#website").html(website);
			//$("#website").css('display', 'block')
			$("#sectional").html(panelContent);

			console.log(parkTitle.length);

			titleLength = parkTitle.length;

			if (parkTitle.length < 43 && parkTitle.length >= 36) {
				$("#website").css("top", "110px");
				$("#sectional").css("top", "145px");
			} else if (parkTitle.length < 36) {
				$("#website").css("top", "85px");
				$("#sectional").css("top", "120px");
			} else if (parkTitle.length > 55) {
				$("#website").css("top", "145px");
				$("#sectional").css("top", "180px");
			} else {
				$("#website").css("top", "115px");
				$("#sectional").css("top", "150px");
			};

			if ($(window).width() < 600) {

    			$('#right-panel').css({
      				'width': '70%'
    			});
    			$('#website').css({
    				'left': '31%'
    			});
    			$('#sectional p').css({
    				'font-size': '13px'
    			});

				if (parkTitle.length < 43 && parkTitle.length >= 36) {
					$("#website").css("top", "75px");
					$("#sectional").css("top", "110px");
				} else if (parkTitle.length < 36) {
					$("#website").css("top", "70px");
					$("#sectional").css("top", "105px");
				} else if (parkTitle.length > 55) {
					$("#website").css("top", "100px");
					$("#sectional").css("top", "135px");
				} else {
					$("#website").css("top", "90px");
					$("#sectional").css("top", "125px");
				};

			};
    }
  });

  // return the circle marker to the L.geoJson pointToLayer option
  return layer;

}; // close to pointToLayer function

// reset maps view on click
function clickZoom(e) {
	if (map.getZoom() < 13) {
		console.log(e.target.getLatLng());
		map.flyTo(e.target.getLatLng(), 13, 0.5);
	} else {
		map.flyTo(e.target.getLatLng(), map.getZoom(), 0.5);
	}
};

// OOM Popup constructor function
function Popup(properties, layer, radius){

  // creating the Popup object that can then be used more universally
  this.properties = properties;
  this.layer = layer;
  this.content = "<p><b>Site:</b> " + this.properties.Park_Name + "</p>";

  this.bindToLayer = function(){
    this.layer.bindPopup(this.content, {
      offset: new L.Point(0,-radius + 5),
      closeButton: false
    });
  }; // close to bindToLayer
}; // close to Popup function

window.onload = function() {
	Sizing();
};

$(window).resize(function() {
	Sizing();
});


function Sizing() {

  if ($(window).width() < 600) {

  	if (titleLength < 43 && titleLength >= 36) {
					$("#website").css("top", "75px");
					$("#sectional").css("top", "110px");
				} else if (titleLength < 36) {
					$("#website").css("top", "70px");
					$("#sectional").css("top", "105px");
				} else if (titleLength > 55) {
					$("#website").css("top", "100px");
					$("#sectional").css("top", "135px");
				} else {
					$("#website").css("top", "90px");
					$("#sectional").css("top", "125px");
				};

	$('#close').css({
		'position': 'fixed',
		'left': '77%',
		'top': '56%'
	});
    $('#right-panel').css({
    	'right': '15%',
    	'top': '55%',
    	'height': '32%',
    	'width': '70%',
    	'border-right': 'solid',
    	'border-width': '3.5px',
    	'border-color': 'black'
    });
    $('#website').css({
    	'left': '31%'
    });
    $('#sectional p').css({
    	'font-size': '13px'
    });
    $('#legend').css({
    	'height': '30px',
    	'width': '365px'
    });
    $('#section-1').css({
    	'top': '2px',
    	'left': '-10px',
    	'font-size': '13px'
    });
    $('#section-2').css({
    	'top': '2px',
    	'left': '90px',
    	'font-size': '13px'
    });
    $('#section-3').css({
    	'top': '2px',
    	'left': '210px',
    	'font-size': '13px'
    });
    $('#certified-rect').css({
    	'left': '20px'
    });
    $('#gold-shovel-rect').css({
    	'left': '20px'
    });
    $('#regular-rect').css({
    	'left': '20px'
    });
    // $('#filter').css({
    // 	'width': '80px',
    // 	'height': '25px',
    // 	'left': '50px',
    // 	'text-indent': '10px',
    // 	'line-height': '25px',
    // 	'font-size': '13px'
    // });
  } else {

  	if (titleLength < 43 && titleLength >= 36) {
				$("#website").css("top", "110px");
				$("#sectional").css("top", "145px");
			} else if (titleLength < 36) {
				$("#website").css("top", "85px");
				$("#sectional").css("top", "120px");
			} else if (titleLength > 55) {
				$("#website").css("top", "145px");
				$("#sectional").css("top", "180px");
			} else {
				$("#website").css("top", "115px");
				$("#sectional").css("top", "150px");
			};
	$('#close').css({
		'position': 'absolute',
		'left': '5px',
		'top': '5px'
	});
    $('#right-panel').css({
     	'width': '180px',
     	'top': '15%',
     	'right': '0px',
    	'height': '70%',
    	'border-right': 'none'
    });
    $('#website').css({
    	'left': '25px'
    });
    $('#sectional p').css({
    	'font-size': '15px'
    });
    $('#legend').css({
    	'height': '86px',
    	'width': '175px'
    });
    $('#section-1').css({
    	'top': '0px',
    	'left': '0px',
    	'font-size': '15px'
    });
    $('#section-2').css({
    	'top': '30px',
    	'left': '0px',
    	'font-size': '15px'
    });
    $('#section-3').css({
    	'top': '60px',
    	'left': '0px',
    	'font-size': '15px'
    });
    $('#certified-rect').css({
    	'left': '9px'
    });
    $('#gold-shovel-rect').css({
    	'left': '9px'
    });
    $('#regular-rect').css({
    	'left': '9px'
    });
    // $('#filter').css({
    // 	'width': '120px',
    // 	'height': '43px',
    // 	'left': '70px',
    // 	'text-indent': '15.1px',
    // 	'line-height': '44px',
    // 	'font-size': '16px'
    // });
  } 
};

$(document).ready(initialize);
