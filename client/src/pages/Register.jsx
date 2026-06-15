import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { Eye, EyeOff, Moon, Sun, CheckCircle, XCircle } from 'lucide-react';
import { validateEmail, validatePassword } from '../utils/validators';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username || formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (formData.username.length > 30) {
      newErrors.username = 'Username must be less than 30 characters';
    }
    
    if (!formData.email || !validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password || !validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    const success = await register({
      username: formData.username,
      email: formData.email,
      password: formData.password,
    });
    setLoading(false);
    
    if (success) {
      navigate('/');
    }
  };

  // Password strength indicator
  const getPasswordStrength = () => {
    const password = formData.password;
    if (!password) return { score: 0, text: '', color: '' };
    
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score <= 2) return { score, text: 'Weak', color: 'text-red-600 dark:text-red-400' };
    if (score <= 4) return { score, text: 'Medium', color: 'text-amber-600 dark:text-amber-400' };
    return { score, text: 'Strong', color: 'text-emerald-600 dark:text-emerald-400' };
  };

  const passwordStrength = getPasswordStrength();

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

        {/* Registration Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-card shadow-soft p-8 transition-colors duration-200">
          <form onSubmit={handleSubmit}>
            {/* Username Field */}
            <div className="mb-5">
              <Input
                label="Username"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                error={errors.username}
                required
                placeholder="macjr"
                autoComplete="username"
              />
              {formData.username && !errors.username && (
                <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Username available
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="mb-5">
              <Input
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                error={errors.email}
                required
                placeholder="macjr@example.com"
                autoComplete="email"
              />
            </div>

            {/* Password Field */}
            <div className="mb-5">
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
                  autoComplete="new-password"
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
              
              {/* Password strength indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Password strength:</span>
                    <span className={`text-xs font-medium ${passwordStrength.color}`}>
                      {passwordStrength.text}
                    </span>
                  </div>
                  <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        passwordStrength.score <= 2 ? 'bg-red-500' :
                        passwordStrength.score <= 4 ? 'bg-amber-500' :
                        'bg-emerald-500'
                      }`}
                      style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                    />
                  </div>
                  <ul className="mt-2 space-y-1">
                    <li className="flex items-center text-xs">
                      {formData.password.length >= 6 ? (
                        <CheckCircle className="w-3 h-3 text-emerald-500 mr-1" />
                      ) : (
                        <XCircle className="w-3 h-3 text-gray-400 mr-1" />
                      )}
                      <span className={formData.password.length >= 6 ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-500'}>
                        At least 6 characters
                      </span>
                    </li>
                    <li className="flex items-center text-xs">
                      {/[A-Z]/.test(formData.password) ? (
                        <CheckCircle className="w-3 h-3 text-emerald-500 mr-1" />
                      ) : (
                        <XCircle className="w-3 h-3 text-gray-400 mr-1" />
                      )}
                      <span className={/[A-Z]/.test(formData.password) ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-500'}>
                        One uppercase letter
                      </span>
                    </li>
                    <li className="flex items-center text-xs">
                      {/[0-9]/.test(formData.password) ? (
                        <CheckCircle className="w-3 h-3 text-emerald-500 mr-1" />
                      ) : (
                        <XCircle className="w-3 h-3 text-gray-400 mr-1" />
                      )}
                      <span className={/[0-9]/.test(formData.password) ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-500'}>
                        One number
                      </span>
                    </li>
                  </ul>
                </div>
              )}
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  placeholder="••••••"
                  autoComplete="new-password"
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Passwords match
                </p>
              )}
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
              )}
            </div>

            <Button 
              type="submit" 
              variant="primary" 
              loading={loading} 
              className="w-full mt-4"
            >
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <p className="text-xs text-center text-gray-500 dark:text-gray-500">
              By creating an account, you agree to our Terms of Service
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;