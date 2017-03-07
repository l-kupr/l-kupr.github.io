'use strict'
app.service('AuthService', function ($localStorage, $q) {
    let creds = {l: 'admin', p: '123'};
    // если пользователь авторизован, в $localStorage.auth хранится 1
    let auth = $localStorage.auth || 0;
    this.isAuth = () => auth
    this.Authorize = (l,p) => {
      let request = $q.defer();
      // setTimeout вместо запроса к БД
      setTimeout(() => {
        if (l===creds.l && p===creds.p) {auth = 1; $localStorage.auth = 1; 
        request.resolve(true);}
        else request.reject(new Error("Ошибка авторизации")); 
         }, 100);
      return request.promise;
    }
    this.exit = () => {
      let request = $q.defer();
      setTimeout(() => {
        if (auth == 1) {auth = 0; delete $localStorage.auth; 
        request.resolve(true);}
        else request.reject(new Error("Пользователь не авторизован")); 
         }, 100);
      return request.promise;
    }
  });
  app.service('AuthInterceptor', function($q){
    this.responseError = (httpConfig) => {
      if (httpConfig.status === 401) {
        alert('Произошла ошибка на сервере. Необходимо заново авторизоваться.');
      }
      return $q.reject(httpConfig);
    };
  });
  app.service('UsersList', function($http, $q) {
    let users = null;
    let maxId = -1;
    let getUser = (id) => {
      if (users) {
        for (let user of users)
          if (user.id == id) {
            return user;
            break;
        }
      }
      return false;
    };
    this.getUsers = (id) => {
      if (users) {return (id ? getUser(id) : $q.resolve(users))}
      return $http.get('users.json', {transformResponse: function(data){
          data = JSON.parse(data);
          for (var i = 0; i < data.length; i++){
            data[i].id = i; maxId = i;
          };
          return data;
        }
      }).then(res => {users = res.data; return (id ? users[id] : users)})
    };
    this.saveUser = (user) => {
      if (user.id && users) {
        for (let item of users)
          if (item.id == user.id) {
            item.firstName = user.firstName;
            item.surname = user.surname;
            item.username = user.username;
            item.email = user.email;
            break;
          }
      } else {
        maxId = maxId + 1;
        user.id = maxId;
        users.push(user);
      }
    };
    this.deleteUser = item => {
      users.splice(users.indexOf(item), 1);
    };
    //https://learn.javascript.ru/courses/groups/api/participants?key=1gvlw0r
  });

  app.service('MailboxesService', function($http, $q) {
    let mailboxes = null;
    let letters = null;
    let currentMailboxLetters = null;
    let currentMailbox = null;
    let maxId;
    this.getCurrentMailbox = () => currentMailbox
    this.getMailboxes = () => {
      if (mailboxes) return $q.resolve(mailboxes);
      return $http.get('mailboxes.json').then(res => mailboxes = res.data)
    };
    this.getLetters = (email) => {
      if (currentMailboxLetters && currentMailbox == email) return $q.resolve(currentMailboxLetters);
      function condition(item, index, array) {
        var result = false;
        if (item.to == email || item.from == email) result = true;
        return result;
      };
      if (letters) {
        currentMailboxLetters = letters.filter(condition);
        currentMailbox = email;
        return $q.resolve(currentMailboxLetters);
      }
      return $http.get('letters.json', {transformResponse: function(data){
          data = JSON.parse(data);
          for (var i = 0; i < data.length; i++) data[i].id = i;
          maxId = data.length;
          //console.log(res);
          return data;
        }
      }).then(res => {
        letters = res.data;
        currentMailbox = email;
        currentMailboxLetters = letters.filter(condition);
        return currentMailboxLetters;
      })
    };
    this.getLetter = (id) => {
      if (letters) {
        for (let letter of letters)
          if (letter.id == id) {
            return letter;
            break;
        }
      }
      return false;
    }
    this.deleteLetter = item => {
      letters.splice(letters.indexOf(item), 1);
      currentMailboxLetters.splice(currentMailboxLetters.indexOf(item), 1);
    };
    this.sentLetter = (letter) => {
      let request = $q.defer();
      // setTimeout вместо запроса
      setTimeout(() => {
        letter.id = maxId;
        maxId = maxId + 1;
        letter.received = Date.now();
        currentMailboxLetters.unshift(letter);
        if (letters.unshift(letter) > 0) {console.log(letters); request.resolve(true);}
        else request.reject(new Error("Ошибка при отправке сообщения")); 
         }, 100);
      return request.promise;
    }
  });
