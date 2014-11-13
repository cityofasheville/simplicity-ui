
app.factory('Details', ['$http', '$location', '$q', '$filter', '$stateParams', 'ArcGisServer', 'LayerDefintion','LocationProperties', 'Time', 'Extent', 'Filter',
  function($http, $location, $q, $filter, $stateParams, ArcGisServer, LayerDefintion, LocationProperties, Time, Extent, Filter){

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
          detailsCache[$stateParams.location] = features;
          q.resolve(features);
        });
      return q.promise;
    };




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
              propertyDetails.features[0].attributes.codelinks = LayerDefintion.get('codelinks');
              q.resolve(propertyDetails.features[0]);
            });
        });
      return q.promise;
    };

    Details.getFilteredDetails = function(){
      //Use promises to handle the request asynchronously; defer till resolved
      var q = $q.defer();

      var category = $stateParams.category;
      //Get Location Properties
      LocationProperties.properties()
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
              var filteredFeaturesSummary= {};
              //array that holds features filtered by time and the filter value
              var filterdFeaturesArray = [];
  
              for (var i = 0; i < features.features.length; i++) {
                //filter by time
                if(features.features[i].attributes[time] >= Time.filterValue()){
                  //filter by filter
                  features.features[i].attributes.color = colors[features.features[i].attributes[filter]];          
                  //build a summary object
                  if(filteredFeaturesSummary[features.features[i].attributes[filter]] === undefined){

                    filteredFeaturesSummary[features.features[i].attributes[filter]] = {'color' : colors[features.features[i].attributes[filter]], 'count' : 1 };

                  }else{
                    filteredFeaturesSummary[features.features[i].attributes[filter]].count = filteredFeaturesSummary[features.features[i].attributes[filter]].count + 1;
                  }
                  //add filtered features to array
                  if($stateParams.filter === 'summary' || features.features[i].attributes[filter].toLowerCase().replace(/ /g, '-') === $stateParams.filter){

                    filterdFeaturesArray.push(features.features[i]);
                    if(features.features[i].attributes.record_comments){
                      features.features[i].attributes.commentsArray = features.features[i].attributes.record_comments.split('[NEXTCOMMENT]');
                    }
                  }
                  
                }
              };

              //Update filter options based on filter summary
              var filterOptions = [];
              filterOptions.push({'value' : 'summary', 'label' : 'Summary'});
              for (var key in filteredFeaturesSummary) {
                filterOptions.push({'value' : key.toLowerCase().replace(/ /g, '-'), 'label' : key});
              }
              Filter.options($stateParams.category, filterOptions);
              var filteredDetails = {
                'features' : filterdFeaturesArray,
                'summary' : filteredFeaturesSummary
              };
              q.resolve(filteredDetails);
            })//END getFeaturesFromAnArrayOfLayerIds Callback
        })//END LocationProperties Callback
      return q.promise;
    };


    //****Return the factory object****//
    return Details; 

    
}]); //END Details factory function