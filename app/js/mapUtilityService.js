angular
    .module("bee-out.services")
    .service("mapUtilityService", mapUtilityService)

function mapUtilityService($window) {
    var map, markers = [];
    return {
        initMap: _initMap,
        setMapCenter: _setMapCenter,
        addMarkersToMap: _addMarkersToMap,
        removeMarkers: _removeMarkers,
        goToGoogleMaps: _goToGoogleMaps
    }

    // initialization of the map
    function _initMap(lat, long) {
        map = new $window.google.maps.Map(
            $window.document.getElementById("map"), {
                zoom: 15,
                center: {
                    lat: lat,
                    lng: long 
                }
            }
        );
    }

    // set the center of the map
    function _setMapCenter(lat, lng) {
        var center = new $window.google.maps.LatLng(lat, lng);
        map.panTo(center);
    }

    // adding a marker for each recommended place
    function _addMarkersToMap(recommendedPlaces, buildMarkerInfo) {
        recommendedPlaces.forEach(function(element) {
            var venue = element.venue;

            var marker = new $window.google.maps.Marker({
                position: {
                    lat: venue.location.lat,
                    lng: venue.location.lng
                },
                icon: 'assets/beehive.png',
                map: map
            });
            var infowindow = new $window.google.maps.InfoWindow({
                content: buildMarkerInfo(venue),
                maxWidth: 260
            });
            $window.google.maps.event.addListener(marker, "click", function() {
                infowindow.open(map, marker);
            });
            markers.push(marker);
        });
    }

    // clean up all the markers from map
    function _removeMarkers() {
        markers.forEach(function(marker) {
            marker.setMap(null);
        });
        markers.length = 0;
    }

    function _goToGoogleMaps(location) {
        $window.open(
            "https://www.google.com/maps?q=" + location.lat + "," + location.lng
        );
    };

}