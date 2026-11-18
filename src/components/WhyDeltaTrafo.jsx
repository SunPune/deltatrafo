
import React from "react";
import "./WhyDeltaTrafo.css";

const WhyDeltaTrafo = (props) => {

  // Support different ways of passing props
  const section =
    props?.data ||
    props?.WhyDeltaTrafoData ||
    props;

  if (!section?.title && !section?.description) {
    return null;
  }

  return (
    <section className="features-section">
      <div className="container WhyDeltaTrafo-container">
        <div className="features-container">

          <div className="features-header">

            <span className="section-subtitle">
              {section.subtitle}
            </span>

            <h2>{section.title}</h2>

            <p>{section.description}</p>

          </div>

          <div className="features-grid">

            {section.items?.map((feature, index) => (
              <div className="feature-card" key={index}>

                <div className="feature-icon">

                  {feature.icon ? (
                    <img
                      src={feature.iconImage}
                      alt={feature.title || ""}
                    />
                  ) : (
                    feature.icon
                  )}

                </div>

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
