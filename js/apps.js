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
    address: '1 W 28th St, New York, NY 10010',

}, {
    id: '4',
    name: 'Morris Park Boxing Club',
    latIngA: 40.8445665,
    latIngB: -73.8679362,
    address: '1 W 28th St, New York, NY 10010',




}];

// Google Map
var View = function() {
      "use strict";
    var self = this;
    var myLatlng = new google.maps.LatLng(40.8227927, -74.0087911);
    var mapOptions = {
        zoom: 11,
        center: myLatlng,

    };

    var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

    // Create infowindow
    var infowindow = new google.maps.InfoWindow({
        maxWidth: 320,
        zIndex: 200
    });

    // Markers
    var markers = {};

    // Render locations on the view: map and list
    self.renderLocation = function(location) {
        var currentLocation = location;
        var id = currentLocation.id;
        var name = currentLocation.name;
        var address = currentLocation.address;
        var markerLatLng = new google.maps.LatLng(currentLocation.latIngA, currentLocation.latIngB);


        var marker = new google.maps.Marker({
            position: markerLatLng,
            map: map,
            title: name
        });

        // Add event listener to marker
        google.maps.event.addListener(marker, 'click', (function(location) {
            return function() {
                viewModel.onLocationClick(location);
            };
        })(location));

        markers[id] = marker;
    };

    // Info Windows
    self.showInfoWindow = function(location) {
        $('.collapse').collapse('hide');
        var marker = markers[location.id];
        infowindow.setContent(getMarkerContent(location));
        infowindow.open(map, marker);

    };

    self.resetInfoWindow = function(location) {
        var marker = markers[location.id];
        infowindow.open(map, marker);
    };

    // Clear the markers
    self.clearMarkers = function() {
        for (var id in markers) {
            markers[id].setMap(null);
        }
        markers = {};
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

    // A function to piece together today's date. Used in getFourSquareData.
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
            // If the request fails, the link is set to the current page,
            // and show a console.log info for the failed request.
            $('#fs-link').attr('href', '#');
            view.showAlert('Foursquare API is not available at the moment.');
        });
    }

    //Foursquare Photo
    function getFoursquarePhotos(location, venueId) {
        // Get venue's photo URL from Foursquare by venue Id.
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
                    "width200" +
                    data.response.photos.items[0].suffix;
                $('#fs-photo').attr('src', photoUrl);
                view.resetInfoWindow(location);
            } else {
                // If there is no photo available from Foursquare, set the image to empty.
                $('#fs-photo').attr('src', '');
            }
        }).fail(function() {
            // If the request failed, set the image to empty, and show a console.log info for the failed request.
            $('#fs-photo').attr('src', '');
            view.showAlert('Foursquare API is not available at the moment.');
        });
    }



    self.individualGyms = ko.observable();
     self.searchGyms = function() {
         var chosenGyms = ko.observableArray([]);

            var individualGyms = self.individualGyms;
            var x = searchGyms.length;
            for (var i = 0; i < x; i++) {

                if (locations[i].name.indexOf(individualGyms[i]) != -1) {
                    chosenGyms.push(locations[i]);
                }


            // Push the location into the list
            self.locationList.push(find[i]);
        }
    };

};



var viewModel = new ViewModel();
viewModel.initialize();
ko.applyBindings(viewModel);