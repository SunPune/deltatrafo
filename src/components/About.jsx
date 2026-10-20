import {
  useEffect,
  useState
} from "react";


const API_URL = "";


function About({aboutData}) {

  if (!aboutData) {

    return null;

  }


  return (

    <section
      className="about-section"
      id="about"
    >

      <div
        className="container about-container"
      >

        <div className="about-image">

          <img
            src={aboutData.image}
            alt="About DeltaTrafo"
          />

        </div>


        <div className="about-content">

          <span className="section-label">
            ABOUT US
          </span>

          <h2>
            {aboutData.title}
          </h2>

          <h3>
            {aboutData.subtitle}
          </h3>

          <p>
            {aboutData.description}
          </p>

          <a
            href="/about-us"
            className="about-button"
          >
            {aboutData.cta_name}
          </a>

        </div>

      </div>

    </section>

  );

}


export default About;