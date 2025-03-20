const languageMappings = {
    en: {
      speech: 'en-IN',
      bcp47: 'en-IN',
      geminiName: 'English'
    },
    hi: {
      speech: 'hi-IN',
      bcp47: 'hi-IN',
      geminiName: 'हिंदी'
    },
    mr: {
      speech: 'mr-IN',
      bcp47: 'mr-IN',
      geminiName: 'मराठी'
    },
    pa: {
      speech: 'pa-IN',
      bcp47: 'pa-IN',
      geminiName: 'ਪੰਜਾਬੀ'
    },
    bn: {
      speech: 'bn-IN',
      bcp47: 'bn-IN',
      geminiName: 'বাংলা'
    },
    te: {
      speech: 'te-IN',
      bcp47: 'te-IN',
      geminiName: 'తెలుగు'
    },
    kn: {
      speech: 'kn-IN',
      bcp47: 'kn-IN',
      geminiName: 'ಕನ್ನಡ'
    }
  };
  
  export const getLanguageCode = (language) => {
    return languageMappings[language]?.speech || 'en-IN';
  };
  
  export const getGeminiLanguageName = (language) => {
    return languageMappings[language]?.geminiName || 'English';
  };