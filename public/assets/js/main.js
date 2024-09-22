/* jshint esversion: 11, jquery: true */

// Declare units variable to store units of measurement and default to metric.
let units = 'metric';

/* Function to get weather data from OpenWeatherMap API, 
 *  declaring api key and city name based on user input.
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
      * All time and date conversions are constructed using information from the 
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
    let tempSymbol = units === 'imperial' ? '°f' : '°c';
    let windUnit = units === 'imperial' ? 'mph' : 'm/s';

    // HTML is generated using variables created from deconstructed weather data.
    const htmlCurrent = `
                <p class="date-time">${cityDateTime}</p>
                <h2 class="city">${cityName}</h2>
                <h1 class="temp">${temperature.toFixed(1)} <sup>${tempSymbol}</sup></h1>
                <p class="feels">Feels Like: ${feels_like.toFixed(1)} <sup>${tempSymbol}</sup></p>
                <img class="icon" src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="weatherIcon">
                <p class="description">${description}</p>
                <p class="humidity">Humidity: ${humidity} <sup>%</sup></p>
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

    /* For loop to iterate through forecast data,
      *  convert date and time to weekdays
      *  and declare the next four days of the week
      *  from the current day.
      * Data is then declared using deconstruction method.
      */
    for (let i = 1; i <= 4; i++) {
      const forecastDate = new Date((forecast[i].dt + data.timezone_offset) * 1000);
      const forecastDay = forecastDate.toLocaleString('en-GB', {
        weekday: 'long'
      });
      const forecastIcon = forecast[i].weather[0].icon;
      const forecastTemp = forecast[i].temp.day.toFixed(1);
      const forecastDescription = forecast[i].weather[0].description;

      // Temperature is queried based on the declared units of measurement.
      let tempSymbol = units === 'imperial' ? '°f' : '°c';

      // HTML is generated based on deconstructed forecast data.
      htmlForecast += `
                <div class="forecast-day">
                    <p class="forecast-date">${forecastDay}</p>
                    <p class="forecast-temp">${forecastTemp} <sup>${tempSymbol}</sup></p>
                    <img class="forecast-icon" src="https://openweathermap.org/img/wn/${forecastIcon}.png" alt="forecastIcon">                    
                    <p class="forecast-description">${forecastDescription}</p>
                </div>`;
    }

    // HTML is displayed on page.
    forecastInfo.innerHTML = htmlForecast;
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

/* Declare variables for modal.
 * Modal code obtained and adapted from the 
 *  W3Schools (https://www.w3schools.com/howto/howto_css_modals.asp) web site.
*/
var modal = document.getElementById("about");
var btn = document.getElementById("aboutBtn");
var span = document.getElementsByClassName("close")[0];

// Event listener to open modal.
btn.onclick = function () {
  modal.style.display = "block";
};

// Event listener to close modal when user clicks close 'x'.
span.onclick = function () {
  modal.style.display = "none";
};

// Event listener to close modal when user clicks outside of modal.
window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};
