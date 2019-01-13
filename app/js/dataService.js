angular
    .module("bee-out.services")
    .service("dataService", dataService)

function dataService($http) {
    return {
        getVenues: _getVenues
    };

    function _getVenues(params) {
        return $http({
            url: "https://api.foursquare.com/v2/venues/explore",
            method: "GET",
            params: {
                v: "20190110",
                client_id: "MUFW4S3QKMQBBEOW0M1I10HOL3XARPMM1D4MQYQ5OLJDFHBL",
                client_secret: "PRZND1SEVMDUZI0LKNQJON1H3DFLD1GPAIYBRVH4NFNZVSVP",
                ll: params.latitude + "," + params.longitude,
                radius: params.radius || 500,
                section: params.section || ""
            }
        }).then(function(httpResponse){
            return httpResponse.data.response.groups[0].items;
        });
    }
}

