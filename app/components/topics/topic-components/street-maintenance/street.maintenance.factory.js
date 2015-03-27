simplicity.factory('StreetMaintenance', ['$q', '$stateParams', 'AddressCache', 'simplicityBackend', 'COLORS',
  function($q, $stateParams, AddressCache, simplicityBackend, COLORS){   

    var StreetMaintenance = {};

    var formatStreetMaintenanceData = function(centerlineIdsString){
      var q = $q.defer();
      var addressCache = AddressCache.get();
        simplicityBackend.simplicityQuery('streets', {'centerlineIds' : centerlineIdsString})
          .then(function(streetResults){
              var streetFeaturesArray = [];
              var streetMaintenanceColors = {};
              for (var i = 0; i < streetResults.features.length; i++) {
                if(streetResults.features[i].properties.street_responsibility === 'UNKOWN'){
                  streetResults.features[i].properties.street_responsibility = 'UNKNOWN';
                }
                if(!streetMaintenanceColors[streetResults.features[i].properties.street_responsibility]){
                  streetMaintenanceColors[streetResults.features[i].properties.street_responsibility] = COLORS.streetmaintenance[streetResults.features[i].properties.street_responsibility];
                }
                streetResults.features[i].properties.color = COLORS.streetmaintenance[streetResults.features[i].properties.street_responsibility].color;
                streetFeaturesArray.push(streetResults.features[i]);
              }
              var summary = {
                'table' : streetMaintenanceColors
              };
              var geojson = {
                'type' : 'FeatureCollection',
                'summary' : summary,
                'searchGeojson' : addressCache.searchGeojson,
                'features' : streetFeaturesArray
              };
              q.resolve(geojson);
          });
        return q.promise;
    };

    StreetMaintenance.get = function(){
      var q = $q.defer();
      if($stateParams.searchby === "street_name"){
        q.resolve(formatStreetMaintenanceData($stateParams.id));

      }else if ($stateParams.searchby === "address"){

        simplicityBackend.simplicityQuery('xrefs', {'civicaddressId' : $stateParams.id})
          .then(function(xrefResults){
            var centerlineIdArray = [];
            for (var i = 0; i < xrefResults.features.length; i++) {
              centerlineIdArray.push(xrefResults.features[i].properties.centerline_id);
            }
            q.resolve(formatStreetMaintenanceData(centerlineIdArray.join(',')));
          });
      }
      

      return q.promise;
    };

    //****Return the factory object****//
    return StreetMaintenance; 

    
}]); //END StreetMaintenance factory function




   


