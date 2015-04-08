simplicity.factory('Crime', ['$http', '$location', '$q', '$filter', '$stateParams', 'AddressCache', 'simplicityBackend', 'TimeFrame', 'COLORS', 'DESCRIPTIONS',
  function($http, $location, $q, $filter, $stateParams, AddressCache, simplicityBackend, TimeFrame, COLORS, DESCRIPTIONS){   

    var Crime = {};

    var topicProperties = {
      'name' : 'crime',
      'title' : 'Crime',
      'plural' : 'crimes',
      'searchForText' : 'an address, street, or neighborhood',
      'position' : 2,
      'searchby' : {
        'address' : {
          'params' : {
            'type' : null,
            'timeframe' : 'last-year',
            'extent' : 660,
            'defaultView' : 'summary',
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
            'defaultView' : 'summary',
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
            'defaultView' : 'summary',
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
            'defaultView' : 'summary',
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
        'list' : {'label' : 'List View', 'template' : 'topics/topic-components/crime/crime.list.view.html'},
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
        crimes.features[i].properties.description = DESCRIPTIONS.crime[crimes.features[i].properties.offense]; 
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
      console.log($stateParams.timeframe);

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
              queryValues = {
                'crimeIds' : addressCache.crime[Number($stateParams.extent)],
                'time' : timeExpression,
              };
              simplicityBackend.simplicityQuery('crimes', queryValues)
                .then(function(crimes){
                    q.resolve(formatCrimeData(crimes));
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

    Crime.getTopicProperties = function(){
      return topicProperties;
    };


    //****Return the factory object****//
    return Crime; 

    
}]); //END Crime factory function




   


