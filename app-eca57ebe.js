'use strict';

//instatiate an AngularJS module and inject an dependancy modules
var app = angular.module('simplicity', ['ui.router', 'ngAnimate']);
 
//Configure application states and routes
app.config(["$stateProvider", "$urlRouterProvider", "$httpProvider", function ($stateProvider, $urlRouterProvider, $httpProvider) {
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
  }]);//END config


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

app.factory('LayerDefintion', ['$http', '$location', '$q', '$filter', '$state', '$stateParams',
  function($http, $location, $q, $filter, $state, $stateParams){

    //****Create the factory object****//
  	var LayerDefintion = {};

    //var colors = ['0F2859','9DBF21','DB770F','63038C','387352','EDFFA5','A25EBF','4E7329','004D73','652975','F2E96B','2D5D75','75210B','537324','A006FF','FF7400','817B7E','F25E3D','F2913D','6EFF63','8C3503','CFD3FF','F2A2FF','FFAA80','FFBF00','4D5973','021E73','057358','FFF700','30588C'];
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

    // var colors = {
    //   'crime' : {
    //     'Aggrevated Assault' : '0F2859',
    //     'Burglary' : 'F2E96B',
    //     'Drug Arrest' : '8C3503',
    //     'Homicide' : 'FFBF00',
    //     'Larceny' : '4D5973',
    //     'Larceny of Motor Vehicle' : '817B7E',
    //     'Rape' : 'F25E3D',
    //     'Robbery' : 'F2913D',
    //     'Vandalism' : '30588C'
    //   },
    //   'permits' : {
    //     'permits' : {
    //       'commercial-building' : {
    //         'Com: Accessory Structure':'0F2859',
    //         'Com: Addition':'652975',
    //         'Com: Annual Maint.':'F2E96B',
    //         'Com: Cold Shell':'2D5D75',
    //         'Com: Demo':'75210B',
    //         'Com: Electrical':'537324',
    //         'Com: Emergency Repairs':'DB770F',
    //         'Com: Gas Piping':'A006FF',
    //         'Com: Mechanical':'FF7400',
    //         'Com: Multi-Trade':'817B7E',
    //         'Com: Other New':'F25E3D',
    //         'Com: Plumbing':'004D73',
    //         'Com: Remodel':'30588C',
    //         'Com: Reroof':'EDFFA5',
    //         'Com: Site Work':'FFAA80',
    //         'Com: Upfit':'FFBF00',
    //         'Com: Warm Shell':'F2A2FF',
    //       },
    //       'residential-building' : {
    //         'Res: Accessory Structure':'0F2859',
    //         'Res: Addition':'652975',
    //         'Res: Change Out':'F2E96B',
    //         'Res: Demolition':'2D5D75',
    //         'Res: Electrical':'75210B',
    //         'Res: Emergency Repairs':'537324',
    //         'Res: Gas Piping':'DB770F',
    //         'Res: Home Occupation':'A006FF',
    //         'Res: Mechanical':'817B7E',
    //         'Res: Mfg. Home':'F2913D',
    //         'Res: Multi-Trade':'004D73',
    //         'Res: New':'30588C',
    //         'Res: Plumbing':'CFD3FF',
    //         'Res: Remodel':'FFAA80',
    //         'Res: Reroof':'4D5973',
    //         'Res: Site Work':'F2A2FF'
    //       },
    //       'fire' : {
    //         'Fire Alarm':'0F2859',
    //         'Fire: Comp. Gas':'652975',
    //         'Fire: Constr. Other':'F2E96B',
    //         'Fire: Hood Sys.':'F2E96B',
    //         'Fire: Occupational':'2D5D75',
    //         'Fire: Operational':'75210B',
    //         'Fire Prevention':'DB770F'
    //       },
    //       'other' : {
    //         'ABC':'0F2859',
    //         'A-Frame Sign':'652975',
    //         'Construction Trailer':'F2E96B',
    //         'Event-Temporary Use':'2D5D75',
    //         'Exhaust Hood':'75210B',    
    //         'Flood':'537324',
    //         'Foster Care':'DB770F',
    //         'Occupancy':'A006FF',
    //         'Outdoor Dining':'FF7400',
    //         'Outdoor Merchandise':'817B7E',
    //         'Permits - Historical':'F25E3D',
    //         'Permits - Histroical':'F2913D',
    //         'Permits/Over The Counter/Temp Utilities/NA':'004D73',
    //         'Push Cart':'30588C',
    //         'Refrigeration':'63038C',
    //         'ROW: Encroachment':'387352',
    //         'ROW: Street-Sidewalk Cuts':'EDFFA5',
    //         'Sprinkler Sys.':'8C3503',
    //         'Stand Alone Sign':'CFD3FF',
    //         'TCO':'F2A2FF',
    //         'Temp Utilities':'FFAA80',
    //         'Water Extension':'FFBF00',
    //         'Work After Hours':'4D5973'
    //       }
    //     },
    //     'planning' : {
    //       'Alternative Compliance':'0F2859',
    //       'Conditional Use Permit':'652975',
    //       'Conditional Zoning Permit':'F2E96B',
    //       'Flexible Development':'2D5D75',
    //       'Lot Research':'75210B',
    //       'Major Subdivision':'537324',
    //       'Major Work':'DB770F',
    //       'Map Amendments':'A006FF',
    //       'Minor Subdivision':'FF7400',
    //       'Minor Work':'817B7E',
    //       'Planning - Historical':'F25E3D',
    //       'Planning Level I':'F2913D',
    //       'Planning Level II':'30588C',
    //       'Planning Level III':'63038C',
    //       'Planning/Non Development/Alternative Compliance/NA':'387352',
    //       'Planning Signage Plan':'EDFFA5',
    //       'Research Use or Structure':'6EFF63',
    //       'Research Zoning Letters':'8C3503',
    //       'Rezoning':'CFD3FF',
    //       'SCV Level I':'F2A2FF',
    //       'SCV Level II':'FFAA80',
    //       'SCV Level III':'FFBF00',
    //       'Subdivision Alternative Access':'4D5973',
    //       'Subdivision Modification':'021E73',
    //       'Subdivision Recombination':'A25EBF',
    //       'Text Amendments':'4E7329',
    //       'Variance Appeal':'004D73',
    //       'Variance Flood':'057358',
    //       'Variance Sign':'FFF700',
    //       'Variance Zoning':'9DBF21'
    //     },
    //     'services' : {
    //       'Building Enforcement':'9DBF21',
    //       'CE: Open Program':'FFF700',
    //       'Electrical Journeyman':'004D73',
    //       'Fire Enforcement':'4E7329',
    //       'Project Inquiry':'A25EBF',
    //       'Services - Historical':'021E73',
    //       'Stormwater Enforcement':'4D5973',
    //       'Zoning Enforcement':'FFBF00'
    //     }
    //   }
    // };

    var layerDefinitions = {
      'development' : {
        'layer' : 'coagis.gisowner.coa_opendata_permits',
        'type' : 'layer',
        'time' : 'date_opened',
        'filter' : 'record_type',
        'colors' : colors.development
      },
      'commercial-building' : {
        'layer' : 'coagis.gisowner.coa_opendata_permits',
        'type' : 'layer',
        'time' : 'thedate',
        'filter' : 'record_type',
        'colors' : colors
      },
      'crime' : {
        'layer' : 'coagis.gisowner.coa_opendata_crime',
        'type' : 'layer',
        'time' : 'thedate',
        'filter' : 'offense',
        'colors' : colors.crime
      },
      'property' : {
        'codelinks' : {
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
        }    
      }
    };
    LayerDefintion.colors = function(){
      return colors
    };

    LayerDefintion.get = function(property){
      return layerDefinitions[$stateParams.category][property]
    };

    //****Return the factory object****//
    return LayerDefintion; 

    
}]); //END LayerDefintion factory function
//Keep a scope variable of the current address to share across all 
app.controller('CategoryCtrl', ['$scope', '$stateParams', '$state', 'Category', 'LocationProperties',
	function ($scope, $stateParams, $state, Category, LocationProperties) {

	//***TODO: Get category definition via HTTP ***//
    $scope.category = Category.getDefinition($stateParams.category);
    LocationProperties.properties()
        .then(function(properties){
        	$scope.locationProperties = properties;
        });
    if($stateParams.time === undefined){
        //$state.go('main.location.category.time.extent.filter.details', $scope.category.defaultStates);  
    }
    
    $scope.goBack = function(){
        $state.go('main.location.questions');
      };  
}]);


