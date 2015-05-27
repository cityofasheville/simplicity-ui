simplicity.factory('Crime', ['$http', '$location', '$q', '$filter', '$stateParams', 'AddressCache', 'simplicityBackend', 'TimeFrame', 'COLORS', 'DESCRIPTIONS', 'simplicityArcGisRestApiAdapter', 'simplicityHttp',
  function($http, $location, $q, $filter, $stateParams, AddressCache, simplicityBackend, TimeFrame, COLORS, DESCRIPTIONS, simplicityArcGisRestApiAdapter, simplicityHttp){   

    var Crime = {};

    var topicProperties = {
      'name' : 'crime',
      'title' : 'Crime',
      'plural' : 'crimes',
      'searchForText' : 'an address, street, or neighborhood',
      'position' : 2,
      'downloadable' : true,
      'inTheCityOnly' : true,
      'searchby' : {
        'address' : {
          'params' : {
            'type' : null,
            'timeframe' : 'last-year',
            'extent' : 660,
            'view' : 'summary',
            'validViews' : ['summary', 'list', 'map']
          },
          'prepositions' : {
            'timeframe' : 'during',
            'extent' : 'within',
            'searchby' : 'of'
          },
          'requiredParams' : ['timeframe', 'extent'],
          'headerTemplate' : 'topics/topic-headers/topic.header.during.within.of.html',
        },
        'google_places' : {
          'params' : {
            'type' : null,
            'timeframe' : 'last-year',
            'extent' : 660,
            'view' : 'summary',
            'validViews' : ['summary', 'list', 'map']
          },
          'prepositions' : {
            'timeframe' : 'during',
            'extent' : 'within',
            'searchby' : 'of'
          },
          'requiredParams' : ['timeframe', 'extent'],
          'headerTemplate' : 'topics/topic-headers/topic.header.during.within.of.html',
        },
        'street_name' : {
          'params' : {
            'type' : null,
            'timeframe' : 'last-year',
            'extent' : 82.5,
            'view' : 'summary',
            'validViews' : ['summary', 'list', 'map']
          },
          'prepositions' : {
            'timeframe' : 'during',
            'searchby' : 'along'
          },
          'requiredParams' : ['timeframe'],
          'headerTemplate' : 'topics/topic-headers/topic.header.during.along.html',
        },
        'neighborhood' : {
          'params' : {
            'type' : null,
            'timeframe' : 'last-year',
            'extent' : null,
            'view' : 'summary',
            'validViews' : ['summary', 'list', 'map']
          },
          'prepositions' : {
            'timeframe' : 'during',
            'searchby' : 'in'
          },
          'requiredParams' : ['timeframe'],
          'headerTemplate' : 'topics/topic-headers/topic.header.during.in.html',
        }
      },
      'views' : {
        'map' : {'label' : 'Map View', 'template' : null},
        'summary' : {'label' : 'Summary', 'template' : 'topics/topic-components/crime/crime.summary.view.html'},
        'list' : {'label' : 'Details View', 'template' : 'topics/topic-components/crime/crime.list.view.html'},
      },
      'iconClass' : 'flaticon-police19',
      'linkTopics' : ['property', 'trash', 'recycling', 'development'],
      'questions' : {
        'topic' : 'Do you want to know about crime?',
        'address' : 'Do you want to know about crimes near this address?',
        'street_name' : 'Do you want to know about crimes along this street?',
        'neighborhood' : 'Do you want to know about crimes in this neighborhood?'
      }
    };


    var makeAStringOfIds = function(a){
      
      var q = $q.defer();
      var stringOfCrimeIds = '';
      for (var i = 0; i < a.length; i++) {

        if(i === 0){
          stringOfCrimeIds = stringOfCrimeIds + "'" + a[i] + "'";
        }else{
          stringOfCrimeIds = stringOfCrimeIds + ",'" + a[i] + "'";
        }         
      }

      q.resolve( stringOfCrimeIds);
      return q.promise;
    };


    var makeSingleRequest = function(a){
      var q = $q.defer();

      
      makeAStringOfIds(a)
        .then(function(stringOfCrimeIds){
          
          //var timeExpression = "'2014-5-22'";
          var time = new Date(TimeFrame.get($stateParams.timeframe));
          var timeExpression = simplicityBackend.formatTimeForQuery(time);
          var queryValues = {
            'crimeIds' : stringOfCrimeIds,
            'time' : timeExpression,
          };
          
          simplicityBackend.simplicityQuery('crimes', queryValues)
            .then(function(data){
              q.resolve(data);
            })

        });

        return q.promise;
    }


    var makeMultipleRequests = function(arrayOfArraysContainingCrimeIds){    
       
      var queryParamsArray = [];
  
      for (var i = 0; i < arrayOfArraysContainingCrimeIds.length; i++) {
        queryParamsArray.push(makeSingleRequest(arrayOfArraysContainingCrimeIds[i]));
        
        if(queryParamsArray.length === arrayOfArraysContainingCrimeIds.length){
          return $q.all(queryParamsArray);
        }
      };
      
    }


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
        crimes.features[i].properties.typeDescription = DESCRIPTIONS.crime[crimes.features[i].properties.offense]; 
        //build a summary object
        if(filteredFeaturesSummary.table[crimes.features[i].properties.offense] === undefined){

          filteredFeaturesSummary.table[crimes.features[i].properties.offense] = {'color' : COLORS.crime[crimes.features[i].properties.offense], 'count' : 1, 'description' : DESCRIPTIONS.crime[crimes.features[i].properties.offense]};

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

    
    Crime.build = function(){
      var q = $q.defer();

      var time = new Date(TimeFrame.get($stateParams.timeframe));
      var timeExpression = simplicityBackend.formatTimeForQuery(time);

      var addressCache = AddressCache.get();

      if(addressCache || $stateParams.searchby === 'neighborhood'){
        var queryValues = {};
        if ($stateParams.searchby === 'neighborhood') {
          queryValues = {
            'neighborhoodName' : $stateParams.id,
            'time' : timeExpression,
          };
          simplicityBackend.simplicityQuery('crimes', queryValues)
            .then(function(crimes){
                q.resolve(formatCrimeData(crimes));
            });
        }else{
          if(addressCache.crime){ 
            if(addressCache.crime[Number($stateParams.extent)]){
              if(addressCache.crime[$stateParams.extent].length < 150){
                var stringOfCrimeIds = '';

                for (var i = 0; i < addressCache.crime[$stateParams.extent].length; i++) {
                  if(i === 0){
                    stringOfCrimeIds = stringOfCrimeIds + "'" + addressCache.crime[$stateParams.extent][i] + "'";
                  }else{
                    stringOfCrimeIds = stringOfCrimeIds + ",'" + addressCache.crime[$stateParams.extent][i] + "'";
                  }         
                }
                queryValues = {
                  'crimeIds' : stringOfCrimeIds,
                  'time' : timeExpression,
                };
                simplicityBackend.simplicityQuery('crimes', queryValues)
                  .then(function(crimes){
                      q.resolve(formatCrimeData(crimes));
                  });
              }else{

                //There could be a lot of crimeIds, so split then into batches of 150
                //this should keep the url length below 2000
                var crimeIds = addressCache.crime[$stateParams.extent];
                var crimeIdsContainerArray = [];

                while(crimeIds.length >= 150){
                  var arraySection = crimeIds.splice(0, 150);
                  crimeIdsContainerArray.push(arraySection);
                }

                crimeIdsContainerArray.push(crimeIds);

                makeMultipleRequests(crimeIdsContainerArray)
                  .then(function(multipleRequestsResults){
                    //Combine all the requests into one geojson object
                    var combinedGeoJson = {
                      'features' : [],
                      'type' : "FeatureCollection"
                    }
                    for (var m = 0; m < multipleRequestsResults.length; m++) {
                      for (var f = 0; f < multipleRequestsResults[m].features.length; f++) {
                        combinedGeoJson.features.push(multipleRequestsResults[m].features[f]);
                      };
                      
                    };
                    q.resolve(formatCrimeData(combinedGeoJson) ); 
                    
                    
                  });
              }
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

    Crime.getTopicProperties = function(){
      return topicProperties;
    };


    //****Return the factory object****//
    return Crime; 

    
}]); //END Crime factory function




   


