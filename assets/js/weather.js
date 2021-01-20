var apiKey = '4231d47b64990b1cae9e17f7e8bc249e';
var cityList = JSON.parse(localStorage.getItem('city')) || [];

function loadData() {
  $('.recent-city-list').empty();
  
  for (let i = 0; i < cityList.length; i++) {
    var cityName = $('<li>').addClass('recent-city bg-secondary text-light p-1 col-12').text(cityList[i]);
    $('.recent-city-list').prepend(cityName);
  }
};

// set day of week, date, and weather icon for heading of current day
function dayCondition() {
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
  return $('<li>').text(today);  
};

// list temp, humidity, wind speed, UV Index for current day
function createDaily(city) {
  $('#city-name').empty();
  $('#today').empty();
  var city = $('#city').val().trim().toLowerCase();
  storeData(city);
  createFiveDay(city);
  var searchItem = `https://api.openweathermap.org/data/2.5/weather?units=imperial&q=${city}&appid=${apiKey}`;
  
  fetch(searchItem).then(function(response) {
    
    if (response.ok) {
      response.json().then(function(data) {
        
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
        
        // create today's weather conditions
        var currentDate = dayCondition();
        var currentTemp = $('<li>').text(`Current Temperature: ${data.main.temp}${String.fromCharCode(176)} F`);
        var currentHumidity = $('<li>').text(`Current Humidity: ${data.main.humidity}%`);
        var currentWindSpeed = $('<li>').text(`Current Wind Speed: ${data.wind.speed} MPH`);
        var uvIndex = createUVI(data.coord.lat, data.coord.lon);
        var cityName = $('<span>').text(data.name)
        // add elements to HTML
        $('#city-name').append(cityName, weatherIconEl);
        $('#today').append(currentDate, currentTemp, currentHumidity, currentWindSpeed, uvIndex);
      })
    }
  })
  // show current conditions and clear input box
  $('#conditions').show();
  city = $('#city').val('');
};

function createFiveDay(city) {
  console.log("I'm in createFiveDay()")
  $('#forecast').empty();
  var searchItem = `https://api.openweathermap.org/data/2.5/forecast?units=imperial&q=${city}&appid=${apiKey}`;

  fetch(searchItem).then(function(response) {

    if (response.ok) {
      response.json().then(function(data) {
        console.log(data);
        
        // iterate every 8th index to ensure information is for new day
        for(let i = 0; i < 40; i += 8) {
          // Create date in MM/DD/YYYY format
          var dateTime = data.list[i].dt_txt;
          // keep the day and month and get rid of time
          var date = dateTime.split(' ')[0];
          // keep the MM and DD indexes to join back as MM/DD
          var dayMonth = date.split('-').splice(1, 2).join('/');
          // split the entire date string on each character and just keep the YYYY
          var year = date.split('').splice(0, 4).join('');
          // concatenate the date back together
          formattedDate = `${dayMonth}/${year}`;
          futureDate = $('<p>').text(formattedDate);
          // create weather icon
          var weatherIconData = data.list[i].weather[0].icon;
      
          if (weatherIconData.includes('d')) {
            weatherIconData = weatherIconData.replace('d', 'n');
          } 
          
          if (weatherIconData.includes('n')) {
            weatherIconData = weatherIconData.replace('n', 'd');
          }

          var weatherIcon = $('<img>').attr('src', `https://openweathermap.org/img/w/${weatherIconData}.png`);
          var weatherIconSpan = $('<span>');
          var weatherIconEl = $('<div>');
          weatherIconEl.append(weatherIcon);
          // temperature
          futureTemperature = $('<p>').text(`Temp: ${data.list[i].main.temp}${String.fromCharCode(176)} F`);
          // humidity
          futureHumidity = $('<p>').text(`Humidity: ${data.list[i].main.humidity}%`)

          // create 5 day forecast cards
          var cardEl = $('<div>').addClass('card p-1 bg-primary text-light');
          cardEl.append(futureDate, weatherIconEl, futureTemperature, futureHumidity);
          $('#forecast-cards').append(cardEl);
          console.log(cardEl)
        }
      })
    }
  })
  // display forecast for current city
  $('#forecast').show();
};

// using different API endpoint that contains accurate UV Index
function createUVI(lat, lon) {
  // TODO: fix uv background color not displaying
  var searchItem = `https://api.openweathermap.org/data/2.5/uvi/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;
  var currentUvIndex = $('<li>').text('Current UV Index: ')

  fetch(searchItem).then(function(response) {
    if (response.ok) {
      response.json().then(function(data) {
        var uvData = data[0].value;
        var uvInt = Math.floor(uvData);
        var uviEl = $('<span>').text(uvData).addClass('rounded px-1')

        // set color for UVI based on whole number integer
        switch(uvInt) {
          case (uvInt < 3): uviEl.addClass('low'); break;
          case (uvInt < 6): uviEl.addClass('moderate'); break;
          case (uvInt < 8): uviEl.addClass('high'); break;
          case (uvInt < 11): uviEl.addClass('very-high'); break;
          case (uvInt >= 11): uviEl.addClass('extreme'); break;
        }
        currentUvIndex.append(uviEl);
      })
    }
  })
  return currentUvIndex;
}
// h2 element with current conditions
// function createFiveDay()
// create card with date, weather symbol, temp, humidity
function storeData(city) {
// TODO: Fix storage and keep displayed list at 15
  if (cityList > 14) {
    cityList.shift();
    localStorage.setItem('city', JSON.stringify(cityList));
    cityList.push(city);
    loadData();

  } else {
    localStorage.setItem('city', JSON.stringify(cityList));
    cityList.push(city);
    loadData();
  }
};

// store list of recent searched cities
// function checkStoredData()
// pull stored information and show to user

// hide elements until data is ready to be displayed
$('#conditions').hide();
$('#forecast').hide();
// event listener for search input
$('.city-search').on('submit', function(event) {
  event.preventDefault();
  createDaily();
});

loadData();
  // checkStoredData() and then redirect to create functions
// event listener for recent-city-list
