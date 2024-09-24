/* jshint esversion: 11, jquery: true */

// Declare units variable to store units of measurement and default to metric.
let units = 'metric';

/* Function to get weather data from OpenWeatherMap API,
 *  via fetch method from nodejs and express server, 
 *  declaring city name based on user input.
 */
function getWeather() {
  const cityInput = document.getElementById('cityInput');
  const cityName = cityInput.value;

  if (cityName === '') {
    alert('Please enter a town or city name.');
    return;
  }

  fetch(`/weather?cityName=${cityName}&units=${units}`)
    .then(response => response.json())
    .then(data => {
      displayWeather(data);
      displayForecast(data);
      alertInfo(data);
    })
    .catch(error => {
      console.error('Error fetching weather data:', error);
      alert('Error fetching weather data. Please try again.');
    });

  // Function to declare variables based on weather data called from api using deconstruction method.
  function displayWeather(data) {
    const weatherInfo = document.getElementById('weatherInfo');
    const temperature = data.current.temp;
    const feels_like = data.current.feels_like;
    const icon = data.current.weather[0].icon;
    const description = data.current.weather[0].description;
    const humidity = data.current.humidity;
    const wind = data.current.wind_speed;
    const pressure = data.current.pressure;
    const sunrise = data.current.sunrise;
    const sunset = data.current.sunset;
    const timezoneOffset = data.timezone_offset;

    /* Timezone offset is calculated based on user input city name, 
    *  it is then formatted to display date and time in local time.
    *  All time and date conversions are constructed using information from the 
    *  Toptal (https://www.toptal.com/software/definitive-guide-to-datetime-manipulation) web site.
    */
    const now = new Date();
    const cityTime = new Date(now.getTime() + (now.getTimezoneOffset() * 60 * 1000) + (timezoneOffset * 1000));
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    };

    // Function to capitalize the first letter of each word
    function capitalizeWords(str) {
      return str.replace(/\b\w/g, char => char.toUpperCase());
    }

    // Capitalize the city name
    const capitalizedCityName = capitalizeWords(cityName);
    const cityDateTime = new Intl.DateTimeFormat('en-GB', options).format(cityTime);

    /* Sunrise and sunset times are converted from unix timestamp 
    *  to local time based on user input.  
    */
    const sunriseDate = new Date((sunrise + timezoneOffset) * 1000);
    const sunsetDate = new Date((sunset + timezoneOffset) * 1000);

    // Sunrise and sunset times are formatted to display time in local time adding leading zeros.
    const sunriseTime = sunriseDate.getUTCHours().toString().padStart(2, '0') + ':' + sunriseDate.getUTCMinutes().toString().padStart(2, '0');
    const sunsetTime = sunsetDate.getUTCHours().toString().padStart(2, '0') + ':' + sunsetDate.getUTCMinutes().toString().padStart(2, '0');

    /* Temperature, feels like temperature and wind speed 
    *  are queried based on the declared units of measurement.
    */
    let tempSymbol = units === 'imperial' ? '°F' : '°C';
    let windUnit = units === 'imperial' ? 'mph' : 'm/s';

    // Capitalize the weather description
    const capitalizedDescription = capitalizeWords(description);

    // HTML is generated using variables created from deconstructed weather data.
    const htmlCurrent = `
                <h5 class="date-time">${cityDateTime}</h5>
                <h2 class="city">${capitalizedCityName}</h2>
                <h1 class="temp">${temperature.toFixed(1)}<sup>${tempSymbol}</sup></h1>
                <h5 class="feels">Feels Like: ${feels_like.toFixed(1)}<sup>${tempSymbol}</sup></h5>
                <img class="icon" src="https://openweathermap.org/img/wn/${icon}@4x.png" alt="weatherIcon">
                <p class="description">${capitalizedDescription}</p>
                <p class="humidity">Humidity: ${humidity}<sup>%</sup></p>
                <p class="wind">Wind Speed: ${wind} ${windUnit}</p>
                <p class="pressure">Atmospheric Pressure: ${pressure} hPa</p>
                <p class="sunrise-set">Sunrise: ${sunriseTime} / Sunset: ${sunsetTime}</p>`;

    // HTML is displayed on page.
    weatherInfo.innerHTML = htmlCurrent;

    // Update background image based on weather condition
    updateBackground(description);
  }
    
  function updateBackground(description) {
    const body = document.body;
    let backgroundImage = '';

    // Set background image based on weather description
    if (description.includes('clear')) {
      backgroundImage = 'url(/assets/images/weather-backgrounds/sun.jpg)';
    } else if (description.includes('clouds')) {
      backgroundImage = 'url(/assets/images/weather-backgrounds/clouds.jpg)';
    } else if (description.includes('rain')) {
      backgroundImage = 'url(/assets/images/weather-backgrounds/rain.jpg)';
    } else if (description.includes('drizzle')) {
      backgroundImage = 'url(/assets/images/weather-backgrounds/drizzle.jpg)';
    } else if (description.includes('thunderstorm')) {
      backgroundImage = 'url(/assets/images/weather-backgrounds/storm.jpg)';
    } else if (description.includes('snow')) {
      backgroundImage = 'url(/assets/images/weather-backgrounds/snow.jpg)';
    } else if (description.includes('mist')) {
      backgroundImage = 'url(/assets/images/weather-backgrounds/mist.jpg)';
    } else if (description.includes('fog')) {
      backgroundImage = 'url(/assets/images/weather-backgrounds/fog.jpg)';
    } else if (description.includes('haze')) {
      backgroundImage = 'url(/assets/images/weather-backgrounds/haze.jpg)';
    } else {
      backgroundImage = 'url(/assets/images/weather-backgrounds/default-weather.jpg)';  // Default background image
    }

    // Apply background image to the body
    body.style.backgroundImage = backgroundImage;
    body.style.backgroundSize = 'cover';
    body.style.backgroundPosition = 'center';
  }

    // Function to declare variables based on forecast data.
  function displayForecast(data) {
    const forecastInfo = document.getElementById('forecastInfo');
    const forecast = data.daily;

    // htmlForecast variable is declared as an empty string.
    let htmlForecast = '';

    // Helper function to capitalize each word in a string
    function capitalizeWords(str) {
    return str.replace(/\b\w/g, char => char.toUpperCase());
    }

    /* For loop to iterate through forecast data, convert date and time to weekdays
    *  and declare the next four days of the week from the current day.
    *  Data is then declared using deconstruction method.
    */
    for (let i = 1; i <= 5; i++) {
      const forecastDate = new Date((forecast[i].dt + data.timezone_offset) * 1000);
      const forecastDay = forecastDate.toLocaleString('en-GB', {
        weekday: 'long'
      });
      const forecastIcon = forecast[i].weather[0].icon;
      const forecastTemp = forecast[i].temp.day.toFixed(1);
      const forecastDescription = forecast[i].weather[0].description;
      // Capitalize the weather description
      const capitalizedForecastDescription = capitalizeWords(forecastDescription);

      // Temperature is queried based on the declared units of measurement.
      let tempSymbol = units === 'imperial' ? '°F' : '°C';

      // HTML is generated based on deconstructed forecast data.
      htmlForecast += `
              <div class="col-sm-2 mx-auto my-2 text-center">
                <div class="forecast-day">
                    <h5 class="forecast-date">${forecastDay}</h5>
                    <h6 class="forecast-temp">${forecastTemp}<sup>${tempSymbol}</sup></h6>
                    <img class="forecast-icon" src="https://openweathermap.org/img/wn/${forecastIcon}@2x.png" alt="forecastIcon">                    
                    <p class="forecast-description">${capitalizedForecastDescription}</p>
                </div>
              </div>`;
    }

    // HTML is displayed on page.
    forecastInfo.innerHTML = `<div class="row">${htmlForecast}</div>`;
  }

  // Function to declare variables based on weather alerts.
  function alertInfo(data) {
    const alerts = data.alerts;
    const alertInfo = document.getElementById('alertInfo');
    const alertsContainer = document.getElementById('alertsContainer');
  
    if (alerts && alerts.length > 0) {
      let alertMessage = '';
  
      alerts.forEach(alert => {
        alertMessage += `
                <div class="col-sm-12 mx-auto my-2 text-center">
                  <div class="alertInfo text-center">
                      <h2 class="heading text-center">Weather Alert!</h2>
                      <h3>${alert.event}</h3>
                      <p>${alert.description}</p>
                      <p>From: ${new Date((alert.start + data.timezone_offset) * 1000).toLocaleString()}</p>
                      <p>To: ${new Date((alert.end + data.timezone_offset) * 1000).toLocaleString()}</p>
                  </div>
                </div>`;
      });
  
      // Hide the alert banner if there are no alerts.
      alertInfo.innerHTML = `<div class="row">${alertMessage}</div>`;
      alertsContainer.classList.remove('d-none');
    } else {
      alertInfo.innerHTML = '';
      alertsContainer.classList.add('d-none');
    }
  }
}

// Event listener to allow user to get weather data by clicking the search icon.
document.getElementById('form').addEventListener('submit', function (event) {
  event.preventDefault();
  getWeather();
});

// Event listener to allow the user to get weather by pressing the Enter key.
document.addEventListener('keydown', function (event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    getWeather();
  }
});

// Event listener to change units of measurement by toggle switch.
document.getElementById('units').addEventListener('change', function () {
  if (this.checked) {
    units = 'imperial';
  } else {
    units = 'metric';
  }
  getWeather();
});