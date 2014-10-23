app.directive('coaFormElement', ['$compile','$filter','$state', '$q',
  function($compile, $filter, $state, $q){
  return {
    //Restrict the directive to attribute coa-form-element on an element 
    restrict: 'A',
    //Defines the scope object for the directive 
    scope:{
      coaFormElement : '= coaFormElement',
    },
    replace : true,
    //Template for the directive
    templateUrl: 'form-element/form-element.html',
    controller : ['$scope', function($scope){
      console.log($scope.coaFormElement);

      var coaFormElementTemplates = {
        'select' : 'form-element/select.html',
      };

      $scope.getTemplate = function(){
        return coaFormElementTemplates[$scope.coaFormElement.type];
      };

      if($scope.coaFormElement.type === 'Select'){
        $scope.doOnChange = function(){
          //
        };
      }


    }]  
  };
}]);