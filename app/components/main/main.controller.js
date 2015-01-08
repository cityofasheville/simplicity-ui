app.controller('MainCtrl', ['$scope', '$state', '$stateParams', '$location', '$http', '$timeout', 'ArcGisServer', 'IdProperties',
  function ($scope, $state, $stateParams, $location, $http, $timeout, ArcGisServer, IdProperties) {


    $scope.goHome = function(){
    	$location.path('');
    };



}]);