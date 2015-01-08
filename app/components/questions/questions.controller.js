
app.controller('QuestionsCtrl', ['$scope','$state', '$stateParams', 'Category', 'Questions', 'IdProperties', 
    function ($scope, $state, $stateParams,  Category, Questions, IdProperties) {
    var questions = [];
    IdProperties.properties()
        .then(function(properties){
            $scope.IdProperties = properties;
            var dataCacheKeyArray = [];
            for(var key in properties){
                dataCacheKeyArray.push(key);
            }
            //Get a list of questions for the current location
            //****This could be an HTTP request****//
            questions = Questions.get($stateParams.type, dataCacheKeyArray);

            //Get the top 2 questions
            $scope.questions = questions.slice(0,3);
        });

    $scope.questions = []

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

    //if there are only 2 questions intially, don't show the more option
    if($scope.questions === questions.length){
        $scope.more.show = false;
    }
    
    //if active, call on left arrow key press also
    $scope.getAnswer = function(question){
        $scope.category = Category.getDefinition(question.category);
        $state.go('type.id.category.time.extent.filter.details', $scope.category.defaultStates);  
    };


    //List should be tabbable 
    
}]);