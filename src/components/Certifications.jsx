import React, { useEffect, useState } from "react";
import "./Certifications.css";

const certificates = [
  {
    id: 1,
    code: "ISO 14001:2015",
    title: "Environmental Management System",
    image: "/images/certificate-1.jpg",
  },
  {
    id: 2,
    code: "ISO 9001:2015",
    title: "Quality Management System",
    image: "/images/certificate-2.jpg",
  },
  {
    id: 3,
    code: "ISO 45001:2018",
    title: "Occupational Health & Safety Management System",
    image: "/images/certificate-3.jpg",
  },
];

const CertificateSlider = () => {
  const [activeIndex, setActiveIndex] = useState(1);
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  /*
   * NEXT
   */
  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % certificates.length);
  };

  /*
   * PREVIOUS
   */
  const prevSlide = () => {
    setActiveIndex(
      (prev) => (prev - 1 + certificates.length) % certificates.length
    );
  };

  /*
   * AUTO PLAY
   */
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  /*
   * POPUP
   */
  const openPopup = (certificate) => {
    setSelectedCertificate(certificate);
  };

  const closePopup = () => {
    setSelectedCertificate(null);
  };

  /*
   * ESC KEY
   */
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closePopup();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  /*
   * FIND POSITION
   *
   * -1 = left
   *  0 = center
   *  1 = right
   */
  const getPosition = (index) => {
    const total = certificates.length;

    let position = index - activeIndex;

    if (position > total / 2) {
      position -= total;
    }

    if (position < -total / 2) {
      position += total;
    }

    return position;
  };

  /*
   * CLICK CERTIFICATE
   *
   * Side certificate -> make active
   * Center certificate -> open popup
   */
  const handleCertificateClick = (certificate, position, index) => {
    if (position === 0) {
      openPopup(certificate);
    } else {
      setActiveIndex(index);
    }
  };

  return (
    <>
      <section className="certificate-section">

        {/* =========================
            HEADING
        ========================== */}

        <div className="certificate-heading">

          <span class="section-subtitle">Certifications</span>

          <h2>Quality & Management Systems</h2>

          <p>
            Certified management systems supporting the manufacturing of transformer insulation parts and accessories.
          </p>

        </div>

        {/* =========================
            SLIDER
        ========================== */}

        <div className="certificate-slider">

          {certificates.map((certificate, index) => {
            const position = getPosition(index);

            /*
             * ONLY SHOW:
             * previous
             * active
             * next
             */
            if (Math.abs(position) > 1) {
              return null;
            }

            return (
              <div
                key={certificate.id}
                className={`
                  certificate-card
                  ${
                    position === 0
                      ? "certificate-active"
                      : ""
                  }
                  ${
                    position === -1
                      ? "certificate-left"
                      : ""
                  }
                  ${
                    position === 1
                      ? "certificate-right"
                      : ""
                  }
                `}
                onClick={() =>
                  handleCertificateClick(
                    certificate,
                    position,
                    index
                  )
                }
              >
                <span>{certificate.code}</span>
                <p>{certificate.title}</p>
                <img
                  src={certificate.image}
                  alt={`Certificate ${certificate.id}`}
                />

                {/* Dark overlay only for side certificates */}
                {position !== 0 && (
                  <div className="certificate-overlay"></div>
                )}

              </div>
            );
          })}

          {/* =========================
              LEFT ARROW
          ========================== */}

          <button
            className="
              certificate-arrow
              certificate-arrow-left
            "
            onClick={prevSlide}
            aria-label="Previous certificate"
          >
            {/* &#10094; */}
            ←
          </button>

          {/* =========================
              RIGHT ARROW
          ========================== */}

          <button
            className="
              certificate-arrow
              certificate-arrow-right
            "
            onClick={nextSlide}
            aria-label="Next certificate"
          >
            {/* &#10095; */}
            →
          </button>

        </div>
      </section>

      {/* =========================
          POPUP
      ========================== */}

      {selectedCertificate && (
        <div
          className="certificate-popup"
          onClick={closePopup}
        >

          <div
            className="certificate-popup-content"
            onClick={(event) => event.stopPropagation()}
          >

            {/* CLOSE */}

            <button
              className="certificate-popup-close"
              onClick={closePopup}
              aria-label="Close"
            >
              &times;
            </button>

            {/* LARGE IMAGE */}

            <div>
            <img
              src={selectedCertificate.image}
              alt={`Certificate ${selectedCertificate.id}`}
            />
            <h3>{selectedCertificate.code}</h3>
            <p>{selectedCertificate.title}</p>
            </div>
          </div>

        </div>
      )}
    </>
  );
};

export default CertificateSlider;