import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

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


import "./App.css";


function HomePage() {

  return (

    <>
      <TopBar />

      <Header />

      <main>

        <HeroCarousel />

        <About />

        {/* <section
          id="products"
          className="placeholder-section"
        >

          <div className="container">

            <span className="section-label">
              OUR PRODUCTS
            </span>

            <h2>
              Transformer Products
            </h2>

            <p>
              Product information will be added here.
            </p>

          </div>

        </section> */}
        <ProductSection />

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

        <Route
          path="/admin/dashboard"
          element={<AdminDashboard />}
        />

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