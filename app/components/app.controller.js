//template is defined inline in app.config.js
app.controller('AppCtrl', ['$scope', '$location', function ($scope, $location) {
	
	$scope.$on('$stateChangeSuccess', function (event, toState) {
        if (toState.name === 'main') {
        	
            $scope.back = true; 
        } else {
            $scope.back = false; 
        }
    });	
}]);