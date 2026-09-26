// ==========================================
// URBANPULSE 2.0 - SMART CITY DASHBOARD
// ==========================================

let latitude = null;
let longitude = null;

// ==========================================
// DATE & TIME
// ==========================================

function updateDateTime() {
  const now = new Date();

  document.getElementById("date").textContent = now
    .toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    .toUpperCase();

  document.getElementById("clock").textContent = now.toLocaleTimeString(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    },
  );

  document.getElementById("day").textContent = now.toLocaleDateString("en-IN", {
    weekday: "long",
  });

  document.getElementById("fullDate").textContent = now.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  );
}

updateDateTime();
setInterval(updateDateTime, 1000);

// ==========================================
// WEATHER DESCRIPTION
// ==========================================

function getWeatherDescription(code) {
  const descriptions = {
    0: "Clear Sky",
    1: "Mainly Clear",
    2: "Partly Cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Foggy",
    51: "Light Drizzle",
    53: "Drizzle",
    55: "Heavy Drizzle",
    61: "Light Rain",
    63: "Rain",
    65: "Heavy Rain",
    71: "Light Snow",
    73: "Snow",
    75: "Heavy Snow",
    80: "Rain Showers",
    81: "Rain Showers",
    82: "Heavy Rain Showers",
    95: "Thunderstorm",
    96: "Thunderstorm",
    99: "Thunderstorm",
  };

  return descriptions[code] || "Unknown Weather";
}

// ==========================================
// WEATHER ICON
// ==========================================

function getWeatherIcon(code) {
  if (code === 0) return "☀️";

  if (code === 1 || code === 2) return "🌤️";

  if (code === 3) return "☁️";

  if (code === 45 || code === 48) return "🌫️";

  if (code >= 51 && code <= 67) return "🌧️";

  if (code >= 71 && code <= 77) return "❄️";

  if (code >= 80 && code <= 82) return "🌦️";

  if (code >= 95) return "⛈️";

  return "🌤️";
}

// ==========================================
// LOCATION
// ==========================================

function detectLocation() {
  if (!navigator.geolocation) {
    useDefaultLocation();

    return;
  }

  navigator.geolocation.getCurrentPosition(
    function (position) {
      latitude = position.coords.latitude;

      longitude = position.coords.longitude;

      document.getElementById("locationStatus").textContent =
        "Location detected successfully";

      getCityName(latitude, longitude);

      getWeather(latitude, longitude);
    },

    function () {
      useDefaultLocation();
    },

    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000,
    },
  );
}

// ==========================================
// DEFAULT LOCATION
// ==========================================

function useDefaultLocation() {
  latitude = 11.0168;

  longitude = 76.9558;

  document.getElementById("city").textContent = "Coimbatore";

  document.getElementById("locationStatus").textContent =
    "Using default location";

  getWeather(latitude, longitude);
}

// ==========================================
// CITY NAME
// ==========================================

async function getCityName(lat, lon) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
    );

    const data = await response.json();

    const address = data.address;

    const city =
      address.city ||
      address.town ||
      address.village ||
      address.county ||
      "Current Location";

    document.getElementById("city").textContent = city;
  } catch {
    document.getElementById("city").textContent = "Current Location";
  }
}

// ==========================================
// WEATHER API
// ==========================================

async function getWeather(lat, lon) {
  const weatherStatus = document.getElementById("weatherStatus");

  weatherStatus.textContent = "Fetching live weather...";

  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
      `&timezone=auto`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Weather API error");
    }

    const data = await response.json();

    updateCurrentWeather(data);

    updateForecast(data);

    updateSmartCityData();

    weatherStatus.textContent = "Live weather connected";
  } catch (error) {
    console.log(error);

    weatherStatus.textContent = "Weather service unavailable";
  }
}

// ==========================================
// CURRENT WEATHER
// ==========================================

function updateCurrentWeather(data) {
  const current = data.current;

  document.getElementById("temperature").textContent =
    Math.round(current.temperature_2m) + "°C";

  document.getElementById("humidity").textContent =
    Math.round(current.relative_humidity_2m) + "%";

  document.getElementById("wind").textContent =
    Math.round(current.wind_speed_10m) + " km/h";

  document.getElementById("feels").textContent =
    Math.round(current.apparent_temperature) + "°C";

  document.getElementById("condition").textContent =
    getWeatherIcon(current.weather_code) +
    " " +
    getWeatherDescription(current.weather_code);
}

// ==========================================
// FORECAST
// ==========================================