app.factory('Category', ['$http', '$location', '$q', '$filter',
  function($http, $location, $q, $filter){

    //****Create the factory object****//
    var Category = {};

    
    //****Private variables*****//
    var caiCrimeDefinition = {
      title : 'Crime',
      defaultStates : {
        'category' : 'crime',
        'time' : 'last-year',
        'extent' : 'within-an-eighth-of-a-mile',
        'filter' : 'summary',
        'details' : 'report'
      }
    };

    var propertyDefinition = {
      title : 'Property',
      defaultStates : {
        'category' : 'property',
        'time' : 'current',
        'extent' : 'location',
        'filter' : 'summary',
        'details' : 'report'
      }
    };

    var sanitationDefinition = {
      title : 'Sanitation',
      defaultStates : {
        'category' : 'sanitation',
        'time' : 'current',
        'extent' : 'location',
        'filter' : 'summary',
        'details' : 'report'
      }
    };

    var developmentDefinition = {
      title : 'Development',
      defaultStates : {
        'category' : 'development',
        'time' : 'last-year',
        'extent' : 'within-an-eighth-of-a-mile',
        'filter' : 'summary',
        'details' : 'report'
      }
    };

    var permitsDefinition = {
      title : 'Permits',
      defaultStates : {
        'category' : 'permits',
        'time' : 'last-year',
        'extent' : 'location',
        'filter' : 'summary',
        'details' : 'report'
      }
    };

    var neighborhoodCrimeDefinition = {
      'showTimeOptions' : true,
      'defaultTimeOption' : 2,
      'showExtentOptions' : false,
      'defaultExtentOption' : 'neighborhood',
      'showFilterOptions' : false,
      'defaultFilterOption' : 'summary'
    };



    var categoryDefinitions = {
      'cai' : {
        'crime' : caiCrimeDefinition,
        'property' : propertyDefinition,
        'development' : developmentDefinition,
        'permits' : permitsDefinition,
        'sanitation' : sanitationDefinition
      },
      'neighborhood' : {
        'crime' : neighborhoodCrimeDefinition
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

app.factory('Details', ['$http', '$location', '$q', '$filter', '$stateParams', 'ArcGisServer', 'LayerDefintion','LocationProperties', 'Time', 'Extent', 'Filter',
  function($http, $location, $q, $filter, $stateParams, ArcGisServer, LayerDefintion, LocationProperties, Time, Extent, Filter){

    //****Create the factory object****//
    var Details = {};

    var detailsCache = {};

    var buildWhereClause = function(arrayOfIds){
      if($stateParams.category === 'property'){

      }else if($stateParams.category === 'crime'){
        return 'pid in (' + arrayOfIds + ')'
      }else if($stateParams.category === 'development'){
        var stringOfDevelopmentIds = '';
        for (var i = 0; i < arrayOfIds.length; i++) {
          if(i === 0){
            stringOfDevelopmentIds = stringOfDevelopmentIds + "'" + arrayOfIds[i] + "'";
          }else{
            stringOfDevelopmentIds = stringOfDevelopmentIds + ",'" + arrayOfIds[i] + "'";
          }         
        }
        return "apn in (" + stringOfDevelopmentIds + ") and record_module = 'Planning' and record_type_type = 'Development'";
      }

    };

    var getFeaturesFromAnArrayOfLayerIds = function(arrayOfIds){
      var q = $q.defer();
      var layerId = ArcGisServer.featureService.getId(LayerDefintion.get('layer'), LayerDefintion.get('type'));
      var where = buildWhereClause(arrayOfIds);
      //Need to put  quotes on everything
      var queryParams = {
        'where' : where,
        'f' : 'json',
        'outFields' : '*'
      };
      ArcGisServer.featureService.query(layerId, queryParams)
        .then(function(features){
          
          //this is being assigned wrong
          detailsCache[$stateParams.location] = features;
          q.resolve(features);
        });
      return q.promise;
    };

    var getCurrentRecyclingWeek = function(){
      var d = new Date(); // current time 
      var t = d.getTime() - (1000*60*60*24*3); // milliseconds since Jan 4 1970 Sunday
      var w = Math.floor(t / (1000*60*60*24*7)); // weeks since Jan 4 1970  
      var o = w % 2; // equals 0 for even (B weeks) numbered weeks, 1 for odd numbered weeks 
      if(o == 0){
        return 'B'
      }else{ // do your odd numbered week stuff 
        return 'A'
      }
    }

    Details.getRecyclingSchedule = function(recyclingString){
      var recyclingArray = recyclingString.split(' ');
      var currentRecyclingWeek = getCurrentRecyclingWeek();
      if(recyclingArray[3] === 'A)'){
        if(getCurrentRecyclingWeek() === 'A'){
          return {'week' : 'A', 'when' : 'this week'};
        }else{
          return {'week' : 'A', 'when' : 'next week'};
        }
      }else{
        if(getCurrentRecyclingWeek() === 'B'){
          return {'week' : 'B', 'when' : 'this week'};
        }else{
          return {'week' : 'B', 'when' : 'next week'};
        }
      }
    };

    Details.getBrushSchedule = function(recyclingSchedule, trashDay){
      if(trashDay === 'MONDAY' || trashDay === 'TUESDAY'){
        if(recyclingSchedule.week === 'B' && recyclingSchedule.when === 'this week'){
          return {'when' : 'this week'};
        }else{
          return {'when' : 'next week'};
        }
      }else{
        if(recyclingSchedule.week === 'A' && recyclingSchedule.when === 'this week'){
          return {'when' : 'this week'};
        }else{
          return {'when' : 'next week'};
        }
      }
    }

    Details.getPropertyDetails = function(civicAddressId){
      var q = $q.defer();
      //We need to cross-reference the civic address id to get the PIN(to look up the property)
      var crossRefTableId = ArcGisServer.featureService.getId('coagis.gisowner.coa_civicaddress_pinnum_centerline_xref_view', 'table');
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
              propertyDetails.features[0].attributes.codelinks = LayerDefintion.get('codelinks');
              q.resolve(propertyDetails.features[0]);
            });
        });
      return q.promise;
    };

    Details.getZoningOverlays = function(zoningOverlays){
      var zoningOverlaysSplit = zoningOverlays.split('-');
      var q = $q.defer();
      var zoningLayerId = ArcGisServer.featureService.getId('coagis.gisowner.coa_opendata_zoning_overlays', 'layer');
      var queryParams = {
        'where' : "name='" + zoningOverlaysSplit[0] + "'",
        'f' : 'json',
        'outFields' : '*'
      };
      ArcGisServer.featureService.query(zoningLayerId, queryParams)
            .then(function(zoningOverlayLayer){
              q.resolve(zoningOverlayLayer.features[0]);
            });

      return q.promise;
    };

    Details.getFilteredDetails = function(){
      //Use promises to handle the request asynchronously; defer till resolved
      var q = $q.defer();

      var category = $stateParams.category;
      //Get Location Properties
      LocationProperties.properties()
        .then(function(properties){
          //Get the features based on the category and the extent 
          getFeaturesFromAnArrayOfLayerIds(properties[category][Extent.filterValue()])
            .then(function(features){
              //Values to filter time and filter by
              var time = LayerDefintion.get('time');
              var filter = LayerDefintion.get('filter');
              var colors = LayerDefintion.get('colors');


              //object that holds a summary of the feature {filterValue : count}
              //e.g. for crime {'Bulgary' : 12, 'Larceny' : 2}
              var filteredFeaturesSummary= {
                'template' : 'summary',
                'table' : {}
              };
              //array that holds features filtered by time and the filter value
              var filterdFeaturesArray = [];
  
              for (var i = 0; i < features.features.length; i++) {
                //filter by time
                if(features.features[i].attributes[time] >= Time.filterValue()){
                  //filter by filter
                  features.features[i].attributes.color = colors[features.features[i].attributes[filter]];          
                  //build a summary object
                  if(filteredFeaturesSummary.table[features.features[i].attributes[filter]] === undefined){

                    filteredFeaturesSummary.table[features.features[i].attributes[filter]] = {'color' : colors[features.features[i].attributes[filter]], 'count' : 1 };

                  }else{
                    filteredFeaturesSummary.table[features.features[i].attributes[filter]].count = filteredFeaturesSummary.table[features.features[i].attributes[filter]].count + 1;
                  }
                  //add filtered features to array
                  if($stateParams.filter === 'summary' || features.features[i].attributes[filter].toLowerCase().replace(/ /g, '-') === $stateParams.filter){
                    features.features[i].template = $stateParams.category;
                    
                    if(features.features[i].attributes.record_comments){
                      features.features[i].attributes.commentsArray = features.features[i].attributes.record_comments.split('[NEXTCOMMENT]');
                    }
                    filterdFeaturesArray.push(features.features[i]);
                  }
                  
                }
              };

              //Update filter options based on filter summary
              var filterOptions = [];
              filterOptions.push({'value' : 'summary', 'label' : 'Summary'});
              for (var key in filteredFeaturesSummary.table) {
                filterOptions.push({'value' : key.toLowerCase().replace(/ /g, '-'), 'label' : key});
              }
              Filter.options($stateParams.category, filterOptions);
              var filteredDetails = {
                'features' : filterdFeaturesArray,
                'summary' : filteredFeaturesSummary
              };
              q.resolve(filteredDetails);
            })//END getFeaturesFromAnArrayOfLayerIds Callback
        })//END LocationProperties Callback
      return q.promise;
    };


    //****Return the factory object****//
    return Details; 

    
}]); //END Details factory function
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
app.factory('Extent', ['$stateParams', function($stateParams){

    //****Create the factory object****//
    var Extent = {};

    var extentFilterValues = {
      'within-about-a-block' : 330,
      'within-an-eighth-of-a-mile' : 660,
      'within-a-quarter-mile' : 1320,
    };

    var extentOptions = [
      {'value' : 'within-about-a-block', 'label' : 'within a city block (110 yards)'},
      {'value' : 'within-an-eighth-of-a-mile', 'label' : 'within a couple city blocks (1/8 of a mile)'},
      {'value' : 'within-a-quarter-mile', 'label' : 'within a quarter mile'}   
    ];
  

    //****API*****//
    Extent.options = function(newExtentOptions){
      if(newExtentOptions !== undefined){
        extentOptions = newExtentOptions;
      }else{
        return extentOptions;
      }
    };

    Extent.filterValue = function(){
      return extentFilterValues[$stateParams.extent];
    };
    


    //****Return the factory object****//
    return Extent; 

    
}]); //END Extent factory function
app.controller('FilterCtrl', ['$scope', '$stateParams', '$state', 'Filter', function ($scope, $stateParams, $state, Filter) {
  	$scope.filterOptions = Filter.options($stateParams.category);
	for (var i = 0; i < $scope.filterOptions.length; i++) {
		if($scope.filterOptions[i].value === $stateParams.filter){
			$scope.defaultOption = i;
		}
	}
	$scope.hasFilter = false;
    if($stateParams.filter === 'summary'){
    	$scope.show = false;
	}else{
		$scope.show = true;
	}

	//Watch to see if the options returned from teh Filter factory change
	$scope.$watch(function () {return Filter.options($stateParams.category);},                       
      	function(newVal, oldVal) {
      		if($stateParams.category === 'property' || $stateParams.category === 'sanitation'){
				$scope.hasFilter = false;
			}else{
				if(newVal.length > 1){
	      			$scope.hasFilter = true;
	      			$scope.filterOptions = newVal;
	      			for (var i = 0; i < $scope.filterOptions.length; i++) {
						if($scope.filterOptions[i].value === $stateParams.filter){
							$scope.filterValue = $scope.filterOptions[i];
						}
					}
	      		}else{
	      			$scope.hasFilter = false;
	      		}

			}
  
    	}, true);

	

	
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
      {'value' : 'summary', 'label' : 'Property Summary'}
    ];

    var crimeFilterOptions = [
      {'value' : 'summary', 'label' : 'Crime Summary'}
    ];

    var developmentFilterOptions = [
      {'value' : 'summary', 'label' : 'Development Summary'}
    ];

    var sanitationFilterOptions = [
      {'value' : 'summary', 'label' : 'Sanitation Summary'}
    ];

    var filterOptions = {
      'crime' : crimeFilterOptions,
      'property' : propertyFilterOptions,
      'development' : developmentFilterOptions,
      'sanitation' : sanitationFilterOptions
    };

    // Filter.updateOptions = function(newFilterOptions, categeory){

    //     filterOptions[categeory] = newFilterOptions;
    // };
    

    //****API*****//

    Filter.options = function(categeory, newFilterOptions){
      if(newFilterOptions){
        return filterOptions[categeory] = newFilterOptions;
      }
      return filterOptions[categeory];
    };
    


    //****Return the factory object****//
    return Filter; 

    
}]); //END Filter factory function
//template is defined inline in app.config.js
app.controller('LocationCtrl', [function () {
	//Doesn't do anything
}]);
			

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
          q.resolve(properties);
        }
        
  			
  		}
      return q.promise;
    };


    //****Return the factory object****//
    return LocationProperties; 

    
}]); //END LocationProperties factory function
app.controller('MainCtrl', ['$scope', '$state', '$stateParams', '$location', '$http', '$timeout', 'ArcGisServer', 'LocationProperties',
  function ($scope, $state, $stateParams, $location, $http, $timeout, ArcGisServer, LocationProperties) {
    
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
        $scope.typedLocation = location.address;
        LocationProperties.properties(location)
          .then(function(){
            $state.go('main.location.questions', {location : location.attributes.Ref_ID});
          });
    };

    $scope.goHome = function(){
    	$location.path('');
    };



}]);

