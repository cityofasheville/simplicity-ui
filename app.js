'use strict';

//instatiate an AngularJS module and inject an dependancy modules
var app = angular.module('simplicity', ['ui.router', 'ngAnimate']);
 
//Configure application states and routes
app.config(function ($stateProvider, $urlRouterProvider, $httpProvider) {
    //Needed to set this header to get gulp browser sync to work
    //$httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

    
    $urlRouterProvider.when('/topics', '/topics/list');
    $urlRouterProvider.when('/search', '/search/composite');
    $urlRouterProvider.when('', '/search/composite');
    $urlRouterProvider.when('/', '/search/composite');
    $urlRouterProvider.when('/a-zA-Z0-9/', '');
    $urlRouterProvider.otherwise('/search');

    //define states
    $stateProvider
      //Main application controls search and location filter
      .state('main', {
        url: '',
        templateUrl: 'main/main.html',
        controller: 'MainCtrl'
      })
      .state('main.search', {
        url: '/search',
        abstract: true,
        template: '<div ui-view></div>'
      })
        //!! should this be topic instead of composite
        .state('main.search.composite', {
          url: '/:composite',
          templateUrl: 'search/composite.search.html',
          controller: 'SearchCtrl'
        })
      .state('main.topics', {
        url: '/topics',
        abstract: true,
        template: "<div ui-view></div>"
      })
        .state('main.topics.list', {
          url: '/list?searchtext&searchby&id',
          templateUrl: 'topics/topics.list.html',
          controller : 'TopicsCtrl'
        })
        .state('main.topics.topic', {
          url: '/:topic?searchtext&searchby&id&view&timeframe&extent&type',
          templateUrl: 'topic/topic.html',
          controller: 'TopicCtrl'
        });
  });//END config

