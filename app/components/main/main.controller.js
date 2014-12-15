app.controller('MainCtrl', ['$scope', '$state', '$stateParams', '$location', '$http', '$timeout', 'ArcGisServer', 'IdProperties',
  function ($scope, $state, $stateParams, $location, $http, $timeout, ArcGisServer, IdProperties) {

    var getTabLabel = function(unformattedTabName){
      var nameKey = {
        'street_name' : 'Streets',
        'address' : 'Addresses',
        'neighborhood' : 'Neighborhood',
        'owner_name' : 'Owners',
        'civicaddressid' : 'Civic Address ID',
        'pinnum' : 'PINs'
      };
      return nameKey[unformattedTabName];
    };

    var getType = function(unformattedType){
      var nameKey = {
        'street_name' : 'street',
        'address' : 'address',
        'neighborhood' : 'neighborhood',
        'owner_name' : 'owner',
        'civicaddressid' : 'address',
        'pinnum' : 'pin'
      };
      return nameKey[unformattedType];
    };
    
    //***TODO: Get address canidates as user enters an address***//
    $scope.typedLocation = '';
    //$scope.addresses = [];
    $scope.addresses = {
      'streets' : [],
      'addresses' : [],
      'owners' : [],
      'PINs' : [],
      'civicAddressIds' : []
    };
    $scope.errorMessage = {
      show : false,
      message : 'We had trouble locating that location. Please try to enter a location again.'
    };
    $scope.helperMessage = {
      show : false,
      message : 'Please choose one of the options below.'
    };

    $scope.changeTab = function(tab){
      console.log(tab);
      for (var i = 0; i < $scope.tabs.length; i++) {
        if($scope.tabs[i].name === tab.name){
          $scope.tabs[i].active = true;
        }else{
          $scope.tabs[i].active = false;
        }
        
      };
      console.log($scope.tabs);
    }

    //Geocodes the search results     
    $scope.getAddressCandidates = function(searchEntered, event){
      //we don't want to start search until the user has input 3 characters
      if(searchEntered.length < 3){
        return
      }

      //if the user hits enter while after text search text
      //show a message that tells them to click on one of the results below
      if(event.keyCode === 13 && searchEntered !== ''){
        $scope.helperMessage.show = true;
        $timeout(function() {
          $scope.helperMessage.show = false;
        }, 2000);
      }

      //Use ESRI's geocoder as a search tool
      ArcGisServer.geocodeService.findAddressCandidates(searchEntered, '*')
        .then(function(data){

          //Results from geocoding are displayed in tabs by category
          var tabsObj = {};
          $scope.tabs = [];
          var tabOrderPosition = 0;

          //Loop over search results and put them into categories by Loc_name
          //see getTabLabel above for keys
          for(var i = 0; i < data.candidates.length; i++){
            if(tabsObj[data.candidates[i].attributes.Loc_name] === undefined){
              var tempObj = {
                'name' : data.candidates[i].attributes.Loc_name,
                'tabOrder' : tabOrderPosition,
                'active' : false,
                'label' : getTabLabel(data.candidates[i].attributes.Loc_name),
                'results' : [data.candidates[i]]
              }
              tabsObj[data.candidates[i].attributes.Loc_name] = tempObj;
              tabOrderPosition += 1;
            }else{
              tabsObj[data.candidates[i].attributes.Loc_name].results.push(data.candidates[i]);
            }
          };

          //Add results to results array
          for(var i in tabsObj){
            $scope.tabs.push(tabsObj[i]);
          };

          //sort the tabs array by the tabOrder property
          $scope.tabs.sort(function(a, b){
              return a.tabOrder - b.tabOrder;
          });

          //Set the first tab to active and shuffle streets and addresses if needed
          if($scope.tabs[0] !== undefined){
            if($scope.tabs[1] !== undefined){
              //the ESRI geocoder gives precendence to streets over addresses
              //if there are both streets and address results and the search text begins with a number
              //move addresses to the first tab position
              if($scope.tabs[0].name == 'street_name' && $scope.tabs[1].name == 'address' && Number(searchEntered[0]) !== NaN){
                var tempAddressArray = $scope.tabs[1];
                $scope.tabs.splice(1,1);
                $scope.tabs.splice(0,0,tempAddressArray);
              }
            }
            //now make the first tab active
            $scope.tabs[0].active = true;
          }

          //Owners can own multiple properties and streets can have multiple centerline ids
          //This makes the geocoder results appear to have duplicates
          //We'll group by Match_addr and concat the ids stored in the User_fld into the User_fld of the 
          //grouped object seperated by commas
          for (var i = 0; i < $scope.tabs.length; i++) {
            if($scope.tabs[i].name === 'owner_name' || $scope.tabs[i].name === 'street_name'){
              var tempObj = {};
              for (var x = 0; x < $scope.tabs[i].results.length; x++) {
                if(tempObj[$scope.tabs[i].results[x].attributes.Match_addr] === undefined){
                  tempObj[$scope.tabs[i].results[x].attributes.Match_addr] = $scope.tabs[i].results[x];
                  tempObj[$scope.tabs[i].results[x].attributes.Match_addr].attributes.User_fld = $scope.tabs[i].results[x].attributes.User_fld;
                }else{
                  tempObj[$scope.tabs[i].results[x].attributes.Match_addr].attributes.User_fld += "," + $scope.tabs[i].results[x].attributes.User_fld;
                } 
              };

              var tempArray = [];
              for(var y in tempObj){
                tempArray.push(tempObj[y])
              }
              $scope.tabs[i].results = tempArray;
            }            
          };
          console.log(tabsObj);
          console.log($scope.tabs);
        });
    };

    $scope.unFocus = function(){
      $timeout(function() {
        $scope.tabs = []; 
      }, 100);
      
    }

    $scope.detailedSelection = [];
    var buildDetailedSelection = function(location){
      console.log('buildDetailedSelection');
      if(location.attributes.Loc_name === 'owner_name'){
        for (var i = 0; i < location.attributes.User_fld.length; i++) {
          var propertyLayerId = ArcGisServer.featureService.getId('coagis.gisowner.coa_opendata_property', 'layer');
          var queryParams = {
            'where' : "pinnum='" + location.attributes.User_fld[i] + "'",
            'f' : 'json',
            'outFields' : '*'
          };
          ArcGisServer.featureService.query(propertyLayerId, queryParams)
            .then(function(propertyDetails){
              //propertyDetails.features[0].attributes.codelinks = LayerDefintion.get('codelinks');
              $scope.detailedSelection.push(propertyDetails.features[0])
              console.log(propertyDetails.features[0]);
            });
          };
        
      }
      $('#selectorModal').modal({'backdrop' : false});
    }

    //tabOrderArray.splice(tabOrderPosition, 0, data.candidates[i].attributes.Loc_name);

    $scope.getIdProperties = function(idProperties, event){
      console.log('getIdProperties');
      $scope.tabs = []; 
      $scope.typedLocation = idProperties.address;
      IdProperties.properties(idProperties)
        .then(function(){
          console.log('state go');
          $state.go('main.type.id.questions', {type: getType(idProperties.attributes.Loc_name), id : idProperties.attributes.User_fld});
        });
    };

    $scope.goHome = function(){
    	$location.path('');
    };



}]);