import { ArrowRight, Clock, ShieldCheck, BarChart, Phone, Mail, MapPin, Cloud, Sun, Leaf, Bot, LineChart, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate=useNavigate();

  const handleGetStarted = () => {
    navigate("/auth");
  };

  useEffect(() => {
    setIsVisible(true);
    
    // Auto-rotate background images
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % backgroundImages.length
      );
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const backgroundImages = [
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=2000&q=80", // green fields
    "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=2000&q=80", // farm sunset
    "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=2000&q=80", // technology in agriculture
    "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=2000&q=80" // green landscape
  ];

  const features = [
    {
      icon: <Leaf className="w-8 h-8 text-green-600" />,
      title: "AI Plant Disease Detection",
      description: "Instantly identify plant diseases with our advanced AI scanning technology"
    },
    {
      icon: <Bot className="w-8 h-8 text-green-600" />,
      title: "AI Support 24/7",
      description: "Get agricultural help anytime with our intelligent support system"
    },
    {
      icon: <LineChart className="w-8 h-8 text-green-600" />,
      title: "Market Analytics",
      description: "Real-time crop price forecasting and market trend analysis"
    },
    {
      icon: <FileText className="w-8 h-8 text-green-600" />,
      title: "Agro News",
      description: "Stay updated with the latest agricultural news and developments"
    },
    {
      icon: <BarChart className="w-8 h-8 text-green-600" />,
      title: "Subsidy Checker",
      description: "Find and apply for relevant agricultural subsidies for your farm"
    },
    {
      icon: <Sun className="w-8 h-8 text-green-600" />,
      title: "Weather Insights",
      description: "Personalized weather forecasts for your specific farm location"
    }
  ];

  const stats = [
    { value: "95%", label: "Disease Detection Accuracy" },
    { value: "100K+", label: "Farmers Served" },
    { value: "50+", label: "Crop Types Supported" },
    { value: "24/7", label: "Ai Expert Support" }
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-green-50 to-white flex-grow">
        {/* Background Images */}
        <div className="absolute inset-0 z-0">
          {backgroundImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentImageIndex ? "opacity-40" : "opacity-0"
              }`}
            >
              <img
                src={image}
                alt={`Background ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white/70 to-transparent" />
            </div>
          ))}
        </div>

        {/* Hero Content */}
        <div className="relative z-10 flex items-center justify-center text-center h-screen">
          <div className="max-w-3xl">
            <h1
              className={`text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
              } transition-all duration-1000 ease-out`}
            >
              Cultivating Success with{" "}
              <span className="text-green-600">Smart Agriculture</span>
            </h1>
            <p
              className={`text-lg md:text-xl text-gray-700 mb-8 max-w-xl mx-auto ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
              } transition-all duration-1000 delay-300 ease-out`}
            >
              Empowering farmers with AI-driven insights and tools to maximize yields, minimize costs, and grow sustainably.
            </p>
            <button
              onClick={handleGetStarted}
              className={`bg-green-600 hover:bg-green-700 text-white font-medium px-8 py-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105 hover:shadow-lg mx-auto ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
              } transition-all duration-1000 delay-500 ease-out`}
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient bg-green-700 text-white">
        <div className="container mx-auto px-6 sm:px-12 lg:px-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="p-6 bg-white/10 backdrop-blur-md rounded-xl shadow-md hover:scale-105 transition-transform"
              >
                <div className="text-4xl font-extrabold text-white drop-shadow-lg">
                  {stat.value}
                </div>
                <div className="mt-2 text-lg font-medium text-gray-200">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Features Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Smart Farming Solutions
            </h2>
            <p className="text-gray-700 max-w-2xl mx-auto text-lg">
              Revolutionizing agriculture with cutting-edge technology and data-driven insights
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 md:p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col items-start transform hover:-translate-y-1 transition-transform duration-300">
                <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900">{feature.title}</h3>
                <p className="text-gray-700">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                How Our AgriTech Works
              </h2>
            <p className="text-gray-700 max-w-2xl mx-auto text-lg">
              Simple steps to revolutionize your farming experience
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-green-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Scan Your Crops</h3>
              <p className="text-gray-700">Take photos of your crops with our mobile app to get instant disease diagnostics</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Receive AI Analysis</h3>
              <p className="text-gray-700">Get personalized recommendations and treatment plans from our AI system</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-green-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Implement Solutions</h3>
              <p className="text-gray-700">Follow our expert advice to improve crop yields and reduce losses</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Farmers Say
            </h2>
            <p className="text-gray-700 max-w-2xl mx-auto text-lg">
              Real success stories from farmers using our platform
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-md">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">JD</span>
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold">John Deere</h4>
                  <p className="text-sm text-gray-600">Wheat Farmer, Kansas</p>
                </div>
              </div>
              <p className="text-gray-700">"The AI disease detection saved my wheat crop. I identified rust early and took preventive measures that saved me thousands."</p>
            </div>
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-md">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">SP</span>
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold">Sarah Peterson</h4>
                  <p className="text-sm text-gray-600">Organic Farmer, California</p>
                </div>
              </div>
              <p className="text-gray-700">"The weather insights are incredibly accurate. I've been able to plan my activities with confidence, even during unpredictable seasons."</p>
            </div>
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-md">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">RG</span>
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold">Robert Garcia</h4>
                  <p className="text-sm text-gray-600">Corn Grower, Iowa</p>
                </div>
              </div>
              <p className="text-gray-700">"The market analytics helped me time my corn sales perfectly. Made 15% more profit this year by knowing exactly when to sell."</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            <div className="mb-8 md:mb-0">
              <h3 className="text-xl font-semibold text-white mb-6">AgriTech Solutions</h3>
              <p className="mb-4 text-gray-400">
                Leading the way in smart agricultural technology since 2018
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-white transition p-2 bg-gray-800 rounded-full hover:bg-green-700">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition p-2 bg-gray-800 rounded-full hover:bg-green-700">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-6">Solutions</h3>
              <ul className="space-y-3">
                <li><a href="#" className="hover:text-white transition hover:translate-x-1 inline-block transform">Disease Detection</a></li>
                <li><a href="#" className="hover:text-white transition hover:translate-x-1 inline-block transform">Market Analytics</a></li>
                <li><a href="#" className="hover:text-white transition hover:translate-x-1 inline-block transform">Weather Forecasting</a></li>
                <li><a href="#" className="hover:text-white transition hover:translate-x-1 inline-block transform">Subsidy Finder</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-6">Resources</h3>
              <ul className="space-y-3">
                <li><a href="#" className="hover:text-white transition hover:translate-x-1 inline-block transform">Farming Blog</a></li>
                <li><a href="#" className="hover:text-white transition hover:translate-x-1 inline-block transform">Knowledge Base</a></li>
                <li><a href="#" className="hover:text-white transition hover:translate-x-1 inline-block transform">Community Forum</a></li>
                <li><a href="#" className="hover:text-white transition hover:translate-x-1 inline-block transform">Training Videos</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-6">Contact</h3>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 group">
                  <div className="p-2 bg-gray-800 rounded-full group-hover:bg-green-600 transition-colors duration-300">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <span>456 Farm Road, Agritech Valley</span>
                </li>
                <li className="flex items-center gap-3 group">
                  <div className="p-2 bg-gray-800 rounded-full group-hover:bg-green-600 transition-colors duration-300">
                    <Phone className="w-5 h-5" />
                  </div>
                  <span>+1 (555) 123-4567</span>
                </li>
                <li className="flex items-center gap-3 group">
                  <div className="p-2 bg-gray-800 rounded-full group-hover:bg-green-600 transition-colors duration-300">
                    <Mail className="w-5 h-5" />
                  </div>
                  <span>contact@agritechsolutions.com</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-500">
              © {new Date().getFullYear()} AgriTech Solutions. All rights reserved.
            </p>
            <div className="mt-4 flex justify-center space-x-4 text-sm">
              <a href="#" className="text-gray-500 hover:text-white transition">Privacy Policy</a>
              <a href="#" className="text-gray-500 hover:text-white transition">Terms of Service</a>
              <a href="#" className="text-gray-500 hover:text-white transition">Cookies Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;