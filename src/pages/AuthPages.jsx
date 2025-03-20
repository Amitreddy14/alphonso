import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Shield, AlertCircle } from 'lucide-react';

const AuthPages = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({
    email: '',
    password: ''
  });
  const navigate = useNavigate();

  const validateForm = () => {
    let isValid = true;
    const errors = {
      email: '',
      password: ''
    };
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }
    
    // Password validation for signup
    if (!isLogin && formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    const endpoint = isLogin 
      ? 'http://localhost:5000/api/login'
      : 'http://localhost:5000/api/signup';
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData),
        credentials: 'include' // For secure cookie handling
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Store the token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        
        // Navigate to dashboard
        navigate('/dashboard');
      } else {
        setError(data.message || 'An error occurred');
      }
    } catch (error) {
      setError('Network error occurred. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-lg overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 py-4 px-6">
          <div className="flex items-center justify-between mb-1">
            <Link to="/" className="flex items-center gap-2 text-white hover:text-green-100 transition-colors">
              <Shield className="text-white" size={24} />
              <h1 className="text-sm font-medium text-green-100">Bhoomi Mitra</h1>
            </Link>
          </div>
                  <div className="flex flex-col items-center text-center">
          <h2 className="text-2xl font-bold text-white">
            {isLogin ? 'Sign In' : 'Create Account'}
          </h2>
          <p className="text-sm text-green-100 mt-1">
            {isLogin ? 'Access your secure dashboard' : 'Join our secure platform'}
          </p>
        </div>
        </div>
        
        <div className="p-6 pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2" htmlFor="email">
                <Mail size={16} className="text-green-600" />
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  aria-invalid={!!formErrors.email}
                  aria-describedby={formErrors.email ? "email-error" : undefined}
                  className={`w-full p-3 border ${formErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50'} rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={handleChange}
                />
                {formErrors.email && (
                  <div id="email-error" className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {formErrors.email}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2" htmlFor="password">
                <Lock size={16} className="text-green-600" />
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  aria-invalid={!!formErrors.password}
                  aria-describedby={formErrors.password ? "password-error" : undefined}
                  className={`w-full p-3 border ${formErrors.password ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50'} rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent pr-12`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  minLength={!isLogin ? 8 : undefined}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-green-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {formErrors.password && (
                  <div id="password-error" className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {formErrors.password}
                  </div>
                )}
              </div>
              {!isLogin && (
                <p className="text-xs text-gray-500 mt-1">
                  Password must be at least 8 characters
                </p>
              )}
            </div>

            {!isLogin && (
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    type="checkbox"
                    className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-green-300"
                    required
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="terms" className="text-gray-600">
                    I agree to the <span className="text-green-600 hover:underline cursor-pointer">Terms and Conditions</span>
                  </label>
                </div>
              </div>
            )}

            {isLogin && (
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-sm font-medium text-green-600 hover:text-green-700 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              className="w-full p-3 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors focus:outline-none focus:ring-4 focus:ring-green-300"
              disabled={isLoading}
              aria-busy={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center" role="status">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Processing...</span>
                </span>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md" role="alert">
                <p className="text-sm text-red-600 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {error}
                </p>
              </div>
            )}
          </form>
        </div>

        <div className="px-6 pb-6">
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          <p className="text-center text-sm text-gray-600">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              className="font-medium text-green-600 hover:text-green-700 hover:underline transition-colors"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setFormErrors({ email: '', password: '' });
              }}
            >
              {isLogin ? 'Create Account' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPages;