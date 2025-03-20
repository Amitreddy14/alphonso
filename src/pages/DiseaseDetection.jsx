import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const DiseaseDetection = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);

  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError(null);
    }
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
    return text.replace(/\*+/g, '')
              .replace(/#+/g, '')
              .replace(/:{2,}/g, ':')
              .trim();
  };

  const parseAnalysisResponse = (text) => {
    try {
      // Remove any introductory text before the numbered sections
      const cleanedText = text.replace(/^.*?(1\.\s+Plant Identification)/s, '$1');
      
      const sections = cleanedText.split(/\d+\.\s+/).filter(Boolean);
      
      const formatSection = (section) => {
        const lines = section.split('\n')
          .map(line => cleanFormatting(line))
          .filter(line => line.trim().length > 0);
        
        return lines.map(line => {
          const [key, ...valueParts] = line.split(':');
          if (valueParts.length > 0) {
            return {
              key: key.trim(),
              value: valueParts.join(':').trim()
            };
          }
          return { value: line.trim() };
        });
      };

      return {
        plantIdentification: formatSection(sections[0] || ''),
        healthAssessment: formatSection(sections[1] || ''),
        treatmentPlan: formatSection(sections[2] || ''),
        careInstructions: formatSection(sections[3] || '')
      };
    } catch (error) {
      console.error('Error parsing analysis response:', error);
      return null;
    }
  };

  const handleDownload = () => {
    if (analysis) {
      // Create a new PDF document
      const doc = new jsPDF();
      const currentDate = new Date().toLocaleDateString();
      
      // Add title
      doc.setFontSize(20);
      doc.setTextColor(0, 102, 204); // Blue color for title
      doc.text('Plant Analysis Report', 105, 20, { align: 'center' });
      
      // Add date
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100); // Gray color for date
      doc.text(`Generated on: ${currentDate}`, 105, 27, { align: 'center' });
      
      // Add plant image if available
      if (imagePreview) {
        doc.addImage(imagePreview, 'JPEG', 70, 35, 70, 60);
        doc.setDrawColor(200, 200, 200); // Light gray border
        doc.rect(69, 34, 72, 62);
      }
      
      let startY = imagePreview ? 110 : 40;
      
      // Helper function to add a section to PDF
      const addSection = (title, items, y) => {
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text(title, 14, y);
        
        const tableData = items.map(item => {
          if (item.key) {
            return [item.key, item.value];
          }
          return ["", item.value];
        });
        
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
      
      // Add sections with tables
      startY = addSection('PLANT IDENTIFICATION', analysis.plantIdentification, startY);
      startY = addSection('HEALTH ASSESSMENT', analysis.healthAssessment, startY);
      
      // If we've reached the bottom of the page, add a new page
      if (startY > 250) {
        doc.addPage();
        startY = 20;
      }
      
      startY = addSection('TREATMENT RECOMMENDATIONS', analysis.treatmentPlan, startY);
      
      // If we've reached the bottom of the page, add a new page
      if (startY > 250) {
        doc.addPage();
        startY = 20;
      }
      
      addSection('CARE GUIDELINES', analysis.careInstructions, startY);
      
      // Add footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          'This report was generated by Plant Health Analysis tool. For guidance purposes only.',
          105, 285, { align: 'center' }
        );
        doc.text(`Page ${i} of ${pageCount}`, 195, 285);
      }
      
      // Save the PDF
      doc.save('plant-analysis-report.pdf');
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const imagePart = await fileToGenerativePart(selectedImage);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const prompt = `Analyze this plant image and provide a clear, concise analysis in the following format:

1. Plant Identification
- Species: [name]
- Common name: [name]
- Family: [name]
- Key features: [brief list]

2. Health Assessment
- Status: [Good/Fair/Poor]
- Symptoms: [brief description]
- Affected areas: [list]
- Severity: [Mild/Moderate/Severe]

3. Treatment Plan
- Immediate actions: [list]
- Products needed: [list]
- Timeline: [brief]
- Prevention: [brief tips]

4. Care Instructions
- Light: [requirement]
- Water: [frequency]
- Soil: [type]
- Temperature: [range]
- Additional: [brief tips]

Keep responses brief and clear, avoiding unnecessary formatting.`;

      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();
      const structuredAnalysis = parseAnalysisResponse(text);
      setAnalysis(structuredAnalysis);
    } catch (err) {
      setError(err.message || 'Failed to analyze image');
    } finally {
      setLoading(false);
    }
  };

  // Define section titles and their corresponding keys in the analysis object
  const sections = [
    { title: "Plant Identification", key: "plantIdentification" },
    { title: "Health Assessment", key: "healthAssessment" },
    { title: "Treatment Plan", key: "treatmentPlan" },
    { title: "Care Instructions", key: "careInstructions" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Plant Health Analysis</h1>
          <p className="text-lg text-gray-600">Instant disease detection and professional care recommendations</p>
        </header>

        {/* Analysis Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="grid md:grid-cols-2 gap-6 p-8">
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900">Upload Image</h2>
              <div 
                className="border-2 border-dashed border-gray-200 rounded-xl transition-all duration-300 hover:border-blue-400 hover:bg-blue-50/30"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
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
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer block p-6"
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Plant preview"
                      className="max-h-96 mx-auto rounded-lg object-contain"
                    />
                  ) : (
                    <div className="text-center py-16">
                      <div className="mx-auto w-16 h-16 mb-4 text-blue-500">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-gray-700 font-medium text-lg">Drop your image here or click to upload</p>
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
                <h3 className="text-lg font-medium text-gray-900 mb-4">Analysis Features</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Plant Species Identification
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Disease Detection
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Treatment Recommendations
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Care Guidelines
                  </li>
                </ul>
              </div>
              <button
                onClick={analyzeImage}
                disabled={!selectedImage || loading}
                className="w-full py-4 bg-blue-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors duration-200 text-lg font-medium shadow-lg shadow-blue-200"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin w-6 h-6 border-3 border-white border-t-transparent rounded-full mr-3" />
                    Analyzing Image...
                  </div>
                ) : (
                  'Start Analysis'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {analysis && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="border-b border-gray-100 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-900">Analysis Results</h2>
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
            <div className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                {sections.map((section, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-xl font-semibold mb-4 text-gray-900">
                      {section.title}
                    </h3>
                    <div className="space-y-3">
                      {analysis[section.key]?.map((item, index) => (
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
                      ))}
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

export default DiseaseDetection;