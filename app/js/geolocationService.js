angular
    .module("bee-out.services")
    .service("geolocationService", geolocationService);

function geolocationService($window, $q) {
    return {
        getCurrentPosition: _getCurrentPosition,
        getAddressName: _getAddressName
    };

    function _getCurrentPosition() {
        var deferred = $q.defer();

        if (!$window.navigator.geolocation) {
            deferred.reject("Geolocation is not supported.");
        } else {
            $window.navigator.geolocation.getCurrentPosition(
                function(position) {
                    deferred.resolve(position.coords);
                },
                function() {
                    deferred.reject();
                }
            );
        }

        return deferred.promise;
    }

    function _getAddressName(lat, long) {
        var googleCoords = new $window.google.maps.LatLng(lat, long);
        var deferred = $q.defer();

        new $window.google.maps.Geocoder().geocode({
                latLng: googleCoords
            },
            function(results) {
                if (results[0]) {
                    deferred.resolve(results[0].formatted_address);
                } else {
                    deferred.reject(new Error("No name found for the coordinates."));
                }

            }
        );

        return deferred.promise;
    }
}