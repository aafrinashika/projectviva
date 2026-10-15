import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import './UploadPage.css';

export default function UploadPage() {
  const isOrgUser = localStorage.getItem('phishshield_role') === 'organization_user';
  const navigate = useNavigate();
  const fileRef = useRef();
  const [tab, setTab] = useState('paste');
  const [headerText, setHeaderText] = useState('');
  const [fileName, setFileName] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFileName(f.name);
      const reader = new FileReader();
      reader.onload = (ev) => setHeaderText(ev.target.result);
      reader.readAsText(f);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) {
      setFileName(f.name);
      const reader = new FileReader();
      reader.onload = (ev) => setHeaderText(ev.target.result);
      reader.readAsText(f);
    }
  };
  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!headerText.trim()) return;
    setAnalyzing(true);

    try {
            const token = localStorage.getItem('phishshield_token');

      const response = await fetch('http://127.0.0.1:5000/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ header_text: headerText })
      });

      const data = await response.json();
      setAnalyzing(false);

      if (!response.ok) {
        alert(data.error || 'Analysis failed');
        return;
      }

      // Cache the real result so ResultPage can recover it on refresh or
      // browser back/forward navigation, where React Router's in-memory
      // `state` is unavailable. This is the actual API response — never
      // mock data — and is overwritten by every new analysis.
      try {
        sessionStorage.setItem('phishshield_last_result', JSON.stringify(data));
      } catch (storageErr) {
        // Non-fatal: if storage is unavailable/full, navigation still works
        // via location.state for this immediate transition.
      }

      navigate('/result', { state: data });

    } catch (err) {
      setAnalyzing(false);
      alert('Could not connect to server. Is the backend running?');
    }
  };
  

  return (
    <Sidebar>
      <div className="page-header">
        <h1>Analyze Email Header</h1>
        <p>{isOrgUser ? 'Analyze your own email headers. Your organization admin can monitor the organization-wide security activity.' : 'Upload a .eml / .txt file or paste the email header directly to get an AI analysis.'}</p>
      </div>

      <div className="upload-layout">
        <div className="upload-main animate-in">
          {/* Tabs */}
          <div className="tab-group">
            <button
              className={`tab-btn ${tab === 'paste' ? 'active' : ''}`}
              onClick={() => setTab('paste')}
            >
              <i className="fas fa-paste"></i> Paste Header
            </button>
            <button
              className={`tab-btn ${tab === 'file' ? 'active' : ''}`}
              onClick={() => setTab('file')}
            >
              <i className="fas fa-file-upload"></i> Upload File
            </button>
          </div>

          <form onSubmit={handleAnalyze}>
            {tab === 'file' ? (
              <div
                className={`drop-zone ${fileName ? 'has-file' : ''}`}
                onClick={() => fileRef.current.click()}
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept=".txt,.eml"
                  onChange={handleFile}
                  style={{ display: 'none' }}
                />
                {fileName ? (
                  <>
                    <i className="fas fa-file-check dz-icon success-icon"></i>
                    <p className="dz-filename">{fileName}</p>
                    <span className="dz-hint">Click to change file</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-cloud-upload-alt dz-icon"></i>
                    <p className="dz-text">Drag & drop your file here</p>
                    <span className="dz-hint">Supports .txt and .eml — or click to browse</span>
                  </>
                )}
              </div>
            ) : (
              <div className="paste-area">
                <textarea
                  rows={16}
                  placeholder="Paste your complete email header here...&#10;&#10;Example:&#10;Received: from mail.example.com (mail.example.com [192.168.1.1])&#10;  by recipient.com with ESMTP; Fri, 08 Aug 2026 10:00:00 +0000&#10;From: sender@example.com&#10;To: you@recipient.com&#10;Subject: Important message"
                  value={headerText}
                  onChange={e => setHeaderText(e.target.value)}
                />
                {headerText && (
                  <div className="char-count">{headerText.length} characters</div>
                )}
              </div>
            )}

            <div className="upload-actions">
              <button
                type="submit"
                className={`btn btn-analyze ${analyzing ? 'analyzing' : ''}`}
                disabled={analyzing || !headerText.trim()}
              >
                {analyzing ? (
                  <><i className="fas fa-spinner fa-spin"></i> Analyzing with AI...</>
                ) : (
                  <><i className="fas fa-search"></i> Analyze Header</>
                )}
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => { setHeaderText(''); setFileName(''); }}
              >
                <i className="fas fa-redo"></i> Reset
              </button>
            </div>
          </form>
        </div>

        {/* Tips panel */}
        <div className="upload-tips animate-in">
          <h3><i className="fas fa-lightbulb"></i> How to Get the Header</h3>
          <div className="tip-list">
            <div className="tip-item">
              <div className="tip-step">1</div>
              <div>
                <strong>Gmail:</strong> Open email → Three dots menu → "Show original"
              </div>
            </div>
            <div className="tip-item">
              <div className="tip-step">2</div>
              <div>
                <strong>Outlook:</strong> Open email → File → Properties → "Internet headers"
              </div>
            </div>
            <div className="tip-item">
              <div className="tip-step">3</div>
              <div>
                <strong>Apple Mail:</strong> View → Message → "All Headers"
              </div>
            </div>
          </div>

          <div className="tip-what">
            <h4>What we check:</h4>
            <ul>
              <li><i className="fas fa-check"></i> SPF Authentication</li>
              <li><i className="fas fa-check"></i> DKIM Signature</li>
              <li><i className="fas fa-check"></i> DMARC Policy</li>
              <li><i className="fas fa-check"></i> Sender IP Reputation</li>
              <li><i className="fas fa-check"></i> Email Hop Path</li>
              <li><i className="fas fa-check"></i> ML Phishing Score</li>
            </ul>
          </div>
        </div>
      </div>
    </Sidebar>
  );
}