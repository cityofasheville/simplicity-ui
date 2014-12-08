app.controller('FilterCtrl', ['$scope', '$stateParams', '$state', 'Filter', function ($scope, $stateParams, $state, Filter) {
  	$scope.filterOptions = Filter.options($stateParams.category);
	for (var i = 0; i < $scope.filterOptions.length; i++) {
		if($scope.filterOptions[i].value === $stateParams.filter){
			$scope.defaultOption = i;
		}
	}
	$scope.hasFilter = false;
    if($stateParams.filter === 'summary'){
    	$scope.show = false;
	}else{
		$scope.show = true;
	}

	//Watch to see if the options returned from teh Filter factory change
	$scope.$watch(function () {return Filter.options($stateParams.category);},                       
      	function(newVal, oldVal) {
      		if($stateParams.category === 'property' || $stateParams.category === 'sanitation'){
				$scope.hasFilter = false;
			}else{
				if(newVal.length > 1){
	      			$scope.hasFilter = true;
	      			$scope.filterOptions = newVal;
	      			for (var i = 0; i < $scope.filterOptions.length; i++) {
						if($scope.filterOptions[i].value === $stateParams.filter){
							$scope.filterValue = $scope.filterOptions[i];
						}
					}
	      		}else{
	      			$scope.hasFilter = false;
	      		}

			}
  
    	}, true);

	

	
	$scope.onChangeFilterValue = function(){
		$state.go('main.location.category.time.extent.filter.details', {filter : $scope.filterValue.value});
	};


}]);