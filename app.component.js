'use strict'
  app.component('login', {
    templateUrl: 'login.html',
    controller: function ($state,$scope,AuthService) {
		console.log('1 login');
		console.log($state);
      this.go = () => {
        AuthService
          .Authorize(this.loginId,this.pwd)
          .then(result => $state.go('mailboxes'), error => alert(error.message));
      }
    }
  });
  app.component('mailboxes', {
    bindings: {
      mailboxes: '<'
    },
    templateUrl: 'mailboxes.html'
  });
  app.component('letters', {
    bindings: {
      letters: '<',
      email:'<'
    },
    templateUrl: 'letters.html',
    controller: function($state, MailboxesService) {
      this.out = () => {$state.go('mailboxes')};
      this.deleteItem = (item) => {
        MailboxesService.deleteLetter(item);
      };
      this.deleteMarked = () => {
        for (var i = this.letters.length-1; i > -1 ; i--) {
          if (this.letters[i].checked == true) {
            delete this.letters[i].checked;
            MailboxesService.deleteLetter(this.letters[i]);
          }
        };
      };
      this.refresh = () => {
        MailboxesService => MailboxesService.getLetters()
      };  
    }
  });
  app.component('letter', {
    templateUrl: 'letter.html',
    bindings: {
      letter: '<letter',
      deleteItem: '&delletter'
    }
  });
  app.component('newletter', {
    templateUrl: 'newletter.html',
    bindings: {
      from: '<',
      contacts: '<'
    },
    controller: function($scope, $timeout, $state, MailboxesService, UsersList) {
      console.log('newletter');
      console.log($state.params.from);
      
      this.letter = {};
      this.letter.from = $state.params.from;
      console.log(this);

/*      UsersList.getUsers().then(result => {
        this.contacts = result;
      });*/
      var $listContainer = angular.element(document.querySelectorAll('.search-item-list')[0] );
      console.log($listContainer);
      var el = angular.element(document.querySelectorAll('.input-email')[0]);
      console.log(el);
      el.on('focus',function(){
          $listContainer.addClass('show');
      });
      el.on('blur',function(){
          $timeout(function(){ $listContainer.removeClass('show') }, 200);
        });      
      $scope.chooseItem = function( item ){
         $scope.search = item.email;
           $listContainer.removeClass('show');
       }

      this.getContact = () => {
        this.letter.to = $scope.selected.email};

      this.go = () => {
        $state.go('letters', {email: $scope.$ctrl.letter.from}, { reload: 'letters' })
      };
      $scope.submitForm = function() {
        $scope.$ctrl.letter.from = $state.params.from;
        if ($scope.letterForm.$valid) {
          MailboxesService
            .sentLetter($scope.$ctrl.letter)
            .then(result => {alert("Письмо отправлено"); $scope.$ctrl.go()}, error => {alert(error.message);$scope.$ctrl.go()});
          console.log($scope.$ctrl.letter);          
        }
      };
    }
  });
  app.component('cards', {
    bindings: {
      users: '<'
    },
    templateUrl: 'cards.html',
    controller: function($state, UsersList) {
      console.log('component cards');
      this.deleteItem = (item) => {
        UsersList.deleteUser(item);
        $state.go('cards', null, { reload: 'cards' })
      };
/*      this.deleteMarked = () => {
        function noMarked(item, index, array) {
          return (item.checked != true)
        };
        this.users = this.users.filter(noMarked);
      };
      this.refresh = () => {
        UsersList => UsersList.getUsers()
      };*/
    }
  });
  app.component('mailbox', {
    templateUrl: 'mailbox.html',
    controller: function() {
      this.rowcss = 'unread';
      this.setRead = (x) => {
        this.rowcss = '';
      }
    },
    bindings: {
      mailbox: '<mailbox'
    }
  });
  app.component('userCard', {
    templateUrl: 'user-card.html',
    bindings: {
      person: '<user',
      deleteItem: '&delcard'
    }
  });
  app.component('letterCard', {
    templateUrl: 'letter-card.html',
    bindings: {
      letter: '<',
      email:'<'
    },
    controller: function($scope, $state, MailboxesService) {
      $scope.email = MailboxesService.getCurrentMailbox();
      console.log($scope);
      this.out = () => {$state.go('letters', {email: MailboxesService.getCurrentMailbox()})};
      this.delete = (letter) => {
        MailboxesService.deleteLetter(letter);
        $state.go('letters', {email: MailboxesService.getCurrentMailbox()});
      };
    }
  });
  app.component('card', {
    bindings: {
      user: '<'
    },
    templateUrl: 'card.html',
    controller: function($scope, $state, UsersList) {
      this.saveItem = (item) => {
        UsersList.saveUser(item);
        $state.go('cards', null, { reload: 'cards' })
      };
      $scope.submitForm = function() {
            if ($scope.userForm.$valid) {
                UsersList.saveUser($scope.$ctrl.user);
                $state.go('cards', null, { reload: 'cards' })
            }
        };
    }
  });
  app.component('logout', {
    template: `
        <button class="btn" ng-click="$ctrl.logout();">
          <span class="glyphicon glyphicon-log-out"></span>
        </button>
    `,
    controller: function($state,AuthService){
      this.logout = () => {
        AuthService
          .exit()
          .then(result => $state.go('login'));
      }    
    }
  });
