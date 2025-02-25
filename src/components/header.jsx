import React from "react";

export const Header = (props) => {
  return (
    <header id="header">
      <div className="intro">
        <img src="../img/pic2.jpg" className="intro-bg" alt="" />
        <div className="overlay">
          <div className="container">
            <div className="row">
              <div className="col-md-8 col-md-offset-2 intro-text">
                <div className="heading-text">
                  <h1>
                    <span>{props.data ? props.data.title : "Loading"}</span>
                  </h1>
                  <p>{props.data ? props.data.paragraph : "Loading"}</p>
                  <a
                    href="#features"
                    className="btn btn-custom btn-lg page-scroll"
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
