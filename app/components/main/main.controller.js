app.controller('MainCtrl', ['$scope', '$state', '$location', '$http', '$timeout', 'ArcGisServer', 'LocationProperties',
  function ($scope, $state, $location, $http, $timeout, ArcGisServer, LocationProperties) {
    
    //***TODO: Get address canidates as user enters an address***//
    $scope.typedLocation = '';
    $scope.addresses = [];
    $scope.errorMessage = {
      show : false,
      message : 'We had trouble locating that location. Please try to enter a location again.'
    };
    $scope.helperMessage = {
      show : false,
      message : 'Please choose one of the options below.'
    };

    
    $scope.getAddressCandidates = function(enteredLocation, event){
      if(event.keyCode === 13 && enteredLocation !== ''){
        $scope.helperMessage.show = true;
        $timeout(function() {
          $scope.helperMessage.show = false;
        }, 2000);
      }
      ArcGisServer.geocodeService.findAddressCandidates(enteredLocation, '*')
        .then(function(data){
          $scope.addresses = data;
        });
    };

    $scope.getLocationProperties = function(location, event){
        $scope.addresses = []; 
        $scope.typedLocation = location.address;
        LocationProperties.properties(location)
          .then(function(){
            $state.go('main.location.questions', {location : location.attributes.Ref_ID});
          });
    };

    $scope.goHome = function(){
    	$location.path('');
    };

}]);