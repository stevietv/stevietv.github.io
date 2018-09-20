// Event listeners
$('#manual').click(function() {
  $('#manual-drop').toggleClass("fa-chevron-down fa-chevron-up");
});

$('#map').click(function() {
  $('#map').select();
});

//Calculate Route
$('#mapBtn').click(function() {
  //Refresh waypoints
  coordFind();

  //Define start and end points
  var start = waypts[0].location;
  var end   = waypts[waypts.length - 1].location;

  //Remove Start and End from waypoints array
  waypts.splice(0, 1);
  waypts.splice((waypts.length - 1), 1);

  //Assign auto-optimise boolean variable
  var optimal = $('#optimal').prop('checked') 
  //Develop route request to send to Google
  var request = {
    origin:            start,
    destination:       end,
    waypoints:         waypts,
    optimizeWaypoints: optimal,
    travelMode:        google.maps.TravelMode.DRIVING
  };

  //Get route from Google and update map
  directionsService.route(request, function(response, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      directionsDisplay.setDirections(response);
      var optOrder = response.routes[0].waypoint_order;

      //Generate map URL
      var mapURL = "http://maps.google.com/maps/dir/" + start.toUrlValue() + "/";

      if ((optimal) && (optOrder.length > 0)) {
        for (var i = 0; i < optOrder.length; i++) {
          var waypt = waypts[optOrder[i]].location;
          waypt     = waypt.toUrlValue();
          mapURL    = mapURL + waypt + "/";
        }
        mapURL += end.toUrlValue() + "/";
        $('#map').val(mapURL);
        successMap();
      } else {
        for (var i = 0; i < waypts.length; i++) {
          var waypt = waypts[i].location;
          waypt     = waypt.toUrlValue();
          mapURL    = mapURL + waypt + "/";
        }
        mapURL = mapURL + end.toUrlValue() + "/";
        $('#map').val(mapURL);
        successMap();
      }
    }
  });
});

//Open route URL
$('#mapLink').click(function() {
  var map = $('#map').val();
  if (map) {
    var win = window.open(map, '_blank');
    if (win) {
      win.focus();
    } else {
      //Broswer has blocked it
      alert('Please allow popups for this site.');
    }
  }
});

//Extract Coordinates from user input
$('#portals').keyup(function() {
  coordFind();
});

function coordFind() {
  var portalURL  = $('#portals').val();
  var portalURLs = portalURL.split(/\n/);
  var reg        = /(?:http(?:s{0,1}):\/\/www\.ingress\.com\/intel\?ll=)(?:-{0,1})?\d{1,3}(?:.)\d{1,6}(?:,)(?:-{0,1})\d{0,3}(?:(?:.)\d{1,6}){0,1}(?:&z=)\d{1,2}(?:(?:&pls=)(?:(?:-{0,1})?\d{1,3}(?:.)\d{1,6}(?:,)(?:-{0,1})\d{0,3}(?:(?:.)\d{1,6})(?:,)(?:-{0,1})?\d{1,3}(?:.)\d{1,6}(?:,)(?:-{0,1})\d{0,3}(?:(?:.)\d{1,6})(?:_)){0,}(?:-{0,1})?\d{1,3}(?:.)\d{1,6}(?:,)(?:-{0,1})\d{0,3}(?:(?:.)\d{1,6})(?:,)(?:-{0,1})?\d{1,3}(?:.)\d{1,6}(?:,)(?:-{0,1})\d{0,3}(?:(?:.)\d{1,6})){0,1}(?:&pll=)((?:-{0,1})?\d{1,3}(?:.{0,1})\d{1,6})(?:,)((?:-{0,1})\d{1,3}(?:.)\d{1,6})$/;
  waypts         = [];

  for (var i = 0; i < portalURLs.length; i++) {
    //Only process lines with data
    if (!(portalURLs[i] == '')) {

      //Check url valid
      if (!(reg.test(portalURLs[i]))) {

        //Report invalid input to user
        errorMsg();
        errorMap();
      } else {
        reg.exec(portalURLs[i]);

        //Add to waypoint array
        var coords = new google.maps.LatLng(RegExp.$1, RegExp.$2);
        waypts.push({
          location: coords,
          stopover: true
        });

        //Center map on new portal
        map.setCenter(coords);
        map.setZoom(15);

        //Report valid input to user
        successMsg();
      }
    }
  }
  
  //Revert to invalid if input blank
  if (portalURL === '') {
    errorMsg();
    errorMap();
  }
}

//Report invalid input to user
function errorMsg() {
  $('#map').val('')
  $('#mapBtn').prop("disabled", true);
  $('#mapBtn').removeClass('btn-success').addClass('btn-default');
  $('#portalValid').removeClass('glyphicon-ok').addClass('glyphicon-remove');
  $('#validDiv').removeClass('has-success').addClass('has-error');
}

//Report valid input to user
function successMsg() {
  $('#mapBtn').prop("disabled", false);
  $('#mapBtn').removeClass('btn-default').addClass('btn-success');
  $('#portalValid').removeClass('glyphicon-remove').addClass('glyphicon-ok');
  $('#validDiv').removeClass('has-error').addClass('has-success');
}

//Enable external map link
function successMap() {
  $('#mapLink').prop("disabled", false);
  $('#mapLink').removeClass('btn-default').addClass('btn-success');
}

//Disable external map link
function errorMap() {
  $('#mapLink').prop("disabled", true);
  $('#mapLink').removeClass('btn-success').addClass('btn-default');
}

//Map initialisation
var map; //Global map object
var directionsDisplay;
var waypts            = []; //Global waypoints array
var directionsService = new google.maps.DirectionsService();

function initialize() {
  directionsDisplay = new google.maps.DirectionsRenderer();
  var mapOptions = {
    zoom:   2,
    center: new google.maps.LatLng(0, 0)
  };
  map = new google.maps.Map($('#map-canvas')[0], mapOptions);
  directionsDisplay.setMap(map);
}

//Load map
google.maps.event.addDomListener(window, 'load', initialize);
