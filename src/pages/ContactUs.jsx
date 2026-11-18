import React, { useEffect, useRef, useState } from "react";
import usePageMeta from "../hooks/usePageMeta";

import TopBar from "../components/TopBar";
import Header from "../components/Header";
import Footer from "../components/Footer";

import ContactForm from "../components/ContactForm";

import "./ContactUs.css";

const ContactUs = () => {

  usePageMeta(
    "Contact Us | Delta Trafo",
    "Get in touch with Delta Trafo, a manufacturer specializing in transformer insulation parts and accessories with customized manufacturing solutions."
  );

  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  const [aboutData, setAboutData] = useState(null);
  
  useEffect(() => {

    loadAboutData();

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { 
        threshold: 0.2,
      }
    );
    
    if (sectionRef.current) { 
      observer.observe(sectionRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const loadAboutData = async () => {

    try {

      const response = await fetch(
        `/api/home-data`
      );

      const result = await response.json();

      if (result.success) {

        setAboutData(
          result.data.contact
        );

      }

    } catch (error) {

      console.error(
        "Unable to load About data:",
        error
      );

    }

  };
  
  const isMobile = window.innerWidth <= 480;

  const style = {
    backgroundImage: `url("${
      isMobile
        ? aboutData?.mob_image || aboutData?.image
        : aboutData?.image
    }")`,
  };
  
  return (
    <>
      <TopBar />

      <Header />

      <main class="contact-us-page">

        <section className="heading-section" style={style}>
          <div className="heading-overlay"></div>

          <div className="heading-content">
            <h1>{aboutData?.title || ""}</h1>
            <h2>{aboutData?.subtitle || ""}</h2>
            <p>
              {aboutData?.description || ""}
            </p>
          </div>
        </section>

        <section ref={sectionRef} className={`contact-section ${isVisible ? "show" : ""}`}>
            <div className="contact-container">
              <div className="contact-map">
                <iframe title="DELTA TRAFO MANUFACTURER" src="https://www.google.com/maps?q=PLOT NO. OP-22,NEO LOGISTICS PARK,USATANE VILLAGE,KHONI-TALOJA MIDC ROAD,OPP. ASHSIH COMPANY,TALUKA-AMBERNATH,THANE,MAHARASHTRA,INDIA&output=embed" width="100%" height="450" style={{ border: 0 }} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade" ></iframe>
              </div>
              <div className="contact-info">
                <h2>CONTACT US</h2>
                <p className="contact-intro"> CONTACT DELTA TRAFO MANUFACTURER. </p>
                <div className="contact-item">
                  <h4>FACTORY ADDRESS</h4>
                  <p>PLOT NO. OP-22, NEO LOGISTICS PARK, USATANE VILLAGE,<br />
                    KHONI-TALOJA MIDC ROAD, OPP. ASHSIH COMPANY,<br />
                    TALUKA-AMBERNATH, THANE - 410208,<br />
                    MAHARASHTRA, INDIA<br />
                    <b>Phone:</b> +91 8454997117 | 8424010865<br />
                    <b>Email:</b> deltatrafom@gmail.com
                  </p>
                </div>
                
              </div>
            </div>
          </section>

          <ContactForm />

          <Footer />
          
      </main>
    </>
  );
};

export default ContactUs;