import React, { useEffect, useRef, useState } from "react";

import TopBar from "../components/TopBar";
import Header from "../components/Header";
import Footer from "../components/Footer";

import ContactForm from "../components/ContactForm";

import "./ContactUs.css";

const ContactUs = () => {

  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
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
  
  
  return (
    <>
      <TopBar />

      <Header />

      <main class="contact-us-page">

        <section className="heading-section">
          <div className="heading-overlay"></div>

          <div className="heading-content">
            <h1>Contact Delta Trafo</h1>
            <p>
              Let's discuss your transformer insulation component requirements.
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