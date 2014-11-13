app.directive('report', ['$compile','$filter','$state', '$stateParams','$q', '$timeout','Details', 'LocationProperties', 'Filter',
  function($compile, $filter, $state, $stateParams, $q, $timeout, Details, LocationProperties, Filter){
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
      $scope.showSummary = true;

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
                propertyDetails.attributes.zoning = properties.zoning[0];
                $scope.propertyDetails = propertyDetails;
              });
          }else{
            $scope.loading = true;
            Details.getFilteredDetails()
              .then(function(filteredDetails){
                $scope.filteredDetails = filteredDetails;
                
                $scope.isEmpty = isEmpty(filteredDetails.summary);
                if($stateParams.filter === 'summary'){
                  $scope.showSummary = true;
                }else{
                  $scope.showSummary = false;
                }
                $scope.loading = false;                  
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

      $scope.openDownloadModal = function(){
        $('#downloadModal').modal({'backdrop' : false});
      };
      $scope.openShareModal = function(){
        $('#shareModal').modal({'backdrop' : false});
      };

      $scope.download = function(downloadType, details){
        console.log(details);
        var csvString =  'data:text/csv;charset=utf-8,';
        if(downloadType === 'summary'){
          csvString += 'Type, Count' + '\n';
          for(var key in details.summary){
            var summaryItemString = key + ',' + details.summary[key].count;
            csvString += summaryItemString + '\n';
          }
          console.log(csvString);
        }else{
          var headerArray = [];
          
          for(var key in details.features[0].attributes){
            headerArray.push(key);
          }
          for(var key in details.features[0].geometry){
            headerArray.push(key);
          }
          csvString += headerArray.join(',') + '\n';
          for (var i = 0; i < details.features.length; i++) {
            var rowArray = [];
            for (var x = 0; x < headerArray.length; x++) {

              if(details.features[i].attributes[headerArray[x]]){
                rowArray.push(details.features[i].attributes[headerArray[x]]);
              }else if(details.features[i].geometry[headerArray[x]]){
                rowArray.push(details.features[i].geometry[headerArray[x]]);
              }else{
                rowArray.push('NULL');
              }
            };
            console.log(rowArray);
            csvString += rowArray.join(',') + '\n';
          };
        }
        var encodedUri = encodeURI(csvString);
        window.open(encodedUri);
      }
      $scope.currentUrl = window.location.href;
      $scope.iframeText = '<iframe width="100%" height="100%" style = "overflow-y" src="'+window.location.href+'" frameborder="0" ></iframe>'
      
    }]//END report Directive Controller function
  };//END returned object
}]);//END report Directive function