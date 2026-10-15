import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Sidebar.css';

const personalNavItems = [
  { icon: 'fa-table-cells', fallback: 'fa-home', label: 'Dashboard', path: '/dashboard' },
  { icon: 'fa-envelope', fallback: 'fa-upload', label: 'Analyze Email', path: '/upload' },
  { icon: 'fa-history', fallback: 'fa-history', label: 'History', path: '/history' },
  { icon: 'fa-chart-bar', fallback: 'fa-chart-bar', label: 'Reports', path: '/reports' },
];
const adminNavItems = [
  { icon: 'fa-building', fallback: 'fa-building', label: 'Organization Dashboard', path: '/admin' },
  { icon: 'fa-history', fallback: 'fa-history', label: 'Recent Analysis', path: '/admin/analysis' },
  { icon: 'fa-exclamation-triangle', fallback: 'fa-exclamation-triangle', label: 'Phishing Alerts', path: '/admin/alerts' },
  { icon: 'fa-lock', fallback: 'fa-lock', label: 'Quarantine', path: '/admin/quarantine' },
  { icon: 'fa-chart-bar', fallback: 'fa-chart-bar', label: 'Reports', path: '/admin/reports' },
];

export default function Sidebar({ children, role }) {
  const location = useLocation(); const navigate = useNavigate();
  const currentRole = role || localStorage.getItem('phishshield_role') || 'individual';
  const isAdmin = currentRole === 'organization_admin';
  const navItems = isAdmin ? adminNavItems : personalNavItems;
  const [isProfileOpen, setIsProfileOpen] = useState(false); const profileRef = useRef(null);
  const userName = localStorage.getItem('phishshield_name') || 'User';
  const userEmail = localStorage.getItem('phishshield_email') || '';
  const roleLabel = isAdmin ? 'Organization Admin' : currentRole === 'organization_user' ? 'Organization User' : 'Individual User';
  const handleLogout = () => { ['phishshield_role','phishshield_token','phishshield_name','phishshield_email','phishshield_organization_id'].forEach(k => localStorage.removeItem(k)); sessionStorage.removeItem('phishshield_last_result'); navigate('/login'); };
  useEffect(() => { const fn=e=>{if(profileRef.current&&!profileRef.current.contains(e.target))setIsProfileOpen(false)}; document.addEventListener('mousedown',fn); return()=>document.removeEventListener('mousedown',fn)},[]);
  return <div className="layout">
    <aside className="sidebar"><div className="sidebar-brand"><span className="brand-shield"><i className="fas fa-shield-halved"></i></span><span className="s-name">PhishShield <b>AI</b></span></div>
      <nav className="sidebar-nav">{navItems.map(item=><Link key={item.path} to={item.path} className={`s-link ${location.pathname===item.path?'active':''}`}><i className={`fas ${item.icon} s-link-icon`} data-fallback={item.fallback}></i><span>{item.label}</span></Link>)}</nav>
      <div className="sidebar-footer"><button className="s-link logout-btn" onClick={handleLogout}><i className="fas fa-right-from-bracket s-link-icon"></i><span>Logout</span></button></div>
    </aside>
    <main className="main-content"><div className="app-topbar"><div></div><div className="topbar-actions"><div className="profile-wrap" ref={profileRef}><button className="avatar-button" aria-label="Profile" onClick={()=>setIsProfileOpen(v=>!v)}><i className="fas fa-user"></i></button>{isProfileOpen&&<div className="profile-dropdown"><div className="profile-dropdown-header"><div className="profile-avatar-lg"><i className="fas fa-user"></i></div><div className="profile-dropdown-info"><span className="profile-name">{userName}</span><span className="profile-email">{userEmail}</span></div></div><div className="profile-dropdown-role"><span className="profile-role-badge">{roleLabel}</span></div></div>}</div></div></div><div className="page-content">{children}</div><footer className="app-footer">© 2026 PhishShield AI. All rights reserved.</footer></main>
  </div>;
}
