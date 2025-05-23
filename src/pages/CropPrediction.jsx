import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { WEATHER_API_KEY, WEATHER_BASE_URL } from '../config.js';

const CropPrediction = ({ soilMoisture }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [npkValues, setNpkValues] = useState({ nitrogen: '', phosphorus: '', potassium: '' });
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [sowingPeriod, setSowingPeriod] = useState(''); // New state for sowing period

  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

  const locations = {
    'Delhi': { lat: 28.6139, lon: 77.2090 },
    'Mumbai': { lat: 19.0760, lon: 72.8777 },
    'Bangalore': { lat: 12.9716, lon: 77.5946 },
    'Chennai': { lat: 13.0827, lon: 80.2707 },
    'Kolkata': { lat: 22.5726, lon: 88.3639 },
    'Jaipur': { lat: 26.9124, lon: 75.7873 },
    'Lucknow': { lat: 26.8467, lon: 80.9462 },
    'Hyderabad': { lat: 17.3850, lon: 78.4867 }
  };

  const sowingPeriods = [
    { name: 'Winter (Dec-Feb)', value: 'winter' },
    { name: 'Spring (Mar-May)', value: 'spring' },
    { name: 'Summer (Jun-Aug)', value: 'summer' },
    { name: 'Fall (Sep-Nov)', value: 'fall' }
  ];

  useEffect(() => {
    const fetchWeatherData = async (lat, lon) => {
      try {
        const forecastUrl = `${WEATHER_BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`;
        const forecastResponse = await fetch(forecastUrl);
        if (!forecastResponse.ok) throw new Error('Failed to fetch weather forecast');
        const forecastData = await forecastResponse.json();

        const forecastList = forecastData.list;
        const avgFutureTemp = forecastList.reduce((sum, entry) => sum + entry.main.temp, 0) / forecastList.length;
        const avgFutureHumidity = forecastList.reduce((sum, entry) => sum + entry.main.humidity, 0) / forecastList.length;
        const totalFuturePrecip = forecastList.reduce((sum, entry) => sum + (entry.rain?.['3h'] || 0), 0);

        const pastWeather = {
          winter: { temp: 15.0, humidity: 70.0, precip: 50.0 },
          spring: { temp: 25.0, humidity: 60.0, precip: 80.0 },
          summer: { temp: 35.0, humidity: 75.0, precip: 200.0 },
          fall: { temp: 28.0, humidity: 65.0, precip: 100.0 }
        };

        setWeatherData({
          past: pastWeather,
          future: {
            temperature: avgFutureTemp.toFixed(1),
            humidity: avgFutureHumidity.toFixed(1),
            precipitation: totalFuturePrecip.toFixed(1)
          }
        });
      } catch (err) {
        setError('Could not load weather data: ' + err.message);
      }
    };

    const loadWeather = () => {
      if (selectedLocation && locations[selectedLocation]) {
        const { lat, lon } = locations[selectedLocation];
        fetchWeatherData(lat, lon);
      } else if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => fetchWeatherData(position.coords.latitude, position.coords.longitude),
          () => fetchWeatherData(28.6139, 77.2090)
        );
      } else {
        fetchWeatherData(28.6139, 77.2090);
      }
    };

    loadWeather();
  }, [selectedLocation]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleNpkChange = (e) => {
    const { name, value } = e.target;
    setNpkValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocationChange = (e) => {
    setSelectedLocation(e.target.value);
  };

  const handleSowingPeriodChange = (e) => {
    setSowingPeriod(e.target.value);
  };

  const fileToGenerativePart = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.replace(/^data:image\/\w+;base64,/, '');
        resolve({
          inlineData: { data: base64String, mimeType: file.type }
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const cleanFormatting = (text) => {
    return text.replace(/\*+/g, '').replace(/#+/g, '').replace(/:{2,}/g, ':').trim();
  };

  const parseAnalysisResponse = (text) => {
    try {
      const overallMatch = text.match(/Overall Confidence: (\d+%)/i);
      const overallConfidence = overallMatch ? overallMatch[1] : 'N/A';
      const cleanedText = text.replace(/Overall Confidence: \d+%\n?/, '').trim();

      const sections = cleanedText.split(/\d+\.\s+(?=Soil Identification|Soil Health|Crop Recommendations|Soil Improvement|Disease Prevention)/).filter(Boolean);

      const formatSection = (section) => {
        const lines = section.split('\n')
          .map(line => cleanFormatting(line))
          .filter(line => line.trim().length > 0);
        return lines.map(line => {
          const [key, ...valueParts] = line.split(':');
          if (valueParts.length > 0) {
            return { key: key.trim(), value: valueParts.join(':').trim() };
          }
          return { value: line.trim() };
        });
      };

      return {
        overallConfidence,
        soilIdentification: sections.length > 0 ? formatSection(sections[0]) : [],
        soilHealth: sections.length > 1 ? formatSection(sections[1]) : [],
        cropRecommendations: sections.length > 2 ? formatSection(sections[2]) : [],
        soilImprovement: sections.length > 3 ? formatSection(sections[3]) : [],
        diseasePrevention: sections.length > 4 ? formatSection(sections[4]) : []
      };
    } catch (error) {
      console.error('Error parsing analysis response:', error);
      return {
        overallConfidence: 'N/A',
        soilIdentification: [],
        soilHealth: [],
        cropRecommendations: [],
        soilImprovement: [],
        diseasePrevention: []
      };
    }
  };

  const handleDownload = () => {
    if (analysis) {
      const doc = new jsPDF();
      const currentDate = new Date().toLocaleDateString();
      
      doc.setFontSize(20);
      doc.setTextColor(0, 102, 204);
      doc.text('Crop Prediction Report', 105, 20, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${currentDate}`, 105, 27, { align: 'center' });
      doc.text(`Overall Confidence: ${analysis.overallConfidence}`, 105, 33, { align: 'center' });
      
      if (imagePreview) {
        doc.addImage(imagePreview, 'JPEG', 70, 40, 70, 60);
        doc.setDrawColor(200, 200, 200);
        doc.rect(69, 39, 72, 62);
      }
      
      let startY = imagePreview ? 110 : 40;
      
      const addSection = (title, items, y) => {
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text(title, 14, y);
        
        const tableData = items.map(item => item.key ? [item.key, item.value] : ["", item.value]);
        
        if (tableData.length > 0) {
          doc.autoTable({
            startY: y + 5,
            head: [['Property', 'Detail']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [0, 102, 204], textColor: 255 },
            columnStyles: {
              0: { cellWidth: 50, fontStyle: 'bold' },
              1: { cellWidth: 'auto' }
            },
            styles: { overflow: 'linebreak' },
            margin: { left: 14, right: 14 }
          });
        }
        
        return doc.lastAutoTable.finalY + 10;
      };
      
      startY = addSection('SOIL IDENTIFICATION', analysis.soilIdentification, startY);
      startY = addSection('SOIL HEALTH', analysis.soilHealth, startY);
      
      if (startY > 250) { doc.addPage(); startY = 20; }
      startY = addSection('CROP RECOMMENDATIONS', analysis.cropRecommendations, startY);
      
      if (startY > 250) { doc.addPage(); startY = 20; }
      startY = addSection('SOIL IMPROVEMENT', analysis.soilImprovement, startY);
      
      if (startY > 250) { doc.addPage(); startY = 20; }
      addSection('DISEASE PREVENTION', analysis.diseasePrevention, startY);
      
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          'This report was generated by Crop Prediction tool. For guidance purposes only.',
          105, 285, { align: 'center' }
        );
        doc.text(`Page ${i} of ${pageCount}`, 195, 285);
      }
      
      doc.save('crop-prediction-report.pdf');
    }
  };

  const analyzeSoil = async () => {
    if (!selectedImage || !npkValues.nitrogen || !npkValues.phosphorus || !npkValues.potassium) {
      setError('Please upload a soil image and enter all NPK values');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const imagePart = await fileToGenerativePart(selectedImage);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const moistureText = soilMoisture !== null ? `Soil Moisture: ${soilMoisture}%` : "Soil Moisture: Not available";
      let weatherText;
      if (sowingPeriod && weatherData) {
        const periodName = sowingPeriods.find(p => p.value === sowingPeriod)?.name || sowingPeriod;
        weatherText = `Weather for selected sowing period (${periodName}): Temp ${weatherData.past[sowingPeriod].temp}°C, Humidity ${weatherData.past[sowingPeriod].humidity}%, Precip ${weatherData.past[sowingPeriod].precip}mm`;
      } else if (weatherData) {
        weatherText = `Current Weather (5-day avg from API): Temp ${weatherData.future.temperature}°C, Humidity ${weatherData.future.humidity}%, Precip ${weatherData.future.precipitation}mm`;
      } else {
        weatherText = "Weather Data: Not available";
      }

      const prompt = `Analyze this soil image along with the provided NPK values (Nitrogen: ${npkValues.nitrogen} mg/kg, Phosphorus: ${npkValues.phosphorus} mg/kg, Potassium: ${npkValues.potassium} mg/kg), ${moistureText}, and ${weatherText}. Provide a clear, concise analysis for the next 6 months (full crop cycle from planting to harvest) starting from ${sowingPeriod ? `the selected sowing period (${sowingPeriods.find(p => p.value === sowingPeriod)?.name})` : 'the current date'}, predicting crop suitability and potential diseases based on the provided weather data, in the following format, including an overall confidence percentage for the entire analysis and confidence scores where applicable:

Overall Confidence: [percentage]

1. Soil Identification
- Type: [name] (Confidence: [percentage])
- Texture: [description]
- Color: [description]
- Key features: [brief list]

2. Soil Health
- Nutrient Status: [Good/Fair/Poor]
- NPK Levels: [analysis]
- Moisture Level: [analysis]
- Issues: [list if any] (Confidence: [percentage])

3. Crop Recommendations
- Best Crops: [list] (Confidence: [percentage])
- Suitability: [brief explanation considering the provided weather data]
- Yield Potential: [Low/Medium/High]
- Irrigation Needs: [brief, considering the provided weather]
- Harvest Timing: [brief, considering 6-month cycle from sowing start]

4. Soil Improvement
- Amendments: [list]
- Application: [brief]
- Timing: [brief considering the provided weather]
- Maintenance: [brief tips for next 6 months]

5. Disease Prevention
- Potential Diseases: [list diseases for recommended crops, considering soil, NPK, moisture, and provided weather]
- Risk Factors: [brief, e.g., high humidity, poor drainage]
- Prevention Methods: [brief list, e.g., crop rotation, fungicides]
- Timing: [when to apply prevention, considering the provided weather]

Keep responses brief and clear, avoiding unnecessary formatting. If any section cannot be determined, use "Unknown" or "Not detectable" with a confidence of 0%.`;

      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();
      const structuredAnalysis = parseAnalysisResponse(text);
      setAnalysis(structuredAnalysis);
    } catch (err) {
      setError(err.message || 'Failed to analyze soil');
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    { title: "Soil Identification", key: "soilIdentification" },
    { title: "Soil Health", key: "soilHealth" },
    { title: "Crop Recommendations", key: "cropRecommendations" },
    { title: "Soil Improvement", key: "soilImprovement" },
    { title: "Disease Prevention", key: "diseasePrevention" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Crop Prediction</h1>
          <p className="text-lg text-gray-600">Soil analysis, crop suitability, and disease prevention</p>
        </header>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="grid md:grid-cols-2 gap-6 p-8">
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900">Upload Soil Image</h2>
              <div 
                className="border-2 border-dashed border-gray-200 rounded-xl transition-all duration-300 hover:border-blue-400 hover:bg-blue-50/30"
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const file = e.dataTransfer.files[0];
                  if (file?.type.startsWith('image/')) {
                    setSelectedImage(file);
                    setImagePreview(URL.createObjectURL(file));
                    setError(null);
                  }
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer block p-6">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Soil preview"
                      className="max-h-96 mx-auto rounded-lg object-contain"
                    />
                  ) : (
                    <div className="text-center py-16">
                      <div className="mx-auto w-16 h-16 mb-4 text-blue-500">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-gray-700 font-medium text-lg">Drop your soil image here or click to upload</p>
                      <p className="text-gray-500 mt-2">Supports: JPG, PNG (max 10MB)</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900">Analysis Options</h2>
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                  {error}
                </div>
              )}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Enter NPK Values (mg/kg)</h3>
                <div className="space-y-4">
                  <input
                    type="number"
                    name="nitrogen"
                    value={npkValues.nitrogen}
                    onChange={handleNpkChange}
                    placeholder="Nitrogen (N)"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    name="phosphorus"
                    value={npkValues.phosphorus}
                    onChange={handleNpkChange}
                    placeholder="Phosphorus (P)"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    name="potassium"
                    value={npkValues.potassium}
                    onChange={handleNpkChange}
                    placeholder="Potassium (K)"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select Location</h3>
                  <select
                    value={selectedLocation}
                    onChange={handleLocationChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Use my current location</option>
                    {Object.keys(locations).map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                  <h3 className="text-lg font-medium text-gray-900 mt-4 mb-2">Select Sowing Period (Optional)</h3>
                  <select
                    value={sowingPeriod}
                    onChange={handleSowingPeriodChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Use current weather</option>
                    {sowingPeriods.map((period) => (
                      <option key={period.value} value={period.value}>{period.name}</option>
                    ))}
                  </select>
                  <p className="text-gray-700 mt-2">
                    Real-time Soil Moisture: {soilMoisture !== null ? `${soilMoisture}%` : "Not available"}
                  </p>
                  {weatherData ? (
                    <>
                      <p className="text-gray-700 mt-2">Past Weather (12 months seasonal avg):</p>
                      <p className="text-gray-700 ml-4">
                        Winter: {weatherData.past.winter.temp}°C, {weatherData.past.winter.humidity}% Humidity, {weatherData.past.winter.precip}mm Precip
                      </p>
                      <p className="text-gray-700 ml-4">
                        Spring: {weatherData.past.spring.temp}°C, {weatherData.past.spring.humidity}% Humidity, {weatherData.past.spring.precip}mm Precip
                      </p>
                      <p className="text-gray-700 ml-4">
                        Summer: {weatherData.past.summer.temp}°C, {weatherData.past.summer.humidity}% Humidity, {weatherData.past.summer.precip}mm Precip
                      </p>
                      <p className="text-gray-700 ml-4">
                        Fall: {weatherData.past.fall.temp}°C, {weatherData.past.fall.humidity}% Humidity, {weatherData.past.fall.precip}mm Precip
                      </p>
                      {sowingPeriod ? (
                        <p className="text-gray-700 mt-2">
                          Selected Sowing Period ({sowingPeriods.find(p => p.value === sowingPeriod)?.name}): 
                          Temp {weatherData.past[sowingPeriod].temp}°C, 
                          Humidity {weatherData.past[sowingPeriod].humidity}%, 
                          Precip {weatherData.past[sowingPeriod].precip}mm
                        </p>
                      ) : (
                        <p className="text-gray-700 mt-2">
                          Current Weather (5-day avg): 
                          Temp {weatherData.future.temperature}°C, 
                          Humidity {weatherData.future.humidity}%, 
                          Precip {weatherData.future.precipitation}mm
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-700 mt-2">Weather Data: Loading...</p>
                  )}
                </div>
              </div>
              <button
                onClick={analyzeSoil}
                disabled={!selectedImage || !npkValues.nitrogen || !npkValues.phosphorus || !npkValues.potassium || loading}
                className="w-full py-4 bg-blue-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors duration-200 text-lg font-medium shadow-lg shadow-blue-200"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin w-6 h-6 border-3 border-white border-t-transparent rounded-full mr-3" />
                    Analyzing Soil...
                  </div>
                ) : (
                  'Start Analysis'
                )}
              </button>
            </div>
          </div>
        </div>

        {analysis && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="border-b border-gray-100 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-900">Analysis Results</h2>
              <div className="flex items-center space-x-4">
                <span className="text-gray-700 font-medium">
                  Overall Confidence: {analysis.overallConfidence}
                </span>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download PDF Report
                </button>
              </div>
            </div>
            <div className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                {sections.map((section, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-xl font-semibold mb-4 text-gray-900">{section.title}</h3>
                    <div className="space-y-3">
                      {analysis[section.key]?.length > 0 ? (
                        analysis[section.key].map((item, index) => (
                          <div key={index} className="text-gray-700">
                            {item.key ? (
                              <div className="flex flex-col sm:flex-row sm:items-baseline">
                                <span className="font-medium min-w-[120px] text-gray-900">{item.key}:</span>
                                <span className="text-gray-600 mt-1 sm:mt-0">{item.value}</span>
                              </div>
                            ) : (
                              <span className="text-gray-600">{item.value}</span>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-600">No data available</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CropPrediction;