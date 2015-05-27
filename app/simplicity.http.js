//All HTTP requests are routed this this module
angular.module('simplicity.http', [])
  .factory('simplicityHttp', ['$http', '$q',
    function($http, $q){

      var simplicityHttp = {};

      //Makes a GET request to a url query params defined as key-value pairs in the options object
      simplicityHttp.get = function(url, options){
        //use $q promises to handle the http request asynchronously
        var q = $q.defer();

        //options.callback = 'JSON_CALLBACK';
        //make http request
        $http({method : 'GET', url : url, params : options, cache : true})
          //callbacks
          .success(function(data, status, headers, config){
            if(data.error){
                console.log(data.error.code + ' queryBackend on url ' + url + '. ' + data.error.message);
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


      //builds query params from a queryTemplate defined in a adapter file (eg. simplicity.arcgis.rest.api.adapter.js)
      //and an object of queryValues to inject into the queryTemplate
      simplicityHttp.buildQueryParams = function(queryTemplate, queryValues){
        var q = $q.defer();
        var sqlArray = [];

        for (var i = 0; i < queryTemplate.sqlArray.length; i++) {

          if(queryValues[queryTemplate.sqlArray[i]] !== undefined){
            sqlArray.push(queryValues[queryTemplate.sqlArray[i]]);
          }else{
            sqlArray.push(queryTemplate.sqlArray[i]);
          }
        }

        var sqlExpression = sqlArray.join('');
        
        var queryParams = queryTemplate.queryParams;

        queryParams[queryTemplate.sqlParamName] = sqlExpression;

        q.resolve(queryParams);
        return q.promise;
      };

      simplicityHttp.buildQueryParamsAndMakeGetRequest = function(queryTemplate, queryValues){
        var q = $q.defer();
        var sqlArray = [];

        for (var i = 0; i < queryTemplate.sqlArray.length; i++) {

          if(queryValues[queryTemplate.sqlArray[i]] !== undefined){
            sqlArray.push(queryValues[queryTemplate.sqlArray[i]]);
          }else{
            sqlArray.push(queryTemplate.sqlArray[i]);
          }
        }

        var sqlExpression = sqlArray.join('');
        
        var queryParams = queryTemplate.queryParams;

        queryParams[queryTemplate.sqlParamName] = sqlExpression;

        var url = 'http://arcgis-arcgisserver1-1222684815.us-east-1.elb.amazonaws.com/arcgis/rest/services/opendata/FeatureServer/0/query';
        $http({method : 'GET', url : url, params : queryParams, cache : true})
          //callbacks
          .success(function(data, status, headers, config){
            if(data.error){
                console.log(data.error.code + ' queryBackend on url ' + url + '. ' + data.error.message);
            }else{  

                q.resolve(data);
            }
          })
          .error(function(error){
              console.log('Error querying feature service.');
              console.log(error);
          });
        return q.promise;
      };


      //****Return the factory object****//
      return simplicityHttp; 

      
  }]); //END simplicityHttp factory function