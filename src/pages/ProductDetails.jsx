import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";

import TopBar from "../components/TopBar";
import Header from "../components/Header";
import RequirementForm from "../components/RequirementForm";
import Footer from "../components/Footer";

import "./ProductDetails.css";

const products = {
  "insulation-boards-blocks": {
    name: "Insulation Boards & Blocks",
    shortDescription:
      "",
    description:
      "Transformer insulation boards and blocks manufactured according to specified dimensions and material requirements.",
    images: [
      "/images/product-1.jpg",
      "/images/product-2.jpg",
      "/images/product-3.jpg",
    ],
    specifications: [
      ["Material", "Iron"],
      ["Dimensions", "10x10"],
      ["Thickness / Size", "11 KV"],
      ["Drawing Reference", "50 Hz"],
      ["Tolerance, where applicable", "Three Phase"],
      ["Finish / Surface Requirement, where applicable", "ONAN / ONAF"],
      ["Application", "ONAN / ONAF"],
      ["Customization Availability", "ONAN / ONAF"],
    ],
  },

  "rings-end-rings": {
    name: "Rings & End Rings",
    shortDescription:
      "Reliable power transformers engineered for efficient high-voltage applications.",
    description:
      "Precisely manufactured rings and end rings for transformer insulation applications.",
    images: [
      "/images/product-1.jpg",
      "/images/product-2.jpg",
      "/images/product-3.jpg",
    ],
    specifications: [
      ["Material", "Iron"],
      ["Dimensions", "10x10"],
      ["Thickness / Size", "11 KV"],
      ["Drawing Reference", "50 Hz"],
      ["Tolerance, where applicable", "Three Phase"],
      ["Finish / Surface Requirement, where applicable", "ONAN / ONAF"],
      ["Application", "ONAN / ONAF"],
      ["Customization Availability", "ONAN / ONAF"],
    ],
  },
  "cylinders": {
    name: "Cylinders",
    description: "Insulation cylinders manufactured to required dimensions, drawings and material specifications.",
    images: ["/images/product-3.jpg"],
    specifications: [
      ["Material", "Iron"],
      ["Dimensions", "10x10"],
      ["Thickness / Size", "11 KV"],
      ["Drawing Reference", "50 Hz"],
      ["Tolerance, where applicable", "Three Phase"],
      ["Finish / Surface Requirement, where applicable", "ONAN / ONAF"],
      ["Application", "ONAN / ONAF"],
      ["Customization Availability", "ONAN / ONAF"],
    ],
  },
    "spacers": {
      name: "Spacers",
      description: "Transformer insulation spacers manufactured for specified applications and dimensional requirements.",
      images: ["/images/product-4.jpg"],
    specifications: [
      ["Material", "Iron"],
      ["Dimensions", "10x10"],
      ["Thickness / Size", "11 KV"],
      ["Drawing Reference", "50 Hz"],
      ["Tolerance, where applicable", "Three Phase"],
      ["Finish / Surface Requirement, where applicable", "ONAN / ONAF"],
      ["Application", "ONAN / ONAF"],
      ["Customization Availability", "ONAN / ONAF"],
    ],
  },
  "barriers": {
      name: "Barriers",
      name: "Barriers",
      description: "Insulation barriers manufactured according to transformer design and assembly requirements.",
      images: ["/images/product-5.jpg"],
    specifications: [
      ["Material", "Iron"],
      ["Dimensions", "10x10"],
      ["Thickness / Size", "11 KV"],
      ["Drawing Reference", "50 Hz"],
      ["Tolerance, where applicable", "Three Phase"],
      ["Finish / Surface Requirement, where applicable", "ONAN / ONAF"],
      ["Application", "ONAN / ONAF"],
      ["Customization Availability", "ONAN / ONAF"],
    ],
  },
  "supports": {
      name: "Supports",
      description: "Insulation support components for transformer assembly applications.",
      image: ["/images/product-6.jpg"],
    specifications: [
      ["Material", "Iron"],
      ["Dimensions", "10x10"],
      ["Thickness / Size", "11 KV"],
      ["Drawing Reference", "50 Hz"],
      ["Tolerance, where applicable", "Three Phase"],
      ["Finish / Surface Requirement, where applicable", "ONAN / ONAF"],
      ["Application", "ONAN / ONAF"],
      ["Customization Availability", "ONAN / ONAF"],
    ],
  },
  "washers": {
      name: "Washers",
      description: "Insulation washers manufactured to required dimensions and specifications.",
      image: ["/images/product-7.jpg"],
    specifications: [
      ["Material", "Iron"],
      ["Dimensions", "10x10"],
      ["Thickness / Size", "11 KV"],
      ["Drawing Reference", "50 Hz"],
      ["Tolerance, where applicable", "Three Phase"],
      ["Finish / Surface Requirement, where applicable", "ONAN / ONAF"],
      ["Application", "ONAN / ONAF"],
      ["Customization Availability", "ONAN / ONAF"],
    ],
  },
  "angle-rings": {
      name: "Angle Rings",
      description: "Angle rings manufactured for transformer insulation applications.",
      images: ["/images/product-8.jpg"],
    specifications: [
      ["Material", "Iron"],
      ["Dimensions", "10x10"],
      ["Thickness / Size", "11 KV"],
      ["Drawing Reference", "50 Hz"],
      ["Tolerance, where applicable", "Three Phase"],
      ["Finish / Surface Requirement, where applicable", "ONAN / ONAF"],
      ["Application", "ONAN / ONAF"],
      ["Customization Availability", "ONAN / ONAF"],
    ],
  },


  "radial-axial-spacers": {
      name: "Radial & Axial Spacers",
    description: "Spacers manufactured according to application-specific dimensional requirements.",
    images: ["/images/product-8.jpg"],
    specifications: [
      ["Material", "Iron"],
      ["Dimensions", "10x10"],
      ["Thickness / Size", "11 KV"],
      ["Drawing Reference", "50 Hz"],
      ["Tolerance, where applicable", "Three Phase"],
      ["Finish / Surface Requirement, where applicable", "ONAN / ONAF"],
      ["Application", "ONAN / ONAF"],
      ["Customization Availability", "ONAN / ONAF"],
    ],
  },
  "insulation-strips": {
     name: "Insulation Strips",
    description: "Insulation strips manufactured from specified insulation materials and dimensions.",
    images: ["/images/product-8.jpg"],
    specifications: [
      ["Material", "Iron"],
      ["Dimensions", "10x10"],
      ["Thickness / Size", "11 KV"],
      ["Drawing Reference", "50 Hz"],
      ["Tolerance, where applicable", "Three Phase"],
      ["Finish / Surface Requirement, where applicable", "ONAN / ONAF"],
      ["Application", "ONAN / ONAF"],
      ["Customization Availability", "ONAN / ONAF"],
    ],
  },
  "winding-insulation": {
      name: "Winding Insulation",
    description: "Components for transformer winding insulation applications.",
    images: ["/images/product-8.jpg"],
    specifications: [
      ["Material", "Iron"],
      ["Dimensions", "10x10"],
      ["Thickness / Size", "11 KV"],
      ["Drawing Reference", "50 Hz"],
      ["Tolerance, where applicable", "Three Phase"],
      ["Finish / Surface Requirement, where applicable", "ONAN / ONAF"],
      ["Application", "ONAN / ONAF"],
      ["Customization Availability", "ONAN / ONAF"],
    ],
  },
  "core-insulation-components": {
      name: "Core Insulation Components",
    description: "Components for transformer core insulation applications.",
    images: ["/images/product-8.jpg"],
    specifications: [
      ["Material", "Iron"],
      ["Dimensions", "10x10"],
      ["Thickness / Size", "11 KV"],
      ["Drawing Reference", "50 Hz"],
      ["Tolerance, where applicable", "Three Phase"],
      ["Finish / Surface Requirement, where applicable", "ONAN / ONAF"],
      ["Application", "ONAN / ONAF"],
      ["Customization Availability", "ONAN / ONAF"],
    ],
  },
  "clamping-components": {
      name: "Clamping Components",
    description: "Insulation components for transformer clamping applications.",
    images: ["/images/product-8.jpg"],
    specifications: [
      ["Material", "Iron"],
      ["Dimensions", "10x10"],
      ["Thickness / Size", "11 KV"],
      ["Drawing Reference", "50 Hz"],
      ["Tolerance, where applicable", "Three Phase"],
      ["Finish / Surface Requirement, where applicable", "ONAN / ONAF"],
      ["Application", "ONAN / ONAF"],
      ["Customization Availability", "ONAN / ONAF"],
    ],
  },
  "customized-insulation-parts": {
      name: "Customized Insulation Parts",
      description: "Components manufactured according to customer drawings, CAD data, samples, dimensions, material specifications and quantities.",
      images: ["/images/product-8.jpg"],
    specifications: [
      ["Material", "Iron"],
      ["Dimensions", "10x10"],
      ["Thickness / Size", "11 KV"],
      ["Drawing Reference", "50 Hz"],
      ["Tolerance, where applicable", "Three Phase"],
      ["Finish / Surface Requirement, where applicable", "ONAN / ONAF"],
      ["Application", "ONAN / ONAF"],
      ["Customization Availability", "ONAN / ONAF"],
    ],
  },
};

function ProductDetails() {
  const { slug } = useParams();

  const product = products[slug];

  const [selectedImage, setSelectedImage] = useState(
    product?.images?.[0] || ""
  );

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
                <img
                src={selectedImage}
                alt={product.name}
                />
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

            <Link
                to="/contactus"
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