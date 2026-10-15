import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './LandingPage.css';

const features = [
  { icon: 'fa-envelope-open-text', title: 'Header Analysis',     desc: 'Deep inspection of email headers for phishing indicators and anomalies.' },
  { icon: 'fa-brain',              title: 'AI Detection',         desc: 'ML model predicts phishing emails with confidence score in milliseconds.' },
  { icon: 'fa-project-diagram',    title: 'Hop Visualization',    desc: 'Visualize the full email transmission path from sender to recipient.' },
  { icon: 'fa-chart-line',         title: 'Risk Score',           desc: 'Precise phishing probability displayed on an intuitive risk meter.' },
  { icon: 'fa-history',            title: 'Email History',        desc: 'Store, search, and review all previous email analysis reports.' },
  { icon: 'fa-building',           title: 'Org Dashboard',        desc: 'Monitor organization-wide email security from one central dashboard.' },
];

const stats = [
  { value: '99.2%', label: 'Detection Accuracy' },
  { value: '50ms',  label: 'Avg. Analysis Time' },
  { value: '10M+',  label: 'Emails Analyzed' },
  { value: '24/7',  label: 'Real-time Protection' },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing">
      <Navbar />

      <section className="hero">
        <div className="hero-content animate-in">
          <div className="hero-badge">
            <span className="badge-dot"></span>
            AI-Powered Email Security
          </div>
          <h1>
            Stop Phishing Attacks<br />
            <span className="hero-gradient">Before They Reach You</span>
          </h1>
          <p className="hero-sub">
            PhishShield AI uses Machine Learning, Header Analysis, SPF, DKIM, DMARC 
            authentication, and Hop Visualization to protect your inbox in real time.
          </p>
          <div className="hero-actions">
            <button className="btn-hero-primary" onClick={() => navigate('/login')}>
              <i className="fas fa-rocket"></i> Get Started Free
            </button>
            <button className="btn-hero-secondary" onClick={() => navigate('/register')}>
              Create Account
            </button>
          </div>
        </div>
        <div className="hero-visual animate-in">
          <div className="shield-ring ring1"></div>
          <div className="shield-ring ring2"></div>
          <div className="shield-ring ring3"></div>
          <img
            src="https://img.icons8.com/fluency/480/cyber-security.png"
            alt="Cyber Security"
            className="hero-img"
          />
          <div className="floating-tag tag1">
            <i className="fas fa-check-circle"></i> SPF Verified
          </div>
          <div className="floating-tag tag2">
            <i className="fas fa-shield-alt"></i> DMARC Pass
          </div>
          <div className="floating-tag tag3 tag-danger">
            <i className="fas fa-exclamation-triangle"></i> Phishing Blocked
          </div>
        </div>
      </section>

      <section className="stats-strip">
        <div className="stats-inner">
          {stats.map((s, i) => (
            <div key={i} className="stat-item">
              <strong>{s.value}</strong>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="features-section">
        <div className="section-label">FEATURES</div>
        <h2 className="section-title">Everything You Need to Stay Protected</h2>
        <p className="section-sub">Comprehensive email security powered by cutting-edge AI</p>
        <div className="features-grid">
          {features.map((f, i) => (
            <div key={i} className="feature-card animate-in" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="feature-icon">
                <i className={`fas ${f.icon}`}></i>
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="about" className="about-section">
        <div className="about-card">
          <div className="about-icon">
            <i className="fas fa-info-circle"></i>
          </div>
          <div className="about-text">
            <h2>About PhishShield AI</h2>
            <p>
              PhishShield AI is an AI-powered phishing detection system that analyzes email headers 
              to identify malicious emails. It checks SPF, DKIM, DMARC authentication results, 
              sender details, and routing information before using Machine Learning to classify 
              emails as Safe or Phishing — giving you confidence in every inbox.
            </p>
            <button className="btn-cta" onClick={() => navigate('/register')}>
              Start Protecting Your Inbox <i className="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-brand">
          🛡️ PhishShield AI
        </div>
        <p>AI Powered Email Phishing Detection System</p>
        <p className="footer-copy">© 2026 PhishShield AI. All Rights Reserved.</p>
      </footer>
    </div>
  );
}