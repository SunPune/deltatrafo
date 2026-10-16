import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";
import SocialIcons from "./SocialIcons";
import ScrollTopButton from "../components/ScrollTopButton";

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-container">

        {/* Company */}
        <div className="footer-column footer-company">
          <Link to="/" className="footer-logo">
            <img
              src="/images/deltatrafo-logo.png"
              alt="DeltaTrafo"
            />
          </Link>

          <p>
            Delta Trafo Manufacturer — Specialized manufacturing and supply of transformer insulation parts and accessories.
          </p>
        </div>

        {/* Footer Menu */}
        <div className="footer-column">
          <h3>Quick Links</h3>

          <ul className="footer-menu">
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/about-us">About Us</Link>
            </li>
            <li>
              <Link to="/products">Products</Link>
            </li>
            <li>
              <Link to="/capabilities-quality">Capabilities & Quality</Link>
            </li>
            <li>
              <Link to="/industries">Industries</Link>
            </li>
            <li>
              <Link to="/contact-us">Contact Us</Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div className="footer-column">
          <h3>Contact Us</h3>

          <ul className="footer-contact">
            <li>
              📍 PLOT NO. OP-22, NEO LOGISTICS PARK, USATANE VILLAGE,
KHONI-TALOJA MIDC ROAD, OPP. ASHSIH COMPANY,
TALUKA-AMBERNATH, THANE - 410208,
MAHARASHTRA, INDIA
            </li>

            <li>
              📞 <a href="tel:+918454997117">+91 8454997117</a> | <a href="tel:+918424010865">+91 8424010865</a>
            </li>

            <li>
              ✉️{" "}
              <a href="mailto:deltatrafom@gmail.com">
                deltatrafom@gmail.com
              </a>
            </li>
          </ul>
        </div>

        {/* Social */}
        {/* <div className="footer-column">
          <h3>Follow Us</h3>

          <div className="footer-social">
            <a href="#" aria-label="Facebook">
              Facebook
            </a>

            <a href="#" aria-label="LinkedIn">
              LinkedIn
            </a>

            <a href="#" aria-label="Instagram">
              Instagram
            </a>
          </div>
        </div> */}

      </div>

      {/* Bottom Footer */}
      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <p>
            © Delta Trafo Manufacturer. All Rights Reserved.
          </p>

          <div className="footer-bottom-links">
            <div className="static_link">
            <Link
              to="#"
              onClick={(e) => e.preventDefault()}
              className="disabled-link"
              aria-disabled="true"
            >
              Privacy Policy
            </Link> |
            <Link
              to="#"
              onClick={(e) => e.preventDefault()}
              className="disabled-link"
              aria-disabled="true"
            >
              Terms & Conditions
            </Link>
            </div>
            <SocialIcons />
          </div>
        </div>
      </div>
      <ScrollTopButton />
    </footer>
  );
};

export default Footer;