angular
    .module("bee-out.controllers", [])
    .controller("MainController", MainController);

function MainController(dataService, geolocationService, $scope, $window) {
    // store filters
    $scope.filters = {
        address: "",
        radius: 250,
        section: ""
    };

    $scope.coordinates = {};
    $scope.recommendedPlaces = [];

    // flags to hide/sow the spinner,no-results tab and list-view
    $scope.listView = true;
    $scope.showSpinner = true;
    $scope.noResults = false;

    // array of map markers
    $scope.markers = [];
    // array of found venues
    $scope.venues = [];
    $scope.radiusOptions = [250, 500, 1000, 10000];

    getUserLocation();

    // List view is selected by default
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
        setUserCoordinates(null, null);
        removeMarkers();
        $scope.filters.address = "";
        $scope.recommendedPlaces.length = 0;
        $scope.noResults = true;
    };

    $scope.goToGoogleMaps = function(location) {
        $window.open(
            "https://www.google.com/maps?q=" + location.lat + "," + location.lng
        );
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

        if (
            !$scope.autocomplete.getPlace ||
            !$scope.coordinates.longitude ||
            !$scope.coordinates.latitude ||
            !$scope.filters.address
        ) {
            $scope.recommendedPlaces.length = 0;
            $scope.noResults = true;
        } else {
            $scope.showSpinner = true;
            dataService
                .getVenues({
                    longitude: $scope.coordinates.longitude,
                    latitude: $scope.coordinates.latitude,
                    radius: $scope.filters.radius,
                    section: $scope.filters.section
                })
                .then(function(httpResponse) {
                    $scope.showSpinner = false;
                    $scope.recommendedPlaces = httpResponse.data.response.groups[0].items;
                    addMarkersToMap();
                    centerMap($scope.coordinates.latitude, $scope.coordinates.longitude);
                    if ($scope.recommendedPlaces.length === 0) $scope.noResults = true;
                });
        };

    }

    //get user current location, fill the adddress, get the recommended venues
    function getUserLocation() {
        geolocationService.getCurrentPosition().then(function(response) {
            setUserCoordinates(response.coords.latitude, response.coords.longitude);
            geolocationService
                .getAddressName(response.coords.latitude, response.coords.longitude)
                .then(function(result) {
                    $scope.filters.address = result;
                    $scope.getVenues();
                    initMap();
                })
        });
    }

    // initialization of  the map
    function initMap() {
        $scope.map = new $window.google.maps.Map(
            $window.document.getElementById("map"), {
                zoom: 13,
                center: {
                    lat: $scope.coordinates.latitude,
                    lng: $scope.coordinates.longitude
                }
            }
        );
    }

    // adding a marker for each recommendede place
    function addMarkersToMap() {
        removeMarkers();
        $scope.recommendedPlaces.forEach(function(element) {
            var venue = element.venue;

            var marker = new $window.google.maps.Marker({
                position: {
                    lat: venue.location.lat,
                    lng: venue.location.lng
                },
                icon: 'assets/beehive.png',
                map: $scope.map
            });
            var infowindow = new $window.google.maps.InfoWindow({
                content: buildMarkerInfo(venue),
                maxWidth: 260
            });
            $window.google.maps.event.addListener(marker, "click", function() {
                infowindow.open(map, marker);
            });
            $scope.markers.push(marker);
        });
    }

    //clean up all the markers from map
    function removeMarkers() {
        $scope.markers.forEach(function(marker) {
            marker.setMap(null);
        });
        $scope.markers.length = 0;
    }

    //setting the user coordinates
    function setUserCoordinates(lat, long) {
        $scope.coordinates.latitude = lat;
        $scope.coordinates.longitude = long;
    }

    //concatenate categories of a venue
    function getCategories(venueCategories) {
        var categories = "<span>"
        venueCategories.forEach(function(category) {
            categories += category.name + '/'
        })

        return categories + '</span>'
    }

    //build marker information for map
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

    // set the center of the map
    function centerMap(lat, lng) {
        var center = new google.maps.LatLng(lat, lng);
        $scope.map.panTo(center);
    }
}