app.directive('modal', ['$compile','$filter','$state', '$stateParams','$q', 'Modal',
  function($compile, $filter, $state, $stateParams, $q, Modal){
  return {
    //Restrict the directive to attribute ep-form on an element 
    restrict: 'A',
    //Defines the scope object for the directive 
    scope:{
      modal : '= modal',
    },
    replace : true,
    //Template for the directive
    templateUrl: 'modal/modal.directive.html',
    controller : ['$scope', function($scope){

      $scope.modalData = Modal.getData();

      $scope.category = $stateParams.category;

      $scope.$watch(function () {return Modal.getData();},                       
        function(newVal, oldVal) {
          $scope.modalData = newVal;
          console.log('$scope.modalData'  );
          console.log($scope.modalData);
      }, true);

      
    }]//END modal Directive Controller function
  };//END returned object
}]);//END modal directivective function