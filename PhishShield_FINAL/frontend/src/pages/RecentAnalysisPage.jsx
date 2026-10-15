import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { orgFetch } from '../api';
import './AdminDashboardPage.css';

export default function RecentAnalysisPage() {
  const [scans,setScans]=useState(null);
  useEffect(()=>{orgFetch('/api/org/analysis').then(d=>setScans(d.scans)).catch(()=>setScans([]));},[]);
  const badge=s=>s==='phishing'?<span className="badge badge-danger">Phishing</span>:<span className="badge badge-safe">Safe</span>;
  return <Sidebar role="organization_admin"><div className="page-header"><h1>Recent Analysis</h1><p>Review recent organization-wide email analysis results.</p></div><div className="card animate-in"><div className="card-header"><h3>Organization Scan History</h3></div><div className="table-wrap"><table><thead><tr><th>Date</th><th>User</th><th>Sender</th><th>Status</th><th>Risk</th></tr></thead><tbody>{scans?.length?scans.map(s=><tr key={s.id}><td className="muted-cell">{new Date(s.timestamp).toLocaleString()}</td><td>{s.user_email}</td><td><span className="mono-sm">{s.sender}</span></td><td>{badge(s.verdict)}</td><td style={{fontWeight:700}}>{s.risk_score}%</td></tr>):<tr><td colSpan="5" style={{textAlign:'center'}}>No organization scans yet.</td></tr>}</tbody></table></div></div></Sidebar>
}
