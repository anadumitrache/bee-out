angular
  .module("bee-out.controllers", [])
  /* Main controller */
  .controller("MainController", MainController);

function MainController(dataService, geolocationService, $scope, $window) {
  $scope.filters = {};
  $scope.filters.radius = 250;
  $scope.filters.section = "";
  $scope.coordinates = {};
  $scope.recommendedPlaces = [];

  $scope.venues = [];

  $scope.radiusOptions = [250, 500, 1000, 10000];

  getUserLocation();

  $scope.eraseLocation = function() {
    $scope.coordinates.longitude = null;
    $scope.coordinates.latitude = null;
    $scope.filters.address = "";
  };

  $scope.getVenues = function() {
    var currentPlace = $scope.autocomplete.getPlace();

    if (currentPlace && currentPlace.geometry) {
      $scope.coordinates.latitude = currentPlace.geometry.location.lat();
      $scope.coordinates.longitude = currentPlace.geometry.location.lng();
    }

    if (!$scope.coordinates.longitude || !$scope.coordinates.latitude) {
      $scope.recommendedPlaces.length = 0;
    } else {
      dataService
        .getVenues({
          longitude: $scope.coordinates.longitude,
          latitude: $scope.coordinates.latitude,
          radius: $scope.filters.radius,
          section: $scope.filters.section
        })
        .then(function(httpResponse) {
          $scope.recommendedPlaces = httpResponse.data.response.groups[0].items;
        });
    }
  };

  function getUserLocation() {
    geolocationService.getCurrentPosition().then(function(response) {
      $scope.coordinates = {
        latitude: response.coords.latitude,
        longitude: response.coords.longitude
      };
      geolocationService
        .getAddressName(response.coords.latitude, response.coords.longitude)
        .then(function(result) {
          $scope.filters.address = result;
          $scope.getVenues();
        });
    });
  }

  $scope.updateRadius = function(radius) {
    $scope.filters.radius = radius;
  };

  $scope.autocompleteAddress = function() {
    var input = $window.document.getElementById("address");
    $scope.autocomplete = new $window.google.maps.places.Autocomplete(input);
  };
}
