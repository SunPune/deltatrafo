import React, { useState } from "react";
import "./ContactForm.css";

const GOOGLE_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSf5zLTOt8zNXzGHMkSDvLBXd2DRAx-85q2_T-duWSX2By_UMw/formResponse";

const FIELD_IDS = {
  name: "entry.109470832",
  email: "entry.864432315",
  phone: "entry.355294430",
  subject: "entry.2108734763",
  message: "entry.234183425",
};

function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setSubmitted(false);
    setError("");

    const formBody = new FormData();

    formBody.append(FIELD_IDS.name, formData.name);
    formBody.append(FIELD_IDS.email, formData.email);
    formBody.append(FIELD_IDS.phone, formData.phone);
    formBody.append(FIELD_IDS.subject, formData.subject);
    formBody.append(FIELD_IDS.message, formData.message);

    try {
      await fetch(GOOGLE_FORM_URL, {
        method: "POST",
        mode: "no-cors",
        body: formBody,
      });

      /*
       * Google Forms does not expose the response to React
       * because of browser CORS restrictions.
       *
       * Therefore this means the request was sent.
       */
      setSubmitted(true);

      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <section className="contact-section">
      <div className="container">

        <div className="contact-wrapper">
            <div className="contact-info">
                <span className="section-subtitle">
                Get in Touch
                </span>
              <h2>Have a Transformer Insulation Requirement?</h2>
              <p>Share your drawing, CAD data, sample or component requirements with our team.</p>
            </div>
          

          <div className="contact-form-wrapper">

            

            {submitted && (
              <div className="success-message">
                Thank you! Your enquiry has been submitted successfully.
              </div>
            )}

            <form onSubmit={handleSubmit} className="enquiry-form">

              <div className="form-row">

                <div className="form-group">
                  <label>Name *</label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email *</label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                  />
                </div>

              </div>

              <div className="form-row">

                <div className="form-group">
                  <label>Phone</label>

                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="form-group">
                  <label>Subject</label>

                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Enter subject"
                  />
                </div>

              </div>

              <div className="form-group">
                <label>Message *</label>

                <textarea
                  name="message"
                  rows="6"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Enter your message"
                  required
                />
              </div>

              <button type="submit" className="submit-btn">
                Send an Enquiry
              </button>

            </form>

          </div>

        </div>

      </div>
    </section>
  );
}

export default ContactForm;