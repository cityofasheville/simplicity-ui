'use strict';

//instatiate an AngularJS module and inject an dependancy modules
var app = angular.module('simplicity', ['ui.router', 'ngAnimate']);
 
//Configure application states and routes
app.config(function ($stateProvider, $urlRouterProvider, $httpProvider) {
    //Needed to set this header to get gulp browser sync to work
    //$httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

    //define states
    $stateProvider
      //Main application controls search and location filter
      .state('main', {
        url: '',
        templateUrl: 'main/main.html',
        controller: 'MainCtrl',
        resolve :  {
          featureServiceProperties : ['ArcGisServer', function(ArcGisServer){
                return ArcGisServer.featureService.properties();
          }]
        }
      })
      //location can be a CAI (civic address id) or an neighborhood
      .state('main.location', {
        url: '/:location',
        template: '<div ui-view style = "z-index : 100" class = "slide"></div>',
        controller: 'LocationCtrl',
        resolve:  {
          location: ['$stateParams', function($stateParams){
                return $stateParams.location;
          }]
        }
      })
      //list of question for a location
      .state('main.location.questions', {
        url: '/questions',
        templateUrl: 'questions/questions.html',
        controller: 'QuestionsCtrl',
      })
      //category is a data category such as property, crime, or development
      .state('main.location.category', {
        url: '/:category',
        templateUrl: 'category/category.html',
        controller: 'CategoryCtrl',
        resolve: {
          category: ['$stateParams', function($stateParams){
              return $stateParams.category;
          }]
        }
      })
      //time is the timeframe of the data being displayed
      //can be a 4 digit number year (e.g. 2014) or
      //unix timestamps seperated by commas (e.g. 1199145600000,1230768000000)
      //for categories that do not have a time component (e.g. property) use the keyword 'current'
      .state('main.location.category.time', {
        url: '/:time',
        templateUrl: 'time/time.html',
        controller: 'TimeCtrl',
        resolve: {
          time : ['$stateParams', function($stateParams){
              return $stateParams.time;
          }]
        }
      })
      //extent is the keyword/s that is used to filter the spatial extent a category
      //(e.g. within-a-quarter-mile would located details of a category within a quarter mile)
      //Could also support a list of coordinates or value.unit syntax
      //if the extent is a point, use the keyword 'location'
      //if the extent is a neighborhood, use the keyword 'neighborhood'
      .state('main.location.category.time.extent', {
        url: '/:extent',
        templateUrl: 'extent/extent.html',
        controller: 'ExtentCtrl',
        resolve: {
          extent : ['$stateParams', function($stateParams){
              return $stateParams.extent;
          }]
        }
      })
      //filter is the keyword/s that is used to filter a category by in sub-components
      //(e.g. filter could be zoning for a property or aggrevated assault for crime)
      //if there is no filter use summary
      .state('main.location.category.time.extent.filter', {
        url: '/:filter',
        templateUrl: 'filter/filter.html',
        controller: 'FilterCtrl',
        resolve: {
          filter : ['$stateParams', function($stateParams){
              return $stateParams.filter;
          }]
        }
      })
      //details is a keyword that defines the how details will be displayed
      //possible values 'report', 'map', and maybe 'chart'
      .state('main.location.category.time.extent.filter.details', {
        url: '/:details',
        templateUrl: 'details/details.html',
        controller: 'DetailsCtrl',
        resolve: {
          details : ['$stateParams', function($stateParams){
              return $stateParams.details;
          }]
        }
      });
    $urlRouterProvider.when('/a-zA-Z0-9/', '');
    $urlRouterProvider.otherwise('');
  });//END config


app.factory('ArcGisServer', ['$http', '$location', '$q', '$filter',
  function($http, $location, $q, $filter){

    var ArcGisServer = {
      'geocodeService' : {},
      'geometryService' : {},
      'featureService' : {},
      'mapService' : {},
    };

    //****Private Variables*****//

    //These could be delivered via an application api, but for now they are just hard coded

    var serverProperties = {
      'baseServicesUrl' : 'http://arcgis-arcgisserver1-1222684815.us-east-1.elb.amazonaws.com/arcgis/rest/services',
      'geocodeServiceName' : 'coa_address_loc',
      'featureServiceName' : 'opendata',
    };

    var featureServiceProperties = {};

    

    //Public API

    ArcGisServer.geocodeService.findAddressCandidates = function(address, fields, limit){

      //Create a url by joining elements of an array (so they need to be in order!)
      var geocodeServiceUrl = [
          serverProperties.baseServicesUrl, 
          serverProperties.geocodeServiceName, 
          'GeocodeServer', 
          'findAddressCandidates'
        ].join('/');

      //define query parameters
      var params = {
        'Single Line Input' : address,
        'outFields' : fields,
        'f' : 'json'

      };

      //use $q promises to handle the http request asynchronously
      var q = $q.defer();
      //make http request
      $http({method : 'GET', url : geocodeServiceUrl, params : params, cache : true})
        //callbacks
        .success(function(data, status, headers, config){
          if(data.error){
            console.log(data.error.code + ' ArcGisServer.geocodeService.findAddressCanidates ' + data.error.message);
          }else{
            q.resolve(data);
          }
        })
        .error(function(error){
          console.log('Error gecoding ' + address);
          console.log(error);
        });

      //return the promise using q
      return q.promise;
    };

    //Get feature service properties
    ArcGisServer.featureService.properties = function(){
      //use $q promises to handle the http request asynchronously
      var q = $q.defer();
      //Create a url by joining elements of an array (so they need to be in order!)
      var featureServiceUrl = [
          serverProperties.baseServicesUrl, 
          serverProperties.featureServiceName, 
          'FeatureServer'
        ].join('/');

      //make http request
      $http({method : 'GET', url : featureServiceUrl, params : {'f' : 'json'}, cache : true})
        //callbacks
        .success(function(data, status, headers, config){
          if(data.error){
            console.log(data.error.code + ' getFeatureServiceProperties ' + data.error.message);
          }else{
            featureServiceProperties = data;
            q.resolve(data);
          }
        })
        .error(function(error){
          console.log('Error getting feature services properties.');
          console.log(error);
        });
      return q.promise;
    };

    ArcGisServer.featureService.query = function(featureServiceId, options){

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
            console.log(data.error.code + ' ArcGisServer.featureService.query on featureServiceId ' + featureServiceId + '. ' + data.error.message);
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
    };


    ArcGisServer.featureService.getId = function(featureServiceName, featureServiceType){
      var featureServiceTypePlural = featureServiceType + 's';
      for (var i = 0; i < featureServiceProperties[featureServiceTypePlural].length; i++) {
        if(featureServiceProperties[featureServiceTypePlural][i].name === featureServiceName){
          return featureServiceProperties[featureServiceTypePlural][i].id;
        } 
      }
    };


    //****Return the factory object****//
    return ArcGisServer; 

    
}]); //END ArcGisServer factory function
//Keep a scope variable of the current address to share across all 
app.controller('CategoryCtrl', ['$scope', '$stateParams', '$state', 'Category', 
	function ($scope, $stateParams, $state, Category) {

	//***TODO: Get category definition via HTTP ***//
    $scope.category = Category.getDefinition($stateParams.category);
    console.log($scope.category);
    $state.go('main.location.category.time.extent.filter.details', $scope.category.defaultStates);    
}]);


