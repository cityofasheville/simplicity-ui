app.directive('coaForm', ['$compile','$filter','$state', '$stateParams','$q',
  function($compile, $filter, $state, $stateParams, $q){
  return {
    //Restrict the directive to attribute ep-form on an element 
    restrict: 'A',
    //Defines the scope object for the directive 
    scope:{
      coaForm : '= coaForm',
    },
    replace : true,
    //Template for the directive
    templateUrl: 'form/form.html',
    controller : ['$scope', function($scope){
      if($scope.coaForm.submit === 'onChange'){
        $scope.$watch('coaForm.elements', function (newVal, oldVal){
            var detailArray = [];
            for (var i = 0; i < $scope.coaForm.elements.length; i++) {
              detailArray.push($scope.coaForm.elements[i].returnValue.value);
            }
            var detail = detailArray.join('-');
            $state.go('main.location.category.time.detail.summary', {time: detailArray[0], detail : detailArray[1]});
          }, true);
      }
    }]
  };
}]);
