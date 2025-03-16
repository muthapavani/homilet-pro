import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./signup.css";
import SignValidation from "./signup_val";

function Signup() {
  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input changes
  const handleInput = (event) => {
    setValues((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));

    if (errors[event.target.name]) {
      setErrors((prev) => ({ ...prev, [event.target.name]: null }));
    }

    if (serverError) {
      setServerError("");
    }
  };

  // Handle form submission
  const handleSubmit = (event) => {
    event.preventDefault();
    const validationErrors = SignValidation(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true);

      axios
        .post("http://localhost:8081/signup", values)
        .then((res) => {
          setIsSubmitting(false);
          alert(res.data.message);
          navigate("/login");
        })
        .catch((err) => {
          setIsSubmitting(false);
          setServerError(err.response?.data?.error || "Signup failed. Please try again.");
        });
    }
  };

  return (
    <div className="bg-mountain">
      <div className="stars"></div>
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="signup-container">
          <h2>Sign Up</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <i className="fas fa-user"></i>
              <input
                type="text"
                placeholder="Enter Name"
                name="name"
                id="name"
                onChange={handleInput}
                value={values.name}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group">
              <i className="fas fa-envelope"></i>
              <input
                type="email"
                placeholder="Enter Email"
                name="email"
                id="email"
                onChange={handleInput}
                value={values.email}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group password-group">
               <i className="fas fa-lock"></i>
                  <input
                   type={showPassword ? "text" : "password"}
                   placeholder="Enter Password" 
                   name="password"
                   id="password" 
                   onChange={handleInput}
                   value={values.password}
                   />
                   <span
                   className="password-toggle"
                   onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? "👁" : "🚫"}
                    </span>
                    </div>
                    {errors.password && <span className="error-message">{errors.password}</span>}
                    {serverError && <div className="server-error">{serverError}</div>}{serverError && <div className="server-error">{serverError}</div>}

            <button type="submit" className="signup-btn" disabled={isSubmitting}>
              {isSubmitting ? "Signing up..." : "Sign Up"}
            </button>
            <p className="login-link">
            
              Already have an account? <Link to="/login">Login here</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;