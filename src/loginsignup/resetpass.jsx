import React, { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || ""; // Get email from previous page

  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    const requestData = { email, newPassword };

    try {
      const res = await axios.post("http://localhost:8081/reset-password", requestData);
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.error || "Error resetting password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-mountain"></div>
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh" 
      }}>
        <div className="login-container">
          <h2>Reset Password</h2>
          
          {error && <div className="server-error">{error}</div>}
          
          {!message ? (
            <form onSubmit={handleReset}>
              <div className="form-group">
                <i className="fas fa-envelope"></i>
                <input 
                  type="email" 
                  value={email} 
                  readOnly 
                />
              </div>
              <div className="form-group">
                <i className="fas fa-lock"></i>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                  required
                />
              </div>
              <button 
                type="submit" 
                className="login-btn" 
                disabled={loading}
              >
                {loading ? "Processing..." : "Reset Password"}
              </button>
            </form>
          ) : (
            <div style={{ textAlign: "center" }}>
              <p style={{ color: "white", marginBottom: "20px" }}>{message}</p>
              <button 
                className="login-btn" 
                onClick={() => navigate("/login")}
              >
                Go to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ResetPassword;