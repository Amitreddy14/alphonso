let recognition = null;
let isPaused = false;

const initializeRecognition = (language) => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) throw new Error('Speech recognition not supported in this browser');
  
  recognition = new SpeechRecognition();
  recognition.lang = language;
  recognition.continuous = false; // Still single-shot for simplicity
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  console.log('Recognition initialized');
};

export const speechToText = (language) => {
  return new Promise((resolve, reject) => {
    if (!recognition || recognition.ended) {
      try {
        initializeRecognition(language);
      } catch (err) {
        reject(err);
        return;
      }
    } else {
      recognition.lang = language;
    }

    if (isPaused) {
      reject(new Error('Speech recognition is paused'));
      return;
    }

    console.log('Running on:', window.location.href);
    console.log('Network status:', navigator.onLine ? 'Online' : 'Offline');

    let finalTranscript = '';
    let silenceTimer;
    const SILENCE_DURATION = 1500;
    const MAX_RETRIES = 2;
    let retryCount = 0;

    const startRecognition = () => {
      console.log(`Attempting to start recognition (Retry ${retryCount}/${MAX_RETRIES})...`);
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
          console.log('Microphone access granted.');
          if (!isPaused) {
            recognition.start();
            console.log(`Speech recognition started in ${language}`);
          } else {
            reject(new Error('Recognition paused before start'));
          }
        })
        .catch((err) => {
          console.error('Microphone access failed:', err);
          reject(new Error(`Microphone access denied or unavailable: ${err.message}`));
        });
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      finalTranscript = transcript;
      console.log('Speech recognized:', transcript);

      clearTimeout(silenceTimer);
      silenceTimer = setTimeout(() => {
        recognition.stop();
        resolve(finalTranscript);
      }, SILENCE_DURATION);
    };

    recognition.onerror = (event) => {
      clearTimeout(silenceTimer);
      console.error('Recognition error:', event.error);
      if (event.error === 'network' && retryCount < MAX_RETRIES) {
        retryCount++;
        console.warn(`Network error detected. Retrying (${retryCount}/${MAX_RETRIES})...`);
        setTimeout(startRecognition, 2000);
      } else {
        let errorMsg;
        switch (event.error) {
          case 'network':
            errorMsg = 'Network failure. Please check your internet connection and ensure HTTPS is used.';
            break;
          case 'not-allowed':
            errorMsg = 'Microphone access denied. Please allow microphone permissions.';
            break;
          case 'no-speech':
            errorMsg = 'No speech detected. Please speak clearly and try again.';
            break;
          case 'aborted':
            errorMsg = 'Recognition stopped by user.';
            break;
          default:
            errorMsg = `Speech recognition error: ${event.error}`;
        }
        reject(new Error(errorMsg));
      }
    };

    recognition.onend = () => {
      console.log('Recognition ended.');
      if (finalTranscript) {
        resolve(finalTranscript);
      } else if (retryCount >= MAX_RETRIES) {
        reject(new Error('Maximum retries reached. Check your network or microphone.'));
      }
      recognition = null; // Reset for next session
    };

    startRecognition();
  });
};

export const pauseSpeechRecognition = () => {
  if (recognition && !isPaused) {
    recognition.abort(); // Immediate stop mid-speech
    isPaused = true;
    console.log('Speech recognition aborted and paused');
  } else {
    console.log('No active recognition or already paused');
  }
};

export const resumeSpeechRecognition = () => {
  if (isPaused) {
    isPaused = false;
    console.log('Speech recognition resumed successfully');
  } else {
    console.log('Not paused, no action needed');
  }
};

export const textToSpeech = async (text, language) => {
  return new Promise((resolve, reject) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      const voices = window.speechSynthesis.getVoices();
      const languageVoice = voices.find(voice => voice.lang.startsWith(language.split('-')[0]));
      if (languageVoice) utterance.voice = languageVoice;
      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(new Error(`Speech synthesis error: ${event.error}`));
      window.speechSynthesis.speak(utterance);
    } else {
      reject(new Error('Speech synthesis not supported in this browser'));
    }
  });
};