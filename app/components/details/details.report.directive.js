app.directive('report', ['$compile','$filter','$state', '$stateParams','$q', 'Details', 'LocationProperties',
  function($compile, $filter, $state, $stateParams, $q, Details, LocationProperties){
  return {
    //Restrict the directive to attribute ep-form on an element 
    restrict: 'A',
    //Defines the scope object for the directive 
    scope:{
      report : '= report',
    },
    replace : true,
    //Template for the directive
    templateUrl: 'details/details.report.directive.html',
    controller : ['$scope', function($scope){
      console.log($scope.report);
      LocationProperties.properties()
        .then(function(properties){
           $scope.locationProperties = properties;
        });
      if($scope.report.category === 'property'){
        Details.getPropertyDetails($scope.report.location)
          .then(function(propertyDetails){
            $scope.propertyDetails = propertyDetails;
            console.log(propertyDetails);
          })
      }
      $scope.goTo = function(detailsLocation){
        $state.go('main.location.category.time.extent.filter.details', {'details' : 'map'});
      }
      
    }]//END report Directive Controller function
  };//END returned object
}]);//END report Directive function