import React, { useEffect, useRef, useState } from "react";

import TopBar from "../components/TopBar";
import Header from "../components/Header";
import RequirementForm from "../components/RequirementForm";
import Footer from "../components/Footer";
import "./ProductListing.css";

const products = [
  {
    id: 1,
    name: "Insulation Boards & Blocks",
    description: "Transformer insulation boards and blocks manufactured according to specified dimensions and material requirements.",
    image: "/images/product-1.jpg",
  },
  {
    id: 2,
    name: "Rings & End Rings",
    description: "Precisely manufactured rings and end rings for transformer insulation applications.",
    image: "/images/product-2.jpg",
  },
  {
    id: 3,
    name: "Cylinders",
    description: "Insulation cylinders manufactured to required dimensions, drawings and material specifications.",
    image: "/images/product-3.jpg",
  },
  {
    id: 4,
    name: "Spacers",
    description: "Transformer insulation spacers manufactured for specified applications and dimensional requirements.",
    image: "/images/product-4.jpg",
  },
  {
    id: 5,
    name: "Barriers",
    description: "Insulation barriers manufactured according to transformer design and assembly requirements.",
    image: "/images/product-5.jpg",
  },
  {
    id: 6,
    name: "Supports",
    description: "Insulation support components for transformer assembly applications.",
    image: "/images/product-6.jpg",
  },
  {
    id: 7,
    name: "Washers",
    description: "Insulation washers manufactured to required dimensions and specifications.",
    image: "/images/product-7.jpg",
  },
  {
    id: 8,
    name: "Angle Rings",
    description: "Angle rings manufactured for transformer insulation applications.",
    image: "/images/product-8.jpg",
  },
  {
    id: 9,
    name: "Radial & Axial Spacers",
    description: "Spacers manufactured according to application-specific dimensional requirements.",
    image: "/images/product-8.jpg",
  },
  {
    id: 10,
    name: "Insulation Strips",
    description: "Insulation strips manufactured from specified insulation materials and dimensions.",
    image: "/images/product-8.jpg",
  },
  {
    id: 11,
    name: "Winding Insulation",
    description: "Components for transformer winding insulation applications.",
    image: "/images/product-8.jpg",
  },
  {
    id: 12,
    name: "Core Insulation Components",
    description: "Components for transformer core insulation applications.",
    image: "/images/product-8.jpg",
  },
  {
    id: 13,
    name: "Clamping Components",
    description: "Insulation components for transformer clamping applications.",
    image: "/images/product-8.jpg",
  },
  {
    id: 14,
    name: "Customized Insulation Parts",
    description: "Components manufactured according to customer drawings, CAD data, samples, dimensions, material specifications and quantities.",
    image: "/images/product-8.jpg",
  },
];

const ProductCard = ({ product, index }) => {
  const cardRef = useRef(null);
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
        threshold: 0.15,
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);


  const createSlug = (title) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const slug = createSlug(product.name);

  return (
    <div
      ref={cardRef}
      className={`product-card ${isVisible ? "show" : ""}`}
      style={{ transitionDelay: `${index * 0.1}s` }}
    >
      <div className="product-image">
        <img src={product.image} alt={product.name} />

        <span className="product-badge">
          New
        </span>
      </div>

      <div className="product-content">
        <h3>{product.name}</h3>

        <p>{product.description}</p>

        <div className="product-bottom">
          <a href={`/products/${slug}`}>
            <button className="product-button">
              View Details
            </button>
          </a>
        </div>
      </div>
    </div>
  );
};

const ProductListing = () => {
  return (
    <>
      <TopBar />

      <Header />
      <main className="product-page">

        {/* Page Header */}
        <section className="heading-section">
          <div className="heading-overlay"></div>

          <div className="heading-content">
            <h1>Our Products</h1>
            <h2>Transformer Insulation Parts & Accessories</h2>
            <p>
              Delta Trafo Manufacturer manufactures and supplies transformer insulation components for electrical and transformer industry applications. Components can be manufactured according to customer drawings, CAD data, samples, dimensions, material specifications and quantity requirements.
            </p>
          </div>
        </section>

        {/* Product Grid */}
        <section className="product-section">
          <div className="product-container">
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
              />
            ))}
          </div>
        </section>


        <RequirementForm title="Have a Drawing or Custom Requirement?" description="Share your drawing, CAD data, sample, dimensions, material
            requirement, and quantity with our team for discussion." />

        <Footer />

      </main>
    </>
  );
};

export default ProductListing;