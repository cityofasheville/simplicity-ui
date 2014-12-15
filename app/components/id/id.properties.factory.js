
app.factory('IdProperties', ['$http', '$location', '$q', '$filter', '$state', '$stateParams', 'ArcGisServer',
  function($http, $location, $q, $filter, $state, $stateParams, ArcGisServer){

    //****Create the factory object****//
  	var IdProperties = {};

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
            }else if(attributes.type === 'PERMITS'){
              var value = createArrayFromNullorString(attributes.data, ',');
              assignValueToProperties('development', attributes.distance, value);
            }else if(attributes.type === 'TRASH DAY'){
              if(properties.sanitation){
                properties.sanitation.trash = attributes.data
              }else{
                properties.sanitation = {
                  'trash' : attributes.data
                }
              }
            }else if(attributes.type === 'RECYCLE DAY'){
              if(properties.sanitation){
                properties.sanitation.recycling = attributes.data
              }else{
                properties.sanitation = {
                  'recycling' : attributes.data
                }
              }
            }else if(attributes.type === 'ZONING OVERLAYS'){
              properties.zoningOverlays = attributes.data;
            }else{
              //Do nothing
            }
          }
          q.resolve(properties);
        });
        return q.promise;
    };


    var setPropertiesWithOwnerAccountNumber = function(ownerAccoutNumber){
      var q = $q.defer();
      q.resolve('owner');
      return q.promise;
    };

    var setPropertiesWithACommaSeperatedStringOfCenterlineIds = function(stringOfCenterlineIds){
      console.log('doing setPropertiesWithACommaSeperatedStringOfCenterlineIds')
      console.log(stringOfCenterlineIds);
      var q = $q.defer();
      //get civicaddressid's along the street using xref table
      var xrefTableId = ArcGisServer.featureService.getId('coagis.gisowner.coa_civicaddress_pinnum_centerline_xref_view', 'table');
      var queryParams = {
        'where' : 'centerline_id in (' + stringOfCenterlineIds + ')',
        'f' : 'json',
        'outFields' : 'civicaddress_id'
      };
      ArcGisServer.featureService.query(xrefTableId, queryParams)
        .then(function(xrefResults){
          console.log(xrefResults)
          var civicAddressIdsAlongTheStreet = [];
          for (var i = 0; i < xrefResults.features.length; i++) {
            civicAddressIdsAlongTheStreet.push(xrefResults.features[i].attributes.civicaddress_id)
          };
          //with civicaddressid's, query data cache for each address
          var dataCacheId = ArcGisServer.featureService.getId('coagis.gisowner.coa_overlay_data_cache', 'table');
          var queryParams = {
            'where' : 'civicaddress_id in (' + civicAddressIdsAlongTheStreet.join() + ')',
            'f' : 'json',
            'outFields' : '*'
          };
          ArcGisServer.featureService.query(dataCacheId, queryParams)
            .then(function(dataCacheResults){
              var crime = {};
              var development = {};
              for (var i = 0; i < dataCacheResults.features.length; i++) {
                var attributes = dataCacheResults.features[i].attributes;
                console.log(dataCacheResults.features[i])
                if(attributes.type === 'CRIME'){
                  if(crime[attributes.distance] === undefined){
                    crime[attributes.distance] = {};
                  }
                  var crimeArray = createArrayFromNullorString(attributes.data, ',');
                  for (var x = 0; x < crimeArray.length; x++) {
                    if(!crime[attributes.distance][crimeArray[x]]){
                      crime[attributes.distance][crimeArray[x]] = 'crime';
                    }
                  }; 
                }else if(attributes.type === 'PERMITS'){
                  if(development[attributes.distance] === undefined){
                    development[attributes.distance] = {};
                  }
                  var developmentArray = createArrayFromNullorString(attributes.data, ',');
                  for (var x = 0; x < developmentArray.length; x++) {
                    if(!development[attributes.distance][developmentArray[x]]){
                      development[attributes.distance][developmentArray[x]] = 'development';
                    }
                  };
                }
              };
              console.log('crime');
              console.log(crime);
              //put unique values in an array for crime and development
              for(var key in crime){
                var tempArray = [];
                for(var subkey in crime[key]){
                  tempArray.push([subkey])
                }

                assignValueToProperties('crime', key, tempArray);
              }
              for(var key in development){
                var tempArray = [];
                for(var subkey in development[key]){
                  tempArray.push([subkey])
                }
                assignValueToProperties('development', key, tempArray);
              }
              console.log('properties');
              console.log(properties);
              q.resolve(properties);
            });

          
        });
      return q.promise;
    };

    var setPropertiesWithNeighborhoodName = function(stringOfCenterlineIds){
      var q = $q.defer();
      q.resolve('neighborhood');
      return q.promise;
    };

    var setPropertiesWithPin = function(stringOfCenterlineIds){
      var q = $q.defer();
      q.resolve('PIN');
      return q.promise;
    };

    var rebuildPropertiesFromATypeAndAnId = function(location){
      console.log('rebuildPropertiesFromATypeAndAnId');
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

  	IdProperties.properties = function(idProperties){
      console.log('idProperties');
      console.log(idProperties);
      var q = $q.defer();
  		if(idProperties){
  			properties.address = idProperties;
        if(idProperties.attributes.Loc_name === 'address' || idProperties.attributes.Loc_name === 'civicaddress_id'){
          setPropertiesWithCivicAddressId(idProperties.attributes.User_fld)
            .then(function(properties){
              q.resolve(properties);
            });
        }else if(idProperties.attributes.Loc_name === 'owner_name'){
          setPropertiesWithOwnerAccountNumber(idProperties.attributes.User_fld)
            .then(function(properties){
              q.resolve(properties);
            });
        }else if(idProperties.attributes.Loc_name === 'street_name'){
          //q.resolve(properties);
          
          setPropertiesWithACommaSeperatedStringOfCenterlineIds(idProperties.attributes.User_fld)
            .then(function(properties){
              q.resolve(properties);
            });
        }else if(idProperties.attributes.Loc_name === 'neighborhood'){
          setPropertiesWithNeighborhoodName(idProperties.attributes.User_fld)
            .then(function(properties){
              q.resolve(properties);
            });
        }else if(idProperties.attributes.Loc_name === 'pinnum'){
          setPropertiesWithPin(idProperties.attributes.User_fld)
            .then(function(properties){
              q.resolve(properties);
            });
        }else{
          //Do nothing
        }
  			
  		}else{
        if(!properties.address){
          if($stateParams.id){
            rebuildPropertiesFromATypeAndAnId($stateParams.id)
              .then(function(properties){
                q.resolve(properties);
              })
          }else{
            $state.go('main');
          }
        }else{
          q.resolve(properties);
        }
        
  			
  		}
      return q.promise;
    };


    //****Return the factory object****//
    return IdProperties; 

    
}]); //END IdProperties factory function