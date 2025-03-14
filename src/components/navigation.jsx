import React from "react";

export const Navigation = (props) => {
  return (
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
          {/* <a className="navbar-brand page-scroll" href="#page-top">
            ИРУ
          </a>{" "} */}
          <a href="#page-top">
            {/* TODO: change the logo into the real one */}
            <img
              src="./img/logo/logo14.jpg"
              alt=""
              className="w-[100px] absolute top-0 rounded-full sm:w-[150px] sm:top-[-40px] md:w-[200px]"
            />
          </a>
        </div>

        <div
          className="collapse navbar-collapse"
          id="bs-example-navbar-collapse-1"
        >
          <ul className="nav navbar-nav navbar-right">
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
              <a href="#services" className="page-scroll">
                Курсове
              </a>
            </li>
            <li>
              <a href="#team" className="page-scroll">
                Нашият екип
              </a>
            </li>
            <li>
              <a href="#contact" className="page-scroll">
                Контакти
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};
