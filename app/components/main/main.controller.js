simplicity.controller('MainCtrl', ['$scope', '$state', '$stateParams', '$location', '$http', '$timeout',
  function ($scope, $state, $stateParams, $location, $http, $timeout) {


    $scope.goHome = function(){
    	$location.path('');
    };



}]);