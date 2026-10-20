import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import { useEffect, useState } from "react";

import TopBar from "./components/TopBar";
import Header from "./components/Header";
import HeroCarousel from "./components/HeroCarousel";
import About from "./components/About";
import ProductSection from "./components/ProductSection";
import WhyDeltaTrafo from "./components/WhyDeltaTrafo";
import IndustrySection from "./components/IndustrySection";
import ManufacturingProcess from "./components/ManufacturingProcess";
import QualityAssuranceInspectionControls from "./components/QualityAssuranceInspectionControls";
import Certifications from "./components/Certifications";

import ContactForm from "./components/ContactForm";
import Footer from "./components/Footer";

import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import Products from "./pages/ProductListing";
import ProductDetails from "./pages/ProductDetails";
import CapabilitiesQuality from "./pages/CapabilitiesQuality";
import Industries from "./pages/Industries";


import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProducts from "./pages/AdminProducts";



import "./App.css";


function HomePage() {

  const [aboutData, setAboutData] = useState(null);
  const [productData, setproductData] = useState(null);

  const loadAbout = async () => {

  try {
      const response = await fetch(
        `/api/home-data`
      );

      if (!response.ok) {
        throw new Error("Failed to load home data");
      }

      const result = await response.json();

      if (result.success) {
        setAboutData(result.data.about);
        setproductData(result.data.products);
      }
    } catch (error) {
      console.error("Unable to load About data:", error);
    }
  };

  useEffect(() => {
    loadAbout();
  }, []);

  return (

    <>
      <TopBar />

      <Header />

      <main className="home-page">

        <HeroCarousel />

        <About aboutData={aboutData}/>

        <ProductSection productData={productData}/>

        <WhyDeltaTrafo />

        <IndustrySection />

        <ManufacturingProcess />

        <QualityAssuranceInspectionControls />

        <Certifications />

        <ContactForm />

        {/* <section
          id="contact"
          className="contact-section"
        >

          <div className="container">

            <span className="section-label">
              CONTACT US
            </span>

            <h2>
              Get In Touch
            </h2>

            <p>
              Have a requirement?
              Contact DeltaTrafo today.
            </p>

          </div>

        </section> */}

        <Footer />

      </main>

    </>

  );

}


function App() {

  return (

    <BrowserRouter>

      <Routes>

        {/* Public Website */}

        <Route
          path="/"
          element={<HomePage />}
        />


        {/* Admin Login */}

        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />


        {/* Admin Dashboard */}

        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/Products" element={<AdminProducts />} />

        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/products" element={<Products />} />
        <Route path="/capabilities-quality" element={<CapabilitiesQuality />} />
        <Route path="/industries" element={<Industries />} />
        <Route path="/products/:slug"  element={<ProductDetails />}
/>

      </Routes>

    </BrowserRouter>

  );

}

export default App;