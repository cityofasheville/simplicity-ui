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
      })
      //location can be a CAI (civic address id) or an neighborhood
      .state('main.location', {
        url: '/:location',
        template: '<div ui-view style = "z-index : 100" class = "slide"></div>',
        controller: 'LocationCtrl',
        resolve:  {
          location: ['$stateParams', 'AppFact', function($stateParams, AppFact){
            AppFact.locationProperties($stateParams.location)
              .then(function(locationProperties){
                return $stateParams.location;
              }); 
          }]
        }
      })
      //list of question for a location
      .state('main.location.list', {
        url: '/list',
        templateUrl: 'list/list.html',
        controller: 'ListCtrl',
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


app.factory('AppFact', ['$http', '$location', '$q', '$filter',
  function($http, $location, $q, $filter){

    var AppFact = {}; 

    //****Private Variables*****//

    var locationProperties = 'fresh';
    
    var getLocationPropertiesFromServer = function(locationName){
      var q = $q.defer();
      //***TODO: Make HTTP request to get location properties using locationName***//
      //for now just return some dummy data
      var dummyLocationProperties = {
        locationName : '123456',//CAI or neighborhood name
        locationType : 'cai',//or neighborhood or other? could generate this client side
        inTheCity : true,
        address : '25 Howland Rd',
        city : 'Asheville',
        state : 'NC',
        zip : 28804
      };
      locationProperties = dummyLocationProperties;
      q.resolve(dummyLocationProperties);
      return q.promise;
    };

    var locationQuestions = [];

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

    var caiCrimeDefinition = {
      title : 'Crime',
      category : 'crime',
      time : '2014',
      extent : 'within-a-quarter-mile',
      filter : 'summary',
      details : 'report'
    };

    var neighborhoodCrimeDefinition = {
      showTimeOptions : true,
      defaultTimeOption : 2,
      showExtentOptions : false,
      defaultExtentOption : 'neighborhood',
      showFilterOptions : false,
      defaultFilterOption : 'summary'
    };

    var propertyDefinition = {
      showTimeOptions : false,
      defaultTimeOption : 'current',
      showExtentOptions : false,
      defaultExtentOption : 'location',
      showFilterOptions : false,
      defaultFilterOption : 'summary'
    };

    var categoryDefinitions = {
      cai : {
        crime : caiCrimeDefinition,
        property : propertyDefinition
      },
      neighborhood : {
        crime : neighborhoodCrimeDefinition
      }
    };

    var timeOptions = [
      {'value' : 'last-6-months', 'label' : 'During the last 6 months'},
      {'value' : 'last-year', 'label' : 'During the last year'},
      {'value' : '2014', 'label' : 'During the year 2014'},
      {'value' : '2013', 'label' : 'During the year 2013'},
      {'value' : '2012', 'label' : 'During the year 2012'}
    ];

    var extentOptions = [
      {'value' : 'within-a-quarter-mile', 'label' : 'Within a quarter mile'},
      {'value' : 'within-a-half-mile', 'label' : 'Within a half mile'},
      {'value' : 'within-a-mile', 'label' : 'Within a mile'},
      {'value' : 'within-5-miles', 'label' : 'Within 5 miles'}
    ];

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


    //****API*****//
    AppFact.locationProperties = function(newLocationName){
      var q = $q.defer();
      if(locationProperties === 'fresh' || locationProperties.locationName !== newLocationName){
        getLocationPropertiesFromServer(newLocationName)
          .then(function(locationProperties){
            q.resolve(locationProperties);
          });
      }else{
        q.resolve(locationProperties);
      }
      return q.promise;
    };

    AppFact.questions = function(){
      console.log('questions');
      console.log(locationProperties);
      if(locationProperties.locationType === 'cai'){
        return caiQuestions;
      }else{
        return neighborhoodQuestions;
      }
    };

    AppFact.categoryDefinition = function(category){
      //if cai do something if neighborhood do something else
      if(locationProperties.locationType === 'cai'){
        return categoryDefinitions.cai[category];
      }else{
        return categoryDefinitions.neighborhood[category];
      } 
    };

    AppFact.timeOptions = function(newTimeOptions){
      if(newTimeOptions !== undefined){
        timeOptions = newTimeOptions;
      }else{
        return timeOptions;
      }
    };

    AppFact.extentOptions = function(newExtentOptions){
      if(newExtentOptions !== undefined){
        extentOptions = newExtentOptions;
      }else{
        return extentOptions;
      }
    };

    AppFact.propertyFilterOptions = function(newPropertyFilterOptions){
      if(newPropertyFilterOptions !== undefined){
        propertyFilterOptions = newPropertyFilterOptions;
      }else{
        return propertyFilterOptions;
      }
    };

    AppFact.filterOptions = function(newCrimeFilterOptions){
      if(newCrimeFilterOptions !== undefined){
        crimeFilterOptions = newCrimeFilterOptions;
      }else{
        return crimeFilterOptions;
      }
    };


    //****Return the factory object****//
    return AppFact; 

}]); //END AppFact factory function
//Keep a scope variable of the current address to share across all 
app.controller('CategoryCtrl', ['$scope', '$stateParams', '$state', 'AppFact', function ($scope, $stateParams, $state, AppFact) {

	//***TODO: Get category definition via HTTP ***//
    var category = AppFact.categoryDefinition($stateParams.category);
    $scope.category = category;
    
}]);

app.controller('DetailsCtrl', ['$scope', '$stateParams', '$state', function ($scope, $stateParams, $state) {
    //controls the details
}]);
app.controller('ExtentCtrl', ['$scope', '$stateParams', '$state', 'AppFact', function ($scope, $stateParams, $state, AppFact) {
    if($stateParams.extent === 'location' || $stateParams.extent === 'neightborhood'){
		$scope.show = false;
	}else{
		$scope.show = true;
		//Probably will be HTTP
		$scope.extentOptions = AppFact.extentOptions();
		console.log($scope.extentOptions);
		for (var i = 0; i < $scope.extentOptions.length; i++) {
			if($scope.extentOptions[i].value === $stateParams.extent){
				console.log(i);
				$scope.defaultOption = 2;
			}
		};
	}
	$scope.onChangeExtentValue = function(){
		$state.go('main.location.category.time.extent.filter.details', {extent : $scope.extentValue.value});
	};
}]);
app.controller('FilterCtrl', ['$scope', '$stateParams', '$state', 'AppFact', function ($scope, $stateParams, $state, AppFact) {
  	$scope.filterOptions = AppFact.filterOptions();
		console.log($scope.filterOptions);
		for (var i = 0; i < $scope.filterOptions.length; i++) {
			if($scope.filterOptions[i].value === $stateParams.filter){
				console.log(i);
				$scope.defaultOption = i;
			}
		};
		
    if($stateParams.filter === 'summary'){
		$scope.show = false;
	}else{
		$scope.show = true;
		//Probably will be HTTP
		
	}
	$scope.onChangeFilterValue = function(){
		$state.go('main.location.category.time.extent.filter.details', {filter : $scope.filterValue.value});
	};
}]);
app.directive('coaForm', ['$compile','$filter','$state', '$stateParams','$q',
  function($compile, $filter, $state, $stateParams, $q){
  return {
    //Restrict the directive to attribute ep-form on an element 
    restrict: 'A',
    //Defines the scope object for the directive 
    scope:{
      coaForm : '= coaForm',
    },
    replace : true,
    //Template for the directive
    templateUrl: 'form/form.html',
    controller : ['$scope', function($scope){
      if($scope.coaForm.submit === 'onChange'){
        $scope.$watch('coaForm.elements', function (newVal, oldVal){
            var detailArray = [];
            for (var i = 0; i < $scope.coaForm.elements.length; i++) {
              detailArray.push($scope.coaForm.elements[i].returnValue.value);
            }
            var detail = detailArray.join('-');
            $state.go('main.location.category.time.detail.summary', {time: detailArray[0], detail : detailArray[1]});
          }, true);
      }
    }]
  };
}]);

app.directive('coaFormElement', ['$compile','$filter','$state', '$q',
  function($compile, $filter, $state, $q){
  return {
    //Restrict the directive to attribute coa-form-element on an element 
    restrict: 'A',
    //Defines the scope object for the directive 
    scope:{
      coaFormElement : '= coaFormElement',
    },
    replace : true,
    //Template for the directive
    templateUrl: 'form-element/form-element.html',
    controller : ['$scope', function($scope){
      console.log($scope.coaFormElement);

      var coaFormElementTemplates = {
        'select' : 'form-element/select.html',
      };

      $scope.getTemplate = function(){
        return coaFormElementTemplates[$scope.coaFormElement.type];
      };

      if($scope.coaFormElement.type === 'Select'){
        $scope.doOnChange = function(){
          //
        };
      }


    }]  
  };
}]);

app.controller('ListCtrl', ['$scope','$state','AppFact', 'location', function ($scope, $state, AppFact, location) {
    
    //Get locationProperties 
    AppFact.locationProperties(location)
        .then(function(locationProperties){
            $scope.locationProperties = locationProperties;
        });


    //Get a list of questions for the current location
    //****This could be an HTTP request****//
    var questions = AppFact.questions();

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
    $scope.getAnswer = function(){
        var category = AppFact.categoryDefinition('crime');
        $scope.category = category;
        $state.go('main.location.category.time.extent.filter.details', category);
    };


    //List should be tabbable 
    
}]);
//template is defined inline in app.config.js
app.controller('LocationCtrl', [function () {
	//This doesn't do anything at the moment		
}]);
			
app.controller('MainCtrl', ['$scope', '$state', '$location', '$http', '$timeout','AppFact', function ($scope, $state, $location, $http, $timeout, AppFact) {
    
    //***TODO: Get address canidates as user enters an address***//
    $scope.typedLocation = "";
    $scope.addresses = [];
    $scope.errorMessage = {
      show : false,
      message : 'We had trouble locating that location. Please try to enter a location again.'
    }

    
    $scope.getAddressCandidates = function(enteredLocation){
      var url = 'http://arcgis-arcgisserver1-1222684815.us-east-1.elb.amazonaws.com/arcgis/rest/services/test_open/MapServer/0/query';
      //var url = 'http://cityofashevilleopendatatest.avl.opendata.arcgis.com/datasets/0faa563c77e045ba8dbd979b4fc48505_0.geojson';
      //var url = 'http://gis.ashevillenc.gov/COA_ArcGIS_Server/rest/services/Buncombe_Street_Address/GeocodeServer/findAddressCandidates';
      var whereClause = "address like '%"+enteredLocation.toUpperCase()+"%'";
      var params = {
        where : whereClause,
        outFields : '*',
        f : 'json'
      };
      $http({method : 'GET', url : url, params : params, cache : true})
        .success(function(data, status, headers, config){
          $scope.addresses = data.features.splice(0, 10);

          console.log($scope.addresses);
        })
        .error(function(error){
          console.log(error);
        })
    }

    $scope.getThisLocation = function(location){
      console.log(JSON.stringify(location));

      $state.go('main.location.list', {location : location.attributes.civicaddress_id});
      $scope.addresses = []; 
      $scope.typedLocation = location.attributes.address;
    }


    //when user clicks Go!! or hits enter
    $scope.getLocation = function(location){
      // $scope.typedLocation = location;
      // var url = "http://arcgis-arcgisserver1-1222684815.us-east-1.elb.amazonaws.com/arcgis/rest/services/test_open/MapServer/0/query";
      // var whereClause = 'address='+"'"+location+"'";
      // var params = {
      //   where : whereClause,
      //   outFields : '*',
      //   f : 'json'
      // };
      // $http({method : 'GET', url : url, params : params, cache : true})
      //   .success(function(data, status, headers, config){
      //     if(data.features.length > 0){
      //       $state.go('main.location.list', {location : data.features[0].attributes.civicaddress_id});
      //       $scope.addresses = []; 
      //     }else{
      //       $scope.addresses = []; 
      //       $scope.typedLocation = "";
      //       $scope.errorMessage.show  = true;
      //       $location.path('');
      //       $timeout(function() {
      //         $scope.errorMessage.show  = false;
      //       }, 3000);

      //     }
          
      //   })
      //   .error(function(error){
      //     console.log(error);
      //   });
           
      
    };

    $scope.goHome = function(){
    	$location.path('');
    }

}]);
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
    '<div><table class="table table-condensed table-striped"><thead><tr><th>Type</th><th style="text-align : center">Number</th></tr></thead><tbody><tr><td>Aggravated Assault</td><td style="text-align : center">2</td></tr><tr><td>Burglary</td><td style="text-align : center">12</td></tr><tr><td>Drug Arrest</td><td style="text-align : center">2</td></tr><tr><td>Larceny</td><td style="text-align : center">28</td></tr><tr><td>Larceny of Motor Vehicles</td><td style="text-align : center">2</td></tr><tr><td>Rape</td><td style="text-align : center">1</td></tr><tr><td>Robbery</td><td style="text-align : center">0</td></tr><tr><td>Vandalism</td><td style="text-align : center">8</td></tr></tbody></table><a ui-sref="main.location.category.time.detail.map">Map</a></div>');
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
    '<div><a ng-click="show = !show" ng-show="!show">Filter Results</a> <a ng-click="show = !show" ng-show="show">Remove Filter</a><div class="form-group" ng-show="show"><select class="form-control" id="filter" ng-init="filterValue = filterOptions[defaultOption]" ng-model="filterValue" ng-options="item.label for item in filterOptions" ng-change="onChangeFilterValue()" style="width : 100%"></select></div><hr><div ui-view=""></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('simplicity');
} catch (e) {
  module = angular.module('simplicity', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('form/form.html',
    '<form><div ng-repeat="formElement in coaForm.elements"><div coa-form-element="formElement"></div></div></form>');
}]);
})();

