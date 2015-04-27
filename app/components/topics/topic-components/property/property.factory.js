simplicity.factory('Property', ['$http', '$location', '$q', '$filter', '$stateParams', 'AddressCache', 'simplicityBackend', 'COLORS', 'CODELINKS',
  function($http, $location, $q, $filter, $stateParams, AddressCache, simplicityBackend, COLORS, CODELINKS){   

    var Property = {};


    var topicProperties = {
      'name' : 'property',
      'plural' : 'properties',
      'title' : 'Property',
      'searchForText' : 'an address, street, owner, or PIN',
      'position' : 1,
      'downloadable' : true,
      'inTheCityOnly' : false,
      'searchby' : {
        'address' : {
          'params' : {
            'type' : null,
            'timeframe' : null,
            'extent' : null,
            'centermap' : null,
            'view' : 'details',
            'validViews' : ['details', 'map']
          },
          'prepositions' : {
            'searchby' : 'at',
          },
          'headerTemplate' : 'topics/topic-headers/topic.header.at.html',
        },
        'google_places' : {
          'params' : {
            'type' : null,
            'timeframe' : null,
            'extent' : null,
            'centermap' : null,
            'view' : 'details',
            'validViews' : ['details', 'map']
          },
          'prepositions' : {
            'searchby' : 'at',
          },
          'headerTemplate' : 'topics/topic-headers/topic.header.at.html',
        },
        'street_name' : {
          'params' : {
            'type' : null,
            'timeframe' : null,
            'extent' : null,
            'centermap' : null,
            'view' : 'list',
            'validViews' : ['list', 'map']
          },
          'prepositions' : {
            'searchby' : 'along',
          },
          'headerTemplate' : 'topics/topic-headers/topic.header.along.html',
        },
        'pinnum' : {
          'params' : {
            'type' : null,
            'timeframe' : null,
            'extent' : null,
            'centermap' : null,
            'view' : 'details',
            'validViews' : ['details', 'map']
          },
          'prepositions' : {
            'searchby' : 'at',
          },
          'headerTemplate' : 'topics/topic-headers/topic.header.at.html',
        },
        'owner_name' : {
          'params' : {
            'type' : null,
            'timeframe' : null,
            'extent' : null,
            'centermap' : null,
            'view' : 'list',
            'validViews' : ['list', 'map']
          },
          'prepositions' : {
            'searchby' : 'owned by',
          },
          'headerTemplate' : 'topics/topic-headers/topic.header.ownedby.html',
        }
      },
      'views' : {
        'map' : {'label' : 'Map View', 'template' : null},
        'details' : {'label' : 'Details View', 'template' : 'topics/topic-components/property/property.details.view.html'},
        'list' : {'label' : 'List View', 'template' : 'topics/topic-components/property/property.list.view.html'},
      },
      'iconClass' : 'flaticon-house112',
      'linkTopics' : ['crime', 'trash', 'recycling'],
      'questions' : {
        'topic' : 'Do you want to know about a property?',
        'address' : 'Do you want to know about the property at this address?',
        'street_name' : 'Do you want to know about the properties along this street?',
        'pinnum' : 'Do you want to know about the property for this PIN?',
        'owner_name' : 'Do you want to know about the properties owned by this owner?'
      }
    };

    var formatZoningPropertyForAnAddress = function(){
      var addressCache = AddressCache.get();
      var pinnum2civicaddressid = AddressCache.pinnum2civicaddressid();
      var formattedZoningArray = [];
      for (var z = 0; z < addressCache.zoning.length; z++) {
        var zoningDistrict = addressCache.zoning[z];
        if(CODELINKS[zoningDistrict] === undefined){
          formattedZoningArray.push({'zoningDistrict' : zoningDistrict, 'codelink' : 'disable'});
        }else{
          formattedZoningArray.push({'zoningDistrict' : zoningDistrict, 'codelink' : CODELINKS[zoningDistrict]});
        }
      }
      return formattedZoningArray;
    };

    var formatZoningPropertyForMultipleAddressess = function(civicaddressId){
      var addressCache = AddressCache.get();
      var pinnum2civicaddressid = AddressCache.pinnum2civicaddressid();
      var formattedZoningArray = [];
      if(addressCache.zoning[civicaddressId]){
        for (var z = 0; z < addressCache.zoning[civicaddressId].length; z++) {
          var zoningDistrict = addressCache.zoning[civicaddressId][z];
          if(CODELINKS[zoningDistrict] === undefined){
            formattedZoningArray.push({'zoningDistrict' : zoningDistrict, 'codelink' : 'disable'});
          }else{
            formattedZoningArray.push({'zoningDistrict' : zoningDistrict, 'codelink' : CODELINKS[zoningDistrict]});
          }
        }
        return formattedZoningArray;
      }else{
        return undefined;
      }  
    };


    var formatPropertyData = function(property){
      var addressCache = AddressCache.get();
      var pinnum2civicaddressid = AddressCache.pinnum2civicaddressid();
      var q = $q.defer();
      if(property.features.length > 1){
        property.searchGeojson = addressCache.searchGeojson;
      }

      for (var p = 0; p < property.features.length; p++) {

        if($stateParams.searchby === "address"){
          property.features[p].properties.civicaddress_id = $stateParams.id;
          
          if(addressCache.zoning){
            property.features[p].properties.zoning = formatZoningPropertyForAnAddress();
          }
          
        }else if($stateParams.searchby === 'pinnum' || $stateParams.searchby === 'owner_name' || $stateParams.searchby === 'street_name'){
          property.features[p].properties.civicaddress_id = pinnum2civicaddressid[property.features[p].properties.pinnum];
          if(addressCache.zoning){
            property.features[p].properties.zoning = formatZoningPropertyForMultipleAddressess(property.features[p].properties.civicaddress_id);
          }          
        }
        property.features[p].properties.googleDirectionsLink = "http://maps.google.com/maps?daddr=" + property.features[p].properties.center_y + "," + property.features[p].properties.center_x;
        property.features[p].properties.color = '035096';
        property.features[p].properties.zoningOverlays = addressCache.zoningOverlays;
        

        if(addressCache.zoningOverlays){
          var zoningOverlaysSplit = addressCache.zoningOverlays.split('-');
          simplicityBackend.simplicityQuery('zoningOverlays', {'zoningOverlayName' : zoningOverlaysSplit[0]})
            .then(function(zoningOverlayLayer){
              property.overlays = zoningOverlayLayer;
              q.resolve(property);
            });
        }else{
          q.resolve(property);
        }
      }
      return  q.promise;
    };


    //We need to use the pinnum to lookup property information 
    //We can access the pinnum by cross-referencing the cividaddress id or centerline id in the xref table
    //WE can acess the civicaddress id from the stateParams
    Property.build = function(){
      var addressCache = AddressCache.get();
      var pinnum2civicaddressid = AddressCache.pinnum2civicaddressid();
      var q = $q.defer();

      if($stateParams.searchby === 'address'){ 

        simplicityBackend.simplicityQuery('xrefs', {'civicaddressId' : Number($stateParams.id)})
          .then(function(xRef){

            simplicityBackend.simplicityQuery('properties', {'pinnum' : xRef.features[0].properties.pinnum})
              .then(function(property){
                q.resolve(formatPropertyData(property));
              });
          });
      }else if($stateParams.searchby === 'street_name'){ 

        var idArray = $stateParams.id.split(',');

        for (var i = 0; i < idArray.length; i++) {
          idArray[i] = Number(idArray[i]);
        }

        simplicityBackend.simplicityQuery('xrefs', {'centerlineIds' : idArray.join()})
          .then(function(xRefPin){
            var xrefPinString = '';
            for (var x = 0; x < xRefPin.features.length; x++) {
              if(x === 0){
                xrefPinString = xrefPinString + "'" + xRefPin.features[x].properties.pinnum + "'";
              }else{
                xrefPinString = xrefPinString + ",'" + xRefPin.features[x].properties.pinnum + "'";
              }         
            }
            simplicityBackend.simplicityQuery('properties', {'pinnums' : xrefPinString})
              .then(function(property){
                q.resolve(formatPropertyData(property));
              });
          });
      }else if ($stateParams.searchby === 'pinnum' || $stateParams.searchby === 'owner_name'){
        var pinArray = $stateParams.id.split(',');
        var pinString = '';
        for (var p = 0; p < pinArray.length; p++) {
          if(p === 0){
            pinString = pinString + "'" + pinArray[p] + "'";
          }else{
            pinString = pinString + ",'" + pinArray[p] + "'";
          }         
        }
        simplicityBackend.simplicityQuery('properties', {'pinnums' : pinString})
          .then(function(property){
            q.resolve(formatPropertyData(property));
          });
      }
      return q.promise;
    };//END property function

    Property.getTopicProperties = function(){
      return topicProperties;
    };


    //****Return the factory object****//
    return Property; 

    
}]); //END Property factory function




   


