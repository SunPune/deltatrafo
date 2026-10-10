import React, { useEffect, useRef, useState } from "react";

import TopBar from "../components/TopBar";
import Header from "../components/Header";

import Certifications from "../components/Certifications";
import RequirementForm from "../components/RequirementForm";
import QualityAssuranceInspectionControls from "../components/QualityAssuranceInspectionControls";

import Footer from "../components/Footer";

import "./CapabilitiesQuality.css";
import "../components/Certifications.css";

const ManufacturingProcess = () => {

  const cards = [
  {
    icon: "01",
    title: "Customer Requirement / Drawing",
    description: "Understand the customer's drawing, design and component requirements.",
  },
  {
    icon: "02",
    title: "Technical Review",
    description:
      "Review technical requirements before manufacturing.",
  },
  {
    icon: "03",
    title: "Material Selection",
    description:
      "Select materials according to approved requirements.",
  },
  {
    icon: "04",
    title: "Cutting / Processing",
    description:
      "Process the selected material to the required dimensions.",
  },
  {
    icon: "05",
    title: "Machining / Forming",
    description:
      "Machine and form components according to the required design.",
  },
  {
    icon: "06",
    title: "Dimensional Inspection",
    description:
      "Check critical dimensions against the approved drawing or requirement.",
  },
  {
    icon: "07",
    title: "Final Quality Inspection",
    description:
      "Complete final inspection before release.",
  },
  {
    icon: "08",
    title: "Packing & Protection",
    description:
      "Protect components appropriately for storage and dispatch.",
  },
  {
    icon: "09",
    title: "Dispatch",
    description:
      "Prepare approved components for dispatch.",
  },
];

const industries = [
  {
    id: 1,
    title: "Transformer Manufacturers",
    description:"Insulation components for transformer manufacturing applications.",
    image: "/images/business1.jpg",
  },
  {
    id: 2,
    title: "Distribution Transformer Manufacturers",
    description:"Components supporting distribution transformer manufacturing requirements.",
    image: "/images/business2.jpg",
  },
  {
    id: 3,
    title: "Power Transformer Manufacturers",
    description:"Insulation components for power transformer manufacturing applications.",
    image: "/images/business3.jpg",
  },
  {
    id: 4,
    title: "Transformer Repair & Refurbishment",
    description:"Components for transformer repair and refurbishment requirements.",
    image: "/images/business3.jpg",
  },
  {
    id: 5,
    title: "Electrical Equipment Manufacturers",
    description:"Components for electrical equipment manufacturing applications.",
    image: "/images/business3.jpg",
  },
  {
    id: 6,
    title: "Power Transmission & Distribution",
    description:"Supporting insulation component requirements across power transmission and distribution projects.",
    image: "/images/business3.jpg",
  },
];

  




  const [start, setStart] = useState(0);
   const [start1, setStart1] = useState(0);

  const next = () => {
    
    if (start < cards.length - 4) {
      setStart((prev) => (prev + 1) % cards.length);
    }
  };

  const prev = () => {
    if (start > 0) {
      setStart((prev) => (prev - 1 + cards.length) % cards.length);
    }
  };

  const next1 = () => {
    
    setStart1((prev1) => (prev1 + 1) % industries.length);

  };

  const prev1 = () => {
      setStart1((prev1) => (prev1 - 1 + industries.length) % industries.length);
  };

  // const visibleIndustries = industries.slice(start1, start1 + 4);
  const visibleIndustries = [
    industries[start1 % industries.length],
    industries[(start1 + 1) % industries.length],
    industries[(start1 + 2) % industries.length],
    industries[(start1 + 3) % industries.length],
  ];


  const visibleCards = [
    cards[start % cards.length],
    cards[(start + 1) % cards.length],
    cards[(start + 2) % cards.length],
    cards[(start + 3) % cards.length],
  ];


  const products = [
  { id: 1, name: "Belt Sander", image: "/images/product-1.jpg", description: "" },
  { id: 2, name: "Dust Collector", image: "/images/product-2.jpg", description: "." },
  { id: 3, name: "Band Saw", image: "/images/product-3.jpg", description: "" },
  { id: 4, name: "Roller Bender – 3.2 Meter", image: "/images/product-4.jpg", description: "" },
  { id: 5, name: "Nut Cutting Machine", image: "/images/product-5.jpg", description: "" },
  { id: 6, name: "10 Ton Power Press – Winding Spacer", image: "/images/product-6.jpg", description: "" },
  { id: 7, name: "Panel Saw", image: "/images/product-1.jpg", description: "" },
  { id: 8, name: "Nut Drilling Machine", image: "/images/product-2.jpg", description: "." },
  { id: 9, name: "Edge Rounding & T Spacer Machine", image: "/images/product-3.jpg", description: "" },
  { id: 10, name: "Storage Rack", image: "/images/product-4.jpg", description: "" },
  { id: 11, name: "Drilling & Tapping Machine – KP Nut", image: "/images/product-5.jpg", description: "" },
  { id: 12, name: "Radial Drilling Machine", image: "/images/product-6.jpg", description: "" },
  { id: 13, name: "Pasting Press Machine", image: "/images/product-1.jpg", description: "" },
  { id: 14, name: "Multiple Strip Cutting", image: "/images/product-2.jpg", description: "." },
  { id: 15, name: "Block Milling Machine", image: "/images/product-3.jpg", description: "" },
  { id: 16, name: "Hexagonal Drum", image: "/images/product-4.jpg", description: "" },
];

  const [cardsToShow, setCardsToShow] = useState(3);
    const [currentIndex, setCurrentIndex] = useState(3);
    const [isPaused, setIsPaused] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(true);
    const touchStartX = useRef(0);
  
    const getCardsToShow = () => {
      if (window.innerWidth <= 600) return 1;
      if (window.innerWidth <= 992) return 2;
      return 3;
    };
  
    useEffect(() => {
      const handleResize = () => {
        const newCardsToShow = getCardsToShow();
        setCardsToShow(newCardsToShow);
        setIsTransitioning(false);
        setCurrentIndex(newCardsToShow);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setIsTransitioning(true));
        });
      };
  
      handleResize();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);
  
    const sliderProducts = [
      ...products.slice(-cardsToShow),
      ...products,
      ...products.slice(0, cardsToShow),
    ];
  
    const nextSlide = () => {
      if (isTransitioning) setCurrentIndex((prev) => prev + 1);
    };
  
    const previousSlide = () => {
      if (isTransitioning) setCurrentIndex((prev) => prev - 1);
    };
  
    useEffect(() => {
      if (isPaused) return;
  
      const interval = setInterval(nextSlide, 4000);
      return () => clearInterval(interval);
    }, [isPaused, isTransitioning]);
  
    const handleTransitionEnd = () => {
      if (currentIndex >= products.length + cardsToShow) {
        setIsTransitioning(false);
        setCurrentIndex(cardsToShow);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setIsTransitioning(true));
        });
      }
  
      if (currentIndex < cardsToShow) {
        setIsTransitioning(false);
        setCurrentIndex(products.length + currentIndex);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setIsTransitioning(true));
        });
      }
    };
  
    const handleTouchStart = (e) => {
      touchStartX.current = e.touches[0].clientX;
    };
  
    const handleTouchEnd = (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const difference = touchStartX.current - touchEndX;
  
      if (difference > 50) nextSlide();
      if (difference < -50) previousSlide();
    };
  
    const activeDot = ((currentIndex - cardsToShow) % products.length + products.length) % products.length;
  
  

    return (
    <>
      <TopBar />

      <Header />

      <main className="capabilities-quality-page">

        <section className="heading-section">
          <div className="heading-overlay"></div>

          <div className="heading-content">
            <h1>Capabilities & Quality</h1>
            <h2>Manufacturing Process, Facilities and Quality Assurance</h2>
            <p>
              Our manufacturing approach combines technical review, material selection, processing, machining, dimensional inspection, final quality inspection and controlled packing and dispatch.
            </p>
          </div>
        </section>

        <section className="why-us">

      <div className="why-header">
        <h2>Manufacturing Process</h2>
      </div>

      <div className="slider">

        {/* Left Arrow */}
        {start > 0 && (
        <button className="slider-btn left" onClick={prev}>
          ←
        </button>
        )}

        {/* Cards */}
        <div className="cards-container">
          {visibleCards.map((card, index) => (
            <div className="why-card" key={`${card.title}-${index}`}>

              <div className="card-icon">
                {card.icon}
              </div>

              <h3>{card.title}</h3>

              <p>{card.description}</p>

              {/* Flow Arrow */}
              {index < 3 && (
                <div className="card-arrow">
                  →
                </div>
              )}

            </div>
          ))}
        </div>

        {/* Right Arrow */}
        {start < cards.length - 4 && (
        <button className="slider-btn right" onClick={next}>
          →
        </button>
        )}

      </div>

    </section>

        <section className="products-section" id="products">
          <div className="container">

            <div className="section-heading">
              <h2>Manufacturing Facilities</h2>
              <p>Use authentic machine/facility photographs from the company profile where possible. Suggested machine captions:</p>
            </div>

            <div className="products-slider" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>

              <button type="button" className="slider-arrow slider-prev" onClick={previousSlide} aria-label="Previous products">←</button>

              <div className="products-slider-window">
                <div className="products-slider-track" style={{ transform: `translateX(-${currentIndex * (100 / cardsToShow)}%)`, transition: isTransitioning ? "transform 0.55s ease" : "none" }} onTransitionEnd={handleTransitionEnd}>

                  {sliderProducts.map((product, index) => (
                    <div className="product-slide" style={{ flex: `0 0 ${100 / cardsToShow}%` }} key={`${product.id}-${index}`}>
                      <div className="product-card">

                        <div className="product-image">
                          <img src={product.image} alt={product.name} loading="lazy" />
                        </div>

                        <div className="product-content">
                          <h3>{product.name}</h3>
                          <p>{product.description}</p>
                        </div>

                      </div>
                    </div>
                  ))}

                </div>
              </div>

              <button type="button" className="slider-arrow slider-next" onClick={nextSlide} aria-label="Next products">→</button>

            </div>

            {/* <div className="slider-dots">
              {products.map((product, index) => (
                <button type="button" key={product.id} className={`slider-dot ${activeDot === index ? "active" : ""}`} onClick={() => { setIsTransitioning(true); setCurrentIndex(cardsToShow + index); }} aria-label={`Go to ${product.name}`} />
              ))}
            </div> */}

          </div>
        </section>


        <QualityAssuranceInspectionControls />


        <section className="industry-page-section">
          <div className="container">

            <div className="section-heading">
              <h2>Safety & Material Protection</h2>
              <p>Safety awareness and appropriate handling practices are maintained across manufacturing, storage and handling activities. Insulation materials should be protected from moisture, leakage, contamination and physical damage.</p>
            </div>
          

          <div className="industry-container">

            {/* Cards Slider */}
            <div className="industry-slider">

              {/* Previous Button */}
                <button
                  className="industry-arrow industry-prev"
                  onClick={prev1}
                  aria-label="Previous"
                >
                  ←
                </button>


              <div className="industry-grid">
                {visibleIndustries.map((industry, index) => (
                  <div className="industry-card" key={industry.title || index}>

                    <div className="industry-image">
                      <img
                        src={industry.image}
                        alt={industry.title}
                      />
                      <div className="image-overlay"></div>
                    </div>

                    <div className="industry-content">
                      <h3>{industry.title}</h3>
                      <p>{industry.description}</p>
                    </div>

                  </div>
                ))}
              </div>

              {/* Next Button */}
                <button
                  className="industry-arrow industry-next"
                  onClick={next1}
                  aria-label="Next"
                >
                  →
                </button>
  

            </div>
            </div>
          </div>
        </section>


        <Certifications />

        <RequirementForm title="Have a Component Requirement?" description="Send us your drawing, CAD data or sample details to discuss your manufacturing requirement." />

        <Footer />
        
      </main>
    </>
  );
};

export default ManufacturingProcess;