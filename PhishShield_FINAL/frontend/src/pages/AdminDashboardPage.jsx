import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { orgFetch } from '../api';
import './AdminDashboardPage.css';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => { orgFetch('/api/org/dashboard').then(setData).catch(e => setError(e.message)); }, []);

  const statusBadge = status => status === 'phishing'
    ? <span className="badge badge-danger">Phishing</span>
    : <span className="badge badge-safe">Safe</span>;
  const riskClass = r => r >= 70 ? 'risk-danger' : r >= 40 ? 'risk-warning' : 'risk-safe';

  if (error) return <Sidebar role="organization_admin"><div className="page-header"><h1>Organization Dashboard</h1><p>{error}</p></div></Sidebar>;
  if (!data) return <Sidebar role="organization_admin"><div className="page-header"><h1>Organization Dashboard</h1><p>Loading organization data...</p></div></Sidebar>;

  return (
    <Sidebar role="organization_admin">
      <div className="page-header"><h1>Organization Dashboard</h1><p>Monitor and manage organization-wide email security.</p></div>
      <div className="stat-grid">
        {[['blue','fa-envelope',data.totalScans,'Total Emails'],['green','fa-check-circle',data.safeScans,'Safe Emails'],['red','fa-shield-virus',data.phishingScans,'Phishing Detected'],['yellow','fa-bell',data.todayAlerts,"Today's Alerts"]].map(([c,icon,n,label]) => <div className="stat-card animate-in" key={label}><div className={`stat-icon ${c}`}><i className={`fas ${icon}`}></i></div><div className="stat-info"><h3>{n}</h3><p>{label}</p></div></div>)}
      </div>

      <div className="admin-grid">
        <div className="card animate-in"><div className="card-header"><h3>Recent Email Analysis</h3><button className="btn btn-outline btn-sm" onClick={()=>navigate('/admin/analysis')}>View All</button></div>
          <div className="table-wrap"><table><thead><tr><th>Date</th><th>Sender</th><th>Status</th><th>Risk</th></tr></thead><tbody>
            {data.recentScans.length ? data.recentScans.map((r,i)=><tr key={r.id||i}><td className="muted-cell">{new Date(r.timestamp).toLocaleDateString()}</td><td><span className="mono-sm">{r.sender}</span></td><td>{statusBadge(r.verdict)}</td><td className={`risk-number ${riskClass(r.risk_score)}`}>{r.risk_score}%</td></tr>) : <tr><td colSpan="4" style={{textAlign:'center'}}>No scans yet.</td></tr>}
          </tbody></table></div>
        </div>
        <div className="card animate-in"><div className="card-header"><h3>Security Summary</h3><button className="btn btn-outline btn-sm" onClick={()=>navigate('/admin/reports')}>View All</button></div><div className="card-body security-summary"><div className="progress-group">
          <div className="prog-row"><span>Total Emails</span><strong>{data.totalScans}</strong></div><div className="prog-bar-wrap"><div className="prog-bar prog-blue" style={{width:'100%'}}></div></div>
          <div className="prog-row"><span>Safe Emails</span><strong className="text-success">{data.safeScans}</strong></div><div className="prog-bar-wrap"><div className="prog-bar prog-green" style={{width:`${data.totalScans ? data.safeScans/data.totalScans*100 : 0}%`}}></div></div>
          <div className="prog-row"><span>Phishing Emails</span><strong className="text-danger">{data.phishingScans}</strong></div><div className="prog-bar-wrap"><div className="prog-bar prog-red" style={{width:`${data.totalScans ? data.phishingScans/data.totalScans*100 : 0}%`}}></div></div>
          <div className="prog-row"><span>Average Risk</span><strong className="text-indigo">{data.averageRiskScore}%</strong></div><div className="prog-bar-wrap"><div className="prog-bar prog-indigo" style={{width:`${data.averageRiskScore}%`}}></div></div>
        </div></div></div>
      </div>

      <div className="admin-grid-2 animate-in">
        <div className="card"><div className="card-header"><h3>Recent Phishing Alerts</h3><button className="btn btn-outline btn-sm" onClick={()=>navigate('/admin/alerts')}>View All</button></div><div className="table-wrap"><table><thead><tr><th>Email</th><th>Risk</th></tr></thead><tbody>
          {data.alerts.length ? data.alerts.map((a,i)=><tr key={a.id||i}><td><span className="mono-sm">{a.sender}</span></td><td><span className={`badge ${a.risk_score>=90?'badge-danger':'badge-warning'}`}>{a.risk_score}%</span></td></tr>) : <tr><td colSpan="2" style={{textAlign:'center'}}>No phishing alerts.</td></tr>}
        </tbody></table></div></div>
        <div className="card"><div className="card-header"><h3>Quarantine</h3><button className="btn btn-outline btn-sm" onClick={()=>navigate('/admin/quarantine')}>View All</button></div><div className="table-wrap"><table><thead><tr><th>Sender</th><th>Risk</th><th>Action</th></tr></thead><tbody>
          {data.quarantine.length ? data.quarantine.map((q,i)=><tr key={q.id||i}><td><span className="mono-sm">{q.sender}</span></td><td>{q.risk_score}%</td><td><button className="btn btn-success btn-sm" onClick={()=>navigate('/admin/quarantine')}>Review</button></td></tr>) : <tr><td colSpan="3" style={{textAlign:'center'}}>No quarantined emails.</td></tr>}
        </tbody></table></div></div>
      </div>
    </Sidebar>
  );
}
