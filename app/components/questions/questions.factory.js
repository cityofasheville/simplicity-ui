
app.factory('Questions', [function(){

    //****Create the factory object****//
    var Questions = {}; 

    //****Private Variables*****//

    var baseCaiQuestionArray = [
      {'question' : 'Do you want to know about this property?', 'category' : 'property', 'detail' : 'summary'}
    ];

    var questionsLookupObj = {
      'crime' : 
        [
          {'question' : 'Do you want to know about crime?', 'category' : 'crime', 'detail' : 'within-quarter-mile'}
        ],
      'development' :  
        [
          {'question' : 'Do you want to know about development?', 'category' : 'development', 'detail' : 'summary'}
          // {'question' : 'Do you want to know about residential building or trade permits?', 'category' : 'residential-building-or-trade-permits', 'detail' : 'summary'},
          // {'question' : 'Do you want to know about commercial building or trade permits?', 'category' : 'commercial-building-or-trade-permits', 'detail' : 'summary'},
          // {'question' : 'Do you want to know about event temporary use permits?', 'category' : 'event-temporary-use-permits', 'detail' : 'summary'},
          // {'question' : 'Do you want to know about fire related permits?', 'category' : 'fire-related-permits', 'detail' : 'summary'},
          // {'question' : 'Do you want to know about archival permit data?', 'category' : 'archival-permits', 'detail' : 'summary'},
          // {'question' : 'Do you want to know about outdoor vendor permits?', 'category' : 'outdoor-vendor-permits', 'detail' : 'summary'},
          // {'question' : 'Do you want to know about right of way requests?', 'category' : 'right-of-way-requests', 'detail' : 'summary'},
          // {'question' : 'Do you want to know about sign permits?', 'category' : 'sign-permits', 'detail' : 'summary'},
          // {'question' : 'Do you want to know about stormwater permits?', 'category' : 'stormwater-permits', 'detail' : 'summary'},
          // {'question' : 'Do you want to know about water line extension requests?', 'category' : 'water-line-extension-requests', 'detail' : 'summary'},
          // {'question' : 'Do you want to know about archival planning data?', 'category' : 'archival-planning-data', 'detail' : 'summary'},
          // {'question' : 'Do you want to know about historical resource commission related requests?', 'category' : 'historical-resource-commission-related-requests', 'detail' : 'summary'},
          // {'question' : 'Do you want to know about alternative compliance requests?', 'category' : 'alternative-compliance-requests', 'detail' : 'summary'},
          // {'question' : 'Do you want to know about map or text amendment requests?', 'category' : 'map-or-text-amendment-requests', 'detail' : 'summary'},
          // {'question' : 'Do you want to know about rezoning requests?', 'category' : 'rezoning-requests', 'detail' : 'summary'},
          // {'question' : 'Do you want to know about planning research requests?', 'category' : 'planning-research-requests', 'detail' : 'summary'},
          // {'question' : 'Do you want to know about site compliance verifications?', 'category' : 'site-compliance-verifications', 'detail' : 'summary'},
          // {'question' : 'Do you want to know about subdivision related requests?', 'category' : 'subdivision-related-requests', 'detail' : 'summary'},
          // {'question' : 'Do you want to know about development variance requests and appeals?', 'category' : 'development-variance-requests-and-appeals', 'detail' : 'summary'},
          // {'question' : 'Do you want to know about complaint enforcement incidents?', 'category' : 'complaint-enforcement-incidents', 'detail' : 'summary'},
          // {'question' : 'Do you want to occupational licencing?', 'category' : 'occupational-licensing', 'detail' : 'summary'},  
          // {'question' : 'Do you want to know about archival development services data?', 'category' : 'archival-development-services-data', 'detail' : 'summary'},
          // {'question' : 'Do you want to know about project inquiries?', 'category' : 'project-inquiries', 'detail' : 'summary'}
        ],
        'zoning' : 
        [
          {'question' : 'Do you want to know about the zoning?', 'category' : 'property', 'detail' : 'zoning'}
        ],
        'sanitation' : [
          {'question' : 'Do you want to know about trash collection?', 'category' : 'sanitation', 'detail' : 'summary'},
          {'question' : 'Do you want to know about recycling collection?', 'category' : 'sanitation', 'detail' : 'summary'}
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