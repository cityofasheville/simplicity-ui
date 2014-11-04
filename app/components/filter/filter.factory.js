app.factory('Filter', [function(){

    //****Create the factory object****//
    var Filter = {};

    //****Private variables*****//
    
    //Should get these for the properties of the if it has a property it is filterable
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

    var developmentFilterOptions = [
      {'value' : 'summary', 'label' : 'Development Summary'},
    ];

    var filterOptions = {
      'crime' : crimeFilterOptions,
      'property' : propertyFilterOptions,
      'development' : developmentFilterOptions
    };

    Filter.updateOptions = function(newFilterOptions, categeory){
        filterOptions[categeory] = newFilterOptions;
    };
    


    //****API*****//
    Filter.options = function(categeory){
      return filterOptions[categeory];
    };
    


    //****Return the factory object****//
    return Filter; 

    
}]); //END Filter factory function