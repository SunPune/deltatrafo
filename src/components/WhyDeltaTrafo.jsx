import React from "react";
import "./WhyDeltaTrafo.css";

const features = [
  {
    icon: "⚡",
    title: "30+ Years ",
    description: "Experience in the transformer industry.",
  },
  {
    icon: "🛡️",
    title: "Customized Manufacturing",
    description: "Manufacturing based on drawings, CAD data, samples and specified requirements.",
  },
  {
    icon: "⚙️",
    title: "Quality Focus",
    description: "Defined checks covering material verification, dimensional accuracy, visual inspection, process control and final inspection.",
  },
  {
    icon: "🤝",
    title: "Customer Focus",
    description: "A requirement-oriented approach to product dimensions, materials, quantities and application needs.",
  },
];

const WhyDeltaTrafo = () => {
  return (
    <section className="features-section">
      <div className="container WhyDeltaTrafo-container">
        <div className="features-container">
          <div className="features-header">
            <span className="section-subtitle">
                  Why Us
            </span>
            <h2>Why Delta Trafo</h2>
            <p>
              Our approach combines transformer-industry experience, customized manufacturing capability and defined quality practices.
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div className="feature-card" key={index}>
                <div className="feature-icon">{feature.icon}</div>

                <div className="feature-content">
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyDeltaTrafo;