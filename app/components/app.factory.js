
app.factory('AppFact', ['$http', '$location', '$q', '$filter',
  function($http, $location, $q, $filter){

    var AppFact = {}; 

    //****Private Variables*****//

    var locationProperties = 'fresh';
    
    var getLocationPropertiesFromServer = function(locationName){
      var q = $q.defer();
      //***TODO: Make HTTP request to get location properties using locationName***//
      //for now just return some dummy data
      var dummyLocationProperties = {
        locationName : '123456',//CAI or neighborhood name
        locationType : 'cai',//or neighborhood or other? could generate this client side
        inTheCity : true,
        address : '25 Howland Rd',
        city : 'Asheville',
        state : 'NC',
        zip : 28804
      };
      locationProperties = dummyLocationProperties;
      q.resolve(dummyLocationProperties);
      return q.promise;
    };

    var locationQuestions = [];

    var caiQuestions = [
      {'question' : 'Do you want to know about crime?', 'category' : 'crime', 'detail' : 'within-quarter-mile'},
      {'question' : 'Do you want to know about this property?', 'category' : 'property', 'detail' : 'summary'},
      {'question' : 'Do you want to know about development?', 'category' : 'development', 'detail' : 'summary'},
      {'question' : 'Do you want to know about the owner?', 'category' : 'property', 'detail' : 'owner'},
      {'question' : 'Do you want to know about the zoning?', 'category' : 'property', 'detail' : 'zoning'},
      {'question' : 'Do you want to know about the trash collection?', 'category' : 'property', 'detail' : 'trash'},
    ];

    var neighborhoodQuestions = [
      {'question' : 'Do you want to know about crime?', 'category' : 'crime', 'detail' : 'quarter-mile'},
      {'question' : 'Do you want to know about development?', 'category' : 'development', 'detail' : 'summary'},
    ];

    var caiCrimeDefinition = {
      title : 'Crime',
      category : 'crime',
      time : '2014',
      extent : 'within-a-quarter-mile',
      filter : 'summary',
      details : 'report'
    };

    var neighborhoodCrimeDefinition = {
      showTimeOptions : true,
      defaultTimeOption : 2,
      showExtentOptions : false,
      defaultExtentOption : 'neighborhood',
      showFilterOptions : false,
      defaultFilterOption : 'summary'
    };

    var propertyDefinition = {
      showTimeOptions : false,
      defaultTimeOption : 'current',
      showExtentOptions : false,
      defaultExtentOption : 'location',
      showFilterOptions : false,
      defaultFilterOption : 'summary'
    };

    var categoryDefinitions = {
      cai : {
        crime : caiCrimeDefinition,
        property : propertyDefinition
      },
      neighborhood : {
        crime : neighborhoodCrimeDefinition
      }
    };

    var timeOptions = [
      {'value' : 'last-6-months', 'label' : 'During the last 6 months'},
      {'value' : 'last-year', 'label' : 'During the last year'},
      {'value' : '2014', 'label' : 'During the year 2014'},
      {'value' : '2013', 'label' : 'During the year 2013'},
      {'value' : '2012', 'label' : 'During the year 2012'}
    ];

    var extentOptions = [
      {'value' : 'within-a-quarter-mile', 'label' : 'Within a quarter mile'},
      {'value' : 'within-a-half-mile', 'label' : 'Within a half mile'},
      {'value' : 'within-a-mile', 'label' : 'Within a mile'},
      {'value' : 'within-5-miles', 'label' : 'Within 5 miles'}
    ];

    var propertyFilterOptions = [
      {'value' : 'summary', 'label' : 'Property Summary'},
      {'value' : 'zoning', 'label' : 'Zoning'},
      {'value' : 'owner', 'label' : 'Owner'},
      {'value' : 'deed', 'label' : 'Deed'},
      {'value' : 'garbage', 'label' : 'Garbage Collection'},
      {'value' : 'recycling', 'label' : 'Recycling'},
      {'value' : 'leaf', 'label' : 'Leaf & Brush Collection'}
    ];

    var crimeFilterOptions = [
      {'value' : 'summary', 'label' : 'Crime Summary'},
      {'value' : 'aggravated-assault', 'label' : 'Aggravated Assaults'},
      {'value' : 'rape', 'label' : 'Rapes'},
      {'value' : 'vandalism', 'label' : 'Vandalism'},
      {'value' : 'larceny', 'label' : 'Larcenies'},
      {'value' : 'larceny-auto', 'label' : 'Larcenies (Auto)'},
    ];


    //****API*****//
    AppFact.locationProperties = function(newLocationName){
      var q = $q.defer();
      if(locationProperties === 'fresh' || locationProperties.locationName !== newLocationName){
        getLocationPropertiesFromServer(newLocationName)
          .then(function(locationProperties){
            q.resolve(locationProperties);
          });
      }else{
        q.resolve(locationProperties);
      }
      return q.promise;
    };

    AppFact.questions = function(){
      if(locationProperties.locationType === 'cai'){
        return caiQuestions;
      }else{
        return neighborhoodQuestions;
      }
    };

    AppFact.categoryDefinition = function(category){
      //if cai do something if neighborhood do something else
      if(locationProperties.locationType === 'cai'){
        return categoryDefinitions.cai[category];
      }else{
        return categoryDefinitions.neighborhood[category];
      } 
    };

    AppFact.timeOptions = function(newTimeOptions){
      if(newTimeOptions !== undefined){
        timeOptions = newTimeOptions;
      }else{
        return timeOptions;
      }
    };

    AppFact.extentOptions = function(newExtentOptions){
      if(newExtentOptions !== undefined){
        extentOptions = newExtentOptions;
      }else{
        return extentOptions;
      }
    };

    AppFact.propertyFilterOptions = function(newPropertyFilterOptions){
      if(newPropertyFilterOptions !== undefined){
        propertyFilterOptions = newPropertyFilterOptions;
      }else{
        return propertyFilterOptions;
      }
    };

    AppFact.filterOptions = function(newCrimeFilterOptions){
      if(newCrimeFilterOptions !== undefined){
        crimeFilterOptions = newCrimeFilterOptions;
      }else{
        return crimeFilterOptions;
      }
    };


    //****Return the factory object****//
    return AppFact; 

}]); //END AppFact factory function