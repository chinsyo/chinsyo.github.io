(function(window) {
  var Reminder = function(start, today) {

    start = start || moment('2015/10/1', 'YYYY/MM/DD');
    today = today || moment();

    let years = today.diff(start, 'years');
    let months = today.diff(start.clone().add(years, 'years'), 'months');
    let days = today.diff(start.clone().add(years, 'years').add(months, 'months'), 'days');

    let anniversary = moment(today.year() + '/10/1')
    if (anniversary < today) {
      anniversary = anniversary.add(1, 'years')
    }
    
    let past = today.diff(start, 'days');
    let left = anniversary.diff(today, 'days')

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
    let counter = document.querySelector('.counter');
    let past = document.querySelector('.past');
    let left = document.querySelector('.left');
    counter.innerHTML = '今天是我们在一起的第<strong>' + reminder.years + '</strong>年<strong>' + reminder.months + '</strong>月<strong>' + reminder.days + '</strong>天'
    past.innerHTML = '<strong>' + reminder.past + '</strong>天前我们走到了一起'
    left.innerHTML = '<strong>' + reminder.left + '</strong>天后是我们的纪念日'
  }

})(window);