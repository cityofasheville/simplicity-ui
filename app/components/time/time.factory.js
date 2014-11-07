app.factory('Time', ['$stateParams', function($stateParams){

    //****Create the factory object****//
    var Time = {};

    var d = new Date();


    var timeFilterValues = {
      'last-30-days' : d.setMonth(d.getMonth() - 1),
      'last-6-months' : d.setMonth(d.getMonth() - 6),
      'last-year' : d.setFullYear(d.getFullYear()-1),
      'last-5-years': d.setFullYear(d.getFullYear()-5),
      'last-10-years': d.setFullYear(d.getFullYear()-10),
      'all-time' : d.setFullYear(d.getFullYear()-100)
    }

    //****Private variables*****//
    var timeOptions = [
      {'value' : 'last-30-days', 'label' : 'during the last 30 days'},
      {'value' : 'last-6-months', 'label' : 'during the last 6 months'},
      {'value' : 'last-year', 'label' : 'during the last year'},
      {'value' : 'last-5-years', 'label' : 'during the last 5 years'},
      {'value' : 'last-10-years', 'label' : 'during the last 10 years'},
      {'value' : 'all-time', 'label' : 'all time'}
    ];
  

    //****API*****//
    Time.options = function(newTimeOptions){
      if(newTimeOptions !== undefined){
        timeOptions = newTimeOptions;
      }else{
        return timeOptions;
      }
    };

    Time.filterValue = function(){
      return timeFilterValues[$stateParams.time];
    };
  

    //****Return the factory object****//
    return Time; 

    
}]); //END Time factory function