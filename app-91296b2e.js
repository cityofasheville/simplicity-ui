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
              'iconClass' : 'fa-google',
              'label' : 'Google Places',
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




   



'use strict';
//keys: crimeIds, time, civicaddressId, civicaddressIds, centerlineIds, neighborhoodName, neighborhoodNames
angular.module('simplicity.arcgis.rest.api.adapter', [])
  .constant('SIMPLICITY_ARCGIS_QUERIES', {

     //            _                     
     //   ___ _ __(_)_ __ ___   ___  ___ 
     //  / __| '__| | '_ ` _ \ / _ \/ __|
     // | (__| |  | | | | | | |  __/\__ \
     //  \___|_|  |_|_| |_| |_|\___||___/                           
    'crimes' : {
      'address' : {
        'sqlArray' : ['pid in (', 'crimeIds', ') and thedate >', 'time'],
        'sqlParamName' : 'where',
        'queryParams' : {
          'where' : '',
          'f' : 'json',
          'outFields' : '*' 
        }
      },
      'street_name' : {
        'sqlArray' : ['pid in (', 'crimeIds', ') and thedate >', 'time'],
        'sqlParamName' : 'where',
        'queryParams' : {
          'where' : '',
          'f' : 'json',
          'outFields' : '*' 
        }
      },
      'neighborhood' : {
        'sqlArray' : ["neighborhood='", "neighborhoodName", "' and thedate >", "time"],
        'sqlParamName' : 'where',
        'queryParams' : {
          'where' : '',
          'f' : 'json',
          'outFields' : '*' 
        }
      }
    },
     //      _                _                                  _   
     //   __| | _____   _____| | ___  _ __  _ __ ___   ___ _ __ | |_ 
     //  / _` |/ _ \ \ / / _ \ |/ _ \| '_ \| '_ ` _ \ / _ \ '_ \| __|
     // | (_| |  __/\ V /  __/ | (_) | |_) | | | | | |  __/ | | | |_ 
     //  \__,_|\___| \_/ \___|_|\___/| .__/|_| |_| |_|\___|_| |_|\__|
     //                              |_|                             
    'development' : {
      'address' : {
        'sqlArray' : ["apn in  (", "permitIds", ") and record_module = 'Planning' and record_type_type = 'Development' and date_opened >", "time"],
        'sqlParamName' : 'where',
        'queryParams' : {
          'where' : '',
          'f' : 'json',
          'outFields' : '*' 
        }
      },
      'street_name' : {
        'sqlArray' : ["apn in  (", "permitIds", ") and record_module = 'Planning' and record_type_type = 'Development' and date_opened >", "time"],
        'sqlParamName' : 'where',
        'queryParams' : {
          'where' : '',
          'f' : 'json',
          'outFields' : '*' 
        }
      },
      'neighborhood' : {
        'sqlArray' : ["neighborhood='", "neighborhoodName", "' and record_module = 'Planning' and record_type_type = 'Development' and date_opened >", "time"],
        'sqlParamName' : 'where',
        'queryParams' : {
          'where' : '',
          'f' : 'json',
          'outFields' : '*' 
        }
      }
    },
     //            _     _                             
     //   __ _  __| | __| |_ __ ___  ___ ___  ___  ___ 
     //  / _` |/ _` |/ _` | '__/ _ \/ __/ __|/ _ \/ __|
     // | (_| | (_| | (_| | | |  __/\__ \__ \  __/\__ \
     //  \__,_|\__,_|\__,_|_|  \___||___/___/\___||___/                                                  
    'addresses' : {
      'address' : {
        'sqlArray' : ['civicaddress_id in (', 'civicaddressIds', ')'],
        'sqlParamName' : 'where',
        'queryParams' : {
          'where' : '',
          'f' : 'json',
          'outFields' : '*' 
        }
      },
      'street_name' : {
        'sqlArray' : ['civicaddress_id in (', 'civicaddressIds', ')'],
        'sqlParamName' : 'where',
        'queryParams' : {
          'where' : '',
          'f' : 'json',
          'outFields' : '*' 
        }
      },
      'owner_name' : {
        'sqlArray' : ['civicaddress_id in (', 'civicaddressIds', ')'],
        'sqlParamName' : 'where',
        'queryParams' : {
          'where' : '',
          'f' : 'json',
          'outFields' : '*' 
        }
      },
      'neighborhood' : {
        'sqlArray' : ["neighborhood = '", 'neighborhoodName', "'"],
        'sqlParamName' : 'where',
        'queryParams' : {
          'where' : '',
          'f' : 'json',
          'outFields' : '*' 
        }
      }
    },
    'neighborhoods' : {
      'neighborhood' : {
        'sqlArray' : ["name in ('", "neighborhoodNames", "')"],
        'sqlParamName' : 'where',
        'queryParams' : {
          'where' : '',
          'f' : 'json',
          'outFields' : '*' 
        }
      }
    },
     //                                  _   _           
     //  _ __  _ __ ___  _ __   ___ _ __| |_(_) ___  ___ 
     // | '_ \| '__/ _ \| '_ \ / _ \ '__| __| |/ _ \/ __|
     // | |_) | | | (_) | |_) |  __/ |  | |_| |  __/\__ \
     // | .__/|_|  \___/| .__/ \___|_|   \__|_|\___||___/
     // |_|             |_|                              
    'properties' : {
      'address' : {
        'sqlArray' : ["pinnum='", "pinnum", "'"],
        'sqlParamName' : 'where',
        'queryParams' : {
          'where' : '',
          'f' : 'json',
          'outFields' : '*' 
        }
      },
      'street_name' : {
        'sqlArray' : ["pinnum in (", "pinnums", ")"],
        'sqlParamName' : 'where',
        'queryParams' : {
          'where' : '',
          'f' : 'json',
          'outFields' : '*' 
        }
      },
      'owner_name' : {
        'sqlArray' : ["pinnum in (", "pinnums", ")"],
        'sqlParamName' : 'where',
        'queryParams' : {
          'where' : '',
          'f' : 'json',
          'outFields' : '*' 
        }
      },
      'pinnum' : {
        'sqlArray' : ["pinnum in (", "pinnums", ")"],
        'sqlParamName' : 'where',
        'queryParams' : {
          'where' : '',
          'f' : 'json',
          'outFields' : '*' 
        }
      },
    },                         
     //   _____      ___ __   ___ _ __ 
     //  / _ \ \ /\ / / '_ \ / _ \ '__|
     // | (_) \ V  V /| | | |  __/ |   
     //  \___/ \_/\_/ |_| |_|\___|_|                                                              
    'owners' : {
      'address' : {
        'sqlArray' : ["pinnum='", "pinnum", "'"],
        'sqlParamName' : 'where',
        'queryParams' : {
          'where' : '',
          'f' : 'json',
          'outFields' : 'objectid, owner, owner_address, owner_citystatezip' 
        }
      },
      'street_name' : {
        'sqlArray' : ["pinnum in (", "pinnums", ")"],
        'sqlParamName' : 'where',
        'queryParams' : {
          'where' : '',
          'f' : 'json',
          'outFields' : 'objectid, owner, owner_address, owner_citystatezip' 
        }
      },
      'owner_name' : {
        'sqlArray' : ["pinnum in (", "pinnums", ")"],
        'sqlParamName' : 'where',
        'queryParams' : {
          'where' : '',
          'f' : 'json',
          'outFields' : 'objectid, owner, owner_address, owner_citystatezip' 
        }
      },
      'pinnum' : {
        'sqlArray' : ["pinnum in (", "pinnums", ")"],
        'sqlParamName' : 'where',
        'queryParams' : {
          'where' : '',
          'f' : 'json',
          'outFields' : 'objectid, owner, owner_address, owner_citystatezip'  
        }
      },
    },
     //                 _                                   _                 
     //  _______  _ __ (_)_ __   __ _    _____   _____ _ __| | __ _ _   _ ___ 
     // |_  / _ \| '_ \| | '_ \ / _` |  / _ \ \ / / _ \ '__| |/ _` | | | / __|
     //  / / (_) | | | | | | | | (_| | | (_) \ V /  __/ |  | | (_| | |_| \__ \
     // /___\___/|_| |_|_|_| |_|\__, |  \___/ \_/ \___|_|  |_|\__,_|\__, |___/
     //                         |___/                               |___/     
    'zoningOverlays' : {
      'address' : {
        'sqlArray' : ["name='", "zoningOverlayName", "'"],
        'sqlParamName' : 'where',
        'queryParams' : {
          'where' : '',
          'f' : 'json',
          'outFields' : '*' 
        }
      },
      'street_name' : {
        'sqlArray' : ["name='", "zoningOverlayName", "'"],
        'sqlParamName' : 'where',
        'queryParams' : {
          'where' : '',
          'f' : 'json',
          'outFields' : '*' 
        }
      },
      'owner_name' : {
        'sqlArray' : ["name='", "zoningOverlayName", "'"],
        'sqlParamName' : 'where',
        'queryParams' : {
          'where' : '',
          'f' : 'json',
          'outFields' : '*' 
        }
      },
      'pinnum' : {
        'sqlArray' : ["name='", "zoningOverlayName", "'"],
        'sqlParamName' : 'where',
        'queryParams' : {
          'where' : '',
          'f' : 'json',
          'outFields' : '*' 
        }
      }
    },
     //      _                 _       
     //  ___| |_ _ __ ___  ___| |_ ___ 
     // / __| __| '__/ _ \/ _ \ __/ __|
     // \__ \ |_| | |  __/  __/ |_\__ \
     // |___/\__|_|  \___|\___|\__|___/                               
    'streets' : {
      'address' : {
        'sqlArray' : ['centerline_id in (', 'centerlineIds', ')'],
        'sqlParamName' : 'where',
        'queryParams' : {
          'where' : '',
          'f' : 'json',
          'outFields' : '*' 
        }
      },
      'street_name' : {
        'sqlArray' : ['centerline_id in (', 'centerlineIds', ')'],
        'sqlParamName' : 'where',
        'queryParams' : {
          'where' : '',
          'f' : 'json',
          'outFields' : '*' 
        }
      },
    },
     //                                         __                              
     //   ___ _ __ ___  ___ ___       _ __ ___ / _| ___ _ __ ___ _ __   ___ ___ 
     //  / __| '__/ _ \/ __/ __|_____| '__/ _ \ |_ / _ \ '__/ _ \ '_ \ / __/ _ \
     // | (__| | | (_) \__ \__ \_____| | |  __/  _|  __/ | |  __/ | | | (_|  __/
     //  \___|_|  \___/|___/___/     |_|  \___|_|  \___|_|  \___|_| |_|\___\___|                                                                         
    'xrefs' : {
      'address' : {
        'sqlArray' : ['civicaddress_id=', 'civicaddressId'],
        'sqlParamName' : 'where',
        'queryParams' : {
          'where' : '',
          'f' : 'json',
          'outFields' : '*' 
        }
      },
      'street_name' : {
        'sqlArray' : ['centerline_id in (', 'centerlineIds', ')'],
        'sqlParamName' : 'where',
        'queryParams' : {
          'where' : '',
          'f' : 'json',
          'outFields' : '*' 
        }
      },
      'owner_name' : {
        'sqlArray' : ['pinnum in (', 'pinnums', ')'],
        'sqlParamName' : 'where',
        'queryParams' : {
          'where' : '',
          'f' : 'json',
          'outFields' : '*' 
        }
      },
      'pinnum' : {
        'sqlArray' : ['pinnum in (', 'pinnums', ')'],
        'sqlParamName' : 'where',
        'queryParams' : {
          'where' : '',
          'f' : 'json',
          'outFields' : '*' 
        }
      },
    },
     //            _     _                                    _          
     //   __ _  __| | __| |_ __ ___  ___ ___    ___ __ _  ___| |__   ___ 
     //  / _` |/ _` |/ _` | '__/ _ \/ __/ __|  / __/ _` |/ __| '_ \ / _ \
     // | (_| | (_| | (_| | | |  __/\__ \__ \ | (_| (_| | (__| | | |  __/
     //  \__,_|\__,_|\__,_|_|  \___||___/___/  \___\__,_|\___|_| |_|\___|                                                                    
    'addressCaches' : {
      'address' : {
        'sqlArray' : ['civicaddress_id=', 'civicaddressId'],
        'sqlParamName' : 'where',
        'queryParams' : {
          'where' : '',
          'f' : 'json',
          'outFields' : '*' 
        }
      },
      'street_name' : {
        'sqlArray' : ['civicaddress_id in (', 'civicaddressIds', ')'],
        'sqlParamName' : 'where',
        'queryParams' : {
          'where' : '',
          'f' : 'json',
          'outFields' : '*' 
        }
      },
      'owner_name' : {
        'sqlArray' : ['civicaddress_id in (', 'civicaddressIds', ')'],
        'sqlParamName' : 'where',
        'queryParams' : {
          'where' : '',
          'f' : 'json',
          'outFields' : '*' 
        }
      },
      'pinnum' : {
        'sqlArray' : ['civicaddress_id in (', 'civicaddressIds', ')'],
        'sqlParamName' : 'where',
        'queryParams' : {
          'where' : '',
          'f' : 'json',
          'outFields' : '*' 
        }
      }
    }
  })
  .factory('simplicityArcGisRestApiAdapter', ['$http', '$location', '$q', '$filter', 'SEARCH_CONFIG',
  function($http, $location, $q, $filter, SEARCH_CONFIG){
    

    var simplicityArcGisRestApiAdapter = {};

    //Object maps more user friendly labels to 'searchby' group names
    var nameKey = {
      'street_name' : 'Streets',
      'address' : 'Addresses',
      'neighborhood' : 'Neighborhoods',
      'owner_name' : 'Owners',
      'civicaddressid' : 'Civic Address IDs',
      'pinnum' : 'PINs'
    };

    //Object maps icon classess to 'searchby' group names
    var iconClassKey = {
      'street_name' : 'fa-road',
      'address' : 'fa-home',
      'neighborhood' : 'fa-users',
      'owner_name' : 'fa-user',
      'civicaddressid' : 'fa-cube',
      'pinnum' : 'fa-cube'
    };

    // +-+-+-+-+-+-+ +-+-+-+-+-+-+-+-+-+
    // |h|e|l|p|e|r| |f|u|n|c|t|i|o|n|s|
    // +-+-+-+-+-+-+ +-+-+-+-+-+-+-+-+-+
    var getGroupLabel = function(unformattedGroupName){
      return nameKey[unformattedGroupName];
    };

    //Returns the 
    var getIconClass = function(unformattedGroupName){
      return iconClassKey[unformattedGroupName];
    };


    // +-+-+-+-+-+-+ +-+-+-+-+-+-+-+-+ +-+-+-+-+-+-+-+
    // |f|o|r|m|a|t| |g|e|o|c|o|d|e|r| |r|e|s|u|l|t|s|
    // +-+-+-+-+-+-+ +-+-+-+-+-+-+-+-+ +-+-+-+-+-+-+-+

    var formatEsriCompositeGeocoderResults = function(searchText, compositeGeocoderResults){
      //Results from geocoding are displayed by group
      var groupsObj = {};
      var searchGroups = [];
      var groupOrderPosition = 0;

      //Loop over search results and put them into groups by Loc_name
      //see getTabLabel above for keys
      for(var i = 0; i < compositeGeocoderResults.candidates.length; i++){
        var result = {
          'id' :  compositeGeocoderResults.candidates[i].attributes.User_fld,
          'label' : compositeGeocoderResults.candidates[i].attributes.Match_addr,
          'type' : compositeGeocoderResults.candidates[i].attributes.Loc_name,
          'googleResult' : false
        };
        if(groupsObj[result.type] === undefined){
          var tempObj = {
            'name' : result.type,
            'groupOrder' : groupOrderPosition,
            'offset' : 3,
            'iconClass' : getIconClass(result.type),
            'label' : getGroupLabel(result.type),
            'results' : [result]
          };
          groupsObj[result.type] = tempObj;
          groupOrderPosition += 1;
        }else{
          groupsObj[result.type].results.push(result);
        }
      }

      //Add results to results array
      for(var x in groupsObj){
        searchGroups.push(groupsObj[x]);
      }

      //sort the tabs array by the groupOrder property
      searchGroups.sort(function(a, b){
        return a.groupOrder - b.groupOrder;
      });

      //if the searchText begins with a number shuffle streets and addresses if needed
      if(searchGroups[0] !== undefined){
        if(searchGroups[1] !== undefined){
          //the ESRI geocoder gives precendence to streets over addresses
          //if there are both streets and address results and the search text begins with a number
          //move addresses to the first tab position
          if(searchGroups[0].name === 'street_name' && searchGroups[1].name === 'address' && !isNaN(Number(searchText[0]))){
            var tempAddressArray = searchGroups[1];
            searchGroups.splice(1,1);
            searchGroups.splice(0,0,tempAddressArray);
          }
          if(searchGroups[1].name === 'street_name' && searchGroups[0].name === 'address' && isNaN(Number(searchText[0]))){
            var tempStreetArray = searchGroups[1];
            searchGroups.splice(1,1);
            searchGroups.splice(0,0,tempStreetArray);
          }
        }
      }

      //Owners can own multiple properties and streets can have multiple centerline ids
      //This makes the geocoder results appear to have duplicates
      //We'll group by label and concat the ids stored in the id into the id of the 
      //grouped object seperated by commas
      for (var j = 0; j < searchGroups.length; j++) {
        if(searchGroups[j].name === 'owner_name' || searchGroups[j].name === 'street_name'){
          var tObj = {};
          for (var b = 0; b < searchGroups[j].results.length; b++) {
            if(tObj[searchGroups[j].results[b].label] === undefined){
              tObj[searchGroups[j].results[b].label] = searchGroups[j].results[b];
              tObj[searchGroups[j].results[b].label].id = searchGroups[j].results[b].id;
            }else{
              tObj[searchGroups[j].results[b].label].id += "," + searchGroups[j].results[b].id;
            } 
          }

          var tempTabArray = [];
          for(var y in tObj){
            tempTabArray.push(tObj[y]);
          }
          searchGroups[j].results = tempTabArray;
        }            
      }

      return searchGroups;
    };//END formatEsriCompositeGeocoderResults function


    simplicityArcGisRestApiAdapter.search = function(url, searchText){
      //use $q promises to handle the http request asynchronously
      var q = $q.defer();

      //define query parameters
      var params = {
        'SingleLine' : searchText,
        'outFields' : 'Match_addr, User_fld, Loc_name',
        'f' : 'json'
      };
      
      //make http request
      $http({method : 'GET', url : url, params : params, cache : true})
        //callbacks
        .success(function(data, status, headers, config){
          if(data.error){
            console.log(data.error.code + ' geocodeService.findAddressCanidates ' + data.error.message);
          }else{
            q.resolve(formatEsriCompositeGeocoderResults(searchText, data));
          }
        })
        .error(function(error){
          console.log('Error geocoding ' + searchText);
          console.log(error);
          q.resolve(error);
        });

      //return the promise using q
      return q.promise;

    };


    simplicityArcGisRestApiAdapter.formatHttpResults = function(data){

      var featuresArray = [];

      for (var i = 0; i < data.features.length; i++) {
        featuresArray.push(L.esri.Util.arcgisToGeojson(data.features[i]));
      }

      var geoJson = {
        'type' : 'FeatureCollection',
        'features' : featuresArray
      };

      //return the promise using q
      return geoJson;
    };

    simplicityArcGisRestApiAdapter.formatTimeForQuery = function(jsDate){

      //So we can filter by time
      var d = new Date(jsDate);
      var year = d.getFullYear();
      var month = d.getMonth() + 1;
      var date = d.getDate();

      //!!! TODO: THIS IS AN ESRI FORMATTED DATE, NEED TO ABSTRACT 
      var timeExpression = "'" + year + "-" + month + "-" + date + "'";

      return timeExpression;
    };



    //****Return the factory object****//
    return simplicityArcGisRestApiAdapter; 

    
}]); //END simplicityArcGisRestApiAdapter factory function



   



