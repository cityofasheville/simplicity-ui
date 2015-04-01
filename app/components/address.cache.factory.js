simplicity.factory('AddressCache', ['$http', '$q', '$stateParams', 'simplicityBackend',
  function($http, $q, $stateParams, simplicityBackend){

    //factory object (this is what gets produced in the factory)
    var AddressCache = {};

    //container for address cache properties
    var addressCache = {};
    var pinnum2civicaddressid = {};
    var civicaddressIdArray = [];

  
    //Creates an array from a null value or a string
    //converts null to empty array and splits string on delimiter
    var createArrayFromNullorString = function(value, delimiter){
      if(value === null){
        return [];
      }else{
        return value.split(delimiter);
      }
    };

    //On the addressCache object, this function either creates a parent property 
    //if none exist and then assign a property with a value to the parent property
    //Or just assigns a property with a value to the parent property on the addressCache object
    var assignValueToDataCacheProperties = function(parentPropertyName, thisPropertyName, value){
      //check if parent property already exist
      if(addressCache[parentPropertyName]){
        //assign property with value to parent property
        addressCache[parentPropertyName][thisPropertyName] = value;
      //parent property doesn't exist, so create it
      }else{
        addressCache[parentPropertyName] = {};
        //assign property with value to parent property
        addressCache[parentPropertyName][thisPropertyName] = value;
      }
    };

    var addGeoJsonForSearchToDataCache = function(idArray){
      //use $q promises to handle the http request asynchronously
      var q = $q.defer();

      var o = {
        'address' : {
          'table' : 'addresses',
          'queryValues' : {'civicaddressIds' : idArray.join()}
        },
        'street_name' : {
          'table' : 'streets',
          'queryValues' : {'centerlineIds' : idArray.join()}
        },
        'neighborhood' : {
          'table' : 'neighborhoods',
          'queryValues' : {'neighborhoodNames' : idArray.join()}
        },
        'owner_name' : {
          'table' : 'addresses',
          'queryValues' : {'civicaddressIds' : idArray.join()}
        }
      };

      if(o[$stateParams.searchby]){
        simplicityBackend.simplicityQuery(o[$stateParams.searchby].table, o[$stateParams.searchby].queryValues)
          .then(function(results){
            addressCache.searchGeojson = results;
            q.resolve();
          });
      }else{
        q.resolve();
      }  
        
      return q.promise;
    };

    //Queries backend data cache for a single civicaddress id, updates the addressCache variable, and return updated addressCache variable
    var queryDataCacheWithASingleId = function(id){

      //use $q promises to handle the http request asynchronously
      var q = $q.defer();

      //make request
      simplicityBackend.simplicityQuery('addressCaches', {'civicaddressId' : id})
        //callback when request is complete
        .then(function(dataCacheResults){
            
          for (var i = 0; i < dataCacheResults.features.length; i++) {
            //assign iterator to properties to make it easier to read
            var properties = dataCacheResults.features[i].properties;
            //assign values
            if(properties.type === 'ADDRESS IN CITY'){
              addressCache.inTheCity = (properties.data === 'YES')? true : false;
            }else if(properties.type === 'CRIME'){
              assignValueToDataCacheProperties('crime', properties.distance, createArrayFromNullorString(properties.data, ','));
            }else if(properties.type === 'ZONING'){
              addressCache.zoning = createArrayFromNullorString(properties.data, ',');
            }else if(properties.type === 'PERMITS'){
              assignValueToDataCacheProperties('development', properties.distance, createArrayFromNullorString(properties.data, ','));
            }else if(properties.type === 'TRASH DAY'){
              addressCache.trash = properties.data;
            }else if(properties.type === 'RECYCLE DAY'){
              addressCache.recycling = properties.data;
            }else if(properties.type === 'ZONING OVERLAYS'){
              addressCache.zoningOverlays = properties.data;
            }else{
              //Do nothing
            }
          }
          q.resolve(addressCache);
          
        });
        return q.promise;
    };//END queryDataCacheWithASingleId function

    //Queries backend data cache with an array of civicaddress ids, updates the addressCache variable, and return updated addressCache variable
    var queryDataCacheWithAnArrayOfIds = function(ids){
      //use $q promises to handle the http request asynchronously
      var q = $q.defer();

      simplicityBackend.simplicityQuery('addressCaches', {'civicaddressIds' : ids.join()})
      //HttpRequest.get(addressCachesTableConfig.tableQueryUrl, queryParams)
        .then(function(dataCacheResults){
          var crime = {};
          var development = {};
          for (var i = 0; i < dataCacheResults.features.length; i++) {
            var properties = dataCacheResults.features[i].properties;
            if(properties.type === 'ZONING'){
              if(addressCache.zoning !== undefined){
                addressCache.zoning[properties.civicaddress_id] = createArrayFromNullorString(properties.data, ',');
              }else{
                addressCache.zoning = {};
                addressCache.zoning[properties.civicaddress_id] = createArrayFromNullorString(properties.data, ',');
              }
              //addressCache.zoning = createArrayFromNullorString(properties.data, ',');
            }else if(properties.type === 'CRIME'){
              if(crime[properties.distance] === undefined){
                crime[properties.distance] = {};
              }
              var crimeArray = createArrayFromNullorString(properties.data, ',');
              for (var x = 0; x < crimeArray.length; x++) {
                if(!crime[properties.distance][crimeArray[x]]){
                  crime[properties.distance][crimeArray[x]] = 'crime';
                }
              }
            }else if(properties.type === 'PERMITS'){
              if(development[properties.distance] === undefined){
                development[properties.distance] = {};
              }
              var developmentArray = createArrayFromNullorString(properties.data, ',');
              for (var y = 0;y < developmentArray.length; y++) {
                if(!development[properties.distance][developmentArray[y]]){
                  development[properties.distance][developmentArray[y]] = 'development';
                }
              }
            }else if(properties.type === 'ADDRESS IN CITY'){
              if(addressCache.inTheCity){
                addressCache.inTheCity[properties.civicaddress_id] = (properties.data === 'YES')? true : false;
              }else{
                addressCache.inTheCity = {};
                addressCache.inTheCity[properties.civicaddress_id] = (properties.data === 'YES')? true : false;
              }
            } 
          }
          //put unique values in an array for crime and development
          for(var crimeKey in crime){
            var crimeTempArray = [];
            for(var crimeSubkey in crime[crimeKey]){
              crimeTempArray.push([crimeSubkey]);
            }
            assignValueToDataCacheProperties('crime', crimeKey, crimeTempArray);
          }
          for(var devKey in development){
            var devTempArray = [];
            for(var devSubkey in development[devKey]){
              devTempArray.push([devSubkey]);
            }
            assignValueToDataCacheProperties('development', devKey, devTempArray);
          }
          q.resolve(addressCache);
        });
      return q.promise;
    };//END queryDataCacheWithAnArrayOfIds function

    AddressCache.query = function(){
        
      var q = $q.defer();
      addressCache = {};
      if($stateParams.searchby === 'address'){

        addGeoJsonForSearchToDataCache([$stateParams.id])
          .then(function(){
            q.resolve(queryDataCacheWithASingleId($stateParams.id));
          });
        
      }else if($stateParams.searchby === 'street_name'){
        
        var idArray = $stateParams.id.split(',');

        for (var i = 0; i < idArray.length; i++) {
          idArray[i] = Number(idArray[i]);
        }

        simplicityBackend.simplicityQuery('xrefs', {'centerlineIds' : idArray.join()})

          .then(function(xrefResults){
            civicaddressIdArray = [];
            for (var i = 0; i < xrefResults.features.length; i++) {
              civicaddressIdArray.push(xrefResults.features[i].properties.civicaddress_id);
              pinnum2civicaddressid[xrefResults.features[i].properties.pinnum] = xrefResults.features[i].properties.civicaddress_id;
            }

            addGeoJsonForSearchToDataCache(idArray)
              .then(function(){
                q.resolve(queryDataCacheWithAnArrayOfIds(civicaddressIdArray));
              });
          });
      }else if($stateParams.searchby === 'owner_name' || $stateParams.searchby === 'pinnum'){
        
        var pinArray = $stateParams.id.split(',');
        
        var pinString = '';

        for (var p = 0; p < pinArray.length; p++) {
          if(p === 0){
            pinString = pinString + "'" + pinArray[p] + "'";
          }else{
            pinString = pinString + ",'" + pinArray[p] + "'";
          }         
        }
        simplicityBackend.simplicityQuery('xrefs', {'pinnums' : pinString})
          .then(function(pinXrefResults){
            civicaddressIdArray = [];
            pinnum2civicaddressid = {};
            for (var i = 0; i < pinXrefResults.features.length; i++) {
              civicaddressIdArray.push(pinXrefResults.features[i].properties.civicaddress_id);
              pinnum2civicaddressid[pinXrefResults.features[i].properties.pinnum] = pinXrefResults.features[i].properties.civicaddress_id;
            }
            addGeoJsonForSearchToDataCache(civicaddressIdArray)
              .then(function(){
                q.resolve(queryDataCacheWithAnArrayOfIds(civicaddressIdArray));
              });
          });
      }else if($stateParams.searchby === 'neighborhood'){
        q.resolve(addGeoJsonForSearchToDataCache([$stateParams.id]));
      }

      return q.promise;
    };

    AddressCache.get = function(){
      return addressCache;
    };

    AddressCache.pinnum2civicaddressid = function(){
      return pinnum2civicaddressid;
    };

    AddressCache.civicaddressIdArray = function(){
      return civicaddressIdArray;
    };


    //****Return the factory object****//
    return AddressCache; 

    
}]); //END HttpRequest factory function




   


