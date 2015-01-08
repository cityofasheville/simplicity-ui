app.directive('report', ['$compile','$filter','$state', '$stateParams','$q', '$timeout','Details', 'IdProperties', 'Filter',
  function($compile, $filter, $state, $stateParams, $q, $timeout, Details, IdProperties, Filter){
  return {
    //Restrict the directive to attribute report on an element 
    restrict: 'A',
    //Defines the scope object for the directive 
    scope:{
      report : '= report',
    },
    replace : true,
    //Template for the directive
    templateUrl: 'details/report/report.directive.html',
    controller : ['$scope', function($scope){

      $scope.loading = false;
      $scope.showSummary = true;
      $scope.showFooter = true;

      var isEmpty = function (obj) {
          for(var prop in obj) {
              if(obj.hasOwnProperty(prop)){
                return false;
              }     
          }
          return true;
      };

      var makeZoningCard = function(properties, codelinks){
        var zoningCard = {};
        zoningCard.template = 'zoning';
        zoningCard.zoning = properties.zoning[0];
        zoningCard.codelinks = codelinks;
        
        if(properties.zoningOverlays){
          zoningCard.zoningOverlays = properties.zoningOverlays;
        }else{
          zoningCard.zoningOverlays = 'No Zoning Overlays';
        }
        return zoningCard;
      };
      var makeOwnerCard = function(propertyDetails){
        var ownerCard = {};
        ownerCard.template = 'owner';
        ownerCard.owner = propertyDetails.owner;
        ownerCard.owner_address = propertyDetails.owner_address;
        ownerCard.owner_citystatezip = propertyDetails.owner_citystatezip;
        return ownerCard;
      };

      IdProperties.properties()
        .then(function(properties){
          console.log('properties');
          console.log(properties);
          $scope.IdProperties = properties;
          if($scope.report.category === 'property'){
            Details.getPropertyDetails($scope.report.id)
              .then(function(propertyDetails){
                console.log(propertyDetails);
                propertyDetails.attributes.civicAddressId = $stateParams.id;
                propertyDetails.zoningCard = makeZoningCard(properties, propertyDetails.attributes.codelinks);
                propertyDetails.ownerCard = makeOwnerCard(propertyDetails.attributes);
                propertyDetails.template = 'property';
                $scope.propertyDetails = propertyDetails;
              });
          }else if($scope.report.category === 'properties'){
            
            Details.getPropertiesDetails(properties)
              .then(function(propertiesDetails){
                $scope.propertiesDetails = {'template' : 'properties'};
              });
            // Details.getPropertyDetails($scope.report.id)
            //   .then(function(propertyDetails){
            //     console.log(propertyDetails);
            //     propertyDetails.attributes.civicAddressId = $stateParams.id;
            //     propertyDetails.zoningCard = makeZoningCard(properties, propertyDetails.attributes.codelinks);
            //     propertyDetails.ownerCard = makeOwnerCard(propertyDetails.attributes);
            //     propertyDetails.template = 'property';
            //     $scope.propertyDetails = propertyDetails;
            //   });
          }else if($scope.report.category === 'sanitation'){
            console.log(properties.sanitation);
            $scope.showFooter = false;
            $scope.sanitation = properties.sanitation;
            $scope.sanitation.template = 'sanitation';
            $scope.sanitation.recyclingSchedule = Details.getRecyclingSchedule(properties.sanitation.recycling);
            $scope.sanitation.brushSchedule = Details.getBrushSchedule($scope.sanitation.recyclingSchedule, properties.sanitation.trash);
          }else{
            $scope.loading = true;
            Details.getFilteredDetails()
              .then(function(filteredDetails){
                $scope.filteredDetails = filteredDetails;
                console.log('$scope.filteredDetails');
                console.log($scope.filteredDetails);
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
      // $scope.getTemplate = function(){
      //   return templates[$scope.report.category];
      // };
      $scope.goTo = function(detailsLocation){
        $state.go('main.type.id.category.time.extent.filter.details', {'details' : 'map'});
      };

      $scope.openDownloadModal = function(){
        $('#downloadModal').modal({'backdrop' : false});
      };
      $scope.openShareModal = function(){
        $('#shareModal').modal({'backdrop' : false});
      };
      $scope.showSummaryTable = function(){
        $state.go('main.type.id.category.time.extent.filter.details', {filter : 'summary'});
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
          
          for(var attributeKey in details.features[0].attributes){
            headerArray.push(attributeKey);
          }
          for(var geometryKey in details.features[0].geometry){
            headerArray.push(geometryKey);
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
            }
            console.log(rowArray);
            csvString += rowArray.join(',') + '\n';
          }
        }
        var encodedUri = encodeURI(csvString);
        window.open(encodedUri);
      };
      $scope.currentUrl = window.location.href;
      $scope.iframeText = '<iframe width="100%" height="100%" style = "overflow-y" src="'+window.location.href+'" frameborder="0" ></iframe>';
      
    }]//END report Directive Controller function
  };//END returned object
}]);//END report Directive function