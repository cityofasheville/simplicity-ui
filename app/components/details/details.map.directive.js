app.directive('map', ['$compile','$filter','$state', '$stateParams','$q', 'Details', 'LocationProperties',
  function($compile, $filter, $state, $stateParams, $q, Details, LocationProperties){
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
      var createGeoJsonFromArcGisFeatureServicePolygon = function(featureServicePolygon){
          var geoJson = {
              'type' : 'FeatureCollection',
              'features' : [
              {
                  'type':'Feature',
                  'geometry' : {
                      'type': 'Polygon', 
                      'coordinates': featureServicePolygon.geometry.rings[0]
                  },
                  'properties': featureServicePolygon.geometry.rings[0]
              }
              ]
          };
          return geoJson;
      };

      var createGeoJson = function(data){
        return L.geoJson(data, {
            onEachFeature: function (feature, layer) {
                layer.on('click', function(){
                    
                })
            }
        });
      };

      if($scope.map.category === 'property'){
        Details.getPropertyDetails($scope.map.location)
          .then(function(propertyDetails){
            $scope.propertyDetails = propertyDetails;
            var propertyGeoJson = createGeoJsonFromArcGisFeatureServicePolygon(propertyDetails);
            var propertyGeoJsonLayer = createGeoJson
          })
      }
      //Initialize the map
      var map = L.map('map', {
          center: [35.5951125,-82.5511088], 
          zoom : 13,
          maxZoom : 22,
      });

      //L.control.layers(baseMaps).addTo(map);
      L.tileLayer("http://gis.ashevillenc.gov/tiles/basemapbw/{z}/{x}/{y}.png",{
          attribution:'&copy; The City of Asheville',
          maxZoom : 22,
          tms : true
      }).addTo(map);


       

    }]//END Details Directive Controller function
  };//END returned object
}]);//END Details directivective function