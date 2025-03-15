import React, { useEffect, useState } from "react";

export const Header = (props) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [fontSize, setFontSize] = useState('70px');

  // Проверка за размера на екрана и адаптиране на размера на шрифта
  useEffect(() => {
    const checkResize = () => {
      const windowWidth = window.innerWidth;
      setIsMobile(windowWidth < 768);
      setIsTablet(windowWidth >= 768 && windowWidth < 1024);
      
      // Динамично изчисляване на размера на шрифта
      // Ограничаваме минималния размер до 1.75rem (28px) и максималния до 4.5rem (72px)
      const calculatedSize = Math.max(1.75, Math.min(windowWidth * 0.00003 * 100, 4.5));
      setFontSize(`${calculatedSize}rem`);
    };
    
    // Изпълняваме първоначална проверка
    checkResize();

    // Добавяме listener за промяна на размера на прозореца
    window.addEventListener("resize", checkResize);

    // Почистване при unmount
    return () => window.removeEventListener("resize", checkResize);
  }, []);

  return (
    <header className="mt-[80px] h-[calc(100vh-80px)] relative overflow-hidden">
      {/* Изображение с правилно оразмеряване */}
      <img
        src={isMobile ? "../img/main_mobile.jpg" : "../img/main.jpg"}
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
                ${isMobile ? "mx-auto px-4" : ""}`
              }
              style={{ 
                fontSize: fontSize,
                textShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
                transition: "font-size 0.2s ease"
              }}
            >
              Бъдете част от технологичното бъдеще
            </h1>
          </div>
          
          {/* Бутон - адаптивен размер */}
          <div className={`${isMobile ? "mt-4" : "mt-6 pl-8"}`}>
            <a
              href="#features"
              className={`inline-block bg-blue-600 hover:bg-blue-700 py-4 px-8 rounded-full text-white 
                font-semibold transition-all duration-300 transform hover:scale-105
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

export default Header;