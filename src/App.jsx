// src/App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { Navigation } from "./components/navigation";
import HomePage from "./pages/HomePage";
import VideosPage from "./pages/VideosPage";
import JsonData from "./data/data.json";
import SmoothScroll from "smooth-scroll";
import "./App.css";

export const scroll = new SmoothScroll('a[href*="#"]', {
  speed: 1000,
  speedAsDuration: true,
});

const App = () => {
  const [landingPageData, setLandingPageData] = useState({});
  
  useEffect(() => {
    setLandingPageData(JsonData);
  }, []);

  // Примерни видеа за демонстрация
  const sampleVideos = [
    {
      title: "Въведение в цифровите компетентности",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      description: "Основни понятия за работа с компютър и интернет. Този курс ще ви запознае с базовите умения необходими в дигиталния свят.",
      category: "Базово ниво",
      duration: "15:30"
    },
    {
      title: "Microsoft Word за начинаещи",
      url: "https://www.youtube.com/watch?v=example1",
      description: "Научете основните функции на Microsoft Word - форматиране на текст, създаване на документи и работа с таблици.",
      category: "Офис приложения",
      duration: "22:45"
    },
    {
      title: "Интернет сигурност и защита на данни",
      url: "https://www.youtube.com/watch?v=example2",
      description: "Как да защитим личните си данни онлайн, разпознаване на измами и безопасно сърфиране в интернет.",
      category: "Кибер сигурност",
      duration: "18:20"
    },
    {
      title: "Excel основи - работа с таблици",
      url: "https://www.youtube.com/watch?v=example3",
      description: "Основни функции в Excel - създаване на таблици, формули, графики и анализ на данни.",
      category: "Офис приложения",
      duration: "25:10"
    },
    {
      title: "PowerPoint презентации",
      url: "https://www.youtube.com/watch?v=example4",
      description: "Създаване на професионални презентации с PowerPoint - дизайн, анимации и ефективно представяне.",
      category: "Офис приложения",
      duration: "20:15"
    },
    {
      title: "Електронни услуги на държавата",
      url: "https://www.youtube.com/watch?v=example5",
      description: "Как да използваме електронните услуги на българската администрация - eGov.bg, подаване на заявления онлайн.",
      category: "Електронно управление",
      duration: "12:40"
    },
    {
      title: "Защита от кибератаки",
      url: "https://www.youtube.com/watch?v=example6",
      description: "Разпознаване и защита от различни видове кибератаки - фишинг, малуер и социално инженерство.",
      category: "Кибер сигурност",
      duration: "19:55"
    },
    {
      title: "Работа с email и календар",
      url: "https://www.youtube.com/watch?v=example7",
      description: "Ефективно управление на електронна поща и планиране с дигитални календари.",
      category: "Базово ниво",
      duration: "16:30"
    }
  ];

  return (
    <AuthProvider>
      <Router>
        <div>
          <Navigation />
          <Routes>
            <Route 
              path="/" 
              element={<HomePage data={landingPageData} />} 
            />
            <Route 
              path="/videos" 
              element={
                <VideosPage 
                  videos={sampleVideos} 
                  title="Обучителни видеа"
                />
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;