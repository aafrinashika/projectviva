import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import './HopPage.css';

// safe -> Safe, warning -> Unverifiable (NOT "Suspicious" — an unverifiable
// hop is not evidence of phishing by itself), danger -> Malicious.
const statusMap = {
  safe:    { cls: 'badge-safe',    label: 'Safe' },
  warning: { cls: 'badge-warning', label: 'Unverifiable' },
  danger:  { cls: 'badge-danger',  label: 'Malicious' },
};

const statusIcon = {
  safe: 'https://img.icons8.com/color/96/server.png',
  warning: 'https://img.icons8.com/color/96/cloud.png',
  danger: 'https://img.icons8.com/color/96/hacker.png',
};

// The backend now classifies each hop AND explains why (hop.detail:
// 'Verified mail server', 'Gmail Internal Routing', 'Source address could
// not be verified', 'Unverifiable routing address', 'Malicious server').
// These fallbacks only cover older scans saved before `detail` existed.
const fallbackDetail = {
  safe: 'Verified mail server',
  danger: 'Malicious server',
  warning: 'Unverifiable routing address',
};

const getHopDetail = (hop) => hop.detail || fallbackDetail[hop.status] || fallbackDetail.warning;

export default function HopPage() {
  const { scanId } = useParams();
  const navigate = useNavigate();

  const [scan, setScan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchScan = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('phishshield_token');
        const res = await fetch(`http://localhost:5000/api/scans/${scanId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Could not load scan');
        }

        setScan(await res.json());
      } catch (err) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    if (scanId) fetchScan();
  }, [scanId]);

  if (loading) {
    return (
      <Sidebar>
        <div className="page-header"><h1>Email Hop Visualization</h1></div>
        <p>Loading hop data…</p>
      </Sidebar>
    );
  }

  if (error) {
    return (
      <Sidebar>
        <div className="page-header"><h1>Email Hop Visualization</h1></div>
        <p style={{ color: '#e02424' }}>{error}</p>
        <button className="btn btn-outline" onClick={() => navigate('/history')}>
          <i className="fas fa-history"></i> Back to History
        </button>
      </Sidebar>
    );
  }

  const analysis = scan?.analysis_result || {};
  const rawHops = analysis.hops || [];
  const hasDanger = rawHops.some(h => h.status === 'danger');

  // Visual path: Sender -> each real hop -> Recipient
  const hops = [
    {
      icon: 'https://img.icons8.com/color/96/gmail-new.png',
      label: 'Sender',
      value: analysis.sender || 'Unknown sender',
      status: 'safe',
      detail: 'Origin point',
    },
    ...rawHops.map((hop, i) => ({
  icon: statusIcon[hop.status] || statusIcon.warning,
  label: getHopDetail(hop) === 'Gmail Internal Routing'
    ? 'Gmail Internal Routing'
    : `Hop ${i + 1}`,
  value: hop.server,
  status: hop.status,
  detail: getHopDetail(hop),
})),
    {
      icon: 'https://img.icons8.com/color/96/laptop.png',
      label: 'Recipient',
      value: scan?.user_email || 'You',
      status: 'safe',
      detail: 'Delivered',
    },
  ];

  // Table: one row per real hop, delay relative to previous hop.
  // The first hop (and any hop whose timestamp couldn't be parsed) has no
  // previous hop to measure from, so the backend sends delayMs: null — we
  // show that as "—" instead of faking a 0ms delay.
  const hopTable = rawHops.map((hop, i) => ({
  hop: getHopDetail(hop) === 'Gmail Internal Routing'
    ? 'Internal'
    : `#${i + 1}`,
  server: hop.server,
  delay: hop.delayMs == null ? '—' : `${hop.delayMs}ms`,
  status: hop.status,
}));

  return (
    <Sidebar>
      <div className="page-header">
        <h1>Email Hop Visualization</h1>
        <p>Visual representation of the email transmission path from sender to recipient.</p>
      </div>

      {/* Hop Path */}
      <div className="card animate-in">
        <div className="card-header">
          <h3><i className="fas fa-route" style={{marginRight:8,color:'var(--primary)'}}></i>Email Route</h3>
          {hasDanger && <span className="badge badge-danger">Suspicious Path Detected</span>}
        </div>
        <div className="card-body">
          <div className="hop-path">
            {hops.map((hop, i) => (
              <React.Fragment key={i}>
                <div className={`hop-node hop-${hop.status} animate-in`} style={{animationDelay:`${i*0.1}s`}}>
                  <div className={`hop-status-bar hop-bar-${hop.status}`}></div>
                  <img src={hop.icon} alt={hop.label} className="hop-img" />
                  <div className="hop-label">{hop.label}</div>
                  <div className="hop-value">{hop.value}</div>
                  <div className="hop-detail">{hop.detail}</div>
                </div>
                {i < hops.length - 1 && (
                  <div className={`hop-arrow ${hops[i+1].status === 'danger' ? 'arrow-danger' : ''}`}>
                    <i className="fas fa-chevron-right"></i>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Auth + Table */}
      <div className="hop-bottom animate-in" style={{animationDelay:'0.3s'}}>
        <div className="card">
          <div className="card-header"><h3>Route Details</h3></div>
          <div className="card-body">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Hop</th>
                    <th>Server</th>
                    <th>Delay</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {hopTable.length === 0 ? (
                    <tr><td colSpan={4}>No hop data found for this scan.</td></tr>
                  ) : (
                    hopTable.map((row, i) => (
                      <tr key={i}>
<td><strong>{row.hop}</strong></td>
                        <td><span className="mono">{row.server}</span></td>
                        <td style={{color:'var(--text-muted)'}}>{row.delay}</td>
                        <td>
                          <span className={`badge ${statusMap[row.status].cls}`}>
                            {statusMap[row.status].label}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="auth-panel">
          <div className={`auth-item ${analysis.spf === 'PASS' ? 'auth-pass' : 'auth-fail'}`}>
            <i className={`fas fa-${analysis.spf === 'PASS' ? 'check' : 'times'}-circle ai-icon`}></i>
            <div>
              <strong>SPF</strong>
              <span>{analysis.spf}</span>
            </div>
          </div>
          <div className={`auth-item ${analysis.dkim === 'PASS' ? 'auth-pass' : 'auth-fail'}`}>
            <i className={`fas fa-${analysis.dkim === 'PASS' ? 'check' : 'times'}-circle ai-icon`}></i>
            <div>
              <strong>DKIM</strong>
              <span>{analysis.dkim}</span>
            </div>
          </div>
          <div className={`auth-item ${analysis.dmarc === 'PASS' ? 'auth-pass' : 'auth-fail'}`}>
            <i className={`fas fa-${analysis.dmarc === 'PASS' ? 'check' : 'times'}-circle ai-icon`}></i>
            <div>
              <strong>DMARC</strong>
              <span>{analysis.dmarc}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="hop-actions animate-in">
        <button className="btn btn-primary" onClick={() => navigate('/history')}>
          <i className="fas fa-history"></i> View History
        </button>
        <button className="btn btn-outline" onClick={() => navigate('/result')}>
          <i className="fas fa-arrow-left"></i> Back to Result
        </button>
      </div>
    </Sidebar>
  );
}