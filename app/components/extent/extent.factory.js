app.factory('Extent', [function(){

    //****Create the factory object****//
    var Extent = {};

    var extentOptions = [
      {'value' : 'within-a-quarter-mile', 'label' : 'Within a quarter mile'},
      {'value' : 'within-a-half-mile', 'label' : 'Within a half mile'},
      {'value' : 'within-a-mile', 'label' : 'Within a mile'},
      {'value' : 'within-5-miles', 'label' : 'Within 5 miles'}
    ];
  

    //****API*****//
    Extent.options = function(newExtentOptions){
      if(newExtentOptions !== undefined){
        extentOptions = newExtentOptions;
      }else{
        return extentOptions;
      }
    };
    


    //****Return the factory object****//
    return Extent; 

    
}]); //END Extent factory function