import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInstagram,
  faFacebookF,
  faWhatsapp,
  faLinkedinIn,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";

const SocialIcons = () => {
  return (
    <div className="social-icons">
      {/* <a
        href="https://instagram.com/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram"
      >
        <FontAwesomeIcon icon={faInstagram} />
      </a> */}
      <span aria-label="Instagram">
        <FontAwesomeIcon icon={faInstagram} />
      </span>

      {/* <a
        href="#"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Facebook"
      >
        <FontAwesomeIcon icon={faFacebookF} />
      </a> */}
      <span aria-label="Facebook">
        <FontAwesomeIcon icon={faFacebookF} />
      </span>

      <a
        href="https://wa.me/918454997117"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
      >
        <FontAwesomeIcon icon={faWhatsapp} />
      </a>

      {/* <a
        href="https://linkedin.com/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="LinkedIn"
      >
        <FontAwesomeIcon icon={faLinkedinIn} />
      </a> */}
      <span aria-label="LinkedIn">
        <FontAwesomeIcon icon={faLinkedinIn} />
      </span>

      {/* <a
        href="https://youtube.com/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="YouTube"
      >
        <FontAwesomeIcon icon={faYoutube} />
      </a> */}
      <span aria-label="YouTube">
        <FontAwesomeIcon icon={faYoutube} />
      </span>
    </div>
  );
};

export default SocialIcons;
