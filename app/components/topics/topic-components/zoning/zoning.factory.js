simplicity.factory('Zoning', ['$q', '$stateParams', 'AddressCache', 'simplicityBackend', 'CODELINKS',
  function($q, $stateParams, AddressCache, simplicityBackend, CODELINKS){   

    var Zoning = {};

    var topicProperties = {
      'name' : 'zoning',
      'title' : 'Zoning',
      'plural' : 'zoning',
      'searchForText' : 'an address',
      'position' : 6,
      'downloadable' : false,
      'inTheCityOnly' : true,
      'searchby' : {
        'address' : {
          'params' : {
            'type' : null,
            'timeframe' : null,
            'extent' : null,
            'view' : 'simple',
            'validViews' : ['simple']
          },
          'requiredParams' : [],
          'headerTemplate' : 'topics/topic-headers/topic.header.at.html',
        }
      },
      'views' : {
        'simple' : {'label' : 'Simple View', 'template' : 'topics/topic-components/zoning/zoning.view.html'}
      },
      'iconClass' : 'flaticon-map104',
      'linkTopics' : ['property', 'crime', 'development'],
      'questions' : {
        'topic' :  'Do you want to know about a zoning?', 
        'address' :  'Do you want to know about the zoning at this address?'
      }
    };

    var formatZoningPropertyForAnAddress = function(){
      var addressCache = AddressCache.get();
      var pinnum2civicaddressid = AddressCache.pinnum2civicaddressid();
      var formattedZoningArray = [];
      if(addressCache.zoning){
        for (var z = 0; z < addressCache.zoning.length; z++) {
          var zoningDistrict = addressCache.zoning[z];
          if(CODELINKS[zoningDistrict] === undefined){
            formattedZoningArray.push({'zoningDistrict' : zoningDistrict, 'codelink' : 'disable'});
          }else{
            formattedZoningArray.push({'zoningDistrict' : zoningDistrict, 'codelink' : CODELINKS[zoningDistrict]});
          }
        }
      } 
      return formattedZoningArray;
    };

    Zoning.build = function(){
      var q = $q.defer();
      var addressCache = AddressCache.get();
      var codelink;
      if(CODELINKS[addressCache.zoning] === undefined){
        codelink = 'disable';
      }else{
        codelink = CODELINKS[addressCache.zoning];
      }
      var geojson = {
        'type' : 'FeatureCollection',
        'summary' : {},
        'searchGeojson' : addressCache.searchGeojson,
        'features' : [{
            'type' : 'Feature',
            'properties' : {
              'zoning' : formatZoningPropertyForAnAddress(),
              'zoningOverlays' : addressCache.zoningOverlays,
            },
            'geometry' : {
              'type' : 'Point',
              'coordinates' : [addressCache.searchGeojson.features[0].geometry.coordinates[0], addressCache.searchGeojson.features[0].geometry.coordinates[1]]
            }
        }]
      };
      if(addressCache.zoningOverlays){
        var zoningOverlaysSplit = addressCache.zoningOverlays.split('-');
        simplicityBackend.simplicityQuery('zoningOverlays', {'zoningOverlayName' : zoningOverlaysSplit[0]})
            .then(function(zoningOverlayLayer){
              geojson.overlays = zoningOverlayLayer;
              q.resolve(geojson);
            });
      }else{
        q.resolve(geojson);
      }
            
      return q.promise;
    };

    Zoning.getTopicProperties = function(){
      return topicProperties;
    };

    //****Return the factory object****//
    return Zoning; 

    
}]); //END Zoning factory function




   


