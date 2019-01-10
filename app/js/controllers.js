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
  $scope.listView = true;

  var markers = [];

  $scope.venues = [];

  $scope.radiusOptions = [250, 500, 1000, 10000];

  getUserLocation();

  $scope.showList = function(value) {
    $scope.listView = value;
  };

  function initMap() {
    $scope.map = new $window.google.maps.Map(
      $window.document.getElementById("map"),
      {
        zoom: 12,
        center: {
          lat: $scope.coordinates.latitude,
          lng: $scope.coordinates.longitude
        }
      }
    );
  }

  $scope.goToGoogleMaps = function(location) {
    $window.open(
      "https://www.google.com/maps?q=" + location.lat + "," + location.lng
    );
  };

  function addMarkersToMap() {
    removeMarkers();
    $scope.recommendedPlaces.forEach(function(element) {
      var venueLocation = element.venue.location;
      var marker = new $window.google.maps.Marker({
        position: { lat: venueLocation.lat, lng: venueLocation.lng },
        map: $scope.map
      });
      $window.google.maps.event.addListener(marker, "click", function() {
        $scope.goToGoogleMaps(venueLocation);
      });
      markers.push(marker);
    });
  }

  function removeMarkers() {
    markers.forEach(function(marker) {
      marker.setMap(null);
    });
    markers.length = 0;
  }

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
          addMarkersToMap();
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
          initMap();
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
