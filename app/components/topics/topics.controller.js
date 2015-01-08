app.controller('TopicsCtrl', ['$scope', '$stateParams', '$state', 'Filter', 'Topics',
 function ($scope, $stateParams, $state, Filter, Topics) {
    console.log('Topics')
    $scope.$on('$stateChangeSuccess', function (event, toState) {
        if (toState.name === 'main.topics') {           
            $scope.back = true; 
        } else {
            $scope.back = false; 
        }
    });

    //you can't have more tha
    $scope.heading = 'What are you looking for...';
    if($stateParams.filter === 'address'){
      $scope.heading =  'What are you looking for at ' + $stateParams.id + '?';
    }else if($stateParams.filter === 'street'){
      $scope.heading = 'What are you looking for on ' + $stateParams.id + '?';
    }else if($stateParams.filter === 'neighborhood'){
      $scope.heading = 'What are you looking for in ' + $stateParams.id + '?';
    }
 

    $scope.topics = Topics.getTopics($stateParams);
    console.log($scope.topics);



}]);