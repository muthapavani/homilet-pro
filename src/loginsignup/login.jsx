import React, { useState } from "react";
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
  const [showPassword, setShowPassword] = useState(false); // Password visibility state

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

      try {
        const res = await axios.post("http://localhost:8081/login", values);
        setIsSubmitting(false);
        console.log("Login API Response:", res.data);

        if (res.data.token) {
          alert("Login Successful!");
          localStorage.setItem("token", `Bearer ${res.data.token}`);
          navigate("/dashboard");
        } else {
          setServerError(res.data.error || "Invalid email or password");
        }
      } catch (err) {
        setIsSubmitting(false);
        console.error("Login API Error:", err);
        setServerError(
          err.response?.data?.error || "Connection error. Please try again."
        );
      }
    }
  };

  return (
    <div className="bg-mountain">
      <div className="stars"></div>
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="login-container">
          <h2>Login</h2>
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
              type={showPassword ? "text" : "password"} // Toggle input type
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
            <button type="submit" className="login-btn" disabled={isSubmitting}>
              {isSubmitting ? "Logging in..." : "Login"}
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