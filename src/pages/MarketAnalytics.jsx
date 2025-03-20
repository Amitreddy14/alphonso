import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { BsArrowUp, BsArrowDown, BsNewspaper, BsBell, BsGraphUp, BsCashStack, BsGlobe } from 'react-icons/bs';
import ErrorBoundary from "../components/ErrorBoundary";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Realistic crop price data for India (₹/quintal) based on March 2025 trends
const cropData = {
  rice: {
    actualPrices: [2500, 2520, 2550, 2580, 2600, 2650, 2700, 2750, 2800, 2850, 2900, 2950],
    predictedPrices: [2950, 2980, 3000, 3050, 3100, 3150, 3200, 3250, 3300, 3350, 3400, 3450],
    volatility: 'Medium',
    confidenceScore: 85,
    marketSentiment: 'Bullish',
    tradingVolume: '25,000 tons',
    priceChange: '+5.4%',
    predictedTrend: 'Upward',
    recommendations: [
      'Hold stocks until mid-2025 for potential export-driven gains',
      'Monitor India’s rice export policies closely',
      'Invest in high-quality varieties to tap premium markets'
    ],
    priceAlerts: [
      { type: 'Export Boost', message: 'Increased demand from Southeast Asia expected in Q2 2025', confidence: 87, timestamp: '2025-03-07T09:00:00Z' },
      { type: 'Weather Risk', message: 'Monsoon variability may impact next harvest', confidence: 80, timestamp: '2025-03-05T14:30:00Z' }
    ]
  },
  wheat: {
    actualPrices: [2400, 2380, 2420, 2450, 2500, 2550, 2600, 2650, 2700, 2750, 2800, 2850],
    predictedPrices: [2850, 2870, 2900, 2930, 2970, 3000, 3050, 3100, 3150, 3200, 3250, 3300],
    volatility: 'Medium',
    confidenceScore: 80,
    marketSentiment: 'Neutral to Bullish',
    tradingVolume: '30,000 tons',
    priceChange: '+3.5%',
    predictedTrend: 'Stable with slight upward bias',
    recommendations: [
      'Consider forward contracts to lock in current prices',
      'Watch global supply forecasts, especially from Russia and Ukraine',
      'Store wheat for 2-3 months if possible for better returns'
    ],
    priceAlerts: [
      { type: 'Global Supply', message: 'Russian export slowdown may lift prices in late 2025', confidence: 90, timestamp: '2025-03-08T12:00:00Z' },
      { type: 'Domestic Demand', message: 'Stable demand from flour mills expected', confidence: 83, timestamp: '2025-03-06T10:15:00Z' }
    ]
  },
  soybean: {
    actualPrices: [4200, 4250, 4300, 4350, 4400, 4450, 4500, 4550, 4600, 4650, 4700, 4750],
    predictedPrices: [4750, 4780, 4820, 4860, 4900, 4950, 5000, 5050, 5100, 5150, 5200, 5250],
    volatility: 'Medium',
    confidenceScore: 82,
    marketSentiment: 'Neutral to Bullish',
    tradingVolume: '40,000 tons',
    priceChange: '+2.8%',
    predictedTrend: 'Slight Upward',
    recommendations: [
      'Hold soybean stocks until mid-2025 for potential price recovery',
      'Monitor global soybean production, especially Brazil and Argentina',
      'Consider forward contracts to hedge against price drops'
    ],
    priceAlerts: [
      { type: 'Global Supply', message: 'Brazil’s record production may pressure prices in Q2 2025', confidence: 88, timestamp: '2025-03-08T10:00:00Z' },
      { type: 'Domestic Demand', message: 'Stable demand from oil mills expected', confidence: 85, timestamp: '2025-03-06T13:45:00Z' }
    ]
  },
  peas: {
    actualPrices: [3000, 3050, 3100, 3150, 3200, 3250, 3300, 3350, 3400, 3450, 3500, 3550],
    predictedPrices: [3550, 3580, 3600, 3630, 3660, 3700, 3750, 3800, 3850, 3900, 3950, 4000],
    volatility: 'Low',
    confidenceScore: 87,
    marketSentiment: 'Bullish',
    tradingVolume: '20,000 tons',
    priceChange: '+4.0%',
    predictedTrend: 'Upward',
    recommendations: [
      'Store peas for 3-4 months to capitalize on seasonal demand',
      'Monitor import trends from Canada and Russia',
      'Target premium markets with high-quality peas'
    ],
    priceAlerts: [
      { type: 'Domestic Supply', message: 'Strong harvest expected to stabilize supply in Q2 2025', confidence: 89, timestamp: '2025-03-07T12:00:00Z' },
      { type: 'Export Opportunity', message: 'Rising demand from Middle East markets anticipated', confidence: 84, timestamp: '2025-03-05T16:00:00Z' }
    ]
  }
};