//All HTTP requests are routed this this module
angular.module('simplicity.http', [])
  .factory('simplicityHttp', ['$http', '$q',
    function($http, $q){

      var simplicityHttp = {};

      //Makes a GET request to a url query params defined as key-value pairs in the options object
      simplicityHttp.get = function(url, options){
        //use $q promises to handle the http request asynchronously
        var q = $q.defer();
        //make http request
        $http({method : 'GET', url : url, params : options, cache : true})
          //callbacks
          .success(function(data, status, headers, config){
            if(data.error){
                console.log(data.error.code + ' queryBackend on url ' + url + '. ' + data.error.message);
            }else{
                q.resolve(data);
            }
          })
          .error(function(error){
              console.log('Error querying feature service.');
              console.log(error);
          });

        //return the promise using q
        return q.promise;
      };//END queryBackend function

      //builds query params from a queryTemplate defined in a adapter file (eg. simplicity.arcgis.rest.api.adapter.js)
      //and an object of queryValues to inject into the queryTemplate
      simplicityHttp.buildQueryParams = function(queryTemplate, queryValues){

        var sqlArray = [];

        for (var i = 0; i < queryTemplate.sqlArray.length; i++) {

          if(queryValues[queryTemplate.sqlArray[i]] !== undefined){
            sqlArray.push(queryValues[queryTemplate.sqlArray[i]]);
          }else{
            sqlArray.push(queryTemplate.sqlArray[i]);
          }
        }

        var sqlExpression = sqlArray.join('');
        
        var queryParams = queryTemplate.queryParams;

        queryParams[queryTemplate.sqlParamName] = sqlExpression;

        return queryParams;
      };


      //****Return the factory object****//
      return simplicityHttp; 

      
  }]); //END simplicityHttp factory function
//keywords crimeIds, time(time needs some formatting), neighborhoodName
angular.module('simplicity.frontend.config', [])
  .constant('COLORS', {
    'crime' : {
      'Aggravated Assault' : 'FF0000',
      'Burglary' : 'FFF000',
      'Drug Arrest' : 'FFA500',
      'Homicide' : 'FFFFF0',
      'Larceny' : '00FF00',
      'Larceny of Motor Vehicle' : '000080',
      'Rape' : '0000FF',
      'Robbery' : 'FF00FF',
      'Vandalism' : '7FFFD4'
    },
    'development' : {
        'Conditional Use Permit':'FF0000',
        'Conditional Zoning Permit':'FFF000',
        'Planning Level I':'0000FF',
        'Planning Level II':'7FFFD4',
        'Planning Level III':'00FFFF',
        'Planning Signage Plan':'000080'
    },
    'streetmaintenance' : {
      'CITY OF ASHEVILLE' : {'color' : 'FF0000'},
      'PRIVATE' : {'color' : 'FFF000'},
      'UNKNOWN' : {'color' : 'FFA500'},
      'NCDOT' : {'color' : '00FF00'},
      'NATIONAL PARK SERVICE' : {'color' : '000080'}
    }
  })
  //The extent values are in feet
  //Make sure that if you change the timeframe values here, that you ALSO!!!! change the TimeFrame factory below
  .constant('SELECT_OPTIONS', {
      'extent' : [
        {'value' : 82.5, 'label' : 'a quarter block (27.5 yards)'},
        {'value' : 165, 'label' : 'half a block (55 yards)'},
        {'value' : 330, 'label' : 'a city block (110 yards)'},
        {'value' : 660, 'label' : 'a couple city blocks (1/8 mile)'},
        {'value' : 1320, 'label' : 'a quarter mile'}   
      ],
      'timeframe' : [
        {'value' : 'last-30-days', 'label' : 'the last 30 days'},
        {'value' : 'last-6-months', 'label' : 'the last 6 months'},
        {'value' : 'last-year', 'label' : 'the last year'},
        {'value' : 'last-5-years', 'label' : 'the last 5 years'},
        {'value' : 'last-10-years', 'label' : 'the last 10 years'},
        {'value' : 'all-time', 'label' : 'all time'}
      ]
    })
  .constant('DESCRIPTIONS', {
      'crime' : {
        'Aggravated Assault' : 'The unlawful attack by one person upon another for the purpose of inflicting severe bodily harm.',
        'Burglary' : 'The unlawful entry of a structure to commit a felony or theft.',
        'Drug Arrest' : 'State and/or local offenses relating to the unlawful possession, sale, use, growing, manufacturing, and making of narcotic drugs including opium or cocaine and their derivatives, marijuana, synthetic narcotics, and dangerous nonnarcotic drugs such as barbiturates.',
        'Homicide' : 'The willful (nonnegligent) killing of one human being by another.',
        'Larceny' : 'The unlawful taking or stealing of property without the use of force, violence, or fraud.',
        'Larceny of Motor Vehicle' : 'The unlawful taking or stealing of a motor vehicle, including attempts.',
        'Rape' : 'The carnal knowledge of a female forcibly and against her will.',
        'Robbery' : 'The taking or attempting to take anything of value by force or threat.',
        'Vandalism' : 'The malicious destruction, injury, disfigurement or defacement of real or personal property.'
      },
      'development' : {
        'Conditional Use Permit':'All Level III projects or use is determined to require a conditional use permit by the zoning district where it is located.',
        'Conditional Zoning Permit':'Changing the zoning of a property for a specific site plan and specific use.',
        'Planning Level I':'Commercial construction less than 35,000 square feet or less than 20 multi-family units; Level I permits are reviewed at the city staff level.',
        'Planning Level II':'Commercial construction 35,000-100,000 square feet or 20-50 multi-family units; Level II projects are reviewed by city staff, the Technical Review Committee (TRC), and the Planning and Zoning Commission.',
        'Planning Level III':'Commercial construction larger than 100,000 square feet or more than 50 multi-family units; Level III projects are reviewed by city staff, the Technical Review Committee (TRC), the Planning and Zoning Commission and Asheville City Council.',
        'Planning Signage Plan':''
      }
    })
  .constant('STREET_MAINTENANCE_CONTACTS', {
      'NCDOT' : 'https://apps.dot.state.nc.us/contactus/PostComment.aspx?Unit=PIO',
      'CITY OF ASHEVILLE' : 'http://www.ashevillenc.gov/Departments/StreetServices/StreetMaintenance.aspx',
      'PRIVATE' : null,
      'UNKNOWN' : null,
      'NATIONAL PARK SERVICE' : 'http://www.nps.gov/blri/contacts.htm'
    })
  .constant('STREET_MAINTENANCE_CITIZEN_SERVICE_REQUESTS', {
      'NCDOT' : {'brand' : null, 'url' : null},
      'CITY OF ASHEVILLE' : {'brand' : "The Asheville App", 'url' : 'http://www.ashevillenc.gov/Departments/ITServices/OnlineServices/CitizenServiceRequests.aspx'},
      'PRIVATE' : {'brand' : null, 'url' : null},
      'UNKNOWN' : {'brand' : null, 'url' : null},
      'NATIONAL PARK SERVICE' : {'brand' : null, 'url' : null},
    })
  //These are the correct zoning code links for asheville, the ones in the database are wrong
  .constant('CODELINKS', {
      'CBD' : 'https://www.municode.com/library/nc/asheville/codes/code_of_ordinances?nodeId=PTIICOOR_CH7DE_ARTVIIIGEUSDI_S7-8-18CEBUDI',
      'CBI' : 'https://www.municode.com/library/nc/asheville/codes/code_of_ordinances?nodeId=PTIICOOR_CH7DE_ARTVIIIGEUSDI_S7-8-12COBUIDI',
      'CBII' : 'https://www.municode.com/library/nc/asheville/codes/code_of_ordinances?nodeId=PTIICOOR_CH7DE_ARTVIIIGEUSDI_S7-8-13COBUIIDI',
      'CBII-CZ' : 'disable',
      'CI' : 'https://www.municode.com/library/nc/asheville/codes/code_of_ordinances?nodeId=PTIICOOR_CH7DE_ARTVIIIGEUSDI_S7-8-20COINDI',
      'HB' : 'https://www.municode.com/library/nc/asheville/codes/code_of_ordinances?nodeId=PTIICOOR_CH7DE_ARTVIIIGEUSDI_S7-8-16HIBUDI',
      'HB-CZ' : 'disable',
      'HCU' : 'https://www.municode.com/library/nc/asheville/codes/code_of_ordinances?nodeId=PTIICOOR_CH7DE_ARTIXOVDI_S7-9-2HIPROVDI',
      'HR-1:CORE' : 'disable',
      'HR-2:EXPN' : 'disable',
      'HR-3:CRDR' : 'disable',
      'HR-4:TRAD' : 'disable',
      'HR-5:L-W' : 'disable',
      'HR-6:TOWN' : 'disable',
      'IND' : 'https://www.municode.com/library/nc/asheville/codes/code_of_ordinances?nodeId=PTIICOOR_CH7DE_ARTVIIIGEUSDI_S7-8-22INDI',
      'IND-CZ' : 'disable',
      'INST' : 'https://www.municode.com/library/nc/asheville/codes/code_of_ordinances?nodeId=PTIICOOR_CH7DE_ARTVIIIGEUSDI_S7-8-15INDI',
      'INST-CZ' : 'disable',
      'LI' : 'https://www.municode.com/library/nc/asheville/codes/code_of_ordinances?nodeId=PTIICOOR_CH7DE_ARTVIIIGEUSDI_S7-8-21LIINDI',
      'NB' : 'https://www.municode.com/library/nc/asheville/codes/code_of_ordinances?nodeId=PTIICOOR_CH7DE_ARTVIIIGEUSDI_S7-8-8NEBUDI',
      'NCD' : 'https://www.municode.com/library/nc/asheville/codes/code_of_ordinances?nodeId=PTIICOOR_CH7DE_ARTVIIIGEUSDI_S7-8-24NECODI',
      'NOT ZONED' : 'disable',
      'O2' : 'https://www.municode.com/library/nc/asheville/codes/code_of_ordinances?nodeId=PTIICOOR_CH7DE_ARTVIIIGEUSDI_S7-8-10OFIIDI',
      'OB' : 'https://www.municode.com/library/nc/asheville/codes/code_of_ordinances?nodeId=PTIICOOR_CH7DE_ARTVIIIGEUSDI_S7-8-11OFBUDI',
      'OFFICE' : 'https://www.municode.com/library/nc/asheville/codes/code_of_ordinances?nodeId=PTIICOOR_CH7DE_ARTVIIIGEUSDI_S7-8-9OFDI',
      'RB' : 'https://www.municode.com/library/nc/asheville/codes/code_of_ordinances?nodeId=PTIICOOR_CH7DE_ARTVIIIGEUSDI_S7-8-17REBUDI',
      'RB-CU' : 'disable',
      'RESORT' : 'https://www.municode.com/library/nc/asheville/codes/code_of_ordinances?nodeId=PTIICOOR_CH7DE_ARTVIIIGEUSDI_S7-8-14REDI',
      'RIVER' : 'https://www.municode.com/library/nc/asheville/codes/code_of_ordinances?nodeId=PTIICOOR_CH7DE_ARTVIIIGEUSDI_S7-8-19RIDI',
      'RM16' : 'https://www.municode.com/library/nc/asheville/codes/code_of_ordinances?nodeId=PTIICOOR_CH7DE_ARTVIIIGEUSDI_S7-8-7RMREMUMIHIDEDI',
      'RM16-CZ' : 'disable',
      'RM6' : 'https://www.municode.com/library/nc/asheville/codes/code_of_ordinances?nodeId=PTIICOOR_CH7DE_ARTVIIIGEUSDI_S7-8-5REMUMILODEDI',
      'RM6-CZ' : 'disable',
      'RM8' : 'https://www.municode.com/library/nc/asheville/codes/code_of_ordinances?nodeId=PTIICOOR_CH7DE_ARTVIIIGEUSDI_S7-8-6REMUMIMEDEDI',
      'RS2' : 'https://www.municode.com/library/nc/asheville/codes/code_of_ordinances?nodeId=PTIICOOR_CH7DE_ARTVIIIGEUSDI_S7-8-2RESIMILODEDI',
      'RS4' : 'https://www.municode.com/library/nc/asheville/codes/code_of_ordinances?nodeId=PTIICOOR_CH7DE_ARTVIIIGEUSDI_S7-8-3RESIMIMEDEDI',
      'RS4-CZ' : 'disable',
      'RS8' : 'https://www.municode.com/library/nc/asheville/codes/code_of_ordinances?nodeId=PTIICOOR_CH7DE_ARTVIIIGEUSDI_S7-8-4RESIMIHIDEDI',
      'RS8-CZ' : 'disable',
      'UP' : 'https://www.municode.com/library/nc/asheville/codes/code_of_ordinances?nodeId=PTIICOOR_CH7DE_ARTVIIIGEUSDI_S7-8-26URPLDI',
      'UP-CZ' : 'disable',
      'URD' : 'https://www.municode.com/library/nc/asheville/codes/code_of_ordinances?nodeId=PTIICOOR_CH7DE_ARTVIIIGEUSDI_S7-8-25URREDI',
      'UV' : 'https://www.municode.com/library/nc/asheville/codes/code_of_ordinances?nodeId=PTIICOOR_CH7DE_ARTVIIIGEUSDI_S7-8-23URVIDI',
    })
  .factory('TimeFrame', [
    function(){

      var TimeFrame = {};

      
      TimeFrame.get = function(timeframe){
        
        var d = new Date();
        
        if(timeframe === 'last-30-days'){
          d.setMonth(d.getMonth() - 1);
        }else if (timeframe === 'last-6-months') {
          d.setMonth(d.getMonth() - 6);
        }else if(timeframe === 'last-year'){
          d.setFullYear(d.getFullYear()-1);
        }else if(timeframe === 'last-5-years'){
          d.setFullYear(d.getFullYear()-5);
        }else if(timeframe === 'last-10-years'){
          d.setFullYear(d.getFullYear()-10);
        }else if(timeframe === 'all-time'){
          d.setFullYear(d.getFullYear()-100);
        }else{
          d.setMonth(d.getMonth() - 1);
        }

        return d;
      };


      //****Return the factory object****//
      return TimeFrame;   
  }]); //END TimeFrame factory function



 
  



angular.module('simplicity.backend.config', ['simplicity.arcgis.rest.api.adapter', 'simplicity.google.place.api.adapter', 'simplicity.http'])
  .constant('TABLES', {
    'crimes' : {
      'url' : 'http://arcgis-arcgisserver1-1222684815.us-east-1.elb.amazonaws.com/arcgis/rest/services/opendata/FeatureServer/0/query',
      'dataApi' : 'ArcGisRestApi'
    },
    'development' : {
      'url' : 'http://arcgis-arcgisserver1-1222684815.us-east-1.elb.amazonaws.com/arcgis/rest/services/opendata/FeatureServer/1/query',
      'dataApi' : 'ArcGisRestApi'
    },
    'addresses' : {
      'url' : 'http://arcgis-arcgisserver1-1222684815.us-east-1.elb.amazonaws.com/arcgis/rest/services/opendata/FeatureServer/2/query',
      'dataApi' : 'ArcGisRestApi'
    },
    'neighborhoods' : {
      'url' : 'http://arcgis-arcgisserver1-1222684815.us-east-1.elb.amazonaws.com/arcgis/rest/services/opendata/FeatureServer/4/query',
      'dataApi' : 'ArcGisRestApi'
    },  
    'properties' : {
      'url' : 'http://arcgis-arcgisserver1-1222684815.us-east-1.elb.amazonaws.com/arcgis/rest/services/opendata/FeatureServer/6/query',
      'dataApi' : 'ArcGisRestApi'
    },
    'owners' : {
      'url' : 'http://arcgis-arcgisserver1-1222684815.us-east-1.elb.amazonaws.com/arcgis/rest/services/opendata/FeatureServer/6/query',
      'dataApi' : 'ArcGisRestApi'
    },
    'zoningOverlays' : {
      'url' : 'http://arcgis-arcgisserver1-1222684815.us-east-1.elb.amazonaws.com/arcgis/rest/services/opendata/FeatureServer/8/query',
      'dataApi' : 'ArcGisRestApi'
    },
    'streets' : {
      'url' : 'http://arcgis-arcgisserver1-1222684815.us-east-1.elb.amazonaws.com/arcgis/rest/services/opendata/FeatureServer/9/query',
      'dataApi' : 'ArcGisRestApi'
    },
    'xrefs' : {
      'url' : 'http://arcgis-arcgisserver1-1222684815.us-east-1.elb.amazonaws.com/arcgis/rest/services/opendata/FeatureServer/11/query',
      'dataApi' : 'ArcGisRestApi'
    },
    'addressCaches' : {
      'url' : 'http://arcgis-arcgisserver1-1222684815.us-east-1.elb.amazonaws.com/arcgis/rest/services/opendata/FeatureServer/12/query',
      'dataApi' : 'ArcGisRestApi'
    }
  })
  .constant('SEARCH_CONFIG', {
    'searchUrl' : 'http://arcgis-arcgisserver1-1222684815.us-east-1.elb.amazonaws.com/arcgis/rest/services/coa_composite_locator/GeocodeServer/findAddressCandidates',
    'returnFields' : ['Match_addr', 'User_fld', 'Loc_name'],
    'searchEngine' : 'ArcGisRestApiGeocoder'
  })
  .factory('simplicityBackend', ['$http', '$location', '$q', '$filter', '$stateParams', 'simplicityHttp', 'simplicityArcGisRestApiAdapter', 'simplicityGooglePlacesApiAdapter', 'SIMPLICITY_ARCGIS_QUERIES', 'TABLES', 'SEARCH_CONFIG',
    function($http, $location, $q, $filter, $stateParams, simplicityHttp, simplicityAdapter, googlePlacesApiAdapter, QUERIES, TABLES, SEARCH_CONFIG){
      
      //The factory object (this is what will be returned from the factory)
      var simplicityBackend = {};


      simplicityBackend.simplicitySearch = function(searchText){
        var q = $q.defer();

        var searchResultsArray = [];

        //should I check the dataApi property here? or only allow one dataApi for all tables
        //if I allow multiple dataApis, I won't be able to inject adapters as a generic simplicityAdapter
        simplicityAdapter.search(SEARCH_CONFIG.searchUrl, searchText)
          .then(function(searchResults){
            searchResultsArray = searchResults;
            googlePlacesApiAdapter.search(searchText)
              .then(function(googleResults){
                if(googleResults === 'no google results'){
                  q.resolve(searchResultsArray);
                }else{
                  searchResultsArray.push(googleResults);
                  q.resolve(searchResultsArray);
                }
              });

          });
        return q.promise;
      };

      simplicityBackend.simplicityQuery = function(table, queryValues){
        var q = $q.defer();

        var queryTemplate = QUERIES[table][$stateParams.searchby];
        var queryParams = simplicityHttp.buildQueryParams(queryTemplate, queryValues);

        simplicityHttp.get(TABLES[table].url, queryParams)
          .then(function(httpResults){
            //should I check the dataApi property here? or only allow one dataApi for all tables
            //if I allow multiple dataApis, I won't be able to inject adapters as a generic simplicityAdapter
            q.resolve(simplicityAdapter.formatHttpResults(httpResults));
          });

        return q.promise;
      };

      simplicityBackend.simplicityFindGoogleAddress = function(candidate){
        var q = $q.defer();

        googlePlacesApiAdapter.getDetails(candidate.id)
          .then(function(details){
            var searchText;
            var vicinity = candidate.label.split("|");
            var streetAddressOnly = vicinity[1].split(",");
            
            var postal_code = "";
            console.log(details.address_components);
            for (var ac = 0; ac < details.address_components.length; ac++) {
              for (var typ = 0; typ < details.address_components[ac].types.length; typ++) {
                if(details.address_components[ac].types[typ] === "postal_code"){
                  postal_code = details.address_components[ac].long_name;
                }
              }
            }
            if (postal_code !== '') {
              searchText = streetAddressOnly[0] + ", " + postal_code;
            }else{
              searchText = streetAddressOnly[0];
            }

            console.log(searchText);


            simplicityAdapter.search(SEARCH_CONFIG.searchUrl, searchText)
              .then(function(searchResults){

                var completed = false;
                for (var i = 0; i < searchResults.length; i++) {
                  if (searchResults[i].name === 'address') {
                    if(searchResults[i].results.length > 0){
                      for (var x = 0; x < searchResults[i].results.length; x++) {
                          var splitSearchText = searchText.split(" ");
                          splitSearchText.splice(0, 1);
                          var splitLabel = searchResults[i].results[x].label.split(" ");
                          if(splitLabel.length === splitSearchText.length){
                            completed = true;
                            q.resolve(searchResults[i].results[x]);
                          }
                      }              
                    }else{
                        q.resolve('could not find address');
                      }
                    }
                }

                if(!completed){

                  q.resolve('could not find address');
                }


              });
          });
        

        return q.promise;
      };


      simplicityBackend.formatTimeForQuery = function(jsDate){
        return simplicityAdapter.formatTimeForQuery(jsDate);
      };



      //****Return the factory object****//
      return simplicityBackend; 

    
    }]); //END simplicityBackend factory function





   



//instatiate an AngularJS module and inject an dependancy modules
var simplicity = angular.module('simplicity', ['angulartics', 'angulartics.google.analytics', 'simplicity.frontend.config', 'simplicity.backend.config', 'ui.router', 'ngAnimate']);
 
