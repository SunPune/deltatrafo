import React, { useEffect, useRef, useState } from "react";
import "./ProductSection.css";

const API_URL = "/api/products";

const products1 = [
  { id: 1, name: "Insulation Boards & Blocks", image: "/images/product-1.jpg", description: "Transformer insulation boards and blocks manufactured to specified dimensions and material requirements." },
  { id: 2, name: "Rings & End Rings", image: "/images/product-2.jpg", description: "Precisely manufactured rings and end rings for transformer insulation applications." },
  { id: 3, name: "Spacers", image: "/images/product-3.jpg", description: "Insulation spacers manufactured according to application and dimensional requirements." },
  { id: 4, name: "Barriers & Supports", image: "/images/product-4.jpg", description: "Insulation barriers and support components for transformer assembly applications." },
  { id: 5, name: "Winding & Core Insulation", image: "/images/product-5.jpg", description: "Insulation components for transformer winding and core applications." },
  { id: 6, name: "Customized Insulation Parts", image: "/images/product-6.jpg", description: "Components manufactured according to customer drawings, CAD data, samples and specifications." },
];

function ProductSection({productData}) {

  if (!productData) {
    return null;
  }
  
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


  const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
  
    useEffect(() => {
      let cancelled = false;
  
      async function loadProducts() {
        try {
          const response = await fetch(API_URL);
  
          if (!response.ok) {
            throw new Error(`Unable to load products (${response.status})`);
          }
  
          const result = await response.json();
  
          // Backend returns an object keyed by product slug.
          const productList = Array.isArray(result)
            ? result
            : Object.entries(result).map(([slug, product]) => ({
                ...product,
                slug,
              }));
  
          if (!cancelled) {
            setProducts(productList);
          }
        } catch (err) {
          console.error("Unable to load products:", err);
  
          if (!cancelled) {
            setError("Unable to load products. Please try again later.");
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      }
  
      loadProducts();
  
      return () => {
        cancelled = true;
      };
    }, []);

  if(cardsToShow > 9) {
    setCardsToShow(8);
  }
  const sliderProducts = [
    ...products.slice(-cardsToShow),
    ...products,
    ...products.slice(0, cardsToShow),
  ];

  console.log("Slider Products:", sliderProducts);

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

  const createSlug = (title) => {

    if (typeof title !== "string" || !title.trim()) {
      return "";
    }

    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  
  return (
    <section className="products-section" id="products">
      <div className="container">

        <div className="section-heading">
          <span className="section-subtitle">{productData.title}</span>
          <h2>{productData.subtitle}</h2>
          <p>{productData.description}</p>
        </div>

        <div className="products-slider" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>

          <button type="button" className="slider-arrow slider-prev" onClick={previousSlide} aria-label="Previous products">←</button>

          <div className="products-slider-window">
            <div className="products-slider-track" style={{ transform: `translateX(-${currentIndex * (100 / cardsToShow)}%)`, transition: isTransitioning ? "transform 0.55s ease" : "none" }} onTransitionEnd={handleTransitionEnd}>

              {sliderProducts.map((product, index) => (
                <div className="product-slide" style={{ flex: `0 0 ${100 / cardsToShow}%` }} key={`${product.id}-${index}`}>
                  <a href={`/products/${product.id}`} className="product-link"><div className="product-card">

                    <div className="product-image">
                      <img src={product.images?.[0]} alt={product.name} loading="lazy" />
                    </div>

                    <div className="product-content">
                      <h3>{product.name}</h3>
                      <p>{product.description}</p>
                      <a href={`/products/${createSlug(product.name)}`} className="product-link">View Product <span>→</span></a>
                    </div>

                  </div></a>
                </div>
              ))}

            </div>
          </div>

          <button type="button" className="slider-arrow slider-next" onClick={nextSlide} aria-label="Next products">→</button>

        </div>

        <div className="slider-dots">
          {products.map((product, index) => (
            <button type="button" key={product.id} className={`slider-dot ${activeDot === index ? "active" : ""}`} onClick={() => { setIsTransitioning(true); setCurrentIndex(cardsToShow + index); }} aria-label={`Go to ${product.name}`} />
          ))}
        </div>

        <div className="products-cta">
          <a href="/products" className="show-more-btn">View All Products <span>→</span></a>
        </div>

      </div>
    </section>
  );
}

export default ProductSection;