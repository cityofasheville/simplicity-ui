//Keep a scope variable of the current address to share across all 
app.controller('CategoryCtrl', ['$scope', '$stateParams', '$state', 'Category', 'LocationProperties',
	function ($scope, $stateParams, $state, Category, LocationProperties) {

	//***TODO: Get category definition via HTTP ***//
    $scope.category = Category.getDefinition($stateParams.category);
    LocationProperties.properties()
        .then(function(properties){
        	$scope.locationProperties = properties;
        });
    console.log('CategoryCtrl');
    console.log($stateParams);
    if($stateParams.time === undefined){
        console.log('CategoryCtrl');
        console.log($stateParams);
        //$state.go('main.location.category.time.extent.filter.details', $scope.category.defaultStates);  
    }
    
    $scope.goBack = function(){
        $state.go('main.location.questions');
      };  
}]);
