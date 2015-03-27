simplicity.factory('AddressList', ['$q', '$stateParams', 'AddressCache', 'simplicityBackend', 'COLORS',
  function($q, $stateParams, AddressCache, simplicityBackend, COLORS){   

    var AddressList = {};

    AddressList.get = function(){
      var q = $q.defer();

      var addressCache = AddressCache.get();
      var civicaddressIdArray = AddressCache.civicaddressIdArray();

      if($stateParams.searchby === "street_name"){
        // var addressQueryParams = {
        //   'where' : "civicaddress_id in (" + civicaddressIdArray.join(',') + ")", 
        //   'f' : 'json',
        //   'outFields' : '*'
        // };
        simplicityBackend.simplicityQuery('addresses', {'civicaddressIds' : civicaddressIdArray.join(',')})
        //queryBackend(featureService.address, addressQueryParams)
          .then(function(addressResults){
              var addressFeaturesArray = [];
              for (var i = 0; i < addressResults.features.length; i++) {
                if(addressCache.inTheCity[addressResults.features[i].properties.civicaddress_id]){
                  addressResults.features[i].properties.isincity = addressCache.inTheCity[addressResults.features[i].properties.civicaddress_id];
                }else{
                  addressResults.features[i].properties.isincity = false;
                }
                
                addressResults.features[i].properties.color = '035096';

                addressFeaturesArray.push(addressResults.features[i]);
              }
              var geojson = {
                'type' : 'FeatureCollection',
                'summary' : {},
                'searchGeojson' : addressCache.searchGeojson,
                'features' : addressFeaturesArray
              };
              q.resolve(geojson);
          });
      }else if($stateParams.searchby === "neighborhood"){
        // var neighborhoodQueryParams = {
        //   'where' : "neighborhood = '" + $stateParams.id + "'", 
        //   'f' : 'json',
        //   'outFields' : '*'
        // };
        simplicityBackend.simplicityQuery('addresses', {'neighborhoodName' : $stateParams.id })
        //queryBackend(featureService.address, neighborhoodQueryParams)
          .then(function(addressResults){
            var addressFeaturesArray = [];
              for (var i = 0; i < addressResults.features.length; i++) {
                addressResults.features[i].properties.color = '035096';
                addressFeaturesArray.push(addressResults.features[i]);
              }
              var geojson = {
                'type' : 'FeatureCollection',
                'summary' : {},
                'searchGeojson' : addressCache.searchGeojson,
                'features' : addressFeaturesArray
              };
              q.resolve(geojson);
          });
      }

      return q.promise;
    };

    //****Return the factory object****//
    return AddressList; 

    
}]); //END AddressList factory function




   


