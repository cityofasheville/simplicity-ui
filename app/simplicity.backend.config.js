angular.module('simplicity.backend.config', ['simplicity.arcgis.rest.api.adapter', 'simplicity.http'])
  .constant('TABLES', {
    'crimes' : {
      'url' : 'http://arcgis-arcgisserver1-1222684815.us-east-1.elb.amazonaws.com/arcgis/rest/services/opendata/FeatureServer/0/query',
      'dataApi' : 'ArcGisRestApi'
    },
    'development' : {
      'url' : 'http://arcgis-arcgisserver1-1222684815.us-east-1.elb.amazonaws.com/arcgis/rest/services/opendata/FeatureServer/1/query',
      'dataApi' : 'ArcGisRestApi'
    },
    'addresses' : {
      'url' : 'http://arcgis-arcgisserver1-1222684815.us-east-1.elb.amazonaws.com/arcgis/rest/services/opendata/FeatureServer/2/query',
      'dataApi' : 'ArcGisRestApi'
    },
    'neighborhoods' : {
      'url' : 'http://arcgis-arcgisserver1-1222684815.us-east-1.elb.amazonaws.com/arcgis/rest/services/opendata/FeatureServer/4/query',
      'dataApi' : 'ArcGisRestApi'
    },  
    'properties' : {
      'url' : 'http://arcgis-arcgisserver1-1222684815.us-east-1.elb.amazonaws.com/arcgis/rest/services/opendata/FeatureServer/6/query',
      'dataApi' : 'ArcGisRestApi'
    },
    'zoningOverlays' : {
      'url' : 'http://arcgis-arcgisserver1-1222684815.us-east-1.elb.amazonaws.com/arcgis/rest/services/opendata/FeatureServer/8/query',
      'dataApi' : 'ArcGisRestApi'
    },
    'streets' : {
      'url' : 'http://arcgis-arcgisserver1-1222684815.us-east-1.elb.amazonaws.com/arcgis/rest/services/opendata/FeatureServer/9/query',
      'dataApi' : 'ArcGisRestApi'
    },
    'xrefs' : {
      'url' : 'http://arcgis-arcgisserver1-1222684815.us-east-1.elb.amazonaws.com/arcgis/rest/services/opendata/FeatureServer/11/query',
      'dataApi' : 'ArcGisRestApi'
    },
    'addressCaches' : {
      'url' : 'http://arcgis-arcgisserver1-1222684815.us-east-1.elb.amazonaws.com/arcgis/rest/services/opendata/FeatureServer/12/query',
      'dataApi' : 'ArcGisRestApi'
    }
  })
  .constant('SEARCH_CONFIG', {
    'searchUrl' : 'http://arcgis-arcgisserver1-1222684815.us-east-1.elb.amazonaws.com/arcgis/rest/services/coa_composite_locator/GeocodeServer/findAddressCandidates',
    'returnFields' : ['Match_addr', 'User_fld', 'Loc_name'],
    'searchEngine' : 'ArcGisRestApiGeocoder'
  })
  .factory('simplicityBackend', ['$http', '$location', '$q', '$filter', '$stateParams', 'simplicityHttp', 'simplicityArcGisRestApiAdapter', 'SIMPLICITY_ARCGIS_QUERIES', 'TABLES', 'SEARCH_CONFIG',
    function($http, $location, $q, $filter, $stateParams, simplicityHttp, simplicityAdapter, QUERIES, TABLES, SEARCH_CONFIG){
      
      //The factory object (this is what will be returned from the factory)
      var simplicityBackend = {};


      simplicityBackend.simplicitySearch = function(searchText){
        var q = $q.defer();


        //should I check the dataApi property here? or only allow one dataApi for all tables
        //if I allow multiple dataApis, I won't be able to inject adapters as a generic simplicityAdapter
        simplicityAdapter.search(SEARCH_CONFIG.searchUrl, searchText)
          .then(function(searchResults){
            q.resolve(searchResults);
          });


        return q.promise;
      };

      simplicityBackend.simplicityQuery = function(table, queryValues){
        var q = $q.defer();

        var queryTemplate = QUERIES[table][$stateParams.searchby];
        var queryParams = simplicityHttp.buildQueryParams(queryTemplate, queryValues);

        simplicityHttp.get(TABLES[table].url, queryParams)
          .then(function(httpResults){
            //should I check the dataApi property here? or only allow one dataApi for all tables
            //if I allow multiple dataApis, I won't be able to inject adapters as a generic simplicityAdapter
            q.resolve(simplicityAdapter.formatHttpResults(httpResults));
          });

        return q.promise;
      };

      simplicityBackend.formatTimeForQuery = function(jsDate){
        return simplicityAdapter.formatTimeForQuery(jsDate);
      };



      //****Return the factory object****//
      return simplicityBackend; 

    
    }]); //END simplicityBackend factory function





   


