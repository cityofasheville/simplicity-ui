simplicity.factory('Crime', ['$http', '$location', '$q', '$filter', '$stateParams', 'AddressCache', 'simplicityBackend', 'COLORS',
  function($http, $location, $q, $filter, $stateParams, AddressCache, simplicityBackend, COLORS){   

    var Crime = {};

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



    var formatCrimeData = function(crimes){
      var addressCache = AddressCache.get();

      //object that holds a summary of the feature {filterValue : count}
      //e.g. for crime {'Bulgary' : 12, 'Larceny' : 2}
      var filteredFeaturesSummary= {
        'template' : 'summary',
        'table' : {}
      };
      //array that holds features filtered by time and the filter value
      var filterdFeaturesArray = [];

      for (var i = 0; i < crimes.features.length; i++) {
        //set color by offense
        crimes.features[i].properties.color = COLORS.crime[crimes.features[i].properties.offense]; 
        //build a summary object
        if(filteredFeaturesSummary.table[crimes.features[i].properties.offense] === undefined){

          filteredFeaturesSummary.table[crimes.features[i].properties.offense] = {'color' : COLORS.crime[crimes.features[i].properties.offense], 'count' : 1 };

        }else{
          filteredFeaturesSummary.table[crimes.features[i].properties.offense].count = filteredFeaturesSummary.table[crimes.features[i].properties.offense].count + 1;
        }
        filterdFeaturesArray.push(crimes.features[i]);
      }
      
      var geojson = {
        'type' : 'FeatureCollection',
        'summary' : filteredFeaturesSummary,
        'searchGeojson' : addressCache.searchGeojson,
        'features' : filterdFeaturesArray
      };

      return geojson;

    };//END formatCrimeData

    
    Crime.get = function(){
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
          simplicityBackend.simplicityQuery('crimes', queryValues)
            .then(function(crimes){
                q.resolve(formatCrimeData(crimes));
                console.log(crimes);
            });
        }else{
          if(addressCache.crime){ 
            if(addressCache.crime[Number($stateParams.extent)]){
              queryValues = {
                'crimeIds' : addressCache.crime[Number($stateParams.extent)],
                'time' : timeExpression,
              }
              simplicityBackend.simplicityQuery('crimes', queryValues)
                .then(function(crimes){
                    q.resolve(formatCrimeData(crimes));
                    console.log(crimes);
                });
            }else{
              q.resolve(formatCrimeData({'features' : []}));
            }
          }else{
            q.resolve(formatCrimeData({'features' : []}));
          }
        }
      }else{
        q.resolve(formatCrimeData({'features' : []}));
      }
      return q.promise;
    };


    //****Return the factory object****//
    return Crime; 

    
}]); //END Crime factory function




   


