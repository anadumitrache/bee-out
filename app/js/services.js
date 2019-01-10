angular
  .module("bee-out.services", [])
  .service("dataService", dataService)
  .service("geolocationService", geolocationService);

function dataService($http) {
  return {
    getVenues: _getVenues
  };

  function _getVenues(params) {
    return $http.get({
      url: "https://api.foursquare.com/v2/venues/explore",
      method: "GET",
      params: {
        client_id: "MUFW4S3QKMQBBEOW0M1I10HOL3XARPMM1D4MQYQ5OLJDFHBL",
        client_secret: "PRZND1SEVMDUZI0LKNQJON1H3DFLD1GPAIYBRVH4NFNZVSVP",
        ll: params.longitude + "," + params.latitude,
        radius: params.radius || 500,
        section: params.section || ""
      }
    });
  }
}

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
          deferred.resolve(position);
        },
        function(err) {
          deferred.reject(err);
        }
      );
    }

    return deferred.promise;
  }

  function _getAddressName(lat, long) {
    var googleCoords = new window.google.maps.LatLng(lat, long);

    var deferred = $q.defer();

    new window.google.maps.Geocoder().geocode(
      { latLng: googleCoords },
      function(results) {
        deferred.resolve(results[0].formatted_address);
      }
    );

    return deferred.promise;
  }
}