//template is defined inline in app.config.js
app.controller('AppCtrl', ['$scope', '$location', function ($scope, $location) {
	
	$scope.$on('$stateChangeSuccess', function (event, toState) {
        if (toState.name === 'main') {
        	
            $scope.back = true; 
        } else {
            $scope.back = false; 
        }
    });	
}]);
app.factory('Backend', ['$http', '$location', '$q', '$filter', '$stateParams',
  function($http, $location, $q, $filter, $stateParams){



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
    var options = {
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
      ],
      'type' : {}
    };

    var timeframeLookup = {
      'last-30-days' : d.setMonth(d.getMonth() - 1),
      'last-6-months' : d.setMonth(d.getMonth() - 6),
      'last-year' : d.setFullYear(d.getFullYear()-1),
      'last-5-years': d.setFullYear(d.getFullYear()-5),
      'last-10-years': d.setFullYear(d.getFullYear()-10),
      'all-time' : d.setFullYear(d.getFullYear()-100)
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

    //On the dataCacheProperties object, this function either creates a parent property 
    //if none exist and then assign a property with a value to the parent property
    //Or just assigns a property with a value to the parent property on the dataCacheProperties object
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

    //

    var addGeoJsonForSearchToDataCacheFromEsriJson = function(esriJson){
      var features = [];
          for (var i = 0; i < esriJson.features.length; i++) {
            features.push(L.esri.Util.arcgisToGeojson(esriJson.features[i], 'id'));
          }
          var geojson = {
            type: 'FeatureCollection',
            features: features
          };
          dataCacheProperties.searchGeojson = geojson;
    };

    var addGeoJsonForSearchToDataCache = function(idArray){
      //use $q promises to handle the http request asynchronously
      var q = $q.defer();
      if($stateParams.searchby === 'address'){
        //build query params for the request with a where clause
        var addressQueryParams = {
          'where' : 'civicaddress_id in (' + idArray.join() + ')',
          'f' : 'json',
          'outFields' : '*'
        };
        queryBackend(featureService.address, addressQueryParams)
        //callback when request is complete
        .then(function(addressResults){
          addGeoJsonForSearchToDataCacheFromEsriJson(addressResults);
          q.resolve();
        });
      }else if($stateParams.searchby === "street_name"){
        //build query params for the request with a where clause
       var streetQueryParams = {
          'where' : "centerline_id in (" + idArray.join() + ")", 
          'f' : 'json',
          'outFields' : '*'
        };
        queryBackend(featureService.street, streetQueryParams)
        //callback when request is complete
        .then(function(streetResults){
          addGeoJsonForSearchToDataCacheFromEsriJson(streetResults);
          q.resolve();
        });
      }else if($stateParams.searchby === "neighborhood"){
        //build query params for the request with a where clause
       var neighborhoodQueryParams = {
          'where' : "name in ('" + idArray.join() + "')", 
          'f' : 'json',
          'outFields' : '*'
        };
        queryBackend(featureService.neighborhood, neighborhoodQueryParams)
        //callback when request is complete
        .then(function(neighborhoodResults){
          addGeoJsonForSearchToDataCacheFromEsriJson(neighborhoodResults);
          q.resolve();
        });
      }else if($stateParams.searchby === "pinnum"){
        //build query params for the request with a where clause
        q.resolve();
      }
        
        
      return q.promise;
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
         
          q.resolve(dataCacheProperties);
        });
      return q.promise;
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

      return searchGroups;
    };//END formatEsriCompositeGeocoderResults function



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
      if($stateParams.searchby === 'address'){
        
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
              property.features[0].attributes.zoning = dataCacheProperties.zoning;
              property.features[0].attributes.zoningOverlays = dataCacheProperties.zoningOverlays;
              if(codelinks[dataCacheProperties.zoning] === undefined){
                property.features[0].attributes.codelink = 'disable';
              }else{
                property.features[0].attributes.codelink = codelinks[dataCacheProperties.zoning];
              }
              
              var idField = property.fields[0].name;
              var feature = L.esri.Util.arcgisToGeojson(property.features[0], idField);
              var geojson = {
                type: 'FeatureCollection',
                features: [feature]
              };
              q.resolve(geojson);
            });
        });
      }else if ($stateParams.searchby === 'pinnum'){
        var pinParams = {
          'where' : "pinnum='" + $stateParams.id + "'",
          'f' : 'json',
          'outFields' : '*'
        };
        queryBackend(featureService.property, pinParams)
          .then(function(property){
            property.features[0].attributes.zoning = dataCacheProperties.zoning;
            property.features[0].attributes.zoningOverlays = dataCacheProperties.zoningOverlays;
            if(codelinks[dataCacheProperties.zoning] === undefined){
              property.features[0].attributes.codelink = 'disable';
            }else{
              property.features[0].attributes.codelink = codelinks[dataCacheProperties.zoning];
            }
            
            var idField = property.fields[0].name;
            var feature = L.esri.Util.arcgisToGeojson(property.features[0], idField);
            var geojson = {
              type: 'FeatureCollection',
              features: [feature]
            };
            q.resolve(geojson);
          });
      }
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
      
        if(crimes.features[i].attributes.thedate >= timeframeLookup[$stateParams.timeframe]){
          //set color by offense
          crimes.features[i].attributes.color = colors.crime[crimes.features[i].attributes.offense]; 
          //build a summary object
          if(filteredFeaturesSummary.table[crimes.features[i].attributes.offense] === undefined){

            filteredFeaturesSummary.table[crimes.features[i].attributes.offense] = {'color' : colors.crime[crimes.features[i].attributes.offense], 'count' : 1 };

          }else{
            filteredFeaturesSummary.table[crimes.features[i].attributes.offense].count = filteredFeaturesSummary.table[crimes.features[i].attributes.offense].count + 1;
          }
          filterdFeaturesArray.push(L.esri.Util.arcgisToGeojson(crimes.features[i], 'id'));
          
        }
      }

      //Update filter options based on filter summary
      var filterOptions = [];
      filterOptions.push({'value' : 'all', 'label' : 'All'});
      for (var key in filteredFeaturesSummary.table) {
        filterOptions.push({'value' : key.toLowerCase().replace(/ /g, '-'), 'label' : key});
      }
      options.type = filterOptions;
      var geojson = {
        'type' : 'FeatureCollection',
        'summary' : filteredFeaturesSummary,
        'searchGeojson' : dataCacheProperties.searchGeojson,
        'features' : filterdFeaturesArray
      };

      return geojson;

    };//END formatCrimeData
    
    Topic.crime = function(){
      var q = $q.defer();

      if(!dataCacheProperties.crimes){
        //!!!throw an error
      }

      //Crime 'pids' should be accessible through the dataCacheProperties object for addresses
      if($stateParams.searchby === 'address'){
        //we only want the crimes for extent specified as a $stateParams
        //use $stateParams.extent
        //!!! We should probably filter by date in the where clause; Need to format the date for ESRI, can't use a timestamp
        var addressQueryParams = {
          'where' : 'pid in (' + dataCacheProperties.crime[Number($stateParams.extent)] + ')',
          'f' : 'json',
          'outFields' : '*'
        };
        queryBackend(featureService.crime, addressQueryParams)
          .then(function(crimes){
            q.resolve(formatCrimeData(crimes));
          });


      //Crime 'pids' should be accessible through the dataCacheProperties object streets but we want to hardcode the extent
      //to limit searches to smallest extent
      }else if($stateParams.searchby === 'street_name'){
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
          'where' : "neighborhood='" + $stateParams.id + "'",
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
        if(development.features[i].attributes.date_opened >= Number(timeframeLookup[$stateParams.timeframe])){
          //set color by record_type
          development.features[i].attributes.color = colors.development[development.features[i].attributes.record_type];          
          //build a summary object
          if(filteredFeaturesSummary.table[development.features[i].attributes.record_type] === undefined){

            filteredFeaturesSummary.table[development.features[i].attributes.record_type] = {'color' : colors.development[development.features[i].attributes.record_type], 'count' : 1 };

          }else{
            filteredFeaturesSummary.table[development.features[i].attributes.record_type].count = filteredFeaturesSummary.table[development.features[i].attributes.record_type].count + 1;
          }
          //add filtered features to array
          if($stateParams.type === 'null' || $stateParams.type === null || $stateParams.type === development.features[i].attributes.record_type.toLowerCase().replace(/ /g, '-')){
            if(development.features[i].attributes.record_comments){
                development.features[i].attributes.commentsArray = development.features[i].attributes.record_comments.split('[NEXTCOMMENT]');
              }
            filterdFeaturesArray.push(L.esri.Util.arcgisToGeojson(development.features[i], 'id'));
          }
          
        }
      }

      //Update filter options based on filter summary
      var filterOptions = [];
      filterOptions.push({'value' : 'all', 'label' : 'All'});
      for (var key in filteredFeaturesSummary.table) {
        filterOptions.push({'value' : key.toLowerCase().replace(/ /g, '-'), 'label' : key});
      }

      options.type = filterOptions;
      var geojson = {
        'type' : 'FeatureCollection',
        'summary' : filteredFeaturesSummary,
        'searchGeojson' : dataCacheProperties.searchGeojson,
        'features' : filterdFeaturesArray
      };
      return geojson;

    };//END formatDevelopmentData
    
    Topic.development = function(){
      var q = $q.defer();

      if(!dataCacheProperties.development){
        //!!!throw an error
      }
      var stringOfDevelopmentIds = '';
      //Crime 'pids' should be accessible through the dataCacheProperties object for addresses
      if($stateParams.searchby === 'address'){
        //we only want the development for extent specified as a $stateParams
        //use $stateParams.extent
        //!!!We should probably filter by date in the where clause; Need to format the date for ESRI, can't use a timestamp
        stringOfDevelopmentIds = '';
        for (var i = 0; i < dataCacheProperties.development[$stateParams.extent].length; i++) {
          if(i === 0){
            stringOfDevelopmentIds = stringOfDevelopmentIds + "'" + dataCacheProperties.development[$stateParams.extent][i] + "'";
          }else{
            stringOfDevelopmentIds = stringOfDevelopmentIds + ",'" + dataCacheProperties.development[$stateParams.extent][i] + "'";
          }         
        }

        var addressQueryParams = {
          'where' : "apn in (" + stringOfDevelopmentIds + ") and record_module = 'Planning' and record_type_type = 'Development'",
          'f' : 'json',
          'outFields' : '*'
        };
        queryBackend(featureService.permit, addressQueryParams)
          .then(function(development){
            q.resolve(formatDevelopmentData(development));
          });


      //Crime 'pids' should be accessible through the dataCacheProperties object streets but we want to hardcode the extent
      //to limit searches to smallest extent
      }else if($stateParams.searchby === 'street_name'){
        //we only want the smallest extent for each address next to the street
        //!!!We should probably filter by date in the where clause; Need to format the date for ESRI, can't use a timestamp
        stringOfDevelopmentIds = '';
        for (var sid = 0; sid < dataCacheProperties.development[82.5].length; sid++) {
          if(sid === 0){
            stringOfDevelopmentIds = stringOfDevelopmentIds + "'" + dataCacheProperties.development[$stateParams.extent][sid] + "'";
          }else{
            stringOfDevelopmentIds = stringOfDevelopmentIds + ",'" + dataCacheProperties.development[$stateParams.extent][sid] + "'";
          }         
        }
        var streetQueryParams = {
          'where' : "apn in (" + stringOfDevelopmentIds + ") and record_module = 'Planning' and record_type_type = 'Development'", 
          'f' : 'json',
          'outFields' : '*'
        };
        queryBackend(featureService.permit, streetQueryParams)
          .then(function(development){
            q.resolve(formatDevelopmentData(development));
          });


      //For neighborhoods, lookup the development directly from the development table using the neighborhood name
      }else if($stateParams.searchby === 'neighborhood'){
        var neighborhoodQueryParams = {
          'where' : "neighborhood= '" + $stateParams.id + "' and record_module = 'Planning' and record_type_type = 'Development'",
          'f' : 'json',
          'outFields' : '*'
        };
        queryBackend(featureService.permit, neighborhoodQueryParams)
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
      var trash = {
        'trash' : dataCacheProperties.trash,
        'searchGeojson' : dataCacheProperties.searchGeojson
      };
      q.resolve(trash);
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
      var recycling = {
        'recyclingDay' : dataCacheProperties.recycling,
        'searchGeojson' : dataCacheProperties.searchGeojson
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




    // +-+-+-+-+ +-+-+-+ +-+-+-+-+-+ +-+-+-+-+-+-+-+-+-+-+
    // |l|e|a|f| |a|n|d| |b|r|u|s|h| |c|o|l|l|e|c|t|i|o|n|
    // +-+-+-+-+ +-+-+-+ +-+-+-+-+-+ +-+-+-+-+-+-+-+-+-+-+

    Topic.leafAndBrushCollection = function(){
      // var q = $q.defer();
      // var trashDay = trash();
      // var recyclingSchedule = recycling();
      // if(trashDay === 'MONDAY' || trashDay === 'TUESDAY'){
      //   if(recyclingSchedule.week === 'B' && recyclingSchedule.when === 'this week'){
      //     q.resolve({'when' : 'this week'});
      //   }else{
      //     q.resolve({'when' : 'next week'});
      //   }
      // }else{
      //   if(recyclingSchedule.week === 'A' && recyclingSchedule.when === 'this week'){
      //     q.resolve({'when' : 'this week'});
      //   }else{
      //     q.resolve({'when' : 'next week'});
      //   }
      // }
      // return q.promise;
    };




    // +-+-+-+-+-+-+
    // |z|o|n|i|n|g|
    // +-+-+-+-+-+-+

    Topic.zoning = function(){
      // var q = $q.defer();
      // if(featureService.zoningOverlays){
      //   var zoningOverlaysSplit = featureService.zoningOverlays.split('-');
      //   var queryParams = {
      //     'where' : "name='" + zoningOverlaysSplit[0] + "'",
      //     'f' : 'json',
      //     'outFields' : '*'
      //   };
      //   queryBackend(zoningOverlay, queryParams)
      //         .then(function(zoningOverlayLayer){
      //           var zoningProperties = {
      //             'zoning' : featureService.zoning,
      //             'codelink' : codelinks[featureService.zoning],
      //             'zoningOverlays' : zoningOverlayLayer.features[0]
      //           };
      //           q.resolve(zoningProperties);
      //         });
      // }else{

      //   var zoningProperties = {
      //     'zoning' : featureService.zoning,
      //     'codelink' : codelinks[featureService.zoning],
      //     'zoningOverlays' : 'disable'
      //   };
      //   q.resolve(zoningProperties);
      // }
      
      // return q.promise;
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
    Backend.dataCache = function(){
      var q = $q.defer();
      var queryParams = {};
      var id = $stateParams.id;
      var splitId = id.split(',');
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
        var streetQueryParams = {
          'where' : "centerline_id in (" + idArray.join() + ")", 
          'f' : 'json',
          'outFields' : 'civicaddress_id'
        };
        queryBackend(featureService.xref, streetQueryParams)
          .then(function(xrefResults){
            var civicaddressIdArray = [];
            for (var i = 0; i < xrefResults.features.length; i++) {
              civicaddressIdArray.push(xrefResults.features[i].attributes.civicaddress_id);
            }
            addGeoJsonForSearchToDataCache(idArray)
              .then(function(){
                q.resolve(queryDataCacheWithAnArrayOfIds(civicaddressIdArray));
              });
          });
          
        
      }else if($stateParams.searchby === 'neighborhood'){
        addGeoJsonForSearchToDataCache([$stateParams.id])
          .then(function(){
            q.resolve();
          });
      }else if($stateParams.searchby === 'pinnum'){
        var pinQueryParams = {
          'where' : "pinnum = '" + $stateParams.id + "'", 
          'f' : 'json',
          'outFields' : 'civicaddress_id'
        };
        queryBackend(featureService.xref, pinQueryParams)
          .then(function(pinXrefResults){
            var civicaddressIdArray = [];
            for (var i = 0; i < pinXrefResults.features.length; i++) {
              civicaddressIdArray.push(pinXrefResults.features[i].attributes.civicaddress_id);
            }
            addGeoJsonForSearchToDataCache(idArray)
              .then(function(){
                q.resolve(queryDataCacheWithASingleId(civicaddressIdArray[0]));
              });

            
          });
        //q.resolve();
        }
        
      

      return q.promise;
    };

    var searchLabel = "";

    // +-+-+-+-+-+
    // |t|o|p|i|c|
    // +-+-+-+-+-+


    Backend.topic = function(){
      var q = $q.defer();
      q.resolve(Topic[$stateParams.topic]());
      return q.promise;
    };

    Backend.options = function(param){
      return options[param];
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
app.controller('MainCtrl', ['$scope', '$state', '$stateParams', '$location', '$http', '$timeout',
  function ($scope, $state, $stateParams, $location, $http, $timeout) {


    $scope.goHome = function(){
    	$location.path('');
    };



}]);
app.controller('SearchCtrl', ['$scope', '$stateParams', '$state', '$timeout', 'Backend',
 function ($scope, $stateParams, $state, $timeout, Backend) {
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


    $scope.searchText = '';

    $scope.errorMessage = {
        show : false,
        message : 'We had trouble locating that location. Please try to enter a location again.'
    };
    $scope.helperMessage = {
        show : false,
        message : 'Please choose one of the options below.'
    };



    //Geocodes the search results     
    $scope.doSearch = function(searchText, event){
        var offset = $('#inputSearch').offset().top - 20;
        $("html, body").animate({'scrollTop' : offset + "px"});
        //we don't want to start search until the user has input 3 characters
        if(searchText.length < 3){
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
        Backend.compositeSearch(searchText)
            .then(function(searchResults){
                $scope.searchGroups = searchResults; 
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
        if(candidate.type === 'civicaddressid'){
            candidate.type = "address";
        }

        $state.go('main.topics.list', {'searchtext' : candidate.label, 'searchby' : candidate.type, 'id' : candidate.id});
    };




}]);
app.controller('TopicCtrl', ['$scope', '$stateParams', '$state', '$filter', 'Topics', 'Topic', 'Backend',
 function ($scope, $stateParams, $state, $filter, Topics, Topic, Backend) {

    //****Private variables and methods*****//

    $(function () {
      $('[data-toggle="tooltip"]').tooltip();
    });

    //!!! This is breaking the back button :-(
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

    //if view is not defined or if view is not allowed, use default
    if($stateParams.view === null){
      updateStateParamsAndReloadState('view', $scope.topicProperties.defaultView);
    }else if($stateParams.view === 'details' && $scope.topicProperties.detailsViewTemplate === null){
      updateStateParamsAndReloadState('view', $scope.topicProperties.defaultView);
    }else if($stateParams.view === 'list' && $scope.topicProperties.listViewTemplate === null){
      updateStateParamsAndReloadState('view', $scope.topicProperties.defaultView);
    }else if($stateParams.view === 'table' && $scope.topicProperties.tableViewTemplate === null){
      updateStateParamsAndReloadState('view', $scope.topicProperties.defaultView);
    }else if($stateParams.view === 'table' && $stateParams.type !== null){
      updateStateParamsAndReloadState('type', null);
    }else{
      //The view is defined and allowed
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
    $scope.timeframeOptions = Backend.options('timeframe');
    //define a default select option
    $scope.timeframeOptionIndex = 0;
    //find the option that matches the current timeframe defiend in the $stateParams
    for (var tf = 0; tf < $scope.timeframeOptions.length; tf++) {
      if($scope.timeframeOptions[tf].value === $stateParams.timeframe){
        $scope.timeframeOptionIndex = tf;
      } 
    }

     $scope.onChangeTimeframeValue = function(timeframeValue){
      updateStateParamsAndReloadState('timeframe', timeframeValue.value);
    };

    // +-+-+-+-+-+-+
    // |e|x|t|e|n|t|
    // +-+-+-+-+-+-+

    //if extent is not defined is supposed to be, use default
    if($stateParams.extent === null && $scope.topicProperties.searchby[$stateParams.searchby].params.extent !== null){
      updateStateParamsAndReloadState('extent', $scope.topicProperties.searchby[$stateParams.searchby].params.extent);
    }

    //get the select options for changing the timeframe
    $scope.extentOptions = Backend.options('extent');
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

     var openstreetmap = L.tileLayer("http://a.tile.openstreetmap.org/{z}/{x}/{y}.png",{
        attribution:'&copy; <a href="http://osm.org/copyright" title="OpenStreetMap" target="_blank">OpenStreetMap</a> contributors',
        maxZoom : 22
    });

    var esriImagery = L.esri.basemapLayer("Imagery");


    var baseMaps = {
      "Open Street Map" : openstreetmap,
      "ESRI Imagery" : esriImagery
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
      var leafletGeoJsonLayer = L.geoJson(data, {
        pointToLayer: function(feature, latlng){
          if(feature.geometry.type === "Point"){
            return L.circleMarker(latlng, {
              radius: 6,
              fillColor: "#"+feature.properties.color,
              color: "#"+feature.properties.color,
              weight: 1,
              opacity: 1,
              fillOpacity: 0.8
            }); 
          }else{
            return false;
          }
        },
        style: function (feature) {
          if(style){
            return style;
          }
        },
        onEachFeature: function (feature, layer) {
          layer.on('click', function(){
              if(feature.geometry.type === "Point"){
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
                

                
              }     
          });
        }
      });
      leafletGeoJsonLayer.addTo(map);
      map.fitBounds(leafletGeoJsonLayer);
        if(map.getZoom() > 18){
          map.setZoom(18);
        }
    };

    var addSearchGeoJsonToMap = function(data, style){
      return L.geoJson(data, {
        style: function (feature) {
          if(style){
            return style;
          }
        },
        onEachFeature: function (feature, layer) {
          if(feature.geometry.type === 'Point'){
            var radiusInMeters = $stateParams.extent*0.3048;
            var circle = L.circle([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], radiusInMeters, {
              'fillOpacity' : 0,
              'opacity' : 0.3
            });
            circle.addTo(map);
              layer.on('click', function(){
                  
              });
          }
          
        }
      });
    };



    $scope.loading = true;
    //!!! Check if dataCache is already defined

    Backend.dataCache()
      .then(function(data){
        Backend.topic()
          .then(function(topic){
            $scope.topic = topic;
            $scope.loading = false;
            if(topic.searchGeojson){
              addSearchGeoJsonToMap(topic.searchGeojson, {'fillOpacity' : 0,'opacity' : 0.3}).addTo(map);
            }
            if(topic.features){
              if($stateParams.type !== null || $stateParams.type !== 'null'){
                var filteredTopic = $filter('filter')(topic.features, $stateParams.type, true);
                addGeoJsonToMap(filteredTopic);
              }else{
                addGeoJsonToMap(topic);
              }             
            }         
          });
      });

    $scope.goToTopics = function(){
      $state.go('main.topics.list', {'searchtext' : $stateParams.searchtext, 'searchby' : $stateParams.searchby, 'id' : $stateParams.id});
    };

    $scope.filterBy = function(type){
      if($stateParams.view === 'table'){
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
app.factory('Topic', ['$stateParams', function($stateParams){

    //****Create the factory object****//
    var Topic = {};

    //****Private variables*****//




    //Options for the topic's select elements
    //The labels are displayed as the select element options
    //The values are the values of the select element options
    //The values should match any url params
    var options = {
      'extent' : [
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
    };

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

    //****API*****//

    

    Topic.options = function(param){
      return options[param];
    };

    Topic.getFilterValueFromOption = function(param, option){
      return filterValues[param][option];
    };


    //****Return the factory object****//
    return Topic; 

    
}]); //END Topic factory function
app.controller('TopicsCtrl', ['$scope', '$stateParams', '$state', 'Topics',
 function ($scope, $stateParams, $state, Topics) {
    $("html, body").animate({'scrollTop' : "0px"});
    $scope.$on('$stateChangeSuccess', function (event, toState) {
        if (toState.name === 'main.topics') {           
            $scope.back = true; 
        } else {
            $scope.back = false; 
        }
    });

    //you can't have more tha
    $scope.heading = 'What are you looking for...';
    if($stateParams.searchby === 'address'){
      $scope.heading =  'What are you looking for at ';
    }else if($stateParams.searchby === 'street_name'){
      $scope.heading = 'What are you looking for on ';
    }else if($stateParams.searchby === 'neighborhood'){
      $scope.heading = 'What are you looking for in ';
    }else if($stateParams.searchby === 'pinnum'){
      $scope.heading = 'What are you looking for with the PIN ';
    }

    $scope.searchText = $stateParams.searchtext + '?';

    $scope.topics = Topics.getTopics($stateParams);
    



}]);
app.factory('Topics', ['$stateParams', function($stateParams){

    //****Create the factory object****//
    var Topics = {};

    //****Private variables*****//
    var d = new Date();

    var topicsArray = [
        //                                  _         
        //  _ __  _ __ ___  _ __   ___ _ __| |_ _   _ 
        // | '_ \| '__/ _ \| '_ \ / _ \ '__| __| | | |
        // | |_) | | | (_) | |_) |  __/ |  | |_| |_| |
        // | .__/|_|  \___/| .__/ \___|_|   \__|\__, |
        // |_|             |_|                  |___/ 
         {
            'name' : 'property',
            'title' : 'Property',
            'position' : 1,
            'searchby' : {
                'address' : {
                    'params' : {
                        'type' : null,
                        'timeframe' : null,
                        'extent' : null,
                        'view' : 'details'
                    },
                    'headerTemplate' : 'topic/topic-headers/topic.header.at.html',
                },
                'pinnum' : {
                    'params' : {
                        'type' : null,
                        'timeframe' : null,
                        'extent' : null,
                        'view' : 'details'
                    },
                    'headerTemplate' : 'topic/topic-headers/topic.header.at.html',
                }
            },
            'simpleViewTemplate' : null,
            'detailsViewTemplate' : 'topic/topic-views/property.view.html',
            'tableViewTemplate' : null,
            'listViewTemplate' : null,
            'defaultView' : 'details',
            'iconClass' : 'flaticon-real10',
            'linkTopics' : ['crime', 'trash', 'recycling']
        },
        //            _                     
        //   ___ _ __(_)_ __ ___   ___ 
        //  / __| '__| | '_ ` _ \ / _ \
        // | (__| |  | | | | | | |  __/
        //  \___|_|  |_|_| |_| |_|\___|                  
        {
            'name' : 'crime',
            'title' : 'Crime',
            'position' : 2,
            'searchby' : {
                'address' : {
                    'params' : {
                        'type' : null,
                        'timeframe' : 'last-year',
                        'extent' : 660,
                        'view' : 'table'
                    },
                    'requiredParams' : ['timeframe', 'extent'],
                    'headerTemplate' : 'topic/topic-headers/topic.header.during.within.of.html',
                },
                'street_name' : {
                    'params' : {
                        'type' : null,
                        'timeframe' : 'last-year',
                        'extent' : 82.5,
                        'view' : 'table'
                    },
                    'requiredParams' : ['timeframe'],
                    'headerTemplate' : 'topic/topic-headers/topic.header.during.along.html',
                },
                'neighborhood' : {
                    'params' : {
                        'type' : null,
                        'timeframe' : 'last-year',
                        'extent' : null,
                        'view' : 'table'
                    },
                    'requiredParams' : ['timeframe'],
                    'headerTemplate' : 'topic/topic-headers/topic.header.during.in.html',
                }
            },
            'simpleViewTemplate' : null,
            'detailsViewTemplate' : null,
            'tableViewTemplate' : 'topic/topic-views/table.view.html',
            'listViewTemplate' : 'topic/topic-views/crime.view.html',
            'defaultView' : 'table',
            'iconClass' : 'flaticon-police19',
            'linkTopics' : ['property', 'trash', 'recycling', 'development']
        },
        //      _                _                                  _   
        //   __| | _____   _____| | ___  _ __  _ __ ___   ___ _ __ | |_ 
        //  / _` |/ _ \ \ / / _ \ |/ _ \| '_ \| '_ ` _ \ / _ \ '_ \| __|
        // | (_| |  __/\ V /  __/ | (_) | |_) | | | | | |  __/ | | | |_ 
        //  \__,_|\___| \_/ \___|_|\___/| .__/|_| |_| |_|\___|_| |_|\__|
        //                              |_|                             
        {
            'name' : 'development',
            'title' : 'Development',
            'position' : 3, 
            'searchby' : {
                'address' : {
                    'params' : {
                        'type' : null,
                        'timeframe' : 'last-year',
                        'extent' : 660,
                        'view' : 'table'
                    },
                    'requiredParams' : ['timeframe', 'extent'],
                    'headerTemplate' : 'topic/topic-headers/topic.header.during.within.of.html',
                },
                'street_name' : {
                    'params' : {
                        'type' : null,
                        'timeframe' : 'last-year',
                        'extent' : 82.5,
                        'view' : 'table'
                    },
                    'requiredParams' : ['timeframe'],
                    'headerTemplate' : 'topic/topic-headers/topic.header.during.along.html',
                },
                'neighborhood' : {
                    'params' : {
                        'type' : null,
                        'timeframe' : 'last-year',
                        'extent' : null,
                        'view' : 'table'
                    },
                    'requiredParams' : ['timeframe'],
                    'headerTemplate' : 'topic/topic-headers/topic.header.during.in.html',
                }
            },
            'simpleViewTemplate' : null,
            'detailsViewTemplate' : null,
            'tableViewTemplate' : 'topic/topic-views/table.view.html',
            'listViewTemplate' : 'topic/topic-views/development.view.html',
            'defaultView' : 'table',
            'iconClass' : 'flaticon-building33',
            'linkTopics' : ['property', 'trash', 'recycling', 'crime']
        },
        //  _                 _     
        // | |_ _ __ __ _ ___| |__  
        // | __| '__/ _` / __| '_ \ 
        // | |_| | | (_| \__ \ | | |
        //  \__|_|  \__,_|___/_| |_|
        {
            'name' : 'trash',
            'title' : 'Trash Collection',
            'position' : 4,
            'searchby' : {
                'address' : {
                    'params' : {
                        'type' : null,
                        'timeframe' : null,
                        'extent' : null,
                        'view' : 'simple'
                    },
                    'requiredParams' : [],
                    'headerTemplate' : 'topic/topic-headers/topic.header.at.html',
                }
            },
            'simpleViewTemplate' : 'topic/topic-views/trash-collection.view.html',
            'detailsViewTemplate' : null,
            'tableViewTemplate' : null,
            'listViewTemplate' : null,
            'defaultView' : 'simple',
            'iconClass' : 'flaticon-garbage5',
            'linkTopics' : ['recycling', 'property']
        },
        //                           _ _             
        //  _ __ ___  ___ _   _  ___| (_)_ __   __ _ 
        // | '__/ _ \/ __| | | |/ __| | | '_ \ / _` |
        // | | |  __/ (__| |_| | (__| | | | | | (_| |
        // |_|  \___|\___|\__, |\___|_|_|_| |_|\__, |
        //                |___/                |___/ 
        {
            'name' : 'recycling',
            'title' : 'Recycling Collection',
            'position' : 5,
            'searchby' : {
                'address' : {
                    'params' : {
                        'type' : null,
                        'timeframe' : null,
                        'extent' : null,
                        'view' : 'simple'
                    },
                    'requiredParams' : [],
                    'headerTemplate' : 'topic/topic-headers/topic.header.at.html',
                }
            },
            'simpleViewTemplate' : 'topic/topic-views/recycling-collection.view.html',
            'detailsViewTemplate' : null,
            'tableViewTemplate' : null,
            'listViewTemplate' : null,
            'defaultView' : 'simple',
            'iconClass' : 'flaticon-trash42',
            'linkTopics' : ['trash', 'property']
        },
        //                 _             
        //  _______  _ __ (_)_ __   __ _ 
        // |_  / _ \| '_ \| | '_ \ / _` |
        //  / / (_) | | | | | | | | (_| |
        // /___\___/|_| |_|_|_| |_|\__, |
        //                         |___/ 
        // {
        //     'name' : 'zoning',
        //     'title' : 'Zoning',
        //     'position' : 6,
        //     'searchby' : {
        //         'address' : {
        //             'params' : {},
        //             'requiredParams' : [],
        //             'headerTemplate' : 'topic/topic-headers/topic.header.at.html',
        //         }
        //     },
        //     'viewTemplate' : 'topic/topic-views/zoning.view.html',
        //     'views' : ['details'],
        //     'iconClass' : 'flaticon-map104'
        // },
        //      _                 _                     _       _                                 
        //  ___| |_ _ __ ___  ___| |_   _ __ ___   __ _(_)_ __ | |_ ___ _ __   ___ _ __   ___ ___ 
        // / __| __| '__/ _ \/ _ \ __| | '_ ` _ \ / _` | | '_ \| __/ _ \ '_ \ / _ \ '_ \ / __/ _ \
        // \__ \ |_| | |  __/  __/ |_  | | | | | | (_| | | | | | ||  __/ | | |  __/ | | | (_|  __/
        // |___/\__|_|  \___|\___|\__| |_| |_| |_|\__,_|_|_| |_|\__\___|_| |_|\___|_| |_|\___\___|                                                                           
        // {
        //     'name' : 'street-maintenance',
        //     'title' : 'Street Mainenance',
        //     'position' : 7,
        //     'searchby' : {
        //         'address' : {
        //             'params' : {},
        //             'requiredParams' : [],
        //             'headerTemplate' : 'topic/topic-headers/topic.header.during.within.of.html',
        //         },
        //         'street_name' : {
        //             'params' : {},
        //             'requiredParams' : [],
        //             'headerTemplate' : 'topic/topic-headers/topic.header.during.along.html',
        //         }
        //     },
        //     'viewTemplate' : 'topic/cards/street-maintenance.card.html',
        //     'views' : ['details', 'map'],
        //     'iconClass' : 'flaticon-location38'
        // },
        //            _     _                     _ _     _       
        //   __ _  __| | __| |_ __ ___  ___ ___  | (_)___| |_ ___ 
        //  / _` |/ _` |/ _` | '__/ _ \/ __/ __| | | / __| __/ __|
        // | (_| | (_| | (_| | | |  __/\__ \__ \ | | \__ \ |_\__ \
        //  \__,_|\__,_|\__,_|_|  \___||___/___/ |_|_|___/\__|___/                                                   
        // {
        //     'name' : 'address-lists',
        //     'title' : 'Address Lists',
        //     'position' : 8,
        //     'searchby' : {
        //         'street_name' : {
        //             'params' : {},
        //             'requiredParams' : [],
        //             'headerTemplate' : 'topic/topic-headers/topic.header.during.along.html',
        //         },
        //         'neighborhood' : {
        //             'params' : {},
        //             'requiredParams' : [],
        //             'headerTemplate' : 'topic/topic-headers/topic.header.during.in.html',
        //         }
        //     },
        //     'viewTemplate' : 'topic/cards/address-lists.card.html',
        //     'views' : ['details', 'map'],
        //     'defaultView' : 'card',
        //     'iconClass' : 'flaticon-address7'
        // }
    ];

    var questions = {
        'property' : {
            'topic' : 'Do you want to know about a property?',
            'address' : 'Do you want to know about the property at this address?',
            'pinnum' : 'Do you want to know about the property for this PIN?'
        },
        'crime' : {
            'topic' : 'Do you want to know about crime?',
            'address' : 'Do you want to know about crimes near this address?',
            'street_name' : 'Do you want to know about crimes along this street?',
            'neighborhood' : 'Do you want to know about crimes in this neighborhood?'
        },
        'development' : {
            'topic' : 'Do you want to know about development?',
            'address' : 'Do you want to know about development near this address?',
            'street_name' : 'Do you want to know about development along this street?',
            'neighborhood' : 'Do you want to know about development in this neighborhood?'
        },
        'trash' : {
            'topic' : 'Do you want to know when trash is collected?',
            'address' : 'Do you want to know when trash is collected at this address?'
        },
        'recycling' : {
            'topic' : 'Do you want to know when recycling is collected?',
            'address' : 'Do you want to know when recycling is collected at this address?'
        }
        // 'zoning' : {
        //     'topic' :  'Do you want to know about a zoning?', 
        //     'address' :  'Do you want to know about the zoning at this address?'
        // },
        // 'street-maintenance' : {
        //     'topic' :  'Do you want to know who is responsible for maintaining a street?',
        //     'address' :  'Do you want to know who is responsible for maintaining a street this address?',
        //     'street_name' : 'Do you want to know who is responsible for maintaining this street?'
        // },
        // 'address-lists' : {
        //     'topic' :  'Do you want a list of addresses?',
        //     'street_name' : 'Do you want a list of addresses along this street?',
        //     'neighborhood' :  'Do you want a list of addresses in this neighborhood?'
        // }
    };



    //****API*****//

    Topics.getTopics = function(){
        if($stateParams.id === null){
            var topicsToShowBeforeAnIdHasBeenSet = [];
            for (var i = 0; i < topicsArray.length; i++) {
                topicsToShowBeforeAnIdHasBeenSet.push(topicsArray[i]);
                console.log(topicsArray[i].name);
                topicsToShowBeforeAnIdHasBeenSet[i].question = questions[topicsArray[i].name].topic;
                topicsToShowBeforeAnIdHasBeenSet[i].linkTo = '#/search/' + topicsArray[i].name;
            }
            return topicsToShowBeforeAnIdHasBeenSet;
        }else{
            if($stateParams.searchby !== null){
                var topicsToShowAfterAnIdHasBeenSet = [];
                for (var j = 0; j < topicsArray.length; j++) {
                    if(topicsArray[j].searchby[$stateParams.searchby]){
                        if(questions[topicsArray[j].name][$stateParams.searchby] !== undefined){
                           topicsArray[j].question = questions[topicsArray[j].name][$stateParams.searchby]; 
                        }
                        var linkTo = '#/topics/' + topicsArray[j].name + '?searchtext=' + $stateParams.searchtext + '&searchby=' + $stateParams.searchby + '&id=' + $stateParams.id;
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
        for (var i = 0; i < topicsArray.length; i++) {
            if(topicsArray[i].name === topic){
                return topicsArray[i];
            }
        }
    };



    //****Return the factory object****//
    return Topics; 

    
}]); //END Topics factory function
(function(module) {
try {
  module = angular.module('simplicity');
} catch (e) {
  module = angular.module('simplicity', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('main/main.html',
    '<div class="col-lg-8 col-lg-offset-2 col-md-6 col-md-offset-3"><div class="col-xs-12"><div class="col-xs-6"><div class="pull-left" ng-click="goHome()" style="cursor : pointer"><h2 style="color : #073F97;" class="text-center">SimpliCity</h2><h5 class="text-center">city data simplified</h5></div></div><div class="col-xs-6" style="margin-top : 10px"><a href="http://www.ashevillenc.gov/" target="_blank"><img class="pull-right" style="height : 80px;" src="http://123graffitifree.com/images/citylogo-flatblue.png"></a></div></div><div ui-view=""></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('simplicity');
} catch (e) {
  module = angular.module('simplicity', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('search/composite.search.html',
    '<div style="min-height : 1000px"><div class="col-xs-12"><p class="text-muted text-center lead" style="margin-bottom : 0px; margin-top : 20px">Discover city data about places in your community.</p><p class="text-muted text-center lead">Search for an address, street, neighborhood, or property to get started!</p></div><div class="col-xs-12"><div class="input-group"><input id="inputSearch" groupindex="1" type="text" autocomplete="on" class="form-control" placeholder="Enter a location..." style="z-index: 0" ng-model="searchText" ng-focus="doSearch(searchText, $event)" ng-keyup="doSearch(searchText, $event)"> <span class="input-group-btn"><button class="btn btn-primary" type="button" style="box-shadow : none; font-size : 17px"><i class="fa fa-search"></i></button></span></div></div><div class="" ng-show="errorMessage.show || helperMessage.show || searchGroups.length > 0"><p ng-show="errorMessage.show" class="text-danger">{{errorMessage.message}}</p><p ng-show="helperMessage.show" class="text-success">{{helperMessage.message}}</p><div ng-repeat="group in searchGroups"><div class="col-xs-12" style="margin-top : 10px; margin-bottom : 10px"><h4 class="row text-muted"><span class="fa-stack fa-lg" ng-click="goBack()"><i class="fa fa-circle fa-stack-2x"></i> <i class="fa fa-stack-1x fa-inverse" ng-class="group.iconClass"></i></span> <strong>{{group.label}}</strong> <span class="badge" style="background : #999">{{group.results.length}}</span></h4><div class="list-group" ng-repeat="candidate in group.results | limitTo : group.offset"><a ng-click="goToTopics(candidate, $event)" ng-keypress="goToTopics(candidate, $event)" class="row list-group-item"><span class="col-xs-2 col-lg-1"><span class="fa-stack fa-lg text-primary"><i class="fa fa-circle fa-stack-2x"></i> <i class="fa fa-stack-1x fa-inverse" ng-class="group.iconClass"></i></span></span><p class="col-xs-8 col-lg-9 pull-left text-primary" style="margin-top : 8px">{{candidate.label}}</p><h4 class="col-xs-2 col-lg-2"><i class="fa fa-lg fa-chevron-right text-primary pull-right"></i></h4></a></div><div class="list-group" ng-if="group.results.length > 3"><a ng-click="group.offset = group.offset + 3" class="row list-group-item"><h4 class="col-xs-10 text-primary"><strong>More</strong></h4><h4 class="col-xs-2"><i class="fa fa-lg fa-chevron-down text-primary pull-right"></i></h4></a></div></div></div><p ng-show="errorMessage.show" class="text-danger">{{errorMessage.message}}</p></div></div>');
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
    '<div ui-view=""></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('simplicity');
} catch (e) {
  module = angular.module('simplicity', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('search/topic.search.html',
    '<div><div class="col-xs-12"><div class="col-xs-2" style="margin-top : 10px"><i class="fa fa-arrow-circle-left fa-3x" style="cursor : pointer; color : #073F97" ng-click="goBack()"></i></div><div class="col-xs-8"><h3 style="color : #073F97; margin-top : 0px" class="text-center">SimpliCity</h3><h5 class="text-center">city data simplified</h5></div><div class="col-xs-2" style="margin-top : 10px"><img class="pull-right" style="height : 45px;" src="http://123graffitifree.com/images/citylogo-flatblue.png"></div></div><div class="col-xs-12"><hr></div><br><div><h2 class="text-muted">So, you\'re looking for property details...</h2><br><h2 class="text-muted">For a single address?</h2><div class="input-group col-xs-12"><input id="addressSearch" tabindex="1" type="text" autocomplete="on" class="form-control" placeholder="Enter an address..." style="z-index: 0" ng-init="typedAddress = \'\'" ng-model="typedAddress" ng-focus="getAddressCandidates(typedAddress, $event)" ng-keyup="getAddressCandidates(typedAddress, $event)"> <span class="input-group-btn"><button class="btn btn-primary" type="button" style="box-shadow : none"><i class="fa fa-search"></i></button></span></div><h2 class="text-muted">For a PIN?</h2><div class="input-group col-xs-12"><input id="pinSearch" tabindex="1" type="text" autocomplete="on" class="form-control" placeholder="Enter a PIN..." style="z-index: 0" ng-init="typedPIN = \'\'" ng-model="typedPIN" ng-focus="getPINCandidates(typedLocation, $event)" ng-keyup="getPINCandidates(typedLocation, $event)"> <span class="input-group-btn"><button class="btn btn-primary" type="button" style="box-shadow : none"><i class="fa fa-search"></i></button></span></div><h2 class="text-muted">For a Civic Address ID?</h2><div class="input-group col-xs-12"><input id="inputSearch" tabindex="1" type="text" autocomplete="on" class="form-control" placeholder="Enter a Civic Address ID..." style="z-index: 0" ng-model="typedLocation" ng-focus="getAddressCandidates(typedLocation, $event)" ng-keyup="getAddressCandidates(typedLocation, $event)"> <span class="input-group-btn"><button class="btn btn-primary" type="button" style="box-shadow : none"><i class="fa fa-search"></i></button></span></div><div style="height : 1000px"></div></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('simplicity');
} catch (e) {
  module = angular.module('simplicity', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('topic/topic.html',
    '<div><div class="col-xs-12 btn-group btn-group-justified" style="margin-top : 15px"><a href="#/search/composite" class="btn btn-primary"><i class="fa fa-search"></i> <strong>Search</strong></a> <a ng-click="goToTopics()" class="btn btn-primary"><i class="fa fa-list"></i> <strong>View Topics</strong></a></div><div class="col-xs-12"><hr></div><div ng-include="headerTemplate"></div><div class="col-xs-12" style="height : 200px; text-align : center; margin-top : 30px" ng-show="loading"><i class="fa fa-5x fa-spinner fa-spin"></i></div><div class="col-xs-12 list-item-panel" ng-show="!loading"><div ng-if="stateParams.view !== \'simple\'" ng-include="\'topic/topic.view.header.html\'"></div><div ng-if="topicPropteries.simpleViewTemplate !== null" ng-show="stateParams.view === \'simple\'" ng-include="topicProperties.simpleViewTemplate"></div><div ng-if="topicPropteries.detailsViewTemplate !== null" ng-show="stateParams.view === \'details\'" ng-include="topicProperties.detailsViewTemplate"></div><div ng-if="topicPropteries.listViewTemplate !== null" ng-show="stateParams.view === \'list\'" ng-include="topicProperties.listViewTemplate"></div><div ng-if="topicPropteries.tableViewTemplate !== null" ng-show="stateParams.view === \'table\'" ng-include="topicProperties.tableViewTemplate"></div><div ng-show="stateParams.view === \'map\'" class="col-xs-12" style="height : 400px; margin-bottom : 20px" id="map"><div ng-if="topic.summary.table !== undefined"><div style="position : absolute; top : 50px; right : 10px; height : 36px; width : 36px; box-shadow: 0 1px 5px rgba(0,0,0,0.4);background: #fff;border-radius: 5px; z-index : 7"><i ng-init="showLegend = false" ng-click="showLegend = !showLegend" ng-mouseenter="showLegend = !showLegend" ng-mouseleave="showLegend = !showLegend" class="fa fa-2x fa-question text-primary" style="margin-top: 6px;margin-left: 10px"></i></div><div ng-show="showLegend" style="position : absolute; top : 50px; right : 50px; box-shadow: 0 1px 5px rgba(0,0,0,0.4);background: #fff;border-radius: 5px; z-index : 7"><table ng-if="topic.features.length !== 0" class="table table-hover"><thead><tr><th>Type <i class="pull-right text-muted fa fa-lg fa-times" ng-click="showLegend = !showLegend"></i></th></tr></thead><tbody><tr ng-repeat="(key, value) in topic.summary.table"><td ng-click="getDetails(key)" style="cursor : pointer"><i class="fa fa-circle" style="color: #{{value.color}}"></i> {{key}}</td></tr></tbody></table></div></div></div></div><div class="col-xs-12 list-item-panel" style="margin-top : 30px"><h2>Related Links</h2><div class="list-group" style="margin-top : 20px"><a class="row list-group-item list-item-panel" href="{{linkTopic.linkTo}}" style="margin-bottom : 5px" ng-repeat="linkTopic in linkTopics"><span class="visible-xs col-xs-8"><p class="text-primary text-center">{{linkTopic.question}}</p></span> <i ng-class="linkTopic.iconClass" class="visible-xs pull-left col-xs-3 text-primary"></i><div ng-class="linkTopic.iconClass" class="hidden-xs col-sm-2 text-primary"></div><h4 class="hidden-xs col-sm-9 text-primary" style="margin-top : 20px">{{linkTopic.question}}</h4><h4 class="col-sm-1 hidden-xs"><i class="fa fa-2x fa-chevron-right text-primary pull-right"></i></h4></a></div><div class="col-xs-12 text-center">List icon font generated by <a href="http://www.flaticon.com">flaticon.com</a> under <a href="http://creativecommons.org/licenses/by/3.0/">CC</a> by <a href="http://www.zurb.com">Zurb</a>, <a href="http://www.freepik.com">Freepik</a>, <a href="http://www.unocha.org">OCHA</a>.</div></div><div id="detailsModal" class="modal fade"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button ng-click="closeModal()" type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button><h4 class="modal-title">Point Details</h4></div><div class="modal-body"><div ng-include="topicProperties.listViewTemplate"></div></div></div></div></div><div id="downloadModal" class="modal fade" style="z-index : 3000"><div class="modal-dialog modal-sm"><div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button><h4 class="modal-title">Download</h4></div><div class="modal-body"><div ng-if="stateParams.topic === \'property\'"><button class="btn btn-primary col-xs-12" ng-click="download(\'complete\', topic)">Property Details <i class="fa fa-cloud-download"></i></button></div><div ng-if="stateParams.topic === \'crime\' || stateParams.topic === \'development\'"><button class="btn btn-primary col-xs-12" ng-click="download(\'summary\', topic)">Summary Table <i class="fa fa-cloud-download"></i></button> <button class="btn btn-primary col-xs-12" style="margin-top : 3px" ng-click="download(\'complete\', topic)">Complete records <i class="fa fa-cloud-download"></i></button><p class="text-muted text-center">based on selected filters</p></div></div></div></div></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('simplicity');
} catch (e) {
  module = angular.module('simplicity', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('topic/topic.view.header.html',
    '<div><div class="hidden-xs col-xs-12"><h2 ng-if="stateParams.view === \'details\'" class="pull-left" style="margin-right : 10px">Details View</h2><h2 ng-if="stateParams.view === \'list\'" class="pull-left" style="margin-right : 10px">List View</h2><h2 ng-if="stateParams.view === \'table\'" class="pull-left" style="margin-right : 10px">Table View</h2><h2 ng-if="stateParams.view === \'map\'" class="pull-left" style="margin-right : 10px">Map View</h2><div class="btn-group pull-right" role="group" aria-label="..." style="margin-top : 15px"><div class="btn-group" role="group"><button class="btn btn-primary dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-expanded="true">Change View <span class="caret"></span></button><ul class="dropdown-menu" role="menu" aria-labelledby="dropdownMenu1"><li ng-if="topicProperties.detailsViewTemplate" ng-class="{\'active\' : stateParams.view === \'details\'}" ng-click="onClickChangeView(\'details\')" class="text-primary" role="presentation"><a role="menuitem" tabindex="-1"><i class="fa fa-lg fa-th fa-fw"></i> Details</a></li><li ng-if="topicProperties.listViewTemplate" ng-class="{\'active\' : stateParams.view === \'list\'}" ng-click="onClickChangeView(\'list\')" class="text-primary" role="presentation"><a role="menuitem" tabindex="-1"><i class="fa fa-lg fa-list-alt fa-fw"></i> List</a></li><li ng-if="topicProperties.tableViewTemplate" ng-class="{\'active\' : stateParams.view === \'table\'}" ng-click="onClickChangeView(\'table\')" class="text-primary" role="presentation"><a role="menuitem" tabindex="-1"><i class="fa fa-lg fa-table fa-fw"></i> Table</a></li><li ng-class="{\'active\' : stateParams.view === \'map\'}" ng-click="onClickChangeView(\'map\')" class="text-primary" role="presentation"><a role="menuitem" tabindex="-1"><i class="fa fa-lg fa-map-marker fa-fw"></i> Map</a></li></ul></div><div ng-if="topicParams.view === \'list\' || (topicParams.view === \'map\' || topic.summary !== undefined)" class="btn-group" role="group"><button class="btn btn-primary dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-expanded="true">Filter <span class="caret"></span></button><ul class="dropdown-menu" role="menu" aria-labelledby="dropdownMenu1"><li class="text-primary" role="presentation"><a role="menuitem" tabindex="-1" ng-click="filterBy(null)">Show All</a></li><li ng-repeat="(key, value) in topic.summary.table" class="text-primary" role="presentation"><a role="menuitem" tabindex="-1" ng-click="filterBy(key)">{{key}}</a></li></ul></div><button ng-click="openDownloadModal()" type="button" class="btn btn-primary" data-toggle="tooltip" title="Download"><i class="fa fa-lg fa-cloud-download"></i></button></div><div ng-if="stateParams.type !== null" class="col-xs-12"><h5 class="text-muted">Filtered by <strong>{{stateParams.type}}</strong></h5></div></div><div class="visible-xs" style="text-align : center; width : 100%"><h2 ng-if="stateParams.view === \'details\'">Details View</h2><h2 ng-if="stateParams.view === \'list\'">List View</h2><h2 ng-if="stateParams.view === \'table\'">Table View</h2><h2 ng-if="stateParams.view === \'map\'">Map View</h2><div class="btn-group" style="text-align: center" role="group" aria-label="..."><div class="btn-group" role="group"><button class="btn btn-primary dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-expanded="true">Change View <span class="caret"></span></button><ul class="dropdown-menu" role="menu" aria-labelledby="dropdownMenu1"><li ng-if="topicProperties.detailsViewTemplate" ng-class="{\'active\' : stateParams.view === \'details\'}" ng-click="onClickChangeView(\'details\')" class="text-primary" role="presentation"><a role="menuitem" tabindex="-1"><i class="fa fa-lg fa-th fa-fw"></i> Details</a></li><li ng-if="topicProperties.listViewTemplate" ng-class="{\'active\' : stateParams.view === \'list\'}" ng-click="onClickChangeView(\'list\')" class="text-primary" role="presentation"><a role="menuitem" tabindex="-1"><i class="fa fa-lg fa-list-alt fa-fw"></i> List</a></li><li ng-if="topicProperties.tableViewTemplate" ng-class="{\'active\' : stateParams.view === \'table\'}" ng-click="onClickChangeView(\'table\')" class="text-primary" role="presentation"><a role="menuitem" tabindex="-1"><i class="fa fa-lg fa-table fa-fw"></i> Table</a></li><li ng-class="{\'active\' : stateParams.view === \'map\'}" ng-click="onClickChangeView(\'map\')" class="text-primary" role="presentation"><a role="menuitem" tabindex="-1"><i class="fa fa-lg fa-map-marker fa-fw"></i> Map</a></li></ul></div><button type="button" class="btn btn-primary" data-toggle="tooltip" title="Download"><i class="fa fa-lg fa-cloud-download"></i></button></div><div class="col-xs-12" style="height : 10px"></div></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('simplicity');
} catch (e) {
  module = angular.module('simplicity', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('topics/topics.html',
    '');
}]);
})();

(function(module) {
try {
  module = angular.module('simplicity');
} catch (e) {
  module = angular.module('simplicity', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('topics/topics.list.html',
    '<div><div class="col-xs-12 btn-group btn-group-justified" style="margin-top : 15px"><a href="#/search/composite" class="btn btn-primary"><i class="fa fa-search"></i> <strong>Search</strong></a></div><div class="col-xs-12"><hr></div><h2 class="text-muted text-center">{{heading}}</h2><h1 class="text-muted text-center">{{searchText}}</h1><div class="list-group" style="margin-top : 20px"><a class="row list-group-item list-item-panel" href="{{topic.linkTo}}" style="margin-bottom : 5px" ng-repeat="topic in topics"><span class="visible-xs col-xs-8"><p class="text-primary text-center">{{topic.question}}</p></span> <i ng-class="topic.iconClass" class="visible-xs pull-left col-xs-3 text-primary"></i><div ng-class="topic.iconClass" class="hidden-xs col-sm-2 text-primary"></div><h4 class="hidden-xs col-sm-9 text-primary" style="margin-top : 20px">{{topic.question}}</h4><h4 class="col-sm-1 hidden-xs"><i class="fa fa-2x fa-chevron-right text-primary pull-right"></i></h4></a></div><div class="col-xs-12 text-center">List icon font generated by <a href="http://www.flaticon.com">flaticon.com</a> under <a href="http://creativecommons.org/licenses/by/3.0/">CC</a> by <a href="http://www.zurb.com">Zurb</a>, <a href="http://www.freepik.com">Freepik</a>, <a href="http://www.unocha.org">OCHA</a>.</div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('simplicity');
} catch (e) {
  module = angular.module('simplicity', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('topic/topic-headers/topic.header.at.html',
    '<div class="list-item-panel col-xs-12"><h1>{{topicProperties.title}}</h1><form class="form-horizontal"><div class="form-group"><label class="col-sm-2 control-label"><h3 style="margin : 0px"><strong class="text-muted">at</strong></h3></label><div class="col-sm-10"><h3 class="form-control-static" style="margin : 0px">{{stateParams.searchtext}}.</h3></div></div></form></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('simplicity');
} catch (e) {
  module = angular.module('simplicity', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('topic/topic-headers/topic.header.during.along.html',
    '<div class="list-item-panel col-xs-12"><h1>{{topicProperties.title}}</h1><form class="form-horizontal"><div class="form-group"><label class="col-sm-2 control-label"><h3 style="margin : 0px"><strong class="text-muted">during</strong></h3></label><div class="col-sm-10"><select class="form-control" id="time" ng-init="timeframeValue = timeframeOptions[timeframeOptionIndex]" ng-model="timeframeValue" ng-options="item.label for item in timeframeOptions" ng-change="onChangeTimeframeValue(timeframeValue)" style="font-size : 22px; color : #2780e3; margin-top : 4px"></select></div></div><div class="form-group"><label class="col-sm-2 control-label"><h3 style="margin : 0px"><strong class="text-muted">along</strong></h3></label><div class="col-sm-10"><h3 class="form-control-static" style="margin : 0px">{{stateParams.searchtext}}.</h3></div></div></form></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('simplicity');
} catch (e) {
  module = angular.module('simplicity', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('topic/topic-headers/topic.header.during.in.html',
    '<div class="list-item-panel col-xs-12"><h1>{{topicProperties.title}}</h1><form class="form-horizontal"><div class="form-group"><label class="col-sm-2 control-label"><h3 style="margin : 0px"><strong class="text-muted">during</strong></h3></label><div class="col-sm-10"><select class="form-control" id="time" ng-init="timeframeValue = timeframeOptions[timeframeOptionIndex]" ng-model="timeframeValue" ng-options="item.label for item in timeframeOptions" ng-change="onChangeTimeframeValue(timeframeValue)" style="font-size : 22px; color : #2780e3; margin-top : 4px"></select></div></div><div class="form-group"><label class="col-sm-2 control-label"><h3 style="margin : 0px"><strong class="text-muted">in</strong></h3></label><div class="col-sm-10"><h3 class="form-control-static" style="margin : 0px">{{stateParams.searchtext}} Neighborhood</h3></div></div></form></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('simplicity');
} catch (e) {
  module = angular.module('simplicity', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('topic/topic-headers/topic.header.during.within.of.html',
    '<div class="list-item-panel col-xs-12"><h1>{{topicProperties.title}}</h1><form class="form-horizontal"><div class="form-group"><label class="col-sm-2 control-label"><h3 style="margin : 0px"><strong class="text-muted">during</strong></h3></label><div class="col-sm-10"><select class="form-control" id="time" ng-init="timeframeValue = timeframeOptions[timeframeOptionIndex]" ng-model="timeframeValue" ng-options="item.label for item in timeframeOptions" ng-change="onChangeTimeframeValue(timeframeValue)" style="font-size : 22px; color : #2780e3; margin-top : 4px"></select></div></div><div class="form-group"><label class="col-sm-2 control-label"><h3 style="margin : 0px"><strong class="text-muted">within</strong></h3></label><div class="col-sm-10"><select class="form-control" id="extent" ng-init="extentValue = extentOptions[extentOptionIndex]" ng-model="extentValue" ng-options="item.label for item in extentOptions" ng-change="onChangeExtentValue(extentValue)" style="font-size : 22px; color : #2780e3; margin-top : 4px"></select></div></div><div class="form-group"><label class="col-sm-2 control-label"><h3 style="margin : 0px"><strong class="text-muted">of</strong></h3></label><div class="col-sm-10"><h3 class="form-control-static" style="margin : 0px">{{stateParams.searchtext}}.</h3></div></div></form></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('simplicity');
} catch (e) {
  module = angular.module('simplicity', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('topic/topic-views/crime.view.html',
    '<div ng-repeat="feature in topic.features | orderBy:\'-properties.thedate\' | filter:filterText" class="col-xs-12 list-item-panel" style="margin-bottom : 20px"><div class="col-xs-12"><h3 class="hidden-xs"><strong class="text-muted">{{feature.properties.offense}}</strong></h3><h3 class="visible-xs text-center"><strong class="text-muted">{{feature.properties.offense}}</strong></h3><hr><div class="col-xs-12 col-sm-6"><h4 class="pull-left hidden-xs">{{feature.properties.address}}</h4><h4 class="text-center visible-xs">{{feature.properties.address}}</h4></div><div class="col-xs-12 col-sm-6"><h4 class="pull-right hidden-xs">{{feature.properties.thedate|date}}</h4><h4 class="text-center visible-xs">{{feature.properties.thedate|date}}</h4></div></div><div class="col-xs-12 hidden-xs"><div class="col-sm-4"><p class="text-center"><strong>Case Number</strong></p><p class="text-center">{{feature.properties.casenumber}}</p></div><div class="col-sm-4"><p class="text-center"><strong>Law Beat</strong></p><p class="text-center">{{feature.properties.law_beat}}</p></div><div class="col-sm-4"><p class="text-center"><strong>Severity</strong></p><p class="text-center">{{feature.properties.severity}}</p></div></div><div class="col-xs-12 visible-xs"><div class="col-xs-12"><p class="text-center"><strong>Case Number:</strong> {{feature.properties.casenumber}}</p></div><div class="col-xs-12"><p class="text-center"><strong>Law Beat:</strong> {{feature.properties.law_beat}}</p><p class="text-center"></p></div><div class="col-xs-12"><p class="text-center"><strong>Severity:</strong> {{feature.properties.severity}}</p></div></div><a ng-click="showMore = !showMore"><p class="text-center" ng-if="showMore">Show More</p><p class="text-center" ng-if="showMore">Show Less</p></a></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('simplicity');
} catch (e) {
  module = angular.module('simplicity', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('topic/topic-views/development.view.html',
    '<div ng-repeat="feature in topic.features | orderBy:\'-properties.thedate\' | filter:filterText" class="col-xs-12 list-item-panel" style="margin-bottom : 20px"><h3 class="text-center text-muted"><strong>{{feature.properties.record_type}}</strong></h3><h3 class="text-center">{{feature.properties.address}}</h3><div class="col-xs-12"><h4 class="col-xs-12 col-sm-4 text-center"><strong class="text-muted">Opened</strong><p>{{feature.properties.date_opened|date}}</p></h4><h4 class="col-xs-12 col-sm-4 text-center"><strong class="text-muted">Updated</strong><p>{{feature.properties.date_statused|date}}</p></h4><h4 class="col-xs-12 col-sm-4 text-center"><strong class="text-muted">Status</strong><p>{{feature.properties.record_status}}</p></h4></div><h4 class="col-xs-12"><p><strong class="text-muted">Description:</strong> {{feature.properties.description}}</p></h4><div class="col-xs-12 list-item-panel" ng-init="showMore = false" ng-show="showMore"><div class="col-xs-12"><h4 class="col-sm-6 text-center"><strong class="text-muted">Record Id</strong><p>{{feature.properties.record_id}}</p></h4><h4 class="col-sm-6 text-center"><strong class="text-muted">License Number</strong><p>{{feature.properties.license_number}}</p></h4></div><div class="col-xs-12"><h4 class="col-sm-6 text-center"><strong class="text-muted">Record Name</strong><p>{{feature.properties.record_name}}</p></h4><h4 class="col-sm-6 text-center"><strong class="text-muted">Business Name</strong><p>{{feature.properties.business_name}}</p></h4></div><div class="col-xs-12" ng-init="showComments = false" ng-show="showComments"><h4><strong class="text-muted">Comments</strong></h4><ul class="list-group" style="overflow : scroll"><li class="list-group-item list-card-panel" ng-repeat="comment in feature.properties.commentsArray">{{comment}}</li></ul></div><a ng-click="showComments = !showComments"><h4 class="text-center" ng-if="!showComments">Show Comments</h4><h4 class="text-center" ng-if="showComments">Hide Comments</h4></a></div><a ng-click="showMore = !showMore"><h4 class="text-center" ng-if="!showMore">Show More</h4><h4 class="text-center" ng-if="showMore">Show Less</h4></a></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('simplicity');
} catch (e) {
  module = angular.module('simplicity', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('topic/topic-views/owner.view.html',
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
  $templateCache.put('topic/topic-views/property.view.html',
    '<div ng-repeat="feature in topic.features"><div><div class="col-xs-12"><div class="col-xs-12 col-sm-6"><h4><strong class="text-muted">Civic Address Id</strong> : <span>{{stateParams.id}}</span></h4><h4><strong class="text-muted">PIN</strong> : <span>{{feature.properties.pinnum}}</span></h4></div><div class="col-xs-12 col-sm-6"><h4 ng-if="feature.properties.isincity === \'Yes\'" class="text-muted"><i class="fa fa-lg fa-check-circle text-success pull-left"></i> <strong>It\'s in the city!</strong></h4><h4 ng-if="feature.properties.isincity === \'No\'" class="text-muted"><i class="fa fa-lg fa-times-circle text-danger pull-left"></i> <strong>It\'s not in the city!</strong></h4><h4 ng-if="feature.properties.iscityowned === \'Yes\'" class="text-muted"><i class="fa fa-lg fa-check-circle text-success pull-left"></i> <strong>It\'s city owned!</strong></h4><h4 ng-if="feature.properties.iscityowned === \'No\'" class="text-muted"><i class="fa fa-lg fa-times-circle text-danger pull-left"></i> <strong>It\'s not city owned!</strong></h4></div></div></div><div ng-include="\'topic/topic-views/owner.view.html\'"></div><div ng-include="\'topic/topic-views/zoning.view.html\'"></div><div class="col-xs-12 list-item-panel"><h4>Property and Tax Value</h4><table class="table"><thead><tr><th>Value Type</th><th>Amount</th></tr></thead><tbody><tr><td>Building Value</td><td>${{feature.properties.buildingvalue|number}}</td></tr><tr><td>Land Value</td><td>${{feature.properties.landvalue|number}}</td></tr><tr><td>Appraised Value</td><td>${{feature.properties.appraisedvalue|number}}</td></tr><tr><td>Tax Value</td><td>${{feature.properties.taxvalue|number}}</td></tr><tr><td>Total Market Value</td><td>${{feature.properties.totalmarketvalue|number}}</td></tr></tbody></table></div><div class="col-xs-12 list-item-panel"><h4>Other Details</h4><p class="col-sm-6" ng-if="feature.properties.exempt === null">Tax exempt : <span>NO</span></p><p class="col-sm-6" ng-if="feature.properties.exempt !== null">Tax exempt : <span>YES</span></p><p class="col-sm-6" ng-if="feature.properties.improved === \'Y\'">Improved : <span>YES (${{feature.properties.improvementvalue|number}})</span></p><p class="col-sm-6">Appraisal Area : {{feature.properties.appraisalarea}}</p><p class="col-sm-6">Acreage : {{feature.properties.acreage}} acres</p></div><div class="col-xs-12 list-item-panel"><br><a class="col-xs-12 col-sm-4 text-center btn btn-primary" style="margin-bottom : 10px" target="_blank" href="{{feature.properties.deed_url}}"><i class="fa fa-2x fa-file-text-o"></i><br>Deed</a> <a class="col-xs-12 col-sm-4 text-center btn btn-primary" style="margin-bottom : 10px" target="_blank" href="{{feature.properties.plat_url}}"><i class="fa fa-2x fa-file-text-o"></i><br>Plat</a> <a class="col-xs-12 col-sm-4 text-center btn btn-primary" style="margin-bottom : 10px" target="_blank" href="{{feature.properties.proptopic_url}}"><i class="fa fa-2x fa-file-text-o"></i><br>Property Card</a><br></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('simplicity');
} catch (e) {
  module = angular.module('simplicity', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('topic/topic-views/recycling-collection.view.html',
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
  $templateCache.put('topic/topic-views/sanitation.card.html',
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
  $templateCache.put('topic/topic-views/table.view.html',
    '<div><div class="col-xs-12" ng-if="topic.features.length === 0"><div class="col-xs-12"><hr></div><h3 class="text-muted text-center"><strong>We couldn\'t find any results.</strong></h3><h4 class="text-muted text-center"><strong>Try expanding the time frame or extent of your search.</strong></h4></div><table ng-if="topic.features.length !== 0" class="table table-hover col-xs-12"><thead><tr><th>Type</th><th class="text-center">Count</th></tr></thead><tbody><tr ng-repeat="(key, value) in topic.summary.table"><td ng-click="getDetails(key)" style="cursor : pointer"><i class="fa fa-circle" style="color: #{{value.color}}"></i> {{key}}<br><p class="text-muted">{{developmentExplanations[key]}}</p></td><td class="text-center">{{value.count}}</td></tr></tbody></table></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('simplicity');
} catch (e) {
  module = angular.module('simplicity', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('topic/topic-views/trash-collection.view.html',
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
  $templateCache.put('topic/topic-views/zoning.view.html',
    '<div class="col-xs-12 list-item-panel"><h4>Zoning</h4><h5 class="text-muted" ng-if="card.codelink === \'disable\'"><strong>District</strong> : <span>{{feature.properties.zoning}}</span></h5><h5 class="text-muted" ng-if="card.codelink !== \'disable\'"><strong>District</strong> : <span><strong>{{zoning}}</strong></span> <a ng-repeat="zoning in feature.properties.zoning" class="" target="_blank" href="{{feature.properties.codelink}}"><strong>{{zoning}}</strong></a></h5><h5 ng-if="feature.properties.zoningOverlays !== undefined"><strong>Zoning Overlay</strong> : <span>{{feature.properties.zoningOverlays}}</span></h5></div>');
}]);
})();
