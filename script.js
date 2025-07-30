const apiKey = "e4b21a8643c092fa0b034f4a958ffdfb"; 
const weatherCard = document.getElementById('weather-card');
const form = document.getElementById('search-form');
const input = document.getElementById('location-input');
const geoBtn = document.getElementById('geo-btn');

const fallbackSvg = `<svg class="fallback-svg" viewBox="0 0 68 68" xmlns="http://www.w3.org/2000/svg">
<circle fill="#bcebff" cx="34" cy="34" r="34"/>
<ellipse fill="#fff" cx="42" cy="42" rx="19" ry="15"/>
<ellipse fill="#3dbafe" cx="32" cy="42" rx="18" ry="12"/>
</svg>`;

const icons = {
  temp: `<i class="icon-temp" title="Temperature">🌡️</i>`,
  humid: `<i class="icon-humid" title="Humidity">💧</i>`,
  wind: `<i class="icon-wind" title="Wind speed">🌀</i>`
};

function weatherCardHtml(city, country, icon, mainLabel, desc, temp, humid, wind) {
  return `
    <div class="location-title">${city}, ${country}</div>
    <div class="weather-icons-row">${icon}</div>
    <div class="weather-main">
      <span class="weather-label">${mainLabel}:</span>
      ${desc}
    </div>
    <div class="data-row">${icons.temp} Temp: ${temp}°C</div>
    <div class="data-row">${icons.humid} Humidity: ${humid}%</div>
    <div class="data-row">${icons.wind} Wind: ${wind} m/s</div>
  `;
}

function buildIcon(imgCode, alt) {
  const img = document.createElement("img");
  img.src = `https://openweathermap.org/img/wn/${imgCode}@2x.png`;
  img.className = "weather-bigicon";
  img.alt = alt;
  img.onerror = function () {
    this.style.display = "none";
    const wrapper = document.createElement("div");
    wrapper.innerHTML = fallbackSvg;
    this.parentNode.insertBefore(wrapper.firstChild, this.nextSibling);
  };
  return img.outerHTML;
}

function displayWeather(data) {
  if (data && data.weather) {
    weatherCard.innerHTML = weatherCardHtml(
      data.name,
      data.sys.country,
      buildIcon(data.weather[0].icon, data.weather[0].main),
      capitalize(data.weather[0].main),
      data.weather[0].description,
      Math.round(data.main.temp),
      data.main.humidity,
      data.wind.speed
    );
  } else {
    displayError("Could not retrieve weather data.", null);
  }
}

function displayError(message, cityName = null) {
  weatherCard.innerHTML = `
    <div class="location-title">${cityName ? cityName : 'N/A'}</div>
    <div class="weather-icons-row">${fallbackSvg}</div>
    <div class="error-message">${message}</div>
  `;
}

function fetchWeatherByCoords(lat, lon) {
  weatherCard.innerHTML = "Loading...";
  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
    .then(resp => resp.json())
    .then(data => {
      if (data.cod === 200) displayWeather(data);
      else displayError(data.message || "Could not get weather.", "Your location");
    })
    .catch(() => displayError("Error reaching weather API.", "Your location"));
}

function fetchWeatherByCity(city) {
  weatherCard.innerHTML = "Loading...";
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`)
    .then(resp => resp.json())
    .then(data => {
      if (data.cod === 200) displayWeather(data);
      else displayError(data.message || "City not found.", city);
    })
    .catch(() => displayError("Error reaching weather API.", city));
}

form.onsubmit = function (e) {
  e.preventDefault();
  const city = input.value.trim();
  if (city) {
    fetchWeatherByCity(city);
  } else {
    displayError("Please enter a city name.", null);
  }
};

geoBtn.onclick = function () {
  weatherCard.innerHTML = "Getting your location...";
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        fetchWeatherByCoords(latitude, longitude);
      },
      err => {
        displayError("Location permission denied or unavailable.", "Your location");
      }
    );
  } else {
    displayError("Geolocation is not supported by your browser.", "Your location");
  }
};

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}
