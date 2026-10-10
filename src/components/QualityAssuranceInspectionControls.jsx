import React, { useEffect, useState } from "react";
import "./QualityAssuranceInspectionControls.css";

const processes = [
  {
    id: 1,
    title: "Incoming Material Verification",
    description:
      "Verify material identity, condition and specified requirements before production.",
  },
  {
    id: 2,
    title: "Dimensional Inspection",
    description:
      "Check critical dimensions against approved drawings and defined requirements.",
  },
  {
    id: 3,
    title: "Visual & Surface Inspection",
    description:
      "Check appearance, surface condition, edges and overall workmanship.",
  },
  {
    id: 4,
    title: "Process Control",
    description:
      "Monitor cutting, machining and forming operations for process conformity.",
  },
  {
    id: 5,
    title: "Material Storage & Handling",
    description:
      "Protect materials and components from moisture, leakage, contamination and physical damage.",
  },
  {
    id: 6,
    title: "Final Quality Release",
    description:
      "Complete final inspection and approval before packing and dispatch.",
  },
];

const QualityAssuranceInspectionControls = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const items = document.querySelectorAll(".quality-assurance-item");

      let currentIndex = 0;
      let closestDistance = Infinity;

      items.forEach((item, index) => {
        const rect = item.getBoundingClientRect();

        const distance = Math.abs(
          rect.top - window.innerHeight * 0.45
        );

        if (distance < closestDistance) {
          closestDistance = distance;
          currentIndex = index;
        }
      });

      setActiveIndex(currentIndex);
    };

    window.addEventListener("scroll", handleScroll);

    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const progress =
    ((activeIndex + 1) / processes.length) * 100;

  return (
    <section className="manufacturing-section">

      <div className="manufacturing-container">

        {/* HEADER */}

        <div className="manufacturing-header">
          <span className="section-label">
            Capabilities & Quality Teaser
          </span>

          <h2>
            Quality Assurance & Inspection Controls
          </h2>

          <p>
            Quality is integrated throughout our manufacturing process, from incoming material verification and in-process controls to final inspection, packing and dispatch.
          </p>
        </div>


        {/* PROCESS AREA */}

        <div className="manufacturing-process">

          {/* LEFT CURRENT PROCESS */}

          <div className="manufacturing-current">

            <div
              className="manufacturing-circle"
              style={{
                "--progress": `${progress}%`,
              }}
            >
              <div className="manufacturing-circle-inner">
                <span>
                  {String(activeIndex + 1).padStart(2, "0")}
                </span>

                <small>
                  / {String(processes.length).padStart(2, "0")}
                </small>
              </div>
            </div>

            <div className="manufacturing-active-content">

              {/* <span className="manufacturing-label">
                CURRENT PROCESS
              </span> */}

              <h3>
                {processes[activeIndex].title}
              </h3>

              <p>
                {processes[activeIndex].description}
              </p>

            </div>

          </div>


          {/* RIGHT VERTICAL LIST */}

          <div className="quality-assurance">

            {processes.map((process, index) => (
              <div
                className={`quality-assurance-item ${
                  activeIndex === index ? "active" : ""
                }`}
                key={process.id}
              >

                <div className="quality-assurance-number">
                  {String(process.id).padStart(2, "0")}
                </div>

                <div className="process-title">
                  {process.title}
                </div>

              </div>
            ))}

          </div>

        </div>

      </div>

    </section>
  );
};

export default QualityAssuranceInspectionControls;