import React from 'react';
import { Mic, Loader2 } from 'lucide-react';

const VoiceRecorder = ({ onRecordingComplete, isProcessing, isPaused }) => {
  return (
    <button
      onClick={onRecordingComplete}
      disabled={isProcessing || isPaused} // Disable when paused or processing
      className={`p-4 rounded-full transition-all ${
        isProcessing
          ? 'bg-gray-400'
          : isPaused
          ? 'bg-yellow-500' // Yellow when paused
          : 'bg-green-500 hover:bg-green-600'
      } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {isProcessing ? (
        <Loader2 className="w-6 h-6 animate-spin" />
      ) : (
        <Mic className="w-6 h-6" />
      )}
    </button>
  );
};

export default VoiceRecorder;