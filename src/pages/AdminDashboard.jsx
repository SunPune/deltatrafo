import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = "";
const TOKEN_KEY = "deltatrafo_admin_token";
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
];
const MAX_SIZE = 5 * 1024 * 1024;

// ------------------------------------------------
// Reusable image field (text path + file upload + preview)
// ------------------------------------------------
function ImageField({ label, value, onChange, onUpload, busy }) {
  return (
    <div className="admin-field">
      <label>{label} Path</label>

      <input
        type="text"
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
      />

      <label>Upload {label}</label>

      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(event) => onUpload(event, onChange)}
        disabled={busy}
      />

      {value && (
        <div className="admin-image-preview">
          <img
            src={value}
            alt={label}
            style={{ maxWidth: 200 }}
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
            onLoad={(event) => {
              event.currentTarget.style.display = "block";
            }}
          />

          <button type="button" onClick={() => onChange("")}>
            Remove Image
          </button>
        </div>
      )}
    </div>
  );
}


function IconUploadField({ value, onUpload, onChange, busy }) {
  return (
    <div className="admin-field">
      <label>Feature Icon Path</label>

      <input
        type="text"
        value={value || ""}
        placeholder="Enter icon image URL"
        onChange={(event) => onChange(event.target.value)}
      />

      <label>Upload Feature Icon</label>

      <input
        type="file"
        accept=".svg,.jpg,.jpeg,.png,.webp,image/svg+xml,image/jpeg,image/png,image/webp"
        onChange={(event) => onUpload(event, onChange)}
        disabled={busy}
      />

      {value && (
        <div className="admin-image-preview">
          <img
            src={value}
            alt="Feature Icon"
            style={{
              width: 60,
              height: 60,
              objectFit: "contain",
            }}
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
            onLoad={(event) => {
              event.currentTarget.style.display = "block";
            }}
          />

          <button
            type="button"
            onClick={() => onChange("")}
          >
            Remove Icon
          </button>
        </div>
      )}
    </div>
  );
}

