import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { logoutUser } from "../firebaseAuth";
import { User, LogOut, ChevronDown, Settings } from "lucide-react";

const UserProfile = ({ user, userProfile, onLogout }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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

  const getUserDisplayName = () => {
    // Първо проверяваме дали има displayName в user обекта
    if (user?.displayName) {
      return user.displayName;
    }
    // Ако няма displayName, използваме email
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
              {/* <button
                onClick={() => setIsDropdownOpen(false)}
                className="w-full flex items-center space-x-3 px-3 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
              >
                <Settings size={16} />
                <span>Настройки</span>
              </button> */}

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
    </div>
  );
};

export default UserProfile;
