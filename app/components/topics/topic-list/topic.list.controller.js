simplicity.controller('TopicListCtrl', ['$scope', '$stateParams', '$state', 'Topics', 'AddressCache',
 function ($scope, $stateParams, $state, Topics, AddressCache) {
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
      AddressCache.query()
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