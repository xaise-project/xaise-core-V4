import { Twitter, Facebook, Instagram } from "lucide-react";
import { Link } from "react-router-dom";
import "./Home.css";

export default function Home() {
  return (
    <div className="home-page">
      {/* Top navigation */}
      <nav className="home-nav">
        <div className="brand">Staking Hub</div>

        <div className="nav-links">
          <a href="/" className="nav-link active">
            Home
          </a>
          <a href="#about" className="nav-link">
            About Us
          </a>
          <a href="#contact" className="nav-link">
            Contact Us
          </a>
        </div>

        <div className="nav-actions">
          <Link to="/dashboard" className="login">
            LOG IN
          </Link>
          <a href="#blocks" className="blocks-btn">
            PRICES
          </a>
        </div>
      </nav>

      {/* Hero content */}
      <main className="home-hero">
        <h1 className="hero-title">
          Empowering Your Staking Journey with Clarity & Control
        </h1>
        <p className="hero-subtitle">
          Discover, manage, and track staking opportunities — all in one modern dashboard.
        </p>

        <div className="social">
          <p className="social-label">CONNECT WITH US ON</p>
          <div className="social-icons">
            <a href="#twitter" aria-label="Twitter" className="icon-link">
              <Twitter className="icon" />
            </a>
            <a href="#facebook" aria-label="Facebook" className="icon-link">
              <Facebook className="icon" />
            </a>
            <a href="#instagram" aria-label="Instagram" className="icon-link">
              <Instagram className="icon" />
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
