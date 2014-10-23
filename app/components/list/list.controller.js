
app.controller('ListCtrl', ['$scope','$state','AppFact', 'location', function ($scope, $state, AppFact, location) {
    
    //Get locationProperties 
    AppFact.locationProperties(location)
        .then(function(locationProperties){
            $scope.locationProperties = locationProperties;
        });




    //Get a list of questions for the current location
    //****This could be an HTTP request****//
    var questions = AppFact.questions();

    //Get the top 2 questions
    $scope.questions = questions.slice(0,2);

    $scope.more = {
        show : true,
        get : function(){
            var currentQuestionCount = $scope.questions.length;
            var numberOfQuestionsToAdd = 3;
            //check to make sure that we have at least questions left
            //if not just add what we have left
            if((questions.length - currentQuestionCount)< 3){
                numberOfQuestionsToAdd = questions.length - currentQuestionCount;
            }
            //add questions to the current list of questions
            var newQuestionCount = currentQuestionCount + numberOfQuestionsToAdd;
            //*******This could be an HTTP request*******//
            $scope.questions = questions.slice(0, newQuestionCount);

            //if there aren't any more question, don't show the more option
            if(newQuestionCount === questions.length){
                this.show = false;
            }
        }

    };

    //if there are only 2 questions intiall, don't show the more option
    if($scope.questions === questions.length){
        $scope.more.show = false;
    }

    //if active, call on left arrow key press also
    $scope.getAnswer = function(){
        var category = AppFact.categoryDefinition('crime');
        $scope.category = category;
        $state.go('main.location.category.time.extent.filter.details', category);
    };


    //List should be tabbable 
    
}]);