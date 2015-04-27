simplicity.factory('AddressMailingList', ['$q', '$stateParams', 'AddressCache', 'simplicityBackend', 'COLORS',
  function($q, $stateParams, AddressCache, simplicityBackend, COLORS){   

    var AddressMailingList = {};

    var topicProperties = {
      'name' : 'addressmailinglist',
      'title' : 'Address Mailing List',
      'plural' : 'address mailing lists',
      'searchForText' : 'a street or a neighborhood',
      'position' : 8,
      'downloadable' : true,
      'inTheCityOnly' : false,
      'searchby' : {
        'street_name' : {
          'params' : {
            'type' : null,
            'timeframe' : null,
            'extent' : 82.5,
            'view' : 'list',
            'validViews' : ['list', 'map']
          },
          'prepositions' : {
            'searchby' : 'along',
          },
          'requiredParams' : [],
          'headerTemplate' : 'topics/topic-headers/topic.header.along.html',
        },
        'neighborhood' : {
          'params' : {
            'type' : null,
            'timeframe' : null,
            'extent' : null,
            'view' : 'list',
            'validViews' : ['list', 'map']
          },
          'prepositions' : {
            'searchby' : 'in',
          },
          'requiredParams' : [],
          'headerTemplate' : 'topics/topic-headers/topic.header.in.html',
        }
      },
      'views' : {
        'map' : {'label' : 'Map View', 'template' : null},
        'list' : {'label' : 'List View', 'template' : 'topics/topic-components/address-list/address-list.view.html'},
      },
      'simpleViewTemplate' : null,
      'detailsViewTemplate' : null,
      'tableViewTemplate' : 'topics/topic-components/address-list/address-list.table.view.html',
      'listViewTemplate' : 'topics/topic-components/address-list/address-list.view.html',
      'defaultView' : 'simple',
      'iconClass' : 'flaticon-email20',
      'linkTopics' : ['property'],
      'questions' : {
        'topic' :  'Do you want a mailing lists?',
        'street_name' : 'Do you want a mailing list of addresses for residents along this street?',
        'neighborhood' :  'Do you want a mailing list of addresses for residents in this neighborhood?'
      }
    };

    AddressMailingList.build = function(){
      var q = $q.defer();

      var addressCache = AddressCache.get();
      var civicaddressIdArray = AddressCache.civicaddressIdArray();

      if($stateParams.searchby === "street_name"){
        simplicityBackend.simplicityQuery('addresses', {'civicaddressIds' : civicaddressIdArray.join(',')})
          .then(function(addressResults){
              var addressFeaturesArray = [];
              for (var i = 0; i < addressResults.features.length; i++) {
                var propObj = {
                  'objectid' : addressResults.features[i].properties.objectid,
                  'street_number' : addressResults.features[i].properties.street_number,
                  'street_name' : addressResults.features[i].properties.street_name,
                  'street_type' : addressResults.features[i].properties.street_type,
                  'unit_number' : addressResults.features[i].properties.unit_number,
                  'zip_code' : addressResults.features[i].properties.zip_code
                };
                
                addressResults.features[i].properties = propObj;

                addressFeaturesArray.push(addressResults.features[i]);
              }
              var geojson = {
                'type' : 'FeatureCollection',
                'summary' : {},
                'searchGeojson' : addressCache.searchGeojson,
                'features' : addressFeaturesArray
              };
              q.resolve(geojson);
          });
      }else if($stateParams.searchby === "neighborhood"){
        simplicityBackend.simplicityQuery('addresses', {'neighborhoodName' : $stateParams.id })
          .then(function(addressResults){
            var addressFeaturesArray = [];
              for (var i = 0; i < addressResults.features.length; i++) {
                var propObj = {
                  'objectid' : addressResults.features[i].properties.objectid,
                  'street_number' : addressResults.features[i].properties.street_number,
                  'street_name' : addressResults.features[i].properties.street_name,
                  'street_type' : addressResults.features[i].properties.street_type,
                  'unit_number' : addressResults.features[i].properties.unit_number,
                  'zip_code' : addressResults.features[i].properties.zip_code
                };
                
                addressResults.features[i].properties = propObj;

                addressFeaturesArray.push(addressResults.features[i]);
              }
              var geojson = {
                'type' : 'FeatureCollection',
                'summary' : {},
                'searchGeojson' : addressCache.searchGeojson,
                'features' : addressFeaturesArray
              };
              q.resolve(geojson);
          });
      }

      return q.promise;
    };

    AddressMailingList.getTopicProperties = function(){
      return topicProperties;
    };

    //****Return the factory object****//
    return AddressMailingList; 

    
}]); //END AddressMailingList factory function




   


