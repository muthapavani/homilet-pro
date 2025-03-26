import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Validation from "./login_val";
import "./signup.css";

function Login() {
  const navigate = useNavigate();
  const [values, setValues] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGuestLoggingIn, setIsGuestLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [serverStatus, setServerStatus] = useState("checking");

  // Check if server is running on component mount
  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        // Try a simple GET request to check if server is responding
        await axios.get("http://localhost:8081/");
        setServerStatus("online");
      } catch (err) {
        // If err.response exists, server is running but endpoint might not exist
        if (err.response) {
          setServerStatus("online");
        } else {
          setServerStatus("offline");
        }
      }
    };

    checkServerStatus();
  }, []);

  // Handle input changes
  const handleInput = (event) => {
    setValues((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));

    if (errors[event.target.name]) {
      setErrors((prev) => ({
        ...prev,
        [event.target.name]: null,
      }));
    }

    if (serverError) {
      setServerError("");
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = Validation(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true);
      setServerError("");

      try {
        const res = await axios.post("http://localhost:8081/login", values);
        console.log("Login API Response:", res.data);

        if (res.data.token) {
          alert("Login Successful!");
          localStorage.setItem("token", `Bearer ${res.data.token}`);
          localStorage.setItem("user", JSON.stringify(res.data.user));
          navigate("/dashboard");
        } else {
          setServerError(res.data.error || "Invalid email or password");
        }
      } catch (err) {
        console.error("Login API Error:", err);
        
        if (err.response) {
          setServerError(err.response.data.error || "Login failed. Please check your credentials.");
        } else if (err.request) {
          setServerError("Cannot connect to server. Please make sure the server is running.");
        } else {
          setServerError("An unexpected error occurred. Please try again.");
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Handle guest login
  const handleGuestLogin = async () => {
    setIsGuestLoggingIn(true);
    setServerError("");

    try {
      console.log("Attempting guest login...");
      
      const res = await axios.post("http://localhost:8081/guest-login", {});
      console.log("Guest Login Response:", res.data);

      if (res.data.token) {
        alert("Guest Login Successful!");
        localStorage.setItem("token", `Bearer ${res.data.token}`);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        navigate("/dashboard");
      } else {
        setServerError(res.data.error || "Guest login failed");
      }
    } catch (err) {
      console.error("Guest Login Error:", err);
      
      if (err.response) {
        // The server responded with a status code outside the 2xx range
        setServerError(err.response.data.error || "Guest login failed");
      } else if (err.request) {
        // The request was made but no response was received
        setServerError("Cannot connect to server. Please make sure the server is running.");
      } else {
        // Something happened in setting up the request
        setServerError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsGuestLoggingIn(false);
    }
  };

  return (
    <div className="bg-mountain">
      <div className="stars"></div>
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="login-container">
          <h2>Login</h2>
          
          {/* Server Status Indicator */}
          {serverStatus === "offline" && (
            <div className="server-status-warning">
              Server appears to be offline. Please ensure your backend server is running.
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            {/* Email Input */}
            <div className="form-group">
              <i className="fas fa-envelope"></i>
              <input
                type="email"
                placeholder="Enter Email"
                name="email"
                id="email"
                onChange={handleInput}
                value={values.email}
              /> <br></br>
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            {/* Password Input */}
            <div className="form-group password-field">
              <i className="fas fa-lock"></i>  
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter Password"
                name="password"
                id="password"
                onChange={handleInput}
                value={values.password}
              />
              <div className="password-toggle" onClick={togglePasswordVisibility}>
                {showPassword ? "👁" : "🚫"}
              </div>
            </div>
            {errors.password && <span className="error-message">{errors.password}</span>}

            {/* Forgot Password */}
            <div className="forgot-password">
              <Link to="/forgot-password">Forgot Password?</Link>
            </div>

            {/* Error Message */}
            {serverError && <div className="server-error">{serverError}</div>}

            {/* Login Button */}
            <button 
              type="submit" 
              className="login-btn" 
              disabled={isSubmitting || isGuestLoggingIn || serverStatus === "offline"}
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>

            {/* Guest Login Button */}
            <button 
              type="button" 
              className="guest-login-btn" 
              onClick={handleGuestLogin}
              disabled={isSubmitting || isGuestLoggingIn || serverStatus === "offline"}
            >
              {isGuestLoggingIn ? "Creating guest account..." : "Continue as Guest"}
            </button>

            {/* Create Account Link */}
            <p className="signup-link">
              Don't have an account? <Link to="/signup">Create Account</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;