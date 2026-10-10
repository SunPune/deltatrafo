import { useState, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";

function Header() {

  const [menuOpen, setMenuOpen] = useState(false);
  const currentPath = window.location.pathname;

  const menuRef = useRef(null);
  const burgerRef = useRef(null);

  // Close menu when clicking outside nav and burger button
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        burgerRef.current &&
        !burgerRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <header className="main-header">

      <div className="container header-content">
        
        <a href="/" className="logo">
          <img
            src="/images/deltatrafo-logo.png"
            alt="DeltaTrafo"
            className="logo"
          />
        </a>

        <nav ref={menuRef} className={menuOpen ? "navigation active" : "navigation"}>

          <a href="/" className={currentPath === "/" ? "active" : ""} onClick={() => setMenuOpen(false)}>
            Home
          </a>

          <a href="/about-us" className={currentPath === "/about-us" ? "active" : ""} onClick={() => setMenuOpen(false)}>
            About Us
          </a>

          <a href="/products" className={currentPath.startsWith("/products") ? "active" : ""} onClick={() => setMenuOpen(false)}>
            Products
          </a>

          <a href="/capabilities-quality" className={currentPath === "/capabilities-quality" ? "active" : ""} onClick={() => setMenuOpen(false)}>
            Capabilities & Quality
          </a>

          <a href="/industries" className={currentPath === "/industries" ? "active" : ""} onClick={() => setMenuOpen(false)}>
            Industries
          </a>

          <a href="/contact-us" className={currentPath === "/contact-us" ? "active" : ""} onClick={() => setMenuOpen(false)}>
            Contact Us
          </a>

          {/* Only visible inside mobile burger menu */}
          <a
            href="/contact-us"
            className="mobile-enquire"
            onClick={() => setMenuOpen(false)}
          >
            Enquire Now →
          </a>

        </nav>

        {/* <button
          className="menu-button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button> */}

        <button
          type="button"
          className="enquire-now"
          onClick={() => (window.location.href = "/contact-us")}
        >
          Enquire Now
        </button>

        {/* Burger menu */}
      <button
        type="button"
        ref={burgerRef}
        className={`burger-menu ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle navigation menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
        
      </div>

    </header>
  );
}

export default Header;