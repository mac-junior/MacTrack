import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { Eye, EyeOff, Moon, Sun } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const success = await login(formData);
    setLoading(false);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-gray-900 flex items-center justify-center p-4 transition-colors duration-200">
      <div className="max-w-md w-full">
        {/* Theme Toggle Button */}
        <div className="absolute top-4 right-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-soft"
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        {/* Logo and Tagline */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">MacTrack</h1>
          <p className="text-gray-600 dark:text-gray-400">Know where every dime went</p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-card shadow-soft p-8 transition-colors duration-200">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <Input
                label="Email or Username"
                type="text"
                value={formData.identifier}
                onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                required
                placeholder="macjr@example.com or macjr"
                autoComplete="username"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  placeholder="••••••"
                  autoComplete="current-password"
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              variant="primary" 
              loading={loading} 
              className="w-full mt-4"
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link 
                to="/register" 
                className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium transition-colors"
              >
                Create Account
              </Link>
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              By signing in, you agree to our{' '}
              <Link 
                to="/terms" 
                className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium transition-colors"
              >
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link 
                to="/privacy" 
                className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium transition-colors"
              >
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;