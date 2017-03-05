  app.filter('datefilter', function() {
    return function datefilter(recdate, ...args) {
      var msecPerMinute = 1000 * 60;
      var msecPerHour = msecPerMinute * 60;
      var msecPerDay = msecPerHour * 24;
      var today = new Date();
      var startDate = new Date(recdate*1);
      var interval = today.getTime() - startDate.getTime();
      var days = Math.floor(interval / msecPerDay );
      interval = interval - (days * msecPerDay );
      var hours = Math.floor(interval / msecPerHour );
      interval = interval - (hours * msecPerHour );
      var minutes = Math.floor(interval / msecPerMinute );
      interval = interval - (minutes * msecPerMinute );
      var seconds = Math.floor(interval / 1000 );
      var msg = "";
      if (days>0) {
        msg = days + (days%10 == 1 ? " день назад" : ((days%10<1 || days%10>4) ? " дней назад" : " дня назад"));
      } else if (hours>0) {
          msg = hours + (hours%10 == 1 ? " час назад" : ((hours%10<1 || hours%10>4) ? " часов назад" : " часа назад"));
      } else if (minutes>0) {
          msg = minutes + (minutes%10 == 1 ? " минуту назад" : ((minutes%10<1 || minutes%10>4) ? " минут назад" : " минуты назад"));
      } else if (seconds>0){
          msg = seconds + (seconds%10 == 1 ? " секунду назад" : ((seconds%10<1 || seconds%10>4) ? " секунд назад" : " секунды назад"));
      }
      return msg;
    }
  });