import React, { useEffect, useState } from "react";

export const Header = (props) => {
  const [isMobile, setIsMobile] = useState(false);

  // Проверка за размера на екрана
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Изпълняваме първоначална проверка
    checkIfMobile();
    
    // Добавяме listener за промяна на размера на прозореца
    window.addEventListener('resize', checkIfMobile);
    
    // Почистване при unmount
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  return (
    <header id="header">
      <div className="intro">
        {/* Избираме изображението според размера на екрана */}
        <img
          src={isMobile ? "../img/main_mobile.jpg" : "../img/main.jpg"}
          className={`absolute h-screen w-screen ${
            isMobile ? "object-cover" : "lg:object-contain"
          }`}
          alt="Заглавно изображение"
        />
        
        <div className="overlay">
          <div className="container">
            <div className="row">
              <div className={`col-md-8 col-md-offset-2 ${isMobile ? "w-full" : "w-1/2 -ml-36"} m-0 ${isMobile ? "pt-[230px]" : "pt-[350px]"} pb[200px] text-center`}>
                <div>
                  <h1>
                    <span className={`${isMobile ? "text-5xl" : "text-8xl"}`}>
                      {props.data ? props.data.title : "Loading"}
                    </span>
                  </h1>
                  <p className={`${isMobile ? "text-2xl" : "text-4xl"}`}>
                    {props.data ? props.data.paragraph : "Loading"}
                  </p>
                  <a
                    href="#features"
                    className={`btn btn-custom btn-lg page-scroll ${isMobile ? "scale-75" : "scale-100"}`}
                  >
                    Научете повече
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};