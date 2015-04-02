simplicity.factory('Trash', ['$q', '$stateParams', 'AddressCache',
  function($q, $stateParams, AddressCache){   

    var Trash = {};

    var topicProperties = {
      'name' : 'trash',
      'title' : 'Trash Collection',
      'plural' : 'trash collection',
      'searchForText' : 'an address',
      'position' : 4,
      'searchby' : {
        'address' : {
          'params' : {
            'type' : null,
            'timeframe' : null,
            'extent' : null,
            'defaultView' : 'simple',
            'validViews' : ['simple']
          },
          'requiredParams' : [],
          'headerTemplate' : 'topics/topic-headers/topic.header.at.html',
        }
      },
       'views' : {
        'simple' : {'label' : 'Simple View', 'template' : 'topics/topic-components/trash-collection/trash.collection.simple.view.html'}
      },
      'simpleViewTemplate' : 'topics/topic-components/trash-collection/trash-collection.view.html',
      'iconClass' : 'flaticon-garbage5',
      'linkTopics' : ['recycling', 'property'],
      'questions' : {
        'topic' : 'Do you want to know when trash is collected?',
        'address' : 'Do you want to know when trash is collected at this address?'
      }
    };
    
    Trash.build = function(){
      var addressCache = AddressCache.get();
      var q = $q.defer();
      var trash = {
        'trash' : addressCache.trash,
        'searchGeojson' : addressCache.searchGeojson
      };
      console.log(trash);
      q.resolve(trash);
      return q.promise;
    };

    Trash.getTopicProperties = function(){
      return topicProperties;
    };
    
    //****Return the factory object****//
    return Trash; 


    
    
}]); //END Trash factory function




   


