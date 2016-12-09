simplicity.controller('TopicSingleCtrl', ['$scope', '$stateParams', '$state', '$filter', '$location', 'Topics', 'AddressCache', 'SELECT_OPTIONS', 'EXEMPTION_TYPES',
 function ($scope, $stateParams, $state, $filter, $location, Topics, AddressCache, SELECT_OPTIONS, EXEMPTION_TYPES) {

    //****Private variables and methods*****//

    $(function () {
      $('[data-toggle="tooltip"]').tooltip();
    });

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

    //check if view is valid
    var viewIsValid = function(){
      var validity = false;
      for (var i = 0; i < $scope.topicProperties.searchby[$stateParams.searchby].params.validViews.length; i++) {
        if($scope.topicProperties.searchby[$stateParams.searchby].params.validViews[i] === $stateParams.view){
          validity = true;
        }
      }
      return validity;
    };
    //if view is not defined or if view is not allowed, use default
    if($stateParams.view === null){
      updateStateParamsAndReloadState('view', $scope.topicProperties.searchby[$stateParams.searchby].params.view);
    }else{
      if(!viewIsValid()){
        updateStateParamsAndReloadState('view', $scope.topicProperties.searchby[$stateParams.searchby].params.view);
      }else if($stateParams.view === 'summary' && $stateParams.type !== null){
        updateStateParamsAndReloadState('type', null);
      }else if($stateParams.view !== 'map' && $stateParams.mapcenter !== null){
        updateStateParamsAndReloadState('mapcenter', null);
      }
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
    $scope.timeframeOptions = SELECT_OPTIONS.timeframe;
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
    $scope.extentOptions = SELECT_OPTIONS.extent;
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



    // +-+-+-+ 
    // |m|a|p| 
    // +-+-+-+ 

    var openstreetmap = L.tileLayer("http://a.tile.openstreetmap.org/{z}/{x}/{y}.png",{
      attribution:'&copy; <a href="http://osm.org/copyright" title="OpenStreetMap" target="_blank">OpenStreetMap</a> contributors',
      maxZoom : 22
    });

    var esriImagery = L.esri.basemapLayer("Imagery");


    var baseMaps = {
      "Street Map" : openstreetmap,
      "Imagery" : esriImagery
    };



    $(".leaflet-control-attribution").css("maxWidth", "90%");

    var map = L.map('map', {
        center: [35.5951125,-82.5511088], 
        zoom : 13,
        maxZoom : 22,
        layers : [openstreetmap]
    });

    var layerControl = L.control.layers(baseMaps).addTo(map);
    
    if($stateParams.type === null || $stateParams.type === 'null'){
      $scope.filterText = "";
    }else{
      $scope.filterText = $stateParams.type;
    }

    var mapExpanded = false;
    var expandMap = function(){
      if(!mapExpanded){
        $('body').css({
          'padding' : 0,
          'margin' : 0,
          'height' : '100%',
          'width' : '100%',
          'overflow' : 'hidden'
        });
        $('html').css({
          'height' : '100%',
          'width' : '100%',
        });
        $('#map').css({
          'height' : $(window).height(),
          'width' : $(window).width(),
          'position' : 'fixed',
          'top' : '0px',
          'left' : '0px',
          'zIndex' : 999
        });
        $('.leaflet-control-expand-map-interior').removeClass('leaflet-control-expand');
        $('.leaflet-control-expand-map-interior').addClass('leaflet-control-collapse');
        mapExpanded = !mapExpanded;
      }else{
        $('body').css({
          'overflow' : 'auto'
        });
        $('#map').css({
          'height' : '400px',
          'width' : '100%',
          'position' : 'relative',
        });
         $('.leaflet-control-expand-map-interior').removeClass('leaflet-control-collapse');
        $('.leaflet-control-expand-map-interior').addClass('leaflet-control-expand');
        mapExpanded = !mapExpanded;
      }
      map.invalidateSize();
    };

   var ExpandMap = L.Control.extend({
        options: {
            position: 'topleft',
        },

        onAdd: function (map) {
            var controlDiv = L.DomUtil.create('div', 'leaflet-control-command');
            L.DomEvent
              .addListener(controlDiv, 'click', L.DomEvent.stopPropagation)
              .addListener(controlDiv, 'click', L.DomEvent.preventDefault)
              .addListener(controlDiv, 'click', function () { expandMap(); });

            var controlUI = L.DomUtil.create('div', 'leaflet-control-expand-map-interior', controlDiv);
            controlUI.title = 'Expand map to the fullpage';
            return controlDiv;
        }
    });

    map.addControl(new ExpandMap());

    $('.leaflet-control-expand-map-interior').addClass('leaflet-control-expand');


    var addGeoJsonToMap = function(data, style){
      var mapcenter;
      var centerArray;
      if(data.length > 0){
        var leafletGeoJsonLayer = L.geoJson(data, {
          pointToLayer: function(feature, latlng){
            if(feature.geometry.type === "Point"){
                return L.circleMarker(latlng, {
                  radius: 10,
                  fillColor: feature.properties.color,
                  color: "#7f8c8d",
                  weight: 2,
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
            }else if(feature.geometry.type === "LineString" || feature.geometry.type === "MultiLineString"){
                return {
                  color: feature.properties.color,
                  weight: 8,
                  opacity: 0.7,
                };
            }
          },
          onEachFeature: function (feature, layer) {
            layer.on('click', function(){
                  $scope.filterText = feature.properties.objectid;
                  $scope.$apply();
                  $('#detailsModal').modal({'backdrop' : 'static'}); 
            });
          }
        });
        leafletGeoJsonLayer.addTo(map);
        map.fitBounds(leafletGeoJsonLayer);
        if(map.getZoom() > 18){
          map.setZoom(18);
        }
        setTimeout(function() {
          if($stateParams.mapcenter !== null){
            var mapcenter = $stateParams.mapcenter;
            var centerArray = mapcenter.split(',');
            map.panTo(L.latLng(Number(centerArray[3]), Number(centerArray[1])));
            map.setZoom(18);
          }

        }, 2000);
        
         
      }
    };

    var addSearchGeoJsonToMap = function(data){
      return L.geoJson(data, {
        onEachFeature: function (feature, layer) {
          if(feature.geometry.type === 'Point' && $stateParams.extent !== null && $stateParams.extent !== 'null'){
            var radiusInMeters = $stateParams.extent*0.3048;
            var circle = L.circle([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], radiusInMeters, {
              'color' : '#3498db',
              'fillOpacity' : 0,
              'opacity' : 0.8,
              'clickable' : false
            });
            circle.addTo(map);
              layer.on('click', function(){
                  
              });
          }
          
        },
        pointToLayer: function(feature, latlng){
          return L.circleMarker(latlng, {
              radius: 4,
              fillColor: "#3498db",
              color: "#3498db",
              weight: 2,
              opacity: 1,
              fillOpacity: 0.8,
              clickable : false
            });
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

    $scope.onChangeMapCenter = function(properties,x,y){
      var xProp, yProp;
      for(var prop in properties){
        if(properties[prop] === x){
          xProp = prop;
        }else if(properties[prop] === y){
          yProp = prop;
        }
      }
      var mapcenter = xProp + ',' + x + ',' + yProp + ',' + y;
      var stateParams = $stateParams;
      stateParams.mapcenter = mapcenter;
      stateParams.view = 'map';
      $state.transitionTo('main.topics.topic', stateParams, {'reload' : true});
    };

    if($stateParams.mapcenter && $stateParams.mapcenter !== null){
      var mapCenterArray = $stateParams.mapcenter.split(',');

      L.marker([Number(mapCenterArray[3]), Number(mapCenterArray[1])]).addTo(map);
    }

    $scope.loading = true;
    $scope.emailSubject = "";
    $scope.emailBodyText = "";






    var generateCsvForDownload = function(downloadType, topic){

      var csvString =  'data:text/text;charset=utf-8,';

      if(downloadType === 'summary'){
        csvString += 'Type, Count' + '\n';
        for(var key in topic.summary.table){
          var summaryItemString = key + ',' + topic.summary.table[key].count;
          csvString += summaryItemString + '\n';
        }
        var encodedUri = encodeURI(csvString);
        
        return encodedUri;
      }else if (downloadType === 'complete'){
        var headerArray = [];
        
        for(var attributeKey in topic.features[0].properties){
          headerArray.push(attributeKey);
        }

        var subHeadings = [];
        for (var j = 0; j < topic.features.length; j++) {    
          for (var z = 0; z < headerArray.length; z++) {
            
            if(topic.features[j].properties[headerArray[z]]){
              
              if (topic.features[j].properties[headerArray[z]].constructor === Array){
                
                for(var subHeading in topic.features[j].properties[headerArray[z]][0]){
                  
                  subHeadings.push(subHeading);
                }
              }
            }
          }
        }

        for (var s = 0; s < subHeadings.length; s++) {
          headerArray.push(subHeadings[s]);
        }

        csvString += headerArray.join(',') + '\n';
        for (var i = 0; i < topic.features.length; i++) {
          var rowArray = [];
          var subPropertyObj = {};
          for (var x = 0; x < headerArray.length; x++) {
            if(topic.features[i].properties[headerArray[x]]){
              if(typeof topic.features[i].properties[headerArray[x]] === 'string'){
                var containsAComma = false;
                for (var y = 0; y < topic.features[i].properties[headerArray[x]].length; y++) {
                  if(topic.features[i].properties[headerArray[x]].charAt(y) === ','){
                    containsAComma = true;
                  }
                }
                if(containsAComma === true){
                  rowArray.push('"' + topic.features[i].properties[headerArray[x]] + '"');
                }else{
                  rowArray.push(topic.features[i].properties[headerArray[x]]);
                }
                
              }else if (typeof topic.features[i].properties[headerArray[x]] === 'number'){
                rowArray.push(topic.features[i].properties[headerArray[x]]);
              }else if (topic.features[i].properties[headerArray[x]].constructor === Array){
                for (var a = 0; a < topic.features[i].properties[headerArray[x]].length; a++) {
                  for(var subProp in topic.features[i].properties[headerArray[x]][a]){
                    if(subPropertyObj[subProp] === undefined ){
                      subPropertyObj[subProp] = topic.features[i].properties[headerArray[x]][a][subProp];
                    }else{
                      subPropertyObj[subProp] = subPropertyObj[subProp] + ", " + topic.features[i].properties[headerArray[x]][a][subProp];
                    }
                  }
                }
                rowArray.push('NULL');
              }
            }else{
              if(subPropertyObj[headerArray[x]]){
                rowArray.push(subPropertyObj[headerArray[x]]);
              }else{
                rowArray.push('NULL');
              }
            }
          
          }
          csvString += rowArray.join(',') + '\n';
        }

        var encodedUri = encodeURI(csvString);
        //window.open(encodedUri);
        return encodedUri;
      }
    };

    $scope.openDownloadModal = function(){
      $('#downloadModal').modal({'backdrop' : false});
    };

    $scope.downloadGeoJson = function(downloadType, topic){
      var jsonString =  'data:text/json;charset=utf-8,';
      var json = JSON.stringify(topic);
      jsonString = jsonString + json;
      var encodedUri = encodeURI(jsonString);
      window.open(encodedUri);
    };

    $scope.summaryCsvDataUrl = "";
    $scope.completeCsvDataUrl = "";

    //  _   _                _   _     _           _             _                                   _   _     _             
    // | | | | ___ _   _    | |_| |__ (_)___   ___| |_ __ _ _ __| |_ ___    _____   _____ _ __ _   _| |_| |__ (_)_ __   __ _ 
    // | |_| |/ _ \ | | |   | __| '_ \| / __| / __| __/ _` | '__| __/ __|  / _ \ \ / / _ \ '__| | | | __| '_ \| | '_ \ / _` |
    // |  _  |  __/ |_| |_  | |_| | | | \__ \ \__ \ || (_| | |  | |_\__ \ |  __/\ V /  __/ |  | |_| | |_| | | | | | | | (_| |
    // |_| |_|\___|\__, ( )  \__|_| |_|_|___/ |___/\__\__,_|_|   \__|___/  \___| \_/ \___|_|   \__, |\__|_| |_|_|_| |_|\__, |
    //             |___/|/                                                                     |___/                   |___/ 

    AddressCache.query()
      .then(function(data){
        Topics.buildTopic()
          .then(function(topic){
            $scope.topic = topic;
            
    
            $scope.loading = false;
            if(topic.searchGeojson){
              addSearchGeoJsonToMap(topic.searchGeojson).addTo(map);
            }
            if(topic.overlays){
              var overlayLayer = addOverlayGeoJsonToMap(topic.overlays, {'fillOpacity' : 1,'opacity' : 1});
            }
            if(topic.features){
              if($stateParams.type !== null || $stateParams.type !== 'null'){
                var filteredTopic = $filter('filter')(topic.features, $stateParams.type, true);
                addGeoJsonToMap(filteredTopic);
              }else{
                addGeoJsonToMap(topic);
              }             
            }

            if ($stateParams.topic === 'crime' || $stateParams.topic === 'development') {
              $scope.summaryCsvDataUrl = generateCsvForDownload('summary', $scope.topic);
              $scope.completeCsvDataUrl = generateCsvForDownload('complete', $scope.topic);
              console.log($scope.summaryCsvDataUrl);
            }else{
              $scope.completeCsvDataUrl = generateCsvForDownload('complete', $scope.topic);
            }


            //EMAIL FORMATTING

            var emailTopic = "";

            if($scope.topic.features !== undefined){
              if($scope.topic.features.length > 1){
                emailTopic = $scope.topicProperties.plural;
              }else{
                emailTopic = "the " + $scope.topicProperties.title;
              }
            }else{
              emailTopic = $scope.topicProperties.title;
            }
            

            $scope.emailSearchBy = "";

            if($scope.topicProperties.searchby[$stateParams.searchby].prepositions.timeframe){
              $scope.emailSearchBy = $scope.emailSearchBy + " " + $scope.topicProperties.searchby[$stateParams.searchby].prepositions.timeframe + " " + $scope.timeframeOptions[$scope.timeframeOptionIndex].label;
            }

            if($scope.topicProperties.searchby[$stateParams.searchby].prepositions.extent){
              $scope.emailSearchBy = $scope.emailSearchBy + " " + $scope.topicProperties.searchby[$stateParams.searchby].prepositions.extent + " " + $scope.extentOptions[$scope.extentOptionIndex].label;
            }

            if($scope.topicProperties.searchby[$stateParams.searchby].prepositions.searchby){
              $scope.emailSearchBy = $scope.emailSearchBy + " " + $scope.topicProperties.searchby[$stateParams.searchby].prepositions.searchby + " " + $stateParams.searchtext;
            }



            $scope.emailSubject = "SimpliCity data for " + emailTopic + $scope.emailSearchBy;

            $scope.emailBodyText ="City of Asheville's SimpliCity: city data simplified%0D%0A%0D%0AClick the link below to view your data.%0D%0A%0D%0A<" + escape(window.location) + ">";
                    
          });
      });


    $scope.goToTopics = function(){
      $state.go('main.topics.list', {'searchtext' : $stateParams.searchtext, 'searchby' : $stateParams.searchby, 'id' : $stateParams.id});
    };

    $scope.filterBy = function(type){

      if($stateParams.view === 'summary'){
        updateStateParamsAndReloadState('type', type);
        updateStateParamsAndReloadState('view', 'list');
      }else if($stateParams.view === 'map' || $stateParams.view === 'list'){
        updateStateParamsAndReloadState('type', type);
      }else{
        //do nothing
      }
      $scope.filterText = type;
    };

    $scope.changeColor = function(color){
      return {'color' : color};
    };




  $scope.citizenServiceRequestData = {};
  $scope.openCitizenServiceRequestModal = function(itemDetails){
    $scope.citizenServiceRequestData = itemDetails;
    $('#citizenServiceRequestModal').modal({'backdrop' : false});
  };

  $scope.closeCitizenServiceRequestModal = function(){
    $('#citizenServiceRequestModal').modal('hide');
    $('#detailsModal').modal('hide');
    $('body').css({
          'overflow' : 'auto'
        });
        $('#map').css({
          'height' : '400px',
          'width' : '100%',
          'position' : 'relative',
        });
         $('.leaflet-control-expand-map-interior').removeClass('leaflet-control-collapse');
        $('.leaflet-control-expand-map-interior').addClass('leaflet-control-expand');
        mapExpanded = !mapExpanded;
    map.invalidateSize();
    $state.transitionTo('main.topics.topic', $stateParams, {'reload' : true});
  };

  $scope.exemptionTypes = EXEMPTION_TYPES;

}]);