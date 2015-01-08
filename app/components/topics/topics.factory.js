app.factory('Topics', ['$stateParams', function($stateParams){

    //****Create the factory object****//
    var Topics = {};

    //****Private variables*****//

    var topicsArray = [
        //                                  _         
        //  _ __  _ __ ___  _ __   ___ _ __| |_ _   _ 
        // | '_ \| '__/ _ \| '_ \ / _ \ '__| __| | | |
        // | |_) | | | (_) | |_) |  __/ |  | |_| |_| |
        // | .__/|_|  \___/| .__/ \___|_|   \__|\__, |
        // |_|             |_|                  |___/ 
         {
            'name' : 'property',
            'title' : 'Property',
            'position' : 1,
            'searchby' : {
                'address' : {
                    'requiredParams' : [],
                    'headerTemplate' : 'topic/headers/topic.header.at.html',
                }
            },
            'viewTemplate' : 'topic/cards/property.card.html',
            'views' : ['details', 'map'],
            'image' : '/images/property.png'
        },
        //            _                     
        //   ___ _ __(_)_ __ ___   ___  ___ 
        //  / __| '__| | '_ ` _ \ / _ \/ __|
        // | (__| |  | | | | | | |  __/\__ \
        //  \___|_|  |_|_| |_| |_|\___||___/                     
        {
            'name' : 'crimes',
            'title' : 'Crimes',
            'position' : 2,
            'searchby' : {
                'address' : {
                    'requiredParams' : ['timeframe', 'extent'],
                    'headerTemplate' : 'topic/headers/topic.header.during.within.of.html',
                },
                'street' : {
                    'requiredParams' : ['timeframe'],
                    'headerTemplate' : 'topic/headers/topic.header.during.along.html',
                },
                'neighborhood' : {
                    'requiredParams' : ['timeframe'],
                    'headerTemplate' : 'topic/headers/topic.header.during.in.html',
                }
            },
            'viewTemplate' : 'topic/cards/crime.card.html',
            'views' : ['table', 'list', 'map'],
            'defaultView' : 'table',
            'image' : '/images/crimes.png'
        },
        //      _                _                                  _   
        //   __| | _____   _____| | ___  _ __  _ __ ___   ___ _ __ | |_ 
        //  / _` |/ _ \ \ / / _ \ |/ _ \| '_ \| '_ ` _ \ / _ \ '_ \| __|
        // | (_| |  __/\ V /  __/ | (_) | |_) | | | | | |  __/ | | | |_ 
        //  \__,_|\___| \_/ \___|_|\___/| .__/|_| |_| |_|\___|_| |_|\__|
        //                              |_|                             
        {
            'name' : 'development',
            'title' : 'Development',
            'position' : 3, 
            'searchby' : {
                'address' : {
                    'requiredParams' : ['timeframe', 'extent'],
                    'headerTemplate' : 'topic/headers/topic.header.during.within.of.html',
                },
                'street' : {
                    'requiredParams' : ['timeframe'],
                    'headerTemplate' : 'topic/headers/topic.header.during.along.html',
                },
                'neighborhood' : {
                    'requiredParams' : ['timeframe'],
                    'headerTemplate' : 'topic/headers/topic.header.during.in.html',
                }
            },
            'viewTemplate' : 'topic/cards/property.card.html',
            'views' : ['table', 'list', 'map'],
            'image' : '/images/development.png'
        },
        //  _                 _     
        // | |_ _ __ __ _ ___| |__  
        // | __| '__/ _` / __| '_ \ 
        // | |_| | | (_| \__ \ | | |
        //  \__|_|  \__,_|___/_| |_|
        {
            'name' : 'trash',
            'title' : 'Trash Collection',
            'position' : 4,
            'searchby' : {
                'address' : {
                    'requiredParams' : [],
                    'headerTemplate' : 'topic/headers/topic.header.at.html',
                }
            },
            'viewTemplate' : 'topic/cards/trash-collection.card.html',
            'views' : ['details'],
            'image' : '/images/trash.png'
        },
        //                           _ _             
        //  _ __ ___  ___ _   _  ___| (_)_ __   __ _ 
        // | '__/ _ \/ __| | | |/ __| | | '_ \ / _` |
        // | | |  __/ (__| |_| | (__| | | | | | (_| |
        // |_|  \___|\___|\__, |\___|_|_|_| |_|\__, |
        //                |___/                |___/ 
        {
            'name' : 'recycling',
            'title' : 'Recycling Collection',
            'position' : 5,
            'searchby' : {
                'address' : {
                    'requiredParams' : [],
                    'headerTemplate' : 'topic/headers/topic.header.at.html',
                }
            },
            'viewTemplate' : 'topic/cards/recylcing-collection.card.html',
            'views' : ['details'],
            'defaultView' : 'card',
            'image' : '/images/recycling.png'
        },
        //                 _             
        //  _______  _ __ (_)_ __   __ _ 
        // |_  / _ \| '_ \| | '_ \ / _` |
        //  / / (_) | | | | | | | | (_| |
        // /___\___/|_| |_|_|_| |_|\__, |
        //                         |___/ 
        {
            'name' : 'zoning',
            'title' : 'Zoning',
            'position' : 6,
            'searchby' : {
                'address' : {
                    'requiredParams' : [],
                    'headerTemplate' : 'topic/headers/topic.header.at.html',
                }
            },
            'viewTemplate' : 'topic/cards/zoning.card.html',
            'views' : ['details'],
            'image' : '/images/zoning.png'
        },
        //      _                 _                     _       _                                 
        //  ___| |_ _ __ ___  ___| |_   _ __ ___   __ _(_)_ __ | |_ ___ _ __   ___ _ __   ___ ___ 
        // / __| __| '__/ _ \/ _ \ __| | '_ ` _ \ / _` | | '_ \| __/ _ \ '_ \ / _ \ '_ \ / __/ _ \
        // \__ \ |_| | |  __/  __/ |_  | | | | | | (_| | | | | | ||  __/ | | |  __/ | | | (_|  __/
        // |___/\__|_|  \___|\___|\__| |_| |_| |_|\__,_|_|_| |_|\__\___|_| |_|\___|_| |_|\___\___|                                                                           
        {
            'name' : 'street-maintenance',
            'title' : 'Street Mainenance',
            'position' : 7,
            'searchby' : {
                'address' : {
                    'requiredParams' : [],
                    'headerTemplate' : 'topic/headers/topic.header.during.within.of.html',
                },
                'street' : {
                    'requiredParams' : [],
                    'headerTemplate' : 'topic/headers/topic.header.during.along.html',
                }
            },
            'viewTemplate' : 'topic/cards/street-maintenance.card.html',
            'views' : ['details', 'map'],
            'image' : '/images/street-maintenance.png'
        },
        //            _     _                     _ _     _       
        //   __ _  __| | __| |_ __ ___  ___ ___  | (_)___| |_ ___ 
        //  / _` |/ _` |/ _` | '__/ _ \/ __/ __| | | / __| __/ __|
        // | (_| | (_| | (_| | | |  __/\__ \__ \ | | \__ \ |_\__ \
        //  \__,_|\__,_|\__,_|_|  \___||___/___/ |_|_|___/\__|___/                                                   
        {
            'name' : 'address-lists',
            'title' : 'Address Lists',
            'position' : 8,
            'searchby' : {
                'street' : {
                    'requiredParams' : [],
                    'headerTemplate' : 'topic/headers/topic.header.during.along.html',
                },
                'neighborhood' : {
                    'requiredParams' : [],
                    'headerTemplate' : 'topic/headers/topic.header.during.in.html',
                }
            },
            'viewTemplate' : 'topic/cards/address-lists.card.html',
            'views' : ['details', 'map'],
            'defaultView' : 'card',
            'image' : '/images/address.png'
        }
    ];

    var questions = {
        'property' : {
            'topic' : 'Do you want to know about a property?',
            'address' : 'Do you want to know about the property at this address?'
        },
        'crimes' : {
            'topic' : 'Do you want to know about crime?',
            'address' : 'Do you want to know about crimes near this address?',
            'street' : 'Do you want to know about crimes along this street?',
            'neighborhood' : 'Do you want to know about crimes in this neighborhood?'
        },
        'development' : {
            'topic' : 'Do you want to know about development?',
            'address' : 'Do you want to know about development near this address?',
            'street' : 'Do you want to know about development along this street?',
            'neighborhood' : 'Do you want to know about development in this neighborhood?'
        },
        'trash' : {
            'topic' : 'Do you want to know when trash is collected?',
            'address' : 'Do you want to know when trash is collected at this address?'
        },
        'recycling' : {
            'topic' : 'Do you want to know when recycling is collected?',
            'address' : 'Do you want to know when recycling is collected at this address?'
        },
        'zoning' : {
            'topic' :  'Do you want to know about a zoning?', 
            'address' :  'Do you want to know about the zoning at this address?'
        },
        'street-maintenance' : {
            'topic' :  'Do you want to know who is responsible for maintaining a street?',
            'address' :  'Do you want to know who is responsible for maintaining a street this address?',
            'street' : 'Do you want to know who is responsible for maintaining this street?'
        },
        'address-lists' : {
            'topic' :  'Do you want a list of addresses?',
            'street' : 'Do you want a list of addresses along this street?',
            'neighborhood' :  'Do you want a list of addresses in this neighborhood?'
        }
    };



    //****API*****//

    Topics.getTopics = function(stateParams){
        if(stateParams.id === null){
            var topicsToShowBeforeAnIdHasBeenSet = [];
            for (var i = 0; i < topicsArray.length; i++) {
                topicsToShowBeforeAnIdHasBeenSet.push(topicsArray[i]);
                console.log(topicsArray[i].name);
                topicsToShowBeforeAnIdHasBeenSet[i].question = questions[topicsArray[i].name]['topic'];
                topicsToShowBeforeAnIdHasBeenSet[i].linkTo = '#/search/' + topicsArray[i].name;
            };
            return topicsToShowBeforeAnIdHasBeenSet;
        }else{
            if(stateParams.searchby !== null){
                var topicsToShowAfterAnIdHasBeenSet = [];
                for (var i = 0; i < topicsArray.length; i++) {
                    console.log(topicsArray[i].name);
                    if(topicsArray[i].searchby[stateParams.searchby]){
                        var topicArray = topicsArray[i];
                        topicArray.question = questions[topicArray.name][stateParams.searchby];
                        topicArray.linkTo = '#/topics/' + topicArray.name + '?searchby=' + $stateParams.searchby + '&id=' + $stateParams.id;
                        topicsToShowAfterAnIdHasBeenSet.push(topicArray);
                        topicArray = [];
                    }   
                }; 
                return topicsToShowAfterAnIdHasBeenSet;
            }else{
                //!!! Go back to search
            }
            
        }
    };

    Topics.topicProperties = function(topic){
        for (var i = 0; i < topicsArray.length; i++) {
            if(topicsArray[i].name === topic){
                return topicsArray[i]
            }
        };
    };


    //****Return the factory object****//
    return Topics; 

    
}]); //END Topics factory function