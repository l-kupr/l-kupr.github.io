'use strict'
 var app = angular.module('list', ['ui.router','ngStorage']);
  
app.config(($stateProvider, $urlRouterProvider, $httpProvider) => {
  $httpProvider.interceptors.push('AuthInterceptor');
  $stateProvider
    .state({
      abstract: true,
      name: 'common',
      url: '',
      resolve: {
        auth: AuthService => AuthService.isAuth()
      }
    })
    .state({
      name: 'login',
      parent: 'common',
      url: '/login',
      template: '<login></login>'
    })
    .state({
      name: 'mailboxes',
      parent: 'common',
      url: '/mailboxes',
      resolve: {
        boxes: MailboxesService => MailboxesService.getMailboxes()
      },
      template: '<mailboxes mailboxes="mailboxes">Идет загрузка ...</mailboxes>',
      controller: function($scope, boxes) {
        console.log('state boxes');
            $scope.mailboxes = boxes;
      }
    })
    .state({
      name: 'letters',
      parent: 'common',
      url: '/letters/:email',
      resolve: {
        letters: (MailboxesService,$stateParams) => MailboxesService.getLetters($stateParams.email),
        email: MailboxesService => MailboxesService.getCurrentMailbox()
      },
      template: '<letters letters="letters" email="email">Идет загрузка ...</letters>',
      controller: function($scope, $stateParams, letters) {
        $scope.letters = letters;
        $scope.email = $stateParams.email;
      }
    })
    .state({
      name: 'letter',
      parent: 'common',
      url: '/letter/:letterId',
      resolve: {
        letter: (MailboxesService,$stateParams) =>  MailboxesService.getLetter($stateParams.letterId),
        email: MailboxesService => MailboxesService.getCurrentMailbox()
      },
      template: '<letter-card letter-id="letterId" letter="letter" email="email"></letter-card>',
      controller: function($scope, $state, $stateParams, letter, email) {
            $scope.email = email;
            $scope.letterId = $stateParams.letterId;
            if ($scope.letterId == '') $scope.letter = {};
            else $scope.letter = letter;
      }   
    }) 
    .state({
      name: 'newletter',
      parent: 'common',
      url: '/newletter/:from',
      resolve: {
        contacts: UsersList => UsersList.getUsers()
      },
      template: '<newletter from="from" contacts="contacts"></newletter>',
      controller: function($scope, $state, $stateParams,contacts) {
            $scope.letter = {};
            $scope.letter.from = $stateParams.from;
            $scope.contacts = contacts;
      }
    })    
    .state({
      name: 'cards',
      parent: 'common',
      url: '/contacts',
      resolve: {
        cards: UsersList => UsersList.getUsers()
      },
      template: '<cards users="users">Идет загрузка ...</cards>',
      controller: function($scope, cards) {
            $scope.users = cards;
      }
    })
    .state({
      name: 'user',
      parent: 'common',
      url: '/contacts/:userId',
      resolve: {
        user: (UsersList,$stateParams) =>  UsersList.getUsers($stateParams.userId)
      },
      template: '<card user-id="userId" user="user">Идет загрузка ...</card>',
      controller: function($scope, $stateParams, user) {
        console.log('user');
            $scope.userId = $stateParams.userId;
            if ($scope.userId == '') $scope.user = {};
            else $scope.user = user;
      }
    })
    $urlRouterProvider
    .when('/', '/mailboxes')
    .otherwise('/mailboxes')
  });


  app.run(($rootScope, $state, $transitions, $q, AuthService) => {
    $transitions.onError({ to: 'user' }, function($error$) {
      console.log($error$);
    });
    $transitions.onEnter({ to: 'user' }, function($state$, $transition$){
        console.log('START!');
		console.log($state);
    })
    $transitions.onStart({to: 'login'}, function () {
/*      if (AuthService.isAuth()) {
        return $state.target('users');
      }*/
    });
    $transitions.onStart({to: function (state) {
        return (state.name != 'login');
      }}, () => {
      if (!AuthService.isAuth()) {return $state.target('login');}
      else {return true;}
    });
  });


