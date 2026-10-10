import React, { useState } from "react";
import "./RequirementForm.css";

const RequirementForm = ({title, description}) => {
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    quantity: "",
    material: "",
    message: "",
    file: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Form Data:", formData);

    // Add your API call here
  };

  return (
    <section className="requirement-form-section">
      <div className="requirement-form-container">

        <div className="requirement-form-header">

          <h2>{title}</h2>

          <p>
            {description}
          </p>
        </div>

        <form
          className="requirement-form"
          onSubmit={handleSubmit}
        >
          <div className="form-row">

            <div className="form-group">
              <label htmlFor="name">
                Name <span>*</span>
              </label>

              <input
                type="text"
                id="name"
                name="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="company">
                Company Name
              </label>

              <input
                type="text"
                id="company"
                name="company"
                placeholder="Enter company name"
                value={formData.company}
                onChange={handleChange}
              />
            </div>

          </div>

          <div className="form-row">

            <div className="form-group">
              <label htmlFor="email">
                Email <span>*</span>
              </label>

              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">
                Phone Number
              </label>

              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

          </div>

          <div className="form-row">

            <div className="form-group">
              <label htmlFor="material">
                Material Requirement
              </label>

              <input
                type="text"
                id="material"
                name="material"
                placeholder="e.g. Epoxy, FRP, Pressboard"
                value={formData.material}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="quantity">
                Quantity
              </label>

              <input
                type="text"
                id="quantity"
                name="quantity"
                placeholder="Enter required quantity"
                value={formData.quantity}
                onChange={handleChange}
              />
            </div>

          </div>

          <div className="form-group">
            <label htmlFor="file">
              Drawing / CAD Data / Sample
            </label>

            <input
              type="file"
              id="file"
              name="file"
              accept=".pdf,.dwg,.dxf,.step,.stp,.iges,.igs,.jpg,.jpeg,.png,.zip"
              onChange={handleChange}
            />

            <small>
              Accepted: PDF, DWG, DXF, STEP, IGES, JPG, PNG, ZIP
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="message">
              Requirement Details
            </label>

            <textarea
              id="message"
              name="message"
              rows="5"
              placeholder="Please describe your requirement, dimensions, specifications, etc."
              value={formData.message}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="requirement-submit">
            Submit Requirement
            <span>→</span>
          </button>
        </form>

      </div>
    </section>
  );
};

export default RequirementForm;