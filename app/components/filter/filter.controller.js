app.controller('FilterCtrl', ['$scope', '$stateParams', '$state', 'Filter', function ($scope, $stateParams, $state, Filter) {
  	$scope.filterOptions = Filter.options();
		for (var i = 0; i < $scope.filterOptions.length; i++) {
			if($scope.filterOptions[i].value === $stateParams.filter){
				$scope.defaultOption = i;
			}
		}
		
    if($stateParams.filter === 'summary'){
		$scope.show = false;
	}else{
		$scope.show = true;
	}

	$scope.onChangeFilterValue = function(){
		$state.go('main.location.category.time.extent.filter.details', {filter : $scope.filterValue.value});
	};
}]);