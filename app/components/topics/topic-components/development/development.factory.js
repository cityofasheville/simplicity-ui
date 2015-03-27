simplicity.factory('Development', ['$http', '$location', '$q', '$filter', '$stateParams', 'AddressCache', 'simplicityBackend', 'COLORS',
  function($http, $location, $q, $filter, $stateParams, AddressCache, simplicityBackend, COLORS){   

    var Development = {};

    var last30days = new Date();
    var last6months = new Date();
    var lastyear = new Date();
    var last5years = new Date();
    var last10years = new Date();
    var allTime = new Date();

    var timeframeLookup = {
      'last-30-days' : last30days.setMonth(last30days.getMonth() - 1),
      'last-6-months' : last6months.setMonth(last6months.getMonth() - 6),
      'last-year' : lastyear.setFullYear(lastyear.getFullYear()-1),
      'last-5-years': last5years.setFullYear(last5years.getFullYear()-5),
      'last-10-years': last10years.setFullYear(last10years.getFullYear()-10),
      'all-time' : allTime.setFullYear(allTime.getFullYear()-100)
    };



    var formatDevelopmentData = function(development){
      var addressCache = AddressCache.get();

      //object that holds a summary of the feature {filterValue : count}
      //e.g. for crime {'Bulgary' : 12, 'Larceny' : 2}
      var filteredFeaturesSummary= {
        'template' : 'summary',
        'table' : {}
      };
      //array that holds features filtered by time and the filter value
      var filterdFeaturesArray = [];

      for (var i = 0; i < development.features.length; i++) {
      
        //set color by record_type
        development.features[i].properties.color = COLORS.development[development.features[i].properties.record_type];          
        //build a summary object
        if(filteredFeaturesSummary.table[development.features[i].properties.record_type] === undefined){

          filteredFeaturesSummary.table[development.features[i].properties.record_type] = {'color' : COLORS.development[development.features[i].properties.record_type], 'count' : 1 };

        }else{
          filteredFeaturesSummary.table[development.features[i].properties.record_type].count = filteredFeaturesSummary.table[development.features[i].properties.record_type].count + 1;
        }
        if(development.features[i].properties.record_comments){
          development.features[i].properties.commentsArray = development.features[i].properties.record_comments.split('[NEXT-COMMENT]');
        }
        filterdFeaturesArray.push(development.features[i]);
          
      }
      
      var geojson = {
        'type' : 'FeatureCollection',
        'summary' : filteredFeaturesSummary,
        'searchGeojson' : addressCache.searchGeojson,
        'features' : filterdFeaturesArray
      };

      return geojson;

    };//END formatDevelopmentData

    
    Development.get = function(){
      var q = $q.defer();

      //So we can filter by time
      var time = new Date(timeframeLookup[$stateParams.timeframe]);
      var year = time.getFullYear();
      var month = time.getMonth() + 1;
      var date = time.getDate();

      //!!! TODO: THIS IS AN ESRI FORMATTED DATE, NEED TO ABSTRACT 
      var timeExpression = "'" + year + "-" + month + "-" + date + "'";

      var addressCache = AddressCache.get();

      if(addressCache || $stateParams.searchby === 'neighborhood'){
        var queryValues = {};
        if ($stateParams.searchby === 'neighborhood') {
          queryValues = {
            'neighborhoodName' : $stateParams.id,
            'time' : timeExpression,
          }
          simplicityBackend.simplicityQuery('development', queryValues)
            .then(function(development){
                q.resolve(formatDevelopmentData(development));
            });
        }else{
          if(addressCache.development){ 
            

            if(addressCache.development[Number($stateParams.extent)]){
              var stringOfPermitIds = '';

              for (var i = 0; i < addressCache.development[$stateParams.extent].length; i++) {
                if(i === 0){
                  stringOfPermitIds = stringOfPermitIds + "'" + addressCache.development[$stateParams.extent][i] + "'";
                }else{
                  stringOfPermitIds = stringOfPermitIds + ",'" + addressCache.development[$stateParams.extent][i] + "'";
                }         
              }
              queryValues = {
                'permitIds' : stringOfPermitIds,
                'time' : timeExpression
              }
              simplicityBackend.simplicityQuery('development', queryValues)
                .then(function(development){
                    q.resolve(formatDevelopmentData(development));
                });
            }else{
              q.resolve(formatDevelopmentData({'features' : []}));
            }
          }else{
            q.resolve(formatDevelopmentData({'features' : []}));
          }
        }
      }else{
        q.resolve(formatDevelopmentData({'features' : []}));
      }
      return q.promise;
    };


    //****Return the factory object****//
    return Development; 

    
}]); //END Development factory function




   


