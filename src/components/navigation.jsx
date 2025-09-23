// src/components/navigation.jsx - Поправена версия без дублиран мобилен бутон
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext';
import UserProfile from './UserProfile';
import Login from './Login';
import { LogIn } from 'lucide-react';

export const Navigation = (props) => {
  const { isAuthenticated, user } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  const handleLoginSuccess = () => {
    setShowLogin(false);
  };

  const handleLogout = () => {
    // Логиката за logout се обработва в UserProfile компонента
  };

  // Проверяваме дали сме на мобилно устройство
  useEffect(() => {
    const checkIsMobile = () => {
      const mediaQuery = window.matchMedia('(max-width: 767px)');
      const windowWidth = window.innerWidth;
      const userAgent = navigator.userAgent;
      
      const isMobileByMedia = mediaQuery.matches;
      const isMobileByWidth = windowWidth <= 767;
      const isMobileByAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      
      const finalIsMobile = isMobileByMedia || isMobileByWidth || (isMobileByAgent && windowWidth <= 1024);
      
      setIsMobile(finalIsMobile);
      return finalIsMobile;
    };

    const timer = setTimeout(() => {
      checkIsMobile();
    }, 100);
    
    const checkViewport = () => {
      let viewport = document.querySelector('meta[name="viewport"]');
      if (!viewport) {
        viewport = document.createElement('meta');
        viewport.name = 'viewport';
        viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
        document.head.appendChild(viewport);
      } else {
        if (!viewport.content.includes('width=device-width')) {
          viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
        }
      }
    };
    
    checkViewport();
    
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const handleMediaChange = (e) => {
      const newIsMobile = checkIsMobile();
      setIsMobile(newIsMobile);
    };
    
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMediaChange);
    } else {
      mediaQuery.addListener(handleMediaChange);
    }
    
    return () => {
      clearTimeout(timer);
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleMediaChange);
      } else {
        mediaQuery.removeListener(handleMediaChange);
      }
    };
  }, []);

  // Затваряне на мобилното меню при промяна на route
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Затваряне на мобилното меню при промяна от mobile към desktop
  useEffect(() => {
    if (!isMobile) {
      setIsMobileMenuOpen(false);
    }
  }, [isMobile]);

  // Затваряне на мобилното меню при клик извън него
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobile && isMobileMenuOpen && 
          !event.target.closest('.navbar-collapse') && 
          !event.target.closest('.navbar-toggle') &&
          !event.target.closest('.mobile-menu-button')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMobile, isMobileMenuOpen]);

  // Проверяваме дали сме на началната страница за да използваме anchor links
  const isHomePage = location.pathname === '/';

  // Toggle функция за мобилното меню
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Функция за затваряне на мобилното меню при клик на link
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Bootstrap navbar работи с jQuery, но можем да го симулираме
  useEffect(() => {
    const navbar = document.querySelector('#bs-example-navbar-collapse-1');
    
    if (navbar) {
      if (isMobile && isMobileMenuOpen) {
        navbar.classList.add('in');
        navbar.classList.remove('collapse');
        navbar.style.height = 'auto';
        navbar.style.display = 'block';
        navbar.style.overflow = 'visible';
      } else if (isMobile && !isMobileMenuOpen) {
        navbar.classList.remove('in');
        navbar.classList.add('collapse');
        navbar.style.height = '0px';
        navbar.style.overflow = 'hidden';
        navbar.style.display = 'none';
      } else if (!isMobile) {
        navbar.classList.remove('collapse', 'in');
        navbar.style.height = 'auto';
        navbar.style.display = 'block';
        navbar.style.overflow = 'visible';
      }
    }
  }, [isMobile, isMobileMenuOpen]);

  return (
    <>
      <nav id="menu" className="navbar navbar-default navbar-fixed-top">
        <div className="container w[100%]">
          <div className="navbar-header">
            {/* ЕДИНСТВЕН МОБИЛЕН БУТОН - в дясната страна */}
            {isMobile && (
              <button
                type="button"
                className="navbar-toggle collapsed"
                onClick={toggleMobileMenu}
                aria-expanded={isMobileMenuOpen}
                aria-controls="bs-example-navbar-collapse-1"
                style={{
                  position: 'absolute',
                  right: '15px',
                  top: '8px',
                  zIndex: 1000
                }}
              >
                <span className="sr-only">Toggle navigation</span>
                <span className="icon-bar"></span>
                <span className="icon-bar"></span>
                <span className="icon-bar"></span>
              </button>
            )}
            
            {/* Logo */}
            <Link to="/" onClick={closeMobileMenu} className="navbar-brand">
              <img
                src="./img/logo/logo14.jpg"
                alt="Лого"
                className="w-[100px] absolute top-0 left-10 rounded-full sm:w-[150px] sm:top-[-40px] md:w-[160px]"
              />
            </Link>
          </div>

          {/* Navigation Menu */}
          <div 
            className={`collapse navbar-collapse ${isMobileMenuOpen ? 'in' : ''}`}
            id="bs-example-navbar-collapse-1"
          >
            <ul className="nav navbar-nav navbar-right text-3xl md:text-xl lg:text-3xl">
              {isHomePage ? (
                // Anchor links за началната страница
                <>
                  <li>
                    <a href="#features" className="page-scroll" onClick={closeMobileMenu}>
                      Какво предлагаме
                    </a>
                  </li>
                  <li>
                    <a href="#about" className="page-scroll" onClick={closeMobileMenu}>
                      За нас
                    </a>
                  </li>
                  <li>
                    <a href="#courses" className="page-scroll" onClick={closeMobileMenu}>
                      Курсове
                    </a>
                  </li>
                  <li>
                    <a href="#team" className="page-scroll" onClick={closeMobileMenu}>
                      Нашият екип
                    </a>
                  </li>
                  <li>
                    <Link to="/courses" className="page-scroll" onClick={closeMobileMenu}>
                      Обучения
                      {!isAuthenticated && (
                        <span className="ml-1 text-xs bg-yellow-500 text-white px-2 py-1 rounded-full">
                          🔒
                        </span>
                      )}
                    </Link>
                  </li>
                  <li>
                    <a href="#contact" className="page-scroll" onClick={closeMobileMenu}>
                      Контакти
                    </a>
                  </li>
                </>
              ) : (
                // Route links за другите страници
                <>
                  <li>
                    <Link to="/#features" className="page-scroll" onClick={closeMobileMenu}>
                      Какво предлагаме
                    </Link>
                  </li>
                  <li>
                    <Link to="/#about" className="page-scroll" onClick={closeMobileMenu}>
                      За нас
                    </Link>
                  </li>
                  <li>
                    <Link to="/#courses" className="page-scroll" onClick={closeMobileMenu}>
                      Курсове
                    </Link>
                  </li>
                  <li>
                    <Link to="/#team" className="page-scroll" onClick={closeMobileMenu}>
                      Нашият екип
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/courses" 
                      className={`page-scroll ${
                        location.pathname === '/courses' || location.pathname.startsWith('/course/') 
                          ? 'text-blue-600 font-semibold' 
                          : ''
                      }`}
                      onClick={closeMobileMenu}
                    >
                      Обучения
                      {!isAuthenticated && (
                        <span className="ml-1 text-xs bg-yellow-500 text-white px-2 py-1 rounded-full">
                          🔒
                        </span>
                      )}
                    </Link>
                  </li>
                  <li>
                    <Link to="/#contact" className="page-scroll" onClick={closeMobileMenu}>
                      Контакти
                    </Link>
                  </li>
                </>
              )}
              
              {/* Authentication Section */}
              <li className="navbar-auth-item">
                {isAuthenticated ? (
                  <div className="navbar-user-profile">
                    <UserProfile user={user} onLogout={handleLogout} />
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setShowLogin(true);
                      closeMobileMenu();
                    }}
                    className="navbar-login-btn btn btn-primary"
                  >
                    <LogIn size={16} className="login-icon" />
                    <span className="login-text">Вход</span>
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