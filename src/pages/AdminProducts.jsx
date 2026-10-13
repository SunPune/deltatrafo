
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "/api/products";
import "./AdminProducts.css";

const emptyProduct = {
  slug: "",
  name: "",
  shortDescription: "",
  description: "",
  images: [""],
  specifications: [["Material", ""]],
};

function toFormProduct(slug, product) {
  return {
    slug,
    name: product.name || "",
    shortDescription: product.shortDescription || "",
    description: product.description || "",
    images: product.images || [],
    specifications: product.specifications || [],
  };
}

export default function AdminProducts() {

    const navigate = useNavigate();



  const token = localStorage.getItem(
    "deltatrafo_admin_token"
  );


  // ------------------------------------------------
  // Check login
  // ------------------------------------------------

  useEffect(() => {
  if (token) {
    loadProducts().catch((error) => {
      setMessage(error.message);
    });
  }
}, [token]);

  const [products, setProducts] = useState({});
  const [form, setForm] = useState(emptyProduct);
  const [editingSlug, setEditingSlug] = useState(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function loadProducts() {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Unable to load products");
    }

    setProducts(await response.json());
  }

  useEffect(() => {
    loadProducts().catch(error => setMessage(error.message));
  }, []);

  function updateField(field, value) {
    setForm(previous => ({ ...previous, [field]: value }));
  }

  function editProduct(slug) {
    setForm(toFormProduct(slug, products[slug]));
    setEditingSlug(slug);
    setMessage("");
  }

  function newProduct() {
    setForm(emptyProduct);
    setEditingSlug(null);
    setMessage("");
  }

  async function saveProduct(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");

    try {
      const { slug, ...product } = form;

      if (!slug.trim() || !product.name.trim()) {
        throw new Error("Product slug and name are required");
      }

      const url = editingSlug
        ? `${API_URL}/${encodeURIComponent(editingSlug)}`
        : API_URL;

      const response = await fetch(url, {
        method: editingSlug ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...product,
          ...(editingSlug ? {} : { slug }),
          images: product.images.filter(image => image.trim()),
          specifications: product.specifications.filter(
            row => row[0].trim()
          ),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Save failed");
      }

      await loadProducts();
      setMessage("Product saved successfully");
      newProduct();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function deleteProduct(slug) {
    if (!window.confirm(`Delete "${products[slug].name}"?`)) {
      return;
    }

    setBusy(true);

    try {
      const response = await fetch(
        `${API_URL}/${encodeURIComponent(slug)}`,
        { method: "DELETE" }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Delete failed");
      }

      await loadProducts();

      if (editingSlug === slug) newProduct();

      setMessage("Product deleted successfully");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  function updateImage(index, value) {
    const images = [...form.images];
    images[index] = value;
    updateField("images", images);
  }

  function updateSpecification(index, column, value) {
    const specifications = form.specifications.map(row => [...row]);
    specifications[index][column] = value;
    updateField("specifications", specifications);
  }

  function logout() {
    localStorage.removeItem("deltatrafo_admin_token");
    navigate("/admin/login");
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
          type="button"
          className="admin-logout"
          onClick={logout}
        >
          Logout
        </button>
      </header>
    <main className="admin-products">
      <h1>Product Management</h1>

      <button type="button" onClick={newProduct}>
        Add New Product
      </button>

      <h2>Existing Products</h2>

      {Object.entries(products).map(([slug, product]) => (
        <div key={slug} className="admin-product-row">
          <span>{product.name}</span>
          <button type="button" onClick={() => editProduct(slug)}>
            Edit
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => deleteProduct(slug)}
          >
            Delete
          </button>
        </div>
      ))}

      <h2>{editingSlug ? "Edit Product" : "Add Product"}</h2>

      <form onSubmit={saveProduct}>
        <label>
          Product URL slug
          <input
            value={form.slug}
            disabled={Boolean(editingSlug)}
            onChange={event => updateField("slug", event.target.value)}
            placeholder="insulation-boards-blocks"
            required
          />
        </label>

        <label>
          Product Name
          <input
            value={form.name}
            onChange={event => updateField("name", event.target.value)}
            required
          />
        </label>

        <label>
          Short Description
          <textarea
            value={form.shortDescription}
            onChange={event =>
              updateField("shortDescription", event.target.value)
            }
          />
        </label>

        <label>
          Description
          <textarea
            value={form.description}
            onChange={event =>
              updateField("description", event.target.value)
            }
            required
          />
        </label>

        <h3>Images</h3>

        {form.images.map((image, index) => (
          <div key={index}>
            <input
              value={image}
              placeholder="/images/product-1.jpg"
              onChange={event => updateImage(index, event.target.value)}
            />
            <button
              type="button"
              onClick={() =>
                updateField(
                  "images",
                  form.images.filter((_, i) => i !== index)
                )
              }
            >
              Remove
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => updateField("images", [...form.images, ""])}
        >
          Add Image
        </button>

        <h3>Specifications</h3>

        {form.specifications.map((row, index) => (
          <div key={index}>
            <input
              aria-label="Specification name"
              placeholder="Material"
              value={row[0]}
              onChange={event =>
                updateSpecification(index, 0, event.target.value)
              }
            />
            <input
              aria-label="Specification value"
              placeholder="Iron"
              value={row[1]}
              onChange={event =>
                updateSpecification(index, 1, event.target.value)
              }
            />
            <button
              type="button"
              onClick={() =>
                updateField(
                  "specifications",
                  form.specifications.filter((_, i) => i !== index)
                )
              }
            >
              Remove
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() =>
            updateField("specifications", [
              ...form.specifications,
              ["", ""],
            ])
          }
        >
          Add Specification
        </button>

        <div>
          <button type="submit" disabled={busy}>
            {busy ? "Saving..." : "Save Product"}
          </button>
          <button type="button" onClick={newProduct}>
            Cancel
          </button>
        </div>
      </form>

      {message && <p role="status">{message}</p>}
    </main>
    </div>
  );
}
