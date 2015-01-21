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
        template: '<div ui-view></div>'
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
