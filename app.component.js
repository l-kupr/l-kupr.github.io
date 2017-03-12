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
    controller: function($timeout, $state, MailboxesService, UsersList) {
      this.letter = {};
      this.letter.from = $state.params.from;
      this.go = () => {
        $state.go('letters', {email: this.letter.from}, { reload: 'letters' })
      };
      var $listContainer = angular.element(document.querySelectorAll('.search-item-list')[0] );
      var el = angular.element(document.querySelectorAll('.input-email')[0]);
      el.on('keyup',() => {
          $timeout(() => {$listContainer.addClass('show')}, 200);
      });
      el.on('blur',() => {
          $timeout(() => { $listContainer.removeClass('show') }, 200);
        });      
      this.chooseItem = ( item ) => {
        this.search = item.email;
        this.letter.to = item.email;
        $listContainer.removeClass('show');
      }
      this.change = () => {
        this.letter.to = this.search;
      };
      this.submitForm = () => {
        //this.letter.from = $state.params.from;
        console.log(this);
        if (this.letterForm.$valid) {
          let condition = (item, index, array) => {
            let result = false;
            if (item.email === this.letter.to) {result = true;}
            return result;
          };
          let exists = this.contacts.some(condition);
          console.log(exists);
          if (!exists){
            let user = {};
            user.email = user.firstName = this.letter.to;
            UsersList.saveUser(user);
          }

          MailboxesService
            .sentLetter(this.letter)
            .then(result => {alert("Письмо отправлено"); this.go()}, error => {alert(error.message);this.go()});
          console.log(this.letter);          
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
    controller: function($state, MailboxesService) {
      this.email = MailboxesService.getCurrentMailbox();
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
    controller: function($state, UsersList) {
      this.saveItem = (item) => {
        UsersList.saveUser(item);
        $state.go('cards', null, { reload: 'cards' })
      };
      this.submitForm = () => {
        console.log(this);
            if (this.userForm.$valid) {
                UsersList.saveUser(this.user);
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