// Static fallback news data in case API fails
const fallbackNews = [
  {
    title: "Wheat Farmers Face Heat Wave Challenges in India",
    description: "A recent heat wave has raised concerns for wheat yields in northern India, potentially impacting prices in Q2 2025.",
    source: "economictimes.indiatimes.com",
    link: "https://economictimes.indiatimes.com",
    publishedAt: "March 1, 2025"
  },
  {
    title: "Soybean Yields Boosted by New Technology",
    description: "Innovative farming techniques in Madhya Pradesh are increasing soybean production, offering hope for price recovery.",
    source: "farmonaut.com",
    link: "https://farmonaut.com",
    publishedAt: "February 28, 2025"
  },
  {
    title: "Rice Exports Surge After Policy Relaxation",
    description: "India’s rice exports are gaining momentum following the removal of curbs, boosting farmer incomes.",
    source: "business-standard.com",
    link: "https://business-standard.com",
    publishedAt: "March 7, 2025"
  }
];

// Adjust data based on timeRange
const getTimeRangeData = (cropName, timeRange) => {
  const data = cropData[cropName];
  switch(timeRange) {
    case '1W':
      const lastWeekActual = data.actualPrices.slice(-1)[0];
      const lastWeekPredicted = data.predictedPrices.slice(-1)[0];
      const dailyVariation = [-0.4, 0.2, -0.1, 0.3, 0.5, -0.2, 0.1];
      return {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          { label: 'Actual Price', data: dailyVariation.map((v) => Math.round(lastWeekActual * (1 + v/100))), borderColor: 'rgb(75, 192, 192)', tension: 0.4, fill: false },
          { label: 'Predicted Price', data: dailyVariation.map((v) => Math.round(lastWeekPredicted * (1 + (v + 0.1)/100))), borderColor: 'rgb(255, 99, 132)', borderDash: [5, 5], tension: 0.4, fill: false }
        ]
      };
    case '1M':
      const monthActual = data.actualPrices.slice(-3);
      const monthPredicted = data.predictedPrices.slice(-3);
      return {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [
          { label: 'Actual Price', data: [monthActual[0] - 20, monthActual[0], monthActual[1], monthActual[2]], borderColor: 'rgb(75, 192, 192)', tension: 0.4, fill: false },
          { label: 'Predicted Price', data: [monthPredicted[0] - 15, monthPredicted[0], monthPredicted[1], monthPredicted[2] + 20], borderColor: 'rgb(255, 99, 132)', borderDash: [5, 5], tension: 0.4, fill: false }
        ]
      };
    case '3M':
      return {
        labels: ['Jan', 'Feb', 'Mar'],
        datasets: [
          { label: 'Actual Price', data: data.actualPrices.slice(-3), borderColor: 'rgb(75, 192, 192)', tension: 0.4, fill: false },
          { label: 'Predicted Price', data: data.predictedPrices.slice(-3), borderColor: 'rgb(255, 99, 132)', borderDash: [5, 5], tension: 0.4, fill: false }
        ]
      };
    case '1Y':
    default:
      return {
        labels: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
        datasets: [
          { label: 'Actual Price', data: data.actualPrices, borderColor: 'rgb(75, 192, 192)', tension: 0.4, fill: false },
          { label: 'Predicted Price', data: data.predictedPrices, borderColor: 'rgb(255, 99, 132)', borderDash: [5, 5], tension: 0.4, fill: false }
        ]
      };
  }
};

// Adjust data based on region
const adjustPricesByRegion = (marketData, region) => {
  if (region === 'national') return marketData;
  const regionAdjustments = {
    north: { factor: 1.05, offset: 20 },
    south: { factor: 0.97, offset: -15 },
    east: { factor: 0.93, offset: -25 },
    west: { factor: 1.08, offset: 35 }
  };
  const adjustment = regionAdjustments[region];
  const adjustedData = { ...marketData };
  adjustedData.datasets = marketData.datasets.map(dataset => ({
    ...dataset,
    data: dataset.data.map(price => Math.round(price * adjustment.factor + adjustment.offset))
  }));
  return adjustedData;
};

// Calculate regional price variations
const getRegionalPriceVariations = (cropName, timeRange) => {
  const baseData = getTimeRangeData(cropName, timeRange);
  const regions = ['north', 'south', 'east', 'west'];
  const regionalPrices = {};
  regions.forEach(region => {
    const adjustedData = adjustPricesByRegion(baseData, region);
    regionalPrices[region] = adjustedData.datasets[0].data.slice(-1)[0]; // Latest actual price
  });
  return regionalPrices;
};

