
app.factory('Details', ['$http', '$location', '$q', '$filter', '$stateParams', 'ArcGisServer', 'Time', 'Filter',
  function($http, $location, $q, $filter, $stateParams, ArcGisServer, Time, Filter){

    //****Create the factory object****//
    var Details = {};

    var detailsCache = {};



    Details.getPropertyDetails = function(civicAddressId){
      var q = $q.defer();
      //We need to cross-reference the civic address id to get the PIN(to look up the property)
      var crossRefTableId = ArcGisServer.featureService.getId('coagis.gisowner.coa_civicaddress_pinnum_centerline_xref_view', 'table');
      console.log(crossRefTableId);
      var queryParams = {
        'where' : 'civicaddress_id=' + civicAddressId,
        'f' : 'json',
        'outFields' : '*'
      };
      ArcGisServer.featureService.query(crossRefTableId, queryParams)
        .then(function(crossRef){
          var propertyLayerId = ArcGisServer.featureService.getId('coagis.gisowner.coa_opendata_property', 'layer');
          var queryParams = {
            'where' : "pinnum='" + crossRef.features[0].attributes.pinnum + "'",
            'f' : 'json',
            'outFields' : '*'
          };
          ArcGisServer.featureService.query(propertyLayerId, queryParams)
            .then(function(propertyDetails){
              q.resolve(propertyDetails.features[0]);
            });
        });
      return q.promise;
    };


    //*********************************************************//
    //**************************CRIME**************************//
    //*********************************************************//

    //****CRIME REPORT****//

    Details.getCrimeFeatures = function(crimeIdArray){
      var processCrimesArray = function(arrayOfCrimes){
        var crimesArray = [];
        var crimeLayerId = ArcGisServer.featureService.getId('coagis.gisowner.coa_opendata_crime', 'layer');
        var queryParams = {
            'where' : 'pid in (' + arrayOfCrimes + ')',
            'f' : 'json',
            'outFields' : '*'
          };
          ArcGisServer.featureService.query(crimeLayerId, queryParams)
            .then(function(crimes){
              //this is being assigned wrong
              detailsCache[$stateParams.location] = crimes;
              q.resolve(crimes);
            });
      };
      var q = $q.defer();
      if(detailsCache[$stateParams.location]){
        if(detailsCache[$stateParams.location].crime){
          q.resolve(detailsCache[$stateParams.location].crime);
        }else{
          processCrimesArray(crimeIdArray);
        }
        
      }else{
        processCrimesArray(crimeIdArray);
      }
      return q.promise;
    };

    Details.filterCrimeDetailsByTime = function(crimeFeatures){
      var timeFilterValue = Time.filterValue($stateParams.time);
      var crimeSummary= {};
      for (var i = 0; i < crimeFeatures.features.length; i++) {
        if(crimeFeatures.features[i].attributes.thedate >= timeFilterValue){
          if(crimeSummary[crimeFeatures.features[i].attributes.offense] === undefined){
            crimeSummary[crimeFeatures.features[i].attributes.offense] = 1;
          }else{
            crimeSummary[crimeFeatures.features[i].attributes.offense] = crimeSummary[crimeFeatures.features[i].attributes.offense] + 1;
          }
        }
      }
      var filterOptions = [];
      filterOptions.push({'value' : 'summary', 'label' : 'Crime Summary'});
      for (var key in crimeSummary) {
        filterOptions.push({'value' : key.toLowerCase().replace(/ /g, '-'), 'label' : key});
      }
      Filter.updateOptions(filterOptions, $stateParams.category);
      return crimeSummary;
    };

    Details.filterCrimeSummaryByFilter = function(crimeSummary){
      if($stateParams.filter === 'summary'){
        return crimeSummary;
      }else{
        var filterOptions = Filter.options($stateParams.category);
        for (var i = 0; i < filterOptions.length; i++) {
          if(filterOptions[i].value === $stateParams.filter){
            var temp = {};
            temp[filterOptions[i].label] = crimeSummary[filterOptions[i].label];
            return(temp);
          }
        }
      }
    };

    //****CRIME MAP****//

    Details.filterCrimeGeoJsonByTime = function(crimeGeoJson){
      var timeFilterValue = Time.filterValue($stateParams.time);
      var filteredCrimeFeatures = [];
      for (var i = 0; i < crimeGeoJson.features.length; i++) {
        if(crimeGeoJson.features[i].properties.thedate >= timeFilterValue){
          filteredCrimeFeatures.push(crimeGeoJson.features[i]);
        }
      }
      crimeGeoJson.features = filteredCrimeFeatures;
      return crimeGeoJson;
    };

    Details.filterCrimeGeoJsonByFilter = function(crimeGeoJson){
      if($stateParams.filter === 'summary'){
        return crimeGeoJson;
      }else{
        var filterOptions = Filter.options($stateParams.category);
        for (var x = 0; x < filterOptions.length; x++) {
          if(filterOptions[x].value === $stateParams.filter){
            var filteredCrimeFeatures = [];
            for (var i = 0; i < crimeGeoJson.features.length; i++) {
              if(crimeGeoJson.features[i].properties.offense === filterOptions[x].label){
                filteredCrimeFeatures.push(crimeGeoJson.features[i]);
              }
            }
            crimeGeoJson.features = filteredCrimeFeatures;
            console.log(crimeGeoJson);
            return crimeGeoJson;
          }
        }
      }
    };


    //*********************************************************//
    //***********************DEVELOPMENT***********************//
    //*********************************************************//

    //****DEVELOPMENT REPORT****//

    Details.getDevelopmentFeatures = function(developmentIdArray){
      var processDevelopmentArray = function(arrayOfDevelopment){
        var developmentLayerId = ArcGisServer.featureService.getId('coagis.gisowner.coa_opendata_permits', 'layer');
        //The development ids in the developmentIdArray are being stored as strings, they need to be numbers
        var stringOfDevelopmentIds = '';
        for (var i = 0; i < arrayOfDevelopment.length; i++) {
          if(i === 0){
            stringOfDevelopmentIds = stringOfDevelopmentIds + "'" + arrayOfDevelopment[i] + "'";
          }else{
            stringOfDevelopmentIds = stringOfDevelopmentIds + ",'" + arrayOfDevelopment[i] + "'";
          }         
        }
        //Need to put  quotes on everything
        var queryParams = {
            'where' : "apn in (" + stringOfDevelopmentIds + ") and record_module = 'Planning'",
            'f' : 'json',
            'outFields' : '*'
          };
          ArcGisServer.featureService.query(developmentLayerId, queryParams)
            .then(function(development){
              console.log('development');
              console.log(development);
              //Filter out the record types that are actually part of development
              // var developmentFeatures = [];
              // for (var i = 0; i < development.features.length; i++) {
              //   if(development.features[i].attributes.record_type === 'Planning Level II' || development.features[i].attributes.record_type === 'Planning Level III' || development.features[i].attributes.record_type === 'Conditional Zoning Permit' || development.features[i].attributes.record_type === 'Major Subdivision' || development.features[i].attributes.record_type === 'Rezoning' || development.features[i].attributes.record_type === 'Conditional Use Permit'){
              //     console.log(development.features[i].attributes.record_type);
              //     developmentFeatures.push(development.features[i]);
              //   }
              // }
              // development.features = developmentFeatures;
              // console.log('development filtered');
              // console.log(development);
              
              //this is being assigned wrong
              detailsCache[$stateParams.location] = development;
              q.resolve(development);
            });
      };
      var q = $q.defer();
      if(detailsCache[$stateParams.location]){
        if(detailsCache[$stateParams.location].development){
          q.resolve(detailsCache[$stateParams.location].development);
        }else{
          processDevelopmentArray(developmentIdArray);
        }
        
      }else{
        processDevelopmentArray(developmentIdArray);
      }
      return q.promise;
    };

    Details.filterDevelopmentFeaturesByTime = function(developmentFeatures){
      var timeFilterValue = Time.filterValue($stateParams.time);
      var developmentSummary= {};
      var developmentArray = []
      for (var i = 0; i < developmentFeatures.features.length; i++) {
        if(developmentFeatures.features[i].attributes.date_opened >= timeFilterValue){
          if(developmentSummary[developmentFeatures.features[i].attributes.record_type] === undefined){
            developmentSummary[developmentFeatures.features[i].attributes.record_type] = 1;
          }else{
            developmentSummary[developmentFeatures.features[i].attributes.record_type] = developmentSummary[developmentFeatures.features[i].attributes.record_type] + 1;
          }
          if($stateParams.filter !== 'summary' && developmentFeatures.features[i].attributes.record_type.toLowerCase().replace(/ /g, '-') === $stateParams.filter){
            developmentArray.push(developmentFeatures.features[i]);
          }
        }
      }
      var filterOptions = [];
      filterOptions.push({'value' : 'summary', 'label' : 'Development Summary'});
      for (var key in developmentSummary) {
        filterOptions.push({'value' : key.toLowerCase().replace(/ /g, '-'), 'label' : key});
      }
      Filter.updateOptions(filterOptions, $stateParams.category);
      if($stateParams.filter === 'summary'){
        return developmentSummary;
      }else{
        return developmentArray
      }
      
    };

    Details.filterDevelopmentSummaryByFilter = function(developmentSummary){
      if($stateParams.filter === 'summary'){
        return developmentSummary;
      }else{
        var filterOptions = Filter.options($stateParams.category);
        for (var i = 0; i < filterOptions.length; i++) {
          if(filterOptions[i].value === $stateParams.filter){
            var temp = {};
            temp[filterOptions[i].label] = developmentSummary[filterOptions[i].label];
            return(temp);
          }
        }
      }
    };

      //****CRIME MAP****//
    // var commercialDevelopmentTypes = [
    //             'Com: Upfit', 
    //             'Com: Remodel', 
    //             'Com: Mechanical', 
    //             'Com: Plumbling', 
    //             'Com: Gas Piping', 
    //             'Com: Accessory Structure',
    //             'Com: Other New',
    //             'Com: Electrical',
    //             'Com: Demo',
    //             'Com: Addition',
    //             'Com: Reroof'
    //             ];
    //           var residentialDevelopmentType = [
    //             'Res: Accessory Structure',
    //             'Res: Remodel', 
    //             'Res: Site Work',
    //             'Res: Change Out',
    //             'Res: Gas Piping', 
    //             'Res: Electrical',
    //             'Res: Mechanical',
    //             'Res: Gas Piping',
    //             'Res: Plumbling',
    //             'Res: Multi-Trade',
    //             'Res: Demolition',
    //             'Res: Reroof',
    //             'Res: New',
    //             'Res: Addition'
    //             ];

    //****Return the factory object****//
    return Details; 

    
}]); //END Details factory function