app.factory('Category', ['$http', '$location', '$q', '$filter',
  function($http, $location, $q, $filter){

    //****Create the factory object****//
    var Category = {};

    
    //****Private variables*****//
    var caiCrimeDefinition = {
      title : 'Crime',
      defaultStates : {
        time : 'last-year',
        extent : 'within-an-eighth-of-a-mile',
        filter : 'summary',
        details : 'report'
      }
    };

    var propertyDefinition = {
      title : 'Property',
      defaultStates : {
        time : 'current',
        extent : 'location',
        filter : 'summary',
        details : 'report'
      }
    };


    var developmentDefinition = {
      title : 'Development',
      defaultStates : {
        time : 'last-year',
        extent : 'within-an-eighth-of-a-mile',
        filter : 'summary',
        details : 'report'
      }
    };

    var permitsDefinition = {
      title : 'Permits',
      defaultStates : {
        time : 'last-year',
        extent : 'location',
        filter : 'summary',
        details : 'report'
      }
    };

    var neighborhoodCrimeDefinition = {
      showTimeOptions : true,
      defaultTimeOption : 2,
      showExtentOptions : false,
      defaultExtentOption : 'neighborhood',
      showFilterOptions : false,
      defaultFilterOption : 'summary'
    };



    var categoryDefinitions = {
      cai : {
        crime : caiCrimeDefinition,
        property : propertyDefinition,
        development : developmentDefinition,
        permits : permitsDefinition
      },
      neighborhood : {
        crime : neighborhoodCrimeDefinition
      }
    };

    //****API*****//

    Category.getDefinition = function(category){
      //for now we only have addresses
      return categoryDefinitions.cai[category];
      //******TODO******//
      //if cai do something if neighborhood do something else
      // if(locationProperties.locationType === 'cai'){
      //   return categoryDefinitions.cai[category];
      // }else{
      //   return categoryDefinitions.neighborhood[category];
      // } 
    };


    //****Return the factory object****//
    return Category; 

    
}]); //END Category factory function
app.controller('DetailsCtrl', ['$scope', '$stateParams', '$state', 
	function ($scope, $stateParams, $state) {
  
    $scope.stateParams = $stateParams;
    $scope.goTo = function(detailsLocation){
    	$state.go('main.location.category.time.extent.filter.details', {'details' : detailsLocation});
    };
}]);

