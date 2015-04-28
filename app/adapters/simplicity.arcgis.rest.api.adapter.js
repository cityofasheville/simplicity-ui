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
        'sqlArray' : ['idnum in (', 'crimeIds', ') and thedate >', 'time'],
        'sqlParamName' : 'where',
        'queryParams' : {
          'where' : '',
          'f' : 'json',
          'outFields' : '*' 
        }
      },
      'street_name' : {
        'sqlArray' : ['idnum in (', 'crimeIds', ') and thedate >', 'time'],
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
      'neighborhood' : {
        'sqlArray' : ["neighborhood='", "neighborhoodName", "'"],
        'sqlParamName' : 'where',
        'queryParams' : {
          'where' : '',
          'f' : 'json',
          'outFields' : 'objectid, owner, owner_address, owner_citystatezip'  
        }
      }
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



   


