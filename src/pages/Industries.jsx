import React, { useEffect, useRef, useState } from "react";

import TopBar from "../components/TopBar";
import Header from "../components/Header";
import RequirementForm from "../components/RequirementForm";
import Footer from "../components/Footer";

import "./Industries.css";

import industries from "../components/industriesData";

const industries1 = [
  {
    id: 1,
    title: "Transformer Manufacturers",
    description:"Insulation components for transformer manufacturing applications.",
    image: "/images/tm.jpg",
  },
  {
    id: 2,
    title: "Distribution Transformer Manufacturers",
    description:"Components supporting distribution transformer manufacturing requirements.",
    image: "/images/dtm.jpg",
  },
  {
    id: 3,
    title: "Power Transformer Manufacturers",
    description:"Insulation components for power transformer manufacturing applications.",
    image: "/images/ptm.jpg",
  },
  {
    id: 4,
    title: "Transformer Repair & Refurbishment",
    description:"Components for transformer repair and refurbishment requirements.",
    image: "/images/trr.jpg",
  },
  {
    id: 5,
    title: "Electrical Equipment Manufacturers",
    description:"Components for electrical equipment manufacturing applications.",
    image: "/images/eem.jpg",
  },
  {
    id: 6,
    title: "Power Transmission & Distribution",
    description:"Supporting insulation component requirements across power transmission and distribution projects.",
    image: "/images/ptd.jpg",
  },
];

const ManufacturingProcess = () => {
    return (
    <>
      <TopBar />

      <Header />

      <main className="industries-page">

        <section className="heading-section">
          <div className="heading-overlay"></div>

          <div className="heading-content">
            <h1>Industries We Serve</h1>
            <h2>Transformer and Electrical Industry Applications</h2>
            <p>
              Our transformer insulation components are manufactured for a range of transformer, electrical equipment and power-sector applications.
            </p>
          </div>
        </section>


        <section className="industry-page-section">
          <div className="industry-container">

            {/* Header */}
            {/* <div className="industry-header">
              <p className="industry-intro">
                Thirteen sectors. One metallurgical standard. Specification-led
                copper and brass, batch after batch.
              </p>

              <a href="/contact" className="application-btn">
                DISCUSS YOUR APPLICATION
                <span>↗</span>
              </a>
            </div> */}

            {/* Cards */}
            <div className="industry-grid">
              {industries.map((industry, index) => (
                <div className="industry-card" key={index}>
                  
                  <div className="industry-image">
                    <img src={industry.image} alt={industry.title} />
                    <div className="image-overlay"></div>
                  </div>

                  <div className="industry-content">
                    <h3>{industry.title}</h3>
                    <p>{industry.description}</p>
                  </div>

                </div>
              ))}
            </div>

          </div>
        </section>


        <RequirementForm title="Looking for a Component for Your Application?" description="Share your application, drawing or component requirement with our team." />

        <Footer />
        
      </main>
    </>
  );
};

export default ManufacturingProcess;
