import React, { useState } from "react";
import { ChevronDown, Check, ChevronRight } from "lucide-react";

export const Services = (props) => {
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [expandedSection, setExpandedSection] = useState({});

  const toggleCourse = (index) => {
    setExpandedCourse(expandedCourse === index ? null : index);
    setExpandedSection({});
  };

  const toggleSection = (courseId, section) => {
    setExpandedSection((prev) => ({
      ...prev,
      [`${courseId}-${section}`]: !prev[`${courseId}-${section}`],
    }));
  };

  return (
    <div className="py-16 bg-gradient-to-r from-purple-600 to-blue-700">
      <div className="container mx-auto px-4 max-w-[1500px]">
        <div className="mb-20">
          <div className="text-center mb-12 relative">
            <div className="absolute top-[-100] left-0" id="courses"></div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 relative inline-block">
              Отворени курсове
              <div className="absolute -bottom-3 left-0 w-full h-1 bg-white"></div>
            </h2>
          </div>

          <div className="max-w-full mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center mb-8">
                <div className="bg-blue-50 p-6 rounded-xl border-l-4 border-blue-500 mb-6 md:mb-0 md:mr-8 md:w-2/5 flex flex-col justify-center">
                  <span className="italic block text-xl text-blue-700 mb-4 leading-relaxed">
                    "Технологията е просто инструмент. От гледна точка на това
                    да накараме хората да работят заедно и да ги мотивираме,
                    учителят е най-важен."
                  </span>
                  <span className="font-semibold block text-gray-600 text-right">
                    — Бил Гейтс
                  </span>
                </div>

                <div className="md:w-3/5">
                  <h3 className="text-4xl text-gray-800 mb-8 relative">
                    За нашите курсове
                  </h3>

                  <p className="text-gray-600 mb-4">
                    Ние провеждаме{" "}
                    <span className="font-semibold text-blue-700">
                      безплатни и изцяло дистанционни
                    </span>{" "}
                    курсове за цифрови компетентности, които се провеждат в
                    делнични дни между{" "}
                    <span className="font-semibold">18:00 и 21:00 ч.</span>
                  </p>
                  <p className="text-gray-600">
                    Обученията са предназначени за всички, които искат да
                    подобрят своите дигитални умения – от работа с компютър и
                    интернет до използване на офис приложения и защита на
                    личните данни.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap justify-center items-center pt-6 border-t border-gray-100">
                <div className="px-4 py-2 m-2 bg-purple-50 rounded-lg flex items-center">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                  <span className="text-gray-700">Практични и достъпни</span>
                </div>
                <div className="px-4 py-2 m-2 bg-violet-50 rounded-lg flex items-center">
                  <div className="w-3 h-3 bg-violet-500 rounded-full mr-2"></div>
                  <span className="text-gray-700">Опитни специалисти</span>
                </div>
                <div className="px-4 py-2 m-2 bg-indigo-50 rounded-lg flex items-center">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full mr-2"></div>
                  <span className="text-gray-700">
                    За съвременния дигитален свят
                  </span>
                </div>
                <div className="px-4 py-2 m-2 bg-blue-50 rounded-lg flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-gray-700">
                    За всички нива на познания
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {props.data ? (
            props.data.map((course, i) => (
              <div
                key={`course-${i}`}
                className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl"
              >
                <div
                  className={`flex items-center justify-between p-6 cursor-pointer ${
                    expandedCourse === i ? "bg-blue-50" : "bg-white"
                  }`}
                  onClick={() => toggleCourse(i)}
                >
                  <div className="text-center">
                    <h3 className="text-xl md:text-2xl font-bold text-gray-800">
                      {course.name}
                    </h3>
                  </div>
                  <div
                    className={`bg-blue-500 rounded-full p-2 text-white transition-transform duration-300 ${
                      expandedCourse === i ? "rotate-180" : ""
                    }`}
                  >
                    <ChevronDown size={20} />
                  </div>
                </div>

                {expandedCourse === i && (
                  <div className="p-6 bg-gradient-to-b from-blue-50 to-white">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Какво ще научите */}
                      <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div
                          className={`flex items-center justify-between p-4 cursor-pointer ${
                            expandedSection[`${i}-learning`]
                              ? "bg-violet-50"
                              : "bg-white"
                          }`}
                          onClick={() => toggleSection(i, "learning")}
                        >
                          <h4 className="font-bold text-gray-800 flex items-center">
                            <div className="bg-violet-100 p-2 rounded-full mr-3">
                              <Check size={18} className="text-violet-600" />
                            </div>
                            Какво ще научите
                          </h4>
                          <div
                            className={`transition-transform duration-300 ${
                              expandedSection[`${i}-learning`]
                                ? "rotate-180"
                                : ""
                            }`}
                          >
                            <ChevronDown size={18} className="text-gray-500" />
                          </div>
                        </div>

                        {expandedSection[`${i}-learning`] && (
                          <div className="p-4 bg-gradient-to-b from-violet-50 to-white">
                            <ul className="space-y-3">
                              {course.learning &&
                                course.learning.map((item, idx) => (
                                  <li key={idx} className="flex items-start">
                                    <div className="mt-1 mr-3 flex-shrink-0">
                                      <Check
                                        size={16}
                                        className="text-violet-500"
                                      />
                                    </div>
                                    <span className="text-gray-700">
                                      {item}
                                    </span>
                                  </li>
                                ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Условия */}
                      <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div
                          className={`flex items-center justify-between p-4 cursor-pointer ${
                            expandedSection[`${i}-conditions`]
                              ? "bg-blue-50"
                              : "bg-white"
                          }`}
                          onClick={() => toggleSection(i, "conditions")}
                        >
                          <h4 className="font-bold text-gray-800 flex items-center">
                            <div className="bg-blue-100 p-2 rounded-full mr-3">
                              <Check size={18} className="text-blue-600" />
                            </div>
                            Условия за участие
                          </h4>
                          <div
                            className={`transition-transform duration-300 ${
                              expandedSection[`${i}-conditions`]
                                ? "rotate-180"
                                : ""
                            }`}
                          >
                            <ChevronDown size={18} className="text-gray-500" />
                          </div>
                        </div>

                        {expandedSection[`${i}-conditions`] && (
                          <div className="p-4 bg-gradient-to-b from-blue-50 to-white">
                            <ul className="space-y-3">
                              {course.conditions &&
                                course.conditions.map((item, idx) => (
                                  <li key={idx} className="flex items-start">
                                    <div className="mt-1 mr-3 flex-shrink-0">
                                      <Check
                                        size={16}
                                        className="text-blue-500"
                                      />
                                    </div>
                                    <span className="text-gray-700">
                                      {item}
                                    </span>
                                  </li>
                                ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Как да кандидатствате */}
                      <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div
                          className={`flex items-center justify-between p-4 cursor-pointer ${
                            expandedSection[`${i}-signup`]
                              ? "bg-indigo-50"
                              : "bg-white"
                          }`}
                          onClick={() => toggleSection(i, "signup")}
                        >
                          <h4 className="font-bold text-gray-800 flex items-center">
                            <div className="bg-indigo-100 p-2 rounded-full mr-3">
                              <ChevronRight
                                size={18}
                                className="text-indigo-600"
                              />
                            </div>
                            Как да кандидатствате
                          </h4>
                          <div
                            className={`transition-transform duration-300 ${
                              expandedSection[`${i}-signup`] ? "rotate-180" : ""
                            }`}
                          >
                            <ChevronDown size={18} className="text-gray-500" />
                          </div>
                        </div>

                        {expandedSection[`${i}-signup`] && (
                          <div className="p-4 bg-gradient-to-b from-indigo-50 to-white">
                            <ul className="space-y-3">
                              {course.signup &&
                                course.signup.map((item, idx) => (
                                  <li key={idx} className="flex items-start">
                                    <div className="mt-1 mr-3 flex-shrink-0">
                                      {idx <= 1 ? (
                                        <Check
                                          size={16}
                                          className="text-indigo-500"
                                        />
                                      ) : (
                                        <ChevronRight
                                          size={16}
                                          className="text-indigo-500"
                                        />
                                      )}
                                    </div>
                                    <div className="text-gray-700">
                                      {idx <= 1 ? (
                                        <span>
                                          {item}
                                          {idx === 0 && (
                                            <a
                                              href="https://serviceseprocess.az.government.bg/service/5aedf067-45f5-4a56-9fe7-ca42f9084cc8/description"
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="inline-block ml-1 text-indigo-600 font-medium hover:text-indigo-800 hover:underline"
                                            >
                                              ТУК
                                            </a>
                                          )}
                                        </span>
                                      ) : (
                                        <div>
                                          <span className="font-medium">
                                            {item[0]}
                                          </span>
                                          <span className="underline">
                                            {item[1]}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </li>
                                ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <button
                        className="px-6 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors duration-300 transform hover:scale-105 active:scale-95"
                        onClick={() => {
                          const contactSection =
                            document.querySelector("#contact");
                          if (contactSection) {
                            contactSection.scrollIntoView({
                              behavior: "smooth",
                            });
                          } else {
                            window.location.href = "#contact";
                          }
                        }}
                      >
                        Свържете се с нас за повече информация
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center p-12 bg-gray-100 rounded-lg">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-300 rounded w-3/4 mx-auto mb-4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Services;
