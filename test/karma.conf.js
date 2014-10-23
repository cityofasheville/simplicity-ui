'use strict';

module.exports = function(config) {

  config.set({
    basePath : '..',

    files : [ 
        'test/dependencies/angular.js',
        'test/dependencies/jquery-2.1.1.js',
        'test/dependencies/**/*.js',
        'app/**/*.js',
        'test/unit/**/*.js'
    ],

    reporters: ['spec'],

    autoWatch : false,

    frameworks: ['mocha', 'chai', 'chai-as-promised'],

    browsers : ['PhantomJS'],

    plugins : [
        'karma-phantomjs-launcher',
        'karma-chrome-launcher',
        'karma-mocha',
        'karma-chai',
        'karma-chai-plugins',
        'karma-spec-reporter'
    ]
  });

};
