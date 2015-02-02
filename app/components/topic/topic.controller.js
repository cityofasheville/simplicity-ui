app.controller('TopicCtrl', ['$scope', '$stateParams', '$state', '$filter', 'Topics', 'Backend',
 function ($scope, $stateParams, $state, $filter, Topics, Backend) {

    //****Private variables and methods*****//

    $(function () {
      $('[data-toggle="tooltip"]').tooltip();
    });

    //!!! This is breaking the back button :-(
    var updateStateParamsAndReloadState = function(propertyName, value){
      var stateParams = $stateParams;
      stateParams[propertyName] = value;
      $state.transitionTo('main.topics.topic', stateParams, {'reload' : true});
    };

    //****$scope variables and methods*****//

    //Get properties for a topic
    $scope.topicProperties = Topics.topicProperties($stateParams.topic);

    var topics = Topics.getTopics();
    $scope.linkTopics =[];
    for (var lt = 0; lt < $scope.topicProperties.linkTopics.length; lt++) {
      for (var t = 0; t < topics.length; t++) {
        if(topics[t].name === $scope.topicProperties.linkTopics[lt]){
          $scope.linkTopics.push(topics[t]);
        }
      }
    }

    //Assign stateParams to scope
    $scope.stateParams = $stateParams;

    //if searchby or id is not defined go back to search with topic defined (after search come back topic)
    if($stateParams.searchby === null || $stateParams.id === null){
      $state.go('main.search.composite', {'composite' : $stateParams.topic});
    //if searchby is defined check topicProperties to determine if valid, if not go to home
    }else{
      if($scope.topicProperties.searchby[$stateParams.searchby] === undefined){
        $state.go('main.search.composite', {'composite' : 'composite'});
      }
    }

    // +-+-+-+-+
    // |v|i|e|w|
    // +-+-+-+-+

    $scope.headerTemplate = $scope.topicProperties.searchby[$stateParams.searchby].headerTemplate;

    //if view is not defined or if view is not allowed, use default
    if($stateParams.view === null){
      updateStateParamsAndReloadState('view', $scope.topicProperties.defaultView);
    }else if($stateParams.view === 'details' && $scope.topicProperties.detailsViewTemplate === null){
      updateStateParamsAndReloadState('view', $scope.topicProperties.defaultView);
    }else if($stateParams.view === 'list' && $scope.topicProperties.listViewTemplate === null){
      updateStateParamsAndReloadState('view', $scope.topicProperties.defaultView);
    }else if($stateParams.view === 'table' && $scope.topicProperties.tableViewTemplate === null){
      updateStateParamsAndReloadState('view', $scope.topicProperties.defaultView);
    }else if($stateParams.view === 'table' && $stateParams.type !== null){
      updateStateParamsAndReloadState('type', null);
    }else{
      //The view is defined and allowed
    }

    $scope.onClickChangeView = function(view){
      updateStateParamsAndReloadState('view', view);
    };

    // +-+-+-+-+-+-+-+-+-+
    // |t|i|m|e|f|r|a|m|e|
    // +-+-+-+-+-+-+-+-+-+

    //if timeframe is not defined is supposed to be, use default
    if($stateParams.timeframe === null && $scope.topicProperties.searchby[$stateParams.searchby].params.timeframe !== null){
      updateStateParamsAndReloadState('timeframe', $scope.topicProperties.searchby[$stateParams.searchby].params.timeframe);
    }

    //get the select options for changing the timeframe
    $scope.timeframeOptions = Backend.options('timeframe');
    //define a default select option
    $scope.timeframeOptionIndex = 0;
    //find the option that matches the current timeframe defiend in the $stateParams
    for (var tf = 0; tf < $scope.timeframeOptions.length; tf++) {
      if($scope.timeframeOptions[tf].value === $stateParams.timeframe){
        $scope.timeframeOptionIndex = tf;
      } 
    }

     $scope.onChangeTimeframeValue = function(timeframeValue){
      $scope.loading = true;
      setTimeout(function() {
        updateStateParamsAndReloadState('timeframe', timeframeValue.value);
      }, 250);
      
    };

    // +-+-+-+-+-+-+
    // |e|x|t|e|n|t|
    // +-+-+-+-+-+-+

    //if extent is not defined is supposed to be, use default
    if($stateParams.extent === null && $scope.topicProperties.searchby[$stateParams.searchby].params.extent !== null){
      updateStateParamsAndReloadState('extent', $scope.topicProperties.searchby[$stateParams.searchby].params.extent);
    }

    //get the select options for changing the timeframe
    $scope.extentOptions = Backend.options('extent');
    //define a default select option
    $scope.extentOptionIndex = 0;
    
    //find the option that matches the current timeframe defiend in the $stateParams
    for (var e = 0; e < $scope.extentOptions.length; e++) {
      if($scope.extentOptions[e].value === Number($stateParams.extent)){
        $scope.extentOptionIndex = e;
      } 
    }

    $scope.onChangeExtentValue = function(extentValue){
      updateStateParamsAndReloadState('extent', extentValue.value);
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



    $(".leaflet-control-attribution").css("maxWidth", "90%");

    var map = L.map('map', {
        center: [35.5951125,-82.5511088], 
        zoom : 13,
        maxZoom : 22,
        fullscreenControl: true,
        layers : [openstreetmap]
    });

    var layerControl = L.control.layers(baseMaps).addTo(map);
    
    if($stateParams.type === null || $stateParams.type === 'null'){
      $scope.filterText = "";
    }else{
      $scope.filterText = $stateParams.type;
    }
    
    var returnToFullscreen = false;

    var addGeoJsonToMap = function(data, style){
      if(data.length > 0){
        var leafletGeoJsonLayer = L.geoJson(data, {
          pointToLayer: function(feature, latlng){
            if(feature.geometry.type === "Point"){
              return L.circleMarker(latlng, {
                radius: 10,
                fillColor: "#"+feature.properties.color,
                color: "#"+feature.properties.color,
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
              }); 
            }else{
              return false;
            }
          },
          style: function (feature) {
            if(style){
              return style;
            }else if(feature.geometry.type === "LineString"){
              return {
                color: "#"+feature.properties.color,
                weight: 8,
                opacity: 0.8,
              }; 
            }
          },
          onEachFeature: function (feature, layer) {
            layer.on('click', function(){
                  $scope.filterText = feature.properties.objectid;
                  $scope.$apply();
                  $('#detailsModal').modal({'backdrop' : 'static'});
                  if (
                      document.fullscreenElement ||
                      document.webkitFullscreenElement ||
                      document.mozFullScreenElement ||
                      document.msFullscreenElement
                  ) {
                    returnToFullscreen = true;
                  }
                  if (document.exitFullscreen) {
                      document.exitFullscreen();
                  } else if (document.webkitExitFullscreen) {
                      document.webkitExitFullscreen();
                  } else if (document.mozCancelFullScreen) {
                      document.mozCancelFullScreen();
                  } else if (document.msExitFullscreen) {
                      document.msExitFullscreen();
                  }   
            });
          }
        });
        leafletGeoJsonLayer.addTo(map);
        map.fitBounds(leafletGeoJsonLayer);
          if(map.getZoom() > 18){
            map.setZoom(18);
          }
      }
    };

    var addSearchGeoJsonToMap = function(data, style){
      return L.geoJson(data, {
        style: function (feature) {
          if(style){
            return style;
          }
        },
        onEachFeature: function (feature, layer) {
          if(feature.geometry.type === 'Point' && $stateParams.extent !== null && $stateParams.extent !== 'null'){
            var radiusInMeters = $stateParams.extent*0.3048;
            var circle = L.circle([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], radiusInMeters, {
              'fillOpacity' : 0,
              'opacity' : 0.3
            });
            circle.addTo(map);
              layer.on('click', function(){
                  
              });
          }
          
        }
      });
    };

    var addOverlayGeoJsonToMap = function(data, style){
      var overlayLayer =  L.geoJson(data, {
        style: function (feature) {
          if(style){
            return style;
          }
        },
        onEachFeature: function (feature, layer) {
          layerControl.addOverlay(layer, feature.properties.name);
          
        }
      });
      overlayLayer.addTo(map);
    };



    $scope.loading = true;
    //!!! Check if dataCache is already defined

    Backend.dataCache()
      .then(function(data){
        Backend.topic()
          .then(function(topic){
            $scope.topic = topic;
            $scope.loading = false;
            if(topic.searchGeojson){
              addSearchGeoJsonToMap(topic.searchGeojson, {'fillOpacity' : 0,'opacity' : 0.3}).addTo(map);
            }
            if(topic.overlays){
              var overlayLayer = addOverlayGeoJsonToMap(topic.overlays, {'fillOpacity' : 0.1,'opacity' : 0.3});
            }
            if(topic.features){
              if($stateParams.type !== null || $stateParams.type !== 'null'){
                var filteredTopic = $filter('filter')(topic.features, $stateParams.type, true);
                addGeoJsonToMap(filteredTopic);
              }else{
                addGeoJsonToMap(topic);
              }             
            }         
          });
      });

    $scope.goToTopics = function(){
      $state.go('main.topics.list', {'searchtext' : $stateParams.searchtext, 'searchby' : $stateParams.searchby, 'id' : $stateParams.id});
    };

    $scope.filterBy = function(type){

      if($stateParams.view === 'table'){
        updateStateParamsAndReloadState('type', type);
        updateStateParamsAndReloadState('view', 'list');
      }else if($stateParams.view === 'map' || $stateParams.view === 'list'){
        updateStateParamsAndReloadState('type', type);
      }else{
        //do nothing
      }
      $scope.filterText = type;
    };


    $scope.closeModal = function(){
      if(returnToFullscreen === true){
        var m = document.getElementById("map");
 
        // go full-screen
        if (m.requestFullscreen) {
            m.requestFullscreen();
        } else if (m.webkitRequestFullscreen) {
            m.webkitRequestFullscreen();
        } else if (m.mozRequestFullScreen) {
            m.mozRequestFullScreen();
        } else if (m.msRequestFullscreen) {
            m.msRequestFullscreen();
        }
        returnToFullscreen = false;
      }
    };


    $scope.openDownloadModal = function(){
      $('#downloadModal').modal({'backdrop' : false});
    };


    $scope.download = function(downloadType, topic){
      var csvString =  'data:text/csv;charset=utf-8,';
      if(downloadType === 'summary'){
        csvString += 'Type, Count' + '\n';
        for(var key in topic.summary.table){
          var summaryItemString = key + ',' + topic.summary.table[key].count;
          csvString += summaryItemString + '\n';
        }
      }else if (downloadType === 'complete'){
        var headerArray = [];
        
        for(var attributeKey in topic.features[0].properties){
          headerArray.push(attributeKey);
        }
        for(var geometryKey in topic.features[0].geometry){
          headerArray.push(geometryKey);
        }
        csvString += headerArray.join(',') + '\n';
        for (var i = 0; i < topic.features.length; i++) {
          var rowArray = [];
          for (var x = 0; x < headerArray.length; x++) {
            if(topic.features[i].properties[headerArray[x]]){
              // if(topic.features[i].properties[headerArray[x]].constructor === Array){
              //   rowArray.push(JSON.stringify(topic.features[i].properties[headerArray[x]]));
              // }else{
              //   rowArray.push(topic.features[i].properties[headerArray[x]]);
              // }
              rowArray.push(topic.features[i].properties[headerArray[x]]);
            }else if(topic.features[i].geometry[headerArray[x]]){
              rowArray.push(topic.features[i].geometry[headerArray[x]]);
            }else{
              rowArray.push('NULL');
            }
          }
          csvString += rowArray.join(',') + '\n';
        }
      }
      var encodedUri = encodeURI(csvString);
      window.open(encodedUri);
    };


}]);