//Configure application states and routes
simplicity.config(["$stateProvider", "$urlRouterProvider", "$httpProvider", function ($stateProvider, $urlRouterProvider, $httpProvider) {
    
    $urlRouterProvider.when('/topics', '/topics/list');
    $urlRouterProvider.when('', '/search');
    $urlRouterProvider.when('/', '/search');
    $urlRouterProvider.when('/a-zA-Z0-9/', '');
    $urlRouterProvider.otherwise('/search');

    //define states
    $stateProvider
      .state('main', {
        url: '',
        templateUrl: 'main/main.html',
        controller: 'MainCtrl'
      })
      .state('main.search', {
        url: '/search?topic',
        templateUrl: 'search/search.html',
        controller: 'SearchCtrl'
      })
      .state('main.topics', {
        url: '/topics',
        abstract: true,
        template: "<div ui-view></div>"
      })
        .state('main.topics.list', {
          url: '/list?searchtext&searchby&id',
          templateUrl: 'topics/topic-list/topic.list.html',
          controller : 'TopicListCtrl'
        })
        .state('main.topics.topic', {
          url: '/:topic?searchtext&searchby&id&view&timeframe&extent&type&mapcenter',
          templateUrl: 'topics/topic-single/topic.single.html',
          controller: 'TopicSingleCtrl'
        });
  }]);//END config

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




   



