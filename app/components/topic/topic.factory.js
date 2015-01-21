app.factory('Topic', ['$stateParams', function($stateParams){

    //****Create the factory object****//
    var Topic = {};

    //****Private variables*****//




    //Options for the topic's select elements
    //The labels are displayed as the select element options
    //The values are the values of the select element options
    //The values should match any url params
    var options = {
      'extent' : [
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
    };

    //We need a date to filter the timeframe, so get today's date
    var d = new Date();

    //filterValues are the actual values used to filter the topic
    //filterValues are numberic form of the text values from options
    var filterValues = {
      'extent' : {
        'within-about-a-block' : 330,
        'within-an-eighth-of-a-mile' : 660,
        'within-a-quarter-mile' : 1320,
      },
      'timeframe' : {
        'last-30-days' : d.setMonth(d.getMonth() - 1),
        'last-6-months' : d.setMonth(d.getMonth() - 6),
        'last-year' : d.setFullYear(d.getFullYear()-1),
        'last-5-years': d.setFullYear(d.getFullYear()-5),
        'last-10-years': d.setFullYear(d.getFullYear()-10),
        'all-time' : d.setFullYear(d.getFullYear()-100)
      }
    };

    //****API*****//

    

    Topic.options = function(param){
      return options[param];
    };

    Topic.getFilterValueFromOption = function(param, option){
      return filterValues[param][option];
    };


    //****Return the factory object****//
    return Topic; 

    
}]); //END Topic factory function