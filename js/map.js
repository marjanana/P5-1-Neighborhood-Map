//initiate map
var map;
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat:40.811550, lng: -73.946477},
    zoom: 12
  });

//resize and center map based on window size
  google.maps.event.addDomListener(window, 'load', initialize);
  google.maps.event.addDomListener(window, "resize", function() {
     var center = map.getCenter();
     google.maps.event.trigger(map, "resize");
     map.setCenter(center);
  });
}


