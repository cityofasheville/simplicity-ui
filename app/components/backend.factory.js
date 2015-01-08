app.factory('Backend', ['$http', '$location', '$q', '$filter', '$stateParams', 'Topic',
  function($http, $location, $q, $filter, $stateParams, Topic){



    //*******************************************************************************************
    //*******************************************************************************************
    //*******************************************************************************************
    //               _               _                             _         _      _            
    //  _ __   _ __ (_)__   __ __ _ | |_  ___  __   __ __ _  _ __ (_)  __ _ | |__  | |  ___  ___ 
    // | '_ \ | '__|| |\ \ / // _` || __|/ _ \ \ \ / // _` || '__|| | / _` || '_ \ | | / _ \/ __|
    // | |_) || |   | | \ V /| (_| || |_|  __/  \ V /| (_| || |   | || (_| || |_) || ||  __/\__ \
    // | .__/ |_|   |_|  \_/  \__,_| \__|\___|   \_/  \__,_||_|   |_| \__,_||_.__/ |_| \___||___/
    // |_|                                                                                       
    //*******************************************************************************************
    //*******************************************************************************************
    //*******************************************************************************************



    
    //Object defines the server address
    var serverProperties = {
      'baseServicesUrl' : 'http://arcgis-arcgisserver1-1222684815.us-east-1.elb.amazonaws.com/arcgis/rest/services',
      'geocodeServiceName' : 'coa_composite_locator',
      'featureServiceName' : 'opendata',
    };

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

    //Object that maps key words to feature service ids
    var featureService = {
        'crime' : 0,
        'permit' : 1,
        'address' : 2,
        'addressBufferCache' : 3,
        'neighborhood' : 4,
        'cityLimit' : 5,
        'property' : 6,
        'zoning' : 7,
        'zoningOverlay' : 8,
        'street' : 9,
        'azimuthalStreetView' : 10,
        'xref' : 11,
        'dataCache' : 12
    };

    //container for data cache properties
    var dataCacheProperties = {};

    //We need a date to filter the timeframe, so get today's date
    var d = new Date();

    //filterValues are the actual values used to filter the topic
    //filterValues are numberic form of the text values from options
    var filterValues = {
      'extent' : {
        'within-about-a-block' : 330,
        'within-an-eighth-of-a-mile' : 660,
        'within-a-quarter-mile' : 1320,
      },
      'timeframe' : {
        'last-30-days' : d.setMonth(d.getMonth() - 1),
        'last-6-months' : d.setMonth(d.getMonth() - 6),
        'last-year' : d.setFullYear(d.getFullYear()-1),
        'last-5-years': d.setFullYear(d.getFullYear()-5),
        'last-10-years': d.setFullYear(d.getFullYear()-10),
        'all-time' : d.setFullYear(d.getFullYear()-100)
      }
    };

    var colors = {
      'crime' : {
        'Aggravated Assault' : 'FF0000',
        'Burglary' : 'FFF000',
        'Drug Arrest' : 'FFFF00',
        'Homicide' : 'FFFFF0',
        'Larceny' : '00FFFF',
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
      }
    };

    var codelinks = {
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
    };




    //*********************************************************************************************  
    //*********************************************************************************************  
    //*********************************************************************************************  
    //               _               _           __                      _    _                    
    //  _ __   _ __ (_)__   __ __ _ | |_  ___   / _| _   _  _ __    ___ | |_ (_)  ___   _ __   ___ 
    // | '_ \ | '__|| |\ \ / // _` || __|/ _ \ | |_ | | | || '_ \  / __|| __|| | / _ \ | '_ \ / __|
    // | |_) || |   | | \ V /| (_| || |_|  __/ |  _|| |_| || | | || (__ | |_ | || (_) || | | |\__ \
    // | .__/ |_|   |_|  \_/  \__,_| \__|\___| |_|   \__,_||_| |_| \___| \__||_| \___/ |_| |_||___/
    // |_|                                                                                         
    //*********************************************************************************************    
    //*********************************************************************************************  
    //*********************************************************************************************  




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

    //Creates an array from a null value or a string
    //converts null to empty array and splits string on delimiter
    var createArrayFromNullorString = function(value, delimiter){
      if(value === null){
        return [];
      }else{
      return value.split(delimiter);
      }
    };




    // +-+-+-+-+-+-+-+-+-+-+-+-+
    // |q|u|e|r|y|B|a|c|k|e|n|d|
    // +-+-+-+-+-+-+-+-+-+-+-+-+ 

    //Generic function to query to backend ArcGIS Server REST API
    //featureServiceId is the id of the feature service: Use the featureService variable above to map keywords to the feature serivice id
    //options is an object of query parameters (see ArcGIS REST API for available options)
                                                                                                                                       
    var queryBackend = function(featureServiceId, options){
        //Create a url by joining elements of an array (so they need to be in order!)
        var featureServiceUrl = [
                serverProperties.baseServicesUrl, 
                serverProperties.featureServiceName, 
                'FeatureServer', 
                featureServiceId,
                'query'
            ].join('/');

        //use $q promises to handle the http request asynchronously
        var q = $q.defer();
        //make http request
        $http({method : 'GET', url : featureServiceUrl, params : options, cache : true})
            //callbacks
            .success(function(data, status, headers, config){
                if(data.error){
                    console.log(data.error.code + ' queryBackend on featureServiceId ' + featureServiceId + '. ' + data.error.message);
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






    // +-+-+-+-+-+-+-+-+-+
    // |d|a|t|a|C|a|c|h|e|
    // +-+-+-+-+-+-+-+-+-+

    //On the dataCachedProperties object, this function either creates a parent property 
    //if none exist and then assign a property with a value to the parent property
    //Or just assigns a property with a value to the parent property on the dataCachedProperties object
    var assignValueToDataCacheProperties = function(parentPropertyName, thisPropertyName, value){
      //check if parent property already exist
      if(dataCacheProperties[parentPropertyName]){
        //assign property with value to parent property
        dataCacheProperties[parentPropertyName][thisPropertyName] = value;
      //parent property doesn't exist, so create it
      }else{
        dataCacheProperties[parentPropertyName] = {};
        //assign property with value to parent property
        dataCacheProperties[parentPropertyName][thisPropertyName] = value;
      }
    };

    //Queries backend data cache for a single civicaddress id, updates the dataCacheProperties variable, and return updated dataCacheProperties variable
    var queryDataCacheWithASingleId = function(id){
      //use $q promises to handle the http request asynchronously
      var q = $q.defer();
      //build query params for the request with a where clause
      var queryParams = {
        'where' : 'civicaddress_id=' + id,
        'f' : 'json',
        'outFields' : '*'
      };
      //make request
      queryBackend(featureService.dataCache, queryParams)
        //callback when request is complete
        .then(function(dataCacheResults){
          for (var i = 0; i < dataCacheResults.features.length; i++) {
            //assign iterator to attributes to make it easier to read
            var attributes = dataCacheResults.features[i].attributes;
            //assign values
            if(attributes.type === 'ADDRESS IN CITY'){
              dataCacheProperties.inTheCity = (attributes.data === 'YES')? true : false;
            }else if(attributes.type === 'CRIME'){
              assignValueToDataCacheProperties('crime', attributes.distance, createArrayFromNullorString(attributes.data, ','));
            }else if(attributes.type === 'ZONING'){
              dataCacheProperties.zoning = createArrayFromNullorString(attributes.data, ',');
            }else if(attributes.type === 'PERMITS'){
              assignValueToDataCacheProperties('development', attributes.distance, createArrayFromNullorString(attributes.data, ','));
            }else if(attributes.type === 'TRASH DAY'){
              dataCacheProperties.trash = attributes.data;
            }else if(attributes.type === 'RECYCLE DAY'){
              dataCacheProperties.recycling = attributes.data;
            }else if(attributes.type === 'ZONING OVERLAYS'){
              dataCacheProperties.zoningOverlays = attributes.data;
            }else{
              //Do nothing
            }
          }
          q.resolve(dataCacheProperties);
        });
        return q.promise;
    };//END queryDataCacheWithASingleId function

    //Queries backend data cache with an array of civicaddress ids, updates the dataCacheProperties variable, and return updated dataCacheProperties variable
    var queryDataCacheWithAnArrayOfIds = function(ids){
      //use $q promises to handle the http request asynchronously
      var q = $q.defer();
      //build query params for the request with a 'where in' clause
      var queryParams = {
        'where' : 'civicaddress_id in (' + ids.join() + ')',
        'f' : 'json',
        'outFields' : '*'
      };
      queryBackend(featureService.dataCache, queryParams)
        .then(function(dataCacheResults){
          var crime = {};
          var development = {};
          for (var i = 0; i < dataCacheResults.features.length; i++) {
            var attributes = dataCacheResults.features[i].attributes;
            console.log(dataCacheResults.features[i]);
            if(attributes.type === 'CRIME'){
              if(crime[attributes.distance] === undefined){
                crime[attributes.distance] = {};
              }
              var crimeArray = createArrayFromNullorString(attributes.data, ',');
              for (var x = 0; x < crimeArray.length; x++) {
                if(!crime[attributes.distance][crimeArray[x]]){
                  crime[attributes.distance][crimeArray[x]] = 'crime';
                }
              }
            }else if(attributes.type === 'PERMITS'){
              if(development[attributes.distance] === undefined){
                development[attributes.distance] = {};
              }
              var developmentArray = createArrayFromNullorString(attributes.data, ',');
              for (var y = 0;y < developmentArray.length; y++) {
                if(!development[attributes.distance][developmentArray[y]]){
                  development[attributes.distance][developmentArray[y]] = 'development';
                }
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
          q.resolve(properties);
        });
    };//END queryDataCacheWithAnArrayOfIds function





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
          'linkTo' : '#/topics/list?searchby=' + compositeGeocoderResults.candidates[i].attributes.Loc_name + '&id=' + compositeGeocoderResults.candidates[i].attributes.User_fld
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
      console.log(searchGroups)
      return searchGroups;
    }//END formatEsriCompositeGeocoderResults function



    var Topic = {};


    // +-+-+-+-+-+-+-+-+
    // |p|r|o|p|e|r|t|y|
    // +-+-+-+-+-+-+-+-+

    //We need to use the pinnum to lookup property information 
    //We can access the pinnum by cross-referencing the cividaddress id in the xref table
    //WE can acess the civicaddress id from the stateParams
    Topic.property = function(){
      var q = $q.defer();
      //It only makes sense to the get the property information about a single address
      if($stateParams.address !== 'address'){
        //!!!throw an error
      }
      //build query params for the request with a where clause
      var queryParams = {
        'where' : 'civicaddress_id=' + Number($stateParams.id),
        'f' : 'json',
        'outFields' : 'pinnum'
      };
      queryBackend(featureService.xref, queryParams)
        .then(function(xRef){
          //build query params for the request with a where clause
          var queryParams = {
            'where' : "pinnum='" + xRef.features[0].attributes.pinnum + "'",
            'f' : 'json',
            'outFields' : '*'
          };
          queryBackend(featureService.property, queryParams)
            .then(function(property){
              property.features[0].attributes.codelinks = codelinks;
              q.resolve(property.features[0]);
            })

        })
      return q.promise;
    };//END property function




    // +-+-+-+-+-+
    // |c|r|i|m|e|
    // +-+-+-+-+-+

    var formatCrimeData = function(crimes){

      //object that holds a summary of the feature {filterValue : count}
      //e.g. for crime {'Bulgary' : 12, 'Larceny' : 2}
      var filteredFeaturesSummary= {
        'template' : 'summary',
        'table' : {}
      };
      //array that holds features filtered by time and the filter value
      var filterdFeaturesArray = [];

      for (var i = 0; i < crimes.features.length; i++) {
        //filter by time
        if(crimes.features[i].attributes.thedate >= filterValues.timeframe[$stateParams.timeframe]){
          //set color by offense
          crimes.features[i].attributes.color = colors[crimes.features[i].attributes.offense];          
          //build a summary object
          if(filteredFeaturesSummary.table[crimes.features[i].attributes.offense] === undefined){

            filteredFeaturesSummary.table[crimes.features[i].attributes.offense] = {'color' : colors[crimes.features[i].attributes.offense], 'count' : 1 };

          }else{
            filteredFeaturesSummary.table[crimes.features[i].attributes.offense].count = filteredFeaturesSummary.table[crimes.features[i].attributes.offense].count + 1;
          }
          //add filtered features to array
          if($stateParams.type === null || crimes.features[i].attributes.offense.toLowerCase().replace(/ /g, '-') === $stateParams.filter){
            crimes.features[i].template = $stateParams.category;
            filterdFeaturesArray.push(crimes.features[i]);
          }
          
        }
      }

      //Update filter options based on filter summary
      var filterOptions = [];
      filterOptions.push({'value' : 'all', 'label' : 'All'});
      for (var key in filteredFeaturesSummary.table) {
        filterOptions.push({'value' : key.toLowerCase().replace(/ /g, '-'), 'label' : key});
      }
      Topic.typeOptions(filterOptions);
      var filteredDetails = {
        'features' : filterdFeaturesArray,
        'summary' : filteredFeaturesSummary
      };
      return filteredDetails;

    };//END formatCrimeData
    
    Topic.crime = function(){
      var q = $q.defer();

      if(!dataCacheProperties.crimes){
        //!!!throw an error
      }

      //Crime 'pids' should be accessible through the dataCacheProperties object for addresses
      if($stateParams.searchby === 'address'){
        //we only want the crimes for extent specified as a $stateParams
        //use the filterValues variable (above) to lookup the extent value based on $stateParams.extent
        //!!!We should probably filter by date in the where clause; Need to format the date for ESRI, can't use a timestamp
        var addressQueryParams = {
          'where' : 'pid in (' + dataCacheProperties.crime[filterValues.extent[$stateParams.extent]] + ')',
          'f' : 'json',
          'outFields' : '*'
        };
        queryBackend(featureService.crime, addressQueryParams)
          .then(function(crimes){
            q.resolve(formatCrimeData(crimes));
          });


      //Crime 'pids' should be accessible through the dataCacheProperties object streets but we want to hardcode the extent
      //to limit searches to smallest extent
      }else if($stateParams.searchby === 'street'){
        //we only want the smallest extent for each address next to the street
        //!!!We should probably filter by date in the where clause; Need to format the date for ESRI, can't use a timestamp
        var streetQueryParams = {
          'where' : 'pid in (' + dataCacheProperties.crime['82.5'] + ')',
          'f' : 'json',
          'outFields' : '*'
        };
        queryBackend(featureService.crime, streetQueryParams)
          .then(function(crimes){
            q.resolve(formatCrimeData(crimes));
          });


      //For neighborhoods, lookup the crimes directly from the crimes table using the neighborhood name
      }else if($stateParams.searchby === 'neighborhood'){
        var neighborhoodQueryParams = {
          'where' : 'neighborhood=' + $stateParams.id,
          'f' : 'json',
          'outFields' : '*'
        };
        queryBackend(featureService.crime, neighborhoodQueryParams)
          .then(function(crimes){
            q.resolve(formatCrimeData(crimes));
          });
      }

      return q.promise;
    };




    // +-+-+-+-+-+-+-+-+-+-+-+
    // |d|e|v|e|l|o|p|m|e|n|t|
    // +-+-+-+-+-+-+-+-+-+-+-+

    var formatDevelopmentData = function(development){

      //object that holds a summary of the feature {filterValue : count}
      //e.g. for development {'Level 1' : 12, 'Level 1' : 2}
      var filteredFeaturesSummary= {
        'template' : 'summary',
        'table' : {}
      };
      //array that holds features filtered by time and the filter value
      var filterdFeaturesArray = [];

      for (var i = 0; i < development.features.length; i++) {
        //filter by time
        if(development.features[i].attributes.date_opened >= filterValues.timeframe[$stateParams.timeframe]){
          //set color by record_type
          development.features[i].attributes.color = colors[development.features[i].attributes.record_type];          
          //build a summary object
          if(filteredFeaturesSummary.table[development.features[i].attributes.record_type] === undefined){

            filteredFeaturesSummary.table[development.features[i].attributes.record_type] = {'color' : colors[development.features[i].attributes.record_type], 'count' : 1 };

          }else{
            filteredFeaturesSummary.table[development.features[i].attributes.record_type].count = filteredFeaturesSummary.table[development.features[i].attributes.record_type].count + 1;
          }
          //add filtered features to array
          if($stateParams.type === null || development.features[i].attributes.record_type.toLowerCase().replace(/ /g, '-') === $stateParams.filter){
            development.features[i].template = $stateParams.category;
            filterdFeaturesArray.push(development.features[i]);
          }
          
        }
      }

      //Update filter options based on filter summary
      var filterOptions = [];
      filterOptions.push({'value' : 'all', 'label' : 'All'});
      for (var key in filteredFeaturesSummary.table) {
        filterOptions.push({'value' : key.toLowerCase().replace(/ /g, '-'), 'label' : key});
      }
      Topic.typeOptions(filterOptions);
      var filteredDetails = {
        'features' : filterdFeaturesArray,
        'summary' : filteredFeaturesSummary
      };
      return filteredDetails;

    };//END formatDevelopmentData
    
    Topic.development = function(){
      var q = $q.defer();

      if(!dataCacheProperties.development){
        //!!!throw an error
      }

      //Crime 'pids' should be accessible through the dataCacheProperties object for addresses
      if($stateParams.searchby === 'address'){
        //we only want the development for extent specified as a $stateParams
        //use the filterValues variable (above) to lookup the extent value based on $stateParams.extent
        //!!!We should probably filter by date in the where clause; Need to format the date for ESRI, can't use a timestamp
        var addressQueryParams = {
          'where' : "apn in (" + dataCacheProperties.development[filterValues.extent[$stateParams.extent]] + ") and record_module = 'Planning' and record_type_type = 'Development'",
          'f' : 'json',
          'outFields' : '*'
        };
        queryBackend(featureService.development, addressQueryParams)
          .then(function(development){
            q.resolve(formatDevelopmentData(development));
          });


      //Crime 'pids' should be accessible through the dataCacheProperties object streets but we want to hardcode the extent
      //to limit searches to smallest extent
      }else if($stateParams.searchby === 'street'){
        //we only want the smallest extent for each address next to the street
        //!!!We should probably filter by date in the where clause; Need to format the date for ESRI, can't use a timestamp
        var streetQueryParams = {
          'where' : 'pid in (' + "apn in (" + dataCacheProperties.development['82.5'] + ") and record_module = 'Planning' and record_type_type = 'Development'", 
          'f' : 'json',
          'outFields' : '*'
        };
        queryBackend(featureService.development, streetQueryParams)
          .then(function(development){
            q.resolve(formatDevelopmentData(development));
          });


      //For neighborhoods, lookup the development directly from the development table using the neighborhood name
      }else if($stateParams.searchby === 'neighborhood'){
        var streetQueryParams = {
          'where' : 'neighborhood=' + $stateParams.id,
          'f' : 'json',
          'outFields' : '*'
        };
        queryBackend(featureService.development, streetQueryParams)
          .then(function(development){
            q.resolve(formatDevelopmentData(development));
          });
      }

      return q.promise;
    };




    // +-+-+-+-+-+
    // |t|r|a|s|h|
    // +-+-+-+-+-+

    Topic.trash = function(){
      var q = $q.defer();
      q.resolve(dataCacheProperties.trash);
      return q.promise;
    };




    // +-+-+-+-+-+-+-+-+-+
    // |r|e|c|y|l|c|i|n|g|
    // +-+-+-+-+-+-+-+-+-+

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

    Topic.recycling = function(){
      var q = $q.defer();
      var recyclingArray = dataCacheProperties.recycling.split(' ');
      var currentRecyclingWeek = getCurrentRecyclingWeek();
      if(recyclingArray[3] === 'A)'){
        if(getCurrentRecyclingWeek() === 'A'){
          q.resolve({'week' : 'A', 'when' : 'this week'});
        }else{
          q.resolve({'week' : 'A', 'when' : 'next week'});
        }
      }else{
        if(getCurrentRecyclingWeek() === 'B'){
          q.resolve({'week' : 'B', 'when' : 'this week'});
        }else{
          q.resolve({'week' : 'B', 'when' : 'next week'});
        }
      }
      return q.promise;
    };




    // +-+-+-+-+ +-+-+-+ +-+-+-+-+-+ +-+-+-+-+-+-+-+-+-+-+
    // |l|e|a|f| |a|n|d| |b|r|u|s|h| |c|o|l|l|e|c|t|i|o|n|
    // +-+-+-+-+ +-+-+-+ +-+-+-+-+-+ +-+-+-+-+-+-+-+-+-+-+

    Topic.leafAndBrushCollection = function(){
      var q = $q.defer();
      var trashDay = trash();
      var recyclingSchedule = recycling();
      if(trashDay === 'MONDAY' || trashDay === 'TUESDAY'){
        if(recyclingSchedule.week === 'B' && recyclingSchedule.when === 'this week'){
          q.resolve({'when' : 'this week'});
        }else{
          q.resolve({'when' : 'next week'});
        }
      }else{
        if(recyclingSchedule.week === 'A' && recyclingSchedule.when === 'this week'){
          q.resolve({'when' : 'this week'});
        }else{
          q.resolve({'when' : 'next week'});
        }
      }
      return q.promise;
    };




    // +-+-+-+-+-+-+
    // |z|o|n|i|n|g|
    // +-+-+-+-+-+-+

    Topic.zoning = function(){
      var q = $q.defer();
      if(featureService.zoningOverlays){
        var zoningOverlaysSplit = featureService.zoningOverlays.split('-');
        var queryParams = {
          'where' : "name='" + zoningOverlaysSplit[0] + "'",
          'f' : 'json',
          'outFields' : '*'
        };
        queryBackend(zoningOverlay, queryParams)
              .then(function(zoningOverlayLayer){
                var zoningProperties = {
                  'zoning' : featureService.zoning,
                  'codelink' : codelinks[featureService.zoning],
                  'zoningOverlays' : zoningOverlayLayer.features[0]
                };
                q.resolve(zoningProperties);
              });
      }else{

        var zoningProperties = {
          'zoning' : featureService.zoning,
          'codelink' : codelinks[featureService.zoning],
          'zoningOverlays' : 'disable'
        };
        q.resolve(zoningProperties);
      }
      
      return q.promise;
    };




    // +-+-+-+-+-+-+ +-+-+-+-+-+-+-+-+-+-+-+
    // |s|t|r|e|e|t| |m|a|i|n|t|e|n|a|n|c|e|
    // +-+-+-+-+-+-+ +-+-+-+-+-+-+-+-+-+-+-+

    Topic.streetMaintenance = function(){

    };





    // +-+-+-+-+-+-+-+ +-+-+-+-+-+
    // |a|d|d|r|e|s|s| |l|i|s|t|s|
    // +-+-+-+-+-+-+-+ +-+-+-+-+-+

    Topic.addressLists = function(){

    };


    //************************************************* 
    //************************************************* 
    //************************************************* 
    //              _     _ _           _    ____ ___ 
    //  _ __  _   _| |__ | (_) ___     / \  |  _ \_ _|
    // | '_ \| | | | '_ \| | |/ __|   / _ \ | |_) | | 
    // | |_) | |_| | |_) | | | (__   / ___ \|  __/| | 
    // | .__/ \__,_|_.__/|_|_|\___| /_/   \_\_|  |___|
    // |_|                                            
    //************************************************* 
    //************************************************* 
    //*************************************************                                                    

    //The factory object (what is returned from the factory)
    var Backend = {};


    //id can be a single civicaddress id or an array of civicaddress ids
    Backend.dataCache = function(id){
      var q = $q.defer();
      var queryParams = {};
      //if id is an array use a 'where in' sql statement
      if(id.construtor === Array){
        q.resolve(queryDataCacheWithAnArrayOfIds(id));
      //otherwise just use a 'where' sql statement
      }else{
        q.resolve(queryDataCacheWithASingleId(id));
      }
      return q.promise;
    };

    // +-+-+-+-+-+
    // |t|o|p|i|c|
    // +-+-+-+-+-+


    Backend.topic = function(){
      var q = $q.defer();
      q.resolve(Topic[$stateParams.topic]())
      return q.promise;
    };
    

    Backend.compositeSearch  = function(searchText){

      //Create a url by joining elements of an array (so they need to be in order!)
      var geocodeServiceUrl = [
          serverProperties.baseServicesUrl, 
          serverProperties.geocodeServiceName, 
          'GeocodeServer', 
          'findAddressCandidates'
        ].join('/');

      //define query parameters
      var params = {
        'SingleLine' : searchText,
        'outFields' : 'Match_addr, User_fld, Loc_name',
        'f' : 'json'

      };

      //use $q promises to handle the http request asynchronously
      var q = $q.defer();
      //make http request
      $http({method : 'GET', url : geocodeServiceUrl, params : params, cache : true})
        //callbacks
        .success(function(data, status, headers, config){
          if(data.error){
            console.log(data.error.code + ' Backend.geocodeService.findAddressCanidates ' + data.error.message);
          }else{
            q.resolve(formatEsriCompositeGeocoderResults(searchText, data));
          }
        })
        .error(function(error){
          console.log('Error gecoding ' + searchText);
          console.log(error);
        });

      //return the promise using q
      return q.promise;
    };


    //****Return the factory object****//
    return Backend; 

    
}]); //END Backend factory function