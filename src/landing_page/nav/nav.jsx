import { Link, useNavigate } from "react-router-dom";
import "./nav.css";
import logo from "../../assets/landingimg/homilet1.png"
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

const HeroSection = () => {
  const navigate = useNavigate(); // Initialize useNavigate

  const handleLogin = () => {
    // Add login logic if needed
    navigate("/login"); // Navigate to login page
  }
 
  return (
    <section id="nav" className="hero-section">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg custom-navbar">
        <div className="container-fluid">
          <Link to="/" className="navbar-brand">
            <img src={logo} alt="Homelet Logo" className="nav-logo" />
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav mx-auto">
              <li className="nav-item">
                <a className="nav-link" href="#nav">Home</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#homes">Homes</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#cardsl">Lands</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#features">Features</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#footer">Contact</a>
              </li>
            </ul>

            <div className="d-flex gap-2">
              <Link to="/login" onClick={handleLogin} className="btn custom-btn">Login</Link>
              <Link to="/signup" className="btn custom-btn">Sign Up</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Banner */}
      <div className="banner-content">
        <h1>
          Welcome to the<br />
          <span className="head">HomiLet</span>
          <p>Let Home Rent Home </p>
        </h1>
        <p className="p">Buy, Rent, and Sell Your Property in One Place.</p>
        <a href="#">
          <button>Get Started</button>
        </a>
      </div>
    </section>
  );
};

export default HeroSection;
