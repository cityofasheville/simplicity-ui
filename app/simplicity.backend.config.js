angular.module('simplicity.backend.config', ['simplicity.arcgis.rest.api.adapter', 'simplicity.google.place.api.adapter', 'simplicity.http'])
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
    'owners' : {
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
  .factory('simplicityBackend', ['$http', '$location', '$q', '$filter', '$stateParams', 'simplicityHttp', 'simplicityArcGisRestApiAdapter', 'simplicityGooglePlacesApiAdapter', 'SIMPLICITY_ARCGIS_QUERIES', 'TABLES', 'SEARCH_CONFIG',
    function($http, $location, $q, $filter, $stateParams, simplicityHttp, simplicityAdapter, googlePlacesApiAdapter, QUERIES, TABLES, SEARCH_CONFIG){
      
      //The factory object (this is what will be returned from the factory)
      var simplicityBackend = {};


      simplicityBackend.simplicitySearch = function(searchText){
        var q = $q.defer();

        var searchResultsArray = [];

        //should I check the dataApi property here? or only allow one dataApi for all tables
        //if I allow multiple dataApis, I won't be able to inject adapters as a generic simplicityAdapter
        simplicityAdapter.search(SEARCH_CONFIG.searchUrl, searchText)
          .then(function(searchResults){
            searchResultsArray = searchResults;
            googlePlacesApiAdapter.search(searchText)
              .then(function(googleResults){
                if(googleResults === 'no google results'){
                  q.resolve(searchResultsArray);
                }else{
                  searchResultsArray.push(googleResults);
                  q.resolve(searchResultsArray);
                }
              });

          });
        return q.promise;
      };

      simplicityBackend.simplicityQuery = function(table, queryValues){
        var q = $q.defer();

        //var queryTemplate = QUERIES[table][$stateParams.searchby];
        var queryTemplate = {};

        angular.copy(QUERIES[table][$stateParams.searchby], queryTemplate);
        //var queryParams = simplicityHttp.buildQueryParams(queryTemplate, queryValues);
        simplicityHttp.buildQueryParams(queryTemplate, queryValues)
          .then(function(queryParams){
            simplicityHttp.get(TABLES[table].url, queryParams)
              .then(function(httpResults){
                //should I check the dataApi property here? or only allow one dataApi for all tables
                //if I allow multiple dataApis, I won't be able to inject adapters as a generic simplicityAdapter
                q.resolve(simplicityAdapter.formatHttpResults(httpResults));
              });
          })
        

        return q.promise;
      };

      var getQueryConstant = function(table){
        var q = $q.defer();
        var queryTemplate = QUERIES[table][$stateParams.searchby];
        
          q.resolve(queryTemplate)
                
        return q.promise;
      }

      simplicityBackend.simplicityQuerySpecial = function(table, queryValues){
        var q = $q.defer();

        var queryTemplate = {};

        angular.copy(QUERIES[table][$stateParams.searchby], queryTemplate);

        simplicityHttp.buildQueryParamsAndMakeGetRequest(queryTemplate, queryValues)
          .then(function(data){
            q.resolve(simplicityAdapter.formatHttpResults( data));
          })
          
        //var queryParams = simplicityHttp.buildQueryParams(queryTemplate, queryValues);
        
        
        return q.promise;
      };

      simplicityBackend.simplicityFindGoogleAddress = function(candidate){
        var q = $q.defer();

        googlePlacesApiAdapter.getDetails(candidate.id)
          .then(function(details){
            var searchText;
            var vicinity = candidate.label.split("|");
            var streetAddressOnly = vicinity[1].split(",");
            
            var postal_code = "";
  
            for (var ac = 0; ac < details.address_components.length; ac++) {
              for (var typ = 0; typ < details.address_components[ac].types.length; typ++) {
                if(details.address_components[ac].types[typ] === "postal_code"){
                  postal_code = details.address_components[ac].long_name;
                }
              }
            }
            if (postal_code !== '') {
              searchText = streetAddressOnly[0] + ", " + postal_code;
            }else{
              searchText = streetAddressOnly[0];
            }


            simplicityAdapter.search(SEARCH_CONFIG.searchUrl, searchText)
              .then(function(searchResults){

                var completed = false;
                for (var i = 0; i < searchResults.length; i++) {
                  if (searchResults[i].name === 'address') {
                    if(searchResults[i].results.length > 0){
                      for (var x = 0; x < searchResults[i].results.length; x++) {
                          var splitSearchText = searchText.split(" ");
                          splitSearchText.splice(0, 1);
                          var splitLabel = searchResults[i].results[x].label.split(" ");
                          if(splitLabel.length === splitSearchText.length){
                            completed = true;
                            q.resolve(searchResults[i].results[x]);
                          }
                      }              
                    }else{
                        q.resolve('could not find address');
                      }
                    }
                }

                if(!completed){

                  q.resolve('could not find address');
                }


              });
          });
        

        return q.promise;
      };


      simplicityBackend.formatTimeForQuery = function(jsDate){
        return simplicityAdapter.formatTimeForQuery(jsDate);
      };



      //****Return the factory object****//
      return simplicityBackend; 

    
    }]) //END simplicityBackend factory function
    .directive('simplicityCitizenServiceRequestForm', ['$http', '$q', 'simplicityHttp', '$stateParams', function($http, $q, simplicityHttp, $stateParams){
        return {

        restrict: 'A',
        //Defines the scope object for the directive 
        scope:{
          topic : '= simplicityCitizenServiceRequestForm',
        },

        replace : true,
        //Template for the directive
        templateUrl: 'citizen-service-request/request-form.html',
        controller : ['$scope', 'simplicityHttp', '$stateParams', function($scope, simplicityHttp, $stateParams){

  
          //base url for public stuff api
          var baseUrl = 'https://www.publicstuff.com/api/2.0/';
          var iframeBaseUrl = "https://iframe.publicstuff.com/#?client_id=819";

          //Submitting action states
          $scope.submitting = false;
          $scope.submitted = false;
          $scope.submittedWithSuccess = false;

          //Containers
          $scope.requestTypeOptions = [];
          $scope.citizenRequestType = {};
          $scope.citizenRequestTitle = "";
          $scope.requestTypeFields = [];
          $scope.requestedId = "";
          $scope.followUpUrl = "";

          var requestTypeUrl = baseUrl + "requesttypes_list";


          var checkRequired = function(truthyValue){
            if(truthyValue === 0){
              return false;
            }else{
              return true;
            }
          };

          var buildOptions = function(options){
       
            if(options.length === 0){
              return options;
            }

            var formattedOptions = [];

            for (var i = 0; i < options.length; i++) {
              formattedOptions.push({'value' : options[i].option.name, 'label' : options[i].option.name});
            }

            return formattedOptions;
          };

          //Get available request types
          var requestTypeParams = {
            'client_id' : 819,
            'return_type' : 'json'
          };
          simplicityHttp.get(requestTypeUrl, requestTypeParams)
          .then(function(httpResults){
            var requestTypesArray = [];
            for (var i = 0; i < httpResults.response.request_types.length; i++) {

              requestTypesArray.push({'value' : httpResults.response.request_types[i].request_type, 'label' : httpResults.response.request_types[i].request_type.name});
            }
            $scope.requestTypeOptions = requestTypesArray;
          });

          $scope.onChangeRequestType = function(requestType){
    
            $scope.requestTypeFields = [];

            if(requestType.value.disable_title === 0){
              var requestTypeTitle = {
                'name' : 'title', 
                'label' : '', 
                'description' : '', 
                'type' : 'hidden', 
                'options' : [],
                'value' : requestType.value.name,
                'required' : true
              };
              $scope.requestTypeFields.push(requestTypeTitle);
            }
            if(requestType.value.require_address === 1){
              var requestTypeAddress = {
                'name' : 'address', 
                'label' : 'Address', 
                'description' : '', 
                'type' : 'hidden', 
                'options' : [],
                'value' : $stateParams.searchtext,
                'required' : true
              };
              $scope.requestTypeFields.push(requestTypeAddress);
            }
            if(requestType.value.disable_description === 0){
              var requestTypeDescription = {
                'name' : 'description', 
                'label' : 'Description', 
                'description' : 'Anything else that we should know about the issue?', 
                'type' : 'textarea', 
                'value' : '',
                'options' : [],
                'required' : true
              };
              $scope.requestTypeFields.push(requestTypeDescription);
            }
            if(requestType.value.has_custom_fields === 1){
              for (var i = 0; i < requestType.value.custom_fields.length; i++) {
  
                  var requestTypeCustomField = {
                    'name' : 'custom_field_' + requestType.value.custom_fields[i].custom_field.id, 
                    'label' : requestType.value.custom_fields[i].custom_field.name, 
                    'description' : requestType.value.custom_fields[i].custom_field.description, 
                    'type' : requestType.value.custom_fields[i].custom_field.type, 
                    'options' : buildOptions(requestType.value.custom_fields[i].custom_field.options),
                    'value' : '',
                    'required' : checkRequired(requestType.value.custom_fields[i].custom_field.required)
                  };
                  $scope.requestTypeFields.push(requestTypeCustomField);
              }
              
            }
          };

          $scope.submitCitizenServiceRequest = function(){
            
            var q = $q.defer();
            $scope.submitting = true;

            var valuesToPost = {
              'return_type' : 'json',
              'space_id' : 3737,
              'request_type_id' : $scope.citizenRequestType.value.id,
              'latitude' : $scope.topic.center_y,
              'longitude' : $scope.topic.center_x,
              'client_id' : 819
            };

            //add form field values to post obj
            for (var i = 0; i < $scope.requestTypeFields.length; i++) {
              if($scope.requestTypeFields[i].type === 'singleselect'){
                valuesToPost[$scope.requestTypeFields[i].name] = $scope.requestTypeFields[i].value.value;
              }else if($scope.requestTypeFields[i].type === 'multiselect'){
                var multiSelectArray = [];
                for (var x = 0; x < $scope.requestTypeFields[i].value.length; x++) {
                  multiSelectArray.push($scope.requestTypeFields[i].value[x].value);
                }
                valuesToPost[$scope.requestTypeFields[i].name] = JSON.stringify(multiSelectArray);
              }else{
                valuesToPost[$scope.requestTypeFields[i].name] = $scope.requestTypeFields[i].value;
              }
            }


            //build a string of the url
            var submitRequestUrl = baseUrl + "request_submit?";

            for(var prop in valuesToPost){
              submitRequestUrl = submitRequestUrl + prop + "=" + valuesToPost[prop] + "&";
            }

            submitRequestUrl = submitRequestUrl.slice(0, -1);

            //make post request
            $http({method : 'POST', url : submitRequestUrl, data : {}, cache : false, headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}})
              //callbacks
              .success(function(data, status, headers, config){
                if(data.response.status.type === 'error'){
                  $scope.submitting = false;
                  $scope.submitted = true;
                  $scope.submittedWithSuccess = false;
                }else{
                  $scope.submitting = false;
                  $scope.submitted = true;
                  $scope.submittedWithSuccess = true;
                  $scope.requestedId = data.response.request_id;
                  $scope.followUpUrl = iframeBaseUrl + "&request_id=" + data.response.request_id;
                  $scope.requestTypeFields = [];
                  q.resolve(data);
                }
              })
              .error(function(error){
                  console.log('Error posting to public stuff.');
                  console.log(error);
              });
            return q.promise;
          };
        }]
      };
}]);





   


