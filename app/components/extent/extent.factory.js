app.factory('Extent', ['$stateParams', function($stateParams){

    //****Create the factory object****//
    var Extent = {};

    // {'value' : 'within-a-half-mile', 'label' : 'Within a half mile'},
    //   {'value' : 'within-a-mile', 'label' : 'Within a mile'},
    //   {'value' : 'within-5-miles', 'label' : 'Within 5 miles'}

    var extentFilterValues = {
      'within-about-a-block' : 330,
      'within-an-eighth-of-a-mile' : 660,
      'within-a-quarter-mile' : 1320,
    };

    var extentOptions = [
      {'value' : 'within-about-a-block', 'label' : 'within a city block (110 yards)'},
      {'value' : 'within-an-eighth-of-a-mile', 'label' : 'within a couple city blocks (1/8 of a mile)'},
      {'value' : 'within-a-quarter-mile', 'label' : 'within a quarter mile'}   
    ];
  

    //****API*****//
    Extent.options = function(newExtentOptions){
      if(newExtentOptions !== undefined){
        extentOptions = newExtentOptions;
      }else{
        return extentOptions;
      }
    };

    Extent.filterValue = function(){
      return extentFilterValues[$stateParams.extent];
    };
    


    //****Return the factory object****//
    return Extent; 

    
}]); //END Extent factory function