simplicity.factory('Development', ['$http', '$location', '$q', '$filter', '$stateParams', 'AddressCache', 'simplicityBackend', 'TimeFrame','COLORS', 'DESCRIPTIONS',
  function($http, $location, $q, $filter, $stateParams, AddressCache, simplicityBackend, TimeFrame, COLORS, DESCRIPTIONS){   

    var Development = {};

    var topicProperties = {
      'name' : 'development',
      'title' : 'Development',
      'plural' : 'development',
      'searchForText' : 'an address, street, or neighborhood',
      'position' : 3, 
      'searchby' : {
        'address' : {
          'params' : {
            'type' : null,
            'timeframe' : 'last-year',
            'extent' : 660,
            'defaultView' : 'summary',
            'validViews' : ['summary', 'list', 'map']
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
          'requiredParams' : ['timeframe'],
          'headerTemplate' : 'topics/topic-headers/topic.header.during.in.html',
        }
      },
      'views' : {
        'map' : {'label' : 'Map View', 'template' : null},
        'summary' : {'label' : 'Summary', 'template' : 'topics/topic-components/development/development.summary.view.html'},
        'list' : {'label' : 'List View', 'template' : 'topics/topic-components/development/development.list.view.html'},
      },
      'iconClass' : 'flaticon-building33',
      'linkTopics' : ['property', 'trash', 'recycling', 'crime'],
      'questions' : {
        'topic' : 'Do you want to know about development?',
        'address' : 'Do you want to know about development near this address?',
        'street_name' : 'Do you want to know about development along this street?',
        'neighborhood' : 'Do you want to know about development in this neighborhood?'
      }
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
        development.features[i].properties.description = DESCRIPTIONS.development[development.features[i].properties.record_type];       
        //build a summary object
        if(filteredFeaturesSummary.table[development.features[i].properties.record_type] === undefined){

          filteredFeaturesSummary.table[development.features[i].properties.record_type] = {'color' : COLORS.development[development.features[i].properties.record_type], 'count' : 1, 'description' : DESCRIPTIONS.development[development.features[i].properties.record_type]};

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

    
    Development.build = function(){
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
              };
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

    Development.getTopicProperties = function(){
      return topicProperties;
    };


    //****Return the factory object****//
    return Development; 

    
}]); //END Development factory function




   


