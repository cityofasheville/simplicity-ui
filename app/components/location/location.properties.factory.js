
app.factory('LocationProperties', ['$http', '$location', '$q', '$filter', '$state', '$stateParams', 'ArcGisServer',
  function($http, $location, $q, $filter, $state, $stateParams, ArcGisServer){

    //****Create the factory object****//
  	var LocationProperties = {};

    //****Private variables*****//
  	var properties = {
    };

    var assignValueToProperties = function(parentPropertyName, thisPropertyName, value){
      //check if parent property already exist
      if(properties[parentPropertyName]){
          properties[parentPropertyName][thisPropertyName] = value;
      //parent property doesn't exist, so create it
      }else{
        properties[parentPropertyName] = {};
        properties[parentPropertyName][thisPropertyName] = value;
      }
    };
    //
    var createArrayFromNullorString = function(value, delimter){
      if(value === null){
          return []
      }else{
        return value.split(delimter);
      }
    };


    var setPropertiesWithCivicAddressId = function(CivicAddressId){
      var q = $q.defer();
      var dataCacheId = ArcGisServer.featureService.getId('coagis.gisowner.coa_overlay_data_cache', 'table');
      var queryParams = {
        'where' : 'civicaddress_id=' + CivicAddressId,
        'f' : 'json',
        'outFields' : '*'
      };
      ArcGisServer.featureService.query(dataCacheId, queryParams)
        .then(function(dataCacheResults){
          console.log(dataCacheResults);
          for (var i = 0; i < dataCacheResults.features.length; i++) {
            //assign iterator to attributes to make it easier to read
            var attributes = dataCacheResults.features[i].attributes;

            if(attributes.type === 'ADDRESS IN CITY'){
              properties.inTheCity = (attributes.data === 'YES')? true : false;
            }else if(attributes.type === 'CRIME'){
              var value = createArrayFromNullorString(attributes.data, ',');
              assignValueToProperties('crime', attributes.distance, value);
            }else if(attributes.type === 'ZONING'){
              if(attributes.data === null){
                properties.zoning = [];
              }else{
                properties.zoning = attributes.data.split(',');
              }
            }else if(attributes.type === 'DEVELOPMENT'){
              var value = createArrayFromNullorString(attributes.data, ',');
              assignValueToProperties('development', attributes.distance, value);
            }else{
              //Do nothing
            }
          }
          console.log('properties');
          console.log(properties);
          q.resolve(properties);
        });
        return q.promise;
    };

    var rebuildPropertiesFromLocation = function(location){
      var q = $q.defer();
      var addressLayerId = ArcGisServer.featureService.getId('coagis.gisowner.coa_opendata_address', 'layer');

      var queryParams = {
        'where' : 'civicaddress_id=' + location,
        'f' : 'json',
        'outFields' : '*'
      };
      //Build an object from the address layer that looks like what is returned from the geocoder
      ArcGisServer.featureService.query(addressLayerId, queryParams)
        .then(function(data){
          var attributes = data.features[0].attributes;

          var addressProperties = {
            'address' : attributes.address,
            'location': {
                'x': attributes.x,
                'y': attributes.y
            },
            'score' : 100,
            'attributes' : {
              "Score": 100,
              'Match_addr': attributes.address,
              'House': attributes.street_number,
              'Side': '',
              'PreDir': '',
              'PreType': attributes.street_prefix,
              'StreetName': attributes.street_name,
              'SufType': attributes.street_type,
              'SufDir': attributes.street_postdirection,
              'City': '',
              'State': '',
              'ZIP': attributes.zip_code,
              'Ref_ID': location,
              'User_fld': '',
              'Addr_type': 'StreetAddress'
            }
          }; 
          //assiggn the new address object the properties address object
          properties.address = addressProperties;
          //set the rest of the location properties
          setPropertiesWithCivicAddressId(location)
              .then(function(properties){
                q.resolve(properties);
              });
        });
      
      return q.promise;
    };

  	
    //****API*****//

  	LocationProperties.properties = function(addressProperties){
      var q = $q.defer();
  		if(addressProperties){
  			properties.address = addressProperties;
  			setPropertiesWithCivicAddressId(addressProperties.attributes.Ref_ID)
          .then(function(properties){
            q.resolve(properties);
          });
  		}else{
        if(!properties.address){
          if($stateParams.location){
            rebuildPropertiesFromLocation($stateParams.location)
              .then(function(properties){
                q.resolve(properties);
              })
          }else{
            $state.go('main');
          }
        }else{
          console.log(properties);
          q.resolve(properties);
        }
        
  			
  		}
      return q.promise;
    };


    //****Return the factory object****//
    return LocationProperties; 

    
}]); //END LocationProperties factory function