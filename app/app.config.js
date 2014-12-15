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
      .state('main.type', {
        url: '/:type',
        template: '<div ui-view style = "z-index : 100" class = "slide"></div>',
        controller: 'TypeCtrl',
        resolve:  {
          location: ['$stateParams', function($stateParams){
                return $stateParams.id;
          }]
        }
      })
      //id can be a CAI (civic address id) or an neighborhood
      .state('main.type.id', {
        url: '/:id',
        template: '<div ui-view></div>',
        controller: 'IdCtrl',
        resolve:  {
          id: ['$stateParams', function($stateParams){
                return $stateParams.id;
          }]
        }
      })
      //list of question for a id
      .state('main.type.id.questions', {
        url: '/questions',
        templateUrl: 'questions/questions.html',
        controller: 'QuestionsCtrl',
      })
      //category is a data category such as property, crime, or development
      .state('main.type.id.category', {
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
      .state('main.type.id.category.time', {
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
      .state('main.type.id.category.time.extent', {
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
      .state('main.type.id.category.time.extent.filter', {
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
      .state('main.type.id.category.time.extent.filter.details', {
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
