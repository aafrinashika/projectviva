import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

export default function Navbar({ transparent = false }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className={`navbar ${transparent ? 'navbar-transparent' : 'navbar-solid'}`}>
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          <span className="brand-icon">🛡️</span>
          <span className="brand-text">PhishShield <span>AI</span></span>
        </Link>
        <button className="nav-toggle" onClick={() => setOpen(!open)}>
          <i className={`fas fa-${open ? 'times' : 'bars'}`}></i>
        </button>
        <div className={`nav-links ${open ? 'open' : ''}`}>
          <a href="#features" className="nav-link">Features</a>
          <a href="#about" className="nav-link">About</a>
          <button className="btn-login" onClick={() => navigate('/login')}>
            Login
          </button>
        </div>
      </div>
    </nav>
  );
}