(function(module) {
try {
  module = angular.module('simplicity');
} catch (e) {
  module = angular.module('simplicity', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('form-element/form-element.html',
    '<div ng-include="getTemplate(coaFormElement.type)"></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('simplicity');
} catch (e) {
  module = angular.module('simplicity', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('form-element/select.html',
    '<div class="form-group"><select class="form-control" id="{{coaFormElement.id}}" ng-init="coaFormElement.returnValue = coaFormElement.options[coaFormElement.defaultOptionIndex]" ng-model="coaFormElement.returnValue" ng-options="item.label for item in coaFormElement.options" style="width : 100%"></select></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('simplicity');
} catch (e) {
  module = angular.module('simplicity', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('list/list.html',
    '<div class="col-xs-12"><div class="list-group"><a class="list-group-item list-item-panel"><address class="pull-left"><strong>{{locationProperties.address}}</strong><br>{{locationProperties.city}}, {{locationProperties.state}} {{locationProperties.zip}}</address><div ng-if="locationProperties.inTheCity" class="pull-right hidden-xs"><i class="fa fa-check-circle fa-2x text-success pull-left" style="margin-top : 10px"></i><h2 class="pull-left" style="margin-top : 7px">It\'s in the city!</h2></div><div ng-if="!locationProperties.inTheCity" class="pull-right hidden-xs"><i class="fa fa-times-circle fa-2x text-danger pull-left" style="margin-top : 10px"></i><h2 class="pull-left" style="margin-top : 7px">It\'s not in the city!</h2></div></a> <a ng-if="locationProperties.inTheCity" class="list-group-item list-item-panel visible-xs"><i class="fa fa-check-circle fa-2x text-success pull-left" style="margin-top : 10px"></i><h2 class="pull-left" style="margin-top : 7px">It\'s in the city!</h2></a> <a ng-if="!locationProperties.inTheCity" class="list-group-item list-item-panel visible-xs"><i class="fa fa-times-circle fa-2x text-danger pull-left" style="margin-top : 10px"></i><h2 class="pull-left" style="margin-top : 7px">It\'s not in the city!</h2></a> <a class="list-group-item list-item-panel" ng-click="getAnswer()" ng-repeat="question in questions" tabindex="{{$index + 1}}"><h4>{{question.question}}<i class="fa fa-chevron-right pull-right text-primary" style="margin-top: 8px"></i></h4></a> <a class="list-group-item list-item-panel" ng-show="more.show" ng-click="more.get()" tabindex="{{questions.length + 2}}"><h3 class="text-primary" style="text-align : center">More</h3></a></div></div>');
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
    '<div class="col-md-6 col-md-offset-3"><br><div class="col-xs-12"><div class="col-xs-12"><div class="pull-left" ng-click="goHome();" ;="" style="cursor : pointer"><h1>SimpliCity</h1><h4>city data simplified</h4></div><img class="pull-right" style="margin-top: 5px" src="http://123graffitifree.com/images/citylogo-flatblack.png"></div><div class="col-xs-12"><br></div><form class="col-xs-12"><div class="input-group col-xs-12"><input type="text" class="form-control" placeholder="Enter a location" style="z-index: 0" ng-model="typedLocation" ng-keypress="getAddressCandidates(typedLocation)"> <span class="input-group-btn"><button class="btn btn-primary" ng-click="getLocation(typedLocation);" style="z-index: 0">Go!</button></span></div><p ng-show="errorMessage.show" class="text-danger">{{errorMessage.message}}</p><div class="list-group col-xs-12" style="position : absolute; z-index : 1000"><a ng-click="getThisLocation(address)" ng-repeat="address in addresses" class="list-group-item">{{address.attributes.address}}</a></div></form><div class="col-xs-12"><br></div></div><div class="col-xs-12 content" style="height : 400px"><div ui-view="" class="slide"></div></div></div>');
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

app.controller('TimeCtrl', ['$scope', '$stateParams', '$state', 'AppFact', function ($scope, $stateParams, $state, AppFact) {
	
	if($stateParams.time === 'current'){
		$scope.show = false;
	}else{
		$scope.show = true;
		//Probably will be HTTP
		$scope.timeOptions = AppFact.timeOptions();
		console.log($scope.timeOptions);
		for (var i = 0; i < $scope.timeOptions.length; i++) {
			if($scope.timeOptions[i].value === $stateParams.time){
				console.log(i);
				$scope.defaultOption = i;
			}
		};
	}
	$scope.onChangeTimeValue = function(){
		console.log($scope.timeValue);
		$state.go('main.location.category.time.extent.filter.details', {time : $scope.timeValue.value});
	};


	
}]);