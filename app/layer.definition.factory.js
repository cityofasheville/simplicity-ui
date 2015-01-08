
app.factory('LayerDefintion', ['$http', '$location', '$q', '$filter', '$state', '$stateParams',
  function($http, $location, $q, $filter, $state, $stateParams){

    //****Create the factory object****//
  	var LayerDefintion = {};

    //var colors = ['0F2859','9DBF21','DB770F','63038C','387352','EDFFA5','A25EBF','4E7329','004D73','652975','F2E96B','2D5D75','75210B','537324','A006FF','FF7400','817B7E','F25E3D','F2913D','6EFF63','8C3503','CFD3FF','F2A2FF','FFAA80','FFBF00','4D5973','021E73','057358','FFF700','30588C'];
    var colors = {
      'crime' : {
        'Aggravated Assault' : 'FF0000',
        'Burglary' : 'FFF000',
        'Drug Arrest' : 'FFFF00',
        'Homicide' : 'FFFFF0',
        'Larceny' : '00FFFF',
        'Larceny of Motor Vehicle' : '000080',
        'Rape' : '0000FF',
        'Robbery' : 'FF00FF',
        'Vandalism' : '7FFFD4'
      },
      'development' : {
          'Conditional Use Permit':'FF0000',
          'Conditional Zoning Permit':'FFF000',
          'Planning Level I':'0000FF',
          'Planning Level II':'7FFFD4',
          'Planning Level III':'00FFFF',
          'Planning Signage Plan':'000080'
      }
    };

    // var colors = {
    //   'crime' : {
    //     'Aggrevated Assault' : '0F2859',
    //     'Burglary' : 'F2E96B',
    //     'Drug Arrest' : '8C3503',
    //     'Homicide' : 'FFBF00',
    //     'Larceny' : '4D5973',
    //     'Larceny of Motor Vehicle' : '817B7E',
    //     'Rape' : 'F25E3D',
    //     'Robbery' : 'F2913D',
    //     'Vandalism' : '30588C'
    //   },
    //   'permits' : {
    //     'permits' : {
    //       'commercial-building' : {
    //         'Com: Accessory Structure':'0F2859',
    //         'Com: Addition':'652975',
    //         'Com: Annual Maint.':'F2E96B',
    //         'Com: Cold Shell':'2D5D75',
    //         'Com: Demo':'75210B',
    //         'Com: Electrical':'537324',
    //         'Com: Emergency Repairs':'DB770F',
    //         'Com: Gas Piping':'A006FF',
    //         'Com: Mechanical':'FF7400',
    //         'Com: Multi-Trade':'817B7E',
    //         'Com: Other New':'F25E3D',
    //         'Com: Plumbing':'004D73',
    //         'Com: Remodel':'30588C',
    //         'Com: Reroof':'EDFFA5',
    //         'Com: Site Work':'FFAA80',
    //         'Com: Upfit':'FFBF00',
    //         'Com: Warm Shell':'F2A2FF',
    //       },
    //       'residential-building' : {
    //         'Res: Accessory Structure':'0F2859',
    //         'Res: Addition':'652975',
    //         'Res: Change Out':'F2E96B',
    //         'Res: Demolition':'2D5D75',
    //         'Res: Electrical':'75210B',
    //         'Res: Emergency Repairs':'537324',
    //         'Res: Gas Piping':'DB770F',
    //         'Res: Home Occupation':'A006FF',
    //         'Res: Mechanical':'817B7E',
    //         'Res: Mfg. Home':'F2913D',
    //         'Res: Multi-Trade':'004D73',
    //         'Res: New':'30588C',
    //         'Res: Plumbing':'CFD3FF',
    //         'Res: Remodel':'FFAA80',
    //         'Res: Reroof':'4D5973',
    //         'Res: Site Work':'F2A2FF'
    //       },
    //       'fire' : {
    //         'Fire Alarm':'0F2859',
    //         'Fire: Comp. Gas':'652975',
    //         'Fire: Constr. Other':'F2E96B',
    //         'Fire: Hood Sys.':'F2E96B',
    //         'Fire: Occupational':'2D5D75',
    //         'Fire: Operational':'75210B',
    //         'Fire Prevention':'DB770F'
    //       },
    //       'other' : {
    //         'ABC':'0F2859',
    //         'A-Frame Sign':'652975',
    //         'Construction Trailer':'F2E96B',
    //         'Event-Temporary Use':'2D5D75',
    //         'Exhaust Hood':'75210B',    
    //         'Flood':'537324',
    //         'Foster Care':'DB770F',
    //         'Occupancy':'A006FF',
    //         'Outdoor Dining':'FF7400',
    //         'Outdoor Merchandise':'817B7E',
    //         'Permits - Historical':'F25E3D',
    //         'Permits - Histroical':'F2913D',
    //         'Permits/Over The Counter/Temp Utilities/NA':'004D73',
    //         'Push Cart':'30588C',
    //         'Refrigeration':'63038C',
    //         'ROW: Encroachment':'387352',
    //         'ROW: Street-Sidewalk Cuts':'EDFFA5',
    //         'Sprinkler Sys.':'8C3503',
    //         'Stand Alone Sign':'CFD3FF',
    //         'TCO':'F2A2FF',
    //         'Temp Utilities':'FFAA80',
    //         'Water Extension':'FFBF00',
    //         'Work After Hours':'4D5973'
    //       }
    //     },
    //     'planning' : {
    //       'Alternative Compliance':'0F2859',
    //       'Conditional Use Permit':'652975',
    //       'Conditional Zoning Permit':'F2E96B',
    //       'Flexible Development':'2D5D75',
    //       'Lot Research':'75210B',
    //       'Major Subdivision':'537324',
    //       'Major Work':'DB770F',
    //       'Map Amendments':'A006FF',
    //       'Minor Subdivision':'FF7400',
    //       'Minor Work':'817B7E',
    //       'Planning - Historical':'F25E3D',
    //       'Planning Level I':'F2913D',
    //       'Planning Level II':'30588C',
    //       'Planning Level III':'63038C',
    //       'Planning/Non Development/Alternative Compliance/NA':'387352',
    //       'Planning Signage Plan':'EDFFA5',
    //       'Research Use or Structure':'6EFF63',
    //       'Research Zoning Letters':'8C3503',
    //       'Rezoning':'CFD3FF',
    //       'SCV Level I':'F2A2FF',
    //       'SCV Level II':'FFAA80',
    //       'SCV Level III':'FFBF00',
    //       'Subdivision Alternative Access':'4D5973',
    //       'Subdivision Modification':'021E73',
    //       'Subdivision Recombination':'A25EBF',
    //       'Text Amendments':'4E7329',
    //       'Variance Appeal':'004D73',
    //       'Variance Flood':'057358',
    //       'Variance Sign':'FFF700',
    //       'Variance Zoning':'9DBF21'
    //     },
    //     'services' : {
    //       'Building Enforcement':'9DBF21',
    //       'CE: Open Program':'FFF700',
    //       'Electrical Journeyman':'004D73',
    //       'Fire Enforcement':'4E7329',
    //       'Project Inquiry':'A25EBF',
    //       'Services - Historical':'021E73',
    //       'Stormwater Enforcement':'4D5973',
    //       'Zoning Enforcement':'FFBF00'
    //     }
    //   }
    // };

    var layerDefinitions = {
      'development' : {
        'layer' : 'coagis.gisowner.coa_opendata_permits',
        'type' : 'layer',
        'time' : 'date_opened',
        'filter' : 'record_type',
        'colors' : colors.development
      },
      'commercial-building' : {
        'layer' : 'coagis.gisowner.coa_opendata_permits',
        'type' : 'layer',
        'time' : 'thedate',
        'filter' : 'record_type',
        'colors' : colors
      },
      'crime' : {
        'layer' : 'coagis.gisowner.coa_opendata_crime',
        'type' : 'layer',
        'time' : 'thedate',
        'filter' : 'offense',
        'colors' : colors.crime
      },
      'property' : {
        'codelinks' : {
          'CBD' : 'https://www.municode.com/library/nc/asheville/codes/code_of_ordinances?nodeId=PTIICOOR_CH7DE_ARTVIIIGEUSDI_S7-8-18CEBUDI',
          'CBI' : 'https://www.municode.com/library/nc/asheville/codes/code_of_ordinances?nodeId=PTIICOOR_CH7DE_ARTVIIIGEUSDI_S7-8-12COBUIDI',
          'CBII' : 'https://www.municode.com/library/nc/asheville/codes/code_of_ordinances?nodeId=PTIICOOR_CH7DE_ARTVIIIGEUSDI_S7-8-13COBUIIDI',
          'CBII-CZ' : 'disable',
          'CI' : 'https://www.municode.com/library/nc/asheville/codes/code_of_ordinances?nodeId=PTIICOOR_CH7DE_ARTVIIIGEUSDI_S7-8-20COINDI',
          'HB' : 'https://www.municode.com/library/nc/asheville/codes/code_of_ordinances?nodeId=PTIICOOR_CH7DE_ARTVIIIGEUSDI_S7-8-16HIBUDI',
          'HB-CZ' : 'disable',
          'HCU' : 'https://www.municode.com/library/nc/asheville/codes/code_of_ordinances?nodeId=PTIICOOR_CH7DE_ARTIXOVDI_S7-9-2HIPROVDI',
          'HR-1:CORE' : 'disable',
          'HR-2:EXPN' : 'disable',
          'HR-3:CRDR' : 'disable',
          'HR-4:TRAD' : 'disable',
          'HR-5:L-W' : 'disable',
          'HR-6:TOWN' : 'disable',
          'IND' : 'https://www.municode.com/library/nc/asheville/codes/code_of_ordinances?nodeId=PTIICOOR_CH7DE_ARTVIIIGEUSDI_S7-8-22INDI',
          'IND-CZ' : 'disable',
          'INST' : 'https://www.municode.com/library/nc/asheville/codes/code_of_ordinances?nodeId=PTIICOOR_CH7DE_ARTVIIIGEUSDI_S7-8-15INDI',
          'INST-CZ' : 'disable',
          'LI' : 'https://www.municode.com/library/nc/asheville/codes/code_of_ordinances?nodeId=PTIICOOR_CH7DE_ARTVIIIGEUSDI_S7-8-21LIINDI',
          'NB' : 'https://www.municode.com/library/nc/asheville/codes/code_of_ordinances?nodeId=PTIICOOR_CH7DE_ARTVIIIGEUSDI_S7-8-8NEBUDI',
          'NCD' : 'https://www.municode.com/library/nc/asheville/codes/code_of_ordinances?nodeId=PTIICOOR_CH7DE_ARTVIIIGEUSDI_S7-8-24NECODI',
          'NOT ZONED' : 'disable',
          'O2' : 'https://www.municode.com/library/nc/asheville/codes/code_of_ordinances?nodeId=PTIICOOR_CH7DE_ARTVIIIGEUSDI_S7-8-10OFIIDI',
          'OB' : 'https://www.municode.com/library/nc/asheville/codes/code_of_ordinances?nodeId=PTIICOOR_CH7DE_ARTVIIIGEUSDI_S7-8-11OFBUDI',
          'OFFICE' : 'https://www.municode.com/library/nc/asheville/codes/code_of_ordinances?nodeId=PTIICOOR_CH7DE_ARTVIIIGEUSDI_S7-8-9OFDI',
          'RB' : 'https://www.municode.com/library/nc/asheville/codes/code_of_ordinances?nodeId=PTIICOOR_CH7DE_ARTVIIIGEUSDI_S7-8-17REBUDI',
          'RB-CU' : 'disable',
          'RESORT' : 'https://www.municode.com/library/nc/asheville/codes/code_of_ordinances?nodeId=PTIICOOR_CH7DE_ARTVIIIGEUSDI_S7-8-14REDI',
          'RIVER' : 'https://www.municode.com/library/nc/asheville/codes/code_of_ordinances?nodeId=PTIICOOR_CH7DE_ARTVIIIGEUSDI_S7-8-19RIDI',
          'RM16' : 'https://www.municode.com/library/nc/asheville/codes/code_of_ordinances?nodeId=PTIICOOR_CH7DE_ARTVIIIGEUSDI_S7-8-7RMREMUMIHIDEDI',
          'RM16-CZ' : 'disable',
          'RM6' : 'https://www.municode.com/library/nc/asheville/codes/code_of_ordinances?nodeId=PTIICOOR_CH7DE_ARTVIIIGEUSDI_S7-8-5REMUMILODEDI',
          'RM6-CZ' : 'disable',
          'RM8' : 'https://www.municode.com/library/nc/asheville/codes/code_of_ordinances?nodeId=PTIICOOR_CH7DE_ARTVIIIGEUSDI_S7-8-6REMUMIMEDEDI',
          'RS2' : 'https://www.municode.com/library/nc/asheville/codes/code_of_ordinances?nodeId=PTIICOOR_CH7DE_ARTVIIIGEUSDI_S7-8-2RESIMILODEDI',
          'RS4' : 'https://www.municode.com/library/nc/asheville/codes/code_of_ordinances?nodeId=PTIICOOR_CH7DE_ARTVIIIGEUSDI_S7-8-3RESIMIMEDEDI',
          'RS4-CZ' : 'disable',
          'RS8' : 'https://www.municode.com/library/nc/asheville/codes/code_of_ordinances?nodeId=PTIICOOR_CH7DE_ARTVIIIGEUSDI_S7-8-4RESIMIHIDEDI',
          'RS8-CZ' : 'disable',
          'UP' : 'https://www.municode.com/library/nc/asheville/codes/code_of_ordinances?nodeId=PTIICOOR_CH7DE_ARTVIIIGEUSDI_S7-8-26URPLDI',
          'UP-CZ' : 'disable',
          'URD' : 'https://www.municode.com/library/nc/asheville/codes/code_of_ordinances?nodeId=PTIICOOR_CH7DE_ARTVIIIGEUSDI_S7-8-25URREDI',
          'UV' : 'https://www.municode.com/library/nc/asheville/codes/code_of_ordinances?nodeId=PTIICOOR_CH7DE_ARTVIIIGEUSDI_S7-8-23URVIDI',
        }    
      }
    };
    LayerDefintion.colors = function(){
      return colors;
    };

    LayerDefintion.get = function(property){
      return layerDefinitions[$stateParams.category][property];
    };

    //****Return the factory object****//
    return LayerDefintion; 

    
}]); //END LayerDefintion factory function