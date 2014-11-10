
app.factory('Questions', [function(){

    //****Create the factory object****//
    var Questions = {}; 

    //****Private Variables*****//

    var baseCaiQuestionArray = [
      {'question' : 'Do you want to know about this property?', 'category' : 'property', 'detail' : 'summary'},
      {'question' : 'Do you want to know about the owner?', 'category' : 'property', 'detail' : 'owner'}
    ];

    var questionsLookupObj = {
      'crime' : 
        [
          {'question' : 'Do you want to know about crime?', 'category' : 'crime', 'detail' : 'within-quarter-mile'}
        ],
      'development' :  
        [
          {'question' : 'Do you want to know about development?', 'category' : 'development', 'detail' : 'summary'},
          {'question' : 'Do you want to know about residential building permits?', 'category' : 'residential-building-permits', 'detail' : 'summary'},
          {'question' : 'Do you want to know about commercial building permits?', 'category' : 'commercial-building-permits', 'detail' : 'summary'},
          {'question' : 'Do you want to know about permits?', 'category' : 'permits', 'detail' : 'summary'}
        ],
        'zoning' : 
        [
          {'question' : 'Do you want to know about the zoning?', 'category' : 'zoning', 'detail' : 'zoning'}
        ]
    };


    // var neighborhoodQuestions = [
    //   {'question' : 'Do you want to know about crime?', 'category' : 'crime', 'detail' : 'quarter-mile'},
    //   {'question' : 'Do you want to know about development?', 'category' : 'development', 'detail' : 'summary'},
    // ];

    //****API*****//
    

    Questions.get = function(dataCacheKeyArray){
      dataCacheKeyArray.sort();
      var questions = baseCaiQuestionArray;
      for (var i = 0; i < dataCacheKeyArray.length; i++) {
        if(questionsLookupObj[dataCacheKeyArray[i]]){
          questions = questions.concat(questionsLookupObj[dataCacheKeyArray[i]])  
        }
      };
      //We should sort the questions by some value eventually
      return questions
    };

    //****Return the factory object****//
    return Questions; 

}]); //END Questions factory function