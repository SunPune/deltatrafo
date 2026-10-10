import React from "react";
import "./OurBusinesses.css";

const businesses = [
  {
    id: 1,
    title: "Transformer Manufacturers",
    image: "/images/business1.jpg",
  },
  {
    id: 2,
    title: "Distribution Transformer Manufacturers",
    image: "/images/business2.jpg",
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

function OurBusinesses() {
  return (
    <section className="business-section">
      <div className="container">

        <div className="section-heading">
          {/* <span className="section-subtitle">Our Businesses</span> */}

          <h2>
            Industries We Serve
          </h2>

          <p>
            Transformer and electrical industry applications
          </p>
        </div>

        <div className="business-grid">
          {businesses.map((business) => (
            <div className="business-card" key={business.id}>

              <div className="business-image">
                <img
                  src={business.image}
                  alt={business.title}
                />
              </div>

              <div className="business-content">
                <h3>{business.title}</h3>

                <p>{business.description}</p>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default OurBusinesses;