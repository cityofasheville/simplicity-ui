//Keep a scope variable of the current address to share across all 
app.controller('CategoryCtrl', ['$scope', '$stateParams', '$state', 'AppFact', function ($scope, $stateParams, $state, AppFact) {

	//***TODO: Get category definition via HTTP ***//
    var category = AppFact.categoryDefinition($stateParams.category);
    $scope.category = category;
    
}]);
