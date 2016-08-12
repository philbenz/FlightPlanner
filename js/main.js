


$(document).on('ready', function() {
  console.log('sanity check for flight planning!');

  //this function is being used to populate the mapProp object for the map.
  function initialize(location) {

    //split location into two doubles to use good API call
    var latlng = location.split(',');

    var mapProp = {
        center:new google.maps.LatLng(latlng[0], latlng[1]),
        zoom: 11,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      return mapProp;
  }

  //this function is being used to populate the mapProp object for the map.
  $.ajax({
    method: 'GET',
    url: 'https://api.ipify.org'
  }).done(function(results) {
    // pulled this directly from a google response search to pull the location.
    $.get('https://ipinfo.io', function(response) {

    }, 'jsonp').done(function(response) {
      //build out the mapInfo object with the ipinfo result.
      var mapInfo = initialize(response.loc);

      //set the map in index.html
      var map = new google.maps.Map(document.getElementById('googleMap'), mapInfo);
    });
  });

  //Event Listener
  $('#departingAirport').on('change', function() {
    var fromAirport = new Airport($('#departingAirport').val(), 'from');
  });


  $('#arrivingAirport').on('change', function() {
    var toAirport = new Airport($('#arrivingAirport').val(), 'to');
  });


  $('#speed').on('change', function() {
    $('#time').text(getSpeed());
  });

  $('#weatherCheck').on('change', function() {
    setMarker(airportArray);
  });

  $('#totalFuel').on('change', function() {
    if ($('#hourFuel').val() > null) {
      determineFuel();
    }
  });

  $('#hourFuel').on('change', function() {
    if ($('#totalFuel').val() > null) {
      determineFuel();
    }
  });
});



var airportArray = [];

function Airport (name, destination) {

  var self = this;
  if (name) {

    var airport = pullAirportData(name);
    // airport.then(constructAirport.bind(this))
    airport.then(function(data) {

      self.iata = data["response"][0]['code']
      self.name = data["response"][0]['name'];
      self.city = data["response"][0]['city'];
      self.lat = data["response"][0]['lat'];
      self.long = data["response"][0]['lng']
      self.icao = data["response"][0]['icao'];

      airportArray.push(self);

      if(destination === 'from'){
        $('p.departLabel').text(self.name);
        $('p.departLabel').css("color", "blue");
      } else {
        $('p.arrivingLabel').text(self.name);
        $('p.arrivingLabel').css("color", "blue");
      }


      if(airportArray.length > 1) {
        var flight = new FlightPath(airportArray);
      }

      var weather = pullWeatherData(self.icao);

      weather.then(function(info) {

      if(destination === 'from'){
        $('p.departureWeather').text(info['Raw-Report']);
      } else {
        $('p.arrivalWeather').text(info['Raw-Report']);
      }

      });
    });
  }
  else {
    console.log('this is an invalid airport');
  }
}

function FlightPath (airports) {

    this.toAirport = airports[0]['icao'];
    this.fromAirport = airports[1]['icao'];
    this.distance = getDistance(airports);

    //set Markers
    setMarker(airports);

    //set distance
    $('p.distance').text(this.distance);

}


//~~~~~~~~ FLIGHT PATH ~~~~~~~~~
function setMarker(airportArray) {

  var fromLatLng = {lat: airportArray[0]['lat'] , lng: airportArray[0]['long']};

  var toLatLng = {lat: airportArray[1]['lat'] , lng: airportArray[1]['long']};


  var map = new google.maps.Map(document.getElementById('googleMap'), {
    zoom: 5,
    center: fromLatLng
  });

  var fromMarker = new google.maps.Marker({
    position: fromLatLng,
    map: map,
    title: airportArray[0]['name']
  });

  var toMarker = new google.maps.Marker({
    position: toLatLng,
    map: map,
    title: airportArray[1]['name']
  });

  var flightPlanCoordinates = [
  {lat: airportArray[0]['lat'], lng: airportArray[0]['long']},
  {lat: airportArray[1]['lat'], lng: airportArray[1]['long']},
];

var flightPath = new google.maps.Polyline({
  path: flightPlanCoordinates,
  geodesic: true,
  strokeColor: '#FF0000',
  strokeOpacity: 1.0,
  strokeWeight: 2
});

flightPath.setMap(map);

  if ($('#weatherCheck').is(':checked')) {
  var myMapType = new google.maps.ImageMapType({
    getTileUrl: function(coord, zoom) {
      return "http://maps.owm.io:8091/56ce0fcd4376d3010038aaa8/" +
             zoom + "/" + coord.x + "/" + coord.y + "?hash=5";
    },
    tileSize: new google.maps.Size(256, 256),
    maxZoom:20,
    minZoom: 5,
    name: 'mymaptype'
  });

  map.overlayMapTypes.insertAt(0, myMapType);
  }
}

function getDistance(airportList) {

  //modify to  show miles
  var distance = (getDistanceFromLatLonInKm(
    airportList[0]['lat'],
    airportList[0]['long'],
    airportList[1]['lat'],
    airportList[1]['long']
  ) * .62);


  return distance.toFixed(1);
}

function determineFuel() {

  console.log('total fuel: ', $('#totalFuel').val());

  console.log('hour burn: ', $('#hourFuel').val());

  console.log('distance ', $('p.distance').text());

  if ($('#totalFuel').val() * $('#hourFuel').val() < $('p.distance').text()) {
    $('p.distance').css("color", "red");
  }

  return;
}


//--- this was pulled off stack overflow ---
function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1);
  var a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

function getSpeed() {

  var time = ($('p.distance').text()/$('#speed').val()).toFixed(2);


  hour = time |0;
  minutes = Math.ceil((time - hour) * 60);

  return hour + ' hours, ' + minutes + '  minutes'
}



//~~~~~~~~~~ AJAX ~~~~~~~~~~
//get airport data
function pullAirportData(airportName) {

  var link =  "https://iatacodes.org/api/v6/airports?api_key=4a579553-0329-4914-a687-543ef0fc03b0&code=" + airportName;

  return new Promise(function(resolve, reject) {

    $.ajax({
      type: 'GET',
      url: link
    })
    .done(function(data) {
      resolve(data)
    })
    .fail(function(err) {
      reject(err)
    });

  });
}


function pullWeatherData(airportAbbrev) {
  var options = airportAbbrev + '&format=JSON&options=info';

  var link = 'http://avwx.rest/api/metar.php?station=';

  const URL = link + options;

  return new Promise(function(resolve, reject) {
  $.ajax({
    method: 'GET',
    url: URL
  }).done(function(weather){
     resolve(weather)
  }).fail(function(err){
    // this is just boilerplate text given that the freaking API rarely works
    fromMETAR = "KAPA 111853Z 02012KT 10SM FEW070 FEW150 BKN220 29/04 A3015 RMK AO2 SLP132 T02940039"

    toMETAR = "KMSY 111853Z 25012KT 10SM -RA FEW008 BKN080 OVC095 27/25 A2995 RMK AO2 SLP146 P0009 T02670250"

    $('p.departureWeather').text(fromMETAR);


    $('p.arrivalWeather').text(toMETAR);

    $('p.departureWeather').css("fontSize", "11px");
    $('p.arrivalWeather').css("fontSize", "11px");

    return reject(err);
  });
});

}
