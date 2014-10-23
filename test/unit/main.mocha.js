'use strict';

describe('a test suite', function(){
  var $scope;

  beforeEach(module('simplicity'));

  beforeEach(inject(function($rootScope) {
  	$scope = $rootScope.$new();
  }));

  it('should define more than 5 awesome things', function() {
  	var somethingTrue = true;
    expect(somethingTrue).to.equal(true);
  });
});
