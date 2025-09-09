// src/pages/HomePage.jsx
import React from "react";
import { Header } from "../components/header";
import { Features } from "../components/features";
import { About } from "../components/about";
import { Services } from "../components/services";
import { Contact } from "../components/contact";
import InstructorsOverview from "../components/instructors";

const HomePage = ({ data }) => {
  return (
    <div>
      <Header data={data.Header} />
      <Features data={data.Features} />
      <About data={data.About} />
      <Services data={data.Services} />
      <InstructorsOverview />
      <Contact data={data.Contact} />
    </div>
  );
};

export default HomePage;