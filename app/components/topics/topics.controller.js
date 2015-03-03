app.controller('TopicsCtrl', ['$scope', '$stateParams', '$state', 'Topics', 'Backend',
 function ($scope, $stateParams, $state, Topics, Backend) {
    $("html, body").animate({'scrollTop' : "0px"});
    $scope.$on('$stateChangeSuccess', function (event, toState) {
        if (toState.name === 'main.topics') {           
            $scope.back = true; 
        } else {
            $scope.back = false; 
        }
    });

    //you can't have more tha
    $scope.heading = 'Topics for ';
    

    $scope.searchText = $stateParams.searchtext + '?';

    $scope.topics = Topics.getTopics($stateParams);
    
    $scope.inTheCity = false;
    $scope.loading = false;
    $scope.anAddress = false;
    if($stateParams.searchby === 'address'){
      $scope.anAddress = true;
      $scope.loading = true;
      Backend.dataCache()
      .then(function(data){
        $scope.loading = false;
        if(data.inTheCity === true){
          $scope.inTheCity = true;
        }else{
          $scope.inTheCity = false;
        }
      });
    }


}]);