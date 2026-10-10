import React, { useEffect, useRef, useState } from "react";

import TopBar from "../components/TopBar";
import Header from "../components/Header";


import Certifications from "../components/Certifications";
import ContactForm from "../components/ContactForm";

import Footer from "../components/Footer";

import "./AboutUs.css";

const AboutSection = ({
  title,
  description,
  image,
  imageAlt,
  imageLeft = false,
  parentClass,
}) => {
  const sectionRef = useRef(null); 
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        } 
      },
      {
        threshold: 0.25,
      }
    );
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => {
      observer.disconnect();
    };
  }, []);

  return ( 
    <section ref={sectionRef} className={`about-section ${isVisible ? "show" : ""} ${parentClass || ""}`} >
      <div className={`about-container ${ imageLeft ? "image-left" : "image-right" }`} >
        {/* Image */}
        <div className="about-image">
          <img src={image} alt={imageAlt} />
        </div>
        {/* Content */}
        <div className="about-content">
          {/* <span className="about-label">ABOUT US</span> */}
          <h2>{title}</h2>
          <p>{description}</p>
          {/* <button className="about-button"> Learn More </button> */}
          </div>
          </div>
    </section>
    );
  };
    
  const AboutUs = () => {
    return (
    <>
      <TopBar />

      <Header />

      <main className="about-page">

        <section className="heading-section">
          <div className="heading-overlay"></div>

          <div className="heading-content">
            <h1>About Delta Trafo</h1>
            <p>
              Specialized Manufacturing of Transformer Insulation Parts & Accessories.
            </p>
          </div>
        </section>
        {/* Section 1 Left Text - Right Image */}
        <AboutSection parentClass="company-overview" title="Company Overview" description="Delta Trafo Manufacturer is a specialized manufacturing company focused on the production and supply of transformer insulation parts and components for the electrical and transformer industry. With 30 years of experience in the transformer industry, our focus is on manufacturing reliable, accurately manufactured and application-oriented insulation components that support transformer assembly and electrical insulation requirements." image="/images/about-1.jpg" imageAlt="Company Overview" imageLeft={false} />
        {/* Section 2 Left Image - Right Text */}
        <AboutSection parentClass="our-experience" title="Our Experience" description="Our experience in the transformer industry informs our understanding of insulation component requirements, dimensional accuracy, material selection and customer-specific manufacturing needs." image="/images/about-2.png" imageAlt="Our Experience" imageLeft={true} />
        {/* Section 3 Left Text - Right Image */}
        <AboutSection parentClass="our-manufacturing-approach" title="Our Manufacturing Approach" description="We manufacture components according to customer drawings, CAD drawings, samples, required dimensions, transformer design requirements, material specifications and quantity requirements. This enables us to support both standard component requirements and application-specific manufacturing requirements." image="/images/about-3.png" imageAlt="Our Manufacturing Approach" imageLeft={false} />
        <AboutSection parentClass="vision" title="Vision" description="To establish Delta Trafo Manufacturer as a trusted and reliable name in the transformer insulation component industry by delivering quality products, developing strong customer relationships and continuously improving manufacturing capabilities." image="/images/about-4.png"  imageAlt="Our vision" imageLeft={true} />
        <AboutSection parentClass="mission" title="Mission" description="To manufacture and supply reliable transformer insulation components that meet customer requirements while maintaining a strong commitment to quality, precision, reliability, safety, customer satisfaction and continuous improvement." image="/images/about-5.png"  imageAlt="Mission" imageLeft={false} />


        <section className="features-section">
          <div className="features-container">
            <div className="features-header">
              <h2>Our Values</h2>
              
            </div>

            <div className="features-grid">
              <div className="feature-card" key="1">
                {/* <div className="feature-icon">{feature.icon}</div> */}

                <div className="feature-content">
                  <h3>Quality</h3>
                  <p>Quality is at the center of everything we manufacture.</p>
                </div>
              </div>

              <div className="feature-card" key="1">
                <div className="feature-content">
                  <h3>Precision</h3>
                  <p>Attention to dimensional and manufacturing requirements.</p>
                </div>
              </div>

              <div className="feature-card" key="1">
                <div className="feature-content">
                  <h3>Integrity</h3>
                  <p>Transparent and professional business practices.</p>
                </div>
              </div>

              <div className="feature-card" key="1">
                <div className="feature-content">
                  <h3>Reliability</h3>
                  <p>Dependable products and services.</p>
                </div>
              </div>

              <div className="feature-card" key="1">
                <div className="feature-content">
                  <h3>Innovation</h3>
                  <p>Continuous improvement in manufacturing methods and solutions.</p>
                </div>
              </div>

              <div className="feature-card" key="1">
                <div className="feature-content">
                  <h3>Customer First</h3>
                  <p>Understanding and fulfilling customer requirements is our priority.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Certifications />

        <ContactForm />

        <Footer />
        
      </main>
    </>
  );
};

export default AboutUs;