app.controller('MainCtrl', ['$scope', '$state', '$location', '$http', '$timeout','AppFact', function ($scope, $state, $location, $http, $timeout, AppFact) {
    
    //***TODO: Get address canidates as user enters an address***//
    $scope.typedLocation = "";
    $scope.addresses = [];
    $scope.errorMessage = {
      show : false,
      message : 'We had trouble locating that location. Please try to enter a location again.'
    }

    
    $scope.getAddressCandidates = function(enteredLocation){
      var url = 'http://arcgis-arcgisserver1-1222684815.us-east-1.elb.amazonaws.com/arcgis/rest/services/test_open/MapServer/0/query';
      //var url = 'http://cityofashevilleopendatatest.avl.opendata.arcgis.com/datasets/0faa563c77e045ba8dbd979b4fc48505_0.geojson';
      //var url = 'http://gis.ashevillenc.gov/COA_ArcGIS_Server/rest/services/Buncombe_Street_Address/GeocodeServer/findAddressCandidates';
      var whereClause = "address like '%"+enteredLocation.toUpperCase()+"%'";
      var params = {
        where : whereClause,
        outFields : '*',
        f : 'json'
      };
      $http({method : 'GET', url : url, params : params, cache : true})
        .success(function(data, status, headers, config){
          $scope.addresses = data.features.splice(0, 10);

          console.log($scope.addresses);
        })
        .error(function(error){
          console.log(error);
        })
    }

    $scope.getThisLocation = function(location){
      console.log(JSON.stringify(location));

      $state.go('main.location.list', {location : location.attributes.civicaddress_id});
      $scope.addresses = []; 
      $scope.typedLocation = location.attributes.address;
    }


    //when user clicks Go!! or hits enter
    $scope.getLocation = function(location){
      // $scope.typedLocation = location;
      // var url = "http://arcgis-arcgisserver1-1222684815.us-east-1.elb.amazonaws.com/arcgis/rest/services/test_open/MapServer/0/query";
      // var whereClause = 'address='+"'"+location+"'";
      // var params = {
      //   where : whereClause,
      //   outFields : '*',
      //   f : 'json'
      // };
      // $http({method : 'GET', url : url, params : params, cache : true})
      //   .success(function(data, status, headers, config){
      //     if(data.features.length > 0){
      //       $state.go('main.location.list', {location : data.features[0].attributes.civicaddress_id});
      //       $scope.addresses = []; 
      //     }else{
      //       $scope.addresses = []; 
      //       $scope.typedLocation = "";
      //       $scope.errorMessage.show  = true;
      //       $location.path('');
      //       $timeout(function() {
      //         $scope.errorMessage.show  = false;
      //       }, 3000);

      //     }
          
      //   })
      //   .error(function(error){
      //     console.log(error);
      //   });
           
      
    };

    $scope.goHome = function(){
    	$location.path('');
    }

}]);