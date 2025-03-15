import React from "react";

export const About = (props) => {
  return (
    <div id="about">
      <div className="container">
        <div className="row">
          <div className="col-xs-12 col-md-6">
            {" "}
            <img
              src="img/about1.jpg"
              className="img-responsive rounded-3xl"
              alt=""
            />{" "}
          </div>
          <div className="col-xs-12 col-md-6">
            <div className="about-text">
              <h2 className="text-4xl">За нас</h2>
              <p>{props.data ? props.data.paragraph : "loading..."}</p>
              <h3>Защо да изберете нас?</h3>
              <div className="list-style">
                <div className="col-lg-6 col-sm-6 col-xs-12">
                  <ul className="space-y-3 list-none">
                    {props.data
                      ? props.data.Why.map((d, i) => (
                          <li
                            className="flex items-start pl-2"
                            key={`${d}-${i}`}
                          >
                            <div className="flex-shrink-0 w-2 h-2 mt-2 bg-blue-500 rounded-full mr-3"></div>
                            <span className="text-gray-700">{d}</span>
                          </li>
                        ))
                      : "loading"}
                  </ul>
                </div>
                <div className="col-lg-6 col-sm-6 col-xs-12">
                  <ul className="space-y-3 list-none">
                    {props.data
                      ? props.data.Why2.map((d, i) => (
                          <li
                            className="flex items-start pl-2"
                            key={`${d}-${i}`}
                          >
                            <div className="flex-shrink-0 w-2 h-2 mt-2 bg-blue-500 rounded-full mr-3"></div>
                            <span className="text-gray-700">{d}</span>
                          </li>
                        ))
                      : "loading"}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
