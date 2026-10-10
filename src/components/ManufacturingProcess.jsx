import React, { useEffect, useRef, useState } from "react";
import "./ManufacturingProcess.css";

const processItems = [
  {
    id: 1,
    number: "01",
    title: "Customer Requirement",
    description:
      "Review drawings, CAD data, samples, dimensions, materials and quantities.",
  },
  {
    id: 2,
    number: "02",
    title: "Technical Review",
    description:
      "Review technical and manufacturing requirements before production.",
  },
  {
    id: 3,
    number: "03",
    title: "Material Selection",
    description:
      "Select materials according to specified requirements and application.",
  },
  {
    id: 4,
    number: "04",
    title: "Cutting / Processing",
    description:
      "Process insulation material to the required dimensions.",
  },
  {
    id: 5,
    number: "05",
    title: "Machining / Forming",
    description:
      "Manufacture components according to the required configuration and dimensions.",
  },
  {
    id: 6,
    number: "06",
    title: "Dimensional Inspection",
    description:
      "Verify dimensions and conformity against defined requirements.",
  },
  {
    id: 7,
    number: "07",
    title: "Final Quality Inspection",
    description:
      "Perform final dimensional, visual and surface quality checks.",
  },
  {
    id: 8,
    number: "08",
    title: "Packing & Protection",
    description:
      "Protect finished components against moisture, contamination and damage.",
  },
  {
    id: 9,
    number: "09",
    title: "Dispatch",
    description:
      "Prepare inspected and packed components for delivery.",
  },
];

const ManufacturingProcess = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const section = sectionRef.current;

      if (!section) return;

      const rect = section.getBoundingClientRect();

      /*
       * Total distance through which the sticky
       * section should remain active.
       */
      const scrollHeight = section.offsetHeight - window.innerHeight;

      if (scrollHeight <= 0) return;

      /*
       * Current scroll progress:
       *
       * 0 = beginning
       * 1 = end
       */
      let progress = -rect.top / scrollHeight;

      progress = Math.max(0, Math.min(1, progress));

      /*
       * Divide complete scroll into 9 stages.
       *
       * 0.00 - 0.11 = 01
       * 0.11 - 0.22 = 02
       * ...
       * 0.89 - 1.00 = 09
       */
      let index = Math.floor(progress * processItems.length);

      /*
       * Very important:
       * Prevent index 9 because array ends at 8.
       */
      index = Math.min(
        index,
        processItems.length - 1
      );

      setActiveIndex(index);
    };

    window.addEventListener(
      "scroll",
      handleScroll,
      { passive: true }
    );

    handleScroll();

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, []);

  /*
   * Keep exactly 3 rows visible.
   *
   * Beginning:
   * 01
   * 02
   * 03
   *
   * Middle:
   * 03
   * 04
   * 05
   *
   * End:
   * 07
   * 08
   * 09
   */

  let startIndex = activeIndex - 1;

  /*
   * At beginning, don't go below 0.
   */
  if (startIndex < 0) {
    startIndex = 0;
  }

  /*
   * At end, keep exactly 3 items.
   */
  if (
    startIndex >
    processItems.length - 3
  ) {
    startIndex =
      processItems.length - 3;
  }

  const visibleItems = processItems.slice(
    startIndex,
    startIndex + 3
  );

  return (
    <section
      ref={sectionRef}
      className="process-section"
    >

      <div className="process-sticky">

        <div className="process-container">

          {/* Heading */}

          <div className="section-heading">

            <span className="section-subtitle">
              Manufacturing Process
            </span>

            <h2>
              Transformer Insulation Components
            </h2>

            <p>
              We manufacture and supply a range
              of transformer insulation components
              and customized parts for transformer
              and electrical applications.
            </p>

          </div>


          {/* Process list */}

          <div className="process-list">

            {visibleItems.map(
              (item, visibleIndex) => {

                const actualIndex =
                  startIndex + visibleIndex;

                const isActive =
                  actualIndex === activeIndex;

                return (
                  <div
                    key={item.number}
                    className={`process-item ${
                      isActive
                        ? "active"
                        : ""
                    }`}
                  >

                    <span className="process-number">
                      {item.number}
                    </span>

                    <h3>
                      {item.title}
                    </h3>

                  </div>
                );
              }
            )}

          </div>


          {/* Description */}

          <div className="process-description">

            <span className="description-line"></span>

            <p
              key={activeIndex}
              className="description-text"
            >
              {
                processItems[
                  activeIndex
                ].description
              }
            </p>

          </div>

          <a
            href="/capabilities-quality"
            className="about-button"
          >
            Explore Capabilities
          </a>

        </div>

      </div>

    </section>
  );
};

export default ManufacturingProcess;