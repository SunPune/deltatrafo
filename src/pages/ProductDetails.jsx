import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import TopBar from "../components/TopBar";
import Header from "../components/Header";
import RequirementForm from "../components/RequirementForm";
import Footer from "../components/Footer";

import "./ProductDetails.css";

const API_URL = "/api/products";

function ProductDetails() {

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

  const { slug } = useParams();

  //const product = products[slug];
  const product = products.find(
  (item) => item.slug === slug
);

  const [selectedImage, setSelectedImage] = useState("");

  useEffect(() => {
    setSelectedImage(product?.images?.[0] || "");
  }, [product]);

  if (!product) {
    return (
      <div className="product-not-found">
        <h2>Product Not Found</h2>
        <Link to="/products">Back to Products</Link>
      </div>
    );
  }

  return (
    <>
      <TopBar />

      <Header />
      <main className="product-page">

        <div className="product-details-page">

        {/* Breadcrumb */}
        <div className="product-breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to="/products">Products</Link>
            <span>/</span>
            <span>{product.name}</span>
        </div>

        <div className="product-details-container">

            {/* LEFT SIDE */}
            <div className="product-gallery">

            <div className="product-thumbnails">
                {product.images.map((image, index) => (
                <button
                    key={index}
                    className={`thumbnail ${
                    selectedImage === image ? "active" : ""
                    }`}
                    onClick={() => setSelectedImage(image)}
                >
                    <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    />
                </button>
                ))}
            </div>

            <div className="product-main-image">
                {selectedImage && (
                  <img
                    src={selectedImage}
                    alt={product?.name || "Product image"}
                  />
                )}
            </div>

            </div>

            {/* RIGHT SIDE */}
            <div className="product-information">

            <h1>{product.name}</h1>

            <p className="product-short-description">
                {product.shortDescription}
            </p>

            <div className="product-divider"></div>

            <h3>Product Description</h3>

            <p className="product-description">
                {product.description}
            </p>

            {product.specifications?.length > 0 && (
                <>
                    <h3>Key Specifications</h3>

                    <div className="product-specifications">
                        {product.specifications.map(([label, value], index) => (
                            <div className="specification-row" key={index}>
                                <div className="specification-label">
                                    {label}
                                </div>

                                <div className="specification-value">
                                    {value}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            <Link
                to="/contact-us"
                className="product-enquiry-button"
            >
                Enquire Now
            </Link>

            </div>

        </div>
        </div>

        <RequirementForm title="Have a Drawing or Custom Requirement?" description="Share your drawing, CAD data, sample, dimensions, material
            requirement, and quantity with our team for discussion." />
        <Footer />

      </main>
    </>
  );
}

export default ProductDetails;