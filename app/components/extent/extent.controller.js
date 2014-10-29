app.controller('ExtentCtrl', ['$scope', '$stateParams', '$state', 'Extent', 
	function ($scope, $stateParams, $state, Extent) {
    if($stateParams.extent === 'location' || $stateParams.extent === 'neighborhood'){
		$scope.show = false;
	}else{
		$scope.show = true;
		
		$scope.extentOptions = Extent.options();

		for (var i = 0; i < $scope.extentOptions.length; i++) {
			if($scope.extentOptions[i].value === $stateParams.extent){
				$scope.defaultOption = 2;
			}
		}
	}
	$scope.onChangeExtentValue = function(){
		$state.go('main.location.category.time.extent.filter.details', {extent : $scope.extentValue.value});
	};
}]);