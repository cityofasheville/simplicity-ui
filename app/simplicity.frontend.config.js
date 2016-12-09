//keywords crimeIds, time(time needs some formatting), neighborhoodName
angular.module('simplicity.frontend.config', [])
  .constant('COLORS', {
    'crime' : {
      'Aggravated Assault' : '#FF0000',
      'Burglary' : '#FFF000',
      'Drug Arrest' : '#FFA500',
      'Homicide' : '#FFFFF0',
      'Larceny' : '#00FF00',
      'Larceny of Motor Vehicle' : '#000080',
      'Rape' : '#0000FF',
      'Robbery' : '#FF00FF',
      'Vandalism' : '#7FFFD4'
    },
    'development' : {
        'Conditional Use Permit':'#FF0000',
        'Conditional Zoning Permit':'#FFF000',
        'Planning Level I':'#0000FF',
        'Planning Level II':'#7FFFD4',
        'Planning Level III':'#00FFFF',
        'Planning Signage Plan':'#000080'
    },
    'streetmaintenance' : {
      'CITY OF ASHEVILLE' : {'color' : '#FF0000'},
      'PRIVATE' : {'color' : '#FFF000'},
      'UNKNOWN' : {'color' : '#FFA500'},
      'NCDOT' : {'color' : '#00FF00'},
      'NATIONAL PARK SERVICE' : {'color' : '#000080'}
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
  .constant('DESCRIPTIONS', {
      'crime' : {
        'Aggravated Assault' : 'The unlawful attack by one person upon another for the purpose of inflicting severe bodily harm.',
        'Burglary' : 'The unlawful entry of a structure to commit a felony or theft.',
        'Drug Arrest' : 'State and/or local offenses relating to the unlawful possession, sale, use, growing, manufacturing, and making of narcotic drugs including opium or cocaine and their derivatives, marijuana, synthetic narcotics, and dangerous nonnarcotic drugs such as barbiturates.',
        'Homicide' : 'The willful (nonnegligent) killing of one human being by another.',
        'Larceny' : 'The unlawful taking or stealing of property without the use of force, violence, or fraud.',
        'Larceny of Motor Vehicle' : 'The unlawful taking or stealing of a motor vehicle, including attempts.',
        'Rape' : 'Penetration or oral penetration, no matter how slight, without the consent of the victim',
        'Robbery' : 'The taking or attempting to take anything of value by force or threat.',
        'Vandalism' : 'The malicious destruction, injury, disfigurement or defacement of real or personal property.'
      },
      'development' : {
        'Conditional Use Permit':'All Level III projects or use is determined to require a conditional use permit by the zoning district where it is located.',
        'Conditional Zoning Permit':'Changing the zoning of a property for a specific site plan and specific use.',
        'Planning Level I':'Commercial construction less than 35,000 square feet or less than 20 multi-family units; Level I permits are reviewed at the city staff level.',
        'Planning Level II':'Commercial construction 35,000-100,000 square feet or 20-50 multi-family units; Level II projects are reviewed by city staff, the Technical Review Committee (TRC), and the Planning and Zoning Commission.',
        'Planning Level III':'Commercial construction larger than 100,000 square feet or more than 50 multi-family units; Level III projects are reviewed by city staff, the Technical Review Committee (TRC), the Planning and Zoning Commission and Asheville City Council.',
        'Planning Signage Plan':''
      }
    })
  .constant('STREET_MAINTENANCE_CONTACTS', {
      'NCDOT' : 'https://apps.dot.state.nc.us/contactus/PostComment.aspx?Unit=PIO',
      'CITY OF ASHEVILLE' : 'http://www.ashevillenc.gov/Departments/StreetServices/StreetMaintenance.aspx',
      'PRIVATE' : null,
      'UNKNOWN' : null,
      'NATIONAL PARK SERVICE' : 'http://www.nps.gov/blri/contacts.htm'
    })
  .constant('STREET_MAINTENANCE_CITIZEN_SERVICE_REQUESTS', {
      'NCDOT' : {'report' : false, 'brand' : null},
      'CITY OF ASHEVILLE' : {'report' : true, 'brand' : "The Asheville App"},
      'PRIVATE' : {'report' : false, 'brand' : null},
      'UNKNOWN' : {'report' : false, 'brand' : null},
      'NATIONAL PARK SERVICE' : {'report' : false, 'brand' : null}
    })
  //These are the correct zoning code links for asheville, the ones in the database are wrong
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
  .constant('EXEMPTION_TYPES', {
      'EX1':	'CONT. CARE RET CTR',                     
      'BLD':	'BUILDERS INVENTORY EXEMPTION',
      'EX2':	'POLLUTION ABATEMENT',      
      'EX3':	'DAV/VETERANS/LODGES',      
      'EX4':	'MEDICAL CARE BONDS',       
      'EX5':	'OTHER EXCLUSIONS',         
      'EXA':	'HOMES FOR AGED,SICK',      
      'EXC':	'CHARITABLE',               
      'EXE':	'NON GOV. EDUCATION',       
      'EXH':	'CHARITABLE HOSPITAL',      
      'EXL':	'LOW INCOME HOUSING',       
      'EXM':	'EXEMPT/GOVERNMENT',        
      'EXO':	'OTHER EXEMPTIONS',         
      'EXP':	'PROTECT NATURAL AREA',     
      'EXR':	'RELIGIOUS EDUCATION',      
      'EXS':	'SCIEN/LIT/CULTURAL',       
      'HIS':	'HISTORICAL',
      'RXM':	'EXEMPT/RELIGIOUS USE',     
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



 
  


