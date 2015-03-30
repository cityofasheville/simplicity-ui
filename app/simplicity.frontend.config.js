//keywords crimeIds, time(time needs some formatting), neighborhoodName
angular.module('simplicity.frontend.config', [])
  .constant('COLORS', {
    'crime' : {
      'Aggravated Assault' : 'FF0000',
      'Burglary' : 'FFF000',
      'Drug Arrest' : 'FFA500',
      'Homicide' : 'FFFFF0',
      'Larceny' : '00FF00',
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
    },
    'streetmaintenance' : {
      'CITY OF ASHEVILLE' : {'color' : 'FF0000'},
      'PRIVATE' : {'color' : 'FFF000'},
      'UNKNOWN' : {'color' : 'FFA500'},
      'NCDOT' : {'color' : '00FF00'},
      'NATIONAL PARK SERVICE' : {'color' : '000080'}
    }
  })
  //The extent values are in feet
  //Make sure that if you change the timeframe values here, that you ALSO!!!! change the TimeFrame factory below
  .constant('SELECT_OPTIONS', {
      'extent' : [
        {'value' : 82.5, 'label' : 'a quarter block (27.5 yards)'},
        {'value' : 165, 'label' : 'half a block (55 yards)'},
        {'value' : 330, 'label' : 'a city block (110 yards)'},
        {'value' : 660, 'label' : 'a couple city blocks (1/8 mile)'},
        {'value' : 1320, 'label' : 'a quarter mile'}   
      ],
      'timeframe' : [
        {'value' : 'last-30-days', 'label' : 'the last 30 days'},
        {'value' : 'last-6-months', 'label' : 'the last 6 months'},
        {'value' : 'last-year', 'label' : 'the last year'},
        {'value' : 'last-5-years', 'label' : 'the last 5 years'},
        {'value' : 'last-10-years', 'label' : 'the last 10 years'},
        {'value' : 'all-time', 'label' : 'all time'}
      ]
    })
  .constant('CODELINKS', {
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
    })
  .factory('TimeFrame', [
    function(){

      var TimeFrame = {};

      
      TimeFrame.get = function(timeframe){
        
        var d = new Date();
        
        if(timeframe === 'last-30-days'){
          d.setMonth(d.getMonth() - 1);
        }else if (timeframe === 'last-6-months') {
          d.setMonth(d.getMonth() - 6);
        }else if(timeframe === 'last-year'){
          d.setFullYear(d.getFullYear()-1);
        }else if(timeframe === 'last-5-years'){
          d.setFullYear(d.getFullYear()-5);
        }else if(timeframe === 'last-10-years'){
          d.setFullYear(d.getFullYear()-10);
        }else if(timeframe === 'all-time'){
          d.setFullYear(d.getFullYear()-100);
        }else{
          d.setMonth(d.getMonth() - 1);
        }

        return d;
      };


      //****Return the factory object****//
      return TimeFrame;   
  }]); //END TimeFrame factory function



 
  


