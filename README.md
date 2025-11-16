# Weather Now - Weather App

A modern weather application built with HTML, CSS, and JavaScript using the Open-Meteo API (no API key required).

## Overview

Weather Now is a fully functional weather dashboard that displays current weather conditions, hourly forecasts, and 7-day forecasts. The app matches a beautiful modern design with glassmorphism effects and a dark theme.

## Features

- **Search Functionality**: Search for any city in the world with autocomplete suggestions
- **Current Weather**: Temperature, feels like, humidity, wind speed, precipitation
- **Hourly Forecast**: 12-hour forecast with weather conditions and temperatures
- **Daily Forecast**: 7-day forecast with high/low temperatures
- **Unit Switching**: Toggle between:
  - Temperature: Celsius (°C) / Fahrenheit (°F)
  - Wind Speed: km/h / mph
  - Precipitation: Millimeters (mm) / Inches (in)
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Loading States**: Professional loading animation while fetching data
- **Error Handling**: Graceful error messages for failed requests
- **No Results Handling**: User-friendly message when search returns no results

## File Structure

\`\`\`
├── index.html      # HTML structure and markup
├── styles.css      # All CSS styling and animations
├── script.js       # JavaScript functionality and API logic
└── README.md       # Documentation (this file)
\`\`\`

## How to Use

1. Save all three files (`index.html`, `styles.css`, `script.js`) in the same folder
2. Open `index.html` in your web browser
3. Enter a city name in the search box
4. Click "Search" or press Enter to fetch weather data
5. Toggle unit preferences using the "Units" button in the top right
6. View current conditions, hourly forecast, and 7-day forecast

## API Information

This app uses the **Open-Meteo API**, which is:
- ✅ Completely free
- ✅ No API key required
- ✅ No registration needed
- ✅ Open source and privacy-friendly

**API Endpoints Used:**
- `https://geocoding-api.open-meteo.com/v1/search` - City search and geocoding
- `https://api.open-meteo.com/v1/forecast` - Weather forecast data

## Technical Details

### HTML (index.html)
- Semantic HTML5 structure
- Header with logo, title, and units dropdown
- Search bar with autocomplete suggestions
- Multiple UI states: initial, loading, error, no results, and weather display
- Weather cards for current conditions and stats
- Hourly and daily forecast sections
- Responsive grid layouts using Tailwind CSS

### CSS (styles.css)
- Dark gradient background with blue and navy tones
- Glassmorphism design with backdrop blur effects
- Color scheme: Primary blues (#3b5998, #2d4373), Accent orange/yellow
- Smooth transitions and hover effects
- Responsive grid and flexbox layouts
- Custom loading spinner animation
- Mobile-first responsive design
- Smooth dropdown animations

### JavaScript (script.js)
- Fetch weather data from Open-Meteo API using coordinates
- Search cities with autocomplete suggestions from geocoding API
- Unit conversion on the fly (temperature, wind speed, precipitation)
- DOM manipulation and dynamic content rendering
- Comprehensive error handling and state management
- Debounced search input for better performance
- Local timezone handling for accurate time display
- WMO weather code to emoji icon mapping

## Customization

### Change Colors
Edit the CSS variables and color values in `styles.css`:
- Primary gradient: `#3b5998` to `#2d4373`
- Button color: `#6366F1`
- Accent orange: `#FFB800`
- Background gradient: `#0f1729` to `#1a2847`

### Modify Forecast Duration
In `script.js`, change the hourly forecast loop:
\`\`\`javascript
// Currently: 12 hours
for (let i = 0; i < 12; i++) {
    // Change 12 to your desired number
}
\`\`\`

### Add Default City
In `script.js`, add code to auto-load weather on page load:
\`\`\`javascript
window.addEventListener('load', () => {
    selectCity('London', 'England', 'United Kingdom', 51.5074, -0.1278);
});
\`\`\`

## Browser Compatibility

Works on all modern browsers:
- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Features Breakdown

### Search & Autocomplete
- Type at least 2 characters to see suggestions
- Click a suggestion to instantly load that city's weather
- Press Enter or click "Search" to search
- Suggestions show city name, region, and country

### Weather Display
- Large temperature display with current weather icon
- Four stat cards showing: Feels Like, Humidity, Wind Speed, Precipitation
- All values update based on selected units

### Hourly Forecast
- Shows next 12 hours of weather
- Displays time, weather icon, and temperature
- Scrollable if many items

### Daily Forecast
- 7-day weather forecast
- Shows day of week, weather icon, high and low temperatures
- Color-coded temperature display

### Unit System
- All conversions happen instantly
- Active unit is highlighted in the dropdown menu
- Supported units:
  - Temperature: Celsius (°C) to Fahrenheit (°F)
  - Wind: km/h to mph
  - Precipitation: mm to inches

## Error Handling

The app gracefully handles:
- No search results found
- API connection errors
- Invalid city searches
- Network timeouts (shows retry button)

## Performance Considerations

- Debounced search (300ms) to reduce API calls
- Efficient DOM updates only when necessary
- Smooth CSS animations (60fps)
- Optimized images and SVG icons
- Lazy loading suggestions

## License

Free to use and modify for personal and commercial projects.
