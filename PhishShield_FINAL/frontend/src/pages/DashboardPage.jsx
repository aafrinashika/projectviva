import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import './DashboardPage.css';

// Static UI config for the quick-action cards — labels/routes, not analysis
// data, so these stay as-is.
const quickActions = [
  {
    icon: 'fa-upload',
    title: 'Analyze Email Header',
    desc: 'Upload or paste an email header for instant AI analysis.',
    btn: 'Start Analysis',
    path: '/upload',
    color: 'blue',
  },
  {
    icon: 'fa-history',
    title: 'Email History',
    desc: 'Browse and search through all your previous scan results.',
    btn: 'View History',
    path: '/history',
    color: 'green',
  },
  {
    icon: 'fa-chart-bar',
    title: 'Security Reports',
    desc: 'Generate and download detailed security reports.',
    btn: 'View Reports',
    path: '/reports',
    color: 'purple',
  },
];

export default function DashboardPage() {
  const currentRole = localStorage.getItem('phishshield_role') || 'individual';
  const isOrgUser = currentRole === 'organization_user';
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [recentScans, setRecentScans] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      const token = localStorage.getItem('phishshield_token');
      const headers = { Authorization: `Bearer ${token}` };

      try {
        const [reportsRes, historyRes] = await Promise.all([
          fetch('http://127.0.0.1:5000/api/scans/reports', { headers }),
          fetch('http://127.0.0.1:5000/api/scans/history', { headers }),
        ]);

        const reportsData = await reportsRes.json();
        const historyData = await historyRes.json();

        if (cancelled) return;

        if (!reportsRes.ok) {
          throw new Error(reportsData.error || 'Could not load report stats');
        }
        if (!historyRes.ok) {
          throw new Error(historyData.error || 'Could not load scan history');
        }

        setStats(reportsData);
        // Backend already returns scans sorted newest-first.
        setRecentScans((historyData.scans || []).slice(0, 5));
      } catch (err) {
        if (!cancelled) setError(err.message || 'Could not connect to server');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDashboard();
    return () => { cancelled = true; };
  }, []);

  const statusBadge = (verdict) => {
    if (verdict === 'phishing') return <span className="badge badge-danger">Phishing</span>;
    if (verdict === 'safe') return <span className="badge badge-safe">Safe</span>;
    return <span className="badge">{verdict || 'Unknown'}</span>;
  };

  const riskColor = (r) => r >= 70 ? '#e02424' : r >= 40 ? '#c27803' : '#057a55';

  const viewScan = (scan) => {
    navigate('/result', { state: { ...scan.analysis_result, scanId: scan.id } });
  };

  return (
    <Sidebar>
      <div className="page-header">
        <h1>Welcome back 👋</h1>
        <p>{isOrgUser ? 'Your email security overview as an organization member.' : "Here's your personal email security overview for today."}</p>
        {isOrgUser && <div className="card" style={{marginTop:12,padding:'12px 16px',background:'#eff6ff',border:'1px solid #bfdbfe'}}>
          <strong>Organization User:</strong> Your scans are private to you in this workspace, while your organization admin can monitor organization-wide security activity.
        </div>}
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <div className="stat-card animate-in">
          <div className="stat-icon blue"><i className="fas fa-envelope"></i></div>
          <div className="stat-info">
            <h3>{stats ? stats.totalScans : (loading ? '…' : '—')}</h3>
            <p>Total Scans</p>
          </div>
        </div>
        <div className="stat-card animate-in" style={{animationDelay:'0.05s'}}>
          <div className="stat-icon green"><i className="fas fa-check-circle"></i></div>
          <div className="stat-info">
            <h3>{stats ? stats.safeScans : (loading ? '…' : '—')}</h3>
            <p>Safe Emails</p>
          </div>
        </div>
        <div className="stat-card animate-in" style={{animationDelay:'0.1s'}}>
          <div className="stat-icon red"><i className="fas fa-shield-virus"></i></div>
          <div className="stat-info">
            <h3>{stats ? stats.phishingScans : (loading ? '…' : '—')}</h3>
            <p>Phishing Blocked</p>
          </div>
        </div>
        <div className="stat-card animate-in" style={{animationDelay:'0.15s'}}>
          <div className="stat-icon yellow"><i className="fas fa-percentage"></i></div>
          <div className="stat-info">
            <h3>{stats ? `${stats.averageRiskScore}%` : (loading ? '…' : '—')}</h3>
            <p>Average Risk Score</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        {quickActions.map((a, i) => (
          <div key={i} className={`qa-card qa-${a.color} animate-in`} style={{animationDelay:`${i*0.08}s`}}>
            <div className="qa-icon"><i className={`fas ${a.icon}`}></i></div>
            <h3>{a.title}</h3>
            <p>{a.desc}</p>
            <button className={`btn btn-qa-${a.color}`} onClick={() => navigate(a.path)}>
              {a.btn} <i className="fas fa-arrow-right"></i>
            </button>
          </div>
        ))}
      </div>

      {/* Recent Scans */}
      <div className="card animate-in" style={{marginTop: '24px'}}>
        <div className="card-header">
          <h3><i className="fas fa-clock" style={{marginRight:8, color:'var(--primary)'}}></i>Recent Email Scans</h3>
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/history')}>
            View All
          </button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Sender</th>
                <th>Date</th>
                <th>Risk Score</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} style={{textAlign:'center', padding:'2rem', color:'var(--text-muted)'}}>
                    <i className="fas fa-spinner fa-spin"></i> Loading recent scans...
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan={5} style={{textAlign:'center', padding:'2rem', color:'#e02424'}}>
                    <i className="fas fa-exclamation-circle"></i> {error}
                  </td>
                </tr>
              )}

              {!loading && !error && recentScans && recentScans.length === 0 && (
                <tr>
                  <td colSpan={5} style={{textAlign:'center', padding:'2rem', color:'var(--text-muted)'}}>
                    No scans yet — analyze your first email header to see it here.
                  </td>
                </tr>
              )}

              {!loading && !error && recentScans && recentScans.map((scan) => {
                const risk = scan.risk_score ?? 0;
                const sender = scan.analysis_result?.sender || 'Unknown';
                const date = scan.timestamp
                  ? new Date(scan.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                  : '—';

                return (
                  <tr key={scan.id}>
                    <td>
                      <span className="sender-cell">
                        <i className="fas fa-envelope-open" style={{color:'#94a3b8', marginRight:8}}></i>
                        {sender}
                      </span>
                    </td>
                    <td style={{color:'var(--text-muted)'}}>{date}</td>
                    <td>
                      <div className="risk-inline">
                        <div className="risk-bar-bg">
                          <div className="risk-bar-fill" style={{
                            width: `${risk}%`,
                            background: riskColor(risk)
                          }}></div>
                        </div>
                        <span style={{color: riskColor(risk), fontWeight: 700}}>
                          {risk}%
                        </span>
                      </div>
                    </td>
                    <td>{statusBadge(scan.verdict)}</td>
                    <td>
                      <button className="btn btn-primary btn-sm" onClick={() => viewScan(scan)}>
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Sidebar>
  );
}