app.controller('ExtentCtrl', ['$scope', '$stateParams', '$state', 'AppFact', function ($scope, $stateParams, $state, AppFact) {
    if($stateParams.extent === 'location' || $stateParams.extent === 'neightborhood'){
		$scope.show = false;
	}else{
		$scope.show = true;
		//Probably will be HTTP
		$scope.extentOptions = AppFact.extentOptions();
		console.log($scope.extentOptions);
		for (var i = 0; i < $scope.extentOptions.length; i++) {
			if($scope.extentOptions[i].value === $stateParams.extent){
				console.log(i);
				$scope.defaultOption = 2;
			}
		};
	}
	$scope.onChangeExtentValue = function(){
		$state.go('main.location.category.time.extent.filter.details', {extent : $scope.extentValue.value});
	};
}]);