app.controller('QuestionsCtrl', ['$scope','$state', '$stateParams', 'Category', 'Questions', 'LocationProperties', 
    function ($scope, $state, $stateParams,  Category, Questions, LocationProperties) {
    var questions = [];
    LocationProperties.properties()
        .then(function(properties){
            $scope.locationProperties = properties;
            var dataCacheKeyArray = [];
            for(var key in properties){
                dataCacheKeyArray.push(key);
            }
            //Get a list of questions for the current location
            //****This could be an HTTP request****//
            questions = Questions.get(dataCacheKeyArray);

            //Get the top 2 questions
            $scope.questions = questions.slice(0,3);
        });

    $scope.questions = []

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

    //if there are only 2 questions intially, don't show the more option
    if($scope.questions === questions.length){
        $scope.more.show = false;
    }
    
    //if active, call on left arrow key press also
    $scope.getAnswer = function(question){
        $scope.category = Category.getDefinition(question.category);
        $state.go('main.location.category.time.extent.filter.details', $scope.category.defaultStates);  
    };


    //List should be tabbable 
    
}]);

app.factory('Questions', [function(){

    //****Create the factory object****//
    var Questions = {}; 

    //****Private Variables*****//

    var baseCaiQuestionArray = [
      {'question' : 'Do you want to know about this property?', 'category' : 'property', 'detail' : 'summary'}
    ];

    var questionsLookupObj = {
      'crime' : 
        [
          {'question' : 'Do you want to know about crime?', 'category' : 'crime', 'detail' : 'within-quarter-mile'}
        ],
      'development' :  
        [
          {'question' : 'Do you want to know about development?', 'category' : 'development', 'detail' : 'summary'}
          // {'question' : 'Do you want to know about residential building or trade permits?', 'category' : 'residential-building-or-trade-permits', 'detail' : 'summary'},
          // {'question' : 'Do you want to know about commercial building or trade permits?', 'category' : 'commercial-building-or-trade-permits', 'detail' : 'summary'},
          // {'question' : 'Do you want to know about event temporary use permits?', 'category' : 'event-temporary-use-permits', 'detail' : 'summary'},
          // {'question' : 'Do you want to know about fire related permits?', 'category' : 'fire-related-permits', 'detail' : 'summary'},
          // {'question' : 'Do you want to know about archival permit data?', 'category' : 'archival-permits', 'detail' : 'summary'},
          // {'question' : 'Do you want to know about outdoor vendor permits?', 'category' : 'outdoor-vendor-permits', 'detail' : 'summary'},
          // {'question' : 'Do you want to know about right of way requests?', 'category' : 'right-of-way-requests', 'detail' : 'summary'},
          // {'question' : 'Do you want to know about sign permits?', 'category' : 'sign-permits', 'detail' : 'summary'},
          // {'question' : 'Do you want to know about stormwater permits?', 'category' : 'stormwater-permits', 'detail' : 'summary'},
          // {'question' : 'Do you want to know about water line extension requests?', 'category' : 'water-line-extension-requests', 'detail' : 'summary'},
          // {'question' : 'Do you want to know about archival planning data?', 'category' : 'archival-planning-data', 'detail' : 'summary'},
          // {'question' : 'Do you want to know about historical resource commission related requests?', 'category' : 'historical-resource-commission-related-requests', 'detail' : 'summary'},
          // {'question' : 'Do you want to know about alternative compliance requests?', 'category' : 'alternative-compliance-requests', 'detail' : 'summary'},
          // {'question' : 'Do you want to know about map or text amendment requests?', 'category' : 'map-or-text-amendment-requests', 'detail' : 'summary'},
          // {'question' : 'Do you want to know about rezoning requests?', 'category' : 'rezoning-requests', 'detail' : 'summary'},
          // {'question' : 'Do you want to know about planning research requests?', 'category' : 'planning-research-requests', 'detail' : 'summary'},
          // {'question' : 'Do you want to know about site compliance verifications?', 'category' : 'site-compliance-verifications', 'detail' : 'summary'},
          // {'question' : 'Do you want to know about subdivision related requests?', 'category' : 'subdivision-related-requests', 'detail' : 'summary'},
          // {'question' : 'Do you want to know about development variance requests and appeals?', 'category' : 'development-variance-requests-and-appeals', 'detail' : 'summary'},
          // {'question' : 'Do you want to know about complaint enforcement incidents?', 'category' : 'complaint-enforcement-incidents', 'detail' : 'summary'},
          // {'question' : 'Do you want to occupational licencing?', 'category' : 'occupational-licensing', 'detail' : 'summary'},  
          // {'question' : 'Do you want to know about archival development services data?', 'category' : 'archival-development-services-data', 'detail' : 'summary'},
          // {'question' : 'Do you want to know about project inquiries?', 'category' : 'project-inquiries', 'detail' : 'summary'}
        ],
        'zoning' : 
        [
          {'question' : 'Do you want to know about the zoning?', 'category' : 'property', 'detail' : 'zoning'}
        ],
        'sanitation' : [
          {'question' : 'Do you want to know about trash collection?', 'category' : 'sanitation', 'detail' : 'summary'},
          {'question' : 'Do you want to know about recycling collection?', 'category' : 'sanitation', 'detail' : 'summary'}
        ]
    };

    // var neighborhoodQuestions = [
    //   {'question' : 'Do you want to know about crime?', 'category' : 'crime', 'detail' : 'quarter-mile'},
    //   {'question' : 'Do you want to know about development?', 'category' : 'development', 'detail' : 'summary'},
    // ];

    //****API*****//
    

    Questions.get = function(dataCacheKeyArray){
      dataCacheKeyArray.sort();
      var questions = baseCaiQuestionArray;
      for (var i = 0; i < dataCacheKeyArray.length; i++) {
        if(questionsLookupObj[dataCacheKeyArray[i]]){
          questions = questions.concat(questionsLookupObj[dataCacheKeyArray[i]])  
        }
      };
      //We should sort the questions by some value eventually
      return questions
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
app.factory('Time', ['$stateParams', function($stateParams){

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
      {'value' : 'last-30-days', 'label' : 'during the last 30 days'},
      {'value' : 'last-6-months', 'label' : 'during the last 6 months'},
      {'value' : 'last-year', 'label' : 'during the last year'},
      {'value' : 'last-5-years', 'label' : 'during the last 5 years'},
      {'value' : 'last-10-years', 'label' : 'during the last 10 years'},
      {'value' : 'all-time', 'label' : 'all time'}
    ];
  

    //****API*****//
    Time.options = function(newTimeOptions){
      if(newTimeOptions !== undefined){
        timeOptions = newTimeOptions;
      }else{
        return timeOptions;
      }
    };

    Time.filterValue = function(){
      return timeFilterValues[$stateParams.time];
    };
  

    //****Return the factory object****//
    return Time; 

    
}]); //END Time factory function
(function(module) {
try {
  module = angular.module('simplicity');
} catch (e) {
  module = angular.module('simplicity', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('category/category.html',
    '<div class="row list-item-panel" style="padding : 20px"><a class="col-xs-12 list-group-item list-item-panel" ng-click="goBack();"><h4><i class="fa fa-chevron-left pull-left text-primary" style="margin-top : 3px"></i>Back to Questions</h4></a><div class="col-xs-6"><h3>{{category.title}}</h3></div><div class="col-xs-6"><address class="pull-right" style="margin-top: 12px;"><strong>{{locationProperties.address.attributes.House}} {{locationProperties.address.attributes.preType}} {{locationProperties.address.attributes.StreetName}} {{locationProperties.address.attributes.SufType}} {{locationProperties.address.attributes.SufDir}} <span ng-if="locationProperties.address.attributes.User_fld !== \'\'">UNIT: {{locationProperties.address.attributes.User_fld}}</span></strong><br><span ng-if="locationProperties.inTheCity">Asheville, NC</span> {{locationProperties.address.attributes.ZIP}}</address></div><div ui-view=""></div></div>');
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
    '<div><div class="form-group col-xs-12" ng-show="show"><select class="form-control" id="extent" ng-init="extentValue = extentOptions[defaultOption]" ng-model="extentValue" ng-options="item.label for item in extentOptions" ng-change="onChangeExtentValue()" style="width : 100%"></select></div><div ui-view=""></div></div>');
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
    '<div><div ng-show="hasFilter"><a ng-click="show = !show" ng-show="!show">View Details by Type</a> <a ng-click="show = !show" ng-show="show">Hide Details Selector</a><div class="form-group col-xs-12" ng-show="show"><select class="form-control" id="filter" ng-init="filterValue = filterOptions[defaultOption]" ng-model="filterValue" ng-options="item.label for item in filterOptions" ng-change="onChangeFilterValue()" style="width : 100%"></select></div></div><div class="row" ui-view=""></div></div>');
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
    '<div class="row"><div ng-if="stateParams.details === \'report\'" report="stateParams"></div><div ng-if="stateParams.details === \'map\'" map="stateParams"></div></div>');
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
    '<div class="col-md-6 col-md-offset-3"><br><div class="col-xs-12"><div class="col-xs-12 hidden-xs"><div class="pull-left" ng-click="goHome();" ;="" style="cursor : pointer"><h1 style="color : #073F97">SimpliCity</h1><h4>city data simplified</h4></div><img class="pull-right" style="margin-top: 5px; height : 100px" src="http://123graffitifree.com/images/citylogo-flatblue.png"></div><div class="col-xs-12 visible-xs"><div class="pull-left" ng-click="goHome();" ;="" style="cursor : pointer"><h4 style="color : #073F97">SimpliCity</h4><h5>city data simplified</h5></div><img class="pull-right " style="margin-top: 5px; height : 50px" src="http://123graffitifree.com/images/citylogo-flatblue.png"></div><div class="col-xs-12"><br></div><div class="row"><input tabindex="1" type="text" autocomplete="on" class="form-control" placeholder="Enter a location" style="z-index: 0" ng-model="typedLocation" ng-keypress="getAddressCandidates(typedLocation, $event)"><div class="row col-xs-12"><p ng-show="errorMessage.show" class="text-danger">{{errorMessage.message}}</p><p ng-show="helperMessage.show" class="text-warning">{{helperMessage.message}}</p><div class="list-group" style="width : 100%; position : absolute; z-index : 1000; max-height : 230px; overflow-y: scroll"><a tabindex="{{$index+1}}" ng-click="getLocationProperties(candidate, $event)" ng-keypress="getLocationProperties(candidate, $event)" ng-repeat="candidate in addresses.candidates" class="list-group-item"><p class="text-info">{{candidate.attributes.House}} {{candidate.attributes.preType}} {{candidate.attributes.StreetName}} {{candidate.attributes.SufType}} {{candidate.attributes.SufDir}} <span ng-if="candidate.attributes.User_fld !== \'\'">UNIT: {{candidate.attributes.User_fld}}</span>, {{candidate.attributes.ZIP}}</p></a></div><p ng-show="errorMessage.show" class="text-danger">{{errorMessage.message}}</p></div></div><div class="col-xs-12"><br></div></div><div class="col-xs-12 content" style="height : 400px"><div ui-view="" class="slide"></div></div><div class="modal fade" id="modal" style="z-index : 3000"><div class="modal-dialog modal-sm"><div class="modal-content"><div class="modal-header" ng-if="modal.category === \'crime\'"><button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button><h4 class="modal-title">{{modal.offense}}</h4></div><div class="modal-header" ng-if="modal.category === \'development\'"><button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button><h4 class="modal-title">{{modal.record_type}}</h4></div><div class="modal-body"><div class="col-xs-12" ng-if="modal.category === \'development\'"><h5 class="text-center">{{modal.address}}</h5><div class="col-xs-12"><p class="text-muted"><strong>Opened:</strong> {{modal.date_opened|date}}</p><p class="text-muted"><strong>Updated:</strong> {{modal.date_statused|date}}</p><p class="text-muted"><strong>Status:</strong> {{modal.record_status}}</p><p class="text-muted"><strong>Business Name:</strong> {{modal.business_name}}</p><p class="text-muted"><strong>Description:</strong> {{modal.description}}</p></div></div><div class="col-xs-12 list-item-panel" ng-if="modal.category === \'crime\'"><div class="col-xs-12"><h5 class="lead">{{modal.address}}</h5><h5 class="text-muted"><strong>{{modal.thedate|date}}</strong></h5><p class="text-muted"><strong>Case #</strong>: {{modal.casenumber}}</p><p class="text-muted"><strong>Law Beat</strong>: {{modal.law_beat}}</p><p class="text-muted"><strong>Severity</strong>: {{modal.severity}}</p></div><a ng-click="showMore = !showMore"><p class="text-center" ng-if="showMore">Show More</p><p class="text-center" ng-if="showMore">Show Less</p></a></div></div></div></div></div></div>');
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
    '<div class="col-xs-12"><div class="list-group"><a class="col-xs-12 list-group-item list-item-panel hidden-xs"><div class="col-xs-12 col-sm-4"><address class="pull-left"><strong>{{locationProperties.address.attributes.House}} {{locationProperties.address.attributes.preType}} {{locationProperties.address.attributes.StreetName}} {{locationProperties.address.attributes.SufType}} {{locationProperties.address.attributes.SufDir}} <span ng-if="locationProperties.address.attributes.User_fld !== \'\'">UNIT: {{locationProperties.address.attributes.User_fld}}</span></strong><br><span ng-if="locationProperties.inTheCity">Asheville, NC</span> {{locationProperties.address.attributes.ZIP}}</address></div><div class="col-xs-12 col-sm-8"><div ng-if="locationProperties.inTheCity" class="pull-right"><i class="fa fa-check-circle fa-2x text-success pull-left" style="margin-top : 10px"></i><h3 class="pull-left" style="margin-top : 7px">It\'s in the city!</h3></div><div ng-if="!locationProperties.inTheCity" class="pull-right"><i class="fa fa-times-circle fa-2x text-danger pull-left" style="margin-top : 10px"></i><h3 class="pull-left" style="margin-top : 7px">It\'s not in the city!</h3></div></div></a> <a class="col-xs-12 list-group-item list-item-panel visible-xs"><div class="col-xs-12 col-md-4"><address><strong>{{locationProperties.address.attributes.House}} {{locationProperties.address.attributes.preType}} {{locationProperties.address.attributes.StreetName}} {{locationProperties.address.attributes.SufType}} {{locationProperties.address.attributes.SufDir}} <span ng-if="locationProperties.address.attributes.User_fld !== \'\'">UNIT: {{locationProperties.address.attributes.User_fld}}</span></strong><br><span ng-if="locationProperties.inTheCity">Asheville, NC</span> {{locationProperties.address.attributes.ZIP}}</address></div></a> <a ng-if="locationProperties.inTheCity" class="col-xs-12 list-group-item list-item-panel visible-xs"><i class="fa fa-check-circle fa-2x text-success pull-left" style=""></i><h5 class="pull-left" style="margin-top : 7px">It\'s in the city!</h5></a> <a ng-if="!locationProperties.inTheCity" class="col-xs-12 list-group-item list-item-panel visible-xs"><i class="fa fa-times-circle fa-2x text-danger pull-left" style="margin-top : 10px"></i><h5 class="pull-left" style="margin-top : 7px">It\'s not in the city!</h5></a> <a class="col-xs-12 list-group-item list-item-panel" ng-click="getAnswer(question)" ng-repeat="question in questions" tabindex="{{$index + 11}}"><h4>{{question.question}}<i class="fa fa-chevron-right pull-right text-primary" style="margin-top: 4px"></i></h4></a> <a class="col-xs-12 list-group-item list-item-panel" ng-show="more.show" ng-click="more.get()" tabindex="{{questions.length + 12}}"><h3 class="text-primary" style="text-align : center">More</h3></a></div></div>');
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
    '<div><div class="form-group col-xs-12" ng-show="show"><select class="form-control" id="time" ng-init="timeValue = timeOptions[defaultOption]" ng-model="timeValue" ng-options="item.label for item in timeOptions" ng-change="onChangeTimeValue()" style="width : 100%"></select></div><div ui-view=""></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('simplicity');
} catch (e) {
  module = angular.module('simplicity', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('details/cards/card.directive.html',
    '<div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('simplicity');
} catch (e) {
  module = angular.module('simplicity', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('details/cards/crime.card.html',
    '<div><div class="col-xs-12"><div class="col-xs-12 col-sm-6"><h5 class="pull-left">{{card.attributes.address}}</h5></div><div class="col-xs-12 col-sm-6"><h5 class="pull-right">{{card.attributes.thedate|date}}</h5></div></div><div class="col-xs-12"><div class="col-xs-12 col-sm-4"><p class="text-center"><strong>Case Number</strong></p><p class="text-center">{{card.attributes.casenumber}}</p></div><div class="col-xs-12 col-sm-4"><p class="text-center"><strong>Law Beat</strong></p><p class="text-center">{{card.attributes.law_beat}}</p></div><div class="col-xs-12 col-sm-4"><p class="text-center"><strong>Severity</strong></p><p class="text-center">{{card.attributes.severity}}</p></div></div><a ng-click="showMore = !showMore"><p class="text-center" ng-if="showMore">Show More</p><p class="text-center" ng-if="showMore">Show Less</p></a></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('simplicity');
} catch (e) {
  module = angular.module('simplicity', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('details/cards/development.card.html',
    '<div><h5 class="text-center">{{card.attributes.address}}</h5><div class="col-xs-12"><div class="col-xs-12 col-sm-4"><strong>Opened</strong><p>{{card.attributes.date_opened|date}}</p></div><div class="col-xs-12 col-sm-4"><strong>Updated</strong><p>{{card.attributes.date_statused|date}}</p></div><div class="col-xs-12 col-sm-4"><strong>Status</strong><p>{{card.attributes.record_status}}</p></div></div><div class="col-xs-12"><p><strong>Description:</strong>{{card.attributes.description}}</p></div><div ng-init="showMore = false" ng-show="showMore"><div class="col-xs-12"><div class="pull-left"><strong>Record Id</strong><p>{{card.attributes.record_id}}</p></div><div class="pull-right"><strong>License Number</strong><p>{{card.attributes.license_number}}</p></div></div><div class="col-xs-12"><div class="pull-left"><strong>Record Name</strong><p>{{card.attributes.record_name}}</p></div><div class="pull-right"><strong>Business Name</strong><p>{{card.attributes.business_name}}</p></div></div><div ng-init="showComments = false" ng-show="showComments"><strong>Comments</strong><ul class="list-group"><li class="list-group-item list-card-panel" ng-repeat="comment in card.attributes.commentsArray">{{comment}}</li></ul></div><a ng-click="showComments = !showComments"><p class="text-center" ng-if="!showComments">Show Comments</p><p class="text-center" ng-if="showComments">Hide Comments</p></a></div><a ng-click="showMore = !showMore"><p class="text-center" ng-if="!showMore">Show More</p><p class="text-center" ng-if="showMore">Show Less</p></a></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('simplicity');
} catch (e) {
  module = angular.module('simplicity', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('details/cards/property.card.html',
    '<div class="col-xs-12"><div class="col-xs-12" style="padding : 10px"><div class="col-xs-12 list-item-panel"><div class="col-xs-12 col-sm-6"><h5><strong>Civic Address Id</strong> : <span>{{card.attributes.civicAddressId}}</span></h5><h5><strong>PIN</strong> : <span>{{card.attributes.pinnum}}</span></h5></div><div class="col-xs-12 col-sm-6"><h5 ng-if="card.attributes.isincity === \'Yes\'"><i class="fa fa-check-circle text-success pull-left"></i> It\'s in the city!</h5><h5 ng-if="card.attributes.isincity === \'No\'"><i class="fa fa-times-circle text-danger pull-left"></i> It\'s not in the city!</h5><h5 ng-if="card.attributes.iscityowned === \'Yes\'"><i class="fa fa-check-circle text-success pull-left"></i> It\'s city owned!</h5><h5 ng-if="card.attributes.iscityowned === \'No\'"><i class="fa fa-times-circle text-danger pull-left"></i> It\'s not city owned!</h5></div></div><div class="col-xs-12 list-item-panel" ng-cloak=""><div ng-if="card.ownerCard" card="card.ownerCard"></div></div><div class="col-xs-12 list-item-panel" ng-cloak=""><div ng-if="card.zoningCard" card="card.zoningCard"></div></div><div class="col-xs-12 list-item-panel"><h4>Tax Details</h4><p ng-if="card.attributes.exempt === null">Tax exempt : <span class="text-danger">NO</span></p><p ng-if="card.attributes.exempt !== null">Tax exempt : <span class="text-success">YES</span></p><p ng-if="card.attributes.improved === \'Y\'">Improved : <span class="text-success">YES (${{card.attributes.improvementvalue|number}})</span></p><p>Appraisal Area : {{card.attributes.appraisalarea}}</p></div><div class="col-xs-12 list-item-panel"><h4>Property and Tax Value</h4><table class="table "><thead><tr><th>Value Type</th><th>Amount</th></tr></thead><tbody><tr><td>Building Value</td><td>${{card.attributes.buildingvalue|number}}</td></tr><tr><td>Land Value</td><td>${{card.attributes.landvalue|number}}</td></tr><tr><td>Appraised Value</td><td>${{card.attributes.appraisedvalue|number}}</td></tr><tr><td>Tax Value</td><td>${{card.attributes.taxvalue|number}}</td></tr><tr><td>Total Market Value</td><td>${{card.attributes.totalmarketvalue|number}}</td></tr></tbody></table></div><div class="col-xs-12 list-item-panel"><br><a class="col-xs-12 col-sm-4 text-center" style="margin-bottom : 10px" target="_blank" href="{{card.attributes.deed_url}}">Deed</a> <a class="col-xs-12 col-sm-4 text-center" style="margin-bottom : 10px" target="_blank" href="{{card.attributes.plat_url}}">Plat</a> <a class="col-xs-12 col-sm-4 text-center" style="margin-bottom : 10px" target="_blank" href="{{card.attributes.propcard_url}}">Property Card</a><br></div></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('simplicity');
} catch (e) {
  module = angular.module('simplicity', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('details/cards/property.owner.card.html',
    '<div><h4>Owner</h4><strong>{{card.owner}}</strong><address>{{card.owner_address}}<br>{{card.owner_citystatezip}}</address></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('simplicity');
} catch (e) {
  module = angular.module('simplicity', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('details/cards/property.zoning.card.html',
    '<div><h4>Zoning</h4><h5 ng-if="card.codelinks === \'disable\'"><strong>Zoning District</strong> : <span>{{card.zoning}}</span></h5><h5 ng-if="card.codelinks !== \'disable\'"><strong>Zoning District</strong> : <a target="_blank" href="{{card.codelinks[card.zoning]}}">{{card.zoning}}</a></h5><h5><strong>Zoning Overlay</strong> : <span>{{card.zoningOverlays}}</span></h5></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('simplicity');
} catch (e) {
  module = angular.module('simplicity', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('details/cards/sanitation.card.html',
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
  $templateCache.put('details/cards/summary.table.card.html',
    '<div class="col-xs-12"><div class="col-xs-12 list-item-panel"><table class="table"><thead><tr><th>Type</th><th class="text-center">Count</th></tr></thead><tbody><tr ng-repeat="(key, value) in card.table"><td><i class="fa fa-circle" style="color: #{{value.color}}"></i> {{key}}<br><p class="text-muted">{{developmentExplanations[key]}}</p></td><td class="text-center">{{value.count}}</td></tr></tbody></table></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('simplicity');
} catch (e) {
  module = angular.module('simplicity', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('details/map/map.directive.html',
    '<div class="col-xs-12"><div id="map" style="width : 100%; height : 400px"><div class="modal fade" id="pointDetailsModal" style="z-index : 3000"><div class="modal-dialog modal-sm" style="width: 90%;max-width: 500px;"><div class="modal-content"><div class="modal-header" ng-if="category === \'crime\'"><button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button><h4 class="modal-title">{{modalData.offense}}</h4></div><div class="modal-header" ng-if="category === \'development\'"><button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button><h4 class="modal-title">{{modalData.record_type}}</h4></div><div class="modal-body"><div class="col-xs-12" ng-if="category === \'development\'"><h5 class="text-center">{{modalData.address}}</h5><div class="col-xs-12"><p class="text-muted"><strong>Opened:</strong> {{modalData.date_opened|date}}</p><p class="text-muted"><strong>Updated:</strong> {{modalData.date_statused|date}}</p><p class="text-muted"><strong>Status:</strong> {{modalData.record_status}}</p><p class="text-muted"><strong>Business Name:</strong> {{modalData.business_name}}</p><p class="text-muted"><strong>Description:</strong> {{modalData.description}}</p></div></div><div class="col-xs-12 list-item-panel" ng-if="category === \'crime\'"><div class="col-xs-12"><h5 class="lead">{{modalData.address}}</h5><h5 class="text-muted"><strong>{{modalData.thedate|date}}</strong></h5><p class="text-muted"><strong>Case #</strong>: {{modalData.casenumber}}</p><p class="text-muted"><strong>Law Beat</strong>: {{modalData.law_beat}}</p><p class="text-muted"><strong>Severity</strong>: {{modalData.severity}}</p></div><a ng-click="showMore = !showMore"><p class="text-center" ng-if="showMore">Show More</p><p class="text-center" ng-if="showMore">Show Less</p></a></div></div></div></div></div></div><div class="col-xs-12"><a ng-click="goTo(report);"><p class="text-center">View Report</p></a></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('simplicity');
} catch (e) {
  module = angular.module('simplicity', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('details/report/report.directive.html',
    '<div class="col-xs-12"><div class="col-xs-12" style="height : 100px; text-align : center" ng-show="loading"><i class="fa fa-5x fa-spinner fa-spin"></i></div><div ng-if="report.category === \'property\'"><div ng-if="propertyDetails" card="propertyDetails"></div></div><div ng-if="report.category === \'sanitation\'"><div ng-if="sanitation" card="sanitation"></div></div><div ng-if="report.category === \'crime\' || report.category === \'development\'"><div class="col-xs-12" ng-if="isEmpty">No results were found based on your search criteria.</div><div ng-if="!isEmpty" ng-show="showSummary"><div ng-if="filteredDetails.summary" card="filteredDetails.summary"></div></div><div class="col-xs-12 list-item-panel" ng-repeat="feature in filteredDetails.features" ng-show="!showSummary" ng-cloak=""><div card="feature"></div></div></div><div class="col-xs-12 btn-group btn-group-justified" role="group" ng-if="showFooter"><a class="col-xs-12 col-sm-4 text-center" ng-click="goTo(map);">View on Map</a> <a class="col-xs-12 col-sm-4 text-center" ng-click="openShareModal();">Share</a> <a class="col-xs-12 col-sm-4 text-center" ng-click="openDownloadModal(filteredDetails);">Download</a></div><div id="downloadModal" class="modal fade" style="z-index : 3000"><div class="modal-dialog modal-sm"><div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button><h4 class="modal-title">Download</h4></div><div class="modal-body"><div ng-if="report.category === \'property\'"><button class="btn btn-primary col-xs-12" ng-click="download(\'property\', propertyDetails)">Property Details <i class="fa fa-cloud-download"></i></button></div><div ng-if="report.category === \'crime\' || report.category === \'development\'"><button class="btn btn-primary col-xs-12" ng-click="download(\'summary\', filteredDetails)">Summary Table <i class="fa fa-cloud-download"></i></button> <button class="btn btn-primary col-xs-12" style="margin-top : 3px" ng-click="download(\'complete\', filteredDetails)">Complete records <i class="fa fa-cloud-download"></i></button><p class="text-muted text-center">based on selected filters</p></div></div></div></div></div><div id="shareModal" class="modal fade" style="z-index : 3000"><div class="modal-dialog modal-sm"><div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button><h4 class="modal-title">Share</h4></div><div class="modal-body"><h5 class="text-primary">Link <i class="fa fa-link"></i></h5><pre>{{currentUrl}}</pre><h5 class="text-primary">Embed <i class="fa fa-share-alt"></i></h5><pre>{{iframeText}}</pre></div></div></div></div></div>');
}]);
})();

app.directive('card', ['$compile','$templateCache', '$filter','$state', '$stateParams','$q', '$timeout','Details', 'LocationProperties', 'Filter',
  function($compile, $templateCache, $filter, $state, $stateParams, $q, $timeout, Details, LocationProperties, Filter){
  return {
    //Restrict the directive to attribute ep-form on an element 
    restrict: 'A',
    //Defines the scope object for the directive 
    scope:{
      card : '= card',
    },
    replace : true,
    //Template for the directive
    templateUrl: 'details/cards/card.directive.html',
    link : function(scope, element, attrs){
      console.log(scope.card);
      console.log('$scope.card');
      var templates = {
        'crime' : 'details/cards/crime.card.html',
        'development' : 'details/cards/development.card.html',
        'zoning' : 'details/cards/property.zoning.card.html',
        'owner' : 'details/cards/property.owner.card.html',
        'summary' : 'details/cards/summary.table.card.html',
        'property' : 'details/cards/property.card.html',
        'sanitation' : 'details/cards/sanitation.card.html'
      };

      scope.developmentExplanations = {
        'Planning Level I' : 'Commercial construction less than 35,000 square feet or less than 20 multi-family units',
        'Planning Level II' : 'Commercial construction 35,000-100,000 square feet or 20-50 multi-family units',
        'Planning Level III' : 'Commercial construction larger than 100,000 square feet or more than 50 multi-family units'
      };
      
      var template = $templateCache.get(templates[scope.card.template]);
      element.replaceWith(element.html(template));
      $compile(element.contents())(scope)
      
    }//END card Directive Controller function
  };//END returned object
}]);//END card Directive function
app.directive('map', ['$compile','$filter','$state', '$stateParams','$q', '$timeout', 'Details', 'Extent', 'LocationProperties',
  function($compile, $filter, $state, $stateParams, $q, $timeout, Details, Extent, LocationProperties){
  return {
    //Restrict the directive to attribute ep-form on an element 
    restrict: 'A',
    //Defines the scope object for the directive 
    scope:{
      map : '= map',
    },
    replace : true,
    //Template for the directive
    templateUrl: 'details/map/map.directive.html',
    controller : ['$scope', function($scope){


    //Creates GeoJson from an ArcGIS Feature Service
    var createPointGeoJsonFromFilteredDetails = function(filteredDetails){
        var geoJson = {
            'type' : 'FeatureCollection',
            'features' : []
        };

        for (var i = 0; i < filteredDetails.features.length; i++) {
            var temp = {
                'type':'Feature',
                'geometry' : {
                    'type': 'Point', 
                    'coordinates': [filteredDetails.features[i].geometry.x, filteredDetails.features[i].geometry.y]
                },
                'properties': filteredDetails.features[i].attributes
            };
            geoJson.features.push(temp);
        }
        return geoJson;
    };

    var createGeoJsonMarkers = function(data){
      return L.geoJson(data, {
          pointToLayer: function (feature, latlng) {

              return L.circleMarker(latlng, {
                  radius: 6,
                  fillColor: "#"+feature.properties.color,
                  color: "#"+feature.properties.color,
                  weight: 1,
                  opacity: 1,
                  fillOpacity: 0.8
              }); 
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
        return geoJson;
    };


    var createGeoJson = function(data, style){
      return L.geoJson(data, {
          style: function (feature) {
            if(style){
                return style;
            }   
          },
          onEachFeature: function (feature, layer) {

              layer.on('click', function(){
                  
              });
          }
      });
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

    //Initialize the map
    var map = L.map('map', {
        center: [35.5951125,-82.5511088], 
        zoom : 13,
        maxZoom : 22,
        fullscreenControl: true,
        layers : [openstreetmap]
    });


    var layerControl = L.control.layers(baseMaps).addTo(map);
    $(".leaflet-control-attribution").css("maxWidth", "90%")

    LocationProperties.properties()
      .then(function(properties){
        $scope.locationProperties = properties;
        if($scope.map.category === 'property'){
          Details.getPropertyDetails($scope.map.location)
            .then(function(propertyDetails){
              if(properties.zoningOverlays){
                Details.getZoningOverlays(properties.zoningOverlays)
                  .then(function(zoningOverlayDetails){
                    var zoningOverlayGeoJson = createGeoJsonFromArcGisFeatureServicePolygon(zoningOverlayDetails);
                    var zoningOverlayLayer = createGeoJson(zoningOverlayGeoJson,{color: 'red'});
                    layerControl.addOverlay(zoningOverlayLayer, 'Zoning Overlays');
                  });              
              }
              $scope.propertyDetails = propertyDetails;
              var propertyGeoJson = createGeoJsonFromArcGisFeatureServicePolygon(propertyDetails);
              var propertyLayer = createGeoJson(propertyGeoJson);
              propertyLayer.addTo(map);
              map.fitBounds(propertyLayer);
              map.setZoom(18);
            });
        }else{
          Details.getFilteredDetails()
            .then(function(filteredDetails){
              var radiusInFeet = Extent.filterValue();
              var radiusInMeters = radiusInFeet*0.3048;
              L.marker([properties.address.location.y, properties.address.location.x]).addTo(map);
              var circle = L.circle([properties.address.location.y, properties.address.location.x], radiusInMeters, {
                'fillOpacity' : 0
              });
              circle.addTo(map);
              var circleBounds = circle.getBounds();
              map.fitBounds(circleBounds);
              var geojson = createPointGeoJsonFromFilteredDetails(filteredDetails)
              var geoJsonLayer = createGeoJsonMarkers(geojson);
              geoJsonLayer.addTo(map);  
            });
        }
      });
      $scope.crime = true
      if($stateParams.category !== 'crime'){
        $scope.crime = false
      };
      $scope.showMarkerDetails = false;

      $scope.getPointDetails = function(pointProperties){

        $scope.modalData = pointProperties;

        $scope.category = $stateParams.category;
        $('#pointDetailsModal').modal({'backdrop' : false});
      };

      $scope.goTo = function(detailsLocation){
        $state.go('main.location.category.time.extent.filter.details', {'details' : 'report'});
      };
      
      
    }]//END Details Directive Controller function
  };//END returned object
}]);//END Details directivective function
app.directive('report', ['$compile','$filter','$state', '$stateParams','$q', '$timeout','Details', 'LocationProperties', 'Filter',
  function($compile, $filter, $state, $stateParams, $q, $timeout, Details, LocationProperties, Filter){
  return {
    //Restrict the directive to attribute ep-form on an element 
    restrict: 'A',
    //Defines the scope object for the directive 
    scope:{
      report : '= report',
    },
    replace : true,
    //Template for the directive
    templateUrl: 'details/report/report.directive.html',
    controller : ['$scope', function($scope){

      $scope.loading = false;
      $scope.showSummary = true;
      $scope.showFooter = true;

      var isEmpty = function (obj) {
          for(var prop in obj) {
              if(obj.hasOwnProperty(prop)){
                return false;
              }     
          }
          return true;
      };

      var makeZoningCard = function(properties, codelinks){
        var zoningCard = {};
        zoningCard.template = 'zoning';
        zoningCard.zoning = properties.zoning[0];
        zoningCard.codelinks = codelinks;
        
        if(properties.zoningOverlays){
          zoningCard.zoningOverlays = properties.zoningOverlays;
        }else{
          zoningCard.zoningOverlays = 'No Zoning Overlays'
        }
        return zoningCard;
      };
      var makeOwnerCard = function(propertyDetails){
        var ownerCard = {};
        ownerCard.template = 'owner';
        ownerCard.owner = propertyDetails.owner;
        ownerCard.owner_address = propertyDetails.owner_address;
        ownerCard.owner_citystatezip = propertyDetails.owner_citystatezip;
        return ownerCard;
      };

      LocationProperties.properties()
        .then(function(properties){
          $scope.locationProperties = properties;
          if($scope.report.category === 'property'){
            Details.getPropertyDetails($scope.report.location)
              .then(function(propertyDetails){
                console.log(propertyDetails);
                propertyDetails.attributes.civicAddressId = $stateParams.location;
                propertyDetails.zoningCard = makeZoningCard(properties, propertyDetails.attributes.codelinks);
                propertyDetails.ownerCard = makeOwnerCard(propertyDetails.attributes);
                propertyDetails.template = 'property';
                $scope.propertyDetails = propertyDetails;
              });
          }else if($scope.report.category === 'sanitation'){
            console.log(properties.sanitation);
            $scope.showFooter = false;
            $scope.sanitation = properties.sanitation;
            $scope.sanitation.template = 'sanitation';
            $scope.sanitation.recyclingSchedule = Details.getRecyclingSchedule(properties.sanitation.recycling);
            $scope.sanitation.brushSchedule = Details.getBrushSchedule($scope.sanitation.recyclingSchedule, properties.sanitation.trash);
          }else{
            $scope.loading = true;
            Details.getFilteredDetails()
              .then(function(filteredDetails){
                $scope.filteredDetails = filteredDetails;
                console.log('$scope.filteredDetails');
                console.log($scope.filteredDetails);
                $scope.isEmpty = isEmpty(filteredDetails.summary);
                if($stateParams.filter === 'summary'){
                  $scope.showSummary = true;
                }else{
                  $scope.showSummary = false;
                }
                $scope.loading = false;                  
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

      $scope.openDownloadModal = function(){
        $('#downloadModal').modal({'backdrop' : false});
      };
      $scope.openShareModal = function(){
        $('#shareModal').modal({'backdrop' : false});
      };

      $scope.download = function(downloadType, details){
        console.log(details);
        var csvString =  'data:text/csv;charset=utf-8,';
        if(downloadType === 'summary'){
          csvString += 'Type, Count' + '\n';
          for(var key in details.summary){
            var summaryItemString = key + ',' + details.summary[key].count;
            csvString += summaryItemString + '\n';
          }
          console.log(csvString);
        }else{
          var headerArray = [];
          
          for(var key in details.features[0].attributes){
            headerArray.push(key);
          }
          for(var key in details.features[0].geometry){
            headerArray.push(key);
          }
          csvString += headerArray.join(',') + '\n';
          for (var i = 0; i < details.features.length; i++) {
            var rowArray = [];
            for (var x = 0; x < headerArray.length; x++) {

              if(details.features[i].attributes[headerArray[x]]){
                rowArray.push(details.features[i].attributes[headerArray[x]]);
              }else if(details.features[i].geometry[headerArray[x]]){
                rowArray.push(details.features[i].geometry[headerArray[x]]);
              }else{
                rowArray.push('NULL');
              }
            };
            console.log(rowArray);
            csvString += rowArray.join(',') + '\n';
          };
        }
        var encodedUri = encodeURI(csvString);
        window.open(encodedUri);
      }
      $scope.currentUrl = window.location.href;
      $scope.iframeText = '<iframe width="100%" height="100%" style = "overflow-y" src="'+window.location.href+'" frameborder="0" ></iframe>'
      
    }]//END report Directive Controller function
  };//END returned object
}]);//END report Directive function