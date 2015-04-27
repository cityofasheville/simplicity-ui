simplicity.factory('Owner', ['$http', '$location', '$q', '$filter', '$stateParams', 'AddressCache', 'simplicityBackend', 'COLORS', 'CODELINKS',
  function($http, $location, $q, $filter, $stateParams, AddressCache, simplicityBackend, COLORS, CODELINKS){   

    var Owner = {};


    var topicProperties = {
      'name' : 'owner',
      'plural' : 'owners',
      'title' : 'Owner',
      'searchForText' : 'an address, street, owner, or PIN',
      'position' : 9,
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
        'neighborhood' : {
          'params' : {
            'type' : null,
            'timeframe' : null,
            'extent' : null,
            'centermap' : null,
            'view' : 'details',
            'validViews' : ['details', 'map']
          },
          'prepositions' : {
            'searchby' : 'in',
          },
          'headerTemplate' : 'topics/topic-headers/topic.header.in.html',
        }
      },
      'views' : {
        'map' : {'label' : 'Map View', 'template' : null},
        'details' : {'label' : 'Details View', 'template' : 'topics/topic-components/owner/owner.details.view.html'},
        'list' : {'label' : 'List View', 'template' : 'topics/topic-components/owner/owner.list.view.html'},
      },
      'iconClass' : 'flaticon-purchase1',
      'linkTopics' : ['crime', 'trash', 'recycling'],
      'questions' : {
        'topic' : "Do you want to know about property owners' addresses?",
        'address' : "Do you want to know the property owner's address at this address?",
        'street_name' : "Do you want a list of property owners' addresses along this street?",
        'pinnum' : "Do you want to know the property owner's address for this PIN?",
        'neighborhood' : "Do you want a list of property owners' addresses in this neighborhood?"
      }
    };

    //<div>Icons made by <a href="http://www.flaticon.com/authors/freepik" title="Freepik">Freepik</a>, <a href="http://www.flaticon.com/authors/ocha" title="OCHA">OCHA</a> from <a href="http://www.flaticon.com" title="Flaticon">www.flaticon.com</a>             is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0">CC BY 3.0</a></div>


    //We need to use the pinnum to lookup property information 
    //We can access the pinnum by cross-referencing the cividaddress id or centerline id in the xref table
    //WE can acess the civicaddress id from the stateParams
    Owner.build = function(){
      var addressCache = AddressCache.get();
      var pinnum2civicaddressid = AddressCache.pinnum2civicaddressid();
      var q = $q.defer();

      if($stateParams.searchby === 'address'){ 

        simplicityBackend.simplicityQuery('xrefs', {'civicaddressId' : Number($stateParams.id)})
          .then(function(xRef){

            simplicityBackend.simplicityQuery('owners', {'pinnum' : xRef.features[0].properties.pinnum})
              .then(function(owner){
                q.resolve(owner);
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
            simplicityBackend.simplicityQuery('owners', {'pinnums' : xrefPinString})
              .then(function(owner){
                q.resolve(owner);
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
        simplicityBackend.simplicityQuery('owners', {'pinnums' : pinString})
          .then(function(owner){
            q.resolve(owner);
          });
      }else if ($stateParams.searchby === 'neighborhood'){
   
          simplicityBackend.simplicityQuery('owners', {'neighborhoodName' : $stateParams.id})
            .then(function(owner){
                q.resolve(owner);
            });
      }
      return q.promise;
    };//END owner function

    Owner.getTopicProperties = function(){
      return topicProperties;
    };


    //****Return the factory object****//
    return Owner; 

    
}]); //END Owner factory function




   