//template is defined inline in app.config.js
simplicity.controller('AppCtrl', ['$scope', '$location', function ($scope, $location) {
	
	$scope.$on('$stateChangeSuccess', function (event, toState) {
        if (toState.name === 'main') {
        	
            $scope.back = true; 
        } else {
            $scope.back = false; 
        }
    });	
}]);
simplicity.controller('MainCtrl', ['$scope', '$state', '$stateParams', '$location', '$http', '$timeout',
  function ($scope, $state, $stateParams, $location, $http, $timeout) {


    $scope.goHome = function(){
    	$location.path('');
    };



}]);
simplicity.controller('SearchCtrl', ['$scope', '$stateParams', '$state', '$timeout', 'simplicityBackend', 'Topics',
 function ($scope, $stateParams, $state, $timeout, simplicityBackend, Topics) {
    var getType = function(unformattedType){
        var nameKey = {
            'street_name' : 'street',
            'address' : 'address',
            'neighborhood' : 'neighborhood',
            'owner_name' : 'owner',
            'civicaddressid' : 'address',
            'pinnum' : 'pin'
        };
        return nameKey[unformattedType];
    };

    $('#searchContent').css({'minHeight' : $(window).height()});

    $("#addressSearch").focus();
    $scope.searchText = '';

    $scope.errorMessage = {
        show : false,
        message : 'We had trouble locating that location. Please try to enter a location again.'
    };
    $scope.helperMessage = {
        show : false,
        message : 'Please choose one of the options below.'
    };

    $scope.discoverText = "places";
    $scope.searchFor = "an address, street, neighborhood, or property";

    var topicProperties = {};

    $scope.showTopicsLink = true;

    //if a topic is defined we want to show topic specific text
    if($stateParams.topic !== null){
        topicProperties = Topics.topicProperties();
        $scope.showTopicsLink = false;
        $scope.discoverText = topicProperties.plural;
        $scope.searchFor = topicProperties.searchForText;
    }
    


    //Geocodes the search results     
    $scope.doSearch = function(searchText, event){
        var offset = $('#inputSearch').offset().top - 20;
        $("html, body").animate({'scrollTop' : offset + "px"});
        //we don't want to start search until the user has input 3 characters
        if(searchText.length < 3){
            $scope.searchGroups = [];
            return;
        }

        //if the user hits enter while after text search text
        //show a message that tells them to click on one of the results below
        if(event.keyCode === 13 && searchText !== ''){
            $scope.helperMessage.show = true;
            $timeout(function() {
                $scope.helperMessage.show = false;
            }, 2000);
        }



        //Search usign searchText
        simplicityBackend.simplicitySearch(searchText)
            .then(function(searchResults){
                if(searchText === ""){
                    $scope.searchGroups = [];
                }else{
                    if(searchResults.length !== 0){
                        if($stateParams.topic !== null){
                            for (var i = searchResults.length - 1; i >= 0; i--) {

                                if(topicProperties.searchby[searchResults[i].name] === undefined){
                                    searchResults.splice(i, 1);
                                }
                            }
                            $scope.searchGroups = searchResults; 
                        }else{
                           $scope.searchGroups = searchResults; 
                        }
                           
                    }
                } 
            });
    };

    $scope.unFocus = function(){
        $timeout(function() {
        $scope.searchGroups = []; 
        }, 100); 
    };





    $scope.detailedSelection = [];

    //groupOrderArray.splice(groupOrderPosition, 0, data.candidates[i].attributes.Loc_name);

    $scope.goToTopics = function(candidate, event){
        var label = "";
        for (var i = 0; i < candidate.label.length; i++) {
            if(candidate.label.charAt(i) === '&'){
                label = label + 'AND';
            }else{
                label = label + candidate.label.charAt(i);
            }
        }
        if(candidate.type === 'civicaddressid'){
            candidate.type = "address";
        }
        if($stateParams.topic !== null){
            if(candidate.googleResult === true){
                simplicityBackend.simplicityFindGoogleAddress(candidate)
                    .then(function(addressResults){
                        $state.go('main.topics.topic', {'topic' : $stateParams.topic, 'searchtext' : addressResults.label, 'searchby' : addressResults.type, 'id' : addressResults.id});
                    });
            }else{
                $state.go('main.topics.topic', {'topic' : $stateParams.topic, 'searchtext' : label, 'searchby' : candidate.type, 'id' : candidate.id});
            }
        }else{
            if(candidate.googleResult === true){
                simplicityBackend.simplicityFindGoogleAddress(candidate)
                    .then(function(addressResults){
                        console.log(addressResults);
                        $state.go('main.topics.list', {'searchtext' : addressResults.label, 'searchby' : addressResults.type, 'id' : addressResults.id});
                    });

            }else{
                $state.go('main.topics.list', {'searchtext' : label, 'searchby' : candidate.type, 'id' : candidate.id});  
            }
        }
        
    };




}]);
simplicity.factory('Topics', ['$q', '$stateParams', 'Crime', 'Development', 'Property', 'Trash', 'Recycling', 'Zoning', 'StreetMaintenance', 'AddressList', 'Owner',
	function($q, $stateParams, Crime, Development, Property, Trash, Recycling, Zoning, StreetMaintenance, AddressList, Owner){

	//****Create the factory object****//
	var Topics = {};

	//****Private variables*****//


	var topicAccessor = {
		'crime' : Crime,
		'development' : Development,
		'property' : Property,
		'trash' : Trash,
		'recycling' : Recycling,
		'zoning' : Zoning,
		'streetmaintenance' : StreetMaintenance,
		'addresslist' : AddressList,
		'owner' : Owner
	};


	var collectTopicProperties = function(){
		var topicsArray = [];
		for(var key in topicAccessor){
			var topic = topicAccessor[key];
			topicsArray.push(topic.getTopicProperties());
		}
		return topicsArray;
	};



	//****Public API*****//

	Topics.getTopics = function(){
		var linkTo;
		var topicsArray = collectTopicProperties();
		if($stateParams.id === null){
			var topicsToShowBeforeAnIdHasBeenSet = [];
			for (var i = 0; i < topicsArray.length; i++) {
				if(topicsArray[i].questions.topic !== undefined){
				   topicsArray[i].question = topicsArray[i].questions.topic; 
				}
				linkTo = '#/search?topic=' + topicsArray[i].name;            
				topicsArray[i].linkTo = linkTo;
				topicsToShowBeforeAnIdHasBeenSet.push(topicsArray[i]);
			}
			return topicsToShowBeforeAnIdHasBeenSet;
		}else{
			if($stateParams.searchby !== null){
				var topicsToShowAfterAnIdHasBeenSet = [];
				for (var j = 0; j < topicsArray.length; j++) {
					if(topicsArray[j].searchby[$stateParams.searchby]){
						if(topicsArray[j].questions[$stateParams.searchby] !== undefined){
						   topicsArray[j].question = topicsArray[j].questions[$stateParams.searchby]; 
						}
						linkTo = '#/topics/' + topicsArray[j].name + '?searchtext=' + $stateParams.searchtext + '&searchby=' + $stateParams.searchby + '&id=' + $stateParams.id;
						var params = topicsArray[j].searchby[$stateParams.searchby].params;
						for(var key in params){
							if(params[key] !== null){
								linkTo = linkTo + "&" + key + "=" + params[key];
							}
						}              
						topicsArray[j].linkTo = linkTo;
						topicsToShowAfterAnIdHasBeenSet.push(topicsArray[j]);
					}   
				}
				return topicsToShowAfterAnIdHasBeenSet;
			}else{
				//!!! Go back to search
			}
			
		}
	};

	

	Topics.topicProperties = function(topic){
		return topicAccessor[$stateParams.topic].getTopicProperties();
	};


	Topics.buildTopic = function(){
		var q = $q.defer();
		topicAccessor[$stateParams.topic].build()
			.then(function(topic){
				q.resolve(topic);
			});
		return q.promise;
	};



	//****Return the factory object****//
	return Topics; 

	
}]); //END Topics factory function
simplicity.controller('TopicListCtrl', ['$scope', '$stateParams', '$state', 'Topics', 'AddressCache',
 function ($scope, $stateParams, $state, Topics, AddressCache) {
    $("html, body").animate({'scrollTop' : "0px"});
    $scope.$on('$stateChangeSuccess', function (event, toState) {
        if (toState.name === 'main.topics') {           
            $scope.back = true; 
        } else {
            $scope.back = false; 
        }
    });

    //you can't have more tha
    $scope.heading = 'Topics for ';
    
    if($stateParams.searchtext){
      $scope.searchText = $stateParams.searchtext;
    }else{
      $scope.heading = 'Topics';
      $scope.searchText = "";
    }
    

    $scope.topics = Topics.getTopics($stateParams);
    
    $scope.inTheCity = false;
    $scope.loading = false;
    $scope.anAddress = false;
    if($stateParams.searchby === 'address'){
      $scope.anAddress = true;
      $scope.loading = true;
      AddressCache.query()
        .then(function(data){
          $scope.loading = false;
          if(data.inTheCity === true){
            $scope.inTheCity = true;
          }else{
            $scope.inTheCity = false;
          }
        });
    }


}]);
simplicity.controller('TopicSingleCtrl', ['$scope', '$stateParams', '$state', '$filter', '$location', 'Topics', 'AddressCache', 'SELECT_OPTIONS',
 function ($scope, $stateParams, $state, $filter, $location, Topics, AddressCache, SELECT_OPTIONS) {

    //****Private variables and methods*****//

    $(function () {
      $('[data-toggle="tooltip"]').tooltip();
    });

    var updateStateParamsAndReloadState = function(propertyName, value){
      var stateParams = $stateParams;
      stateParams[propertyName] = value;
      $state.transitionTo('main.topics.topic', stateParams, {'reload' : true});
    };

    //****$scope variables and methods*****//

    //Get properties for a topic
    $scope.topicProperties = Topics.topicProperties($stateParams.topic);

    var topics = Topics.getTopics();
    $scope.linkTopics =[];
    for (var lt = 0; lt < $scope.topicProperties.linkTopics.length; lt++) {
      for (var t = 0; t < topics.length; t++) {
        if(topics[t].name === $scope.topicProperties.linkTopics[lt]){
          $scope.linkTopics.push(topics[t]);
        }
      }
    }
   

    //Assign stateParams to scope
    $scope.stateParams = $stateParams;

    //if searchby or id is not defined go back to search with topic defined (after search come back topic)
    if($stateParams.searchby === null || $stateParams.id === null){
      $state.go('main.search.composite', {'composite' : $stateParams.topic});
    //if searchby is defined check topicProperties to determine if valid, if not go to home
    }else{
      if($scope.topicProperties.searchby[$stateParams.searchby] === undefined){
        $state.go('main.search.composite', {'composite' : 'composite'});
      }
    }

    // +-+-+-+-+
    // |v|i|e|w|
    // +-+-+-+-+

    $scope.headerTemplate = $scope.topicProperties.searchby[$stateParams.searchby].headerTemplate;

    //check if view is valid
    var viewIsValid = function(){
      var validity = false;
      for (var i = 0; i < $scope.topicProperties.searchby[$stateParams.searchby].params.validViews.length; i++) {
        if($scope.topicProperties.searchby[$stateParams.searchby].params.validViews[i] === $stateParams.view){
          validity = true;
        }
      }
      return validity;
    };
    //if view is not defined or if view is not allowed, use default
    if($stateParams.view === null){
      updateStateParamsAndReloadState('view', $scope.topicProperties.searchby[$stateParams.searchby].params.defaultView);
    }else{
      if(!viewIsValid()){
        updateStateParamsAndReloadState('view', $scope.topicProperties.searchby[$stateParams.searchby].params.defaultView);
      }else if($stateParams.view === 'summary' && $stateParams.type !== null){
        updateStateParamsAndReloadState('type', null);
      }else if($stateParams.view !== 'map' && $stateParams.mapcenter !== null){
        updateStateParamsAndReloadState('mapcenter', null);
      }
    }
   


    $scope.onClickChangeView = function(view){
      updateStateParamsAndReloadState('view', view);
    };

    // +-+-+-+-+-+-+-+-+-+
    // |t|i|m|e|f|r|a|m|e|
    // +-+-+-+-+-+-+-+-+-+

    //if timeframe is not defined is supposed to be, use default
    if($stateParams.timeframe === null && $scope.topicProperties.searchby[$stateParams.searchby].params.timeframe !== null){
      updateStateParamsAndReloadState('timeframe', $scope.topicProperties.searchby[$stateParams.searchby].params.timeframe);
    }

    //get the select options for changing the timeframe
    $scope.timeframeOptions = SELECT_OPTIONS.timeframe;
    //define a default select option
    $scope.timeframeOptionIndex = 0;
    //find the option that matches the current timeframe defiend in the $stateParams
    for (var tf = 0; tf < $scope.timeframeOptions.length; tf++) {
      if($scope.timeframeOptions[tf].value === $stateParams.timeframe){
        $scope.timeframeOptionIndex = tf;
      } 
    }

     $scope.onChangeTimeframeValue = function(timeframeValue){
      $scope.loading = true;
      setTimeout(function() {
        updateStateParamsAndReloadState('timeframe', timeframeValue.value);
      }, 250);
      
    };

    // +-+-+-+-+-+-+
    // |e|x|t|e|n|t|
    // +-+-+-+-+-+-+

    //if extent is not defined is supposed to be, use default
    if($stateParams.extent === null && $scope.topicProperties.searchby[$stateParams.searchby].params.extent !== null){
      updateStateParamsAndReloadState('extent', $scope.topicProperties.searchby[$stateParams.searchby].params.extent);
    }

    //get the select options for changing the timeframe
    $scope.extentOptions = SELECT_OPTIONS.extent;
    //define a default select option
    $scope.extentOptionIndex = 0;
    
    //find the option that matches the current timeframe defiend in the $stateParams
    for (var e = 0; e < $scope.extentOptions.length; e++) {
      if($scope.extentOptions[e].value === Number($stateParams.extent)){
        $scope.extentOptionIndex = e;
      } 
    }

    $scope.onChangeExtentValue = function(extentValue){
      updateStateParamsAndReloadState('extent', extentValue.value);
    };



    // +-+-+-+ 
    // |m|a|p| 
    // +-+-+-+ 

    var openstreetmap = L.tileLayer("http://a.tile.openstreetmap.org/{z}/{x}/{y}.png",{
      attribution:'&copy; <a href="http://osm.org/copyright" title="OpenStreetMap" target="_blank">OpenStreetMap</a> contributors',
      maxZoom : 22
    });

    var esriImagery = L.esri.basemapLayer("Imagery");


    var baseMaps = {
      "Street Map" : openstreetmap,
      "Imagery" : esriImagery
    };



    $(".leaflet-control-attribution").css("maxWidth", "90%");

    var map = L.map('map', {
        center: [35.5951125,-82.5511088], 
        zoom : 13,
        maxZoom : 22,
        fullscreenControl: true,
        layers : [openstreetmap]
    });

    var layerControl = L.control.layers(baseMaps).addTo(map);
    
    if($stateParams.type === null || $stateParams.type === 'null'){
      $scope.filterText = "";
    }else{
      $scope.filterText = $stateParams.type;
    }


    
    var returnToFullscreen = false;

    var addGeoJsonToMap = function(data, style){
      var mapcenter;
      var centerArray;
      if(data.length > 0){
        var leafletGeoJsonLayer = L.geoJson(data, {
          pointToLayer: function(feature, latlng){
            if(feature.geometry.type === "Point"){
              if($stateParams.mapcenter !== null){
                mapcenter = $stateParams.mapcenter;
                centerArray = mapcenter.split(',');
                if(feature.properties[centerArray[0]]){
                  if(feature.properties[centerArray[0]] == centerArray[1] && feature.properties[centerArray[2]] == centerArray[3]){
                    return L.circleMarker(latlng, {
                      radius: 8,
                      fillColor: "white",
                      color: "#7f8c8d",
                      weight: 2,
                      opacity: 1,
                      fillOpacity: 0.8
                    });
                  }else{
                    return L.circleMarker(latlng, {
                      radius: 10,
                      fillColor: "#"+feature.properties.color,
                      color: "#7f8c8d",
                      weight: 2,
                      opacity: 1,
                      fillOpacity: 0.8
                    });
                  }
                }
              }else{
                return L.circleMarker(latlng, {
                  radius: 10,
                  fillColor: "#"+feature.properties.color,
                  color: "#7f8c8d",
                  weight: 2,
                  opacity: 1,
                  fillOpacity: 0.8
                });
              }
               
            }else{
              return false;
            }
          },
          style: function (feature) {
            if(style){
              return style;
            }else if(feature.geometry.type === "LineString"){
              if($stateParams.mapcenter !== null){
                mapcenter = $stateParams.mapcenter;
                centerArray = mapcenter.split(',');
                if(feature.properties[centerArray[0]]){
                  if(feature.properties[centerArray[0]] == centerArray[1] && feature.properties[centerArray[2]] == centerArray[3]){
                    return {
                      color:  "#"+feature.properties.color,
                      weight: 15,
                      opacity: 0.4,
                    };
                  }else{
                    return {
                      color: "#"+feature.properties.color,
                      weight: 8,
                      opacity: 0.7,
                    };
                  }
                }
              }else{
                return {
                  color: "#"+feature.properties.color,
                  weight: 8,
                  opacity: 0.7,
                };
              }
            }else if($stateParams.mapcenter !== null){
              mapcenter = $stateParams.mapcenter;
              centerArray = mapcenter.split(',');
              if(feature.properties[centerArray[0]]){
                if(feature.properties[centerArray[0]] == centerArray[1] && feature.properties[centerArray[2]] == centerArray[3]){
                  return {
                    color:  "#"+feature.properties.color,
                    weight: 10,
                    opacity: 1,
                  };
                }
              }
            }
          },
          onEachFeature: function (feature, layer) {
            layer.on('click', function(){
                  $scope.filterText = feature.properties.objectid;
                  $scope.$apply();
                  $('#detailsModal').modal({'backdrop' : 'static'});
                  if (
                      document.fullscreenElement ||
                      document.webkitFullscreenElement ||
                      document.mozFullScreenElement ||
                      document.msFullscreenElement
                  ) {
                    returnToFullscreen = true;
                  }
                  if (document.exitFullscreen) {
                      document.exitFullscreen();
                  } else if (document.webkitExitFullscreen) {
                      document.webkitExitFullscreen();
                  } else if (document.mozCancelFullScreen) {
                      document.mozCancelFullScreen();
                  } else if (document.msExitFullscreen) {
                      document.msExitFullscreen();
                  }   
            });
          }
        });
        leafletGeoJsonLayer.addTo(map);
        map.fitBounds(leafletGeoJsonLayer);
        if(map.getZoom() > 18){
          map.setZoom(18);
        }
        setTimeout(function() {
          if($stateParams.mapcenter !== null){
            var mapcenter = $stateParams.mapcenter;
            var centerArray = mapcenter.split(',');
            map.panTo(L.latLng(Number(centerArray[3]), Number(centerArray[1])));
            map.setZoom(18);
          }

        }, 2000);
        
         
      }
    };

    var addSearchGeoJsonToMap = function(data){
      return L.geoJson(data, {
        onEachFeature: function (feature, layer) {
          if(feature.geometry.type === 'Point' && $stateParams.extent !== null && $stateParams.extent !== 'null'){
            var radiusInMeters = $stateParams.extent*0.3048;
            var circle = L.circle([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], radiusInMeters, {
              'color' : '#3498db',
              'fillOpacity' : 0,
              'opacity' : 0.8,
              'clickable' : false
            });
            circle.addTo(map);
              layer.on('click', function(){
                  
              });
          }
          
        },
        pointToLayer: function(feature, latlng){
          return L.circleMarker(latlng, {
              radius: 4,
              fillColor: "#3498db",
              color: "#3498db",
              weight: 2,
              opacity: 1,
              fillOpacity: 0.8,
              clickable : false
            });
        }
      });
    };

    var addOverlayGeoJsonToMap = function(data, style){
      var overlayLayer =  L.geoJson(data, {

        style: function (feature) {
          if(style){
            return style;
          }
        },
        onEachFeature: function (feature, layer) {
          layerControl.addOverlay(layer, feature.properties.name);
          
        }
      });
      overlayLayer.addTo(map);
    };

    $scope.onChangeMapCenter = function(properties,x,y){
      var xProp, yProp;
      for(var prop in properties){
        if(properties[prop] === x){
          xProp = prop;
        }else if(properties[prop] === y){
          yProp = prop;
        }
      }
      var mapcenter = xProp + ',' + x + ',' + yProp + ',' + y;
      var stateParams = $stateParams;
      stateParams.mapcenter = mapcenter;
      stateParams.view = 'map';
      $state.transitionTo('main.topics.topic', stateParams, {'reload' : true});
    };



    $scope.loading = true;
    //!!! Check if dataCache is already defined

    $scope.emailSubject = "";
    $scope.emailBodyText = "";

    //  _   _                _   _     _           _             _                                   _   _     _             
    // | | | | ___ _   _    | |_| |__ (_)___   ___| |_ __ _ _ __| |_ ___    _____   _____ _ __ _   _| |_| |__ (_)_ __   __ _ 
    // | |_| |/ _ \ | | |   | __| '_ \| / __| / __| __/ _` | '__| __/ __|  / _ \ \ / / _ \ '__| | | | __| '_ \| | '_ \ / _` |
    // |  _  |  __/ |_| |_  | |_| | | | \__ \ \__ \ || (_| | |  | |_\__ \ |  __/\ V /  __/ |  | |_| | |_| | | | | | | | (_| |
    // |_| |_|\___|\__, ( )  \__|_| |_|_|___/ |___/\__\__,_|_|   \__|___/  \___| \_/ \___|_|   \__, |\__|_| |_|_|_| |_|\__, |
    //             |___/|/                                                                     |___/                   |___/ 

    AddressCache.query()
      .then(function(data){
        Topics.buildTopic()
          .then(function(topic){
            $scope.topic = topic;
            $scope.loading = false;
            if(topic.searchGeojson){
              addSearchGeoJsonToMap(topic.searchGeojson).addTo(map);
            }
            if(topic.overlays){
              var overlayLayer = addOverlayGeoJsonToMap(topic.overlays, {'fillOpacity' : 1,'opacity' : 1});
            }
            if(topic.features){
              if($stateParams.type !== null || $stateParams.type !== 'null'){
                var filteredTopic = $filter('filter')(topic.features, $stateParams.type, true);
                addGeoJsonToMap(filteredTopic);
              }else{
                addGeoJsonToMap(topic);
              }             
            }


            var emailTopic = "";

            if($scope.topic.features !== undefined){
              if($scope.topic.features.length > 1){
                emailTopic = $scope.topicProperties.plural;
              }else{
                emailTopic = "the " + $scope.topicProperties.title;
              }
            }else{
              emailTopic = $scope.topicProperties.title;
            }
            

            $scope.emailSearchBy = "";

            if($scope.topicProperties.searchby[$stateParams.searchby].prepositions.timeframe){
              $scope.emailSearchBy = $scope.emailSearchBy + " " + $scope.topicProperties.searchby[$stateParams.searchby].prepositions.timeframe + " " + $scope.timeframeOptions[$scope.timeframeOptionIndex].label;
            }

            if($scope.topicProperties.searchby[$stateParams.searchby].prepositions.extent){
              $scope.emailSearchBy = $scope.emailSearchBy + " " + $scope.topicProperties.searchby[$stateParams.searchby].prepositions.extent + " " + $scope.extentOptions[$scope.extentOptionIndex].label;
            }

            if($scope.topicProperties.searchby[$stateParams.searchby].prepositions.searchby){
              $scope.emailSearchBy = $scope.emailSearchBy + " " + $scope.topicProperties.searchby[$stateParams.searchby].prepositions.searchby + " " + $stateParams.searchtext;
            }



            $scope.emailSubject = "SimpliCity data for " + emailTopic + $scope.emailSearchBy;

            $scope.emailBodyText ="City of Asheville's SimpliCity: city data simplified%0D%0A%0D%0AClick the link below to view your data.%0D%0A%0D%0A<" + escape($location.url()) + ">";
                    
          });
      });

    




    $scope.goToTopics = function(){
      $state.go('main.topics.list', {'searchtext' : $stateParams.searchtext, 'searchby' : $stateParams.searchby, 'id' : $stateParams.id});
    };

    $scope.filterBy = function(type){

      if($stateParams.view === 'summary'){
        updateStateParamsAndReloadState('type', type);
        updateStateParamsAndReloadState('view', 'list');
      }else if($stateParams.view === 'map' || $stateParams.view === 'list'){
        updateStateParamsAndReloadState('type', type);
      }else{
        //do nothing
      }
      $scope.filterText = type;
    };


    $scope.closeModal = function(){
      if(returnToFullscreen === true){
        var m = document.getElementById("map");
 
        // go full-screen
        if (m.requestFullscreen) {
            m.requestFullscreen();
        } else if (m.webkitRequestFullscreen) {
            m.webkitRequestFullscreen();
        } else if (m.mozRequestFullScreen) {
            m.mozRequestFullScreen();
        } else if (m.msRequestFullscreen) {
            m.msRequestFullscreen();
        }
        returnToFullscreen = false;
      }
    };


    $scope.openDownloadModal = function(){
      $('#downloadModal').modal({'backdrop' : false});
    };


    $scope.download = function(downloadType, topic){
      var csvString =  'data:text/csv;charset=utf-8,';
      if(downloadType === 'summary'){
        csvString += 'Type, Count' + '\n';
        for(var key in topic.summary.table){
          var summaryItemString = key + ',' + topic.summary.table[key].count;
          csvString += summaryItemString + '\n';
        }
      }else if (downloadType === 'complete'){
        var headerArray = [];
        
        for(var attributeKey in topic.features[0].properties){
          headerArray.push(attributeKey);
        }
        for(var geometryKey in topic.features[0].geometry){
          headerArray.push(geometryKey);
        }
        csvString += headerArray.join(',') + '\n';
        for (var i = 0; i < topic.features.length; i++) {
          var rowArray = [];
          for (var x = 0; x < headerArray.length; x++) {
            if(topic.features[i].properties[headerArray[x]]){
              // if(topic.features[i].properties[headerArray[x]].constructor === Array){
              //   rowArray.push(JSON.stringify(topic.features[i].properties[headerArray[x]]));
              // }else{
              //   rowArray.push(topic.features[i].properties[headerArray[x]]);
              // }
              rowArray.push(topic.features[i].properties[headerArray[x]]);
            }else if(topic.features[i].geometry[headerArray[x]]){
              rowArray.push(topic.features[i].geometry[headerArray[x]]);
            }else{
              rowArray.push('NULL');
            }
          }
          csvString += rowArray.join(',') + '\n';
        }
      }
      var encodedUri = encodeURI(csvString);
      window.open(encodedUri);
    };


}]);
simplicity.factory('AddressList', ['$q', '$stateParams', 'AddressCache', 'simplicityBackend', 'COLORS',
  function($q, $stateParams, AddressCache, simplicityBackend, COLORS){   

    var AddressList = {};

    var topicProperties = {
      'name' : 'addresslist',
      'title' : 'Address List',
      'plural' : 'address lists',
      'searchForText' : 'a street or a neighborhood',
      'position' : 8,
      'searchby' : {
        'street_name' : {
          'params' : {
            'type' : null,
            'timeframe' : null,
            'extent' : 82.5,
            'defaultView' : 'list',
            'validViews' : ['list', 'map']
          },
          'prepositions' : {
            'searchby' : 'along',
          },
          'requiredParams' : [],
          'headerTemplate' : 'topics/topic-headers/topic.header.along.html',
        },
        'neighborhood' : {
          'params' : {
            'type' : null,
            'timeframe' : null,
            'extent' : null,
            'defaultView' : 'list',
            'validViews' : ['list', 'map']
          },
          'prepositions' : {
            'searchby' : 'in',
          },
          'requiredParams' : [],
          'headerTemplate' : 'topics/topic-headers/topic.header.in.html',
        }
      },
      'views' : {
        'map' : {'label' : 'Map View', 'template' : null},
        'list' : {'label' : 'List View', 'template' : 'topics/topic-components/address-list/address-list.view.html'},
      },
      'simpleViewTemplate' : null,
      'detailsViewTemplate' : null,
      'tableViewTemplate' : 'topics/topic-components/address-list/address-list.table.view.html',
      'listViewTemplate' : 'topics/topic-components/address-list/address-list.view.html',
      'defaultView' : 'simple',
      'iconClass' : 'flaticon-address7',
      'linkTopics' : ['property'],
      'questions' : {
        'topic' :  'Do you want a list of addresses?',
        'street_name' : 'Do you want a list of addresses along this street?',
        'neighborhood' :  'Do you want a list of addresses in this neighborhood?'
      }
    };

    AddressList.build = function(){
      var q = $q.defer();

      var addressCache = AddressCache.get();
      var civicaddressIdArray = AddressCache.civicaddressIdArray();

      if($stateParams.searchby === "street_name"){
        simplicityBackend.simplicityQuery('addresses', {'civicaddressIds' : civicaddressIdArray.join(',')})
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
        simplicityBackend.simplicityQuery('addresses', {'neighborhoodName' : $stateParams.id })
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

    AddressList.getTopicProperties = function(){
      return topicProperties;
    };

    //****Return the factory object****//
    return AddressList; 

    
}]); //END AddressList factory function




   



simplicity.factory('Crime', ['$http', '$location', '$q', '$filter', '$stateParams', 'AddressCache', 'simplicityBackend', 'TimeFrame', 'COLORS', 'DESCRIPTIONS',
  function($http, $location, $q, $filter, $stateParams, AddressCache, simplicityBackend, TimeFrame, COLORS, DESCRIPTIONS){   

    var Crime = {};

    var topicProperties = {
      'name' : 'crime',
      'title' : 'Crime',
      'plural' : 'crimes',
      'searchForText' : 'an address, street, or neighborhood',
      'position' : 2,
      'searchby' : {
        'address' : {
          'params' : {
            'type' : null,
            'timeframe' : 'last-year',
            'extent' : 660,
            'defaultView' : 'summary',
            'validViews' : ['summary', 'list', 'map']
          },
          'prepositions' : {
            'timeframe' : 'during',
            'extent' : 'within',
            'searchby' : 'of'
          },
          'requiredParams' : ['timeframe', 'extent'],
          'headerTemplate' : 'topics/topic-headers/topic.header.during.within.of.html',
        },
        'google_places' : {
          'params' : {
            'type' : null,
            'timeframe' : 'last-year',
            'extent' : 660,
            'defaultView' : 'summary',
            'validViews' : ['summary', 'list', 'map']
          },
          'prepositions' : {
            'timeframe' : 'during',
            'extent' : 'within',
            'searchby' : 'of'
          },
          'requiredParams' : ['timeframe', 'extent'],
          'headerTemplate' : 'topics/topic-headers/topic.header.during.within.of.html',
        },
        'street_name' : {
          'params' : {
            'type' : null,
            'timeframe' : 'last-year',
            'extent' : 82.5,
            'defaultView' : 'summary',
            'validViews' : ['summary', 'list', 'map']
          },
          'prepositions' : {
            'timeframe' : 'during',
            'searchby' : 'along'
          },
          'requiredParams' : ['timeframe'],
          'headerTemplate' : 'topics/topic-headers/topic.header.during.along.html',
        },
        'neighborhood' : {
          'params' : {
            'type' : null,
            'timeframe' : 'last-year',
            'extent' : null,
            'defaultView' : 'summary',
            'validViews' : ['summary', 'list', 'map']
          },
          'prepositions' : {
            'timeframe' : 'during',
            'searchby' : 'in'
          },
          'requiredParams' : ['timeframe'],
          'headerTemplate' : 'topics/topic-headers/topic.header.during.in.html',
        }
      },
      'views' : {
        'map' : {'label' : 'Map View', 'template' : null},
        'summary' : {'label' : 'Summary', 'template' : 'topics/topic-components/crime/crime.summary.view.html'},
        'list' : {'label' : 'List View', 'template' : 'topics/topic-components/crime/crime.list.view.html'},
      },
      'iconClass' : 'flaticon-police19',
      'linkTopics' : ['property', 'trash', 'recycling', 'development'],
      'questions' : {
        'topic' : 'Do you want to know about crime?',
        'address' : 'Do you want to know about crimes near this address?',
        'street_name' : 'Do you want to know about crimes along this street?',
        'neighborhood' : 'Do you want to know about crimes in this neighborhood?'
      }
    };


    var formatCrimeData = function(crimes){
      var addressCache = AddressCache.get();

      //object that holds a summary of the feature {filterValue : count}
      //e.g. for crime {'Bulgary' : 12, 'Larceny' : 2}
      var filteredFeaturesSummary= {
        'template' : 'summary',
        'table' : {}
      };
      //array that holds features filtered by time and the filter value
      var filterdFeaturesArray = [];

      for (var i = 0; i < crimes.features.length; i++) {
        //set color by offense
        crimes.features[i].properties.color = COLORS.crime[crimes.features[i].properties.offense]; 
        crimes.features[i].properties.description = DESCRIPTIONS.crime[crimes.features[i].properties.offense]; 
        //build a summary object
        if(filteredFeaturesSummary.table[crimes.features[i].properties.offense] === undefined){

          filteredFeaturesSummary.table[crimes.features[i].properties.offense] = {'color' : COLORS.crime[crimes.features[i].properties.offense], 'count' : 1, 'description' : DESCRIPTIONS.crime[crimes.features[i].properties.offense]};

        }else{
          filteredFeaturesSummary.table[crimes.features[i].properties.offense].count = filteredFeaturesSummary.table[crimes.features[i].properties.offense].count + 1;
        }
        filterdFeaturesArray.push(crimes.features[i]);
      }
      
      var geojson = {
        'type' : 'FeatureCollection',
        'summary' : filteredFeaturesSummary,
        'searchGeojson' : addressCache.searchGeojson,
        'features' : filterdFeaturesArray
      };

      return geojson;

    };//END formatCrimeData

    
    Crime.build = function(){
      var q = $q.defer();
      console.log($stateParams.timeframe);

      var time = new Date(TimeFrame.get($stateParams.timeframe));
      var timeExpression = simplicityBackend.formatTimeForQuery(time);

      var addressCache = AddressCache.get();

      if(addressCache || $stateParams.searchby === 'neighborhood'){
        var queryValues = {};
        if ($stateParams.searchby === 'neighborhood') {
          queryValues = {
            'neighborhoodName' : $stateParams.id,
            'time' : timeExpression,
          };
          simplicityBackend.simplicityQuery('crimes', queryValues)
            .then(function(crimes){
                q.resolve(formatCrimeData(crimes));
            });
        }else{
          if(addressCache.crime){ 
            if(addressCache.crime[Number($stateParams.extent)]){
              queryValues = {
                'crimeIds' : addressCache.crime[Number($stateParams.extent)],
                'time' : timeExpression,
              };
              simplicityBackend.simplicityQuery('crimes', queryValues)
                .then(function(crimes){
                    q.resolve(formatCrimeData(crimes));
                });
            }else{
              q.resolve(formatCrimeData({'features' : []}));
            }
          }else{
            q.resolve(formatCrimeData({'features' : []}));
          }
        }
      }else{
        q.resolve(formatCrimeData({'features' : []}));
      }
      return q.promise;
    };

    Crime.getTopicProperties = function(){
      return topicProperties;
    };


    //****Return the factory object****//
    return Crime; 

    
}]); //END Crime factory function




   



simplicity.factory('Development', ['$http', '$location', '$q', '$filter', '$stateParams', 'AddressCache', 'simplicityBackend', 'TimeFrame','COLORS', 'DESCRIPTIONS',
  function($http, $location, $q, $filter, $stateParams, AddressCache, simplicityBackend, TimeFrame, COLORS, DESCRIPTIONS){   

    var Development = {};

    var topicProperties = {
      'name' : 'development',
      'title' : 'Development',
      'plural' : 'development',
      'searchForText' : 'an address, street, or neighborhood',
      'position' : 3, 
      'searchby' : {
        'address' : {
          'params' : {
            'type' : null,
            'timeframe' : 'last-year',
            'extent' : 660,
            'defaultView' : 'summary',
            'validViews' : ['summary', 'list', 'map']
          },
          'prepositions' : {
            'timeframe' : 'during',
            'extent' : 'within',
            'searchby' : 'of'
          },
          'requiredParams' : ['timeframe', 'extent'],
          'headerTemplate' : 'topics/topic-headers/topic.header.during.within.of.html',
        },
        'google_places' : {
          'params' : {
            'type' : null,
            'timeframe' : 'last-year',
            'extent' : 660,
            'defaultView' : 'summary',
            'validViews' : ['summary', 'list', 'map']
          },
          'prepositions' : {
            'timeframe' : 'during',
            'extent' : 'within',
            'searchby' : 'of'
          },
          'requiredParams' : ['timeframe', 'extent'],
          'headerTemplate' : 'topics/topic-headers/topic.header.during.within.of.html',
        },
        'street_name' : {
          'params' : {
            'type' : null,
            'timeframe' : 'last-year',
            'extent' : 82.5,
            'defaultView' : 'summary',
            'validViews' : ['summary', 'list', 'map']
          },
          'prepositions' : {
            'timeframe' : 'during',
            'searchby' : 'along'
          },
          'requiredParams' : ['timeframe'],
          'headerTemplate' : 'topics/topic-headers/topic.header.during.along.html',
        },
        'neighborhood' : {
          'params' : {
            'type' : null,
            'timeframe' : 'last-year',
            'extent' : null,
            'defaultView' : 'summary',
            'validViews' : ['summary', 'list', 'map']
          },
          'prepositions' : {
            'timeframe' : 'during',
            'searchby' : 'in'
          },
          'requiredParams' : ['timeframe'],
          'headerTemplate' : 'topics/topic-headers/topic.header.during.in.html',
        }
      },
      'views' : {
        'map' : {'label' : 'Map View', 'template' : null},
        'summary' : {'label' : 'Summary', 'template' : 'topics/topic-components/development/development.summary.view.html'},
        'list' : {'label' : 'List View', 'template' : 'topics/topic-components/development/development.list.view.html'},
      },
      'iconClass' : 'flaticon-building33',
      'linkTopics' : ['property', 'trash', 'recycling', 'crime'],
      'questions' : {
        'topic' : 'Do you want to know about development?',
        'address' : 'Do you want to know about development near this address?',
        'street_name' : 'Do you want to know about development along this street?',
        'neighborhood' : 'Do you want to know about development in this neighborhood?'
      }
    };


    var formatDevelopmentData = function(development){
      var addressCache = AddressCache.get();

      //object that holds a summary of the feature {filterValue : count}
      //e.g. for crime {'Bulgary' : 12, 'Larceny' : 2}
      var filteredFeaturesSummary= {
        'template' : 'summary',
        'table' : {}
      };
      //array that holds features filtered by time and the filter value
      var filterdFeaturesArray = [];

      for (var i = 0; i < development.features.length; i++) {
      
        //set color by record_type
        development.features[i].properties.color = COLORS.development[development.features[i].properties.record_type];    
        development.features[i].properties.description = DESCRIPTIONS.development[development.features[i].properties.record_type];       
        //build a summary object
        if(filteredFeaturesSummary.table[development.features[i].properties.record_type] === undefined){

          filteredFeaturesSummary.table[development.features[i].properties.record_type] = {'color' : COLORS.development[development.features[i].properties.record_type], 'count' : 1, 'description' : DESCRIPTIONS.development[development.features[i].properties.record_type]};

        }else{
          filteredFeaturesSummary.table[development.features[i].properties.record_type].count = filteredFeaturesSummary.table[development.features[i].properties.record_type].count + 1;
        }
        if(development.features[i].properties.record_comments){
          development.features[i].properties.commentsArray = development.features[i].properties.record_comments.split('[NEXT-COMMENT]');
        }
        filterdFeaturesArray.push(development.features[i]);
          
      }
      
      var geojson = {
        'type' : 'FeatureCollection',
        'summary' : filteredFeaturesSummary,
        'searchGeojson' : addressCache.searchGeojson,
        'features' : filterdFeaturesArray
      };

      return geojson;

    };//END formatDevelopmentData

    
    Development.build = function(){
      var q = $q.defer();


      var time = new Date(TimeFrame.get($stateParams.timeframe));
      var timeExpression = simplicityBackend.formatTimeForQuery(time);

      var addressCache = AddressCache.get();

      if(addressCache || $stateParams.searchby === 'neighborhood'){
        var queryValues = {};
        if ($stateParams.searchby === 'neighborhood') {
          queryValues = {
            'neighborhoodName' : $stateParams.id,
            'time' : timeExpression,
          };
          simplicityBackend.simplicityQuery('development', queryValues)
            .then(function(development){
                q.resolve(formatDevelopmentData(development));
            });
        }else{
          if(addressCache.development){ 
            

            if(addressCache.development[Number($stateParams.extent)]){
              var stringOfPermitIds = '';

              for (var i = 0; i < addressCache.development[$stateParams.extent].length; i++) {
                if(i === 0){
                  stringOfPermitIds = stringOfPermitIds + "'" + addressCache.development[$stateParams.extent][i] + "'";
                }else{
                  stringOfPermitIds = stringOfPermitIds + ",'" + addressCache.development[$stateParams.extent][i] + "'";
                }         
              }
              queryValues = {
                'permitIds' : stringOfPermitIds,
                'time' : timeExpression
              };
              simplicityBackend.simplicityQuery('development', queryValues)
                .then(function(development){
                    q.resolve(formatDevelopmentData(development));
                });
            }else{
              q.resolve(formatDevelopmentData({'features' : []}));
            }
          }else{
            q.resolve(formatDevelopmentData({'features' : []}));
          }
        }
      }else{
        q.resolve(formatDevelopmentData({'features' : []}));
      }
      return q.promise;
    };

    Development.getTopicProperties = function(){
      return topicProperties;
    };


    //****Return the factory object****//
    return Development; 

    
}]); //END Development factory function




   



simplicity.factory('Owner', ['$http', '$location', '$q', '$filter', '$stateParams', 'AddressCache', 'simplicityBackend', 'COLORS', 'CODELINKS',
  function($http, $location, $q, $filter, $stateParams, AddressCache, simplicityBackend, COLORS, CODELINKS){   

    var Owner = {};


    var topicProperties = {
      'name' : 'owner',
      'plural' : 'owners',
      'title' : 'Owner',
      'searchForText' : 'an address, street, owner, or PIN',
      'position' : 9,
      'searchby' : {
        'address' : {
          'params' : {
            'type' : null,
            'timeframe' : null,
            'extent' : null,
            'centermap' : null,
            'defaultView' : 'details',
            'validViews' : ['details', 'map']
          },
          'prepositions' : {
            'searchby' : 'at',
          },
          'headerTemplate' : 'topics/topic-headers/topic.header.at.html',
        },
        'google_places' : {
          'params' : {
            'type' : null,
            'timeframe' : null,
            'extent' : null,
            'centermap' : null,
            'defaultView' : 'details',
            'validViews' : ['details', 'map']
          },
          'prepositions' : {
            'searchby' : 'at',
          },
          'headerTemplate' : 'topics/topic-headers/topic.header.at.html',
        },
        'street_name' : {
          'params' : {
            'type' : null,
            'timeframe' : null,
            'extent' : null,
            'centermap' : null,
            'defaultView' : 'list',
            'validViews' : ['list', 'map']
          },
          'prepositions' : {
            'searchby' : 'along',
          },
          'headerTemplate' : 'topics/topic-headers/topic.header.along.html',
        },
        'pinnum' : {
          'params' : {
            'type' : null,
            'timeframe' : null,
            'extent' : null,
            'centermap' : null,
            'defaultView' : 'details',
            'validViews' : ['details', 'map']
          },
          'prepositions' : {
            'searchby' : 'at',
          },
          'headerTemplate' : 'topics/topic-headers/topic.header.at.html',
        }
      },
      'views' : {
        'map' : {'label' : 'Map View', 'template' : null},
        'details' : {'label' : 'Details View', 'template' : 'topics/topic-components/owner/owner.details.view.html'},
        'list' : {'label' : 'List View', 'template' : 'topics/topic-components/owner/owner.list.view.html'},
      },
      'iconClass' : 'flaticon-real6',
      'linkTopics' : ['crime', 'trash', 'recycling'],
      'questions' : {
        'topic' : "Do you want to know a property owner's addresses?",
        'address' : "Do you want to know the property owner's address at this address?",
        'street_name' : "Do you want to know the property owners' addresses along this street?",
        'pinnum' : "Do you want to know the property owner's address for this PIN?"
      }
    };


    //We need to use the pinnum to lookup property information 
    //We can access the pinnum by cross-referencing the cividaddress id or centerline id in the xref table
    //WE can acess the civicaddress id from the stateParams
    Owner.build = function(){
      var addressCache = AddressCache.get();
      var pinnum2civicaddressid = AddressCache.pinnum2civicaddressid();
      var q = $q.defer();

      if($stateParams.searchby === 'address'){ 

        simplicityBackend.simplicityQuery('xrefs', {'civicaddressId' : Number($stateParams.id)})
          .then(function(xRef){

            simplicityBackend.simplicityQuery('owners', {'pinnum' : xRef.features[0].properties.pinnum})
              .then(function(owner){
                q.resolve(owner);
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
            for (var x = 0; x < xRefPin.features.length; x++) {
              if(x === 0){
                xrefPinString = xrefPinString + "'" + xRefPin.features[x].properties.pinnum + "'";
              }else{
                xrefPinString = xrefPinString + ",'" + xRefPin.features[x].properties.pinnum + "'";
              }         
            }
            simplicityBackend.simplicityQuery('owners', {'pinnums' : xrefPinString})
              .then(function(owner){
                q.resolve(owner);
              });
          });
      }else if ($stateParams.searchby === 'pinnum' || $stateParams.searchby === 'owner_name'){
        var pinArray = $stateParams.id.split(',');
        var pinString = '';
        for (var p = 0; p < pinArray.length; p++) {
          if(p === 0){
            pinString = pinString + "'" + pinArray[p] + "'";
          }else{
            pinString = pinString + ",'" + pinArray[p] + "'";
          }         
        }
        simplicityBackend.simplicityQuery('owners', {'pinnums' : pinString})
          .then(function(owner){
            q.resolve(owner);
          });
      }
      return q.promise;
    };//END owner function

    Owner.getTopicProperties = function(){
      return topicProperties;
    };


    //****Return the factory object****//
    return Owner; 

    
}]); //END Owner factory function




   



simplicity.factory('Property', ['$http', '$location', '$q', '$filter', '$stateParams', 'AddressCache', 'simplicityBackend', 'COLORS', 'CODELINKS',
  function($http, $location, $q, $filter, $stateParams, AddressCache, simplicityBackend, COLORS, CODELINKS){   

    var Property = {};


    var topicProperties = {
      'name' : 'property',
      'plural' : 'properties',
      'title' : 'Property',
      'searchForText' : 'an address, street, owner, or PIN',
      'position' : 1,
      'searchby' : {
        'address' : {
          'params' : {
            'type' : null,
            'timeframe' : null,
            'extent' : null,
            'centermap' : null,
            'defaultView' : 'details',
            'validViews' : ['details', 'map']
          },
          'prepositions' : {
            'searchby' : 'at',
          },
          'headerTemplate' : 'topics/topic-headers/topic.header.at.html',
        },
        'google_places' : {
          'params' : {
            'type' : null,
            'timeframe' : null,
            'extent' : null,
            'centermap' : null,
            'defaultView' : 'details',
            'validViews' : ['details', 'map']
          },
          'prepositions' : {
            'searchby' : 'at',
          },
          'headerTemplate' : 'topics/topic-headers/topic.header.at.html',
        },
        'street_name' : {
          'params' : {
            'type' : null,
            'timeframe' : null,
            'extent' : null,
            'centermap' : null,
            'defaultView' : 'list',
            'validViews' : ['list', 'map']
          },
          'prepositions' : {
            'searchby' : 'along',
          },
          'headerTemplate' : 'topics/topic-headers/topic.header.along.html',
        },
        'pinnum' : {
          'params' : {
            'type' : null,
            'timeframe' : null,
            'extent' : null,
            'centermap' : null,
            'defaultView' : 'details',
            'validViews' : ['details', 'map']
          },
          'prepositions' : {
            'searchby' : 'at',
          },
          'headerTemplate' : 'topics/topic-headers/topic.header.at.html',
        },
        'owner_name' : {
          'params' : {
            'type' : null,
            'timeframe' : null,
            'extent' : null,
            'centermap' : null,
            'defaultView' : 'list',
            'validViews' : ['list', 'map']
          },
          'prepositions' : {
            'searchby' : 'owned by',
          },
          'headerTemplate' : 'topics/topic-headers/topic.header.ownedby.html',
        }
      },
      'views' : {
        'map' : {'label' : 'Map View', 'template' : null},
        'details' : {'label' : 'Details View', 'template' : 'topics/topic-components/property/property.details.view.html'},
        'list' : {'label' : 'List View', 'template' : 'topics/topic-components/property/property.list.view.html'},
      },
      'iconClass' : 'flaticon-real10',
      'linkTopics' : ['crime', 'trash', 'recycling'],
      'questions' : {
        'topic' : 'Do you want to know about a property?',
        'address' : 'Do you want to know about the property at this address?',
        'street_name' : 'Do you want to know about the properties along this street?',
        'pinnum' : 'Do you want to know about the property for this PIN?',
        'owner_name' : 'Do you want to know about the properties owned by this owner?'
      }
    };

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
      }
      return formattedZoningArray;
    };

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
        }
        return formattedZoningArray;
      }else{
        return undefined;
      }  
    };


    var formatPropertyData = function(property){
      var addressCache = AddressCache.get();
      var pinnum2civicaddressid = AddressCache.pinnum2civicaddressid();
      var q = $q.defer();
      if(property.features.length > 1){
        property.searchGeojson = addressCache.searchGeojson;
      }

      for (var p = 0; p < property.features.length; p++) {

        if($stateParams.searchby === "address"){
          property.features[p].properties.civicaddress_id = $stateParams.id;
          
          if(addressCache.zoning){
            property.features[p].properties.zoning = formatZoningPropertyForAnAddress();
          }
          
        }else if($stateParams.searchby === 'pinnum' || $stateParams.searchby === 'owner_name' || $stateParams.searchby === 'street_name'){
          property.features[p].properties.civicaddress_id = pinnum2civicaddressid[property.features[p].properties.pinnum];
          if(addressCache.zoning){
            property.features[p].properties.zoning = formatZoningPropertyForMultipleAddressess(property.features[p].properties.civicaddress_id);
          }          
        }
        property.features[p].properties.googleDirectionsLink = "http://maps.google.com/maps?daddr=" + property.features[p].properties.center_y + "," + property.features[p].properties.center_x;
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
          q.resolve(property);
        }
      }
      return  q.promise;
    };


    //We need to use the pinnum to lookup property information 
    //We can access the pinnum by cross-referencing the cividaddress id or centerline id in the xref table
    //WE can acess the civicaddress id from the stateParams
    Property.build = function(){
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
            for (var x = 0; x < xRefPin.features.length; x++) {
              if(x === 0){
                xrefPinString = xrefPinString + "'" + xRefPin.features[x].properties.pinnum + "'";
              }else{
                xrefPinString = xrefPinString + ",'" + xRefPin.features[x].properties.pinnum + "'";
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
        for (var p = 0; p < pinArray.length; p++) {
          if(p === 0){
            pinString = pinString + "'" + pinArray[p] + "'";
          }else{
            pinString = pinString + ",'" + pinArray[p] + "'";
          }         
        }
        simplicityBackend.simplicityQuery('properties', {'pinnums' : pinString})
          .then(function(property){
            q.resolve(formatPropertyData(property));
          });
      }
      return q.promise;
    };//END property function

    Property.getTopicProperties = function(){
      return topicProperties;
    };


    //****Return the factory object****//
    return Property; 

    
}]); //END Property factory function




   



