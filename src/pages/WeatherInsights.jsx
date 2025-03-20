import { useState, useEffect } from 'react';
import { BsCloud, BsDroplet, BsWind, BsThermometer, BsSun, BsCloudRain, BsCloudSun, BsCalendar, BsExclamationTriangle } from 'react-icons/bs';
import { WEATHER_API_KEY, WEATHER_BASE_URL } from '../config';

function WeatherInsights() {
  const [weatherData, setWeatherData] = useState({
    temperature: null,
    humidity: null,
    windSpeed: null,
    uvIndex: null,
    soilMoisture: null,
    precipitation: null,
    alerts: []
  });

  const [forecast, setForecast] = useState([]);
  const [farmingCalendar] = useState([
    { date: '2025-03-15', activities: [{ type: 'Irrigation', time: 'Early Morning', priority: 'High' }, { type: 'Fertilization', time: 'Afternoon', priority: 'Medium' }] },
    { date: '2025-03-16', activities: [{ type: 'Pest Control', time: 'Morning', priority: 'High' }, { type: 'Harvesting', time: 'Late Afternoon', priority: 'Medium' }] }
  ]);

  const [cropRecommendations] = useState([
    { category: 'Irrigation', recommendations: ['Consider early morning irrigation to minimize water loss', 'Adjust irrigation schedule based on soil moisture levels', 'Monitor water requirements for different growth stages'] },
    { category: 'Crop Protection', recommendations: ['Apply preventive fungicide before forecasted rain', 'Install temporary shade structures for sensitive crops', 'Ensure proper drainage to prevent waterlogging'] },
    { category: 'Resource Management', recommendations: ['Optimize water usage during peak temperature hours', 'Plan harvesting activities around weather conditions', 'Prepare contingency measures for extreme weather'] }
  ]);

  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:5000'); // Match backend PORT

    ws.onopen = () => console.log('WebSocket connected for soil moisture');
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'soilMoisture') {
        setWeatherData((prev) => ({
          ...prev,
          soilMoisture: data.value,
          alerts: prev.alerts.filter(a => a.type !== 'Soil Moisture')
          .concat(
            data.value < 20 
              ? [{ type: 'Soil Moisture', message: 'Soil is too dry, consider irrigation', severity: 'warning' }]
              : data.value > 80 
              ? [{ type: 'Soil Moisture', message: 'Soil is too wet, risk of overwatering', severity: 'alert' }]
              : data.value > 60 
              ? [{ type: 'Soil Moisture', message: 'Soil is quite moist, monitor irrigation', severity: 'notice' }]
              : [{ type: 'Soil Moisture', message: 'Soil moisture is optimal', severity: 'warning' }]
          )
          }));
      }
    };
    ws.onerror = (err) => console.error('WebSocket error:', err);
    ws.onclose = () => console.log('WebSocket disconnected');

    return () => ws.close();
  }, []);

  const parseCurrentWeatherResponse = (data) => {
    try {
      console.log('Raw current weather response:', data);
      const temperature = Math.round(data.main.temp - 273.15);
      const humidity = data.main.humidity;
      const windSpeed = Math.round(data.wind.speed * 3.6);
      const precipitation = data.rain && data.rain['1h'] ? data.rain['1h'] : 0;
      const uvIndex = null;
      const alerts = [];
      if (temperature < 30 && temperature >= 20)  
        alerts.push({ type: 'Optimal Temperature', message: 'Ideal temperature for crop growth', severity: 'warning' });
      
      if (temperature < 20 && temperature >= 15)  
        alerts.push({ type: 'Cool Temperature', message: 'Monitor for slow plant growth in some crops', severity: 'info' });
      
      if (temperature < 15 && temperature >= 10)  
        alerts.push({ type: 'Cold Stress Risk', message: 'Consider protecting temperature-sensitive crops', severity: 'warning' });
      
      if (temperature < 10 && temperature >= 5)  
        alerts.push({ type: 'Low Temperature', message: 'Crop growth may slow down, frost risk increases', severity: 'critical' });
      
      if (temperature < 5 && temperature >= 0)  
        alerts.push({ type: 'Frost Alert', message: 'Cover crops or use heating methods to prevent frost damage', severity: 'critical' });
      
      if (temperature < 0)  
        alerts.push({ type: 'Freezing Conditions', message: 'Extreme cold! Crops may suffer severe damage', severity: 'danger' });
      
      if (precipitation > 10) alerts.push({ type: 'Heavy Rainfall', message: 'Heavy rainfall expected, ensure proper drainage', severity: 'alert' });
      return { temperature, humidity, windSpeed, precipitation, uvIndex, alerts };
    } catch (error) {
      console.error('Error parsing current weather response:', error);
      return { temperature: null, humidity: null, windSpeed: null, precipitation: null, uvIndex: null, alerts: [] };
    }
  };

  const parseForecastResponse = (data) => {
    try {
      console.log('Raw forecast response:', data);
      const dailyForecast = [];
      const days = {};

      data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dayKey = date.toLocaleDateString('en-US', { weekday: 'short' });
        if (!days[dayKey]) days[dayKey] = [];
        days[dayKey].push(item);
      });

      Object.keys(days).forEach((day, index) => {
        if (index < 5) {
          const midday = days[day].find(item => new Date(item.dt * 1000).getHours() === 12) || days[day][0];
          const temp = Math.round(midday.main.temp - 273.15);
          const humidity = midday.main.humidity;
          const windSpeed = Math.round(midday.wind.speed * 3.6);
          const precipitation = midday.rain && midday.rain['3h'] ? midday.rain['3h'] : 0;
          const condition = midday.weather[0].main;
          const icon = condition === 'Rain' ? BsCloudRain : condition === 'Clouds' ? BsCloud : BsCloudSun;

          dailyForecast.push({
            date: day,
            temperature: temp,
            condition,
            humidity,
            windSpeed,
            precipitation,
            icon
          });
        }
      });

      console.log('Parsed forecast:', dailyForecast);
      return dailyForecast;
    } catch (error) {
      console.error('Error parsing forecast response:', error);
      return [];
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      console.log('Requesting geolocation...');
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`
            );
            const data = await response.json();
            console.log('Geolocation response:', data);
            setLocation(data.city || data.locality || 'Unknown Location');
            setError(null);
          } catch (err) {
            console.error('Geolocation fetch error:', err);
            setError('Error getting location details');
            setLocation('New Delhi');
          }
        },
        (err) => {
          console.error('Geolocation denied:', err);
          setError('Please enable location access to get weather insights');
          setLocation('New Delhi');
        }
      );
    } else {
      console.error('Geolocation not supported');
      setError('Geolocation is not supported by your browser');
      setLocation('New Delhi');
    }
  };

  const fetchWeatherData = async (location) => {
    try {
      setLoading(true);
      console.log('Fetching weather data for:', location);

      const currentResponse = await fetch(
        `${WEATHER_BASE_URL}/weather?q=${encodeURIComponent(location)}&appid=${WEATHER_API_KEY}`
      );
      if (!currentResponse.ok) throw new Error(`Current weather fetch failed: ${currentResponse.status}`);
      const currentData = await currentResponse.json();
      const parsedCurrentWeather = parseCurrentWeatherResponse(currentData);

      const forecastResponse = await fetch(
        `${WEATHER_BASE_URL}/forecast?q=${encodeURIComponent(location)}&appid=${WEATHER_API_KEY}`
      );
      if (!forecastResponse.ok) throw new Error(`Forecast fetch failed: ${currentResponse.status}`);
      const forecastData = await forecastResponse.json();
      const parsedForecast = parseForecastResponse(forecastData);

      setWeatherData((prev) => ({ ...parsedCurrentWeather, soilMoisture: prev.soilMoisture }));
      setForecast(parsedForecast);
      setError(null);
    } catch (err) {
      console.error('Weather data fetch error:', err);
      setError(`Error fetching weather data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Fetching user location...');
    getUserLocation();
  }, []);

  useEffect(() => {
    if (location) {
      console.log('Location set, fetching weather data for:', location);
      fetchWeatherData(location);
    }
  }, [location]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-lg">
        <div className="flex">
          <BsExclamationTriangle className="h-5 w-5 text-red-400" />
          <p className="ml-3 text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Weather Insights for {location}</h2>
        <div className="text-sm text-gray-500">Last updated: {new Date().toLocaleString()}</div>
      </div>
      {weatherData.alerts && weatherData.alerts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {weatherData.alerts.map((alert, index) => (
            <div key={index} className={`p-4 rounded-lg border-l-4 ${alert.severity === 'warning' ? 'bg-yellow-50 border-yellow-400' : 'bg-red-50 border-red-500'}`}>
              <div className="flex">
                <BsExclamationTriangle className={`h-5 w-5 ${alert.severity === 'warning' ? 'text-yellow-400' : 'text-red-500'}`} />
                <div className="ml-3">
                  <h3 className={`text-sm font-medium ${alert.severity === 'warning' ? 'text-yellow-800' : 'text-red-800'}`}>{alert.type}</h3>
                  <p className={`mt-1 text-sm ${alert.severity === 'warning' ? 'text-yellow-700' : 'text-red-700'}`}>{alert.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <div className="flex items-center p-4 bg-blue-50 rounded-lg">
            <div className="p-3 bg-blue-100 rounded-full"><BsThermometer className="h-6 w-6 text-blue-600" /></div>
            <div className="ml-4"><p className="text-sm font-medium text-gray-600">Temperature</p><p className="text-xl font-bold text-blue-600">{weatherData.temperature}°C</p></div>
          </div>
          <div className="flex items-center p-4 bg-green-50 rounded-lg">
            <div className="p-3 bg-green-100 rounded-full"><BsDroplet className="h-6 w-6 text-green-600" /></div>
            <div className="ml-4"><p className="text-sm font-medium text-gray-600">Humidity</p><p className="text-xl font-bold text-green-600">{weatherData.humidity}%</p></div>
          </div>
          <div className="flex items-center p-4 bg-purple-50 rounded-lg">
            <div className="p-3 bg-purple-100 rounded-full"><BsWind className="h-6 w-6 text-purple-600" /></div>
            <div className="ml-4"><p className="text-sm font-medium text-gray-600">Wind Speed</p><p className="text-xl font-bold text-purple-600">{weatherData.windSpeed} km/h</p></div>
          </div>
          {/* <div className="flex items-center p-4 bg-yellow-50 rounded-lg">
            <div className="p-3 bg-yellow-100 rounded-full"><BsSun className="h-6 w-6 text-yellow-600" /></div>
            <div className="ml-4"><p className="text-sm font-medium text-gray-600">UV Index</p><p className="text-xl font-bold text-yellow-600">{weatherData.uvIndex || 'N/A'}</p></div>
          </div> */}
          <div className="flex items-center p-4 bg-teal-50 rounded-lg">
            <div className="p-3 bg-teal-100 rounded-full"><BsDroplet className="h-6 w-6 text-teal-600" /></div>
            <div className="ml-4"><p className="text-sm font-medium text-gray-600">Soil Moisture</p><p className="text-xl font-bold text-teal-600">{weatherData.soilMoisture !== null ? `${weatherData.soilMoisture}%` : 'Loading...'}</p></div>
          </div>
          <div className="flex items-center p-4 bg-indigo-50 rounded-lg">
            <div className="p-3 bg-indigo-100 rounded-full"><BsCloudRain className="h-6 w-6 text-indigo-600" /></div>
            <div className="ml-4"><p className="text-sm font-medium text-gray-600">Precipitation</p><p className="text-xl font-bold text-indigo-600">{weatherData.precipitation} mm</p></div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">5-Day Forecast</h3>
            <div className="grid grid-cols-5 gap-4">
              {forecast.map((day, index) => (
                <div key={index} className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <p className="text-sm font-semibold text-gray-700">{day.date}</p>
                  <day.icon className="h-8 w-8 mx-auto my-3 text-blue-600" />
                  <p className="text-lg font-bold text-gray-900">{day.temperature}°C</p>
                  <div className="mt-2 space-y-1 text-xs text-gray-600">
                    <p>Humidity: {day.humidity}%</p>
                    <p>Wind: {day.windSpeed} km/h</p>
                    <p>Rain: {day.precipitation} mm</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Farming Calendar</h3>
          <div className="space-y-4">
            {farmingCalendar.map((day, dayIndex) => (
              <div key={dayIndex} className="border-b border-gray-200 pb-4 last:border-0">
                <div className="flex items-center mb-2">
                  <BsCalendar className="h-5 w-5 text-primary-600 mr-2" />
                  <span className="text-sm font-medium text-gray-900">{day.date}</span>
                </div>
                <div className="space-y-2">
                  {day.activities.map((activity, actIndex) => (
                    <div key={actIndex} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{activity.type}</p>
                        <p className="text-xs text-gray-600">{activity.time}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${activity.priority === 'High' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {activity.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Weather-Based Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cropRecommendations.map((category, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">{category.category}</h4>
              <ul className="space-y-2">
                {category.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start">
                    <BsCloud className="h-5 w-5 text-primary-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-600">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default WeatherInsights;