function MarketAnalytics() {
  const [selectedCrop, setSelectedCrop] = useState('rice');
  const [timeRange, setTimeRange] = useState('1M');
  const [region, setRegion] = useState('national');
  const [newsUpdates, setNewsUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [marketData, setMarketData] = useState(getTimeRangeData('rice', '1M'));
  const [marketInsights, setMarketInsights] = useState(cropData.rice);
  const [priceAlerts, setPriceAlerts] = useState(cropData.rice.priceAlerts);
  const [regionalPrices, setRegionalPrices] = useState(getRegionalPriceVariations('rice', '1M'));
  const API_KEY = import.meta.env.VITE_GOOGLE_NEWS_API_KEY;
  const CX_ID = import.meta.env.VITE_GOOGLE_CX_ID;
  const query = "agriculture India 2025 rice wheat soybean peas -inurl:(signup login)"; // Broadened query

  // Update data when crop, timeRange, or region changes
  useEffect(() => {
    const baseData = getTimeRangeData(selectedCrop, timeRange);
    const regionAdjustedData = adjustPricesByRegion(baseData, region);
    setMarketData(regionAdjustedData);
    setMarketInsights(cropData[selectedCrop]);
    setPriceAlerts(cropData[selectedCrop].priceAlerts);
    setRegionalPrices(getRegionalPriceVariations(selectedCrop, timeRange));
  }, [selectedCrop, timeRange, region]);

  // Fetch real-time news updates in English
  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&cx=${CX_ID}&key=${API_KEY}&sort=date&num=10&lr=lang_en`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch news. Check API key or network status.");
        }

        const data = await response.json();

        if (data.items && data.items.length > 0) {
          const formattedNews = data.items.map((item) => ({
            title: item.title,
            description: item.snippet,
            source: item.displayLink,
            link: item.link,
            publishedAt: item.pagemap?.metatags?.[0]?.['article:published_time'] 
              ? new Date(item.pagemap.metatags[0]['article:published_time']).toLocaleDateString() 
              : new Date().toLocaleDateString(),
          }));
          setNewsUpdates(formattedNews);
        } else {
          console.warn("No news items returned from API. Using fallback data.");
          setNewsUpdates(fallbackNews); // Use fallback if no items
        }
      } catch (err) {
        setError(err.message);
        console.error("News fetch error:", err);
        setNewsUpdates(fallbackNews); // Use fallback on error
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [selectedCrop]);

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: `${selectedCrop.charAt(0).toUpperCase() + selectedCrop.slice(1)} Price Trends & Predictions - ${region.charAt(0).toUpperCase() + region.slice(1)} Market (March 2025)`
      }
    },
    scales: {
      y: { beginAtZero: false, title: { display: true, text: 'Price (₹/quintal)' } }
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Market Analytics - March 2025</h2>
        <div className="flex space-x-4">
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="rice">Rice</option>
            <option value="wheat">Wheat</option>
            <option value="soybean">Soybean</option>
            <option value="peas">Peas</option>
          </select>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="national">National</option>
            <option value="north">North Region</option>
            <option value="south">South Region</option>
            <option value="east">East Region</option>
            <option value="west">West Region</option>
          </select>
          <div className="flex rounded-md shadow-sm">
            {['1W', '1M', '3M', '1Y'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 text-sm font-medium ${
                  timeRange === range ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                } border border-gray-300 first:rounded-l-md last:rounded-r-md -ml-px first:ml-0`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Price Alerts */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
        <div className="flex items-center">
          <BsBell className="h-5 w-5 text-yellow-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Price Alerts</h3>
            <div className="mt-2 space-y-2">
              {priceAlerts.map((alert, index) => (
                <p key={index} className="text-sm text-yellow-700">
                  <span className="font-medium">{alert.type}:</span> {alert.message} ({alert.confidence}% confidence) 
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Market Insights and Additional Sections */}
        <div className="lg:col-span-1 space-y-6">
          {/* Market Insights */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Market Insights</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Price Volatility</span>
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  marketInsights.volatility === 'Low' ? 'bg-green-100 text-green-800' :
                  marketInsights.volatility === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {marketInsights.volatility}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Confidence Score</span>
                <span className="text-sm font-medium text-gray-900">{marketInsights.confidenceScore}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Market Sentiment</span>
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  marketInsights.marketSentiment.includes('Bull') ? 'bg-green-100 text-green-800' :
                  marketInsights.marketSentiment.includes('Bear') ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {marketInsights.marketSentiment}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Trading Volume</span>
                <span className="text-sm font-medium text-gray-900">{marketInsights.tradingVolume}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Price Change (YTD)</span>
                <span className={`text-sm font-medium ${marketInsights.priceChange.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {marketInsights.priceChange}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Predicted Trend</span>
                <span className="text-sm font-medium text-gray-900">{marketInsights.predictedTrend}</span>
              </div>
            </div>
            {/* <p className="mt-4 text-sm text-gray-500">Analysis based on market trends as of March 9, 2025.</p> */}
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recommendations</h3>
            <ul className="space-y-3">
              {marketInsights.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start">
                  <BsGraphUp className="h-5 w-5 text-primary-600 mr-2 flex-shrink-0" />
                  <span className="text-sm text-gray-600">{rec}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-gray-500">Tailored advice for farmers and traders based on current data.</p>
          </div>

          {/* Price Statistics */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Price Statistics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Latest Actual Price (Mar 2025)</span>
                <span className="text-sm font-medium text-gray-900">₹{marketInsights.actualPrices.slice(-1)[0]}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Predicted Price (Mar 2025)</span>
                <span className="text-sm font-medium text-gray-900">₹{marketInsights.predictedPrices.slice(-1)[0]}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Yearly High</span>
                <span className="text-sm font-medium text-gray-900">₹{Math.max(...marketInsights.actualPrices)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Yearly Low</span>
                <span className="text-sm font-medium text-gray-900">₹{Math.min(...marketInsights.actualPrices)}</span>
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-500">Price range reflects data from April 2024 to March 2025.</p>
          </div>

          {/* Trading Volume Trends */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Trading Volume Trends</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Current Volume</span>
                <span className="text-sm font-medium text-gray-900">{marketInsights.tradingVolume}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Predicted Trend</span>
                <span className="text-sm font-medium text-gray-900">{marketInsights.predictedTrend}</span>
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-500">Volume reflects monthly trading activity as of March 2025.</p>
          </div>
        </div>

        {/* Right Column: Chart and Additional Sections */}
        <div className="lg:col-span-3 space-y-6">
          {/* Price Trends Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <Line options={options} data={marketData} />
            <p className="mt-4 text-sm text-gray-500">Chart displays actual and predicted prices for {selectedCrop} in the {region} market.</p>
          </div>

          {/* Market Sentiment Analysis */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Market Sentiment Analysis</h3>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Sentiment:</span> {marketInsights.marketSentiment}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Confidence:</span> {marketInsights.confidenceScore}% of analysts predict this trend based on supply, demand, and global factors.
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Key Driver:</span> {marketInsights.priceAlerts[0].message}
              </p>
            </div>
            {/* <p className="mt-4 text-sm text-gray-500">Sentiment analysis updated as of March 9, 2025.</p> */}
          </div>

          {/* Regional Price Variations */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Regional Price Variations</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">North Region</span>
                <span className="text-sm font-medium text-gray-900">₹{regionalPrices.north}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">South Region</span>
                <span className="text-sm font-medium text-gray-900">₹{regionalPrices.south}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">East Region</span>
                <span className="text-sm font-medium text-gray-900">₹{regionalPrices.east}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">West Region</span>
                <span className="text-sm font-medium text-gray-900">₹{regionalPrices.west}</span>
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-500">Prices adjusted for regional demand and supply dynamics as of March 2025.</p>
          </div>

          {/* Real-Time News Section */}
          <ErrorBoundary>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4"> Market News </h3>
              {loading ? (
                <p className="text-gray-600">Loading news...</p>
              ) : error ? (
                <p className="text-red-600">Error: {error} (Showing fallback news)</p>
              ) : newsUpdates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {newsUpdates.map((news, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow duration-300">
                      <div className="flex items-start">
                        <BsNewspaper className="h-5 w-5 text-gray-400 mt-1" />
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-gray-900">
                            <a href={news.link} target="_blank" rel="noopener noreferrer" className="hover:underline">
                              {news.title}
                            </a>
                          </h4>
                          <p className="mt-1 text-sm text-gray-600">{news.description}</p>
                          <div className="mt-2 flex items-center text-xs text-gray-500">
                            <span>{news.source}</span>
                            <span className="mx-1">•</span>
                            <span>{news.publishedAt}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No news available at the moment.</p>
              )}
              {/* <p className="mt-4 text-sm text-gray-500">News fetched in real-time from credible English-language sources as of March 9, 2025.</p> */}
            </div>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}

export default MarketAnalytics;