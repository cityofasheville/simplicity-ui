app.factory('Topics', ['$stateParams', function($stateParams){

    //****Create the factory object****//
    var Topics = {};

    //****Private variables*****//
    var d = new Date();

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
                    'params' : {
                        'type' : null,
                        'timeframe' : null,
                        'extent' : null,
                        'view' : 'details'
                    },
                    'headerTemplate' : 'topic/topic-headers/topic.header.at.html',
                },
                'pinnum' : {
                    'params' : {
                        'type' : null,
                        'timeframe' : null,
                        'extent' : null,
                        'view' : 'details'
                    },
                    'headerTemplate' : 'topic/topic-headers/topic.header.at.html',
                },
                'owner_name' : {
                    'params' : {
                        'type' : null,
                        'timeframe' : null,
                        'extent' : null,
                        'view' : 'details'
                    },
                    'headerTemplate' : 'topic/topic-headers/topic.header.ownedby.html',
                }
            },
            'simpleViewTemplate' : null,
            'detailsViewTemplate' : 'topic/topic-views/property.view.html',
            'tableViewTemplate' : null,
            'listViewTemplate' : null,
            'defaultView' : 'details',
            'iconClass' : 'flaticon-real10',
            'linkTopics' : ['crime', 'trash', 'recycling']
        },
        //            _                     
        //   ___ _ __(_)_ __ ___   ___ 
        //  / __| '__| | '_ ` _ \ / _ \
        // | (__| |  | | | | | | |  __/
        //  \___|_|  |_|_| |_| |_|\___|                  
        {
            'name' : 'crime',
            'title' : 'Crime',
            'position' : 2,
            'searchby' : {
                'address' : {
                    'params' : {
                        'type' : null,
                        'timeframe' : 'last-year',
                        'extent' : 660,
                        'view' : 'table'
                    },
                    'requiredParams' : ['timeframe', 'extent'],
                    'headerTemplate' : 'topic/topic-headers/topic.header.during.within.of.html',
                },
                'street_name' : {
                    'params' : {
                        'type' : null,
                        'timeframe' : 'last-year',
                        'extent' : 82.5,
                        'view' : 'table'
                    },
                    'requiredParams' : ['timeframe'],
                    'headerTemplate' : 'topic/topic-headers/topic.header.during.along.html',
                },
                'neighborhood' : {
                    'params' : {
                        'type' : null,
                        'timeframe' : 'last-year',
                        'extent' : null,
                        'view' : 'table'
                    },
                    'requiredParams' : ['timeframe'],
                    'headerTemplate' : 'topic/topic-headers/topic.header.during.in.html',
                }
            },
            'simpleViewTemplate' : null,
            'detailsViewTemplate' : null,
            'tableViewTemplate' : 'topic/topic-views/table.view.html',
            'listViewTemplate' : 'topic/topic-views/crime.view.html',
            'defaultView' : 'table',
            'iconClass' : 'flaticon-police19',
            'linkTopics' : ['property', 'trash', 'recycling', 'development']
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
                    'params' : {
                        'type' : null,
                        'timeframe' : 'last-year',
                        'extent' : 660,
                        'view' : 'table'
                    },
                    'requiredParams' : ['timeframe', 'extent'],
                    'headerTemplate' : 'topic/topic-headers/topic.header.during.within.of.html',
                },
                'street_name' : {
                    'params' : {
                        'type' : null,
                        'timeframe' : 'last-year',
                        'extent' : 82.5,
                        'view' : 'table'
                    },
                    'requiredParams' : ['timeframe'],
                    'headerTemplate' : 'topic/topic-headers/topic.header.during.along.html',
                },
                'neighborhood' : {
                    'params' : {
                        'type' : null,
                        'timeframe' : 'last-year',
                        'extent' : null,
                        'view' : 'table'
                    },
                    'requiredParams' : ['timeframe'],
                    'headerTemplate' : 'topic/topic-headers/topic.header.during.in.html',
                }
            },
            'simpleViewTemplate' : null,
            'detailsViewTemplate' : null,
            'tableViewTemplate' : 'topic/topic-views/table.view.html',
            'listViewTemplate' : 'topic/topic-views/development.view.html',
            'defaultView' : 'table',
            'iconClass' : 'flaticon-building33',
            'linkTopics' : ['property', 'trash', 'recycling', 'crime']
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
                    'params' : {
                        'type' : null,
                        'timeframe' : null,
                        'extent' : null,
                        'view' : 'simple'
                    },
                    'requiredParams' : [],
                    'headerTemplate' : 'topic/topic-headers/topic.header.at.html',
                }
            },
            'simpleViewTemplate' : 'topic/topic-views/trash-collection.view.html',
            'detailsViewTemplate' : null,
            'tableViewTemplate' : null,
            'listViewTemplate' : null,
            'defaultView' : 'simple',
            'iconClass' : 'flaticon-garbage5',
            'linkTopics' : ['recycling', 'property']
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
                    'params' : {
                        'type' : null,
                        'timeframe' : null,
                        'extent' : null,
                        'view' : 'simple'
                    },
                    'requiredParams' : [],
                    'headerTemplate' : 'topic/topic-headers/topic.header.at.html',
                }
            },
            'simpleViewTemplate' : 'topic/topic-views/recycling-collection.view.html',
            'detailsViewTemplate' : null,
            'tableViewTemplate' : null,
            'listViewTemplate' : null,
            'defaultView' : 'simple',
            'iconClass' : 'flaticon-trash42',
            'linkTopics' : ['trash', 'property']
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
                    'params' : {
                        'type' : null,
                        'timeframe' : null,
                        'extent' : null,
                        'view' : 'details'
                    },
                    'requiredParams' : [],
                    'headerTemplate' : 'topic/topic-headers/topic.header.at.html',
                }
            },
            'simpleViewTemplate' : null,
            'detailsViewTemplate' : 'topic/topic-views/zoning.view.html',
            'tableViewTemplate' : null,
            'listViewTemplate' : null,
            'defaultView' : 'details',
            'iconClass' : 'flaticon-map104',
            'linkTopics' : ['property', 'crime', 'development']
        }
        //      _                 _                     _       _                                 
        //  ___| |_ _ __ ___  ___| |_   _ __ ___   __ _(_)_ __ | |_ ___ _ __   ___ _ __   ___ ___ 
        // / __| __| '__/ _ \/ _ \ __| | '_ ` _ \ / _` | | '_ \| __/ _ \ '_ \ / _ \ '_ \ / __/ _ \
        // \__ \ |_| | |  __/  __/ |_  | | | | | | (_| | | | | | ||  __/ | | |  __/ | | | (_|  __/
        // |___/\__|_|  \___|\___|\__| |_| |_| |_|\__,_|_|_| |_|\__\___|_| |_|\___|_| |_|\___\___|                                                                           
        // {
        //     'name' : 'street-maintenance',
        //     'title' : 'Street Mainenance',
        //     'position' : 7,
        //     'searchby' : {
        //         'address' : {
        //             'params' : {},
        //             'requiredParams' : [],
        //             'headerTemplate' : 'topic/topic-headers/topic.header.during.within.of.html',
        //         },
        //         'street_name' : {
        //             'params' : {},
        //             'requiredParams' : [],
        //             'headerTemplate' : 'topic/topic-headers/topic.header.during.along.html',
        //         }
        //     },
        //     'viewTemplate' : 'topic/cards/street-maintenance.card.html',
        //     'views' : ['details', 'map'],
        //     'iconClass' : 'flaticon-location38'
        // },
        //            _     _                     _ _     _       
        //   __ _  __| | __| |_ __ ___  ___ ___  | (_)___| |_ ___ 
        //  / _` |/ _` |/ _` | '__/ _ \/ __/ __| | | / __| __/ __|
        // | (_| | (_| | (_| | | |  __/\__ \__ \ | | \__ \ |_\__ \
        //  \__,_|\__,_|\__,_|_|  \___||___/___/ |_|_|___/\__|___/                                                   
        // {
        //     'name' : 'address-lists',
        //     'title' : 'Address Lists',
        //     'position' : 8,
        //     'searchby' : {
        //         'street_name' : {
        //             'params' : {},
        //             'requiredParams' : [],
        //             'headerTemplate' : 'topic/topic-headers/topic.header.during.along.html',
        //         },
        //         'neighborhood' : {
        //             'params' : {},
        //             'requiredParams' : [],
        //             'headerTemplate' : 'topic/topic-headers/topic.header.during.in.html',
        //         }
        //     },
        //     'viewTemplate' : 'topic/cards/address-lists.card.html',
        //     'views' : ['details', 'map'],
        //     'defaultView' : 'card',
        //     'iconClass' : 'flaticon-address7'
        // }
    ];

    var questions = {
        'property' : {
            'topic' : 'Do you want to know about a property?',
            'address' : 'Do you want to know about the property at this address?',
            'pinnum' : 'Do you want to know about the property for this PIN?',
            'owner_name' : 'Do you want to know about the properties owned by this owner?'
        },
        'crime' : {
            'topic' : 'Do you want to know about crime?',
            'address' : 'Do you want to know about crimes near this address?',
            'street_name' : 'Do you want to know about crimes along this street?',
            'neighborhood' : 'Do you want to know about crimes in this neighborhood?'
        },
        'development' : {
            'topic' : 'Do you want to know about development?',
            'address' : 'Do you want to know about development near this address?',
            'street_name' : 'Do you want to know about development along this street?',
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
        }
        // 'street-maintenance' : {
        //     'topic' :  'Do you want to know who is responsible for maintaining a street?',
        //     'address' :  'Do you want to know who is responsible for maintaining a street this address?',
        //     'street_name' : 'Do you want to know who is responsible for maintaining this street?'
        // },
        // 'address-lists' : {
        //     'topic' :  'Do you want a list of addresses?',
        //     'street_name' : 'Do you want a list of addresses along this street?',
        //     'neighborhood' :  'Do you want a list of addresses in this neighborhood?'
        // }
    };



    //****API*****//

    Topics.getTopics = function(){
        if($stateParams.id === null){
            var topicsToShowBeforeAnIdHasBeenSet = [];
            for (var i = 0; i < topicsArray.length; i++) {
                topicsToShowBeforeAnIdHasBeenSet.push(topicsArray[i]);
                console.log(topicsArray[i].name);
                topicsToShowBeforeAnIdHasBeenSet[i].question = questions[topicsArray[i].name].topic;
                topicsToShowBeforeAnIdHasBeenSet[i].linkTo = '#/search/' + topicsArray[i].name;
            }
            return topicsToShowBeforeAnIdHasBeenSet;
        }else{
            if($stateParams.searchby !== null){
                var topicsToShowAfterAnIdHasBeenSet = [];
                for (var j = 0; j < topicsArray.length; j++) {
                    if(topicsArray[j].searchby[$stateParams.searchby]){
                        if(questions[topicsArray[j].name][$stateParams.searchby] !== undefined){
                           topicsArray[j].question = questions[topicsArray[j].name][$stateParams.searchby]; 
                        }
                        var linkTo = '#/topics/' + topicsArray[j].name + '?searchtext=' + $stateParams.searchtext + '&searchby=' + $stateParams.searchby + '&id=' + $stateParams.id;
                        var params = topicsArray[j].searchby[$stateParams.searchby].params;
                        for(var key in params){
                            if(params[key] !== null){
                                linkTo = linkTo + "&" + key + "=" + params[key];
                            }
                        }              
                        topicsArray[j].linkTo = linkTo;
                        topicsToShowAfterAnIdHasBeenSet.push(topicsArray[j]);
                    }   
                }
                return topicsToShowAfterAnIdHasBeenSet;
            }else{
                //!!! Go back to search
            }
            
        }
    };

    Topics.topicProperties = function(topic){
        for (var i = 0; i < topicsArray.length; i++) {
            if(topicsArray[i].name === topic){
                return topicsArray[i];
            }
        }
    };



    //****Return the factory object****//
    return Topics; 

    
}]); //END Topics factory function