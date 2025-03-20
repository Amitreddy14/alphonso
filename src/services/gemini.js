import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI;
let model;

export const initializeGemini = (apiKey) => {
  genAI = new GoogleGenerativeAI(apiKey);
  model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash", // Updated to a supported model
    generationConfig: {
      maxOutputTokens: 8192,
      temperature: 0.7,
      topP: 0.8,
      topK: 40
    }
  });
};

const getLanguagePrompt = (language) => {
  const languagePrompts = {
    en: 'English',
    hi: 'हिंदी',
    mr: 'मराठी',
    pa: 'ਪੰਜਾਬੀ',
    bn: 'বাংলা',
    te: 'తెలుగు',
    kn: 'ಕನ್ನಡ',
  };
  return languagePrompts[language] || 'English';
};

export const generateResponse = async (prompt, selectedLanguage) => {
  if (!model) {
    throw new Error('Gemini model not initialized');
  }

  try {
    const languageName = getLanguagePrompt(selectedLanguage);

    const systemPrompt = `You are a knowledgeable agricultural assistant helping Indian farmers.
    IMPORTANT INSTRUCTIONS:
    1. You MUST respond ONLY in ${languageName} language
    2. Your response should be in the native script of ${languageName}
    3. Keep responses clear, practical, and farmer-friendly
    4. Use simple, everyday language that farmers understand
    5. If discussing measurements or numbers, use local units
    6. For technical terms, provide the local language equivalent
    7. Do not use any markdown formatting or special characters
    8. If unsure about information, be honest and suggest consulting local agricultural experts
    9. Provide detailed and comprehensive responses
    10. Include specific examples and practical steps when relevant
    11. If discussing prices or market rates, mention that they are approximate
    12. For crop-related queries, include seasonal considerations
    
    Current conversation language: ${languageName}
    User's question: ${prompt}
    
    Remember to provide a comprehensive response while maintaining clarity and simplicity.`;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    return cleanResponse(response.text());
  } catch (error) {
    console.error('Error generating response:', error);
    throw new Error('Failed to generate response');
  }
};

const cleanResponse = (text) => {
  return text
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/`/g, '')
    .replace(/\n\n/g, '\n')
    .replace(/\s+/g, ' ')
    .trim();
};