var locations = [{
    id: '0',
    name: 'Church Street Boxing Gym',
    latIngA: 40.7133206,
    latIngB: -74.0087901,
    address: '25 Park Pl, New York, NY 10007',
}, {
    id: '1',
    name: 'Mendez Boxing',
    latIngA: 40.7430182,
    latIngB: -73.9868756,
    address: '23 E 26th St, New York, NY 10010',
}, {
    id: '2',
    name: 'Shadowbox NYC',
    latIngA: 40.7402416,
    latIngB: -73.9928662,
    address: '28 W 20th St, New York, NY 10011',
}, {
    id: '3',
    name: 'Overthrow Boxing NYC',
    latIngA: 40.7255372,
    latIngB: -73.9928377,
    address: '9 Bleecker St, New York, NY 10012',
}, {
    id: '4',
    name: 'Morris Park Boxing Club',
    latIngA: 40.8445665,
    latIngB: -73.8679362,
    address: '644 Morris Park Ave, Bronx, NY 10460',
}];


var View = function() {
    "use strict";
    var self = this;

    // Google Map

    var myLatlng = new google.maps.LatLng(40.7830603, -73.9712488);
    var mapOptions = {
        zoom: 11,
        center: myLatlng,
    };
    var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

    // Markers
    self.markers = {};
    self.renderLocation = function(location) {
        var currentLocation = location;
        var id = currentLocation.id;
        var name = currentLocation.name;
        var address = currentLocation.address;
        var markerLatLng = new google.maps.LatLng(currentLocation.latIngA, currentLocation.latIngB);


        var marker = new google.maps.Marker({
            position: markerLatLng,
            map: map,
            animation: google.maps.Animation.DROP,
            title: name
        });

        // Add event listener to marker
        google.maps.event.addListener(marker, 'click', (function(location) {
            return function() {
                viewModel.onLocationClick(location);
            };
        })(location));

        self.markers[id] = marker;
    };

     // Clear the markers
    self.clearMarkers = function() {
        for (var id = 0; id < self.markers.length; id++) {
            self.markers[id].setVisible(false);
        }
        self.markers = {};
    };

    self.showAlert = function(alert) {
        $('#alert-box').text('Oops! ' + alert);
        $('#alert-box').fadeIn().delay(3000).fadeOut();
    };

    // Marker content
    function getMarkerContent(location) {
        var markerContent = '<div class="content row">' +
            '<div class="col-sm-6">' +
            '<a id="fs-link" target="_blank">' +
            '<h3 id="firstHeading" class="firstHeading">' + location.name + '</h3>' +
            '</a>' +
            '<div id="bodyContent">' +
            '<p>Address: ' + location.address + '</p>' +
            '</div>' +
            '</div><div class="col-sm-6"><img id="fs-photo"></img></div>' +
            '</div>';
        return markerContent;
    }


    // Info Windows
        var infowindow = new google.maps.InfoWindow({
        maxWidth: 300,
        zIndex: 200
        });

    self.showInfoWindow = function(location) {
        $('.collapse').collapse('hide');
        var marker = self.markers[location.id];
        infowindow.setContent(getMarkerContent(location));
        infowindow.open(map, marker);

        //marker bouncing on click
        if (marker.getAnimation() !== null) {
            marker.setAnimation(null);
        } else {
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function(){ marker.setAnimation(null); }, 2000);
        }
        //zom in google map to location that was clicked
        window.setTimeout(function() {
            map.panTo(marker.getPosition());
            }, 1000);
            map.setZoom(17);
            map.setCenter(marker.getPosition());
    };

    self.resetInfoWindow = function(location) {
        var marker = self.markers[location.id];
        infowindow.open(map, marker);
    };

};

//*****************View Model*************************

var ViewModel = function() {
    "use strict";
    var self = this;
    var view = new View();
    self.locationList = ko.observableArray([]);


    // Initialize locations on the map
    self.initialize = function() {
        self.renderLocations(locations);
    };

    // Render locations, either all or filtered
    self.renderLocations = function(activeLocations) {
        // Clear all the lcoations in the locaiton list and clear all the markers on the map
        self.locationList.removeAll();
        view.clearMarkers();

        var l = activeLocations.length;
        for (var i = 0; i < l; i++) {
            view.renderLocation(activeLocations[i]);

            // Push the location into the list
            self.locationList.push(activeLocations[i]);
        }
    };


    function getToday() {
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1; //January is 0!
        var yyyy = today.getFullYear();

        if (dd < 10) {
            dd = '0' + dd;
        }

        if (mm < 10) {
            mm = '0' + mm;
        }
        today = yyyy + mm + dd;
        return today;
    }


    // Foursqaure data
    self.onLocationClick = function(location) {
        getFoursquareData(location);
        view.showInfoWindow(location);
    };

    var foursquareKeyString = 'client_id=AALKABQH55DBDZPNU1F3Z4BN41FQPCAUFQ12QVVRLJM11YK3&client_secret= ARI0VFIJQNS51SCQ4YE5DYXDIJHELOPUPSOGONQ4GJT2U53K';

    function getFoursquareData(location) {
        // Request Foursqaure data
        var url = "https://api.foursquare.com/v2/venues/search?limit=1&ll=" + location.latIngA.toFixed(2) + "," +
            location.latIngB.toFixed(2) + "&query=" +
            location.name + '&' + foursquareKeyString + "&v=" + getToday();
        $.ajax({
            url: url,
            context: document.body
        }).done(function(data) {
            if (data.response.venues[0]) {
                // Get venue's url from Foursquare
                $('#fs-link').attr('href', data.response.venues[0].url);
                var venueId = data.response.venues[0].id;
                getFoursquarePhotos(location, venueId);
            } else {
                // If Foursquare does not have a response, set the link to the current page.
                $('#fs-link').attr('href', '#');
            }
        }).fail(function() {
            $('#fs-link').attr('href', '#');
            view.showAlert('Foursquare API is not available at the moment.');
        });
    }

    //Foursquare Photo
    function getFoursquarePhotos(location, venueId) {
        var photoRequestUrl = 'https://api.foursquare.com/v2/venues/' + venueId + '/photos' +
            '?limit=1&' + foursquareKeyString +
            '&v=' + getToday();
        $.ajax({
            url: photoRequestUrl,
            context: document.body
        }).done(function(data) {
            if (data.response.photos.count == 1) {
                var photoUrl =
                    data.response.photos.items[0].prefix +
                    "width150" +
                    data.response.photos.items[0].suffix;
                $('#fs-photo').attr('src', photoUrl);
                view.resetInfoWindow(location);
            } else {
                // Don't display image it it is not available from Foursquare.
                $('#fs-photo').attr('src', '');
            }
        }).fail(function() {
            $('#fs-photo').attr('src', '');
            view.showAlert('Foursquare API is not available at the moment.');
        });
    }

    self.search = ko.observable("");

    self.searchGyms = ko.computed(function(item) {

        if (!self.search()) {
            return self.locationList();
        } else {
            return ko.utils.arrayFilter(self.locationList(), function(item) {
                if (item.name.toLowerCase().indexOf(self.search()) > -1) {
                    return true;
                }
                return false;

                return view.markers[item.id].setVisible(true);
            });
        }

    });

};



var viewModel = new ViewModel();
viewModel.initialize();
ko.applyBindings(viewModel);