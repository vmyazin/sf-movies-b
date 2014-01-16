var geocoder = new google.maps.Geocoder();
var address = 'San Francisco City Hall';
var markers = [];

var mapOptions = { 
  mapTypeId: google.maps.MapTypeId.ROADMAP,
  center: new google.maps.LatLng(54.00, -3.00),
  zoom: 12
};

var map = new google.maps.Map(document.getElementById("map"), mapOptions);

map.set('styles',
  [
      {
          "featureType": "water",
          "elementType": "geometry",
          "stylers": [
              {
                  "visibility": "on"
              },
              {
                  "color": "#b0aee2"
              }
          ]
      },
      {
          "featureType": "landscape",
          "stylers": [
              {
                  "hue": "#F1FF00"
              },
              {
                  "saturation": -27.4
              },
              {
                  "lightness": 9.4
              },
              {
                  "gamma": 1
              }
          ]
      },
      {
          "featureType": "road.arterial",
          "stylers": [
              {
                  "hue": "#00FF4F"
              },
              {
                  "saturation": 0
              },
              {
                  "lightness": 0
              },
              {
                  "gamma": 1
              }
          ]
      },
      {
          "featureType": "road.local",
          "stylers": [
              {
                  "hue": "#FFB300"
              },
              {
                  "saturation": -38
              },
              {
                  "lightness": 11.2
              },
              {
                  "gamma": 1
              }
          ]
      },
      {
          "featureType": "poi",
          "stylers": [
              {
                  "hue": "#9FFF00"
              },
              {
                  "saturation": 0
              },
              {
                  "lightness": 0
              },
              {
                  "gamma": 1
              }
          ]
      }
  ]
);

function encodeAddress(addr, content) {
  geocoder = new google.maps.Geocoder();
  geocoder.geocode({'address' : addr}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      // results[0].geometry.location;
      r = results[0].geometry.location;
      centerOnAddress(r, content);
    } else {
      alert("Google Maps had some trouble finding" + addr + status);
    }
  });
}

encodeAddress(address);

function centerOnAddress(result, content) {
  placeMarker(result, content);
  map.panTo(result);
  // map.setZoom(15);
}

function placeMarker(location, content) {
  // Move (pan) map to new location
  pointToMoveTo = location;
  map.panTo(pointToMoveTo);
  
  if(typeof markers !== 'undefined' && markers.length > 0) {
    deleteMarkers();
  }
  var marker = new google.maps.Marker({
    position: location,
    map: map,
    title: ''
  });
  markers.push(marker);

  if(typeof content !== 'undefined' && content.length > 0) {
    var infowindow = new google.maps.InfoWindow({
      content: content,
      maxWidth: 280
    });
    infowindow.open(map, marker);    
  }

  google.maps.event.addListener(marker, 'click', function() {
    infowindow.open(map, marker);
  });
}

// Sets the map on all markers in the array.
function setAllMap(map) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}

// Removes the markers from the map, but keeps them in the array.
function clearMarkers() {
  setAllMap(null);
}

// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
  clearMarkers();
  markers = [];
}
