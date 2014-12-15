
app.factory('Category', ['$http', '$location', '$q', '$filter',
  function($http, $location, $q, $filter){

    //****Create the factory object****//
    var Category = {};

    
    //****Private variables*****//
    var caiCrimeDefinition = {
      title : 'Crime',
      defaultStates : {
        'category' : 'crime',
        'time' : 'last-year',
        'extent' : 'within-an-eighth-of-a-mile',
        'filter' : 'summary',
        'details' : 'report'
      }
    };

    var propertyDefinition = {
      title : 'Property',
      defaultStates : {
        'category' : 'property',
        'time' : 'current',
        'extent' : 'location',
        'filter' : 'summary',
        'details' : 'report'
      }
    };

    var propertiesDefinition = {
      title : 'Properties',
      defaultStates : {
        'category' : 'properties',
        'time' : 'current',
        'extent' : 'within-an-eighth-of-a-mile',
        'filter' : 'summary',
        'details' : 'report'
      }
    };

    var sanitationDefinition = {
      title : 'Sanitation',
      defaultStates : {
        'category' : 'sanitation',
        'time' : 'current',
        'extent' : 'location',
        'filter' : 'summary',
        'details' : 'report'
      }
    };

    var developmentDefinition = {
      title : 'Development',
      defaultStates : {
        'category' : 'development',
        'time' : 'last-year',
        'extent' : 'within-an-eighth-of-a-mile',
        'filter' : 'summary',
        'details' : 'report'
      }
    };

    var permitsDefinition = {
      title : 'Permits',
      defaultStates : {
        'category' : 'permits',
        'time' : 'last-year',
        'extent' : 'location',
        'filter' : 'summary',
        'details' : 'report'
      }
    };

    var neighborhoodCrimeDefinition = {
      'showTimeOptions' : true,
      'defaultTimeOption' : 2,
      'showExtentOptions' : false,
      'defaultExtentOption' : 'neighborhood',
      'showFilterOptions' : false,
      'defaultFilterOption' : 'summary'
    };



    var categoryDefinitions = {
      'cai' : {
        'crime' : caiCrimeDefinition,
        'property' : propertyDefinition,
        'development' : developmentDefinition,
        'permits' : permitsDefinition,
        'sanitation' : sanitationDefinition,
        'properties' : propertiesDefinition
      },
      'neighborhood' : {
        'crime' : neighborhoodCrimeDefinition
      }
    };

    //****API*****//

    Category.getDefinition = function(category){
      //for now we only have addresses
      return categoryDefinitions.cai[category];
      //******TODO******//
      //if cai do something if neighborhood do something else
      // if(IdProperties.locationType === 'cai'){
      //   return categoryDefinitions.cai[category];
      // }else{
      //   return categoryDefinitions.neighborhood[category];
      // } 
    };


    //****Return the factory object****//
    return Category; 

    
}]); //END Category factory function