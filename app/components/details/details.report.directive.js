app.directive('report', ['$compile','$filter','$state', '$stateParams','$q', '$timeout','Details', 'LocationProperties',
  function($compile, $filter, $state, $stateParams, $q, $timeout, Details, LocationProperties){
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

      var templates = {
        'property' : 'details/reports/property.report.html',
        'crime' : 'details/reports/crime.report.html',
        'development' : 'details/reports/development.report.html',
      };

      $scope.loading = false;

      var isEmpty = function (obj) {
          for(var prop in obj) {
              if(obj.hasOwnProperty(prop)){
                return false;
              }     
          }
          return true;
      };

      $scope.developmentExplanations = {
        'Planning Level I' : 'Commercial construction less than 35,000 square feet or less than 20 multi-family units',
        'Planning Level II' : 'Commercial construction 35,000-100,000 square feet or 20-50 multi-family units',
        'Planning Level III' : 'Commercial construction larger than 100,000 square feet or more than 50 multi-family units'
      }

      LocationProperties.properties()
        .then(function(properties){
          $scope.locationProperties = properties;
          if($scope.report.category === 'property'){
            Details.getPropertyDetails($scope.report.location)
              .then(function(propertyDetails){
                $scope.propertyDetails = propertyDetails;
              });
          }else if($scope.report.category === 'crime'){
            $scope.loading = true;
            Details.getCrimeFeatures(properties.crime)
              .then(function(crimeFeatures){
                $scope.crimeSummary = Details.filterCrimeSummaryByFilter(Details.filterCrimeDetailsByTime(crimeFeatures));
                $scope.loading = false;
              });
          }else if($scope.report.category === 'development'){
            $scope.loading = true;
            Details.getDevelopmentFeatures(properties.development)
              .then(function(developmentFeatures){
                if($scope.report.filter === 'summary'){
                  $scope.developmentSummary = Details.filterDevelopmentSummaryByFilter(Details.filterDevelopmentFeaturesByTime(developmentFeatures));
                  $scope.isEmpty = isEmpty($scope.developmentSummary);
                  $scope.developmentArray = [];
                  $scope.loading = false;
                }else{
                  $scope.developmentSummary = {};
                  $scope.isEmpty = true;
                  $scope.developmentArray = Details.filterDevelopmentFeaturesByTime(developmentFeatures);
                  console.log($scope.developmentArray);
                  $scope.loading = false;
                }
                  
              });
          }
        });

      //
      $scope.getTemplate = function(){
        return templates[$scope.report.category];
      };
      $scope.goTo = function(detailsLocation){
        $state.go('main.location.category.time.extent.filter.details', {'details' : 'map'});
      };
      
    }]//END report Directive Controller function
  };//END returned object
}]);//END report Directive function