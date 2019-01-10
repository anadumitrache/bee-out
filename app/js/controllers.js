angular
  .module("bee-out.controllers", [])
  /* Main controller */
  .controller("MainController", MainController);

function MainController(dataService, geolocationService, $scope, $window) {
  $scope.filters = {};
  $scope.filters.radius = "250";

  getUserLocation();

  function getUserLocation() {
    geolocationService.getCurrentPosition().then(function(response) {
      geolocationService
        .getAddressName(response.coords.latitude, response.coords.longitude)
        .then(function(result) {
          $scope.filters.address = result;
        });
    });
  }

  $scope.autocompleteAddress = function() {
    var input = $window.document.getElementById("address");
    new $window.google.maps.places.Autocomplete(input);
  };
}
