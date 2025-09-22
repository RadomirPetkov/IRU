import React, { useEffect, useState } from "react";

export const Header = (props) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Функция за определяне на размера на екрана
  const getScreenSize = () => {
    if (typeof window === 'undefined') return { isMobile: false, isTablet: false };
    const windowWidth = window.innerWidth;
    return {
      isMobile: windowWidth < 768,
      isTablet: windowWidth >= 768 && windowWidth < 1024
    };
  };

  // Инициализация при първоначално зареждане
  useEffect(() => {
    const { isMobile: mobile, isTablet: tablet } = getScreenSize();
    setIsMobile(mobile);
    setIsTablet(tablet);
    setIsInitialized(true);
  }, []);

  // Проследяване на промените в размера на прозореца
  useEffect(() => {
    if (!isInitialized) return;

    const handleResize = () => {
      const { isMobile: mobile, isTablet: tablet } = getScreenSize();
      setIsMobile(mobile);
      setIsTablet(tablet);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isInitialized]);

  // Не рендираме докато не се инициализира
  if (!isInitialized) {
    return (
      <header className="mt-[80px] h-[calc(100vh-80px)] relative overflow-hidden">
        <img
          src="../img/main.png"
          className="absolute h-full w-full object-cover"
          alt="Заглавно изображение"
        />
        <div className="absolute inset-0 flex items-center justify-start">
          <div className="container mx-auto px-4 flex flex-col items-start gap-12">
            <div className="text-left w-1/2 pl-8">
              <h1 
                className="text-white font-bold leading-tight text-4xl md:text-5xl lg:text-6xl"
                style={{ textShadow: "0 2px 4px rgba(0, 0, 0, 0.5)" }}
              >
                Станете част от технологичното бъдеще
              </h1>
            </div>
            <div className="mt-6 pl-8">
              <a
                href="#features"
                className="inline-block bg-blue-600 py-5 px-8 rounded-full text-white font-semibold transition-all duration-300 transform hover:scale-105 hover:text-white text-3xl"
              >
                Научете повече
              </a>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="mt-[80px] h-[calc(100vh-80px)] relative overflow-hidden">
      {/* Изображение с правилно оразмеряване */}
      <img
        src={isMobile ? "../img/main_mobile.png" : "../img/main.png"}
        className={`absolute h-full w-full object-cover ${isMobile ? "" : "lg:object-cover"}`}
        alt="Заглавно изображение"
      />
      
      {/* Контейнер за текст и бутон */}
      <div className={`absolute inset-0 ${isMobile ? 'flex flex-col justify-start items-center pt-12' : 'flex items-center justify-start'}`}>
        <div 
          className={`container mx-auto px-4 flex flex-col ${isMobile ? 'items-center' : 'items-start'} 
            ${isMobile ? "mt-16" : "mt-0"} 
            ${isMobile ? "gap-8" : "gap-12"}`
          }
        >
          {/* Заглавие - вляво на десктоп, центрирано горе на мобилни */}
          <div className={`${isMobile ? 'text-center w-full' : 'text-left w-1/2 pl-8'}`}>
            <h1 
              className={`text-white font-bold leading-tight
                ${isMobile ? "mx-auto px-4" : ""} 
                ${isMobile ? "text-3xl" : isTablet ? "text-5xl" : "text-6xl"}`
              }
              style={{ 
                textShadow: "0 2px 4px rgba(0, 0, 0, 0.5)"
              }}
            >
              Станете част от технологичното бъдеще
            </h1>
          </div>
          
          {/* Бутон - адаптивен размер */}
          <div className={`${isMobile ? "mt-4" : "mt-6 pl-8"}`}>
            <a
              href="#features"
              className={`inline-block bg-blue-600 py-4 px-8 rounded-full text-white 
                font-semibold transition-all duration-300 transform hover:scale-105 hover:text-white
                ${isMobile ? "text-xl py-3 px-6" : isTablet ? "text-2xl" : "text-3xl py-5 px-8"}`
              }
            >
              Научете повече
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};