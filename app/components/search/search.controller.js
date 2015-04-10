simplicity.controller('SearchCtrl', ['$scope', '$stateParams', '$state', '$timeout', 'simplicityBackend', 'Topics',
 function ($scope, $stateParams, $state, $timeout, simplicityBackend, Topics) {
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

    $('#searchContent').css({'minHeight' : $(window).height()});

    $("#addressSearch").focus();
    $scope.searchText = '';

    $scope.errorMessage = {
        show : false,
        message : 'We had trouble locating that location. Please try to enter a location again.'
    };
    $scope.helperMessage = {
        show : false,
        message : 'Please choose one of the options below.'
    };

    $scope.discoverText = "places";
    $scope.searchFor = "an address, street, neighborhood, or property";

    var topicProperties = {};

    $scope.showTopicsLink = true;

    //if a topic is defined we want to show topic specific text
    if($stateParams.topic !== null){
        topicProperties = Topics.topicProperties();
        $scope.showTopicsLink = false;
        $scope.discoverText = topicProperties.plural;
        $scope.searchFor = topicProperties.searchForText;
    }
    


    //Geocodes the search results     
    $scope.doSearch = function(searchText, event){
        var offset = $('#inputSearch').offset().top - 20;
        $("html, body").animate({'scrollTop' : offset + "px"});
        //we don't want to start search until the user has input 3 characters
        if(searchText.length < 3){
            $scope.searchGroups = [];
            return;
        }

        //if the user hits enter while after text search text
        //show a message that tells them to click on one of the results below
        if(event.keyCode === 13 && searchText !== ''){
            $scope.helperMessage.show = true;
            $timeout(function() {
                $scope.helperMessage.show = false;
            }, 2000);
        }



        //Search usign searchText
        simplicityBackend.simplicitySearch(searchText)
            .then(function(searchResults){
                if(searchText === ""){
                    $scope.searchGroups = [];
                }else{
                    if(searchResults.length !== 0){
                        if($stateParams.topic !== null){
                            for (var i = searchResults.length - 1; i >= 0; i--) {

                                if(topicProperties.searchby[searchResults[i].name] === undefined){
                                    searchResults.splice(i, 1);
                                }
                            }
                            $scope.searchGroups = searchResults; 
                        }else{
                           $scope.searchGroups = searchResults; 
                        }
                           
                    }
                } 
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
        var label = "";
        for (var i = 0; i < candidate.label.length; i++) {
            if(candidate.label.charAt(i) === '&'){
                label = label + 'AND';
            }else{
                label = label + candidate.label.charAt(i);
            }
        }
        if(candidate.type === 'civicaddressid'){
            candidate.type = "address";
        }
        if($stateParams.topic !== null){
            if(candidate.googleResult === true){
                simplicityBackend.simplicityFindGoogleAddress(candidate)
                    .then(function(addressResults){
                        $state.go('main.topics.topic', {'topic' : $stateParams.topic, 'searchtext' : addressResults.label, 'searchby' : addressResults.type, 'id' : addressResults.id});
                    });
            }else{
                $state.go('main.topics.topic', {'topic' : $stateParams.topic, 'searchtext' : label, 'searchby' : candidate.type, 'id' : candidate.id});
            }
        }else{
            if(candidate.googleResult === true){
                simplicityBackend.simplicityFindGoogleAddress(candidate)
                    .then(function(addressResults){
                        $state.go('main.topics.list', {'searchtext' : addressResults.label, 'searchby' : addressResults.type, 'id' : addressResults.id});
                    });

            }else{
                $state.go('main.topics.list', {'searchtext' : label, 'searchby' : candidate.type, 'id' : candidate.id});  
            }
        }
        
    };




}]);