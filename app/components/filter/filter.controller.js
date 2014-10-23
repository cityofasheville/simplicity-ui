app.controller('FilterCtrl', ['$scope', '$stateParams', '$state', 'AppFact', function ($scope, $stateParams, $state, AppFact) {
  	$scope.filterOptions = AppFact.filterOptions();
		console.log($scope.filterOptions);
		for (var i = 0; i < $scope.filterOptions.length; i++) {
			if($scope.filterOptions[i].value === $stateParams.filter){
				console.log(i);
				$scope.defaultOption = i;
			}
		};
		
    if($stateParams.filter === 'summary'){
		$scope.show = false;
	}else{
		$scope.show = true;
		//Probably will be HTTP
		
	}
	$scope.onChangeFilterValue = function(){
		$state.go('main.location.category.time.extent.filter.details', {filter : $scope.filterValue.value});
	};
}]);