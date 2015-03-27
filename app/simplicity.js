'use strict';

//instatiate an AngularJS module and inject an dependancy modules
var simplicity = angular.module('simplicity', ['simplicity.frontend.config', 'simplicity.backend.config', 'ui.router', 'ngAnimate']);
 
//Configure application states and routes
simplicity.config(function ($stateProvider, $urlRouterProvider, $httpProvider) {
    
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
        url: '/search',
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
          url: '/:topic?searchtext&searchby&id&view&timeframe&extent&type',
          templateUrl: 'topics/topic-single/topic.single.html',
          controller: 'TopicSingleCtrl'
        });
  });//END config
