import React, { useEffect, useState } from "react";
import "./ScrollTopButton.css";

const ScrollTopButton = () => {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const documentHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      const scrollPercent =
        documentHeight > 0 ? (scrollTop / documentHeight) * 100 : 0;

      setActive(scrollPercent >= 30);
    };

    window.addEventListener("scroll", handleScroll);

    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      className={`scroll-top-button ${active ? "active" : ""}`}
      onClick={scrollToTop}
      aria-label="Scroll to top"
    >
      <span className="arrow">↑</span>
    </button>
  );
};

export default ScrollTopButton;