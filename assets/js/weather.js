var recentCities = [];
var apiKey = '4231d47b64990b1cae9e17f7e8bc249e';

// check localstorage
if (localStorage.getItem('recent') === null) {
} else {
  recentCities = JSON.parse(localStorage.getItem('recent'));
};

// validation
var checkForecast = function(city) {
  var apiUrl = `https://api.openweathermap.org/data/2.5/weather?units=imperial&q=${city}&appid=${apiKey}`;
  fetch(apiUrl).then(function(response) {
    if(!response.ok) {
      document.querySelector('#city').setCustomValidity("Invalid City Name");
    } else {
      response.json().then(function(data) {
        createConditions(data);
        createForecast(city);
        if (!recentCities.includes(city)) {
          checkRecent(city);
        }
      })
    }
  })
};

// create current weather conditions
var createConditions = function(data) {
  // clear old data
  $('#today').empty();
  $('#conditions-info span').text(data.name);

  // define current day of the week
  var today = new Date();
  var weekday = new Array(7);
  weekday[0] = "Sunday";
  weekday[1] = "Monday";
  weekday[2] = "Tuesday";
  weekday[3] = "Wednesday";
  weekday[4] = "Thursday";
  weekday[5] = "Friday";
  weekday[6] = "Saturday";
  // define today's date
  var currentDay = weekday[today.getDay()];
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0');
  var yyyy = today.getFullYear();
  // create string for current day of week and date
  today = `${currentDay} - ${mm}/${dd}/${yyyy}`;
  
  // create weather icon
  var weatherIconEl = $('#conditions-info').find('img').remove();
  var weatherIconData = data.weather[0].icon;
  
  if (weatherIconData.includes('d')) {
    weatherIconData = weatherIconData.replace('d', 'n');
  } 
  
  if (weatherIconData.includes('n')) {
    weatherIconData = weatherIconData.replace('n', 'd');
  }
  
  // add weather icon after city name
  var weatherIconEl = $('<img>').attr('src', `https://openweathermap.org/img/w/${weatherIconData}.png`);
  $('#conditions-info').append(weatherIconEl);
  
  // create elements for current forecast
  var todayEl = $('<p>').text(today);
  var tempEl = $('<p>').text(`Temperature: ${data.main.temp}${String.fromCharCode(176)} F`);
  var humidityEl = $('<p>').text(`Humidity: ${data.main.humidity}%`);
  var windEl = $('<p>').text(`Wind: ${data.wind.speed} Miles/HR`);
  $('#today').append(todayEl, tempEl, humidityEl, windEl, createUV(data));
  $('.forecast-container').show();
};

// create 5 day forecast
var createForecast = function(city) {
  var apiUrl = `https://api.openweathermap.org/data/2.5/forecast?units=imperial&q=${city}&appid=${apiKey}`;
  fetch(apiUrl).then(function(response) {
    if (response.ok) {
      response.json().then(function(data) {
        // clear data before adding new data
        $('#forecast-info').empty();
        for(let i = 0; i < 40; i += 8) {
          // Create date in MM/DD/YYYY format
          console.log(data)
          var dateTime = data.list[i].dt_txt;
          var date = dateTime.split(' ')[0];
          var dayMonth = date.split('-').splice(1, 2).join('/');
          var year = date.split('').splice(0, 4).join('');
          formattedDate = `${dayMonth}/${year}`;
          dateEl = $('<p>').text(formattedDate);
          // create weather icon
          var weatherIconData = data.list[i].weather[0].icon;
      
          if (weatherIconData.includes('d')) {
            weatherIconData = weatherIconData.replace('d', 'n');
          } 
          
          if (weatherIconData.includes('n')) {
            weatherIconData = weatherIconData.replace('n', 'd');
          }

          var weatherIcon = $('<img>').attr('src', `https://openweathermap.org/img/w/${weatherIconData}.png`);
          // create div to contain icon to prevent stretching across card
          var weatherIconEl = $('<div>');
          weatherIconEl.append(weatherIcon);
          // create temperature and humidity
          var tempEl = $('<p>').text(`Temperature: ${data.list[i].main.temp}${String.fromCharCode(176)} F`);
          var humidityEl = $('<p>').text(`Humidity: ${data.list[i].main.humidity}%`);
          var containerEl = $('<div>').attr('class', 'card p-1 bg-primary text-light');
          containerEl.append(dateEl, weatherIconEl, tempEl, humidityEl);
          $('#forecast-info').append(containerEl);
        }
      })
    } else {
      console.log(`ERROR`);
    }
  })
};

// create accurate UV data
var createUV = function(obj) {
  var lat = obj.coord.lat;
  var lon = obj.coord.lon;
  var uvIndexLabelEl = $('<p>').text('UV Index: ');
  var apiUrl = `https://api.openweathermap.org/data/2.5/uvi/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;
  fetch(apiUrl).then(function(response) {
    if (response.ok) {
      response.json().then(function(data) {
        var uv = data[0].value;
        var uvIndexEl = $('<span>').text(uv);
        // check uv range and format background color
        if (uv < 3) {
            uvIndexEl.addClass('low');
        } else if (uv < 6) {
            uvIndexEl.addClass('mod');
        } else if (uv <= 8) {
            uvIndexEl.addClass('high');
        } else if (uv < 11) {
            uvIndexEl.addClass('very-high');
        } else {
            uvIndexEl.addClass('extreme');
        }
        uvIndexLabelEl.append(uvIndexEl);
      })
    }
  })
  return uvIndexLabelEl;
};

// keep list length manageable
var checkRecent = function(city) {
  recentCities.push(city);
  if ($('.recent-cities li').length < 15) {
    createRecent();
  } else {
    recentCities.shift();
    createRecent();
  }
};

// create list of recent queries
var createRecent = function() {
  $('.recent-cities').empty();
  for(let i = 0; i < recentCities.length; i++) {
    var cityEl = $('<li>').attr('class', 'recent-city bg-dark text-light p-1 col-12').text(recentCities[i])
    $('.recent-cities').prepend(cityEl)
  }
  $('#recent-cities-title').show()
  localStorage.setItem('recent', JSON.stringify(recentCities))
}

// listen for new query 
$('.city-form').on('submit', function(event){
  event.preventDefault()
  var city = $(this).find('#city').val().trim().toLowerCase()
  $('#city').val('')
  checkForecast(city)
});

// send city name as query to checkForecast() when clicking recent city
$('.recent-cities').on('click', 'li', function(event){
  event.preventDefault()
  var city = $(this).text()
  checkForecast(city)
});

// hide hardcoded HTML elements and city list until data is applied
$('.forecast-container').hide()

if (recentCities.length < 1){
  $('#recent-cities-title').hide()
} else {
  createRecent()
};