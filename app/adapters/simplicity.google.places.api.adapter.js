'use strict';
//keys: crimeIds, time, civicaddressId, civicaddressIds, centerlineIds, neighborhoodName, neighborhoodNames
angular.module('simplicity.google.place.api.adapter', [])
  .constant('PLACES_API_CONFIG', {
      'location' : '35.5951125,-82.5511088',
      'radius' : 80000,
      'key' : 'AIzaSyDV6CtVSMRpAXBNxGZ9-ClGTA84E4PTsF4'
    })
  .factory('simplicityGooglePlacesApiAdapter', ['$http', '$location', '$q', '$filter', 'PLACES_API_CONFIG',
  function($http, $location, $q, $filter, PLACES_API_CONFIG){
    

    var simplicityGooglePlacesApiAdapter = {};


    var service = new google.maps.places.PlacesService(document.getElementById('stupid-required-google-input'));

    simplicityGooglePlacesApiAdapter.search = function(searchText){
      //use $q promises to handle the http request asynchronously
      var q = $q.defer();

      

      var googleCallback = function(results, status){
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            var formattedResults = [];
            for (var i = 0; i < results.length; i++) {
              var resultObj = {
                'id' : results[i].place_id,
                'label' : results[i].name + ' | ' + results[i].vicinity,
                'type' : 'google-place',
                'googleResult' : true
              };
              formattedResults.push(resultObj);
            }
            var googleResults = {
              'groupOrder' : 0,
              'iconClass' : 'fa-dot-circle-o',
              'label' : 'Places',
              'name' : 'google_places',
              'offset' : 3,
              'results' : formattedResults
            };
            q.resolve(googleResults);
        }else{
          q.resolve('no google results');
        }
      };

      var locationCenter = new google.maps.LatLng(35.5951125,-82.5511088);

      var googleRequest = {
          'name' : searchText,
          'location' : locationCenter,
          'radius' : 30000,
          'types' : ['establishment']
      };

      service.nearbySearch(googleRequest, googleCallback);

      //return the promise using q
      return q.promise;

    };

    simplicityGooglePlacesApiAdapter.getDetails = function(place_id){
      //use $q promises to handle the http request asynchronously
      var q = $q.defer();

      

      var googleCallback = function(results, status){
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            q.resolve(results);
        }else{
          q.resolve('no google results');
        }
      };

      var locationCenter = new google.maps.LatLng(35.5951125,-82.5511088);

      var googleRequest = {
          'placeId' : place_id,
      };

      service.getDetails(googleRequest, googleCallback);



      //return the promise using q
      return q.promise;

    };



    //****Return the factory object****//
    return simplicityGooglePlacesApiAdapter; 

    
}]); //END simplicityGooglePlacesApiAdapter factory function




   