simplicity.factory('Recycling', ['$q', '$stateParams', 'AddressCache',
  function($q, $stateParams, AddressCache){   

    var Recycling = {};

    var topicProperties = {
      'name' : 'recycling',
      'title' : 'Recycling Collection',
      'plural' : 'recycling collection',
      'searchForText' : 'an address',
      'position' : 5,
      'searchby' : {
        'address' : {
          'params' : {
            'type' : null,
            'timeframe' : null,
            'extent' : null,
            'defaultView' : 'simple',
            'validViews' : ['simple']
          },
          'prepositions' : {
            'searchby' : 'at',
          },
          'requiredParams' : [],
          'headerTemplate' : 'topics/topic-headers/topic.header.at.html',
        },
        'google_places' : {
          'params' : {
            'type' : null,
            'timeframe' : null,
            'extent' : null,
            'defaultView' : 'simple',
            'validViews' : ['simple']
          },
          'prepositions' : {
            'searchby' : 'at',
          },
          'requiredParams' : [],
          'headerTemplate' : 'topics/topic-headers/topic.header.at.html',
        }
      },
      'views' : {
        'simple' : {'label' : 'Simple View', 'template' : 'topics/topic-components/recycling-collection/recycling.collection.simple.view.html'}
      },
      'iconClass' : 'flaticon-trash42',
      'linkTopics' : ['trash', 'property'],
      'questions' : {
        'topic' : 'Do you want to know when recycling is collected?',
        'address' : 'Do you want to know when recycling is collected at this address?'
      }
    };
    
    var getCurrentRecyclingWeek = function(){
      var d = new Date(); // current time 
      var t = d.getTime() - (1000*60*60*24*3); // milliseconds since Jan 4 1970 Sunday
      var w = Math.floor(t / (1000*60*60*24*7)); // weeks since Jan 4 1970  
      var o = w % 2; // equals 0 for even (B weeks) numbered weeks, 1 for odd numbered weeks 
      if(o === 0){
        return 'B';
      }else{ // do your odd numbered week stuff 
        return 'A';
      }
    };

    Recycling.build = function(){
      var q = $q.defer();
      var addressCache = AddressCache.get();
      var recyclingArray = addressCache.recycling.split(' ');
      var currentRecyclingWeek = getCurrentRecyclingWeek();
      var recycling = {
        'recyclingDay' : addressCache.recycling,
        'searchGeojson' : addressCache.searchGeojson
      };
      if(recyclingArray[3] === 'A)'){
        if(getCurrentRecyclingWeek() === 'A'){
          recycling.recyclingSchedule = {'week' : 'A', 'when' : 'this week'};
        }else{
          recycling.recyclingSchedule = {'week' : 'A', 'when' : 'next week'};
        }
      }else{
        if(getCurrentRecyclingWeek() === 'B'){
          recycling.recyclingSchedule = {'week' : 'B', 'when' : 'this week'};
        }else{
          recycling.recyclingSchedule = {'week' : 'B', 'when' : 'next week'};
        }
      }
      q.resolve(recycling);
      return q.promise;
    };

    Recycling.getTopicProperties = function(){
      return topicProperties;
    };

    //****Return the factory object****//
    return Recycling; 

    
}]); //END Recycling factory function




   



simplicity.factory('StreetMaintenance', ['$q', '$stateParams', 'AddressCache', 'simplicityBackend', 'COLORS', 'STREET_MAINTENANCE_CONTACTS', 'STREET_MAINTENANCE_CITIZEN_SERVICE_REQUESTS',
  function($q, $stateParams, AddressCache, simplicityBackend, COLORS, STREET_MAINTENANCE_CONTACTS, STREET_MAINTENANCE_CITIZEN_SERVICE_REQUESTS){   

    var StreetMaintenance = {};

    var topicProperties = {
      'name' : 'streetmaintenance',
      'title' : 'Street Maintenance',
      'plural' : 'street maintenance responsibility',
      'searchForText' : 'an address or a street',
      'position' : 7,
      'searchby' : {
        'address' : {
          'params' : {
            'type' : null,
            'timeframe' : null,
            'extent' : null,
            'defaultView' : 'list',
            'validViews' : ['list', 'map']
          },
          'prepositions' : {
            'searchby' : 'at',
          },
          'requiredParams' : [],
          'headerTemplate' : 'topics/topic-headers/topic.header.at.html',
        },
        'google_places' : {
          'params' : {
            'type' : null,
            'timeframe' : null,
            'extent' : null,
            'defaultView' : 'list',
            'validViews' : ['list', 'map']
          },
          'prepositions' : {
            'searchby' : 'at',
          },
          'requiredParams' : [],
          'headerTemplate' : 'topics/topic-headers/topic.header.at.html',
        },
        'street_name' : {
          'params' : {
            'type' : null,
            'timeframe' : null,
            'extent' : 82.5,
            'defaultView' : 'list',
            'validViews' : ['list', 'map']
          },
          'prepositions' : {
            'searchby' : 'along',
          },
          'requiredParams' : [],
          'headerTemplate' : 'topics/topic-headers/topic.header.along.html',
        }
      },
      'views' : {
        'map' : {'label' : 'Map View', 'template' : null},
        'list' : {'label' : 'List View', 'template' : 'topics/topic-components/street-maintenance/street.maintenance.list.view.html'},
      },
      'defaultView' : 'list',
      'iconClass' : 'flaticon-location38',
      'linkTopics' : ['property'],
      'questions' : {
        'topic' :  'Do you want to know who is responsible for maintaining a street?',
        'address' :  'Do you want to know who is responsible for maintaining the street at this address?',
        'street_name' : 'Do you want to know who is responsible for maintaining this street?'
      }   
    };

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
                streetResults.features[i].properties.street_responsibility_contact = STREET_MAINTENANCE_CONTACTS[streetResults.features[i].properties.street_responsibility];
                streetResults.features[i].properties.street_responsibility_citizen_service_requests = STREET_MAINTENANCE_CITIZEN_SERVICE_REQUESTS[streetResults.features[i].properties.street_responsibility];

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

    StreetMaintenance.build = function(){
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

    StreetMaintenance.getTopicProperties = function(){
      return topicProperties;
    };

    //****Return the factory object****//
    return StreetMaintenance; 

    
}]); //END StreetMaintenance factory function




   



simplicity.factory('Trash', ['$q', '$stateParams', 'AddressCache',
  function($q, $stateParams, AddressCache){   

    var Trash = {};

    var topicProperties = {
      'name' : 'trash',
      'title' : 'Trash Collection',
      'plural' : 'trash collection',
      'searchForText' : 'an address',
      'position' : 4,
      'searchby' : {
        'address' : {
          'params' : {
            'type' : null,
            'timeframe' : null,
            'extent' : null,
            'defaultView' : 'simple',
            'validViews' : ['simple']
          },
          'prepositions' : {
            'searchby' : 'at',
          },
          'requiredParams' : [],
          'headerTemplate' : 'topics/topic-headers/topic.header.at.html',
        },
        'google_places' : {
          'params' : {
            'type' : null,
            'timeframe' : null,
            'extent' : null,
            'defaultView' : 'simple',
            'validViews' : ['simple']
          },
          'prepositions' : {
            'searchby' : 'at',
          },
          'requiredParams' : [],
          'headerTemplate' : 'topics/topic-headers/topic.header.at.html',
        }
      },
       'views' : {
        'simple' : {'label' : 'Simple View', 'template' : 'topics/topic-components/trash-collection/trash.collection.simple.view.html'}
      },
      'simpleViewTemplate' : 'topics/topic-components/trash-collection/trash-collection.view.html',
      'iconClass' : 'flaticon-garbage5',
      'linkTopics' : ['recycling', 'property'],
      'questions' : {
        'topic' : 'Do you want to know when trash is collected?',
        'address' : 'Do you want to know when trash is collected at this address?'
      }
    };
    
    Trash.build = function(){
      var addressCache = AddressCache.get();
      var q = $q.defer();
      var trash = {
        'trash' : addressCache.trash,
        'searchGeojson' : addressCache.searchGeojson
      };

      q.resolve(trash);
      return q.promise;
    };

    Trash.getTopicProperties = function(){
      return topicProperties;
    };
    
    //****Return the factory object****//
    return Trash; 


    
    
}]); //END Trash factory function




   



simplicity.factory('Zoning', ['$q', '$stateParams', 'AddressCache', 'simplicityBackend', 'CODELINKS',
  function($q, $stateParams, AddressCache, simplicityBackend, CODELINKS){   

    var Zoning = {};

    var topicProperties = {
      'name' : 'zoning',
      'title' : 'Zoning',
      'plural' : 'zoning',
      'searchForText' : 'an address',
      'position' : 6,
      'searchby' : {
        'address' : {
          'params' : {
            'type' : null,
            'timeframe' : null,
            'extent' : null,
            'defaultView' : 'details',
            'validViews' : ['details', 'map']
          },
          'requiredParams' : [],
          'headerTemplate' : 'topics/topic-headers/topic.header.at.html',
        }
      },
      'views' : {
        'details' : {'label' : 'Details View', 'template' : 'topics/topic-components/zoning/zoning.view.html'},
        'map' : {'label' : 'Map View', 'template' : null}
      },
      'iconClass' : 'flaticon-map104',
      'linkTopics' : ['property', 'crime', 'development'],
      'questions' : {
        'topic' :  'Do you want to know about a zoning?', 
        'address' :  'Do you want to know about the zoning at this address?'
      }
    };

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
      }
      return formattedZoningArray;
    };

    Zoning.build = function(){
      var q = $q.defer();
      var addressCache = AddressCache.get();
      var codelink;
      if(CODELINKS[addressCache.zoning] === undefined){
        codelink = 'disable';
      }else{
        codelink = CODELINKS[addressCache.zoning];
      }
      var geojson = {
        'type' : 'FeatureCollection',
        'summary' : {},
        'searchGeojson' : addressCache.searchGeojson,
        'features' : [{
            'type' : 'Feature',
            'properties' : {
              'zoning' : formatZoningPropertyForAnAddress(),
              'zoningOverlays' : addressCache.zoningOverlays,
            },
            'geometry' : {
              'type' : 'Point',
              'coordinates' : [addressCache.searchGeojson.features[0].geometry.coordinates[0], addressCache.searchGeojson.features[0].geometry.coordinates[1]]
            }
        }]
      };
      if(addressCache.zoningOverlays){
        var zoningOverlaysSplit = addressCache.zoningOverlays.split('-');
        simplicityBackend.simplicityQuery('zoningOverlays', {'zoningOverlayName' : zoningOverlaysSplit[0]})
            .then(function(zoningOverlayLayer){
              geojson.overlays = zoningOverlayLayer;
              q.resolve(geojson);
            });
      }else{
        q.resolve(geojson);
      }
            
      return q.promise;
    };

    Zoning.getTopicProperties = function(){
      return topicProperties;
    };

    //****Return the factory object****//
    return Zoning; 

    
}]); //END Zoning factory function




   



