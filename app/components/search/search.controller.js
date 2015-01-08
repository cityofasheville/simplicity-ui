app.controller('SearchCtrl', ['$scope', '$stateParams', '$state', '$timeout','Filter', 'Backend',
 function ($scope, $stateParams, $state, $timeout, Filter, Backend) {
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

    console.log('SearchCtrl');

    $scope.searchText = '';

    $scope.errorMessage = {
        show : false,
        message : 'We had trouble locating that location. Please try to enter a location again.'
    };
    $scope.helperMessage = {
        show : false,
        message : 'Please choose one of the options below.'
    };



    //Geocodes the search results     
    $scope.doSearch = function(searchText, event){
        document.body.scrollTop = $('#inputSearch').offset().top;
        //we don't want to start search until the user has input 3 characters
        if(searchText.length < 3){
            return;
        }
        console.log("doing search");

        //if the user hits enter while after text search text
        //show a message that tells them to click on one of the results below
        if(event.keyCode === 13 && searchText !== ''){
            $scope.helperMessage.show = true;
            $timeout(function() {
                $scope.helperMessage.show = false;
            }, 2000);
        }

        //Search usign searchText
        Backend.compositeSearch(searchText)
            .then(function(searchResults){
                $scope.searchGroups = searchResults; 
            });
    };

    $scope.unFocus = function(){
        $timeout(function() {
        $scope.searchGroups = []; 
        }, 100); 
    };



    $scope.detailedSelection = [];

    //groupOrderArray.splice(groupOrderPosition, 0, data.candidates[i].attributes.Loc_name);

    $scope.goToTopics = function(candidate, event){
        console.log(candidate);
        $state.go('main.topics.')
    };

    $scope.getIdProperties = function(idProperties, event){
        console.log('getIdProperties');
        $scope.tabs = []; 
        $scope.typedLocation = idProperties.address;
        IdProperties.properties(idProperties)
        .then(function(){
            console.log('state go');
            $state.go('type.id.questions', {type: getType(idProperties.attributes.Loc_name), id : idProperties.attributes.User_fld});
        });
    };

    $scope.goHome = function(){
        $location.path('');
    };


}]);