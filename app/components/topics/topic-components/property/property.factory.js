simplicity.factory('Property', ['$http', '$location', '$q', '$filter', '$stateParams', 'AddressCache', 'simplicityBackend', 'COLORS', 'CODELINKS',
  function($http, $location, $q, $filter, $stateParams, AddressCache, simplicityBackend, COLORS, CODELINKS){   

    var Property = {};

    var formatZoningPropertyForAnAddress = function(){
      var addressCache = AddressCache.get();
      var pinnum2civicaddressid = AddressCache.pinnum2civicaddressid();
      var formattedZoningArray = [];
      for (var z = 0; z < addressCache.zoning.length; z++) {
        var zoningDistrict = addressCache.zoning[z];
        if(CODELINKS[zoningDistrict] === undefined){
          formattedZoningArray.push({'zoningDistrict' : zoningDistrict, 'codelink' : 'disable'});
        }else{
          formattedZoningArray.push({'zoningDistrict' : zoningDistrict, 'codelink' : CODELINKS[zoningDistrict]});
        }
      };
      console.log(formattedZoningArray);
      return formattedZoningArray;
    }

    var formatZoningPropertyForMultipleAddressess = function(civicaddressId){
      var addressCache = AddressCache.get();
      var pinnum2civicaddressid = AddressCache.pinnum2civicaddressid();
      var formattedZoningArray = [];
      if(addressCache.zoning[civicaddressId]){
        for (var z = 0; z < addressCache.zoning[civicaddressId].length; z++) {
          var zoningDistrict = addressCache.zoning[civicaddressId][z];
          if(CODELINKS[zoningDistrict] === undefined){
            formattedZoningArray.push({'zoningDistrict' : zoningDistrict, 'codelink' : 'disable'});
          }else{
            formattedZoningArray.push({'zoningDistrict' : zoningDistrict, 'codelink' : CODELINKS[zoningDistrict]});
          }
        };
        return formattedZoningArray;
      }else{
        return undefined;
      }
      
    }


    var formatPropertyData = function(property){
      var addressCache = AddressCache.get();
      var pinnum2civicaddressid = AddressCache.pinnum2civicaddressid();
      var q = $q.defer();

      for (var p = 0; p < property.features.length; p++) {

        if($stateParams.searchby === "address"){
          property.features[p].properties.civicaddress_id = $stateParams.id;
          
          if(addressCache.zoning){
            property.features[p].properties.zoning = formatZoningPropertyForAnAddress();
          }
          
        }else if($stateParams.searchby === 'pinnum' || $stateParams.searchby === 'owner_name' || $stateParams.searchby === 'street_name'){
          property.features[p].properties.civicaddress_id = pinnum2civicaddressid[property.features[p].properties.pinnum];
          if(addressCache.zoning){
            property.features[p].properties.zoning = formatZoningPropertyForMultipleAddressess(property.features[p].properties.civicaddress_id)
          }          
        }
        property.features[p].properties.color = '035096';
        property.features[p].properties.zoningOverlays = addressCache.zoningOverlays;
        

        if(addressCache.zoningOverlays){
          var zoningOverlaysSplit = addressCache.zoningOverlays.split('-');
          simplicityBackend.simplicityQuery('zoningOverlays', {'zoningOverlayName' : zoningOverlaysSplit[0]})
            .then(function(zoningOverlayLayer){
              property.overlays = zoningOverlayLayer;
              q.resolve(property);
            });
        }else{
          console.log(property);
          q.resolve(property);
        }
      }
      return  q.promise;
    };


    //We need to use the pinnum to lookup property information 
    //We can access the pinnum by cross-referencing the cividaddress id or centerline id in the xref table
    //WE can acess the civicaddress id from the stateParams
    Property.get = function(){
      var addressCache = AddressCache.get();
      var pinnum2civicaddressid = AddressCache.pinnum2civicaddressid();
      var q = $q.defer();

      if($stateParams.searchby === 'address'){ 

        simplicityBackend.simplicityQuery('xrefs', {'civicaddressId' : Number($stateParams.id)})
          .then(function(xRef){

            simplicityBackend.simplicityQuery('properties', {'pinnum' : xRef.features[0].properties.pinnum})
              .then(function(property){
                q.resolve(formatPropertyData(property));
              });
          });
      }else if($stateParams.searchby === 'street_name'){ 

        var idArray = $stateParams.id.split(',');

        for (var i = 0; i < idArray.length; i++) {
          idArray[i] = Number(idArray[i]);
        }

        simplicityBackend.simplicityQuery('xrefs', {'centerlineIds' : idArray.join()})
          .then(function(xRefPin){
            var xrefPinString = '';
            for (var i = 0; i < xRefPin.features.length; i++) {
              if(i === 0){
                xrefPinString = xrefPinString + "'" + xRefPin.features[i].properties.pinnum + "'";
              }else{
                xrefPinString = xrefPinString + ",'" + xRefPin.features[i].properties.pinnum + "'";
              }         
            }
            simplicityBackend.simplicityQuery('properties', {'pinnums' : xrefPinString})
              .then(function(property){
                q.resolve(formatPropertyData(property));
              });
          });
      }else if ($stateParams.searchby === 'pinnum' || $stateParams.searchby === 'owner_name'){
        var pinArray = $stateParams.id.split(',');
        var pinString = '';
        for (var i = 0; i < pinArray.length; i++) {
          if(i === 0){
            pinString = pinString + "'" + pinArray[i] + "'";
          }else{
            pinString = pinString + ",'" + pinArray[i] + "'";
          }         
        }

        simplicityBackend.simplicityQuery('properties', {'pinnums' : pinString})
          .then(function(property){
            q.resolve(formatPropertyData(property));
          });
      }
      return q.promise;
    };//END property function


    //****Return the factory object****//
    return Property; 

    
}]); //END Property factory function




   


