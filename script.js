// ==================== API CONFIGURATION ====================
const API_BASE = 'https://api.open-meteo.com/v1/forecast';
const GEOCODING_API = 'https://geocoding-api.open-meteo.com/v1/search';

// ==================== STATE MANAGEMENT ====================
let units = {
    temp: 'C',
    wind: 'kmh',
    precip: 'mm'
};

let currentWeatherData = null;
let currentCoordinates = null;

// ==================== DOM ELEMENTS ====================
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const suggestions = document.getElementById('suggestions');
const unitsBtn = document.getElementById('unitsBtn');
const unitsDropdown = document.getElementById('unitsDropdown');
const retryBtn = document.getElementById('retryBtn');

// State Elements
const initialState = document.getElementById('initialState');
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const noResultsState = document.getElementById('noResultsState');
const weatherState = document.getElementById('weatherState');

// ==================== EVENT LISTENERS ====================
searchInput.addEventListener('input', debounce(handleSearch, 300));
searchBtn.addEventListener('click', searchCity);
searchInput.addEventListener('keypress', (e) => e.key === 'Enter' && searchCity());
unitsBtn.addEventListener('click', toggleUnitsDropdown);
retryBtn.addEventListener('click', searchCity);

// Units Dropdown - Temperature
document.querySelectorAll('.dropdown-item[data-temp]').forEach(item => {
    item.addEventListener('click', () => {
        document.querySelectorAll('.dropdown-item[data-temp]').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        units.temp = item.dataset.temp;
        if (currentWeatherData) updateDisplay();
    });
});

// Units Dropdown - Wind Speed
document.querySelectorAll('.dropdown-item[data-wind]').forEach(item => {
    item.addEventListener('click', () => {
        document.querySelectorAll('.dropdown-item[data-wind]').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        units.wind = item.dataset.wind;
        if (currentWeatherData) updateDisplay();
    });
});

// Units Dropdown - Precipitation
document.querySelectorAll('.dropdown-item[data-precip]').forEach(item => {
    item.addEventListener('click', () => {
        document.querySelectorAll('.dropdown-item[data-precip]').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        units.precip = item.dataset.precip;
        if (currentWeatherData) updateDisplay();
    });
});

// Click outside to close suggestions
document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !suggestions.contains(e.target)) {
        suggestions.classList.add('hidden');
    }
});

// ==================== UTILITY FUNCTIONS ====================
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

function toggleUnitsDropdown() {
    unitsDropdown.classList.toggle('hidden');
    document.addEventListener('click', closeUnitsDropdown);
}

function closeUnitsDropdown(e) {
    if (!unitsBtn.contains(e.target) && !unitsDropdown.contains(e.target)) {
        unitsDropdown.classList.add('hidden');
        document.removeEventListener('click', closeUnitsDropdown);
    }
}

// Get weather icon based on WMO code
function getWeatherIcon(code) {
    if (!code) return '❓';
    
    if (code === 0 || code === 1) return '☀️'; // Clear sky
    if (code === 2) return '⛅'; // Partly cloudy
    if (code === 3) return '☁️'; // Overcast
    if (code === 45 || code === 48) return '🌫️'; // Foggy
    if (code === 51 || code === 53 || code === 55) return '🌧️'; // Drizzle
    if (code === 61 || code === 63 || code === 65) return '🌧️'; // Rain
    if (code === 71 || code === 73 || code === 75) return '❄️'; // Snow
    if (code === 80 || code === 81 || code === 82) return '🌧️'; // Rain showers
    if (code === 85 || code === 86) return '❄️'; // Snow showers
    if (code === 95 || code === 96 || code === 99) return '⛈️'; // Thunderstorm
    
    return '❓';
}

// ==================== SEARCH FUNCTIONS ====================
async function handleSearch(e) {
    const query = e.target.value.trim();
    if (query.length < 2) {
        suggestions.classList.add('hidden');
        return;
    }

    try {
        const response = await fetch(`${GEOCODING_API}?name=${encodeURIComponent(query)}&count=5&language=en&format=json`);
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            suggestions.innerHTML = data.results.map(city => `
                <div class="dropdown-item cursor-pointer" onclick="selectCity('${city.name}', '${city.admin1 || ''}', '${city.country}', ${city.latitude}, ${city.longitude})">
                    <div class="font-semibold">${city.name}</div>
                    <div class="text-xs text-gray-400">${city.admin1 ? city.admin1 + ', ' : ''}${city.country}</div>
                </div>
            `).join('');
            suggestions.classList.remove('hidden');
        } else {
            suggestions.classList.add('hidden');
        }
    } catch (error) {
        console.error('Search error:', error);
        suggestions.classList.add('hidden');
    }
}

function selectCity(name, admin, country, lat, lon) {
    searchInput.value = `${name}, ${country}`;
    suggestions.classList.add('hidden');
    currentCoordinates = { name, admin, country, latitude: lat, longitude: lon };
    fetchWeather(lat, lon, name, admin, country);
}

function searchCity() {
    const query = searchInput.value.trim();
    if (!query) return;

    showLoading();
    searchByCityName(query);
}