(function(module) {
try {
  module = angular.module('simplicity');
} catch (e) {
  module = angular.module('simplicity', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('main/main.html',
    '<div class="col-lg-8 col-lg-offset-2 col-md-8 col-md-offset-2"><div class="col-xs-12"><div class="col-xs-6"><div class="pull-left" analytics-on="click" analytics-category="Navigation" analytics-event="SimpliCity Logo" ng-click="goHome()" style="cursor : pointer"><h2 style="color : #073F97;" class="text-center">SimpliCity</h2><h5 class="text-center">city data simplified</h5></div></div><div class="col-xs-6" style="margin-top : 10px"><a href="http://www.ashevillenc.gov/" target="_blank" analytics-category="Navigation" analytics-on="click" analytics-event="City Logo"><img class="pull-right" style="height : 80px;" src="http://123graffitifree.com/images/citylogo-flatblue.png"></a></div></div><div><input id="stupid-required-google-input" type="hidden"></div><div ui-view=""></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('simplicity');
} catch (e) {
  module = angular.module('simplicity', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('search/search.html',
    '<div ui-view=""></div><div id="searchContent"><div class="col-xs-12" style="margin-top : 20px"><p class="text-muted text-center lead" style="margin-bottom : 0px; margin-top : 20px">Discover city data about <strong>{{discoverText}}</strong> in your community.</p><p class="text-muted text-center lead">Search for {{searchFor}} to get started!</p></div><div class="col-xs-12"><div class="input-group"><input id="inputSearch" groupindex="1" type="text" autocomplete="on" class="form-control" placeholder="Enter a location..." style="z-index: 0" ng-model="searchText" ng-keyup="doSearch(searchText, $event)" autofocus=""> <span class="input-group-btn"><button class="btn btn-primary" type="button" style="box-shadow : none; font-size : 17px"><i class="fa fa-search"></i></button></span></div></div><div class="" ng-show="errorMessage.show || helperMessage.show || searchGroups.length > 0"><p ng-show="errorMessage.show" class="text-danger">{{errorMessage.message}}</p><p ng-show="helperMessage.show" class="text-success">{{helperMessage.message}}</p><div ng-repeat="group in searchGroups"><div class="col-xs-12" style="margin-top : 10px; margin-bottom : 10px"><h4 class="row text-muted"><span class="fa-stack fa-lg" ng-click="goBack()"><i class="fa fa-circle fa-stack-2x"></i> <i class="fa fa-stack-1x fa-inverse" ng-class="group.iconClass"></i></span> <strong>{{group.label}}</strong> <span class="badge" style="background : #999">{{group.results.length}}</span> <span ng-if="group.name === \'google_places\'"><img src="images/powered-by-google-on-white.png" alt="" class="pull-right" style="padding : 20px"></span></h4><div class="list-group" ng-repeat="candidate in group.results | limitTo : group.offset"><a analytics-on="click" analytics-category="Search" analytics-label="{{candidate.type}}" analytics-event="{{candidate.label}}" ng-click="goToTopics(candidate, $event)" ng-keypress="goToTopics(candidate, $event)" class="row list-group-item"><span class="col-xs-2 col-lg-1"><span class="fa-stack fa-lg text-primary"><i class="fa fa-circle fa-stack-2x"></i> <i class="fa fa-stack-1x fa-inverse" ng-class="group.iconClass"></i></span></span><p class="col-xs-8 col-lg-9 pull-left text-primary" style="margin-top : 8px">{{candidate.label}}</p><h4 class="col-xs-2 col-lg-2"><i class="fa fa-lg fa-chevron-right text-primary pull-right"></i></h4></a></div><div class="list-group" ng-if="group.results.length > 3"><a ng-click="group.offset = group.offset + 3" class="row list-group-item"><h4 class="col-xs-10 text-primary"><strong>More</strong></h4><h4 class="col-xs-2"><i class="fa fa-lg fa-chevron-down text-primary pull-right"></i></h4></a></div></div></div><p ng-show="errorMessage.show" class="text-danger">{{errorMessage.message}}</p></div><div ng-show="showTopicsLink" class="col-xs-12 col-md-6 col-md-offset-3 text-center well" style="margin-top : 60px; margin-bottom : 40px; background : #fff; border : 2px solid #ecf0f1"><h4 class="text-info">Not sure what you can find with SimpliCity?</h4><a href="#/topics/list"><h2>Click here to view topics</h2></a></div><div class="col-xs-12" style="margin-top : 50px"><h4 class="text-primary text-center">Brought to you by the <a href="http://www.ashevillenc.gov/" target="_blank">City of Asheville</a> <i class="fa fa-smile-o"></i></h4></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('simplicity');
} catch (e) {
  module = angular.module('simplicity', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('topics/sanitation.card.html',
    '<div class="col-xs-12 list-item-panel"><div class="col-xs-12" style="padding : 10px"><h4>Trash</h4><p>Your trash is collected every <strong>{{card.trash}}</strong>.</p><br><h4>Recycling</h4><p class="text-muted">Recycling is collected every other week.</p><p>Your recycling will be collected <strong>{{card.recyclingSchedule.when}} on {{card.recycling}}</strong>.</p><br><h4>Brush and Leaf Collection</h4><p class="text-muted">Brush and leaves are collected every other week, and should be placed at the curb by 7 a.m. on Monday of your pickup week.</p><p>Your brush will be collected <strong>{{card.brushSchedule.when}}</strong>.</p><br><h4>Bulky Item Collection</h4><p>Call to schedule pickup <a href="tel:8282511122" target="_blank">(828) 251-1122</a>. <a href="http://www.ashevillenc.gov/Departments/Sanitation/BulkyItemCollection.aspx" target="_blank">More Info.</a></p></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('simplicity');
} catch (e) {
  module = angular.module('simplicity', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('topics/topic-headers/topic.header.along.html',
    '<div class="list-item-panel col-xs-12"><h1 class="col-xs-6">{{topicProperties.title}}</h1><div class="col-xs-6"><a style="padding : 10px" class="pull-right text-center" ng-click="openDownloadModal()"><i class="fa fa-download"></i><br>Download</a> <a style="padding : 10px" class="pull-right text-center" title="Email of link to this page" href="mailto:?subject={{emailSubject}}&body={{emailBodyText}}"><i class="fa fa-envelope-o text-center"></i><br>Email</a></div><form class="form-horizontal col-xs-12"><div class="form-group"><label class="col-sm-2 control-label"><h3 style="margin : 0px"><strong class="text-muted">along</strong></h3></label><div class="col-sm-10"><h3 class="form-control-static" style="margin : 0px">{{stateParams.searchtext}}.</h3></div></div></form></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('simplicity');
} catch (e) {
  module = angular.module('simplicity', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('topics/topic-headers/topic.header.at.html',
    '<div class="list-item-panel col-xs-12"><h1 class="col-xs-6">{{topicProperties.title}}</h1><div class="col-xs-6"><a style="padding : 10px" class="pull-right text-center" ng-click="openDownloadModal()"><i class="fa fa-download"></i><br>Download</a> <a style="padding : 10px" class="pull-right text-center" title="Email of link to this page" href="mailto:?subject={{emailSubject}}&body={{emailBodyText}}"><i class="fa fa-envelope-o text-center"></i><br>Email</a></div><form class="form-horizontal col-xs-12"><div class="form-group"><label class="col-sm-2 control-label"><h3 style="margin : 0px"><strong class="text-muted">at</strong></h3></label><div class="col-sm-10"><h3 class="form-control-static" style="margin : 0px">{{stateParams.searchtext}}.</h3></div></div></form></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('simplicity');
} catch (e) {
  module = angular.module('simplicity', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('topics/topic-headers/topic.header.during.along.html',
    '<div class="list-item-panel col-xs-12"><h1 class="col-xs-6">{{topicProperties.title}}</h1><div class="col-xs-6"><a style="padding : 10px" class="pull-right text-center" ng-click="openDownloadModal()"><i class="fa fa-download"></i><br>Download</a> <a style="padding : 10px" class="pull-right text-center" title="Email of link to this page" href="mailto:?subject={{emailSubject}}&body={{emailBodyText}}"><i class="fa fa-envelope-o text-center"></i><br>Email</a></div><form class="form-horizontal col-xs-12"><div class="form-group"><label class="col-sm-2 control-label"><h3 style="margin : 0px"><strong class="text-muted">during</strong></h3></label><div class="col-sm-10"><select class="form-control" id="time" ng-init="timeframeValue = timeframeOptions[timeframeOptionIndex]" ng-model="timeframeValue" ng-options="item.label for item in timeframeOptions" ng-change="onChangeTimeframeValue(timeframeValue)" style="font-size : 22px; color : #2780e3; height : 50px" analytics-on="change" analytics-category="Timeframe Change" analytics-label="{{stateParams.topic}}" analytics-event="{{timeframeValue.label}}"></select></div></div><div class="form-group"><label class="col-sm-2 control-label"><h3 style="margin : 0px"><strong class="text-muted">along</strong></h3></label><div class="col-sm-10"><h3 class="form-control-static" style="margin : 0px">{{stateParams.searchtext}}.</h3></div></div></form></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('simplicity');
} catch (e) {
  module = angular.module('simplicity', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('topics/topic-headers/topic.header.during.in.html',
    '<div class="list-item-panel col-xs-12"><h1 class="col-xs-6">{{topicProperties.title}}</h1><div class="col-xs-6"><a style="padding : 10px" class="pull-right text-center" ng-click="openDownloadModal()"><i class="fa fa-download"></i><br>Download</a> <a style="padding : 10px" class="pull-right text-center" title="Email of link to this page" href="mailto:?subject={{emailSubject}}&body={{emailBodyText}}"><i class="fa fa-envelope-o text-center"></i><br>Email</a></div><form class="form-horizontal col-xs-12"><div class="form-group"><label class="col-sm-2 control-label"><h3 style="margin : 0px"><strong class="text-muted">during</strong></h3></label><div class="col-sm-10"><select class="form-control" id="time" ng-init="timeframeValue = timeframeOptions[timeframeOptionIndex]" ng-model="timeframeValue" ng-options="item.label for item in timeframeOptions" ng-change="onChangeTimeframeValue(timeframeValue)" style="font-size : 22px; color : #2780e3; height : 50px" analytics-on="change" analytics-category="Timeframe Change" analytics-label="{{stateParams.topic}}" analytics-event="{{timeframeValue.label}}"></select></div></div><div class="form-group"><label class="col-sm-2 control-label"><h3 style="margin : 0px"><strong class="text-muted">in</strong></h3></label><div class="col-sm-10"><h3 class="form-control-static" style="margin : 0px">{{stateParams.searchtext}} Neighborhood</h3></div></div></form></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('simplicity');
} catch (e) {
  module = angular.module('simplicity', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('topics/topic-headers/topic.header.during.within.of.html',
    '<div class="list-item-panel col-xs-12"><h1 class="col-xs-6">{{topicProperties.title}}</h1><div class="col-xs-6"><a style="padding : 10px" class="pull-right text-center" ng-click="openDownloadModal()"><i class="fa fa-download"></i><br>Download</a> <a style="padding : 10px" class="pull-right text-center" title="Email of link to this page" href="mailto:?subject={{emailSubject}}&body={{emailBodyText}}"><i class="fa fa-envelope-o text-center"></i><br>Email</a></div><form class="form-horizontal col-xs-12"><div class="form-group"><label class="col-sm-2 control-label"><h3 style="margin : 0px"><strong class="text-muted">during</strong></h3></label><div class="col-sm-10"><select class="form-control" id="time" ng-init="timeframeValue = timeframeOptions[timeframeOptionIndex]" ng-model="timeframeValue" ng-options="item.label for item in timeframeOptions" ng-change="onChangeTimeframeValue(timeframeValue)" analytics-on="change" analytics-category="Timeframe Change" analytics-label="{{stateParams.topic}}" analytics-event="{{timeframeValue.label}}" style="font-size : 22px; color : #2780e3; height : 50px"></select></div></div><div class="form-group"><label class="col-sm-2 control-label"><h3 style="margin : 0px"><strong class="text-muted">within</strong></h3></label><div class="col-sm-10"><select class="form-control" id="extent" ng-init="extentValue = extentOptions[extentOptionIndex]" ng-model="extentValue" ng-options="item.label for item in extentOptions" ng-change="onChangeExtentValue(extentValue)" analytics-on="change" analytics-category="Extent Change" analytics-label="{{stateParams.topic}}" analytics-event="{{extentValue.label}}" style="font-size : 22px; color : #2780e3; height : 50px"></select></div></div><div class="form-group"><label class="col-sm-2 control-label"><h3 style="margin : 0px"><strong class="text-muted">of</strong></h3></label><div class="col-sm-10"><h3 class="form-control-static" style="margin : 0px">{{stateParams.searchtext}}.</h3></div></div></form></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('simplicity');
} catch (e) {
  module = angular.module('simplicity', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('topics/topic-headers/topic.header.in.html',
    '<div class="list-item-panel col-xs-12"><h1 class="col-xs-6">{{topicProperties.title}}</h1><div class="col-xs-6"><a style="padding : 10px" class="pull-right text-center" ng-click="openDownloadModal()"><i class="fa fa-download"></i><br>Download</a> <a style="padding : 10px" class="pull-right text-center" title="Email of link to this page" href="mailto:?subject={{emailSubject}}&body={{emailBodyText}}"><i class="fa fa-envelope-o text-center"></i><br>Email</a></div><form class="form-horizontal col-xs-12"><div class="form-group"><label class="col-sm-2 control-label"><h3 style="margin : 0px"><strong class="text-muted">in</strong></h3></label><div class="col-sm-10"><h3 class="form-control-static" style="margin : 0px">{{stateParams.searchtext}} Neighborhood</h3></div></div></form></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('simplicity');
} catch (e) {
  module = angular.module('simplicity', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('topics/topic-headers/topic.header.ownedby.html',
    '<div class="list-item-panel col-xs-12"><h1 class="col-xs-6">{{topicProperties.title}}</h1><div class="col-xs-6"><a style="padding : 10px" class="pull-right text-center" ng-click="openDownloadModal()"><i class="fa fa-download"></i><br>Download</a> <a style="padding : 10px" class="pull-right text-center" title="Email of link to this page" href="mailto:?subject={{emailSubject}}&body={{emailBodyText}}"><i class="fa fa-envelope-o text-center"></i><br>Email</a></div><form class="form-horizontal col-xs-12"><div class="form-group"><label class="col-sm-3 control-label"><h3 style="margin : 0px"><strong class="text-muted">owned by</strong></h3></label><div class="col-sm-9"><h3 class="form-control-static" style="margin : 0px">{{stateParams.searchtext}}.</h3></div></div></form></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('simplicity');
} catch (e) {
  module = angular.module('simplicity', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('topics/topic-list/topic.list.html',
    '<div><div class="col-xs-12 btn-group btn-group-justified" style="margin-top : 15px"><a href="#/search/composite" class="btn btn-primary" style="font-size : 18px"><i class="fa fa-search" analytics-category="Navigation" analytics-label="Topics List Page" analytics-event="To Search"></i> Search</a></div><div class="col-xs-12"><hr></div><h2 class="text-muted text-center">{{heading}}</h2><h1 class="text-muted text-center">{{searchText}}</h1><h3 ng-if="anAddress && loading" class="text-muted text-center"><i class="fa fa-lg fa-spinner fa-spin text-muted"></i></h3><h3 ng-if="anAddress && inTheCity && !loading" class="text-muted text-center"><i class="fa fa-lg fa-check-circle text-success"></i> <strong>It\'s in the city!</strong></h3><h3 ng-if="anAddress && !inTheCity && !loading" class="text-muted text-center"><i class="fa fa-lg fa-times-circle text-danger"></i> <strong>It\'s not in the city!</strong></h3><div class="list-group" style="margin-top : 20px"><a class="row list-group-item list-item-panel" href="{{topic.linkTo}}" style="margin-bottom : 5px" ng-repeat="topic in topics |orderBy:\'position\'" analytics-category="\'Topic\'" analytics-label="{{topic.title}}" analytics-event="{{topic.question}}"><span class="visible-xs col-xs-8"><p class="text-primary text-center">{{topic.question}}</p></span> <i ng-class="topic.iconClass" class="visible-xs pull-left col-xs-3 text-primary"></i><div ng-class="topic.iconClass" class="hidden-xs col-sm-2 text-primary"></div><h4 class="hidden-xs col-sm-9 text-primary" style="margin-top : 20px">{{topic.question}}</h4><h4 class="col-sm-1 hidden-xs"><i class="fa fa-2x fa-chevron-right text-primary pull-right"></i></h4></a></div><div class="col-xs-12 text-center">List icon font generated by <a href="http://www.flaticon.com">flaticon.com</a> under <a href="http://creativecommons.org/licenses/by/3.0/">CC</a> by <a href="http://www.zurb.com">Zurb</a>, <a href="http://www.freepik.com">Freepik</a>, <a href="http://www.unocha.org">OCHA</a>.</div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('simplicity');
} catch (e) {
  module = angular.module('simplicity', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('topics/topic-single/topic.single.html',
    '<div><div class="col-xs-12 btn-group btn-group-justified" style="margin-top : 15px"><a href="#/search/composite" class="btn btn-primary" style="font-size : 18px" analytics-on="click" analytics-category="Navigation" analytics-label="Topics Single Page" analytics-event="To Search"><i class="fa fa-search fa-fw"></i> Search</a> <a ng-click="goToTopics()" class="btn btn-primary" style="font-size : 18px" analytics-on="click" analytics-category="Navigation" analytics-label="Topics Single Page" analytics-event="To Search"><i class="fa fa-bars fa-fw"></i> View Topics</a></div><div class="col-xs-12"><hr></div><div ng-include="headerTemplate"></div><div class="col-xs-12" style="height : 200px; text-align : center; margin-top : 30px" ng-show="loading"><i class="fa fa-5x fa-spinner fa-spin"></i></div><div class="col-xs-12 list-item-panel" ng-show="!loading"><div ng-if="stateParams.view !== \'simple\'"><div class="hidden-xs col-xs-12"><h2 class="pull-left" style="margin-right : 10px">{{topicProperties.views[stateParams.view].label}}</h2><div class="btn-group pull-right" role="group" aria-label="..." style="margin-top : 15px"><button ng-repeat="view in topicProperties.searchby[stateParams.searchby].params.validViews" ng-class="{\'active\' : stateParams.view === view}" ng-click="onClickChangeView(view)" analytics-on="click" analytics-category="Topic View" analytics-label="{{stateParams.topic}}" analytics-event="{{topicProperties.views[view].label}}" class="btn btn-primary">{{topicProperties.views[view].label}}</button><div ng-if="topicParams.view === \'list\' || (topicParams.view === \'map\' || topic.summary !== undefined)" class="btn-group" role="group"><button class="btn btn-primary dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-expanded="true">Filter <span class="caret"></span></button><ul class="dropdown-menu" role="menu" aria-labelledby="dropdownMenu1"><li class="text-primary" role="presentation"><a role="menuitem" tabindex="-1" ng-click="filterBy(null)">Show All</a></li><li ng-repeat="(key, value) in topic.summary.table" class="text-primary" role="presentation"><a role="menuitem" tabindex="-1" ng-click="filterBy(key)">{{key}}</a></li></ul></div></div><div ng-if="stateParams.type !== null" class="col-xs-12"><h5 class="text-muted">Filtered by <strong>{{stateParams.type}}</strong></h5></div></div><div class="visible-xs" style="text-align : center; width : 100%"><h2 class="pull-left" style="margin-right : 10px">{{topicProperties.views[stateParams.view].label}} View</h2><div class="btn-group" role="group" aria-label="..." style="margin-top : 15px"><div class="btn-group" role="group"><button class="btn btn-primary dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-expanded="true">Change View <span class="caret"></span></button><ul class="dropdown-menu" role="menu" aria-labelledby="dropdownMenu1"><li ng-repeat="view in topicProperties.searchby[stateParams.searchby].params.validViews" ng-class="{\'active\' : stateParams.view === view}" ng-click="onClickChangeView(view)" analytics-on="click" analytics-category="Topic View" analytics-label="{{stateParams.topic}}" analytics-event="{{topicProperties.views[view].label}} View" class="text-primary" role="presentation"><a role="menuitem" tabindex="-1">{{topicProperties.views[view].label}}</a></li></ul></div><div ng-if="topicParams.view === \'list\' || (topicParams.view === \'map\' || topic.summary !== undefined)" class="btn-group" role="group"><button class="btn btn-primary dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-expanded="true">Filter <span class="caret"></span></button><ul class="dropdown-menu" role="menu" aria-labelledby="dropdownMenu1"><li class="text-primary" role="presentation"><a role="menuitem" tabindex="-1" ng-click="filterBy(null)">Show All</a></li><li ng-repeat="(key, value) in topic.summary.table" class="text-primary" role="presentation"><a role="menuitem" tabindex="-1" ng-click="filterBy(key)">{{key}}</a></li></ul></div></div><div class="col-xs-12" style="height : 10px"></div></div></div><div ng-if="topicPropteries.viewTemplates.simple !== null" ng-show="stateParams.view === \'simple\'" ng-include="topicProperties.views.simple.template"></div><div ng-if="topicPropteries.viewTemplates.details !== null" ng-show="stateParams.view === \'details\'" ng-include="topicProperties.views.details.template"></div><div ng-if="topicPropteries.viewTemplates.list !== null" ng-show="stateParams.view === \'list\'" ng-include="topicProperties.views.list.template"></div><div ng-if="topicPropteries.viewTemplates.summary !== null" ng-show="stateParams.view === \'summary\'" ng-include="topicProperties.views.summary.template"></div><div><div ng-show="stateParams.view === \'map\'" class="col-xs-12" style="height : 400px; margin-bottom : 20px;"><div id="map" style="height : 100%; width : 100%;margin : 0px; padding : 0px"><div ng-if="topic.summary.table !== undefined"><h5 ng-init="showLegend = true" ng-show="showLegend" ng-click="showLegend = !showLegend" class="text-primary" style="position : absolute; top : 50px; right : 10px;z-index : 7; cursor : pointer; background : white; padding : 5px; border-radius : 4px; border : 2px solid #2780E3; box-shadow: 0 1px 5px rgba(0,0,0,0.4)"><strong>Legend</strong> <i class="fa fa-expand"></i></h5><div ng-show="!showLegend" style="position : absolute; top : 50px; right : 10px; box-shadow: 0 1px 5px rgba(0,0,0,0.4);background: #fff;border-radius: 5px; z-index : 7; border : 2px solid #2780E3"><div class="col-xs-12"><h4 class="pull-left">Legend</h4><p ng-click="showLegend = !showLegend" class="text-primary pull-right" style="margin-top : 5px; cursor : pointer"><i class="fa fa-2x fa-times"></i></p></div><table ng-if="topic.features.length !== 0" class="table table-hover"><tbody><tr ng-repeat="(key, value) in topic.summary.table"><td ng-click="getDetails(key)" style="cursor : pointer"><i class="fa fa-circle" style="color: #{{value.color}}"></i> {{key}}</td></tr></tbody></table></div></div></div></div><div id="detailsModal" class="modal fade"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button ng-click="closeModal()" type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button><h4 class="modal-title">Location Details</h4></div><div class="modal-body"><div ng-include="topicProperties.views.list.template"></div></div></div></div></div></div></div><div ng-if="linkTopics.length > 0" class="col-xs-12 list-item-panel" style="margin-top : 30px"><h2>Related Links</h2><div class="list-group" style="margin-top : 20px"><a class="row list-group-item list-item-panel" analytics-category="Related Link" analytics-label="{{stateParams.topic}}" analytics-event="{{linkTopic.linkTo}}" href="{{linkTopic.linkTo}}" style="margin-bottom : 5px" ng-repeat="linkTopic in linkTopics"><span class="visible-xs col-xs-8"><p class="text-primary text-center">{{linkTopic.question}}</p></span> <i ng-class="linkTopic.iconClass" class="visible-xs pull-left col-xs-3 text-primary"></i><div ng-class="linkTopic.iconClass" class="hidden-xs col-sm-2 text-primary"></div><h4 class="hidden-xs col-sm-9 text-primary" style="margin-top : 20px">{{linkTopic.question}}</h4><h4 class="col-sm-1 hidden-xs"><i class="fa fa-2x fa-chevron-right text-primary pull-right"></i></h4></a></div><div class="col-xs-12 text-center">List icon font generated by <a href="http://www.flaticon.com">flaticon.com</a> under <a href="http://creativecommons.org/licenses/by/3.0/">CC</a> by <a href="http://www.zurb.com">Zurb</a>, <a href="http://www.freepik.com">Freepik</a>, <a href="http://www.unocha.org">OCHA</a>.</div></div><div id="downloadModal" class="modal fade" style="z-index : 3000"><div class="modal-dialog modal-sm"><div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button><h4 class="modal-title">Download</h4></div><div class="modal-body"><div ng-if="stateParams.topic === \'property\' || stateParams.topic === \'owner\'"><button class="btn btn-primary col-xs-12" ng-click="download(\'complete\', topic)" analytics-on="click" analytics-category="Download" analytics-label="complete" analytics-event="{{stateParams.topic}}">{{topicProperties.title}} Details <i class="fa fa-cloud-download"></i></button></div><div ng-if="stateParams.topic === \'crime\' || stateParams.topic === \'development\'"><button class="btn btn-primary col-xs-12" ng-click="download(\'summary\', topic)" analytics-on="click" analytics-category="Download" analytics-label="summary" analytics-event="{{stateParams.topic}}">Summary Table <i class="fa fa-cloud-download"></i></button> <button class="btn btn-primary col-xs-12" style="margin-top : 3px" ng-click="download(\'complete\', topic)" analytics-on="click" analytics-category="Download" analytics-label="complete" analytics-event="{{stateParams.topic}}">Detailed records <i class="fa fa-cloud-download"></i></button><p class="text-muted text-center">based on selected filters</p></div><div ng-if="stateParams.topic === \'zoning\'"><button class="btn btn-primary col-xs-12" ng-click="download(\'complete\', topic)" analytics-on="click" analytics-category="Download" analytics-label="complete" analytics-event="{{stateParams.topic}}">Zoning Data <i class="fa fa-cloud-download"></i></button></div><div ng-if="stateParams.topic === \'addresslist\'"><button class="btn btn-primary col-xs-12" ng-click="download(\'complete\', topic)" analytics-on="click" analytics-category="Download" analytics-label="complete" analytics-event="{{stateParams.topic}}">Address List <i class="fa fa-cloud-download"></i></button></div><div ng-if="stateParams.topic === \'streetmaintenance\'"><button class="btn btn-primary col-xs-12" ng-click="download(\'complete\', topic)" analytics-on="click" analytics-category="Download" analytics-label="complete" analytics-event="{{stateParams.topic}}">Street Details <i class="fa fa-cloud-download"></i></button></div></div></div></div></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('simplicity');
} catch (e) {
  module = angular.module('simplicity', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('topics/topic-single/topic.view.header.html',
    '<div><div class="hidden-xs col-xs-12"><h2 ng-if="stateParams.view === \'details\'" class="pull-left" style="margin-right : 10px">Details View</h2><h2 ng-if="stateParams.view === \'list\'" class="pull-left" style="margin-right : 10px">List View</h2><h2 ng-if="stateParams.view === \'table\'" class="pull-left" style="margin-right : 10px">Table View</h2><h2 ng-if="stateParams.view === \'map\'" class="pull-left" style="margin-right : 10px">Map View</h2><div class="btn-group pull-right" role="group" aria-label="..." style="margin-top : 15px"><button ng-if="topicProperties.detailsViewTemplate" ng-class="{\'active\' : stateParams.view === \'details\'}" ng-click="onClickChangeView(\'details\')" class="btn btn-primary"><i class="fa fa-lg fa-th fa-fw"></i> Details</button> <button ng-if="topicProperties.listViewTemplate" ng-class="{\'active\' : stateParams.view === \'list\'}" ng-click="onClickChangeView(\'list\')" class="btn btn-primary"><i class="fa fa-lg fa-list-alt fa-fw"></i> List</button> <button ng-if="topicProperties.tableViewTemplate" ng-class="{\'active\' : stateParams.view === \'table\'}" ng-click="onClickChangeView(\'table\')" class="btn btn-primary"><i class="fa fa-lg fa-table fa-fw"></i> Table</button> <button ng-class="{\'active\' : stateParams.view === \'map\'}" ng-click="onClickChangeView(\'map\')" class="btn btn-primary"><i class="fa fa-lg fa-map-marker fa-fw"></i> Map</button><div ng-if="topicParams.view === \'list\' || (topicParams.view === \'map\' || topic.summary !== undefined)" class="btn-group" role="group"><button class="btn btn-primary dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-expanded="true">Filter <span class="caret"></span></button><ul class="dropdown-menu" role="menu" aria-labelledby="dropdownMenu1"><li class="text-primary" role="presentation"><a role="menuitem" tabindex="-1" ng-click="filterBy(null)">Show All</a></li><li ng-repeat="(key, value) in topic.summary.table" class="text-primary" role="presentation"><a role="menuitem" tabindex="-1" ng-click="filterBy(key)">{{key}}</a></li></ul></div><button ng-click="openDownloadModal()" type="button" class="btn btn-primary" data-toggle="tooltip" title="Download"><i class="fa fa-lg fa-cloud-download"></i> Download</button></div><div ng-if="stateParams.type !== null" class="col-xs-12"><h5 class="text-muted">Filtered by <strong>{{stateParams.type}}</strong></h5></div></div><div class="visible-xs" style="text-align : center; width : 100%"><h2 ng-if="stateParams.view === \'details\'">Details View</h2><h2 ng-if="stateParams.view === \'list\'">List View</h2><h2 ng-if="stateParams.view === \'table\'">Table View</h2><h2 ng-if="stateParams.view === \'map\'">Map View</h2><div class="btn-group" role="group" aria-label="..." style="margin-top : 15px"><div class="btn-group" role="group"><button class="btn btn-primary dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-expanded="true">Change View <span class="caret"></span></button><ul class="dropdown-menu" role="menu" aria-labelledby="dropdownMenu1"><li ng-if="topicProperties.detailsViewTemplate" ng-class="{\'active\' : stateParams.view === \'details\'}" ng-click="onClickChangeView(\'details\')" class="text-primary" role="presentation"><a role="menuitem" tabindex="-1"><i class="fa fa-lg fa-th fa-fw"></i> Details</a></li><li ng-if="topicProperties.listViewTemplate" ng-class="{\'active\' : stateParams.view === \'list\'}" ng-click="onClickChangeView(\'list\')" class="text-primary" role="presentation"><a role="menuitem" tabindex="-1"><i class="fa fa-lg fa-list-alt fa-fw"></i> List</a></li><li ng-if="topicProperties.tableViewTemplate" ng-class="{\'active\' : stateParams.view === \'table\'}" ng-click="onClickChangeView(\'table\')" class="text-primary" role="presentation"><a role="menuitem" tabindex="-1"><i class="fa fa-lg fa-table fa-fw"></i> Table</a></li><li ng-class="{\'active\' : stateParams.view === \'map\'}" ng-click="onClickChangeView(\'map\')" class="text-primary" role="presentation"><a role="menuitem" tabindex="-1"><i class="fa fa-lg fa-map-marker fa-fw"></i> Map</a></li></ul></div><div ng-if="topicParams.view === \'list\' || (topicParams.view === \'map\' || topic.summary !== undefined)" class="btn-group" role="group"><button class="btn btn-primary dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-expanded="true">Filter <span class="caret"></span></button><ul class="dropdown-menu" role="menu" aria-labelledby="dropdownMenu1"><li class="text-primary" role="presentation"><a role="menuitem" tabindex="-1" ng-click="filterBy(null)">Show All</a></li><li ng-repeat="(key, value) in topic.summary.table" class="text-primary" role="presentation"><a role="menuitem" tabindex="-1" ng-click="filterBy(key)">{{key}}</a></li></ul></div></div><div class="col-xs-12" style="height : 10px"></div></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('simplicity');
} catch (e) {
  module = angular.module('simplicity', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('topics/topic-components/address-list/address-list.view.html',
    '<div ng-repeat="feature in topic.features | filter:filterText" class="col-xs-12 list-item-panel"><h4 class="text-muted text-center" style="margin-top : 20px; margin-botton : 20px"><span>{{feature.properties.street_number}} {{feature.properties.street_name}} {{feature.properties.street_type}}</span> <span ng-if="feature.properties.unit_number === null">,</span> <span ng-if="feature.properties.unit_number !== null">UNIT {{feature.properties.unit_number}},</span> <span>{{feature.properties.zip_code}}</span></h4></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('simplicity');
} catch (e) {
  module = angular.module('simplicity', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('topics/topic-components/crime/crime.list.view.html',
    '<div><div class="col-xs-12" ng-if="topic.features.length === 0"><div class="col-xs-12"><hr></div><h3 class="text-muted text-center"><strong>We couldn\'t find any results.</strong></h3><h4 class="text-muted text-center"><strong>Try expanding the time frame or extent of your search.</strong></h4></div><div ng-repeat="feature in topic.features | orderBy:\'-properties.thedate\' | filter:filterText" class="col-xs-12 list-item-panel" style="margin-bottom : 20px"><div class="col-xs-12"><h3 class="hidden-xs"><strong class="text-muted">{{feature.properties.offense}}</strong></h3><h3 class="visible-xs text-center"><strong class="text-muted">{{feature.properties.offense}}</strong></h3><p class="text-muted">{{feature.properties.description}}</p><a ng-if="stateParams.view !== \'map\'" ng-click="onChangeMapCenter(feature.properties, feature.properties.x, feature.properties.y)">Zoom to this crime on the map</a><hr><div class="col-xs-12 col-sm-6"><h4 class="pull-left hidden-xs">{{feature.properties.address}}</h4><h4 class="text-center visible-xs">{{feature.properties.address}}</h4></div><div class="col-xs-12 col-sm-6"><h4 class="pull-right hidden-xs">{{feature.properties.thedate|date}}</h4><h4 class="text-center visible-xs">{{feature.properties.thedate|date}}</h4></div></div><div class="col-xs-12 hidden-xs"><div class="col-sm-4"><p class="text-center"><strong>Case Number</strong></p><p class="text-center">{{feature.properties.casenumber}}</p></div><div class="col-sm-4"><p class="text-center"><strong>Law Beat</strong></p><p class="text-center">{{feature.properties.law_beat}}</p></div><div class="col-sm-4"><p class="text-center"><strong>Severity</strong></p><p class="text-center">{{feature.properties.severity}}</p></div></div><div class="col-xs-12 visible-xs"><div class="col-xs-12"><p class="text-center"><strong>Case Number:</strong> {{feature.properties.casenumber}}</p></div><div class="col-xs-12"><p class="text-center"><strong>Law Beat:</strong> {{feature.properties.law_beat}}</p><p class="text-center"></p></div><div class="col-xs-12"><p class="text-center"><strong>Severity:</strong> {{feature.properties.severity}}</p></div></div><a ng-click="showMore = !showMore"><p class="text-center" ng-if="showMore">Show More</p><p class="text-center" ng-if="showMore">Show Less</p></a></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('simplicity');
} catch (e) {
  module = angular.module('simplicity', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('topics/topic-components/crime/crime.summary.view.html',
    '<div><div class="col-xs-12" ng-if="topic.features.length === 0"><div class="col-xs-12"><hr></div><h3 class="text-muted text-center"><strong>We couldn\'t find any results.</strong></h3><h4 class="text-muted text-center"><strong>Try expanding the time frame or extent of your search.</strong></h4></div><table ng-if="topic.features.length !== 0" class="table table-hover col-xs-12"><thead><tr><th>Type</th><th class="text-center">Count</th></tr></thead><tbody><tr ng-repeat="(key, value) in topic.summary.table"><td ng-click="filterBy(key)" style="cursor : pointer"><i class="fa fa-circle" style="color: #{{value.color}}"></i> {{key}}<br><p class="text-muted">{{value.description}}</p></td><td class="text-center">{{value.count}}</td></tr></tbody></table></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('simplicity');
} catch (e) {
  module = angular.module('simplicity', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('topics/topic-components/owner/owner.details.view.html',
    '<div><div class="col-xs-12" ng-if="topic.features.length === 0"><div class="col-xs-12"><hr></div><h3 class="text-muted text-center"><strong>We couldn\'t find any results.</strong></h3></div><div ng-repeat="feature in topic.features | filter:filterText" class="col-xs-12 list-item-panel" style="margin-bottom : 30px"><h4>Owner</h4><strong class="text-muted">{{feature.properties.owner}}</strong><address>{{feature.properties.owner_address}}<br>{{feature.properties.owner_citystatezip}}</address></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('simplicity');
} catch (e) {
  module = angular.module('simplicity', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('topics/topic-components/owner/owner.list.view.html',
    '<div><div class="col-xs-12" ng-if="topic.features.length === 0"><div class="col-xs-12"><hr></div><h3 class="text-muted text-center"><strong>We couldn\'t find any results.</strong></h3></div><div ng-repeat="feature in topic.features | filter:filterText" class="col-xs-12 list-item-panel" style="margin-bottom : 30px"><h4>Owner</h4><strong class="text-muted">{{feature.properties.owner}}</strong><address>{{feature.properties.owner_address}}<br>{{feature.properties.owner_citystatezip}}</address></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('simplicity');
} catch (e) {
  module = angular.module('simplicity', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('topics/topic-components/owner/owner.view.html',
    '<div class="col-xs-12 list-item-panel"><h4>Owner</h4><strong class="text-muted">{{feature.properties.owner}}</strong><address>{{feature.properties.owner_address}}<br>{{feature.properties.owner_citystatezip}}</address></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('simplicity');
} catch (e) {
  module = angular.module('simplicity', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('topics/topic-components/development/development.list.view.html',
    '<div><div class="col-xs-12" ng-if="topic.features.length === 0"><div class="col-xs-12"><hr></div><h3 class="text-muted text-center"><strong>We couldn\'t find any results.</strong></h3><h4 class="text-muted text-center"><strong>Try expanding the time frame or extent of your search.</strong></h4></div><div ng-repeat="feature in topic.features | orderBy:\'-properties.thedate\' | filter:filterText" class="col-xs-12 list-item-panel" style="margin-bottom : 20px"><h3 class="text-center text-muted"><strong>{{feature.properties.record_type}}</strong></h3><h3 class="text-center">{{feature.properties.address}}</h3><a ng-if="stateParams.view !== \'map\'" ng-click="onChangeMapCenter(feature.properties, feature.properties.longitude, feature.properties.latitude)"><p class="text-center">Zoom to this development on the map</p></a><p class="text-muted text-center">{{feature.properties.description}}</p><div class="col-xs-12"><h4 class="col-xs-12 col-sm-4 text-center"><strong class="text-muted">Opened</strong><p>{{feature.properties.date_opened|date}}</p></h4><h4 class="col-xs-12 col-sm-4 text-center"><strong class="text-muted">Updated</strong><p>{{feature.properties.date_statused|date}}</p></h4><h4 class="col-xs-12 col-sm-4 text-center"><strong class="text-muted">Status</strong><p>{{feature.properties.record_status}}</p></h4></div><div class="col-xs-12 list-item-panel" ng-init="showMore = false" ng-show="showMore"><div class="col-xs-12"><h4 class="col-sm-6 text-center"><strong class="text-muted">Record Id</strong><p>{{feature.properties.record_id}}</p></h4><h4 class="col-sm-6 text-center"><strong class="text-muted">License Number</strong><p>{{feature.properties.license_number}}</p></h4></div><div class="col-xs-12"><h4 class="col-sm-6 text-center"><strong class="text-muted">Record Name</strong><p>{{feature.properties.record_name}}</p></h4><h4 class="col-sm-6 text-center"><strong class="text-muted">Business Name</strong><p>{{feature.properties.business_name}}</p></h4></div><div class="col-xs-12" ng-init="showComments = false" ng-show="showComments"><h4><strong class="text-muted">Comments</strong></h4><ul class="list-group" style="overflow : scroll; margin-bottom : 20px"><li class="list-group-item list-item-panel" style="margin : 5px" ng-repeat="comment in feature.properties.commentsArray">{{comment}}</li></ul></div><div class="col-xs-12"><a ng-click="showComments = !showComments"><h4 class="text-center" ng-if="!showComments">Show Comments</h4><h4 class="text-center" ng-if="showComments">Hide Comments</h4></a></div></div><a ng-click="showMore = !showMore"><h4 class="text-center" ng-if="!showMore">Show More</h4><h4 class="text-center" ng-if="showMore">Show Less</h4></a></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('simplicity');
} catch (e) {
  module = angular.module('simplicity', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('topics/topic-components/development/development.summary.view.html',
    '<div><div class="col-xs-12" ng-if="topic.features.length === 0"><div class="col-xs-12"><hr></div><h3 class="text-muted text-center"><strong>We couldn\'t find any results.</strong></h3><h4 class="text-muted text-center"><strong>Try expanding the time frame or extent of your search.</strong></h4></div><table ng-if="topic.features.length !== 0" class="table table-hover col-xs-12"><thead><tr><th>Type</th><th class="text-center">Count</th></tr></thead><tbody><tr ng-repeat="(key, value) in topic.summary.table"><td ng-click="filterBy(key)" style="cursor : pointer"><i class="fa fa-circle" style="color: #{{value.color}}"></i> {{key}}<br><p class="text-muted">{{value.description}}</p></td><td class="text-center">{{value.count}}</td></tr></tbody></table></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('simplicity');
} catch (e) {
  module = angular.module('simplicity', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('topics/topic-components/property/property.details.view.html',
    '<div><div class="col-xs-12" ng-if="topic.features.length === 0"><div class="col-xs-12"><hr></div><h3 class="text-muted text-center"><strong>We couldn\'t find any results.</strong></h3></div><div ng-repeat="feature in topic.features | filter:filterText" class="col-xs-12 list-item-panel" style="margin-bottom : 30px"><div style="margin-bottom : 20px"><div class="col-xs-12"><div class="col-xs-12"><h2>{{feature.properties.street_number}} {{feature.properties.street_name}} {{feature.properties.street_type}} <span ng-if="feature.properties.unit_number !== null">Unit {{feature.properties.unit_number}}</span></h2></div><div class="col-xs-12"><a target="_blank" href="{{feature.properties.googleDirectionsLink}}">Google Maps Directions</a></div><div class="col-xs-12 col-sm-6"><h4><strong class="text-muted">Civic Address Id</strong> : <span>{{feature.properties.civicaddress_id}}</span></h4><h4><strong class="text-muted">PIN</strong> : <span>{{feature.properties.pinnum}}</span></h4></div><div class="col-xs-12 col-sm-6"><h4 ng-if="feature.properties.isincity === \'Yes\'" class="text-muted"><i class="fa fa-lg fa-check-circle text-success pull-left"></i> <strong>It\'s in the city!</strong></h4><h4 ng-if="feature.properties.isincity === \'No\'" class="text-muted"><i class="fa fa-lg fa-times-circle text-danger pull-left"></i> <strong>It\'s not in the city!</strong></h4><h4 ng-if="feature.properties.iscityowned === \'Yes\'" class="text-muted"><i class="fa fa-lg fa-check-circle text-success pull-left"></i> <strong>It\'s city owned!</strong></h4><h4 ng-if="feature.properties.iscityowned === \'No\'" class="text-muted"><i class="fa fa-lg fa-times-circle text-danger pull-left"></i> <strong>It\'s not city owned!</strong></h4></div></div></div><div class="col-xs-12 list-item-panel"><h4>Address</h4><address class="text-muted"><strong>{{feature.properties.street_number}} {{feature.properties.street_name}} {{feature.properties.street_type}} <span ng-if="feature.properties.unit_number !== null">Unit {{feature.properties.unit_number}}</span></strong></address></div><div class="col-xs-12 list-item-panel"><h4>Owner</h4><strong class="text-muted">{{feature.properties.owner}}</strong><address>{{feature.properties.owner_address}}<br>{{feature.properties.owner_citystatezip}}</address></div><div class="col-xs-12 list-item-panel"><h4>Zoning</h4><h5 class="text-muted"><strong>District</strong> : <span ng-if="feature.properties.zoning.length > 0" ng-repeat="zoning in feature.properties.zoning"><span ng-if="zoning.codelink === \'disable\'">{{zoning.zoningDistrict}}</span> <a target="_blank" href="{{zoning.codelink}}" analytics-on="click" analytics-category="Topic Link" analytics-label="{{zoning.zoningDistrict}}" analytics-event="{{stateParams.topic}} zoning"><strong>{{zoning.zoningDistrict}} <span ng-if="$index !== feature.properties.zoning.length - 1 && feature.properties.zoning.length !== 1">,</span></strong></a></span> <span ng-if="feature.properties.zoning.length === 0 || feature.properties.zoning === undefined">No City of Asheville Zoning</span></h5><h5 ng-if="feature.properties.zoningOverlays !== undefined"><strong>Zoning Overlay</strong> : <span>{{feature.properties.zoningOverlays}}</span></h5></div><div ng-if="feature.properties.neighborhood !== null" class="col-xs-12 list-item-panel"><h4>Neighborhood</h4><h5 class="text-muted"><strong>{{feature.properties.neighborhood}}</strong></h5></div><div class="col-xs-12 list-item-panel"><h4>Property and Tax Value</h4><table class="table"><thead><tr><th>Value Type</th><th>Amount</th></tr></thead><tbody><tr><td>Building Value</td><td>${{feature.properties.buildingvalue|number}}</td></tr><tr><td>Land Value</td><td>${{feature.properties.landvalue|number}}</td></tr><tr><td>Appraised Value</td><td>${{feature.properties.appraisedvalue|number}}</td></tr><tr><td>Tax Value</td><td>${{feature.properties.taxvalue|number}}</td></tr><tr><td>Total Market Value</td><td>${{feature.properties.totalmarketvalue|number}}</td></tr></tbody></table></div><div class="col-xs-12 list-item-panel"><h4>Other Details</h4><p class="col-sm-6" ng-if="feature.properties.exempt === null">Tax exempt : <span>NO</span></p><p class="col-sm-6" ng-if="feature.properties.exempt !== null">Tax exempt : <span>YES</span></p><p class="col-sm-6" ng-if="feature.properties.improved === \'Y\'">Improved : <span>YES (${{feature.properties.improvementvalue|number}})</span></p><p class="col-sm-6">Appraisal Area : {{feature.properties.appraisalarea}}</p><p class="col-sm-6">Acreage : {{feature.properties.acreage}} acres</p></div><div class="col-xs-12 list-item-panel" style="margin-bottom : 20px"><br><a class="col-xs-12 col-sm-4 text-center btn btn-primary" style="margin-bottom : 10px" target="_blank" href="{{feature.properties.deed_url}}" analytics-on="click" analytics-category="Topic Link" analytics-label="{{feature.properties.deed_url}}" analytics-event="{{stateParams.topic}} deed"><i class="fa fa-2x fa-file-text-o"></i><br>Deed</a> <a class="col-xs-12 col-sm-4 text-center btn btn-primary" ng-class="{\'disabled\' : feature.properties.platbook === \'0000\' && feature.properties.platpage === \'0000\'}" style="margin-bottom : 10px" target="_blank" href="{{feature.properties.plat_url}}" analytics-on="click" analytics-category="Topic Link" analytics-label="{{feature.properties.plat_url}}" analytics-event="{{stateParams.topic}} plat"><i class="fa fa-2x fa-file-text-o"></i><br>Plat</a> <a class="col-xs-12 col-sm-4 text-center btn btn-primary" style="margin-bottom : 10px" target="_blank" href="{{feature.properties.propcard_url}}" analytics-on="click" analytics-category="Topic Link" analytics-label="{{feature.properties.propcard_url}}" analytics-event="{{stateParams.topic}} property card"><i class="fa fa-2x fa-file-text-o"></i><br>Property Card</a><br></div></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('simplicity');
} catch (e) {
  module = angular.module('simplicity', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('topics/topic-components/property/property.list.view.html',
    '<div><div class="col-xs-12" ng-if="topic.features.length === 0"><div class="col-xs-12"><hr></div><h3 class="text-muted text-center"><strong>We couldn\'t find any results.</strong></h3></div><div ng-repeat="feature in topic.features | filter:filterText" class="col-xs-12 list-item-panel" style="margin-bottom : 30px" ng-init="showMore = false"><div style="margin-bottom : 20px"><div class="col-xs-12"><div class="col-xs-12"><a ng-click="showMore = !showMore"><h2>{{feature.properties.street_number}} {{feature.properties.street_name}} {{feature.properties.street_type}} <span ng-if="feature.properties.unit_number !== null">Unit {{feature.properties.unit_number}}</span></h2></a></div><div class="col-xs-12"><div class="col-md-6"><a target="_blank" href="{{feature.properties.googleDirectionsLink}}">Google Maps Directions</a></div><div ng-if="stateParams.view !== \'map\'" class="col-md-6"><a ng-click="onChangeMapCenter(feature.properties, feature.properties.center_x, feature.properties.center_y)">Zoom to this property on the map</a></div></div><div class="col-xs-12 col-sm-6"><h4><strong class="text-muted">Civic Address Id</strong> : <span>{{feature.properties.civicaddress_id}}</span></h4><h4><strong class="text-muted">PIN</strong> : <span>{{feature.properties.pinnum}}</span></h4></div><div class="col-xs-12 col-sm-6"><h4 ng-if="feature.properties.isincity === \'Yes\'" class="text-muted"><i class="fa fa-lg fa-check-circle text-success pull-left"></i> <strong>It\'s in the city!</strong></h4><h4 ng-if="feature.properties.isincity === \'No\'" class="text-muted"><i class="fa fa-lg fa-times-circle text-danger pull-left"></i> <strong>It\'s not in the city!</strong></h4><h4 ng-if="feature.properties.iscityowned === \'Yes\'" class="text-muted"><i class="fa fa-lg fa-check-circle text-success pull-left"></i> <strong>It\'s city owned!</strong></h4><h4 ng-if="feature.properties.iscityowned === \'No\'" class="text-muted"><i class="fa fa-lg fa-times-circle text-danger pull-left"></i> <strong>It\'s not city owned!</strong></h4></div></div><div class="col-xs-12"><a href=""><h4 class="text-center" ng-click="showMore = true" ng-show="!showMore">Show More</h4></a></div></div><div class="col-xs-12 list-item-panel" ng-show="showMore"><h4>Address</h4><address class="text-muted"><strong>{{feature.properties.street_number}} {{feature.properties.street_name}} {{feature.properties.street_type}} <span ng-if="feature.properties.unit_number !== null">Unit {{feature.properties.unit_number}}</span></strong></address></div><div class="col-xs-12 list-item-panel" ng-show="showMore"><h4>Owner</h4><strong class="text-muted">{{feature.properties.owner}}</strong><address>{{feature.properties.owner_address}}<br>{{feature.properties.owner_citystatezip}}</address></div><div class="col-xs-12 list-item-panel" ng-show="showMore"><h4>Zoning</h4><h5 class="text-muted"><strong>District</strong> : <span ng-if="feature.properties.zoning.length > 0" ng-repeat="zoning in feature.properties.zoning"><span ng-if="zoning.codelink === \'disable\'">{{zoning.zoningDistrict}}</span> <a target="_blank" href="{{zoning.codelink}}" analytics-on="click" analytics-category="Topic Link" analytics-label="{{zoning.zoningDistrict}}" analytics-event="{{stateParams.topic}} zoning"><strong>{{zoning.zoningDistrict}} <span ng-if="$index !== feature.properties.zoning.length - 1 && feature.properties.zoning.length !== 1">,</span></strong></a></span> <span ng-if="feature.properties.zoning.length === 0 || feature.properties.zoning === undefined">No City of Asheville Zoning</span></h5><h5 ng-if="feature.properties.zoningOverlays !== undefined"><strong>Zoning Overlay</strong> : <span>{{feature.properties.zoningOverlays}}</span></h5></div><div ng-if="feature.properties.neighborhood !== null" class="col-xs-12 list-item-panel" ng-show="showMore"><h4>Neighborhood</h4><h5 class="text-muted"><strong>{{feature.properties.neighborhood}}</strong></h5></div><div class="col-xs-12 list-item-panel" ng-show="showMore"><h4>Property and Tax Value</h4><table class="table"><thead><tr><th>Value Type</th><th>Amount</th></tr></thead><tbody><tr><td>Building Value</td><td>${{feature.properties.buildingvalue|number}}</td></tr><tr><td>Land Value</td><td>${{feature.properties.landvalue|number}}</td></tr><tr><td>Appraised Value</td><td>${{feature.properties.appraisedvalue|number}}</td></tr><tr><td>Tax Value</td><td>${{feature.properties.taxvalue|number}}</td></tr><tr><td>Total Market Value</td><td>${{feature.properties.totalmarketvalue|number}}</td></tr></tbody></table></div><div class="col-xs-12 list-item-panel" ng-show="showMore"><h4>Other Details</h4><p class="col-sm-6" ng-if="feature.properties.exempt === null">Tax exempt : <span>NO</span></p><p class="col-sm-6" ng-if="feature.properties.exempt !== null">Tax exempt : <span>YES</span></p><p class="col-sm-6" ng-if="feature.properties.improved === \'Y\'">Improved : <span>YES (${{feature.properties.improvementvalue|number}})</span></p><p class="col-sm-6">Appraisal Area : {{feature.properties.appraisalarea}}</p><p class="col-sm-6">Acreage : {{feature.properties.acreage}} acres</p></div><div class="col-xs-12 list-item-panel" style="margin-bottom : 20px" ng-show="showMore"><br><a class="col-xs-12 col-sm-4 text-center btn btn-primary" style="margin-bottom : 10px" target="_blank" href="{{feature.properties.deed_url}}" analytics-on="click" analytics-category="Topic Link" analytics-label="{{feature.properties.deed_url}}" analytics-event="{{stateParams.topic}} deed"><i class="fa fa-2x fa-file-text-o"></i><br>Deed</a> <a class="col-xs-12 col-sm-4 text-center btn btn-primary" ng-class="{\'disabled\' : feature.properties.platbook === \'0000\' && feature.properties.platpage === \'0000\'}" style="margin-bottom : 10px" target="_blank" href="{{feature.properties.plat_url}}" analytics-on="click" analytics-category="Topic Link" analytics-label="{{feature.properties.plat_url}}" analytics-event="{{stateParams.topic}} plat"><i class="fa fa-2x fa-file-text-o"></i><br>Plat</a> <a class="col-xs-12 col-sm-4 text-center btn btn-primary" style="margin-bottom : 10px" target="_blank" href="{{feature.properties.propcard_url}}" analytics-on="click" analytics-category="Topic Link" analytics-label="{{feature.properties.propcard_url}}" analytics-event="{{stateParams.topic}} property card"><i class="fa fa-2x fa-file-text-o"></i><br>Property Card</a><br></div><div class="col-xs-12" ng-init="showMore = false"><a href=""><h4 class="text-center" ng-click="showMore = false" ng-show="showMore">Show Less</h4></a></div></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('simplicity');
} catch (e) {
  module = angular.module('simplicity', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('topics/topic-components/recycling-collection/recycling.collection.simple.view.html',
    '<div><h4 class="text-muted text-center">Recycling is collected every other week.</h4><h3 class="text-center">Your recycling will be collected</h3><h3 class="text-center"><strong class="text-muted">{{topic.recyclingSchedule.when}} on {{topic.recyclingDay}}</strong>.</h3></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('simplicity');
} catch (e) {
  module = angular.module('simplicity', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('topics/topic-components/street-maintenance/street.maintenance.list.view.html',
    '<div ng-repeat="feature in topic.features | filter:filterText" class="col-xs-12 list-item-panel" style="margin-bottom : 20px"><div ng-if="stateParams.view !== \'map\'" class="col-xs-12 text-center"><a clas="pull-right" ng-click="onChangeMapCenter(feature.properties, feature.properties.center_x, feature.properties.center_y)">Zoom to this centerline on the map</a></div><div class="col-sm-6 col-xs-12"><h5 class="text-center">Name</h5><h4 class="text-muted text-center" style="margin-top : 20px; margin-botton : 20px"><strong>{{feature.properties.full_street_name}}</strong></h4></div><div class="col-sm-6 col-xs-12"><h5 class="text-center">Centerline ID</h5><h4 class="text-muted text-center" style="margin-top : 20px; margin-botton : 20px"><strong>{{feature.properties.centerline_id}}</strong></h4></div><div class="col-xs-12"><h5 class="col-xs-12 text-center">Responsibility</h5><h2 ng-if="feature.properties.street_responsibility_contact === null" class="text-muted text-center" style="margin-top : 20px; margin-botton : 20px"><strong>{{feature.properties.street_responsibility}}</strong></h2><a ng-if="feature.properties.street_responsibility_contact !== null" target="_blank" href="{{feature.properties.street_responsibility_contact}}"><h2 class="text-center" style="margin-top : 20px;"><strong>{{feature.properties.street_responsibility}}</strong></h2></a> <a ng-if="feature.properties.street_responsibility_contact !== null" target="_blank" href="{{feature.properties.street_responsibility_contact}}"><h4 class="text-center" style="margin-botton : 20px">Click here to contact the maintanace authority</h4></a> <a ng-if="feature.properties.street_responsibility_citizen_service_requests.brand !== null" target="_blank" href="{{feature.properties.street_responsibility_citizen_service_requests.url}}"><h4 class="text-center" style="margin-botton : 20px">Or click here to make citizen service request using the {{feature.properties.street_responsibility_citizen_service_requests.brand}}</h4></a></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('simplicity');
} catch (e) {
  module = angular.module('simplicity', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('topics/topic-components/trash-collection/trash.collection.simple.view.html',
    '<div><h3 class="text-center">Your trash is collected every</h3><h3 class="text-center"><strong class="text-muted">{{topic.trash}}</strong>.</h3></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('simplicity');
} catch (e) {
  module = angular.module('simplicity', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('topics/topic-components/zoning/zoning.view.html',
    '<div ng-repeat="feature in topic.features"><div class="col-xs-12 list-item-panel" style="margin-bottom : 20px"><h4>Zoning</h4><h5 class="text-muted"><strong>District</strong> : <span ng-if="feature.properties.zoning.length > 0" ng-repeat="zoning in feature.properties.zoning"><span ng-if="zoning.codelink === \'disable\'">{{zoning.zoningDistrict}}</span> <a target="_blank" href="{{zoning.codelink}}" analytics-on="click" analytics-category="Topic Link" analytics-label="{{zoning.zoningDistrict}}" analytics-event="{{stateParams.topic}} zoning"><strong>{{zoning.zoningDistrict}}<span ng-if="$index !== feature.properties.zoning.length - 1 && feature.properties.zoning.length !== 1">,</span></strong></a></span> <span ng-if="feature.properties.zoning.length === 0 || feature.properties.zoning === undefined">No City of Asheville Zoning</span></h5><h5 ng-if="feature.properties.zoningOverlays !== undefined"><strong>Zoning Overlay</strong> : <span>{{feature.properties.zoningOverlays}}</span></h5></div></div>');
}]);
})();