function AdminDashboard() {
  const navigate = useNavigate();

  const [homeData, setHomeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const token = localStorage.getItem(TOKEN_KEY);

  // ------------------------------------------------
  // Check login
  // ------------------------------------------------
  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }
    loadHomeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ------------------------------------------------
  // Load JSON
  // ------------------------------------------------
  const loadHomeData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/home-data`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to load data");
      }

      setHomeData(result.data);
    } catch (error) {
      console.error(error);
      setMessage("Unable to load home data");
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------
  // Banners
  // ------------------------------------------------
  const updateBanner = (index, field, value) => {
    setHomeData((previous) => {
      const banners = [...previous.banners];
      banners[index] = { ...banners[index], [field]: value };
      return { ...previous, banners };
    });
  };

  const addBanner = () => {
    setHomeData((previous) => ({
      ...previous,
      banners: [
        ...previous.banners,
        {
          id: Date.now(),
          image: "",
          mob_image: "",
          title: "New Banner",
          description: "Enter banner description",
          showText: true,
          textPosition: "center",
          buttonHiden: false,
        },
      ],
    }));
  };

  const deleteBanner = (index) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) {
      return;
    }

    setHomeData((previous) => ({
      ...previous,
      banners: previous.banners.filter((_, i) => i !== index),
    }));
  };

  // ------------------------------------------------
  // About / Products
  // ------------------------------------------------
  const updateAbout = (field, value) => {
    setHomeData((previous) => ({
      ...previous,
      about: { ...previous.about, [field]: value },
    }));
  };

  const updateProducts = (field, value) => {
    setHomeData((previous) => ({
      ...previous,
      products: { ...previous.products, [field]: value },
    }));
  };

  const updateCapabilitiesQuality = (field, value) => {
    setHomeData((previous) => ({
      ...previous,
      "capabilities_quality": { ...previous["capabilities_quality"], [field]: value },
    }));
  };

  const updateIndustries = (field, value) => {
    setHomeData((previous) => ({
      ...previous,
      industries: { ...previous.industries, [field]: value },
    }));
  };

  const updateContact = (field, value) => {
    setHomeData((previous) => ({
      ...previous,
      contact: { ...previous.contact, [field]: value },
    }));
  };

  
// ------------------------------------------------
// Features Content
// ------------------------------------------------
const updateFeaturesContent = (field, value) => {
  setHomeData((previous) => ({
    ...previous,
    features: {
      ...previous.features,
      [field]: value,
    },
  }));
};

// ------------------------------------------------
// Features Items
// ------------------------------------------------
const updateFeatureItem = (index, field, value) => {
  setHomeData((previous) => {
    const items = [...(previous.features?.items || [])];

    items[index] = {
      ...items[index],
      [field]: value,
    };

    return {
      ...previous,
      features: {
        ...previous.features,
        items,
      },
    };
  });
};

const addFeature = () => {
  setHomeData((previous) => ({
    ...previous,
    features: {
      ...previous.features,
      items: [
        ...(previous.features?.items || []),
        {
          icon: "",
          iconImage: "",
          title: "",
          description: "",
        },
      ],
    },
  }));
};

const deleteFeature = (index) => {
  if (!window.confirm("Are you sure you want to delete this feature?")) {
    return;
  }

  setHomeData((previous) => ({
    ...previous,
    features: {
      ...previous.features,
      items: (previous.features?.items || []).filter(
        (_, i) => i !== index
      ),
    },
  }));
};


  // ------------------------------------------------
  // Save JSON
  // ------------------------------------------------
  const saveData = async () => {
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/api/home-data`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(homeData),
      });

      const result = await response.json();

      if (response.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        navigate("/admin/login");
        return;
      }

      if (!response.ok) {
        throw new Error(result.message || "Save failed");
      }

      setMessage("Home data saved successfully.");
    } catch (error) {
      console.error(error);
      setMessage(error.message || "Unable to save data");
    } finally {
      setSaving(false);
    }
  };

  // ------------------------------------------------
  // Logout
  // ------------------------------------------------
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    navigate("/admin/login");
  };

  // ------------------------------------------------
  // Upload image
  // onSuccess(url) decides WHERE the URL is saved
  // ------------------------------------------------
  const uploadImage = async (event, onSuccess) => {
    const input = event.target;
    const file = input.files?.[0];
    if (!file) return;

    const allowedExtensions = /\.(jpe?g|png|webp|svg)$/i;

    if (
      !ALLOWED_TYPES.includes(file.type) ||
      !allowedExtensions.test(file.name)
    ) {
      setMessage("Please select a JPG, PNG, WebP, or SVG image.");
      input.value = "";
      return;
    }

    if (file.size > MAX_SIZE) {
      setMessage("Image size must be less than 5 MB.");
      input.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      setBusy(true);
      setMessage("");

      const response = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (response.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        navigate("/admin/login");
        return;
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Image upload failed");
      }

      if (!result.imageUrl) {
        throw new Error("Server did not return an image URL.");
      }

      onSuccess(result.imageUrl);
      setMessage("Image uploaded successfully. Click Save Changes.");
    } catch (error) {
      console.error(error);
      setMessage(error.message || "Image upload failed.");
    } finally {
      setBusy(false);
      input.value = "";
    }
  };

  // ------------------------------------------------
  // Loading
  // ------------------------------------------------
  if (loading) {
    return <div className="admin-loading">Loading...</div>;
  }

  if (!homeData) {
    return <div className="admin-loading">No data found.</div>;
  }

  const banners = homeData.banners || [];

  return (
    <div className="admin-page">
      {/* Header */}
      <header className="admin-header">
        <div>
          <h1>DeltaTrafo Admin</h1>

          <nav>
            <Link to="/admin/dashboard">Home</Link>
            <Link to="/admin/Products">Products</Link>
          </nav>
        </div>

        <button className="admin-logout" onClick={logout}>
          Logout
        </button>
      </header>

      {/* Content */}
      <main className="admin-content">
        {message && <div className="admin-message">{message}</div>}

        {/* BANNERS */}
        <section className="admin-section">
          <div className="admin-section-header">
            <div className="admin-section-header-text">
              <h2>Banner Management</h2>
              <p>Add, edit or remove homepage banners.</p>
            </div>

            <button className="admin-add-button" onClick={addBanner}>
              + Add Banner
            </button>
          </div>

          {banners.map((banner, index) => (
            <div className="banner-editor" key={banner.id}>
              <div className="banner-editor-header">
                <h3>Banner {index + 1}</h3>

                <button
                  className="delete-button"
                  onClick={() => deleteBanner(index)}
                >
                  Delete
                </button>
              </div>

              <ImageField
                label="Desktop Image"
                value={banner.image}
                busy={busy}
                onUpload={uploadImage}
                onChange={(url) => updateBanner(index, "image", url)}
              />

              <ImageField
                label="Mobile Image"
                value={banner.mob_image}
                busy={busy}
                onUpload={uploadImage}
                onChange={(url) => updateBanner(index, "mob_image", url)}
              />

              <div className="admin-field">
                <label>Title</label>
                <input
                  type="text"
                  value={banner.title || ""}
                  onChange={(event) =>
                    updateBanner(index, "title", event.target.value)
                  }
                />
              </div>

              <div className="admin-field">
                <label>Description</label>
                <textarea
                  rows="4"
                  value={banner.description || ""}
                  onChange={(event) =>
                    updateBanner(index, "description", event.target.value)
                  }
                />
              </div>

              <div className="admin-checkbox">
                <input
                  id={`showText-${banner.id}`}
                  type="checkbox"
                  checked={!!banner.showText}
                  onChange={(event) =>
                    updateBanner(index, "showText", event.target.checked)
                  }
                />
                <label htmlFor={`showText-${banner.id}`}>
                  Show title and description
                </label>
              </div>

              <div className="admin-field">
                <label>Text Position</label>
                <select
                  value={banner.textPosition || "center"}
                  onChange={(event) =>
                    updateBanner(index, "textPosition", event.target.value)
                  }
                >
                  <option value="top">Top</option>
                  <option value="center">Center</option>
                  <option value="bottom">Bottom</option>
                </select>
              </div>

              <div className="admin-checkbox">
                <input
                  id={`button-${banner.id}`}
                  type="checkbox"
                  checked={!!banner.buttonHiden}
                  onChange={(event) =>
                    updateBanner(index, "buttonHiden", event.target.checked)
                  }
                />
                <label htmlFor={`button-${banner.id}`}>
                  Show Button/CTA on Banner
                </label>
              </div>
            </div>
          ))}
        </section>

        {/* ABOUT */}
        <section className="admin-section">
          <div className="admin-section-header">
            <div className="admin-section-header-text">
              <h2>About DeltaTrafo</h2>
              <p>Update About Us content.</p>
            </div>
          </div>

          <div className="admin-field">
            <label>Title</label>
            <input
              type="text"
              value={homeData.about?.title || ""}
              onChange={(event) => updateAbout("title", event.target.value)}
            />
          </div>

          <div className="admin-field">
            <label>Sub Title</label>
            <input
              type="text"
              value={homeData.about?.subtitle || ""}
              onChange={(event) => updateAbout("subtitle", event.target.value)}
            />
          </div>

          <ImageField
            label="About Image"
            value={homeData.about?.image}
            busy={busy}
            onUpload={uploadImage}
            onChange={(url) => updateAbout("image", url)}
          />

          <div className="admin-field">
            <label>Description</label>
            <textarea
              rows="8"
              value={homeData.about?.description || ""}
              onChange={(event) =>
                updateAbout("description", event.target.value)
              }
            />
          </div>

          <div className="admin-field">
            <label>CTA Name</label>
            <input
              type="text"
              value={homeData.about?.cta_name || ""}
              onChange={(event) => updateAbout("cta_name", event.target.value)}
            />
          </div>

          <ImageField
            label="Featured about us Page Image (16:9 Aspect Ratio)"
            value={homeData.about?.featuredImage}
            busy={busy}
            onUpload={uploadImage}
            onChange={(url) => updateAbout("featuredImage", url)}
          />

          <ImageField
            label="Mobile Featured about us Page Image (16:9 Aspect Ratio)"
            value={homeData.about?.mob_featuredImage}
            busy={busy}
            onUpload={uploadImage}
            onChange={(url) => updateAbout("mob_featuredImage", url)}
          />

        </section>

        {/* OUR PRODUCTS */}
        <section className="admin-section">
          <div className="admin-section-header">
            <div className="admin-section-header-text">
              <h2>Our Products</h2>
              <p>Update Our Products content.</p>
            </div>
          </div>

          <div className="admin-field">
            <label>Title</label>
            <input
              type="text"
              value={homeData.products?.title || ""}
              onChange={(event) => updateProducts("title", event.target.value)}
            />
          </div>

          <div className="admin-field">
            <label>Sub Title</label>
            <input
              type="text"
              value={homeData.products?.subtitle || ""}
              onChange={(event) =>
                updateProducts("subtitle", event.target.value)
              }
            />
          </div>

          <ImageField
            label="Products Section Image (16:9 Aspect Ratio)"
            value={homeData.products?.image}
            busy={busy}
            onUpload={uploadImage}
            onChange={(url) => updateProducts("image", url)}
          />

          <ImageField
            label="Mobile Products Section Image (2:3 Aspect Ratio)"
            value={homeData.products?.mob_image}
            busy={busy}
            onUpload={uploadImage}
            onChange={(url) => updateProducts("mob_image", url)}
          /> 

          <div className="admin-field">
            <label>Description</label>
            <textarea
              rows="8"
              value={homeData.products?.description || ""}
              onChange={(event) =>
                updateProducts("description", event.target.value)
              }
            />
          </div>

          <div className="admin-checkbox">
            <input
              id="showonProducts"
              type="checkbox"
              checked={!!homeData.products?.showonProducts}
              onChange={(event) =>
                updateProducts("showonProducts", event.target.checked)
              }
            />
            <label htmlFor="showonProducts">
              Show description on Products page
            </label>
          </div>

          <div className="admin-field">
            <label>CTA Name</label>
            <input
              type="text"
              value={homeData.products?.cta_name || ""}
              onChange={(event) =>
                updateProducts("cta_name", event.target.value)
              }
            />
          </div>
        </section>


        {/* Capabilities Quality */}
        <section className="admin-section">
          <div className="admin-section-header">
            <div className="admin-section-header-text">
              <h2>Capabilities & Quality</h2>
              <p>Update Our Capabilities & Quality content.</p>
            </div>
          </div>

          <div className="admin-field">
            <label>Title</label>
            <input
              type="text"
              value={homeData.capabilities_quality?.title || ""}
              onChange={(event) => updateCapabilitiesQuality("title", event.target.value)}
            />
          </div>

          <div className="admin-field">
            <label>Sub Title</label>
            <input
              type="text"
              value={homeData.capabilities_quality?.subtitle || ""}
              onChange={(event) =>
                updateCapabilitiesQuality("subtitle", event.target.value)
              }
            />
          </div>

          <ImageField
            label="Capabilities & Quality Image (16:9 Aspect Ratio)"
            value={homeData.capabilities_quality?.image}
            busy={busy}
            onUpload={uploadImage}
            onChange={(url) => updateCapabilitiesQuality("image", url)}
          />

          <ImageField
            label="Mobile Capabilities & Quality Image (2:3 Aspect Ratio)"
            value={homeData.capabilities_quality?.mob_image}
            busy={busy}
            onUpload={uploadImage}
            onChange={(url) => updateCapabilitiesQuality("mob_image", url)}
          />

          <div className="admin-field">
            <label>Description</label>
            <textarea
              rows="8"
              value={homeData.capabilities_quality?.description || ""}
              onChange={(event) =>
                updateCapabilitiesQuality("description", event.target.value)
              }
            />
          </div>

        </section>

        {/* Industries */}
        <section className="admin-section">
          <div className="admin-section-header">
            <div className="admin-section-header-text">
              <h2>Industries</h2>
              <p>Update Our Industries content.</p>
            </div>
          </div>

          <div className="admin-field">
            <label>Title</label>
            <input
              type="text"
              value={homeData.industries?.title || ""}
              onChange={(event) => updateIndustries("title", event.target.value)}
            />
          </div>

          <div className="admin-field">
            <label>Sub Title</label>
            <input
              type="text"
              value={homeData.industries?.subtitle || ""}
              onChange={(event) =>
                updateIndustries("subtitle", event.target.value)
              }
            />
          </div>

          <ImageField
            label="Industries Image (16:9 Aspect Ratio)"
            value={homeData.industries?.image}
            busy={busy}
            onUpload={uploadImage}
            onChange={(url) => updateIndustries("image", url)}
          />

          <ImageField
            label="Mobile Industries Image (2:3 Aspect Ratio)"
            value={homeData.industries?.mob_image}
            busy={busy}
            onUpload={uploadImage}
            onChange={(url) => updateIndustries("mob_image", url)}
          />

          <div className="admin-field">
            <label>Description</label>
            <textarea
              rows="8"
              value={homeData.industries?.description || ""}
              onChange={(event) =>
                updateIndustries("description", event.target.value)
              }
            />
          </div>

        </section>

        {/* Contact Us */}
        <section className="admin-section">
          <div className="admin-section-header">
            <div className="admin-section-header-text">
              <h2>Contact Us</h2>
              <p>Update Our Contact Us content.</p>
            </div>
          </div>

          <div className="admin-field">
            <label>Title</label>
            <input
              type="text"
              value={homeData.contact?.title || ""}
              onChange={(event) => updateContact("title", event.target.value)}
            />
          </div>

          <div className="admin-field">
            <label>Sub Title</label>
            <input
              type="text"
              value={homeData.contact?.subtitle || ""}
              onChange={(event) =>
                updateContact("subtitle", event.target.value)
              }
            />
          </div>

          <ImageField
            label="Contact Us Image(16:9 Aspect Ratio)"
            value={homeData.contact?.image}
            busy={busy}
            onUpload={uploadImage}
            onChange={(url) => updateContact("image", url)}
          />

          <ImageField
            label="Mobile Contact Us Image(2:3 Aspect Ratio)"
            value={homeData.contact?.mob_image}
            busy={busy}
            onUpload={uploadImage}
            onChange={(url) => updateContact("mob_image", url)}
          />

          <div className="admin-field">
            <label>Description</label>
            <textarea
              rows="8"
              value={homeData.contact?.description || ""}
              onChange={(event) =>
                updateContact("description", event.target.value)
              }
            />
          </div>

        </section>


        {/* FEATURES */}
        <section className="admin-section">
          <div className="admin-section-header">
            <div className="admin-section-header-text">
              <h2>Why Delta Trafo</h2>
              <p>Update homepage Why Delta Trafo.</p>
            </div>

            <button
              type="button"
              className="admin-add-button"
              onClick={addFeature}
            >
              + Add Feature
            </button>
          </div>

          {/* H1 */}
          <div className="admin-field">
            <label>Title</label>
            <input
              type="text"
              value={homeData.features?.title || ""}
              onChange={(event) =>
                updateFeaturesContent("title", event.target.value)
              }
            />
          </div>

          {/* H2 */}
          <div className="admin-field">
            <label>Sub Title</label>
            <input
              type="text"
              value={homeData.features?.subtitle || ""}
              onChange={(event) =>
                updateFeaturesContent("subtitle", event.target.value)
              }
            />
          </div>

          {/* Description */}
          <div className="admin-field">
            <label>Description</label>
            <textarea
              rows="5"
              value={homeData.features?.description || ""}
              onChange={(event) =>
                updateFeaturesContent("description", event.target.value)
              }
            />
          </div>

          <hr />

          <h3>Feature Items</h3>

          {(homeData.features?.items || []).map((feature, index) => (
            <div className="banner-editor" key={index}>
              <div className="banner-editor-header">
                <h3>Feature {index + 1}</h3>

                <button
                  type="button"
                  className="delete-button"
                  onClick={() => deleteFeature(index)}
                >
                  Remove Feature
                </button>
              </div>

              <IconUploadField
                value={feature.iconImage || ""}
                busy={busy}
                onUpload={uploadImage}
                onChange={(url) =>
                  updateFeatureItem(index, "iconImage", url)
                }
              />

              <div className="admin-field">
                <label>Title</label>
                <input
                  type="text"
                  value={feature.title || ""}
                  onChange={(event) =>
                    updateFeatureItem(index, "title", event.target.value)
                  }
                />
              </div>

              <div className="admin-field">
                <label>Description</label>
                <textarea
                  rows="4"
                  value={feature.description || ""}
                  onChange={(event) =>
                    updateFeatureItem(index, "description", event.target.value)
                  }
                />
              </div>
            </div>
          ))}
        </section>


        {/* SAVE */}
        <div className="admin-save-area">
          <button
            className="admin-save-button"
            onClick={saveData}
            disabled={saving || busy}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;