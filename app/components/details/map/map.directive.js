app.directive('map', ['$compile','$filter','$state', '$stateParams','$q', '$timeout', 'Details', 'Extent', 'IdProperties',
  function($compile, $filter, $state, $stateParams, $q, $timeout, Details, Extent, IdProperties){
  return {
    //Restrict the directive to attribute ep-form on an element 
    restrict: 'A',
    //Defines the scope object for the directive 
    scope:{
      map : '= map',
    },
    replace : true,
    //Template for the directive
    templateUrl: 'details/map/map.directive.html',
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
                  $scope.getPointDetails(feature.properties);
                  $scope.pointDetails = feature.properties;
                  $scope.$apply();
              });
          }
      });
    };

    var createGeoJsonFromArcGisFeatureServicePolygon = function(featureServicePolygon){
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
        return geoJson;
    };

    var createGeoJsonFromArcGisFeatureServicePolyLine = function(arcGISFeatureService){
      var geoJson = [];
      for (var i = 0; i < arcGISFeatureService.features.length; i++) {
        var feature = {
            'type':'LineString',
            'coordinates': arcGISFeatureService.features[i].geometry.paths[0],
            'properties': arcGISFeatureService.features[i].attributes
        };
        geoJson.push(feature);
      };
      console.log(geoJson);
      return geoJson;
    };


    var createGeoJson = function(data, style){
      return L.geoJson(data, {
          style: function (feature) {
            if(style){
                return style;
            }
          },
          onEachFeature: function (feature, layer) {

              layer.on('click', function(){
                  
              });
          }
      });
    };

    var openstreetmap = L.tileLayer("http://a.tile.openstreetmap.org/{z}/{x}/{y}.png",{
        attribution:'&copy; <a href="http://osm.org/copyright" title="OpenStreetMap" target="_blank">OpenStreetMap</a> contributors',
        maxZoom : 22
    });

    var esriImagery = L.esri.basemapLayer("Imagery");



    var baseMaps = {
      "Open Street Map" : openstreetmap,
      "ESRI Imagery" : esriImagery
    };

    //Initialize the map
    var map = L.map('map', {
        center: [35.5951125,-82.5511088], 
        zoom : 13,
        maxZoom : 22,
        fullscreenControl: true,
        layers : [openstreetmap]
    });


    var layerControl = L.control.layers(baseMaps).addTo(map);
    $(".leaflet-control-attribution").css("maxWidth", "90%")

    IdProperties.properties()
      .then(function(properties){
        $scope.IdProperties = properties;
        if($scope.map.category === 'property'){
          Details.getPropertyDetails($scope.map.id)
            .then(function(propertyDetails){
              if(properties.zoningOverlays){
                Details.getZoningOverlays(properties.zoningOverlays)
                  .then(function(zoningOverlayDetails){
                    var zoningOverlayGeoJson = createGeoJsonFromArcGisFeatureServicePolygon(zoningOverlayDetails);
                    var zoningOverlayLayer = createGeoJson(zoningOverlayGeoJson,{color: 'red'});
                    layerControl.addOverlay(zoningOverlayLayer, 'Zoning Overlays');
                  });              
              }
              $scope.propertyDetails = propertyDetails;
              var propertyGeoJson = createGeoJsonFromArcGisFeatureServicePolygon(propertyDetails);
              var propertyLayer = createGeoJson(propertyGeoJson);
              propertyLayer.addTo(map);
              map.fitBounds(propertyLayer);
              map.setZoom(18);
            });
        }else{
          Details.getFilteredDetails()
            .then(function(filteredDetails){
              if(properties.address.attributes.Loc_name === 'street_name'){
                Details.getStreetDetails(properties)
                  .then(function(streetDetails){
                    var streetGeoJson = createGeoJsonFromArcGisFeatureServicePolyLine(streetDetails);
                    var style= {
                        "color": "#073F97",
                        "weight": 5,
                        "opacity": 0.8
                    };
                    
                    var streetLayer = createGeoJson(streetGeoJson, style);
                    streetLayer.addTo(map);
                    map.fitBounds(streetLayer);
                  });
                
              }else{
                var radiusInFeet = Extent.filterValue();
                var radiusInMeters = radiusInFeet*0.3048;
                L.marker([properties.address.location.y, properties.address.location.x]).addTo(map);
                var circle = L.circle([properties.address.location.y, properties.address.location.x], radiusInMeters, {
                  'fillOpacity' : 0
                });
                circle.addTo(map);
                var circleBounds = circle.getBounds();
                map.fitBounds(circleBounds);
              }
              
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

        $scope.modalData = pointProperties;

        $scope.category = $stateParams.category;
        $('#pointDetailsModal').modal({'backdrop' : false});
      };

      $scope.goTo = function(detailsLocation){
        $state.go('main.type.id.category.time.extent.filter.details', {'details' : 'report'});
      };
      
      
    }]//END Details Directive Controller function
  };//END returned object
}]);//END Details directivective function