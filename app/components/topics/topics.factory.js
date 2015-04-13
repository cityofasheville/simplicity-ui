simplicity.factory('Topics', ['$q', '$stateParams', 'Crime', 'Development', 'Property', 'Trash', 'Recycling', 'Zoning', 'StreetMaintenance', 'AddressList', 'Owner', 'OwnerMailingList', 'AddressMailingList',
	function($q, $stateParams, Crime, Development, Property, Trash, Recycling, Zoning, StreetMaintenance, AddressList, Owner, OwnerMailingList, AddressMailingList){

	//****Create the factory object****//
	var Topics = {};

	//****Private variables*****//


	var topicAccessor = {
		'crime' : Crime,
		'development' : Development,
		'property' : Property,
		'trash' : Trash,
		'recycling' : Recycling,
		'zoning' : Zoning,
		'streetmaintenance' : StreetMaintenance,
		'addresslist' : AddressList,
		'owner' : Owner,
		'ownermailinglist' : OwnerMailingList,
		'addressmailinglist' : AddressMailingList
	};


	var collectTopicProperties = function(){
		var topicsArray = [];
		for(var key in topicAccessor){
			var topic = topicAccessor[key];
			topicsArray.push(topic.getTopicProperties());
		}
		return topicsArray;
	};



	//****Public API*****//

	Topics.getTopics = function(){
		var linkTo;
		var topicsArray = collectTopicProperties();
		if($stateParams.id === null){
			var topicsToShowBeforeAnIdHasBeenSet = [];
			for (var i = 0; i < topicsArray.length; i++) {
				if(topicsArray[i].questions.topic !== undefined){
				   topicsArray[i].question = topicsArray[i].questions.topic; 
				}
				linkTo = '#/search?topic=' + topicsArray[i].name;            
				topicsArray[i].linkTo = linkTo;
				topicsToShowBeforeAnIdHasBeenSet.push(topicsArray[i]);
			}
			return topicsToShowBeforeAnIdHasBeenSet;
		}else{
			if($stateParams.searchby !== null){
				var topicsToShowAfterAnIdHasBeenSet = [];
				for (var j = 0; j < topicsArray.length; j++) {
					if(topicsArray[j].searchby[$stateParams.searchby]){
						if(topicsArray[j].questions[$stateParams.searchby] !== undefined){
						   topicsArray[j].question = topicsArray[j].questions[$stateParams.searchby]; 
						}
						linkTo = '#/topics/' + topicsArray[j].name + '?searchtext=' + $stateParams.searchtext + '&searchby=' + $stateParams.searchby + '&id=' + $stateParams.id;
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
		return topicAccessor[$stateParams.topic].getTopicProperties();
	};


	Topics.buildTopic = function(){
		var q = $q.defer();
		topicAccessor[$stateParams.topic].build()
			.then(function(topic){
				q.resolve(topic);
			});
		return q.promise;
	};



	//****Return the factory object****//
	return Topics; 

	
}]); //END Topics factory function