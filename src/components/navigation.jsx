// src/components/navigation.jsx
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext';
import UserProfile from './UserProfile';
import Login from './Login';
import { LogIn } from 'lucide-react';

export const Navigation = (props) => {
  const { isAuthenticated, user } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const location = useLocation();

  const handleLoginSuccess = () => {
    setShowLogin(false);
  };

  const handleLogout = () => {
    // Логиката за logout се обработва в UserProfile компонента
  };

  // Проверяваме дали сме на началната страница за да използваме anchor links
  const isHomePage = location.pathname === '/';

  return (
    <>
      <nav id="menu" className="navbar navbar-default navbar-fixed-top">
        <div className="container">
          <div className="navbar-header">
            <button
              type="button"
              className="navbar-toggle collapsed"
              data-toggle="collapse"
              data-target="#bs-example-navbar-collapse-1"
            >
              {" "}
              <span className="sr-only">Toggle navigation</span>{" "}
              <span className="icon-bar"></span>{" "}
              <span className="icon-bar"></span>{" "}
              <span className="icon-bar"></span>{" "}
            </button>
            <Link to="/">
              <img
                src="./img/logo/logo14.jpg"
                alt=""
                className="w-[100px] absolute top-0 rounded-full sm:w-[150px] sm:top-[-40px] md:w-[200px]"
              />
            </Link>
          </div>

          <div
            className="collapse navbar-collapse"
            id="bs-example-navbar-collapse-1"
          >
            <ul className="nav navbar-nav navbar-right text-3xl md:text-xl lg:text-3xl">
              {isHomePage ? (
                // Anchor links за началната страница
                <>
                  <li>
                    <a href="#features" className="page-scroll">
                      Какво предлагаме
                    </a>
                  </li>
                  <li>
                    <a href="#about" className="page-scroll">
                      За нас
                    </a>
                  </li>
                  <li>
                    <a href="#courses" className="page-scroll">
                      Курсове
                    </a>
                  </li>
                  <li>
                    <a href="#team" className="page-scroll">
                      Нашият екип
                    </a>
                  </li>
                  <li>
                    <Link to="/videos" className="page-scroll">
                      Видеа
                      {!isAuthenticated && (
                        <span className="ml-1 text-xs bg-yellow-500 text-white px-2 py-1 rounded-full">
                          🔒
                        </span>
                      )}
                    </Link>
                  </li>
                  <li>
                    <a href="#contact" className="page-scroll">
                      Контакти
                    </a>
                  </li>
                </>
              ) : (
                // Route links за другите страници
                <>
                  <li>
                    <Link to="/#features" className="page-scroll">
                      Какво предлагаме
                    </Link>
                  </li>
                  <li>
                    <Link to="/#about" className="page-scroll">
                      За нас
                    </Link>
                  </li>
                  <li>
                    <Link to="/#courses" className="page-scroll">
                      Курсове
                    </Link>
                  </li>
                  <li>
                    <Link to="/#team" className="page-scroll">
                      Нашият екип
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/videos" 
                      className={`page-scroll ${location.pathname === '/videos' ? 'text-blue-600 font-semibold' : ''}`}
                    >
                      Видеа
                      {!isAuthenticated && (
                        <span className="ml-1 text-xs bg-yellow-500 text-white px-2 py-1 rounded-full">
                          🔒
                        </span>
                      )}
                    </Link>
                  </li>
                  <li>
                    <Link to="/#contact" className="page-scroll">
                      Контакти
                    </Link>
                  </li>
                </>
              )}
              
              {/* Authentication Section */}
              <li className="flex items-center ml-4">
                {isAuthenticated ? (
                  <UserProfile user={user} onLogout={handleLogout} />
                ) : (
                  <button
                    onClick={() => setShowLogin(true)}
                    className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-700 text-white px-4 py-2 rounded-full hover:from-purple-700 hover:to-blue-800 transition-all duration-200 shadow-md"
                  >
                    <LogIn size={16} />
                    <span className="hidden md:inline">Вход</span>
                  </button>
                )}
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Login Modal */}
      {showLogin && !isAuthenticated && (
        <Login 
          onClose={() => setShowLogin(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </>
  );
};