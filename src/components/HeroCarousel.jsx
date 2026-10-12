import {
  useEffect,
  useState
} from "react";

import {
  ChevronLeft,
  ChevronRight
} from "lucide-react";


const API_URL = "";


function HeroCarousel() {

  const [banners, setBanners] = useState([]);

  const [current, setCurrent] =
    useState(0);

  const [loading, setLoading] =
    useState(true);


  useEffect(() => {

    loadBanners();

  }, []);


  const loadBanners = async () => {

    try {

      const response = await fetch(
        `${API_URL}/api/home-data`
      );

      const result =
        await response.json();

      if (result.success) {

        setBanners(
          result.data.banners
        );

      }

    } catch (error) {

      console.error(
        "Unable to load banners:",
        error
      );

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    if (banners.length <= 1) {
      return;
    }

    const interval =
      setInterval(() => {

        setCurrent((previous) =>
          previous ===
          banners.length - 1
            ? 0
            : previous + 1
        );

      }, 10000);


    return () =>
      clearInterval(interval);

  }, [banners]);


  const previousSlide = () => {

    setCurrent((previous) =>
      previous === 0
        ? banners.length - 1
        : previous - 1
    );

  };


  const nextSlide = () => {

    setCurrent((previous) =>
      previous === banners.length - 1
        ? 0
        : previous + 1
    );

  };


  if (loading) {

    return (
      <section className="hero">
        <div className="hero-loading">
          Loading...
        </div>
      </section>
    );

  }


  if (!banners.length) {

    return null;

  }


  return (

    <section
      className="hero"
      id="home"
    >

      {banners.map(
        (banner, index) => (

          <div
            key={banner.id}
            className={
              index === current
                ? "hero-slide active"
                : "hero-slide"
            }
          >

            <img
              src={banner.image}
              alt={banner.title}
            />

            <div className="hero-overlay">
            </div>


            {banner.showText && (

              <div
                className={`hero-content ${
                  banner.textPosition || "center"
                }`}
              >

                <h1>
                  {banner.title}
                </h1>

                <p>
                  {banner.description}
                </p>

                {banner.buttonHiden && (
                <a
                  href="#products"
                  className="hero-button"
                >
                  Explore Products
                </a>
                )}

              </div>

            )}

          </div>

        )
      )}


      {banners.length > 1 && (

        <>

          <button
            className="carousel-button previous"
            onClick={previousSlide}
            aria-label="Previous slide"
          >

            {/* <ChevronLeft size={30} /> */}
            ←

          </button>


          <button
            className="carousel-button next"
            onClick={nextSlide}
            aria-label="Next slide"
          >

            {/* <ChevronRight size={30} /> */}
            →

          </button>


          <div className="carousel-dots">

            {banners.map(
              (banner, index) => (

                <button
                  key={banner.id}
                  className={
                    index === current
                      ? "dot active"
                      : "dot"
                  }
                  onClick={() =>
                    setCurrent(index)
                  }
                  aria-label={
                    `Go to slide ${index + 1}`
                  }
                />

              )
            )}

          </div>

        </>

      )}

    </section>

  );

}


export default HeroCarousel;