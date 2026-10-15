import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './AuthPages.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'individual' });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { alert('Passwords do not match'); return; }
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) { alert(data.error || 'Registration failed'); return; }
      alert('Account created successfully. Please sign in.');
      navigate('/login');
    } catch (err) {
      alert('Could not connect to server. Is the backend running?');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">🛡️ PhishShield AI</div>
        <h2>Join PhishShield AI</h2>
        <p>Set up your account in under a minute</p>
        <div className="auth-features">
          <div className="af-item"><i className="fas fa-check-circle"></i> Free to start</div>
          <div className="af-item"><i className="fas fa-check-circle"></i> AI-powered detection</div>
          <div className="af-item"><i className="fas fa-check-circle"></i> Instant access</div>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-card animate-in">
          <div className="auth-card-header"><h1>Create Account</h1><p>Choose the account type you need</p></div>
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="field-group"><label>Full Name</label><div className="field-input-wrap"><i className="fas fa-user field-icon"></i><input type="text" name="name" placeholder="Your full name" value={form.name} onChange={handleChange} required /></div></div>
            <div className="field-group"><label>Email Address</label><div className="field-input-wrap"><i className="fas fa-envelope field-icon"></i><input type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required /></div></div>
            <div className="field-row">
              <div className="field-group"><label>Password</label><div className="field-input-wrap"><i className="fas fa-lock field-icon"></i><input type={showPw ? 'text' : 'password'} name="password" placeholder="Min 8 characters" value={form.password} onChange={handleChange} required /><button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)}><i className={`fas fa-eye${showPw ? '-slash' : ''}`}></i></button></div></div>
              <div className="field-group"><label>Confirm Password</label><div className="field-input-wrap"><i className="fas fa-lock field-icon"></i><input type={showPw ? 'text' : 'password'} name="confirmPassword" placeholder="Re-enter password" value={form.confirmPassword} onChange={handleChange} required /></div></div>
            </div>
            <div className="field-group"><label>Account Type</label><div className="field-input-wrap"><i className="fas fa-user-shield field-icon"></i><select name="role" value={form.role} onChange={handleChange}><option value="individual">Individual User</option><option value="organization_user">Organization User</option><option value="organization_admin">Organization Admin</option></select></div><small style={{display:'block',marginTop:7,color:'var(--text-muted)',lineHeight:1.45}}>{form.role === 'individual' ? 'Personal account. Your scans and reports are only yours.' : form.role === 'organization_user' ? 'Employee/member account. You get the same personal analysis tools, and your scans belong to the organization.' : 'Administrator account. You can monitor the security activity of the entire organization.'}</small></div>
            <button type="submit" className={`auth-btn ${loading ? 'loading' : ''}`} disabled={loading}>{loading ? <><i className="fas fa-spinner fa-spin"></i> Creating account...</> : <><i className="fas fa-user-plus"></i> Create Account</>}</button>
          </form>
          <p className="auth-footer-text">Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
