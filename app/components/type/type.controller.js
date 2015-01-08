//template is defined inline in app.config.js
app.controller('TypeCtrl', ['$scope', '$location', function ($scope, $location) {
	//Doesn't do anything
	
	$scope.goHome = function(){
    	$location.path('');
    };	
}]);