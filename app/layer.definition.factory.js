
app.factory('LayerDefintion', ['$http', '$location', '$q', '$filter', '$state', '$stateParams',
  function($http, $location, $q, $filter, $state, $stateParams){

    //****Create the factory object****//
  	var LayerDefintion = {};

    var layerDefinitions = {
      'development' : {
        'layer' : 'coagis.gisowner.coa_opendata_permits',
        'type' : 'layer',
        'time' : 'date_opened',
        'filter' : 'record_type',
        'colors' : {
          'Alternative Compliance' : '0F2859',
          'Conditional Zoning Permit' : 'F2E96B',
          'Major Subdivision' : '537324',
          'Major Work' : 'DB770F',
          'Minor Work' : '817B7E',
          'Planning - Historical' : 'F25E3D',
          'Planning Level I' : 'F2913D',
          'Planning Level II' : '30588C',
          'Planning Level III' : '63038C',
          'Planning/Non Development/Alternative Compliance/NA' : '387352',
          'Research Zoning Letters' : '8C3503',
          'Subdivision Alternative Access' : '4D5973',
          'Subdivision Recombination' : 'A25EBF',
          'Variance Zoning' : '9DBF21'
        }
      },
      'crime' : {
        'layer' : 'coagis.gisowner.coa_opendata_crime',
        'type' : 'layer',
        'time' : 'thedate',
        'filter' : 'offense',
        'colors' : {
          'Aggrevated Assault' : '0F2859',
          'Burglary' : 'F2E96B',
          'Drug Arrest' : '8C3503',
          'Larceny' : '4D5973',
          'Larceny of Motor Vehicle' : '817B7E',
          'Rape' : 'F25E3D',
          'Robbery' : 'F2913D',
          'Vandalism' : '30588C'
        }
      }
    };

    LayerDefintion.get = function(property){
      return layerDefinitions[$stateParams.category][property]
    };

    //****Return the factory object****//
    return LayerDefintion; 

    
}]); //END LayerDefintion factory function