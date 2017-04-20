var HomeController = function ($scope, $rootScope, $state, $localStorage, AdMob) {

  // start display ad after 3 minutes  
  // $timeout(function () { $rootScope.showBanner(); }, 3000);

  $scope.say = function () {
    console.log("called");
  }

  $scope.join = function () {
    $rootScope.player.isInPlay = false;
    //$localStorage.player = $rootScope.player;
    $state.go('game');
  }
  
  $rootScope.player = { nickname:'Player ' + Math.floor(Math.random() * 1000),  balance : Math.floor(Math.random() * 100)};
};