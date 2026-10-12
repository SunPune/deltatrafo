import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "";

function AdminLogin() {

  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event) => {

    event.preventDefault();

    setError("");
    setLoading(true);

    try {

      const response = await fetch(
        `${API_URL}/api/admin/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            username,
            password
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {

        setError(
          result.message || "Login failed"
        );

        return;
      }

      localStorage.setItem(
        "deltatrafo_admin_token",
        result.token
      );

      navigate("/admin/dashboard");

    } catch (error) {

      console.error(error);

      setError(
        "Unable to connect to server"
      );

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="admin-login-page">

      <div className="admin-login-box">

        <h1>DeltaTrafo</h1>

        <h2>Admin Login</h2>

        {error && (
          <div className="admin-error">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>

          <div className="admin-field">

            <label>
              Username
            </label>

            <input
              type="text"
              value={username}
              onChange={(event) =>
                setUsername(event.target.value)
              }
              placeholder="Enter username"
              required
            />

          </div>

          <div className="admin-field">

            <label>
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter password"
              required
            />

          </div>

          <button
            type="submit"
            className="admin-login-button"
            disabled={loading}
          >

            {loading
              ? "Logging in..."
              : "Login"}

          </button>

        </form>

      </div>

    </div>

  );

}

export default AdminLogin;