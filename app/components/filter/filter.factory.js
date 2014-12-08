app.factory('Filter', [function(){

    //****Create the factory object****//
    var Filter = {};

    //****Private variables*****//
    
    //Should get these for the properties of the if it has a property it is filterable
    var propertyFilterOptions = [
      {'value' : 'summary', 'label' : 'Property Summary'}
    ];

    var crimeFilterOptions = [
      {'value' : 'summary', 'label' : 'Crime Summary'}
    ];

    var developmentFilterOptions = [
      {'value' : 'summary', 'label' : 'Development Summary'}
    ];

    var sanitationFilterOptions = [
      {'value' : 'summary', 'label' : 'Sanitation Summary'}
    ];

    var filterOptions = {
      'crime' : crimeFilterOptions,
      'property' : propertyFilterOptions,
      'development' : developmentFilterOptions,
      'sanitation' : sanitationFilterOptions
    };

    // Filter.updateOptions = function(newFilterOptions, categeory){

    //     filterOptions[categeory] = newFilterOptions;
    // };
    

    //****API*****//

    Filter.options = function(categeory, newFilterOptions){
      if(newFilterOptions){
        return filterOptions[categeory] = newFilterOptions;
      }
      return filterOptions[categeory];
    };
    


    //****Return the factory object****//
    return Filter; 

    
}]); //END Filter factory function