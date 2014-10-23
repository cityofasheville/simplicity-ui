'use strict';

describe('app.factory.js', function(){
  	var $scope;
  	var AppFact;

	beforeEach(function(){
		module('simplicity');

		inject(function($rootScope, $injector) {
			$scope = $rootScope.$new();
			AppFact = $injector.get('AppFact');
		});

	});

	var locationProperties = {
	    locationName : '123456',
	    locationType : 'cai',
	    inTheCity : true,
	    address : '25 Howland Rd',
	    city : 'Asheville',
	    state : 'NC',
	    zip : 28804
	};
	var caiQuestions = [
		{'question' : 'Do you want to know about crime?', 'category' : 'crime', 'detail' : 'within-quarter-mile'},
		{'question' : 'Do you want to know about this property?', 'category' : 'property', 'detail' : 'summary'},
		{'question' : 'Do you want to know about development?', 'category' : 'development', 'detail' : 'summary'},
		{'question' : 'Do you want to know about the owner?', 'category' : 'property', 'detail' : 'owner'},
		{'question' : 'Do you want to know about the zoning?', 'category' : 'property', 'detail' : 'zoning'},
		{'question' : 'Do you want to know about the trash collection?', 'category' : 'property', 'detail' : 'trash'}
    ];

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

	it('should set location properties', function(){
	 	AppFact.locationProperties(locationProperties);
	 	var theLocationPropertiesThatWereSet = AppFact.locationProperties();
	 	expect(theLocationPropertiesThatWereSet).to.eventually.equal(locationProperties);
	 	expect(theLocationPropertiesThatWereSet).to.eventually.have.property('locationName');
	});


	it('should get location properties', function() {
	 	var theLocationPropertiesFromAppFact= AppFact.locationProperties();
	 	expect(theLocationPropertiesFromAppFact).to.eventually.equal(locationProperties);
	 	expect(theLocationPropertiesFromAppFact).to.eventually.have.property('locationName');
	});

	it('should get questions for a civic address ID', function(){
		AppFact.locationProperties(locationProperties);
		var ciaQuestionsFromAppFact = AppFact.questions();
		expect(ciaQuestionsFromAppFact[0].question).to.equal(caiQuestions[0].question);
	});

	it('should set and get time options', function(){
		AppFact.timeOptions(timeOptions);
		var timeOptionsFromAppFact = AppFact.timeOptions();
		expect(timeOptionsFromAppFact[0].value).to.equal(timeOptions[0].value);
	});

	it('should set and get extent options', function(){
		AppFact.extentOptions(extentOptions);
		var extentOptionsFromAppFact = AppFact.extentOptions();
		expect(extentOptionsFromAppFact[0].value).to.equal(extentOptions[0].value);
	});

	it('should set and get propertyFilter options', function(){
		AppFact.propertyFilterOptions(propertyFilterOptions);
		var propertyFilterOptionsFromAppFact = AppFact.propertyFilterOptions();
		expect(propertyFilterOptionsFromAppFact[0].value).to.equal(propertyFilterOptions[0].value);
	});

	it('should set and get crimeFilter options', function(){
		AppFact.filterOptions(crimeFilterOptions);
		var crimeFilterOptionsFromAppFact = AppFact.filterOptions();
		expect(crimeFilterOptionsFromAppFact[0].value).to.equal(crimeFilterOptions[0].value);
	});



});