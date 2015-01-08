
app.factory('ArcGisServer', ['$http', '$location', '$q', '$filter',
    function($http, $location, $q, $filter){

        var ArcGisServer = {
            'geocodeService' : {},
            'geometryService' : {},
            'featureService' : {},
            'mapService' : {},
        };

        //****Private Variables*****//

        //These could be delivered via an application api, but for now they are just hard coded

        var serverProperties = {
            'baseServicesUrl' : 'http://arcgis-arcgisserver1-1222684815.us-east-1.elb.amazonaws.com/arcgis/rest/services',
            'geocodeServiceName' : 'coa_composite_locator',
            'featureServiceName' : 'opendata',
        };

        var featureServiceProperties = {};

        var getGroupLabel = function(unformattedGroupName){
            var nameKey = {
                'street_name' : 'Streets',
                'address' : 'Addresses',
                'neighborhood' : 'Neighborhoods',
                'owner_name' : 'Owners',
                'civicaddressid' : 'Civic Address IDs',
                'pinnum' : 'PINs'
            };
            return nameKey[unformattedGroupName];
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

        

        var formatEsriCompositeGeocoderResults = function(searchText, compositeGeocoderResults){
            //Results from geocoding are displayed by group
            var groupsObj = {};
            var searchGroups = [];
            var groupOrderPosition = 0;

            //Loop over search results and put them into groups by Loc_name
            //see getTabLabel above for keys
            for(var i = 0; i < compositeGeocoderResults.candidates.length; i++){
                if(groupsObj[compositeGeocoderResults.candidates[i].attributes.Loc_name] === undefined){
                    var tempObj = {
                        'name' : compositeGeocoderResults.candidates[i].attributes.Loc_name,
                        'groupOrder' : groupOrderPosition,
                        'active' : false,
                        'label' : getGroupLabel(compositeGeocoderResults.candidates[i].attributes.Loc_name),
                        'results' : [compositeGeocoderResults.candidates[i]]
                    };
                    groupsObj[compositeGeocoderResults.candidates[i].attributes.Loc_name] = tempObj;
                    groupOrderPosition += 1;
                }else{
                    if(groupsObj[compositeGeocoderResults.candidates[i].attributes.Loc_name].results.length < 3 ){
                        groupsObj[compositeGeocoderResults.candidates[i].attributes.Loc_name].results.push(compositeGeocoderResults.candidates[i]);
                    }
                }
            }

            //Add results to results array
            for(var x in groupsObj){
                searchGroups.push(groupsObj[x]);
            }

            //sort the tabs array by the groupOrder property
            searchGroups.sort(function(a, b){
                return a.groupOrder - b.groupOrder;
            });

            //Set the first tab to active and shuffle streets and addresses if needed
            if(searchGroups[0] !== undefined){
                if(searchGroups[1] !== undefined){
                    //the ESRI geocoder gives precendence to streets over addresses
                    //if there are both streets and address results and the search text begins with a number
                    //move addresses to the first tab position
                    if(searchGroups[0].name === 'street_name' && searchGroups[1].name === 'address' && !isNaN(Number(searchText[0]))){
                        var tempAddressArray = searchGroups[1];
                        searchGroups.splice(1,1);
                        searchGroups.splice(0,0,tempAddressArray);
                    }
                    if(searchGroups[1].name === 'street_name' && searchGroups[0].name === 'address' && isNaN(Number(searchText[0]))){
                        var tempStreetArray = searchGroups[1];
                        searchGroups.splice(1,1);
                        searchGroups.splice(0,0,tempStreetArray);
                    }
                }
            }

            //Owners can own multiple properties and streets can have multiple centerline ids
            //This makes the geocoder results appear to have duplicates
            //We'll group by Match_addr and concat the ids stored in the User_fld into the User_fld of the 
            //grouped object seperated by commas
            for (var j = 0; j < searchGroups.length; j++) {
                if(searchGroups[j].name === 'owner_name' || searchGroups[j].name === 'street_name'){
                    var tObj = {};
                    for (var b = 0; b < searchGroups[j].results.length; b++) {
                        if(tObj[searchGroups[j].results[b].attributes.Match_addr] === undefined){
                            tObj[searchGroups[j].results[b].attributes.Match_addr] = searchGroups[j].results[b];
                            tObj[searchGroups[j].results[b].attributes.Match_addr].attributes.User_fld = searchGroups[j].results[b].attributes.User_fld;
                        }else{
                            tObj[searchGroups[j].results[b].attributes.Match_addr].attributes.User_fld += "," + searchGroups[j].results[b].attributes.User_fld;
                        } 
                    }

                    var tempTabArray = [];
                    for(var y in tObj){
                        tempTabArray.push(tObj[y]);
                    }
                    searchGroups[j].results = tempTabArray;
                }            
            }
            return searchGroups;
        }//END formatEsriCompositeGeocoderResults function 

        //Public API

        ArcGisServer.compositeSearch  = function(searchText){

            //Create a url by joining elements of an array (so they need to be in order!)
            var geocodeServiceUrl = [
                    serverProperties.baseServicesUrl, 
                    serverProperties.geocodeServiceName, 
                    'GeocodeServer', 
                    'findAddressCandidates'
                ].join('/');

            //define query parameters
            var params = {
                'SingleLine' : searchText,
                'outFields' : '*',
                'f' : 'json'

            };

            //use $q promises to handle the http request asynchronously
            var q = $q.defer();
            //make http request
            $http({method : 'GET', url : geocodeServiceUrl, params : params, cache : true})
                //callbacks
                .success(function(data, status, headers, config){
                    if(data.error){
                        console.log(data.error.code + ' ArcGisServer.geocodeService.findAddressCanidates ' + data.error.message);
                    }else{
                        q.resolve(formatEsriCompositeGeocoderResults(searchText, data));
                    }
                })
                .error(function(error){
                    console.log('Error gecoding ' + searchText);
                    console.log(error);
                });

            //return the promise using q
            return q.promise;
        };

        //Get feature service properties
        ArcGisServer.featureService.properties = function(){
            //use $q promises to handle the http request asynchronously
            var q = $q.defer();
            //Create a url by joining elements of an array (so they need to be in order!)
            var featureServiceUrl = [
                    serverProperties.baseServicesUrl, 
                    serverProperties.featureServiceName, 
                    'FeatureServer'
                ].join('/');

            //make http request
            $http({method : 'GET', url : featureServiceUrl, params : {'f' : 'json'}, cache : true})
                //callbacks
                .success(function(data, status, headers, config){
                    if(data.error){
                        console.log(data.error.code + ' getFeatureServiceProperties ' + data.error.message);
                    }else{
                        featureServiceProperties = data;
                        q.resolve(data);
                    }
                })
                .error(function(error){
                    console.log('Error getting feature services properties.');
                    console.log(error);
                });
            return q.promise;
        };

        ArcGisServer.featureService.query = function(featureServiceId, options){

            //Create a url by joining elements of an array (so they need to be in order!)
            var featureServiceUrl = [
                    serverProperties.baseServicesUrl, 
                    serverProperties.featureServiceName, 
                    'FeatureServer', 
                    featureServiceId,
                    'query'
                ].join('/');

            //use $q promises to handle the http request asynchronously
            var q = $q.defer();
            //make http request
            $http({method : 'GET', url : featureServiceUrl, params : options, cache : true})
                //callbacks
                .success(function(data, status, headers, config){
                    if(data.error){
                        console.log(data.error.code + ' ArcGisServer.featureService.query on featureServiceId ' + featureServiceId + '. ' + data.error.message);
                    }else{
                        q.resolve(data);
                    }
                })
                .error(function(error){
                    console.log('Error querying feature service.');
                    console.log(error);
                });

            //return the promise using q
            return q.promise;
        };


        ArcGisServer.featureService.getId = function(featureServiceName, featureServiceType){
            console.log(featureServiceProperties);
            var featureServiceTypePlural = featureServiceType + 's';
            for (var i = 0; i < featureServiceProperties[featureServiceTypePlural].length; i++) {
                if(featureServiceProperties[featureServiceTypePlural][i].name === featureServiceName){
                    return featureServiceProperties[featureServiceTypePlural][i].id;
                } 
            }
        };


        //****Return the factory object****//
        return ArcGisServer; 

        
}]); //END ArcGisServer factory function