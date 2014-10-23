app.controller('TimeCtrl', ['$scope', '$stateParams', '$state', 'AppFact', function ($scope, $stateParams, $state, AppFact) {
	
	if($stateParams.time === 'current'){
		$scope.show = false;
	}else{
		$scope.show = true;
		//Probably will be HTTP
		$scope.timeOptions = AppFact.timeOptions();
		console.log($scope.timeOptions);
		for (var i = 0; i < $scope.timeOptions.length; i++) {
			if($scope.timeOptions[i].value === $stateParams.time){
				console.log(i);
				$scope.defaultOption = i;
			}
		};
	}
	$scope.onChangeTimeValue = function(){
		console.log($scope.timeValue);
		$state.go('main.location.category.time.extent.filter.details', {time : $scope.timeValue.value});
	};


	
}]);