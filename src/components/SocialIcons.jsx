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
      <a
        href="https://instagram.com/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram"
      >
        <FontAwesomeIcon icon={faInstagram} />
      </a>

      <a
        href="https://facebook.com/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Facebook"
      >
        <FontAwesomeIcon icon={faFacebookF} />
      </a>

      <a
        href="https://wa.me/919999999999"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
      >
        <FontAwesomeIcon icon={faWhatsapp} />
      </a>

      <a
        href="https://linkedin.com/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="LinkedIn"
      >
        <FontAwesomeIcon icon={faLinkedinIn} />
      </a>

      <a
        href="https://youtube.com/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="YouTube"
      >
        <FontAwesomeIcon icon={faYoutube} />
      </a>
    </div>
  );
};

export default SocialIcons;