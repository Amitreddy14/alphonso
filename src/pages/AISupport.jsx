import { useState, useRef, useEffect } from 'react';
import { BsSend, BsRobot, BsPerson, BsInfoCircle, BsCalendarCheck } from 'react-icons/bs';
import { Groq } from 'groq-sdk';

// Initialize Groq client
const groq = new Groq({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY, 
  dangerouslyAllowBrowser: true
});

function AISupport() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI farming assistant. How can I help you today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const callGroqAPI = async (messageHistory) => {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "qwen-2.5-32b",
          messages: [
            {
              role: "system",
              content: `You are an AI-powered agricultural expert designed to assist farmers with real-time, data-driven insights. Based on the latest advancements in crop disease detection, market trends, weather forecasting, and government policies, provide concise and actionable responses. Your knowledge covers:

              Identifying and diagnosing crop diseases from symptoms
              Predicting disease progression and suggesting AI-driven treatment plans
              Forecasting agricultural market prices and analyzing market trends
              Providing weather-based farming recommendations for irrigation, fertilization, and harvesting
              Checking subsidy and loan eligibility based on farm details and government schemes
              Offering best practices for sustainable and high-yield farming
              Ensure responses are simple, practical, and aligned with a farmer's real-world challenges. Where necessary, integrate insights from live data sources, government policies, and agricultural best practices`
            },
            ...messageHistory
          ],
          temperature: 0.84,
          max_tokens: 6790,
          top_p: 0.95,
          stream: false
        })
      });
  
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
  
      const data = await response.json();
      return data.choices?.[0]?.message?.content || "Sorry, I could not generate a response.";
    } catch (error) {
      console.error("Error calling Groq API:", error);
      console.log("Error calling Groq API:", error);
      console.log("Groq API Key:", import.meta.env.VITE_GROQ_API_KEY);
      return "Sorry, there was an error processing your request. Please try again.";
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      role: 'user',
      content: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // Prepare message history for API call
      const messageHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      messageHistory.push(userMessage);

      // Get response from Groq
      const response = await callGroqAPI(messageHistory);

      // Add assistant's response to chat
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response
      }]);
    } catch (error) {
      console.error('Error in chat completion:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, there was an error processing your request. Please try again.'
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Agricultural AI Support</h2>
        <div className="flex items-center text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
          <BsInfoCircle className="mr-2 text-green-600" />
          <span>Available 24/7</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 h-[700px] flex flex-col">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-2.5 rounded-full shadow-sm">
              <BsRobot className="h-6 w-6 text-green-700" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">AgriTech AI Assistant</h3>
              <div className="flex items-center text-xs text-gray-600">
                <BsCalendarCheck className="mr-1 text-green-600" />
                <span>Expert in agricultural practices and crop management</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 bg-gray-50">
          <div className="space-y-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-start space-x-3 ${
                  message.role === 'user' ? 'justify-end' : ''
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0">
                    <div className="bg-green-100 p-2 rounded-full shadow-sm">
                      <BsRobot className="h-5 w-5 text-green-700" />
                    </div>
                  </div>
                )}
                <div
                  className={`rounded-2xl p-4 max-w-[70%] shadow-sm ${
                    message.role === 'user'
                      ? 'bg-green-700 text-white'
                      : 'bg-white text-gray-800 border border-gray-100'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line leading-relaxed">{message.content}</p>
                </div>
                {message.role === 'user' && (
                  <div className="flex-shrink-0">
                    <div className="bg-green-700 p-2 rounded-full shadow-sm">
                      <BsPerson className="h-5 w-5 text-white" />
                    </div>
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="bg-green-100 p-2 rounded-full shadow-sm">
                    <BsRobot className="h-5 w-5 text-green-700" />
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Form */}
        <div className="border-t border-gray-200 p-4 bg-white">
          <form onSubmit={handleSubmit} className="flex space-x-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about farming..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all shadow-sm"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-green-700 text-white font-medium rounded-lg hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-50 shadow-sm flex items-center justify-center"
              disabled={isTyping}
            >
              <BsSend className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AISupport;