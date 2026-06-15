import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  History,
  BarChart3,
  LogOut,
  X,
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Sidebar = ({ isOpen, onClose }) => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/transactions', icon: PlusCircle, label: 'Transactions' },
    { path: '/history', icon: History, label: 'History' },
    { path: '/insights', icon: BarChart3, label: 'Insights' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
    onClose();
  };

  const handleNavClick = () => {
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:w-64 w-64 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo Area */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                MacTrack
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Financial Memory System
              </p>
            </div>

            <button
              onClick={onClose}
              className="lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-slate-100 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;