function updateForecast(data) {
  const daily = data.daily;

  const forecast = document.getElementById("forecast");

  forecast.innerHTML = "";

  const days = Math.min(5, daily.time.length);

  for (let i = 0; i < days; i++) {
    const date = new Date(daily.time[i] + "T00:00:00");

    const dayName =
      i === 0
        ? "Today"
        : date.toLocaleDateString("en-IN", {
            weekday: "short",
          });

    const dateText = date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });

    const maxTemp = Math.round(daily.temperature_2m_max[i]);

    const minTemp = Math.round(daily.temperature_2m_min[i]);

    const weatherCode = daily.weather_code[i];

    const card = document.createElement("div");

    card.className = "forecast-card";

    card.innerHTML = `

      <div class="day">
        ${dayName}
      </div>

      <div class="date-small">
        ${dateText}
      </div>

      <div class="forecast-icon">
        ${getWeatherIcon(weatherCode)}
      </div>

      <div class="forecast-temp">
        ${maxTemp}° / ${minTemp}°
      </div>

      <div class="forecast-condition">
        ${getWeatherDescription(weatherCode)}
      </div>

    `;

    forecast.appendChild(card);
  }
}

// ==========================================
// SMART CITY DATA
// ==========================================

function updateSmartCityData() {
  const now = new Date();

  const hour = now.getHours();

  /*
    These values simulate
    smart-city sensor readings.

    They change according to
    the time of day so the
    dashboard feels realistic.
  */

  let traffic;
  let energy;
  let water;
  let waste;

  // Morning & evening = higher traffic

  if ((hour >= 7 && hour <= 10) || (hour >= 17 && hour <= 20)) {
    traffic = randomNumber(68, 92);
  } else {
    traffic = randomNumber(35, 65);
  }

  // Energy usage

  if (hour >= 6 && hour <= 22) {
    energy = randomNumber(65, 88);
  } else {
    energy = randomNumber(35, 55);
  }

  // Water usage

  water = randomNumber(55, 82);

  // Waste collection progress

  waste = randomNumber(45, 78);

  updateActivity("⚡ Energy", energy);

  updateActivity("💧 Water", water);

  updateActivity("♻ Waste", waste);

  updateActivity("🚲 Mobility", traffic);
}

// ==========================================
// UPDATE ACTIVITY BARS
// ==========================================

function updateActivity(label, value) {
  const elements = document.querySelectorAll(".activity-grid > div");

  elements.forEach(function (element) {
    const span = element.querySelector("span");

    if (!span) {
      return;
    }

    const text = span.textContent;

    if (text.includes(label)) {
      const number = element.querySelector("strong");

      const bar = element.querySelector(".bar div");

      if (number) {
        number.textContent = value + "%";
      }

      if (bar) {
        bar.style.width = value + "%";
      }
    }
  });

  updateCityStatus();
}

// ==========================================
// CITY STATUS
// ==========================================

function updateCityStatus() {
  const values = [];

  document.querySelectorAll(".activity-grid strong").forEach(function (item) {
    const value = parseInt(item.textContent);

    if (!isNaN(value)) {
      values.push(value);
    }
  });

  if (values.length === 0) {
    return;
  }

  const average =
    values.reduce(function (sum, value) {
      return sum + value;
    }, 0) / values.length;

  const statusText = document.querySelector(".status-text");

  if (!statusText) {
    return;
  }

  if (average < 60) {
    statusText.textContent = "City Activity: Normal";
  } else if (average < 75) {
    statusText.textContent = "City Activity: Moderate";
  } else {
    statusText.textContent = "City Activity: High";
  }
}

// ==========================================
// RANDOM NUMBER
// ==========================================

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ==========================================
// REFRESH BUTTON
// ==========================================

document.getElementById("refreshBtn").addEventListener("click", function () {
  if (latitude !== null && longitude !== null) {
    getWeather(latitude, longitude);
  } else {
    detectLocation();
  }
});

// ==========================================
// SIDEBAR
// ==========================================

const navItems = document.querySelectorAll(".nav-item");

navItems.forEach(function (item) {
  item.addEventListener("click", function () {
    navItems.forEach(function (nav) {
      nav.classList.remove("active");
    });

    this.classList.add("active");
  });
});

// ==========================================
// START
// ==========================================

detectLocation();

updateSmartCityData();

// ==========================================
// REFRESH SIMULATED CITY DATA
// EVERY 30 SECONDS
// ==========================================

setInterval(updateSmartCityData, 30000);
