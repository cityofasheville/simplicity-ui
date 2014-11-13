app.directive('feature', ['$compile','$filter','$state', '$stateParams','$q', '$timeout','Details', 'LocationProperties', 'Filter',
  function($compile, $filter, $state, $stateParams, $q, $timeout, Details, LocationProperties, Filter){
  return {
    //Restrict the directive to attribute ep-form on an element 
    restrict: 'A',
    //Defines the scope object for the directive 
    scope:{
      feature : '= feature',
    },
    replace : true,
    //Template for the directive
    templateUrl: 'details/details.report.feature.directive.html',
    controller : ['$scope', function($scope){
      console.log('$scope.feature');
      console.log($scope.feature);
      var templates = {
        'crime' : 'details/features/crime.report.feature.html',
        'development' : 'details/features/development.report.feature.html',
      };

      $scope.getTemplate = function(){
        return templates[$stateParams.category];
      };
      
    }]//END feature Directive Controller function
  };//END returned object
}]);//END feature Directive function