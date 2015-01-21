app.controller('TopicsCtrl', ['$scope', '$stateParams', '$state', 'Topics',
 function ($scope, $stateParams, $state, Topics) {
    $("html, body").animate({'scrollTop' : "0px"});
    $scope.$on('$stateChangeSuccess', function (event, toState) {
        if (toState.name === 'main.topics') {           
            $scope.back = true; 
        } else {
            $scope.back = false; 
        }
    });

    //you can't have more tha
    $scope.heading = 'What are you looking for...';
    if($stateParams.searchby === 'address'){
      $scope.heading =  'What are you looking for at ';
    }else if($stateParams.searchby === 'street_name'){
      $scope.heading = 'What are you looking for on ';
    }else if($stateParams.searchby === 'neighborhood'){
      $scope.heading = 'What are you looking for in ';
    }else if($stateParams.searchby === 'pinnum'){
      $scope.heading = 'What are you looking for with the PIN ';
    }

    $scope.searchText = $stateParams.searchtext + '?';

    $scope.topics = Topics.getTopics($stateParams);
    



}]);