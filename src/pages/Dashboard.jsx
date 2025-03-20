import React from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Droplets, ThermometerSun, Wind, AlertTriangle } from 'lucide-react';
import { fetchWeatherData, fetchMarketData, fetchSoilData, fetchDiseaseAlerts } from '../utils/api';
import DashboardCard from '../components/DashboardCard';

const queryClient = new QueryClient();

const DashboardContent = () => {
  const { data: weatherData } = useQuery({
    queryKey: ['weather'],
    queryFn: () => fetchWeatherData(12.9716, 77.5946), // Example coordinates
    refetchInterval: 1800000 // 30 minutes
  });

  const { data: marketData } = useQuery({
    queryKey: ['market'],
    queryFn: fetchMarketData,
    refetchInterval: 300000 // 5 minutes
  });

  const { data: soilData } = useQuery({
    queryKey: ['soil'],
    queryFn: fetchSoilData,
    refetchInterval: 900000 // 15 minutes
  });

  const { data: diseaseData } = useQuery({
    queryKey: ['disease'],
    queryFn: fetchDiseaseAlerts,
    refetchInterval: 3600000 // 1 hour
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Agricultural Dashboard</h1>
        <p className="text-gray-600">Real-time farming insights</p>
      </div>

      {/* Weather Alert */}
      {weatherData?.alerts && (
        <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-400 mr-3" />
            <p className="text-yellow-700">{weatherData.alerts[0].description}</p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard
          icon={Droplets}
          title="Soil Moisture"
          value={`${soilData?.moisture || 0}%`}
          trend={soilData?.trend}
          subtitle="Optimal range: 60-85%"
          bgColor="bg-blue-50 text-blue-500"
        />

        <DashboardCard
          icon={ThermometerSun}
          title="Temperature"
          value={`${weatherData?.main?.temp?.toFixed(1) || 0}°C`}
          trend={`${weatherData?.main?.temp_trend || '+0'}°C`}
          subtitle={`Feels like: ${weatherData?.main?.feels_like?.toFixed(1) || 0}°C`}
          bgColor="bg-orange-50 text-orange-500"
        />

        <DashboardCard
          icon={Wind}
          title="Wind Speed"
          value={`${weatherData?.wind?.speed || 0} km/h`}
          subtitle={`Direction: ${weatherData?.wind?.deg || 0}°`}
          bgColor="bg-green-50 text-green-500"
        />

        <DashboardCard
          icon={AlertTriangle}
          title="Disease Alerts"
          value={diseaseData?.riskLevel || 'Low Risk'}
          trend={`${diseaseData?.activeAlerts || 0} Active`}
          subtitle={diseaseData?.recommendation}
          bgColor="bg-purple-50 text-purple-500"
        />
      </div>

      {/* Market Trends */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Crop Price Trends</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={marketData?.prices || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="rice" stroke="#10B981" strokeWidth={2} />
              <Line type="monotone" dataKey="wheat" stroke="#6366F1" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <DashboardContent />
    </QueryClientProvider>
  );
};

export default Dashboard;