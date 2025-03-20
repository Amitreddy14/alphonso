import { WEATHER_API_KEY, WEATHER_BASE_URL } from '../config';

export const fetchWeatherData = async (lat, lon) => {
  try {
    const response = await fetch(
      `${WEATHER_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`
    );
    if (!response.ok) throw new Error('Weather data fetch failed');
    return response.json();
  } catch (error) {
    console.error('Weather fetch error:', error);
    return null;
  }
};

export const fetchMarketData = async () => {
  // Simulated market data - replace with actual API
  return {
    prices: [
      { date: 'Jan', rice: 2100, wheat: 1800 },
      { date: 'Feb', rice: 2300, wheat: 1900 },
      { date: 'Mar', rice: 2200, wheat: 2000 },
      { date: 'Apr', rice: 2400, wheat: 2100 },
      { date: 'May', rice: 2600, wheat: 2300 },
      { date: 'Jun', rice: 2800, wheat: 2400 },
    ]
  };
};

export const fetchSoilData = async () => {
  // Simulated soil data - replace with actual API
  return {
    moisture: 75,
    trend: '+2.5%',
    recommendation: 'Optimal moisture levels'
  };
};

export const fetchDiseaseAlerts = async () => {
  // Simulated disease data - replace with actual API
  return {
    activeAlerts: 2,
    riskLevel: 'Low Risk',
    recommendation: 'Monitor crop health'
  };
};