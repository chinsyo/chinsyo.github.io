(function(window) {
  var Reminder = function(start, end) {
    
    if (!start) {
      start = moment('2015/10/1', 'YYYY/MM/DD');
    }

    if (!end) {
      end = moment();
    }

    var years = end.diff(start, 'years');
    var months = end.diff(start.clone().add(years, 'years'), 'months');
    var days = end.diff(start.clone().add(years, 'years').add(months, 'months'), 'days');

    var anniversary = end.clone().month('Oct').date(1);
    var isBetween = end.isBetween(start, anniversary);
    var left = isBetween ? anniversary.diff(end, 'days') : end.diff(anniversary, 'days');
    var past = end.diff(start, 'days');

    return {
      years: years,
      months: months,
      days: days,
      past: past,
      left: left
    }
  }

  window.reminder = Reminder();
  window.onload = function() {
    var counter = document.querySelector('.counter');
    var past = document.querySelector('.past');
    var left = document.querySelector('.left');
    counter.innerHTML = '今天是我们在一起的' + reminder.years + '年' + reminder.months + '月' + reminder.days + '天'
    past.innerHTML = reminder.past + '天前我们走到了一起'
    left.innerHTML = reminder.left + '天后是我们的纪念日'
  }

})(window);