// src/components/UserProfile.jsx - С функционалност за смяна на парола
import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { logoutUser, changePassword } from "../firebaseAuth";
import { User, LogOut, ChevronDown, Key, X, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";

const UserProfile = ({ user, userProfile, onLogout }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const buttonRef = useRef(null);
  const [dropdownStyle, setDropdownStyle] = useState({});

  useEffect(() => {
    if (isDropdownOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: "fixed",
        top: `${rect.bottom + 8}px`,
        right: `${window.innerWidth - rect.right}px`,
        zIndex: 1100,
      });
    }
  }, [isDropdownOpen]);

  const handleLogout = async () => {
    const result = await logoutUser();
    if (result.success) {
      onLogout && onLogout();
    }
    setIsDropdownOpen(false);
  };

  const handleOpenPasswordModal = () => {
    setIsDropdownOpen(false);
    setShowPasswordModal(true);
  };

  const getUserDisplayName = () => {
    if (userProfile?.displayName) {
      return userProfile.displayName;
    }
    if (user?.displayName) {
      return user.displayName;
    }
    if (user?.email) {
      return user.email.split("@")[0];
    }
    return "Потребител";
  };

  const getRoleInfo = () => {
    if (userProfile?.roleInfo) {
      return {
        label: userProfile.roleInfo.name,
        color: userProfile.roleInfo.color,
      };
    }
    return {
      label: "Потребител",
      color: "bg-gray-100 text-gray-800",
    };
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation();
          setIsDropdownOpen(!isDropdownOpen);
        }}
        className="flex items-center space-x-2 bg-white rounded-full px-3 py-2 shadow-md hover:shadow-lg transition-shadow border border-gray-200 max-w-full"
      >
        <div className="bg-gradient-to-r from-purple-600 to-blue-700 rounded-full p-2">
          <User className="text-white" size={16} />
        </div>
        <div className="hidden md:block text-left overflow-hidden">
          <p className="text-sm font-medium text-gray-800 truncate max-w-[120px]">
            {getUserDisplayName()}
          </p>
          <p className="text-xs text-gray-600 truncate max-w-[120px]">
            {user?.email}
          </p>
        </div>
        <ChevronDown
          className={`text-gray-400 transition-transform flex-shrink-0 ${
            isDropdownOpen ? "rotate-180" : ""
          }`}
          size={16}
        />
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen &&
        createPortal(
          <div
            className="w-72 md:w-64 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-xl border border-gray-200"
            style={dropdownStyle}
          >
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-purple-600 to-blue-700 rounded-full p-2 flex-shrink-0">
                  <User className="text-white" size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">
                    {getUserDisplayName()}
                  </p>
                  <p className="text-sm text-gray-600 truncate">
                    {user?.email}
                  </p>
                  <span
                    className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleInfo().color}`}
                  >
                    {getRoleInfo().label}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-2">
              <button
                onClick={handleOpenPasswordModal}
                className="w-full flex items-center space-x-3 px-3 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
              >
                <Key size={16} />
                <span>Смяна на парола</span>
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-3 py-2 text-left text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <LogOut size={16} />
                <span>Изход</span>
              </button>
            </div>
          </div>,
          document.body
        )}

      {/* Overlay за затваряне на dropdown */}
      {isDropdownOpen &&
        createPortal(
          <div
            className="fixed inset-0 bg-black/20 z-[1090]"
            onClick={(e) => {
              e.stopPropagation();
              setIsDropdownOpen(false);
            }}
          />,
          document.body
        )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <PasswordChangeModal onClose={() => setShowPasswordModal(false)} />
      )}
    </div>
  );
};

// Компонент за смяна на парола
const PasswordChangeModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const toggleShowPassword = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const validateForm = () => {
    if (!formData.currentPassword) {
      return "Моля въведете текущата си парола";
    }
    if (!formData.newPassword) {
      return "Моля въведете нова парола";
    }
    if (formData.newPassword.length < 6) {
      return "Новата парола трябва да е поне 6 символа";
    }
    if (formData.newPassword !== formData.confirmPassword) {
      return "Новите пароли не съвпадат";
    }
    if (formData.currentPassword === formData.newPassword) {
      return "Новата парола трябва да е различна от текущата";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");

    const result = await changePassword(formData.currentPassword, formData.newPassword);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-blue-700">
          <div className="flex items-center text-white">
            <Key size={24} className="mr-3" />
            <h3 className="text-lg font-bold">Смяна на парола</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              <h4 className="text-lg font-medium text-gray-800 mb-2">
                Паролата е сменена успешно!
              </h4>
              <p className="text-gray-600">
                Прозорецът ще се затвори автоматично...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Текуща парола
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                    placeholder="Въведете текущата парола"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowPassword('current')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Нова парола
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                    placeholder="Въведете нова парола (мин. 6 символа)"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowPassword('new')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Потвърдете новата парола
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                    placeholder="Повторете новата парола"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowPassword('confirm')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  <AlertCircle size={18} className="mr-2 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {/* Buttons */}
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Отказ
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-700 text-white rounded-lg hover:from-purple-700 hover:to-blue-800 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Смяна...
                    </span>
                  ) : (
                    "Смени паролата"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default UserProfile;