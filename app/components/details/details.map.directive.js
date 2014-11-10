app.directive('map', ['$compile','$filter','$state', '$stateParams','$q', 'Details', 'Extent', 'LocationProperties', 'Modal',
  function($compile, $filter, $state, $stateParams, $q, Details, Extent, LocationProperties, Modal){
  return {
    //Restrict the directive to attribute ep-form on an element 
    restrict: 'A',
    //Defines the scope object for the directive 
    scope:{
      map : '= map',
    },
    replace : true,
    //Template for the directive
    templateUrl: 'details/details.map.directive.html',
    controller : ['$scope', function($scope){


    //Creates GeoJson from an ArcGIS Feature Service
    var createPointGeoJsonFromFilteredDetails = function(filteredDetails){
        var geoJson = {
            'type' : 'FeatureCollection',
            'features' : []
        };

        for (var i = 0; i < filteredDetails.features.length; i++) {
            var temp = {
                'type':'Feature',
                'geometry' : {
                    'type': 'Point', 
                    'coordinates': [filteredDetails.features[i].geometry.x, filteredDetails.features[i].geometry.y]
                },
                'properties': filteredDetails.features[i].attributes
            };
            geoJson.features.push(temp);
        }
        console.log(geoJson);
        return geoJson;
    };

    var createGeoJsonMarkers = function(data){
      return L.geoJson(data, {
          pointToLayer: function (feature, latlng) {

              return L.circleMarker(latlng, {
                  radius: 6,
                  fillColor: "#"+feature.properties.color,
                  color: "#"+feature.properties.color,
                  weight: 1,
                  opacity: 1,
                  fillOpacity: 0.8
              }); 
          },
          onEachFeature: function (feature, layer) {
              layer.on('click', function(){
                  console.log('click');
                  $scope.getPointDetails(feature.properties);
                  $scope.pointDetails = feature.properties;
                  $scope.$apply();
              });
          }
      });
    };

    var createGeoJsonFromArcGisFeatureServicePolygon = function(featureServicePolygon){
      console.log(featureServicePolygon.geometry.rings[0]);
        var geoJson = {
            'type' : 'FeatureCollection',
            'features' : [
            {
                'type':'Feature',
                'geometry' : {
                    'type': 'Polygon', 
                    'coordinates': [featureServicePolygon.geometry.rings[0]]
                },
                'properties': featureServicePolygon.attributes
            }
            ]
        };
        console.log(geoJson);
        return geoJson;
    };


    var createGeoJson = function(data){
      return L.geoJson(data, {
          
          onEachFeature: function (feature, layer) {
              layer.on('click', function(){
                  
              });
          }
      });
    };

    var getBounds = function(coordinatesArray){
      var minLat = 90;
      var maxLat = -90;
      var minLng = 180;
      var maxLng = -180;
      for (var i = 0; i < coordinatesArray.length; i++) {
        console.log(coordinatesArray[i][0]);
        console.log(coordinatesArray[i][1]);
        if(coordinatesArray[i][0] < minLng){
          minLng = coordinatesArray[i][0];
        }else if(coordinatesArray[i][0] > maxLng){
          maxLng = coordinatesArray[i][0];
        }else if(coordinatesArray[i][1] < minLat){
          minLat = coordinatesArray[i][1];
        }else if(coordinatesArray[i][1] > maxLat){
          maxLat = coordinatesArray[i][1];
        }else{
          //pass
        }
      }
      return [[minLat, minLng], [maxLat, maxLng]];
    };

    var getBoundsOfPointGeoJson = function(geoJson){
      if(geoJson.features.length === 1){
        return [
          [geoJson.features[0].geometry.coordinates[1] - 0.01, geoJson.features[0].geometry.coordinates[0]-0.01], 
          [geoJson.features[0].geometry.coordinates[1] + 0.01, geoJson.features[0].geometry.coordinates[0]+ 0.01]
        ];
      }else if(geoJson.features.length === 0){
        return [
          [geoJson.features[0].geometry.coordinates[1] - 0.01, geoJson.features[0].geometry.coordinates[0]-0.01], 
          [geoJson.features[0].geometry.coordinates[1] + 0.01, geoJson.features[0].geometry.coordinates[0]+ 0.01]
        ];
      }else{
        var minLat = 90;
        var maxLat = -90;
        var minLng = 180;
        var maxLng = -180;
        for (var i = 0; i < geoJson.features.length; i++) {
          if(geoJson.features[i].geometry.coordinates[0] < minLng){
            minLng = geoJson.features[i].geometry.coordinates[0];
          }
          if(geoJson.features[i].geometry.coordinates[0] > maxLng){
            maxLng = geoJson.features[i].geometry.coordinates[0];
          }

          if(geoJson.features[i].geometry.coordinates[1] < minLat){
            minLat = geoJson.features[i].geometry.coordinates[1];
          }
          if(geoJson.features[i].geometry.coordinates[1] > maxLat){
            maxLat = geoJson.features[i].geometry.coordinates[1];
          }
        }
        console.log([[minLat, minLng], [maxLat, maxLng]]);
        return [[minLat, minLng], [maxLat, maxLng]];
      }
      
    };
    //Initialize the map
    var map = L.map('map', {
        center: [35.5951125,-82.5511088], 
        zoom : 13,
        maxZoom : 22,
        fullscreenControl: true
    });

    //Leaflet Awesome markers style (uses font awesome icons)
    var crimeMarker = L.AwesomeMarkers.icon({
        icon: 'circle',
        prefix: 'fa',
        iconColor :'#12BFFF',
        markerColor: 'white',
      });

    //L.control.layers(baseMaps).addTo(map);
    L.tileLayer("http://gis.ashevillenc.gov/tiles/basemapbw/{z}/{x}/{y}.png",{
        attribution:'&copy; The City of Asheville',
        maxZoom : 19,
        tms : true
    }).addTo(map);

    LocationProperties.properties()
      .then(function(properties){
        $scope.locationProperties = properties;
        if($scope.map.category === 'property'){
          Details.getPropertyDetails($scope.map.location)
            .then(function(propertyDetails){
              $scope.propertyDetails = propertyDetails;
              var propertyGeoJson = createGeoJsonFromArcGisFeatureServicePolygon(propertyDetails);
              var propertyLayer = createGeoJson(propertyGeoJson);
              var propertyBounds = getBounds(propertyDetails.geometry.rings[0]);
              propertyLayer.addTo(map);
              map.fitBounds(propertyBounds);
              map.setZoom(18);
            });
        }else{
          Details.getFilteredDetails()
            .then(function(filteredDetails){
              var radiusInFeet = Extent.filterValue();
              var radiusInMeters = radiusInFeet*0.3048;
              L.marker([properties.address.location.y, properties.address.location.x]).addTo(map);
              var circle = L.circle([properties.address.location.y, properties.address.location.x], radiusInMeters, {
                'fillOpacity' : 0
              });
              circle.addTo(map);
              var circleBounds = circle.getBounds();
              map.fitBounds(circleBounds);
              var geojson = createPointGeoJsonFromFilteredDetails(filteredDetails)
              var geoJsonLayer = createGeoJsonMarkers(geojson);
              geoJsonLayer.addTo(map);
              
              
            });
        }
      });
      $scope.crime = true
      if($stateParams.category !== 'crime'){
        $scope.crime = false
      };
      $scope.showMarkerDetails = false;

      $scope.getPointDetails = function(pointProperties){
        //Modal.setData(pointProperties);
        $scope.modalData = pointProperties;
        //$scope.showMarkerDetails = true;
        $scope.category = $stateParams.category;
        $('#pointDetailsModal').modal({'backdrop' : false});
      };

      $scope.goTo = function(detailsLocation){
        $state.go('main.location.category.time.extent.filter.details', {'details' : 'report'});
      };
      
      
    }]//END Details Directive Controller function
  };//END returned object
}]);//END Details directivective function