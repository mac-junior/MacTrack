import React, { useContext, useState, useEffect } from 'react';
import {
  Menu,
  User,
  Moon,
  Sun,
  Settings,
  UserCircle,
  BarChart3,
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import toast from 'react-hot-toast';

const Header = ({ onMenuClick }) => {
  const { user } = useContext(AuthContext);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const [profileForm, setProfileForm] = useState({
    username: user?.username || '',
    email: user?.email || '',
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleUpdateProfile = async () => {
    toast.success('Profile updated successfully');
    setShowProfileModal(false);
  };

  return (
    <>
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30 transition-colors duration-200">
        <div className="px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Button */}
            <button
              onClick={onMenuClick}
              aria-label="Open menu"
              className="lg:hidden text-gray-600 dark:text-gray-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors focus:outline-none"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Logo */}
            <div className="flex-1 lg:flex-none">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                MacTrack
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 hidden lg:block">
                Know where every dime went
              </p>
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                aria-label="Toggle Theme"
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300 transition-all focus:outline-none"
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg px-3 py-2 transition-colors focus:outline-none"
                >
                  <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                  </div>

                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:inline">
                    {user?.username}
                  </span>
                </button>

                {isUserMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsUserMenuOpen(false)}
                    />

                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {user?.username}
                        </p>

                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {user?.email}
                        </p>
                      </div>

                      <div className="p-2">
                        <button
                          onClick={() => {
                            setShowProfileModal(true);
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg transition-all focus:outline-none"
                        >
                          <Settings className="w-4 h-4" />
                          <span>Profile Settings</span>
                        </button>

                        <button
                          onClick={() => {
                            navigate('/insights');
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg transition-all focus:outline-none"
                        >
                          <BarChart3 className="w-4 h-4" />
                          <span>Financial Insights</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Profile Settings Modal */}
      <Modal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        title="Profile Settings"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
              <UserCircle className="w-16 h-16 text-slate-700 dark:text-slate-300" />
            </div>
          </div>

          <Input
            label="Username"
            type="text"
            value={profileForm.username}
            onChange={(e) =>
              setProfileForm({
                ...profileForm,
                username: e.target.value,
              })
            }
            placeholder="Enter username"
          />

          <Input
            label="Email"
            type="email"
            value={profileForm.email}
            onChange={(e) =>
              setProfileForm({
                ...profileForm,
                email: e.target.value,
              })
            }
            placeholder="Enter email"
          />

          <div className="pt-4 flex gap-3">
            <Button onClick={handleUpdateProfile} variant="primary">
              Save Changes
            </Button>

            <Button
              onClick={() => setShowProfileModal(false)}
              variant="secondary"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Header;