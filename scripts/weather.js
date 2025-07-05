// In the future: fetch data from APIs and update metrics dynamically
const API_KEY = '6a7809beecb506801c00e956de39ded6'; // Replace this with your actual OpenWeatherMap API key
const LAT = 40.0428;
const LON = -86.1277;

async function fetchWeatherAndAirQuality() {
  try {
    const weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&units=imperial&appid=${API_KEY}`);
    const weatherData = await weatherRes.json();

    const aqiRes = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${LAT}&lon=${LON}&appid=${API_KEY}`);
    const aqiData = await aqiRes.json();

    // 🔍 Log to the browser console
    console.log("🌤️ Weather Data:", weatherData);
    console.log("🌫️ Air Quality Data:", aqiData);

    // 🧱 Inject into the page
    const weatherEl = document.createElement("section");
    weatherEl.className = "highlight";
    weatherEl.innerHTML = `
      <h2>🌤️ Current Weather in Westfield</h2>
      <p><strong>${weatherData.main.temp}°F</strong>, ${weatherData.weather[0].description}</p>
      <p>Humidity: ${weatherData.main.humidity}% | Wind: ${weatherData.wind.speed} mph</p>
      <p>Air Quality Index (AQI): ${aqiData.list[0].main.aqi} (1 = Good, 5 = Very Poor)</p>
    `;

    document.querySelector("main").prepend(weatherEl);
  } catch (error) {
    console.error("❌ Error fetching data:", error);
  }
}

export { fetchWeatherAndAirQuality };
