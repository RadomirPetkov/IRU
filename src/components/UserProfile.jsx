// src/components/UserProfile.jsx
import React, { useState } from 'react';
import { logoutUser } from '../firebaseAuth';
import { User, LogOut, ChevronDown, Settings } from 'lucide-react';

const UserProfile = ({ user, onLogout }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = async () => {
    const result = await logoutUser();
    if (result.success) {
      onLogout && onLogout();
    }
    setIsDropdownOpen(false);
  };

  const getUserDisplayName = () => {
    if (user?.email) {
      // Извличаме ролята от имейла за демо целите
      if (user.email.includes('admin')) return 'Администратор';
      if (user.email.includes('teacher')) return 'Преподавател';
      if (user.email.includes('student')) return 'Студент';
      return user.email.split('@')[0];
    }
    return 'Потребител';
  };

  const getUserRole = () => {
    if (user?.email) {
      if (user.email.includes('admin')) return 'admin';
      if (user.email.includes('teacher')) return 'teacher';
      if (user.email.includes('student')) return 'student';
    }
    return 'user';
  };

  const getRoleColor = () => {
    const role = getUserRole();
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'teacher': return 'bg-green-100 text-green-800';
      case 'student': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-2 bg-white rounded-full px-4 py-2 shadow-md hover:shadow-lg transition-shadow border border-gray-200"
      >
        <div className="bg-gradient-to-r from-purple-600 to-blue-700 rounded-full p-2">
          <User className="text-white" size={16} />
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-gray-800">{getUserDisplayName()}</p>
          <p className="text-xs text-gray-600">{user?.email}</p>
        </div>
        <ChevronDown 
          className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
          size={16} 
        />
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-purple-600 to-blue-700 rounded-full p-2">
                <User className="text-white" size={20} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800">{getUserDisplayName()}</p>
                <p className="text-sm text-gray-600">{user?.email}</p>
                <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor()}`}>
                  {getUserRole() === 'admin' ? 'Администратор' : 
                   getUserRole() === 'teacher' ? 'Преподавател' :
                   getUserRole() === 'student' ? 'Студент' : 'Потребител'}
                </span>
              </div>
            </div>
          </div>

          <div className="p-2">
            <button
              onClick={() => setIsDropdownOpen(false)}
              className="w-full flex items-center space-x-3 px-3 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
            >
              <Settings size={16} />
              <span>Настройки</span>
            </button>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-3 py-2 text-left text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <LogOut size={16} />
              <span>Изход</span>
            </button>
          </div>
        </div>
      )}

      {/* Overlay за затваряне на dropdown */}
      {isDropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsDropdownOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default UserProfile;