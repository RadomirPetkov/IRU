import React from "react";

export const Header = (props) => {
  return (
    <header id="header">
      <div className="intro">
        <img
          src="../img/main.jpg"
          className="absolute h-screen w-screen object-fill mb-52 
          md:scale-75
          lg:left-0 lg:scale-100 lg:object-contain"
          alt=""
        />
        <div className="overlay">
          <div className="container">
            <div className="row">
              <div className="col-md-8 col-md-offset-2 w-1/2 m-0 pt-[350px] pb[200px] text-center ">
                <div >
                  <h1>
                    <span className="text-5xl">{props.data ? props.data.title : "Loading"}</span>
                  </h1>
                  <p className="text-3xl">{props.data ? props.data.paragraph : "Loading"}</p>
                  <a
                    href="#features"
                    className="btn btn-custom btn-lg page-scroll scale-50 md:scale-75 lg:scale-100"
                  >
                    Научете повече
                  </a>{" "}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
