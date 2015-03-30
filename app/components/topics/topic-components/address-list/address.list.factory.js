simplicity.factory('AddressList', ['$q', '$stateParams', 'AddressCache', 'simplicityBackend', 'COLORS',
  function($q, $stateParams, AddressCache, simplicityBackend, COLORS){   

    var AddressList = {};

    var topicProperties = {
      'name' : 'addresslist',
      'title' : 'Address List',
      'position' : 8,
      'searchby' : {
        'street_name' : {
          'params' : {
            'type' : null,
            'timeframe' : null,
            'extent' : 82.5,
            'view' : 'table'
          },
          'requiredParams' : [],
          'headerTemplate' : 'topics/topic-headers/topic.header.along.html',
        },
        'neighborhood' : {
          'params' : {
            'type' : null,
            'timeframe' : null,
            'extent' : null,
            'view' : 'table'
          },
          'requiredParams' : [],
          'headerTemplate' : 'topics/topic-headers/topic.header.in.html',
        }
      },
      'simpleViewTemplate' : null,
      'detailsViewTemplate' : null,
      'tableViewTemplate' : 'topics/topic-components/address-list/address-list.table.view.html',
      'listViewTemplate' : 'topics/topic-components/address-list/address-list.view.html',
      'defaultView' : 'simple',
      'iconClass' : 'flaticon-address7',
      'linkTopics' : ['property'],
      'questions' : {
        'topic' :  'Do you want a list of addresses?',
        'street_name' : 'Do you want a list of addresses along this street?',
        'neighborhood' :  'Do you want a list of addresses in this neighborhood?'
      }
    };

    AddressList.get = function(){
      var q = $q.defer();

      var addressCache = AddressCache.get();
      var civicaddressIdArray = AddressCache.civicaddressIdArray();

      if($stateParams.searchby === "street_name"){
        // var addressQueryParams = {
        //   'where' : "civicaddress_id in (" + civicaddressIdArray.join(',') + ")", 
        //   'f' : 'json',
        //   'outFields' : '*'
        // };
        simplicityBackend.simplicityQuery('addresses', {'civicaddressIds' : civicaddressIdArray.join(',')})
        //queryBackend(featureService.address, addressQueryParams)
          .then(function(addressResults){
              var addressFeaturesArray = [];
              for (var i = 0; i < addressResults.features.length; i++) {
                if(addressCache.inTheCity[addressResults.features[i].properties.civicaddress_id]){
                  addressResults.features[i].properties.isincity = addressCache.inTheCity[addressResults.features[i].properties.civicaddress_id];
                }else{
                  addressResults.features[i].properties.isincity = false;
                }
                
                addressResults.features[i].properties.color = '035096';

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
        // var neighborhoodQueryParams = {
        //   'where' : "neighborhood = '" + $stateParams.id + "'", 
        //   'f' : 'json',
        //   'outFields' : '*'
        // };
        simplicityBackend.simplicityQuery('addresses', {'neighborhoodName' : $stateParams.id })
        //queryBackend(featureService.address, neighborhoodQueryParams)
          .then(function(addressResults){
            var addressFeaturesArray = [];
              for (var i = 0; i < addressResults.features.length; i++) {
                addressResults.features[i].properties.color = '035096';
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

    AddressList.getTopicProperties = function(){
      return topicProperties;
    };

    //****Return the factory object****//
    return AddressList; 

    
}]); //END AddressList factory function




   


