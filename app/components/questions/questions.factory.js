
app.factory('Questions', [function(){

    //****Create the factory object****//
    var Questions = {}; 

    //****Private Variables*****//

    var caiQuestions = [
      {'question' : 'Do you want to know about crime?', 'category' : 'crime', 'detail' : 'within-quarter-mile'},
      {'question' : 'Do you want to know about this property?', 'category' : 'property', 'detail' : 'summary'},
      {'question' : 'Do you want to know about development?', 'category' : 'development', 'detail' : 'summary'},
      {'question' : 'Do you want to know about the owner?', 'category' : 'property', 'detail' : 'owner'},
      {'question' : 'Do you want to know about the zoning?', 'category' : 'property', 'detail' : 'zoning'},
      {'question' : 'Do you want to know about the trash collection?', 'category' : 'property', 'detail' : 'trash'},
    ];

    var neighborhoodQuestions = [
      {'question' : 'Do you want to know about crime?', 'category' : 'crime', 'detail' : 'quarter-mile'},
      {'question' : 'Do you want to know about development?', 'category' : 'development', 'detail' : 'summary'},
    ];

    //****API*****//
    

    Questions.get = function(){
      return caiQuestions
    };

    //****Return the factory object****//
    return Questions; 

}]); //END Questions factory function