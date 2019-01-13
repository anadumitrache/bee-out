angular
    .module("bee-out.controllers", [])
    .controller("MainController", MainController);

function MainController($scope, $window, dataService, geolocationService, mapUtilityService) {

   var coordinates = {};

    // initial filters
    $scope.filters = {
        address: "",
        radius: 250,
        section: ""
    };

    $scope.recommendedPlaces = [];

    // flags to hide/show the spinner, the no results tab and the list view tab
    $scope.listView = true;
    $scope.showSpinner = true;
    $scope.noResults = false;

    // array of found venues
    $scope.venues = [];

    $scope.radiusOptions = [250, 500, 1000, 10000];

    $scope.goToGoogleMaps = mapUtilityService.goToGoogleMaps;

    getUserLocation();

    // set list view tab
    $scope.showList = function(value) {
        $scope.listView = value;
    };

    $scope.autocompleteAddress = function() {
        var input = $window.document.getElementById("address");
        $scope.autocomplete = new $window.google.maps.places.Autocomplete(input);
    };

    $scope.updateRadius = function(radius) {
        $scope.filters.radius = radius;
    };

    $scope.eraseLocation = function() {
        setUserCoordinates();
        mapUtilityService.removeMarkers();
        $scope.filters.address = "";
        $scope.recommendedPlaces.length = 0;
        $scope.noResults = true;
    };

    // get the venues according to selected filters
    $scope.getVenues = function() {
        $scope.noResults = false;
        var currentPlace = $scope.autocomplete.getPlace();

        if (currentPlace && currentPlace.geometry) {
            setUserCoordinates(
                currentPlace.geometry.location.lat(),
                currentPlace.geometry.location.lng()
            );
        }

        if (!coordinates.longitude || !coordinates.latitude || !$scope.filters.address) {
           mapUtilityService.initMap();
            $scope.recommendedPlaces.length = 0;
            $scope.noResults = true;
        } else {
            $scope.showSpinner = true;
            dataService
                .getVenues({
                    longitude: coordinates.longitude,
                    latitude: coordinates.latitude,
                    radius: $scope.filters.radius,
                    section: $scope.filters.section
                })
                .then(function(places) {
                    $scope.showSpinner = false;
                    $scope.recommendedPlaces = places;
                    mapUtilityService.initMap(coordinates.latitude, coordinates.longitude);
                    mapUtilityService.removeMarkers();
                    mapUtilityService.addMarkersToMap($scope.recommendedPlaces,buildMarkerInfo);
                    mapUtilityService.setMapCenter(coordinates.latitude, coordinates.longitude);
                    if ($scope.recommendedPlaces.length === 0) $scope.noResults = true;
                });
        };

    }

    // get user current location, fill the adddress, get the recommended venues
    function getUserLocation() {
        geolocationService.getCurrentPosition()
        .then(function(coords) {
            setUserCoordinates(coords.latitude, coords.longitude);
            geolocationService
                .getAddressName(coords.latitude, coords.longitude)
                .then(function(addressName) {
                    $scope.filters.address = addressName;
                    $scope.getVenues();
                })
        }, function(){
          $scope.showSpinner = false;
          $scope.noResults = true;
        });
    }

    // setting the user coordinates
    function setUserCoordinates(lat, long) {
        coordinates.latitude = lat;
        coordinates.longitude = long;
    }

    // concatenate categories of a venue
    function getCategories(venueCategories) {
        var categories = "<span>"
        venueCategories.forEach(function(category) {
            categories += category.name + '/'
        })

        return categories + '</span>'
    }

    // build marker information for map
    function buildMarkerInfo(venue) {
        return '<div><h5 class="firstHeading">' +
            venue.name +
            '</h5>' +
            '<div><b>Address</b>:' +
            '<span>' + venue.location.address + ' , ' + venue.location.city + '</span></div>' +
            '<div><b>Categories</b>:' + getCategories(venue.categories) +
            '</div>' +
            '<a href="https://www.google.com/maps?q=' +
            venue.location.lat +
            ',' +
            venue.location.lng +
            '">Go to Google Maps</a>' +
            '</div>';
    }    
}