app.factory('Details', ['$http', '$location', '$q', '$filter', '$stateParams', 'ArcGisServer', 'Time', 'Filter',
  function($http, $location, $q, $filter, $stateParams, ArcGisServer, Time, Filter){

    //****Create the factory object****//
    var Details = {};

    var detailsCache = {};



    Details.getPropertyDetails = function(civicAddressId){
      var q = $q.defer();
      //We need to cross-reference the civic address id to get the PIN(to look up the property)
      var crossRefTableId = ArcGisServer.featureService.getId('coagis.gisowner.coa_civicaddress_pinnum_centerline_xref_view', 'table');
      console.log(crossRefTableId);
      var queryParams = {
        'where' : 'civicaddress_id=' + civicAddressId,
        'f' : 'json',
        'outFields' : '*'
      };
      ArcGisServer.featureService.query(crossRefTableId, queryParams)
        .then(function(crossRef){
          var propertyLayerId = ArcGisServer.featureService.getId('coagis.gisowner.coa_opendata_property', 'layer');
          var queryParams = {
            'where' : "pinnum='" + crossRef.features[0].attributes.pinnum + "'",
            'f' : 'json',
            'outFields' : '*'
          };
          ArcGisServer.featureService.query(propertyLayerId, queryParams)
            .then(function(propertyDetails){
              q.resolve(propertyDetails.features[0]);
            });
        });
      return q.promise;
    };


    //*********************************************************//
    //**************************CRIME**************************//
    //*********************************************************//

    //****CRIME REPORT****//

    Details.getCrimeFeatures = function(crimeIdArray){
      var processCrimesArray = function(arrayOfCrimes){
        var crimesArray = [];
        var crimeLayerId = ArcGisServer.featureService.getId('coagis.gisowner.coa_opendata_crime', 'layer');
        var queryParams = {
            'where' : 'pid in (' + arrayOfCrimes + ')',
            'f' : 'json',
            'outFields' : '*'
          };
          ArcGisServer.featureService.query(crimeLayerId, queryParams)
            .then(function(crimes){
              //this is being assigned wrong
              detailsCache[$stateParams.location] = crimes;
              q.resolve(crimes);
            });
      };
      var q = $q.defer();
      if(detailsCache[$stateParams.location]){
        if(detailsCache[$stateParams.location].crime){
          q.resolve(detailsCache[$stateParams.location].crime);
        }else{
          processCrimesArray(crimeIdArray);
        }
        
      }else{
        processCrimesArray(crimeIdArray);
      }
      return q.promise;
    };

    Details.filterCrimeDetailsByTime = function(crimeFeatures){
      var timeFilterValue = Time.filterValue($stateParams.time);
      var crimeSummary= {};
      for (var i = 0; i < crimeFeatures.features.length; i++) {
        if(crimeFeatures.features[i].attributes.thedate >= timeFilterValue){
          if(crimeSummary[crimeFeatures.features[i].attributes.offense] === undefined){
            crimeSummary[crimeFeatures.features[i].attributes.offense] = 1;
          }else{
            crimeSummary[crimeFeatures.features[i].attributes.offense] = crimeSummary[crimeFeatures.features[i].attributes.offense] + 1;
          }
        }
      }
      var filterOptions = [];
      filterOptions.push({'value' : 'summary', 'label' : 'Crime Summary'});
      for (var key in crimeSummary) {
        filterOptions.push({'value' : key.toLowerCase().replace(/ /g, '-'), 'label' : key});
      }
      Filter.updateOptions(filterOptions, $stateParams.category);
      return crimeSummary;
    };

    Details.filterCrimeSummaryByFilter = function(crimeSummary){
      if($stateParams.filter === 'summary'){
        return crimeSummary;
      }else{
        var filterOptions = Filter.options($stateParams.category);
        for (var i = 0; i < filterOptions.length; i++) {
          if(filterOptions[i].value === $stateParams.filter){
            var temp = {};
            temp[filterOptions[i].label] = crimeSummary[filterOptions[i].label];
            return(temp);
          }
        }
      }
    };

    //****CRIME MAP****//

    Details.filterCrimeGeoJsonByTime = function(crimeGeoJson){
      var timeFilterValue = Time.filterValue($stateParams.time);
      var filteredCrimeFeatures = [];
      for (var i = 0; i < crimeGeoJson.features.length; i++) {
        if(crimeGeoJson.features[i].properties.thedate >= timeFilterValue){
          filteredCrimeFeatures.push(crimeGeoJson.features[i]);
        }
      }
      crimeGeoJson.features = filteredCrimeFeatures;
      return crimeGeoJson;
    };

    Details.filterCrimeGeoJsonByFilter = function(crimeGeoJson){
      if($stateParams.filter === 'summary'){
        return crimeGeoJson;
      }else{
        var filterOptions = Filter.options($stateParams.category);
        for (var x = 0; x < filterOptions.length; x++) {
          if(filterOptions[x].value === $stateParams.filter){
            var filteredCrimeFeatures = [];
            for (var i = 0; i < crimeGeoJson.features.length; i++) {
              if(crimeGeoJson.features[i].properties.offense === filterOptions[x].label){
                filteredCrimeFeatures.push(crimeGeoJson.features[i]);
              }
            }
            crimeGeoJson.features = filteredCrimeFeatures;
            console.log(crimeGeoJson);
            return crimeGeoJson;
          }
        }
      }
    };


    //*********************************************************//
    //***********************DEVELOPMENT***********************//
    //*********************************************************//

    //****DEVELOPMENT REPORT****//

    Details.getDevelopmentFeatures = function(developmentIdArray){
      var processDevelopmentArray = function(arrayOfDevelopment){
        var developmentLayerId = ArcGisServer.featureService.getId('coagis.gisowner.coa_opendata_permits', 'layer');
        //The development ids in the developmentIdArray are being stored as strings, they need to be numbers
        var stringOfDevelopmentIds = '';
        for (var i = 0; i < arrayOfDevelopment.length; i++) {
          if(i === 0){
            stringOfDevelopmentIds = stringOfDevelopmentIds + "'" + arrayOfDevelopment[i] + "'";
          }else{
            stringOfDevelopmentIds = stringOfDevelopmentIds + ",'" + arrayOfDevelopment[i] + "'";
          }         
        }
        //Need to put  quotes on everything
        var queryParams = {
            'where' : "apn in (" + stringOfDevelopmentIds + ") and record_module = 'Planning'",
            'f' : 'json',
            'outFields' : '*'
          };
          ArcGisServer.featureService.query(developmentLayerId, queryParams)
            .then(function(development){
              console.log('development');
              console.log(development);
              //Filter out the record types that are actually part of development
              // var developmentFeatures = [];
              // for (var i = 0; i < development.features.length; i++) {
              //   if(development.features[i].attributes.record_type === 'Planning Level II' || development.features[i].attributes.record_type === 'Planning Level III' || development.features[i].attributes.record_type === 'Conditional Zoning Permit' || development.features[i].attributes.record_type === 'Major Subdivision' || development.features[i].attributes.record_type === 'Rezoning' || development.features[i].attributes.record_type === 'Conditional Use Permit'){
              //     console.log(development.features[i].attributes.record_type);
              //     developmentFeatures.push(development.features[i]);
              //   }
              // }
              // development.features = developmentFeatures;
              // console.log('development filtered');
              // console.log(development);
              
              //this is being assigned wrong
              detailsCache[$stateParams.location] = development;
              q.resolve(development);
            });
      };
      var q = $q.defer();
      if(detailsCache[$stateParams.location]){
        if(detailsCache[$stateParams.location].development){
          q.resolve(detailsCache[$stateParams.location].development);
        }else{
          processDevelopmentArray(developmentIdArray);
        }
        
      }else{
        processDevelopmentArray(developmentIdArray);
      }
      return q.promise;
    };

    Details.filterDevelopmentFeaturesByTime = function(developmentFeatures){
      var timeFilterValue = Time.filterValue($stateParams.time);
      var developmentSummary= {};
      var developmentArray = []
      for (var i = 0; i < developmentFeatures.features.length; i++) {
        if(developmentFeatures.features[i].attributes.date_opened >= timeFilterValue){
          if(developmentSummary[developmentFeatures.features[i].attributes.record_type] === undefined){
            developmentSummary[developmentFeatures.features[i].attributes.record_type] = 1;
          }else{
            developmentSummary[developmentFeatures.features[i].attributes.record_type] = developmentSummary[developmentFeatures.features[i].attributes.record_type] + 1;
          }
          if($stateParams.filter !== 'summary' && developmentFeatures.features[i].attributes.record_type.toLowerCase().replace(/ /g, '-') === $stateParams.filter){
            developmentArray.push(developmentFeatures.features[i]);
          }
        }
      }
      var filterOptions = [];
      filterOptions.push({'value' : 'summary', 'label' : 'Development Summary'});
      for (var key in developmentSummary) {
        filterOptions.push({'value' : key.toLowerCase().replace(/ /g, '-'), 'label' : key});
      }
      Filter.updateOptions(filterOptions, $stateParams.category);
      if($stateParams.filter === 'summary'){
        return developmentSummary;
      }else{
        return developmentArray
      }
      
    };

    Details.filterDevelopmentSummaryByFilter = function(developmentSummary){
      if($stateParams.filter === 'summary'){
        return developmentSummary;
      }else{
        var filterOptions = Filter.options($stateParams.category);
        for (var i = 0; i < filterOptions.length; i++) {
          if(filterOptions[i].value === $stateParams.filter){
            var temp = {};
            temp[filterOptions[i].label] = developmentSummary[filterOptions[i].label];
            return(temp);
          }
        }
      }
    };

      //****CRIME MAP****//
    // var commercialDevelopmentTypes = [
    //             'Com: Upfit', 
    //             'Com: Remodel', 
    //             'Com: Mechanical', 
    //             'Com: Plumbling', 
    //             'Com: Gas Piping', 
    //             'Com: Accessory Structure',
    //             'Com: Other New',
    //             'Com: Electrical',
    //             'Com: Demo',
    //             'Com: Addition',
    //             'Com: Reroof'
    //             ];
    //           var residentialDevelopmentType = [
    //             'Res: Accessory Structure',
    //             'Res: Remodel', 
    //             'Res: Site Work',
    //             'Res: Change Out',
    //             'Res: Gas Piping', 
    //             'Res: Electrical',
    //             'Res: Mechanical',
    //             'Res: Gas Piping',
    //             'Res: Plumbling',
    //             'Res: Multi-Trade',
    //             'Res: Demolition',
    //             'Res: Reroof',
    //             'Res: New',
    //             'Res: Addition'
    //             ];

    //****Return the factory object****//
    return Details; 

    
}]); //END Details factory function
app.directive('map', ['$compile','$filter','$state', '$stateParams','$q', 'Details', 'LocationProperties',
  function($compile, $filter, $state, $stateParams, $q, Details, LocationProperties){
  return {
    //Restrict the directive to attribute ep-form on an element 
    restrict: 'A',
    //Defines the scope object for the directive 
    scope:{
      map : '= map',
    },
    replace : true,
    //Template for the directive
    templateUrl: 'details/details.map.directive.html',
    controller : ['$scope', function($scope){


    //Creates GeoJson from an ArcGIS Feature Service
    var createPointGeoJsonFromArcGisFeatureService = function(featureService){
        var geoJson = {
            'type' : 'FeatureCollection',
            'features' : []
        };

        for (var i = 0; i < featureService.features.length; i++) {
            var temp = {
                'type':'Feature',
                'geometry' : {
                    'type': 'Point', 
                    'coordinates': [featureService.features[i].geometry.x, featureService.features[i].geometry.y]
                },
                'properties': featureService.features[i].attributes
            };
            geoJson.features.push(temp);
        }
        console.log(geoJson);
        return geoJson;
    };

    var createGeoJsonMarkers = function(data){
      return L.geoJson(data, {
          pointToLayer: function (feature, latlng) {
              return L.marker(latlng, {icon: crimeMarker}).addTo(map);    
          },
          onEachFeature: function (feature, layer) {
              layer.on('click', function(){

                  $scope.getPointDetails(feature.properties);
                  $scope.pointDetails = feature.properties;
                  $scope.$apply();
              });
          }
      });
    };

    var createGeoJsonFromArcGisFeatureServicePolygon = function(featureServicePolygon){
      console.log(featureServicePolygon.geometry.rings[0]);
        var geoJson = {
            'type' : 'FeatureCollection',
            'features' : [
            {
                'type':'Feature',
                'geometry' : {
                    'type': 'Polygon', 
                    'coordinates': [featureServicePolygon.geometry.rings[0]]
                },
                'properties': featureServicePolygon.attributes
            }
            ]
        };
        console.log(geoJson);
        return geoJson;
    };


    var createGeoJson = function(data){
      return L.geoJson(data, {
          
          onEachFeature: function (feature, layer) {
              layer.on('click', function(){
                  
              });
          }
      });
    };

    var getBounds = function(coordinatesArray){
      var minLat = 90;
      var maxLat = -90;
      var minLng = 180;
      var maxLng = -180;
      for (var i = 0; i < coordinatesArray.length; i++) {
        console.log(coordinatesArray[i][0]);
        console.log(coordinatesArray[i][1]);
        if(coordinatesArray[i][0] < minLng){
          minLng = coordinatesArray[i][0];
        }else if(coordinatesArray[i][0] > maxLng){
          maxLng = coordinatesArray[i][0];
        }else if(coordinatesArray[i][1] < minLat){
          minLat = coordinatesArray[i][1];
        }else if(coordinatesArray[i][1] > maxLat){
          maxLat = coordinatesArray[i][1];
        }else{
          //pass
        }
      }
      return [[minLat, minLng], [maxLat, maxLng]];
    };

    var getBoundsOfPointGeoJson = function(geoJson){
      if(geoJson.features.length === 1){
        return [
          [geoJson.features[0].geometry.coordinates[1] - 0.01, geoJson.features[0].geometry.coordinates[0]-0.01], 
          [geoJson.features[0].geometry.coordinates[1] + 0.01, geoJson.features[0].geometry.coordinates[0]+ 0.01]
        ];
      }else if(geoJson.features.length === 0){
        return [
          [geoJson.features[0].geometry.coordinates[1] - 0.01, geoJson.features[0].geometry.coordinates[0]-0.01], 
          [geoJson.features[0].geometry.coordinates[1] + 0.01, geoJson.features[0].geometry.coordinates[0]+ 0.01]
        ];
      }else{
        var minLat = 90;
        var maxLat = -90;
        var minLng = 180;
        var maxLng = -180;
        for (var i = 0; i < geoJson.features.length; i++) {
          if(geoJson.features[i].geometry.coordinates[0] < minLng){
            minLng = geoJson.features[i].geometry.coordinates[0];
          }
          if(geoJson.features[i].geometry.coordinates[0] > maxLng){
            maxLng = geoJson.features[i].geometry.coordinates[0];
          }

          if(geoJson.features[i].geometry.coordinates[1] < minLat){
            minLat = geoJson.features[i].geometry.coordinates[1];
          }
          if(geoJson.features[i].geometry.coordinates[1] > maxLat){
            maxLat = geoJson.features[i].geometry.coordinates[1];
          }
        }
        console.log([[minLat, minLng], [maxLat, maxLng]]);
        return [[minLat, minLng], [maxLat, maxLng]];
      }
      
    };
    //Initialize the map
    var map = L.map('map', {
        center: [35.5951125,-82.5511088], 
        zoom : 13,
        maxZoom : 22,
        fullscreenControl: true
    });

    //Leaflet Awesome markers style (uses font awesome icons)
    var crimeMarker = L.AwesomeMarkers.icon({
        icon: 'circle',
        prefix: 'fa',
        iconColor :'white',
        markerColor: 'red',
      });

    //L.control.layers(baseMaps).addTo(map);
    L.tileLayer("http://gis.ashevillenc.gov/tiles/basemapbw/{z}/{x}/{y}.png",{
        attribution:'&copy; The City of Asheville',
        maxZoom : 19,
        tms : true
    }).addTo(map);

    LocationProperties.properties()
      .then(function(properties){
        $scope.locationProperties = properties;
        if($scope.map.category === 'property'){
          Details.getPropertyDetails($scope.map.location)
            .then(function(propertyDetails){
              $scope.propertyDetails = propertyDetails;
              var propertyGeoJson = createGeoJsonFromArcGisFeatureServicePolygon(propertyDetails);
              var propertyLayer = createGeoJson(propertyGeoJson);
              var propertyBounds = getBounds(propertyDetails.geometry.rings[0]);
              propertyLayer.addTo(map);
              map.fitBounds(propertyBounds);
              map.setZoom(18);
            });
        }else if($scope.map.category === 'crime'){
          Details.getCrimeFeatures(properties.crime)
            .then(function(crimes){
              var crimeDetails = Details.filterCrimeSummaryByFilter(Details.filterCrimeDetailsByTime(crimes));
              var crimeGeoJson = createPointGeoJsonFromArcGisFeatureService(crimes);
              var filterCrimeGeoJson = Details.filterCrimeGeoJsonByFilter(Details.filterCrimeGeoJsonByTime(crimeGeoJson));
              var crimeGeoJsonLayer = createGeoJsonMarkers(filterCrimeGeoJson);
              map.fitBounds(getBoundsOfPointGeoJson(filterCrimeGeoJson));
              crimeGeoJsonLayer.addTo(map);
              console.log(properties);
              L.marker([properties.address.location.y, properties.address.location.x]).addTo(map);
              L.circle([properties.address.location.y, properties.address.location.x], 201.168, {
                'fillOpacity' : 0
              }).addTo(map);
              map.setZoom(18);
            });
        }
      });

      $scope.getPointDetails = function(pointPointProperties){
        $('#pointDetailsModal').modal({'backdrop' : false});
      };

      
      
    }]//END Details Directive Controller function
  };//END returned object
}]);//END Details directivective function
app.directive('report', ['$compile','$filter','$state', '$stateParams','$q', '$timeout','Details', 'LocationProperties',
  function($compile, $filter, $state, $stateParams, $q, $timeout, Details, LocationProperties){
  return {
    //Restrict the directive to attribute ep-form on an element 
    restrict: 'A',
    //Defines the scope object for the directive 
    scope:{
      report : '= report',
    },
    replace : true,
    //Template for the directive
    templateUrl: 'details/details.report.directive.html',
    controller : ['$scope', function($scope){
      console.log($scope.report);

      var templates = {
        'property' : 'details/reports/property.report.html',
        'crime' : 'details/reports/crime.report.html',
        'development' : 'details/reports/development.report.html',
      };

      $scope.loading = false;

      var isEmpty = function (obj) {
          for(var prop in obj) {
              if(obj.hasOwnProperty(prop)){
                return false;
              }     
          }
          return true;
      };

      $scope.developmentExplanations = {
        'Planning Level I' : 'Commercial construction less than 35,000 square feet or less than 20 multi-family units',
        'Planning Level II' : 'Commercial construction 35,000-100,000 square feet or 20-50 multi-family units',
        'Planning Level III' : 'Commercial construction larger than 100,000 square feet or more than 50 multi-family units'
      }

      LocationProperties.properties()
        .then(function(properties){
          $scope.locationProperties = properties;
          if($scope.report.category === 'property'){
            Details.getPropertyDetails($scope.report.location)
              .then(function(propertyDetails){
                $scope.propertyDetails = propertyDetails;
              });
          }else if($scope.report.category === 'crime'){
            $scope.loading = true;
            Details.getCrimeFeatures(properties.crime)
              .then(function(crimeFeatures){
                $scope.crimeSummary = Details.filterCrimeSummaryByFilter(Details.filterCrimeDetailsByTime(crimeFeatures));
                $scope.loading = false;
              });
          }else if($scope.report.category === 'development'){
            $scope.loading = true;
            Details.getDevelopmentFeatures(properties.development)
              .then(function(developmentFeatures){
                if($scope.report.filter === 'summary'){
                  $scope.developmentSummary = Details.filterDevelopmentSummaryByFilter(Details.filterDevelopmentFeaturesByTime(developmentFeatures));
                  $scope.isEmpty = isEmpty($scope.developmentSummary);
                  $scope.developmentArray = [];
                  $scope.loading = false;
                }else{
                  $scope.developmentSummary = {};
                  $scope.isEmpty = true;
                  $scope.developmentArray = Details.filterDevelopmentFeaturesByTime(developmentFeatures);
                  console.log($scope.developmentArray);
                  $scope.loading = false;
                }
                  
              });
          }
        });

      //
      $scope.getTemplate = function(){
        return templates[$scope.report.category];
      };
      $scope.goTo = function(detailsLocation){
        $state.go('main.location.category.time.extent.filter.details', {'details' : 'map'});
      };
      
    }]//END report Directive Controller function
  };//END returned object
}]);//END report Directive function
app.controller('ExtentCtrl', ['$scope', '$stateParams', '$state', 'Extent', 
	function ($scope, $stateParams, $state, Extent) {
    if($stateParams.extent === 'location' || $stateParams.extent === 'neighborhood'){
		$scope.show = false;
	}else{
		$scope.show = true;
		
		$scope.extentOptions = Extent.options();

		for (var i = 0; i < $scope.extentOptions.length; i++) {
			if($scope.extentOptions[i].value === $stateParams.extent){
				$scope.defaultOption = i;
			}
		}
	}
	$scope.onChangeExtentValue = function(){
		$state.go('main.location.category.time.extent.filter.details', {extent : $scope.extentValue.value});
	};
}]);
app.factory('Extent', [function(){

    //****Create the factory object****//
    var Extent = {};

    // {'value' : 'within-a-half-mile', 'label' : 'Within a half mile'},
    //   {'value' : 'within-a-mile', 'label' : 'Within a mile'},
    //   {'value' : 'within-5-miles', 'label' : 'Within 5 miles'}

    var extentOptions = [
      {'value' : 'within-an-eighth-of-a-mile', 'label' : 'Within an eighth of a mile'},
      {'value' : 'within-a-quarter-mile', 'label' : 'Within a quarter mile'}   
    ];
  

    //****API*****//
    Extent.options = function(newExtentOptions){
      if(newExtentOptions !== undefined){
        extentOptions = newExtentOptions;
      }else{
        return extentOptions;
      }
    };
    


    //****Return the factory object****//
    return Extent; 

    
}]); //END Extent factory function
app.controller('FilterCtrl', ['$scope', '$stateParams', '$state', 'Filter', function ($scope, $stateParams, $state, Filter) {
  	$scope.filterOptions = Filter.options($stateParams.category);
	for (var i = 0; i < $scope.filterOptions.length; i++) {
		if($scope.filterOptions[i].value === $stateParams.filter){
			console.log($scope.filterOptions[i].value );
			$scope.defaultOption = i;
		}
	}
		
    if($stateParams.filter === 'summary'){
    	$scope.show = false;
	}else{
		$scope.show = true;
	}

	
	$scope.onChangeFilterValue = function(){
		$state.go('main.location.category.time.extent.filter.details', {filter : $scope.filterValue.value});
	};


}]);
app.factory('Filter', [function(){

    //****Create the factory object****//
    var Filter = {};

    //****Private variables*****//
    
    //Should get these for the properties of the if it has a property it is filterable
    var propertyFilterOptions = [
      {'value' : 'summary', 'label' : 'Property Summary'},
      {'value' : 'zoning', 'label' : 'Zoning'},
      {'value' : 'owner', 'label' : 'Owner'},
      {'value' : 'deed', 'label' : 'Deed'},
      {'value' : 'garbage', 'label' : 'Garbage Collection'},
      {'value' : 'recycling', 'label' : 'Recycling'},
      {'value' : 'leaf', 'label' : 'Leaf & Brush Collection'}
    ];

    var crimeFilterOptions = [
      {'value' : 'summary', 'label' : 'Crime Summary'},
      {'value' : 'aggravated-assault', 'label' : 'Aggravated Assaults'},
      {'value' : 'rape', 'label' : 'Rapes'},
      {'value' : 'vandalism', 'label' : 'Vandalism'},
      {'value' : 'larceny', 'label' : 'Larcenies'},
      {'value' : 'larceny-auto', 'label' : 'Larcenies (Auto)'},
    ];

    var developmentFilterOptions = [
      {'value' : 'summary', 'label' : 'Development Summary'},
    ];

    var filterOptions = {
      'crime' : crimeFilterOptions,
      'property' : propertyFilterOptions,
      'development' : developmentFilterOptions
    };

    Filter.updateOptions = function(newFilterOptions, categeory){
        filterOptions[categeory] = newFilterOptions;
    };
    


    //****API*****//
    Filter.options = function(categeory){
      return filterOptions[categeory];
    };
    


    //****Return the factory object****//
    return Filter; 

    
}]); //END Filter factory function
/*
  Leaflet.AwesomeMarkers, a plugin that adds colorful iconic markers for Leaflet, based on the Font Awesome icons
  (c) 2012-2013, Lennard Voogdt

  http://leafletjs.com
  https://github.com/lvoogdt
*//*global L*/(function(e,t,n){"use strict";L.AwesomeMarkers={};L.AwesomeMarkers.version="2.0.1";L.AwesomeMarkers.Icon=L.Icon.extend({options:{iconSize:[35,45],iconAnchor:[17,42],popupAnchor:[1,-32],shadowAnchor:[10,12],shadowSize:[36,16],className:"awesome-marker",prefix:"glyphicon",spinClass:"fa-spin",icon:"home",markerColor:"blue",iconColor:"white"},initialize:function(e){e=L.Util.setOptions(this,e)},createIcon:function(){var e=t.createElement("div"),n=this.options;n.icon&&(e.innerHTML=this._createInner());n.bgPos&&(e.style.backgroundPosition=-n.bgPos.x+"px "+ -n.bgPos.y+"px");this._setIconStyles(e,"icon-"+n.markerColor);return e},_createInner:function(){var e,t="",n="",r="",i=this.options;i.icon.slice(0,i.prefix.length+1)===i.prefix+"-"?e=i.icon:e=i.prefix+"-"+i.icon;i.spin&&typeof i.spinClass=="string"&&(t=i.spinClass);i.iconColor&&(i.iconColor==="white"||i.iconColor==="black"?n="icon-"+i.iconColor:r="style='color: "+i.iconColor+"' ");return"<i "+r+"class='"+i.prefix+" "+e+" "+t+" "+n+"'></i>"},_setIconStyles:function(e,t){var n=this.options,r=L.point(n[t==="shadow"?"shadowSize":"iconSize"]),i;t==="shadow"?i=L.point(n.shadowAnchor||n.iconAnchor):i=L.point(n.iconAnchor);!i&&r&&(i=r.divideBy(2,!0));e.className="awesome-marker-"+t+" "+n.className;if(i){e.style.marginLeft=-i.x+"px";e.style.marginTop=-i.y+"px"}if(r){e.style.width=r.x+"px";e.style.height=r.y+"px"}},createShadow:function(){var e=t.createElement("div");this._setIconStyles(e,"shadow");return e}});L.AwesomeMarkers.icon=function(e){return new L.AwesomeMarkers.Icon(e)}})(this,document);
(function(module) {
try {
  module = angular.module('simplicity');
} catch (e) {
  module = angular.module('simplicity', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('category/category.html',
    '<div><div class="panel panel-default"><div class="panel-body"><h3>{{category.title}}</h3><div ng-if="category.hasForm" coa-form="category.form"></div><div ui-view=""></div></div></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('simplicity');
} catch (e) {
  module = angular.module('simplicity', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('details/details.html',
    '<div><div ng-if="stateParams.details === \'report\'" report="stateParams"></div><div ng-if="stateParams.details === \'map\'" map="stateParams"></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('simplicity');
} catch (e) {
  module = angular.module('simplicity', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('details/details.map.directive.html',
    '<div id="map" style="width : 100%; height : 400px"><div class="modal fade" id="pointDetailsModal"><div class="modal-dialog modal-sm"><div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button><h4 class="modal-title">{{pointDetails.offense}}</h4></div><div class="modal-body"><p>Address : {{pointDetails.address}}</p><p>Date : {{pointDetails.thedate|date}}</p><p>Case Number : {{pointDetails.casenumber}}</p></div></div></div></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('simplicity');
} catch (e) {
  module = angular.module('simplicity', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('details/details.report.directive.html',
    '<div ng-include="getTemplate();"></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('simplicity');
} catch (e) {
  module = angular.module('simplicity', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('extent/extent.html',
    '<div><div class="form-group" ng-show="show"><select class="form-control" id="extent" ng-init="extentValue = extentOptions[defaultOption]" ng-model="extentValue" ng-options="item.label for item in extentOptions" ng-change="onChangeExtentValue()" style="width : 100%"></select></div><div ui-view=""></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('simplicity');
} catch (e) {
  module = angular.module('simplicity', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('filter/filter.html',
    '<div><a ng-click="show = !show" ng-show="!show">Filter Results</a> <a ng-click="show = !show" ng-show="show">Remove Filter</a><div class="form-group" ng-show="show"><select class="form-control" id="filter" ng-init="filterValue = filterOptions[defaultOption]" ng-model="filterValue" ng-options="item.label for item in filterOptions" ng-change="onChangeFilterValue()" style="width : 100%"></select></div><div ui-view=""></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('simplicity');
} catch (e) {
  module = angular.module('simplicity', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('location/location.html',
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
  $templateCache.put('main/main.html',
    '<div class="col-md-6 col-md-offset-3"><br><div class="col-xs-12"><div class="col-xs-12"><div class="pull-left" ng-click="goHome();" ;="" style="cursor : pointer"><h1>SimpliCity</h1><h4>city data simplified</h4></div><img class="pull-right hidden-xs" style="margin-top: 5px" src="http://123graffitifree.com/images/citylogo-flatblack.png"> <img class="pull-right visible-xs" style="margin-top: 5px; height : 30px" src="http://123graffitifree.com/images/citylogo-flatblack.png"></div><div class="col-xs-12"><br></div><div class="col-xs-12"><input tabindex="1" type="text" autocomplete="on" class="form-control" placeholder="Enter a location" style="z-index: 0" ng-model="typedLocation" ng-keypress="getAddressCandidates(typedLocation, $event)"><div class="row col-xs-12"><p ng-show="errorMessage.show" class="text-danger">{{errorMessage.message}}</p><p ng-show="helperMessage.show" class="text-warning">{{helperMessage.message}}</p><div class="list-group" style="width : 100%; position : absolute; z-index : 1000; max-height : 230px; overflow-y: scroll"><a tabindex="{{$index+1}}" ng-click="getLocationProperties(candidate, $event)" ng-keypress="getLocationProperties(candidate, $event)" ng-repeat="candidate in addresses.candidates" class="list-group-item"><p class="text-info">{{candidate.attributes.House}} {{candidate.attributes.preType}} {{candidate.attributes.StreetName}} {{candidate.attributes.SufType}} {{candidate.attributes.SufDir}} <span ng-if="candidate.attributes.User_fld !== \'\'">UNIT: {{candidate.attributes.User_fld}}</span>, {{candidate.attributes.ZIP}}</p></a></div><p ng-show="errorMessage.show" class="text-danger">{{errorMessage.message}}</p></div></div><div class="col-xs-12"><br></div></div><div class="col-xs-12 content" style="height : 400px"><div ui-view="" class="slide"></div></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('simplicity');
} catch (e) {
  module = angular.module('simplicity', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('questions/questions.html',
    '<div class="col-xs-12"><div class="list-group"><a class="col-xs-12 list-group-item list-item-panel"><div class="col-xs-12 col-md-4"><address class="pull-left"><strong>{{locationProperties.address.attributes.House}} {{locationProperties.address.attributes.preType}} {{locationProperties.address.attributes.StreetName}} {{locationProperties.address.attributes.SufType}} {{locationProperties.address.attributes.SufDir}} <span ng-if="locationProperties.address.attributes.User_fld !== \'\'">UNIT: {{locationProperties.address.attributes.User_fld}}</span></strong><br><span ng-if="locationProperties.inTheCity">Asheville, NC</span> {{locationProperties.address.attributes.ZIP}}</address></div><div class="col-xs-12 col-md-8"><div ng-if="locationProperties.inTheCity" class="pull-right hidden-xs"><i class="fa fa-check-circle fa-2x text-success pull-left" style="margin-top : 10px"></i><h2 class="pull-left" style="margin-top : 7px">It\'s in the city!</h2></div><div ng-if="!locationProperties.inTheCity" class="pull-right hidden-xs"><i class="fa fa-times-circle fa-2x text-danger pull-left" style="margin-top : 10px"></i><h2 class="pull-left" style="margin-top : 7px">It\'s not in the city!</h2></div></div></a> <a ng-if="locationProperties.inTheCity" class="list-group-item list-item-panel visible-xs"><i class="fa fa-check-circle fa-2x text-success pull-left" style="margin-top : 10px"></i><h2 class="pull-left" style="margin-top : 7px">It\'s in the city!</h2></a> <a ng-if="!locationProperties.inTheCity" class="list-group-item list-item-panel visible-xs"><i class="fa fa-times-circle fa-2x text-danger pull-left" style="margin-top : 10px"></i><h2 class="pull-left" style="margin-top : 7px">It\'s not in the city!</h2></a> <a class="col-xs-12 list-group-item list-item-panel" ng-click="getAnswer(question)" ng-repeat="question in questions" tabindex="{{$index + 11}}"><h4>{{question.question}}<i class="fa fa-chevron-right pull-right text-primary" style="margin-top: 8px"></i></h4></a> <a class="col-xs-12 list-group-item list-item-panel" ng-show="more.show" ng-click="more.get()" tabindex="{{questions.length + 12}}"><h3 class="text-primary" style="text-align : center">More</h3></a></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('simplicity');
} catch (e) {
  module = angular.module('simplicity', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('time/time.html',
    '<div><div class="form-group" ng-show="show"><select class="form-control" id="time" ng-init="timeValue = timeOptions[defaultOption]" ng-model="timeValue" ng-options="item.label for item in timeOptions" ng-change="onChangeTimeValue()" style="width : 100%"></select></div><div ui-view=""></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('simplicity');
} catch (e) {
  module = angular.module('simplicity', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('details/reports/crime.report.html',
    '<div class="col-xs-12"><div class="col-xs-12" style="height : 100px; text-align : center" ng-show="loading"><i class="fa fa-5x fa-spinner fa-spin"></i></div><div class="col-xs-12" ng-show="!loading" ng-cloak=""><a class="pull-right" ng-click="goTo(map);">View on Map</a><div class="col-xs-12 list-item-panel"><table class="table"><thead><tr><th>Crime Type</th><th>Count</th></tr></thead><tbody><tr ng-repeat="(key, value) in crimeSummary"><td>{{key}}</td><td>{{value}}</td></tr></tbody></table></div></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('simplicity');
} catch (e) {
  module = angular.module('simplicity', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('details/reports/development.report.html',
    '<div class="col-xs-12"><div class="col-xs-12" style="height : 100px; text-align : center" ng-show="loading"><i class="fa fa-5x fa-spinner fa-spin"></i></div><div class="col-xs-12" ng-if="!isEmpty" ng-show="!loading" ng-cloak=""><a class="pull-right" ng-click="goTo(map);">View on Map</a><div class="col-xs-12 list-item-panel"><table class="table"><thead><tr><th>Development Type</th><th>Count</th></tr></thead><tbody><tr ng-repeat="(key, value) in developmentSummary"><td><strong>{{key}}:</strong>{{developmentExplanations[key]}}</td><td>{{value}}</td></tr></tbody></table></div></div><div class="col-xs-12" ng-if="developmentArray.length !== 0" ng-show="!loading" ng-cloak=""><a class="pull-right" ng-click="goTo(map);">View on Map</a><div class="col-xs-12 list-item-panel" ng-repeat="item in developmentArray"><h5 class="text-center">{{item.attributes.address}}</h5><div class="col-xs-12"><div class="col-xs-12 col-md-4"><strong>Opened</strong><p>{{item.attributes.date_opened|date}}</p></div><div class="col-xs-12 col-md-4"><strong>Updated</strong><p>{{item.attributes.date_statused|date}}</p></div><div class="col-xs-12 col-md-4"><strong>Status</strong><p>{{item.attributes.record_status}}</p></div></div><div class="col-xs-12"><p><strong>Description:</strong>{{item.attributes.description}}</p></div><div ng-init="showMore = false" ng-show="showMore"><div class="col-xs-12"><div class="pull-left"><strong>Record Id</strong><p>{{item.attributes.record_id}}</p></div><div class="pull-right"><strong>License Number</strong><p>{{item.attributes.license_number}}</p></div></div><div class="col-xs-12"><div class="pull-left"><strong>Record Name</strong><p>{{item.attributes.record_name}}</p></div><div class="pull-right"><strong>Business Name</strong><p>{{item.attributes.business_name}}</p></div></div><div ng-init="showComments = false" ng-show="showComments"><strong>Comments</strong><p>{{item.attributes.record_comments}}</p></div><a ng-click="showComments = !showComments"><p class="text-center" ng-if="!showComments">Show Comments</p><p class="text-center" ng-if="showComments">Hide Comments</p></a></div><a ng-click="showMore = !showMore"><p class="text-center" ng-if="!showMore">Show More</p><p class="text-center" ng-if="showMore">Show Less</p></a></div></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('simplicity');
} catch (e) {
  module = angular.module('simplicity', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('details/reports/property.report.html',
    '<div><a class="pull-right" ng-click="goTo(map);">View on Map</a><div class="list-item-panel col-xs-12" style="padding : 10px"><div class="col-xs-12 list-item-panel"><div class="col-xs-12 col-md-6"><address style="margin-bottom: 5px"><strong>{{locationProperties.address.attributes.House}} {{locationProperties.address.attributes.preType}} {{locationProperties.address.attributes.StreetName}} {{locationProperties.address.attributes.SufType}} {{locationProperties.address.attributes.SufDir}} <span ng-if="locationProperties.address.attributes.User_fld !== \'\'">UNIT: {{locationProperties.address.attributes.User_fld}}</span></strong><br><span ng-if="locationProperties.inTheCity">Asheville, NC</span> {{locationProperties.address.attributes.ZIP}}</address><h5>PIN : <span>{{propertyDetails.attributes.pinnum}}</span></h5></div><div class="col-xs-12 col-md-6"><div ng-if="propertyDetails.attributes.isincity === \'Yes\'" class="pull-left"><i class="fa fa-check-circle fa-2x text-success pull-left" style="margin-top : 4px"></i><h4 class="pull-left" style="margin-top : 7px">It\'s in the city!</h4></div><div ng-if="propertyDetails.attributes.isincity === \'No\'" class="pull-left"><i class="fa fa-times-circle fa-2x text-danger pull-left" style="margin-top : 4px"></i><h4 class="pull-left" style="margin-top : 7px">It\'s not in the city!</h4></div><div ng-if="propertyDetails.attributes.iscityowned === \'Yes\'" class="pull-left"><i class="fa fa-check-circle fa-2x text-success pull-left" style="margin-top : 4px"></i><h4 class="pull-left" style="margin-top : 7px">It\'s city owned!</h4></div><div ng-if="propertyDetails.attributes.iscityowned === \'No\'" class="pull-left"><i class="fa fa-times-circle fa-2x text-danger pull-left" style="margin-top : 4px"></i><h4 class="pull-left" style="margin-top : 7px">It\'s not city owned!</h4></div></div></div><div class="col-xs-12 col-md-6 list-item-panel pull-left"><h4>Owner</h4><strong>{{propertyDetails.attributes.owner}}</strong><address>{{propertyDetails.attributes.owner_address}}<br>{{propertyDetails.attributes.owner_citystatezip}}</address></div><div class="col-xs-12 col-md-5 list-item-panel pull-right"><h4>Tax Details</h4><p ng-if="propertyDetails.attributes.exempt === null">Tax exempt : <span class="text-danger">NO</span></p><p ng-if="propertyDetails.attributes.exempt !== null">Tax exempt : <span class="text-success">YES</span></p><p ng-if="propertyDetails.attributes.improved === \'Y\'">Improved : <span class="text-success">YES (${{propertyDetails.attributes.improvementvalue|number}})</span></p><p>Appraisal Area : {{propertyDetails.attributes.appraisalarea}}</p></div><div class="col-xs-12 list-item-panel"><h4>Property and Tax Value</h4><table class="table "><thead><tr><th>Value Type</th><th>Amount</th></tr></thead><tbody><tr><td>Building Value</td><td>${{propertyDetails.attributes.buildingvalue|number}}</td></tr><tr><td>Land Value</td><td>${{propertyDetails.attributes.landvalue|number}}</td></tr><tr><td>Appraised Value</td><td>${{propertyDetails.attributes.appraisedvalue|number}}</td></tr><tr><td>Tax Value</td><td>${{propertyDetails.attributes.taxvalue|number}}</td></tr><tr><td>Total Market Value</td><td>${{propertyDetails.attributes.totalmarketvalue|number}}</td></tr></tbody></table></div><div class="col-xs-12 list-item-panel"><br><a class="col-xs-12 col-md-3" style="text-align : center; margin-bottom : 10px" target="_blank" href="{{propertyDetails.attributes.deed_url}}">Deed</a> <a class="col-xs-12 col-md-3" style="text-align : center; margin-bottom : 10px" target="_blank" href="{{propertyDetails.attributes.plat_url}}">Plat</a> <a class="col-xs-12 col-md-4" style="text-align : center; margin-bottom : 10px" target="_blank" href="{{propertyDetails.attributes.propcard_url}}">Property Card</a><br></div></div></div>');
}]);
})();

//template is defined inline in app.config.js
app.controller('LocationCtrl', [function () {
	//Doesn't do anything
}]);
			

app.factory('LocationProperties', ['$http', '$location', '$q', '$filter', '$state', '$stateParams', 'ArcGisServer',
  function($http, $location, $q, $filter, $state, $stateParams, ArcGisServer){

    //****Create the factory object****//
  	var LocationProperties = {};

    //****Private variables*****//
  	var properties = {};

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
            if(dataCacheResults.features[i].attributes.type === 'ADDRESS IN CITY'){
              properties.inTheCity = (dataCacheResults.features[i].attributes.data === 'YES')? true : false;
            }else if(dataCacheResults.features[i].attributes.type === 'CRIME'){
              if(dataCacheResults.features[i].attributes.data === null){
                properties.crime = [];
              }else{
                properties.crime = dataCacheResults.features[i].attributes.data.split(',');
              }
            }else if(dataCacheResults.features[i].attributes.type === 'ZONING'){
              if(dataCacheResults.features[i].attributes.data === null){
                properties.zoning = [];
              }else{
                properties.zoning = dataCacheResults.features[i].attributes.data.split(',');
              }
            }else if(dataCacheResults.features[i].attributes.type === 'DEVELOPMENT'){
              if(dataCacheResults.features[i].attributes.data === null){
                properties.development = [];
              }else{
                properties.development = dataCacheResults.features[i].attributes.data.split(',');
              }
            }else{
              //Do nothing
            }
          }
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
app.controller('MainCtrl', ['$scope', '$state', '$location', '$http', '$timeout', 'ArcGisServer', 'LocationProperties',
  function ($scope, $state, $location, $http, $timeout, ArcGisServer, LocationProperties) {
    
    //***TODO: Get address canidates as user enters an address***//
    $scope.typedLocation = '';
    $scope.addresses = [];
    $scope.errorMessage = {
      show : false,
      message : 'We had trouble locating that location. Please try to enter a location again.'
    };
    $scope.helperMessage = {
      show : false,
      message : 'Please choose one of the options below.'
    };

    
    $scope.getAddressCandidates = function(enteredLocation, event){
      if(event.keyCode === 13 && enteredLocation !== ''){
        $scope.helperMessage.show = true;
        $timeout(function() {
          $scope.helperMessage.show = false;
        }, 2000);
      }
      ArcGisServer.geocodeService.findAddressCandidates(enteredLocation, '*')
        .then(function(data){
          $scope.addresses = data;
        });
    };

    $scope.getLocationProperties = function(location, event){
        $scope.addresses = []; 
        $scope.typedLocation = '';
        LocationProperties.properties(location)
          .then(function(){
            $state.go('main.location.questions', {location : location.attributes.Ref_ID});
          });
    };

    $scope.goHome = function(){
    	$location.path('');
    };

}]);

app.controller('QuestionsCtrl', ['$scope','$state','Category', 'Questions', 'LocationProperties', 
    function ($scope, $state, Category, Questions, LocationProperties) {

    LocationProperties.properties()
        .then(function(properties){
           $scope.locationProperties = properties;
        });

    //Get a list of questions for the current location
    //****This could be an HTTP request****//
    var questions = Questions.get();

    //Get the top 2 questions
    $scope.questions = questions.slice(0,2);

    $scope.more = {
        show : true,
        get : function(){
            var currentQuestionCount = $scope.questions.length;
            var numberOfQuestionsToAdd = 3;
            //check to make sure that we have at least questions left
            //if not just add what we have left
            if((questions.length - currentQuestionCount)< 3){
                numberOfQuestionsToAdd = questions.length - currentQuestionCount;
            }
            //add questions to the current list of questions
            var newQuestionCount = currentQuestionCount + numberOfQuestionsToAdd;
            //*******This could be an HTTP request*******//
            $scope.questions = questions.slice(0, newQuestionCount);

            //if there aren't any more question, don't show the more option
            if(newQuestionCount === questions.length){
                this.show = false;
            }
        }

    };

    //if there are only 2 questions intiall, don't show the more option
    if($scope.questions === questions.length){
        $scope.more.show = false;
    }

    //if active, call on left arrow key press also
    $scope.getAnswer = function(question){
        $state.go('main.location.category', {'category': question.category});
    };


    //List should be tabbable 
    
}]);

app.factory('Questions', [function(){

    //****Create the factory object****//
    var Questions = {}; 

    //****Private Variables*****//

    var caiQuestions = [
      {'question' : 'Do you want to know about crime?', 'category' : 'crime', 'detail' : 'within-quarter-mile'},
      {'question' : 'Do you want to know about this property?', 'category' : 'property', 'detail' : 'summary'},
      {'question' : 'Do you want to know about development?', 'category' : 'development', 'detail' : 'summary'},
      {'question' : 'Do you want to know about the owner?', 'category' : 'property', 'detail' : 'owner'},
      {'question' : 'Do you want to know about the zoning?', 'category' : 'property', 'detail' : 'zoning'},
      {'question' : 'Do you want to know about the trash collection?', 'category' : 'property', 'detail' : 'trash'},
    ];

    var neighborhoodQuestions = [
      {'question' : 'Do you want to know about crime?', 'category' : 'crime', 'detail' : 'quarter-mile'},
      {'question' : 'Do you want to know about development?', 'category' : 'development', 'detail' : 'summary'},
    ];

    //****API*****//
    

    Questions.get = function(){
      return caiQuestions
    };

    //****Return the factory object****//
    return Questions; 

}]); //END Questions factory function
app.controller('TimeCtrl', ['$scope', '$stateParams', '$state', 'Time', 
	function ($scope, $stateParams, $state, Time) {
	
	if($stateParams.time === 'current'){
		$scope.show = false;
	}else{
		$scope.show = true;
		$scope.timeOptions = Time.options();
		for (var i = 0; i < $scope.timeOptions.length; i++) {
			if($scope.timeOptions[i].value === $stateParams.time){
				$scope.defaultOption = i;
			}
		}
	}
	$scope.onChangeTimeValue = function(){
		$state.go('main.location.category.time.extent.filter.details', {time : $scope.timeValue.value});
	};


	
}]);
app.factory('Time', [function(){

    //****Create the factory object****//
    var Time = {};

    var d = new Date();


    var timeFilterValues = {
      'last-30-days' : d.setMonth(d.getMonth() - 1),
      'last-6-months' : d.setMonth(d.getMonth() - 6),
      'last-year' : d.setFullYear(d.getFullYear()-1),
      'last-5-years': d.setFullYear(d.getFullYear()-5),
      'last-10-years': d.setFullYear(d.getFullYear()-10),
      'all-time' : d.setFullYear(d.getFullYear()-100)
    }

    //****Private variables*****//
    var timeOptions = [
      {'value' : 'last-30-days', 'label' : 'During the last 30 days'},
      {'value' : 'last-6-months', 'label' : 'During the last 6 months'},
      {'value' : 'last-year', 'label' : 'During the last year'},
      {'value' : 'last-5-years', 'label' : 'During the last 5 years'},
      {'value' : 'last-10-years', 'label' : 'During the last 10 years'},
      {'value' : 'all-time', 'label' : 'All time'}
    ];
  

    //****API*****//
    Time.options = function(newTimeOptions){
      if(newTimeOptions !== undefined){
        timeOptions = newTimeOptions;
      }else{
        return timeOptions;
      }
    };

    Time.filterValue = function(timeOptionValue){
      return timeFilterValues[timeOptionValue];
    };
  

    //****Return the factory object****//
    return Time; 

    
}]); //END Time factory function