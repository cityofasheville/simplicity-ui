app.factory('Time', [function(){

    //****Create the factory object****//
    var Time = {};

    //****Private variables*****//
    var timeOptions = [
      {'value' : 'last-6-months', 'label' : 'During the last 6 months'},
      {'value' : 'last-year', 'label' : 'During the last year'},
      {'value' : '2014', 'label' : 'During the year 2014'},
      {'value' : '2013', 'label' : 'During the year 2013'},
      {'value' : '2012', 'label' : 'During the year 2012'}
    ];
  

    //****API*****//
    Time.options = function(newTimeOptions){
      if(newTimeOptions !== undefined){
        timeOptions = newTimeOptions;
      }else{
        return timeOptions;
      }
    };
  

    //****Return the factory object****//
    return Time; 

    
}]); //END Time factory function