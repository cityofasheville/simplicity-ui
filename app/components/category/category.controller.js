//Keep a scope variable of the current address to share across all 
app.controller('CategoryCtrl', ['$scope', '$stateParams', '$state', 'Category', 'IdProperties',
	function ($scope, $stateParams, $state, Category, IdProperties) {

	//***TODO: Get category definition via HTTP ***//
    $scope.category = Category.getDefinition($stateParams.category);
    IdProperties.properties()
        .then(function(properties){
        	$scope.IdProperties = properties;
        });
    if($stateParams.time === undefined){
        //$state.go('main.location.category.time.extent.filter.details', $scope.category.defaultStates);  
    }
    
    $scope.goBack = function(){
        $state.go('type.id.questions');
      };  
}]);
