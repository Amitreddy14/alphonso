import React from 'react';
import { Volume2 } from 'lucide-react';

const ChatMessage = ({ message }) => {
  const playAudio = () => {
    if (message.audioUrl) {
      const audio = new Audio(message.audioUrl);
      audio.play();
    }
  };

  return (
    <div
      className={`flex ${
        message.type === 'user' ? 'justify-end' : 'justify-start'
      } mb-4`}
    >
      <div
        className={`max-w-[80%] p-4 rounded-lg ${
          message.type === 'user'
            ? 'bg-green-500 text-white'
            : 'bg-white text-gray-800'
        } shadow-md`}
      >
        <p className="text-sm md:text-base">{message.content}</p>
        {message.audioUrl && (
          <button
            onClick={playAudio}
            className="mt-2 text-sm flex items-center gap-2 opacity-80 hover:opacity-100"
          >
            <Volume2 className="w-4 h-4" />
            Play Audio
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;