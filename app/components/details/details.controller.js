app.controller('DetailsCtrl', ['$scope', '$stateParams', '$state', 
	function ($scope, $stateParams, $state) {
    $scope.stateParams = $stateParams;
    $scope.goTo = function(detailsLocation){
    	$state.go('main.type.id.category.time.extent.filter.details', {'details' : detailsLocation});
    };
}]);