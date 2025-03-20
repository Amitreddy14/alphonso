import React from 'react';

const languages = [
  { code: 'en', name: 'English', localName: 'English' },
  { code: 'hi', name: 'Hindi', localName: 'हिंदी' },
  { code: 'mr', name: 'Marathi', localName: 'मराठी' },
  { code: 'pa', name: 'Punjabi', localName: 'ਪੰਜਾਬੀ' },
  { code: 'bn', name: 'Bengali', localName: 'বাংলা' },
  { code: 'te', name: 'Telugu', localName: 'తెలుగు' },
  { code: 'kn', name: 'Kannada', localName: 'ಕನ್ನಡ' },
];

const LanguageSelector = ({ selectedLanguage, onLanguageChange }) => {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="language" className="text-sm font-medium text-white">
        Language / भाषा:
      </label>
      <select
        id="language"
        value={selectedLanguage.code}
        onChange={(e) => {
          const lang = languages.find((l) => l.code === e.target.value);
          if (lang) onLanguageChange(lang);
        }}
        className="p-2 rounded-lg bg-white text-gray-800 border-none focus:ring-2 focus:ring-green-300 focus:border-transparent text-base font-medium"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code} className="text-base py-2">
            {lang.localName} ({lang.name})
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;