async function searchByCityName(query) {
    try {
        const response = await fetch(`${GEOCODING_API}?name=${encodeURIComponent(query)}&count=1&language=en&format=json`);
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            const city = data.results[0];
            currentCoordinates = {
                name: city.name,
                admin: city.admin1 || '',
                country: city.country,
                latitude: city.latitude,
                longitude: city.longitude
            };
            fetchWeather(city.latitude, city.longitude, city.name, city.admin1 || '', city.country);
        } else {
            showNoResults();
        }
    } catch (error) {
        showError();
    }
}

// ==================== WEATHER API FUNCTIONS ====================
async function fetchWeather(lat, lon, cityName, admin, country) {
    try {
        const params = new URLSearchParams({
            latitude: lat,
            longitude: lon,
            current: 'temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m,apparent_temperature,precipitation',
            hourly: 'temperature_2m,weather_code,precipitation_probability',
            daily: 'weather_code,temperature_2m_max,temperature_2m_min',
            timezone: 'auto',
            temperature_unit: units.temp === 'F' ? 'fahrenheit' : 'celsius',
            wind_speed_unit: units.wind === 'mph' ? 'mph' : 'kmh',
            precipitation_unit: units.precip === 'in' ? 'inch' : 'mm'
        });

        const response = await fetch(`${API_BASE}?${params}`);
        const data = await response.json();

        currentWeatherData = {
            ...data,
            cityName: `${cityName}, ${country}`,
            admin,
            country
        };

        updateDisplay();
    } catch (error) {
        console.error('Fetch weather error:', error);
        showError();
    }
}

// ==================== DISPLAY FUNCTIONS ====================
function updateDisplay() {
    if (!currentWeatherData) return;

    const { current, hourly, daily, timezone, cityName } = currentWeatherData;
    const now = new Date().toLocaleString('en-US', { timeZone: timezone });

    // Update current weather
    document.getElementById('cityName').textContent = cityName;
    document.getElementById('dateTime').textContent = new Date(now).toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    });
    document.getElementById('tempDisplay').textContent = `${Math.round(current.temperature_2m)}°`;
    document.getElementById('feelsLike').textContent = `${Math.round(current.apparent_temperature)}°`;
    document.getElementById('humidity').textContent = `${current.relative_humidity_2m}%`;
    document.getElementById('wind').textContent = `${Math.round(current.wind_speed_10m)} ${units.wind === 'mph' ? 'mph' : 'km/h'}`;
    document.getElementById('precipitation').textContent = `${current.precipitation} ${units.precip === 'in' ? 'in' : 'mm'}`;
    document.getElementById('weatherIcon').textContent = getWeatherIcon(current.weather_code);

    // Update hourly and daily forecast
    updateHourlyForecast(hourly, timezone);
    updateDailyForecast(daily);

    showWeather();
}

function updateHourlyForecast(hourly, timezone) {
    const now = new Date();
    const currentHour = now.getHours();

    const hourlyContainer = document.getElementById('hourlyForecast');
    hourlyContainer.innerHTML = '';

    for (let i = 0; i < 12; i++) {
        const index = currentHour + i;
        if (index < hourly.time.length) {
            const time = new Date(hourly.time[index]);
            const displayTime = time.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit', 
                timeZone: timezone 
            });
            const temp = hourly.temperature_2m[index];
            const icon = getWeatherIcon(hourly.weather_code[index]);

            hourlyContainer.innerHTML += `
                <div class="hourly-item">
                    <span>${displayTime}</span>
                    <span>${icon}</span>
                    <span>${Math.round(temp)}°</span>
                </div>
            `;
        }
    }
}

function updateDailyForecast(daily) {
    const dailyContainer = document.getElementById('dailyForecast');
    dailyContainer.innerHTML = '';

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 0; i < 7; i++) {
        const date = new Date(daily.time[i]);
        const dayName = dayNames[date.getDay()];
        const high = Math.round(daily.temperature_2m_max[i]);
        const low = Math.round(daily.temperature_2m_min[i]);
        const icon = getWeatherIcon(daily.weather_code[i]);

        dailyContainer.innerHTML += `
            <div class="forecast-day">
                <p class="font-semibold mb-2">${dayName}</p>
                <p class="text-2xl mb-2">${icon}</p>
                <div class="flex justify-center gap-2 text-sm">
                    <span>${high}°</span>
                    <span class="text-gray-400">${low}°</span>
                </div>
            </div>
        `;
    }
}

// ==================== UI STATE MANAGEMENT ====================
function showLoading() {
    initialState.classList.add('hidden');
    errorState.classList.add('hidden');
    noResultsState.classList.add('hidden');
    weatherState.classList.add('hidden');
    loadingState.classList.remove('hidden');
}

function showWeather() {
    initialState.classList.add('hidden');
    loadingState.classList.add('hidden');
    errorState.classList.add('hidden');
    noResultsState.classList.add('hidden');
    weatherState.classList.remove('hidden');
}

function showError() {
    initialState.classList.add('hidden');
    loadingState.classList.add('hidden');
    noResultsState.classList.add('hidden');
    weatherState.classList.add('hidden');
    errorState.classList.remove('hidden');
}

function showNoResults() {
    initialState.classList.add('hidden');
    loadingState.classList.add('hidden');
    errorState.classList.add('hidden');
    weatherState.classList.add('hidden');
    noResultsState.classList.remove('hidden');
}
