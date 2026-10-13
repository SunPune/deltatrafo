import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "";

function AdminDashboard() {

  const navigate = useNavigate();

  const [homeData, setHomeData] = useState(null);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");

  const token = localStorage.getItem(
    "deltatrafo_admin_token"
  );


  // ------------------------------------------------
  // Check login
  // ------------------------------------------------

  useEffect(() => {

    if (!token) {

      navigate("/admin/login");

      return;

    }

    loadHomeData();

  }, []);


  // ------------------------------------------------
  // Load JSON
  // ------------------------------------------------

  const loadHomeData = async () => {

    try {

      const response = await fetch(
        `${API_URL}/api/home-data`
      );

      const result = await response.json();

      if (!response.ok) {

        throw new Error(
          result.message || "Unable to load data"
        );

      }

      setHomeData(result.data);

    } catch (error) {

      console.error(error);

      setMessage(
        "Unable to load home data"
      );

    } finally {

      setLoading(false);

    }

  };


  // ------------------------------------------------
  // Update Banner
  // ------------------------------------------------

  const updateBanner = (
    index,
    field,
    value
  ) => {

    setHomeData((previous) => {

      const banners = [
        ...previous.banners
      ];

      banners[index] = {
        ...banners[index],
        [field]: value
      };

      return {
        ...previous,
        banners
      };

    });

  };


  // ------------------------------------------------
  // Add Banner
  // ------------------------------------------------

  const addBanner = () => {

    setHomeData((previous) => {

      const newBanner = {

        id: Date.now(),

        image: "/images/banner1.jpg",

        title: "New Banner",

        description:
          "Enter banner description",

        showText: true,

        textPosition: "center",

        buttonHiden: false,

      };

      return {

        ...previous,

        banners: [
          ...previous.banners,
          newBanner
        ]

      };

    });

  };


  // ------------------------------------------------
  // Delete Banner
  // ------------------------------------------------

  const deleteBanner = (index) => {

    if (
      !window.confirm(
        "Are you sure you want to delete this banner?"
      )
    ) {
      return;
    }

    setHomeData((previous) => {

      const banners = previous.banners.filter(
        (_, bannerIndex) =>
          bannerIndex !== index
      );

      return {
        ...previous,
        banners
      };

    });

  };


  // ------------------------------------------------
  // Update About
  // ------------------------------------------------

  const updateAbout = (
    field,
    value
  ) => {

    setHomeData((previous) => ({

      ...previous,

      about: {

        ...previous.about,

        [field]: value

      }

    }));

  };


  // ------------------------------------------------
  // Save JSON
  // ------------------------------------------------

  const saveData = async () => {

    setSaving(true);

    setMessage("");

    try {

      const response = await fetch(
        `${API_URL}/api/home-data`,
        {
          method: "PUT",

          headers: {

            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`

          },

          body: JSON.stringify(homeData)

        }
      );

      const result = await response.json();

      if (response.status === 401) {

        localStorage.removeItem(
          "deltatrafo_admin_token"
        );

        navigate("/admin/login");

        return;

      }

      if (!response.ok) {

        throw new Error(
          result.message || "Save failed"
        );

      }

      setMessage(
        "Home data saved successfully."
      );

    } catch (error) {

      console.error(error);

      setMessage(
        error.message ||
        "Unable to save data"
      );

    } finally {

      setSaving(false);

    }

  };


  // ------------------------------------------------
  // Logout
  // ------------------------------------------------

  const logout = () => {

    localStorage.removeItem(
      "deltatrafo_admin_token"
    );

    navigate("/admin/login");

  };


  // ------------------------------------------------
  // Loading
  // ------------------------------------------------

  if (loading) {

    return (
      <div className="admin-loading">
        Loading...
      </div>
    );

  }


  if (!homeData) {

    return (
      <div className="admin-loading">
        No data found.
      </div>
    );

  }


  return (

    <div className="admin-page">

      {/* Header */}

      <header className="admin-header">

        <div>

          <h1>DeltaTrafo Admin</h1>

          <nav>
            <a href="/admin/dashboard/">Home</a>
            <a href="/admin/Products">Products</a>
          </nav>

        </div>

        <button
          className="admin-logout"
          onClick={logout}
        >
          Logout
        </button>

      </header>


      {/* Content */}

      <main className="admin-content">

        {message && (

          <div className="admin-message">
            {message}
          </div>

        )}


        {/* BANNERS */}

        <section className="admin-section">

          <div className="admin-section-header">

            <div>

              <h2>
                Banner Management
              </h2>

              <p>
                Add, edit or remove homepage banners.
              </p>

            </div>

            <button
              className="admin-add-button"
              onClick={addBanner}
            >
              + Add Banner
            </button>

          </div>


          {homeData.banners.map(
            (banner, index) => (

              <div
                className="banner-editor"
                key={banner.id}
              >

                <div className="banner-editor-header">

                  <h3>
                    Banner {index + 1}
                  </h3>

                  <button
                    className="delete-button"
                    onClick={() =>
                      deleteBanner(index)
                    }
                  >
                    Delete
                  </button>

                </div>


                <div className="admin-field">

                  <label>
                    Image Path
                  </label>

                  <input
                    type="text"
                    value={banner.image}
                    onChange={(event) =>
                      updateBanner(
                        index,
                        "image",
                        event.target.value
                      )
                    }
                  />

                </div>


                <div className="admin-field">

                  <label>
                    Title
                  </label>

                  <input
                    type="text"
                    value={banner.title}
                    onChange={(event) =>
                      updateBanner(
                        index,
                        "title",
                        event.target.value
                      )
                    }
                  />

                </div>


                <div className="admin-field">

                  <label>
                    Description
                  </label>

                  <textarea
                    rows="4"
                    value={
                      banner.description
                    }
                    onChange={(event) =>
                      updateBanner(
                        index,
                        "description",
                        event.target.value
                      )
                    }
                  />

                </div>


                <div className="admin-checkbox">

                  <input
                    type="checkbox"
                    checked={
                      banner.showText
                    }
                    onChange={(event) =>
                      updateBanner(
                        index,
                        "showText",
                        event.target.checked
                      )
                    }
                  />

                  <label>
                    Show title and description
                  </label>

                </div>

                <div className="admin-field">
                  <label>Text Position</label>

                  <select
                    value={banner.textPosition || "center"}
                    onChange={(event) =>
                      updateBanner(
                        index,
                        "textPosition",
                        event.target.value
                      )
                    }
                  >
                    <option value="top">Top</option>
                    <option value="center">Center</option>
                    <option value="bottom">Bottom</option>
                  </select>
                </div>

                <div className="admin-checkbox">

                  <input
                    type="checkbox"
                    checked={
                      banner.buttonHiden
                    }
                    onChange={(event) =>
                      updateBanner(
                        index,
                        "buttonHiden",
                        event.target.checked
                      )
                    }
                  />

                  <label>
                    Show Button/CTA on Banner
                  </label>

                </div>

              </div>

            )
          )}

        </section>


        {/* ABOUT */}

        <section className="admin-section">

          <div className="admin-section-header">

            <div>

              <h2>
                About DeltaTrafo
              </h2>

              <p>
                Update About Us content.
              </p>

            </div>

          </div>


          <div className="admin-field">

            <label>
              Title
            </label>

            <input
              type="text"
              value={homeData.about.title}
              onChange={(event) =>
                updateAbout(
                  "title",
                  event.target.value
                )
              }
            />

          </div>

          <div className="admin-field">

            <label>
              Sub Title
            </label>

            <input
              type="text"
              value={homeData.about.subtitle}
              onChange={(event) =>
                updateAbout(
                  "subtitle",
                  event.target.value
                )
              }
            />

          </div>


          <div className="admin-field">

            <label>
              Image Path
            </label>

            <input
              type="text"
              value={homeData.about.image}
              onChange={(event) =>
                updateAbout(
                  "image",
                  event.target.value
                )
              }
            />

          </div>


          <div className="admin-field">

            <label>
              Description
            </label>

            <textarea
              rows="8"
              value={
                homeData.about.description
              }
              onChange={(event) =>
                updateAbout(
                  "description",
                  event.target.value
                )
              }
            />

          </div>

          <div className="admin-field">

            <label>
              CTA Name
            </label>

            <input
              type="text"
              value={homeData.about.cta_name}
              onChange={(event) =>
                updateAbout(
                  "cta_name",
                  event.target.value
                )
              }
            />

          </div>

        </section>


        {/* SAVE */}

        <div className="admin-save-area">

          <button
            className="admin-save-button"
            onClick={saveData}
            disabled={saving}
          >

            {saving
              ? "Saving..."
              : "Save Changes"}

          </button>

        </div>

      </main>

    </div>

  );

}

export default AdminDashboard;