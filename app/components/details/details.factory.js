
app.factory('Details', ['$http', '$location', '$q', '$filter', '$stateParams', 'ArcGisServer', 'LayerDefintion','IdProperties', 'Time', 'Extent', 'Filter',
  function($http, $location, $q, $filter, $stateParams, ArcGisServer, LayerDefintion, IdProperties, Time, Extent, Filter){

    //****Create the factory object****//
    var Details = {};

    var detailsCache = {};

    var buildWhereClause = function(arrayOfIds){
      if($stateParams.category === 'property'){

      }else if($stateParams.category === 'crime'){
        return 'pid in (' + arrayOfIds + ')'
      }else if($stateParams.category === 'development'){
        var stringOfDevelopmentIds = '';
        for (var i = 0; i < arrayOfIds.length; i++) {
          if(i === 0){
            stringOfDevelopmentIds = stringOfDevelopmentIds + "'" + arrayOfIds[i] + "'";
          }else{
            stringOfDevelopmentIds = stringOfDevelopmentIds + ",'" + arrayOfIds[i] + "'";
          }         
        }
        return "apn in (" + stringOfDevelopmentIds + ") and record_module = 'Planning' and record_type_type = 'Development'";
      }

    };

    var getFeaturesFromAnArrayOfLayerIds = function(arrayOfIds){
      var q = $q.defer();
      var layerId = ArcGisServer.featureService.getId(LayerDefintion.get('layer'), LayerDefintion.get('type'));
      var where = buildWhereClause(arrayOfIds);
      //Need to put  quotes on everything
      var queryParams = {
        'where' : where,
        'f' : 'json',
        'outFields' : '*'
      };
      ArcGisServer.featureService.query(layerId, queryParams)
        .then(function(features){
          
          //this is being assigned wrong
          detailsCache[$stateParams.id] = features;
          q.resolve(features);
        });
      return q.promise;
    };

    var getCurrentRecyclingWeek = function(){
      var d = new Date(); // current time 
      var t = d.getTime() - (1000*60*60*24*3); // milliseconds since Jan 4 1970 Sunday
      var w = Math.floor(t / (1000*60*60*24*7)); // weeks since Jan 4 1970  
      var o = w % 2; // equals 0 for even (B weeks) numbered weeks, 1 for odd numbered weeks 
      if(o == 0){
        return 'B'
      }else{ // do your odd numbered week stuff 
        return 'A'
      }
    }

    Details.getRecyclingSchedule = function(recyclingString){
      var recyclingArray = recyclingString.split(' ');
      var currentRecyclingWeek = getCurrentRecyclingWeek();
      if(recyclingArray[3] === 'A)'){
        if(getCurrentRecyclingWeek() === 'A'){
          return {'week' : 'A', 'when' : 'this week'};
        }else{
          return {'week' : 'A', 'when' : 'next week'};
        }
      }else{
        if(getCurrentRecyclingWeek() === 'B'){
          return {'week' : 'B', 'when' : 'this week'};
        }else{
          return {'week' : 'B', 'when' : 'next week'};
        }
      }
    };

    Details.getBrushSchedule = function(recyclingSchedule, trashDay){
      if(trashDay === 'MONDAY' || trashDay === 'TUESDAY'){
        if(recyclingSchedule.week === 'B' && recyclingSchedule.when === 'this week'){
          return {'when' : 'this week'};
        }else{
          return {'when' : 'next week'};
        }
      }else{
        if(recyclingSchedule.week === 'A' && recyclingSchedule.when === 'this week'){
          return {'when' : 'this week'};
        }else{
          return {'when' : 'next week'};
        }
      }
    }

    Details.getPropertyDetails = function(civicAddressId){
      var q = $q.defer();
      //We need to cross-reference the civic address id to get the PIN(to look up the property)
      var crossRefTableId = ArcGisServer.featureService.getId('coagis.gisowner.coa_civicaddress_pinnum_centerline_xref_view', 'table');
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
              propertyDetails.features[0].attributes.codelinks = LayerDefintion.get('codelinks');
              q.resolve(propertyDetails.features[0]);
            });
        });
      return q.promise;
    };

    Details.getPropertiesDetails = function(properties){
      var q = $q.defer();
      //We need to cross-reference the civic address id to get the PIN(to look up the property)
      var crossRefTableId = ArcGisServer.featureService.getId('coagis.gisowner.coa_civicaddress_pinnum_centerline_xref_view', 'table');
      var queryParams = {
        'where' : 'centerline_id in (' + properties.address.attributes.User_fld + ')',
        'f' : 'json',
        'outFields' : 'pinnum'
      };
      ArcGisServer.featureService.query(crossRefTableId, queryParams)
        .then(function(crossRef){
          var arrayOfPINs = [];
          for (var i = 0; i < crossRef.features.length; i++) {
            arrayOfPINs.push(String(crossRef.features[i].attributes.pinnum));
          };
          var propertyLayerId = ArcGisServer.featureService.getId('coagis.gisowner.coa_opendata_property', 'layer');
          var queryParams = {
            'where' : 'pinnum in (' + arrayOfPINs.join(',') + ')',
            'f' : 'json',
            'outFields' : '*'
          };
          ArcGisServer.featureService.query(propertyLayerId, queryParams)
            .then(function(propertiesDetails){
              for (var i = 0; i < propertiesDetails.features.length; i++) {
                propertiesDetails.features[i].attributes.codelinks = LayerDefintion.get('codelinks');
              };
              q.resolve(propertiesDetails);
            });
        });
      return q.promise;
    }

    Details.getStreetDetails = function(properties){
      var q = $q.defer();
      var streeetLayerId = ArcGisServer.featureService.getId('coagis.gisowner.coa_opendata_streets', 'layer');
      var queryParams = {
        'where' : 'centerline_id in (' + properties.address.attributes.User_fld + ')',
        'f' : 'json',
        'outFields' : '*'
      };
      ArcGisServer.featureService.query(streeetLayerId, queryParams)
        .then(function(streetDetails){
          console.log(streetDetails);
          q.resolve(streetDetails);
        });
      return q.promise;
    }

    Details.getZoningOverlays = function(zoningOverlays){
      var zoningOverlaysSplit = zoningOverlays.split('-');
      var q = $q.defer();
      var zoningLayerId = ArcGisServer.featureService.getId('coagis.gisowner.coa_opendata_zoning_overlays', 'layer');
      var queryParams = {
        'where' : "name='" + zoningOverlaysSplit[0] + "'",
        'f' : 'json',
        'outFields' : '*'
      };
      ArcGisServer.featureService.query(zoningLayerId, queryParams)
            .then(function(zoningOverlayLayer){
              q.resolve(zoningOverlayLayer.features[0]);
            });

      return q.promise;
    };

    Details.getFilteredDetails = function(){
      //Use promises to handle the request asynchronously; defer till resolved
      var q = $q.defer();

      var category = $stateParams.category;
      //Get Location Properties
      IdProperties.properties()
        .then(function(properties){
          //Get the features based on the category and the extent 
          getFeaturesFromAnArrayOfLayerIds(properties[category][Extent.filterValue()])
            .then(function(features){
              //Values to filter time and filter by
              var time = LayerDefintion.get('time');
              var filter = LayerDefintion.get('filter');
              var colors = LayerDefintion.get('colors');


              //object that holds a summary of the feature {filterValue : count}
              //e.g. for crime {'Bulgary' : 12, 'Larceny' : 2}
              var filteredFeaturesSummary= {
                'template' : 'summary',
                'table' : {}
              };
              //array that holds features filtered by time and the filter value
              var filterdFeaturesArray = [];
  
              for (var i = 0; i < features.features.length; i++) {
                //filter by time
                if(features.features[i].attributes[time] >= Time.filterValue()){
                  //filter by filter
                  features.features[i].attributes.color = colors[features.features[i].attributes[filter]];          
                  //build a summary object
                  if(filteredFeaturesSummary.table[features.features[i].attributes[filter]] === undefined){

                    filteredFeaturesSummary.table[features.features[i].attributes[filter]] = {'color' : colors[features.features[i].attributes[filter]], 'count' : 1 };

                  }else{
                    filteredFeaturesSummary.table[features.features[i].attributes[filter]].count = filteredFeaturesSummary.table[features.features[i].attributes[filter]].count + 1;
                  }
                  //add filtered features to array
                  if($stateParams.filter === 'summary' || features.features[i].attributes[filter].toLowerCase().replace(/ /g, '-') === $stateParams.filter){
                    features.features[i].template = $stateParams.category;
                    
                    if(features.features[i].attributes.record_comments){
                      features.features[i].attributes.commentsArray = features.features[i].attributes.record_comments.split('[NEXTCOMMENT]');
                    }
                    filterdFeaturesArray.push(features.features[i]);
                  }
                  
                }
              };

              //Update filter options based on filter summary
              var filterOptions = [];
              filterOptions.push({'value' : 'summary', 'label' : 'Summary'});
              for (var key in filteredFeaturesSummary.table) {
                filterOptions.push({'value' : key.toLowerCase().replace(/ /g, '-'), 'label' : key});
              }
              Filter.options($stateParams.category, filterOptions);
              var filteredDetails = {
                'features' : filterdFeaturesArray,
                'summary' : filteredFeaturesSummary
              };
              q.resolve(filteredDetails);
            })//END getFeaturesFromAnArrayOfLayerIds Callback
        })//END IdProperties Callback
      return q.promise;
    };


    //****Return the factory object****//
    return Details; 

    
}]); //END Details factory function