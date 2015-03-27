simplicity.factory('Trash', ['$q', '$stateParams', 'AddressCache',
  function($q, $stateParams, AddressCache){   

    var Trash = {};

    
    
    Trash.get = function(){
      var addressCache = AddressCache.get();
      var q = $q.defer();
      var trash = {
        'trash' : addressCache.trash,
        'searchGeojson' : addressCache.searchGeojson
      };
      console.log(trash);
      q.resolve(trash);
      return q.promise;
    }
    //****Return the factory object****//
    return Trash; 

    
}]); //END Trash factory function




   


