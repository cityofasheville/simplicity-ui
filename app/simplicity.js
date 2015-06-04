//instatiate an AngularJS module and inject an dependancy modules
var simplicity = angular.module('simplicity', ['angulartics', 'angulartics.google.analytics', 'simplicity.frontend.config', 'simplicity.backend.config', 'ui.router', 'ngAnimate']);
 
//Configure application states and routes
simplicity.config(function ($stateProvider, $urlRouterProvider, $httpProvider, $compileProvider) {
    
    $urlRouterProvider.when('/topics', '/topics/list');
    $urlRouterProvider.when('', '/search');
    $urlRouterProvider.when('/', '/search');
    $urlRouterProvider.when('/a-zA-Z0-9/', '');
    $urlRouterProvider.otherwise('/search');

   
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|data|mailto|chrome-extension):/);


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
  });//END config
