import React, { useState } from "react";
import "./IndustrySection.css";

const industries = [
  {
    id: 1,
    title: "Transformer Manufacturers",
    image: "/images/tm-is.jpg",
  },
  {
    id: 2,
    title: "Distribution Transformer Manufacturers",
    image: "/images/DeltaTrafo_Distribution_Transformer_Manufacturers.jpeg",
  },
  {
    id: 3,
    title: "Power Transformer Manufacturers",
    image: "/images/business3.jpg",
  },
  {
    id: 4,
    title: "Transformer Repair & Refurbishment",
    image: "/images/business3.jpg",
  },
  {
    id: 5,
    title: "Electrical Equipment Manufacturers",
    image: "/images/business3.jpg",
  },
  {
    id: 6,
    title: "Power Transmission & Distribution",
    image: "/images/business3.jpg",
  },
];

const IndustrySection = () => {
  const [activeId, setActiveId] = useState(1);

  return (
    <section className="industry-section">
      <div className="container">
        {/* Section Heading */}
        <div className="industry-header">

          <span className="section-subtitle">Industries Served</span>

          <h1>Industries We Serve</h1>

          <p>
            Delivering high-quality insulation solutions and engineered products
            for diverse industries, enabling reliable performance, safety, and
            long-term efficiency.
          </p>
        </div>

        {/* Expandable Cards */}
        <div className="industry-wrapper">
          {industries.map((industry) => (
            <div
              key={industry.id}
              className={`industry-card ${
                activeId === industry.id ? "active" : ""
              }`}
              style={{
                backgroundImage: `url(${industry.image})`,
              }}
              onMouseEnter={() => setActiveId(industry.id)}
            >
              <div className="industry-overlay"></div>

              <div className="industry-content">
                <h2>{industry.title}</h2>
              </div>
            </div>
          ))}
        </div>

        <a
            href="/contact-us"
            className="about-button"
          >
            Explore Applications
        </a>
      </div>
    </section>
  );
};

export default IndustrySection;
