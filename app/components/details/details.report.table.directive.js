app.directive('table', ['$compile','$filter','$state', '$stateParams','$q', '$timeout','Details', 'LocationProperties', 'Filter',
  function($compile, $filter, $state, $stateParams, $q, $timeout, Details, LocationProperties, Filter){
  return {
    //Restrict the directive to attribute ep-form on an element 
    restrict: 'A',
    //Defines the scope object for the directive 
    scope:{
      table : '= table',
    },
    replace : true,
    //Template for the directive
    templateUrl: 'details/details.report.table.directive.html',
    controller : ['$scope', function($scope){
      
    }]//END report Directive Controller function
  };//END returned object
}]);//END report Directive function