import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import './ResultPage.css';

function readCachedResult() {
  try {
    const raw = sessionStorage.getItem('phishshield_last_result');
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}

export default function ResultPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Prefer the result passed directly from UploadPage.
  // If unavailable, use the last real analysis result from sessionStorage.
  // No mock or invented data is used.
  const result = location.state || readCachedResult();

  if (!result) {
    return (
      <Sidebar>
        <div className="page-header">
          <h1>Analysis Result</h1>
          <p>AI-powered phishing detection complete.</p>
        </div>

        <div className="card animate-in">
          <div
            className="card-body"
            style={{
              textAlign: 'center',
              padding: '2.5rem 1rem'
            }}
          >
            <i
              className="fas fa-exclamation-circle"
              style={{
                fontSize: 32,
                color: 'var(--danger, #ef4444)',
                marginBottom: 12
              }}
            ></i>

            <p>
              No analysis result found. Please analyze an email header first.
            </p>

            <button
              className="btn btn-primary"
              style={{ marginTop: 16 }}
              onClick={() => navigate('/upload')}
            >
              <i className="fas fa-search"></i> Analyze an Email
            </button>
          </div>
        </div>
      </Sidebar>
    );
  }

  const isPhishing = result.verdict === 'phishing';

  const authBadge = (val) => {
    const pass = val === 'PASS';

    return (
      <span
        className={`auth-badge ${
          pass ? 'auth-pass' : 'auth-fail'
        }`}
      >
        <i
          className={`fas fa-${
            pass ? 'check' : 'times'
          }-circle`}
        ></i>{' '}
        {val}
      </span>
    );
  };

  return (
    <Sidebar>
      <div className="page-header">
        <h1>Analysis Result</h1>
        <p>AI-powered phishing detection complete.</p>
      </div>

      {/* Verdict Banner */}
      <div
        className={`verdict-banner ${
          isPhishing
            ? 'verdict-phishing'
            : 'verdict-safe'
        } animate-in`}
      >
        <div className="verdict-icon">
          <i
            className={`fas fa-${
              isPhishing
                ? 'exclamation-triangle'
                : 'shield-check'
            }`}
          ></i>
        </div>

        <div className="verdict-text">
          <h2>
            {isPhishing
              ? '⚠ Phishing Email Detected'
              : '✅ Email Appears Safe'}
          </h2>

          <p>
            {isPhishing
              ? 'This email shows strong indicators of a phishing attempt. Do not click any links or provide personal information.'
              : 'No phishing indicators found. This email passed all authentication checks.'}
          </p>
        </div>
      </div>

      <div className="result-grid">

        {/* Risk Score */}
        <div
          className="card animate-in"
          style={{ animationDelay: '0.1s' }}
        >
          <div className="card-header">
            <h3>Risk Score</h3>
          </div>

          <div className="card-body risk-body">
            <div className="gauge-wrap">
              <svg
                viewBox="0 0 200 120"
                className="gauge-svg"
              >
                <defs>
                  <linearGradient
                    id="riskGrad"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop
                      offset="0%"
                      stopColor="#22c55e"
                    />
                    <stop
                      offset="50%"
                      stopColor="#f59e0b"
                    />
                    <stop
                      offset="100%"
                      stopColor="#ef4444"
                    />
                  </linearGradient>
                </defs>

                {/* Track */}
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="16"
                  strokeLinecap="round"
                />

                {/* Fill - uses the actual risk score directly */}
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="url(#riskGrad)"
                  strokeWidth="16"
                  strokeLinecap="round"
                  strokeDasharray={`${
                    (Number(result.riskScore) / 100) *
                    251.3
                  } 251.3`}
                />

                {/* Actual Risk Score */}
                <text
                  x="100"
                  y="90"
                  textAnchor="middle"
                  fontSize="32"
                  fontWeight="800"
                  fill={
                    isPhishing
                      ? '#e02424'
                      : '#057a55'
                  }
                >
                  {result.riskScore}%
                </text>

                <text
                  x="100"
                  y="108"
                  textAnchor="middle"
                  fontSize="11"
                  fill="#94a3b8"
                >
                  Risk Score
                </text>
              </svg>
            </div>

            <div className="conf-row">
              <span>ML Confidence:</span>
              <strong>
                {result.confidence}%
              </strong>
            </div>
          </div>
        </div>

        {/* Authentication Checks */}
        <div
          className="card animate-in"
          style={{ animationDelay: '0.15s' }}
        >
          <div className="card-header">
            <h3>Authentication Checks</h3>
          </div>

          <div className="card-body">
            <table style={{ width: '100%' }}>
              <tbody>
                <tr>
                  <td className="auth-label">
                    SPF
                  </td>
                  <td>
                    {authBadge(result.spf)}
                  </td>
                </tr>

                <tr>
                  <td className="auth-label">
                    DKIM
                  </td>
                  <td>
                    {authBadge(result.dkim)}
                  </td>
                </tr>

                <tr>
                  <td className="auth-label">
                    DMARC
                  </td>
                  <td>
                    {authBadge(result.dmarc)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Email Details */}
        <div
          className="card animate-in"
          style={{ animationDelay: '0.2s' }}
        >
          <div className="card-header">
            <h3>Email Details</h3>
          </div>

          <div className="card-body detail-list">

            <div className="detail-row">
              <span className="detail-label">
                Sender
              </span>

              <span className="detail-val mono">
                {result.sender || 'Unknown'}
              </span>
            </div>

            <div className="detail-row">
              <span className="detail-label">
                Subject
              </span>

              <span className="detail-val">
                {result.subject || 'Unknown'}
              </span>
            </div>

            <div className="detail-row">
              <span className="detail-label">
                From IP
              </span>

              <span className="detail-val mono">
                {result.fromIp || 'Unknown'}
              </span>
            </div>

            <div className="detail-row">
              <span className="detail-label">
                Verdict
              </span>

              <span
                className={`badge ${
                  isPhishing
                    ? 'badge-danger'
                    : 'badge-safe'
                }`}
              >
                {isPhishing
                  ? 'Phishing'
                  : 'Safe'}
              </span>
            </div>

          </div>
        </div>

        {/* Reasons */}
        {Array.isArray(result.reasons) &&
          result.reasons.length > 0 && (
            <div
              className="card animate-in"
              style={{
                animationDelay: '0.25s',
                gridColumn: '1 / -1'
              }}
            >
              <div className="card-header">
                <h3>
                  <i
                    className="fas fa-list-ul"
                    style={{
                      marginRight: 8,
                      color: 'var(--danger)'
                    }}
                  ></i>
                  Phishing Indicators Found
                </h3>
              </div>

              <div className="card-body">
                <ul className="reason-list">
                  {result.reasons.map(
                    (reason, index) => (
                      <li
                        key={index}
                        className="reason-item"
                      >
                        <i className="fas fa-exclamation-circle reason-icon"></i>
                        {reason}
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>
          )}
      </div>

      {/* Actions */}
      <div className="result-actions animate-in">

        <button
          className="btn btn-primary"
          onClick={() =>
            result.scanId
              ? navigate(
                  `/hop/${result.scanId}`
                )
              : alert(
                  'No scan ID found for this result.'
                )
          }
        >
          <i className="fas fa-project-diagram"></i>{' '}
          View Hop Visualization
        </button>

        <button
          className="btn btn-outline"
          onClick={() => navigate('/upload')}
        >
          <i className="fas fa-redo"></i>{' '}
          Analyze Another
        </button>

        <button
          className="btn btn-outline"
          onClick={() => navigate('/history')}
        >
          <i className="fas fa-history"></i>{' '}
          View History
        </button>

      </div>
    </Sidebar>
  );
}