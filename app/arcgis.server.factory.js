
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
      'geocodeServiceName' : 'coa_composite_locator',
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
        'SingleLine' : address,
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