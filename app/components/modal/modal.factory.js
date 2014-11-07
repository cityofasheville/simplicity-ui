app.factory('Modal', ['$stateParams', function($stateParams){

    //****Create the factory object****//
    
    var Modal = {};

    var modalData = {};
    
  	Modal.getData = function(){
  		return modalData;
  	}; 

  	Modal.setData = function(data){
  		modalData = data;
  	}

    //****Return the factory object****//
    return Modal; 

    
}]); //END Modal factory function