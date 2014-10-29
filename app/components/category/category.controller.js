//Keep a scope variable of the current address to share across all 
app.controller('CategoryCtrl', ['$scope', '$stateParams', '$state', 'Category', 
	function ($scope, $stateParams, $state, Category) {

	//***TODO: Get category definition via HTTP ***//
    $scope.category = Category.getDefinition($stateParams.category);
    console.log($scope.category);
    $state.go('main.location.category.time.extent.filter.details', $scope.category.defaultStates);    
}]);
