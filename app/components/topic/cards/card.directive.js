app.directive('card', ['$compile','$templateCache', '$filter','$state', '$stateParams','$q', '$timeout','Details', 'IdProperties', 'Filter',
  function($compile, $templateCache, $filter, $state, $stateParams, $q, $timeout, Details, IdProperties, Filter){
  return {
    //Restrict the directive to attribute search on an element 
    restrict: 'A',
    //Defines the scope object for the directive 
    scope:{
      card : '= card',
    },
    replace : true,
    //Template for the directive
    templateUrl: 'details/cards/card.directive.html',
    link : function(scope, element, attrs){
      console.log(scope.card);
      console.log('$scope.card');
      var templates = {
        'crime' : 'details/cards/crime.card.html',
        'development' : 'details/cards/development.card.html',
        'zoning' : 'details/cards/property.zoning.card.html',
        'owner' : 'details/cards/property.owner.card.html',
        'summary' : 'details/cards/summary.table.card.html',
        'property' : 'details/cards/property.card.html',
        'properties' : 'details/cards/properties.card.html',
        'sanitation' : 'details/cards/sanitation.card.html'
      };

      scope.developmentExplanations = {
        'Planning Level I' : 'Commercial construction less than 35,000 square feet or less than 20 multi-family units',
        'Planning Level II' : 'Commercial construction 35,000-100,000 square feet or 20-50 multi-family units',
        'Planning Level III' : 'Commercial construction larger than 100,000 square feet or more than 50 multi-family units'
      };
      
      var template = $templateCache.get(templates[scope.card.template]);
      element.replaceWith(element.html(template));
      $compile(element.contents())(scope);
      
      
      scope.getDetails = function(typeString){
        var typeStringWithHyphens = typeString.toLowerCase().replace(/ /g, '-');
        console.log(typeStringWithHyphens);
        $state.go('main.type.id.category.time.extent.filter.details', {filter : typeStringWithHyphens});
      };

    }//END card Directive Controller function
  };//END returned object
}]);//END card Directive function