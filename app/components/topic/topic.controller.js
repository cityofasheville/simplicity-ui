app.controller('TopicCtrl', ['$scope', '$stateParams', '$state', 'Filter', 'Topics','Topic', 'Backend',
 function ($scope, $stateParams, $state, Filter, Topics, Topic, Backend) {

    //****Private variables and methods*****//

    var hasACorrectGroup = function(stateParams, topicProperties){
      for (var i = 0; i < topicProperties.groups.length; i++) {
        if(stateParams[topicProperties.groups[i]] !== null){
          return true
        }
      };
      return false
    };

    //****$scope variables and methods*****//

    //Get properties for a topic
    $scope.topicProperties = Topics.topicProperties($stateParams.topic);

    $scope.headerTemplate = $scope.topicProperties.searchby[$stateParams.searchby].headerTemplate;
    $scope.viewTemplate = $scope.topicProperties.viewTemplate;
    //If the topic does not have a correct group specified redirect
    //to the search page for the topic
    // if(!hasACorrectGroup($stateParams, $scope.topicProperties)){
    //   $state.go('main.search.topic', {'topic' : $stateParams.topic});
    // }

    Backend.topic()
      .then(function(topic){
        console.log(topic)
      });


    $scope.show = {
      'timeframe' : false,
      'extent' : false 
    };

    $scope.timeframeOptions = Topic.options('timeframe');
    $scope.extentOptions = Topic.options('extent');

    if($stateParams.timeframe === null){
      //show a timeframe selector with a message
      $scope.show.timeframe = false;
    }else{
      $scope.show.timeframe = true;
      
    }
    

    $scope.topicParams = $stateParams;
}]);