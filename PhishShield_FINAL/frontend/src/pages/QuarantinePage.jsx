import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { orgFetch } from "../api";
import "./AdminDashboardPage.css";

export default function QuarantinePage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    loadQuarantine();
  }, []);

  async function loadQuarantine() {
    try {
      const data = await orgFetch("/api/org/quarantine");
      setItems(data.quarantine || []);
    } catch {
      setItems([]);
    }
  }

  async function releaseEmail(id) {
    try {
      await orgFetch(`/api/org/quarantine/${id}/release`, {
        method: "POST",
      });

      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert("Failed to release email.");
    }
  }

  async function deleteEmail(id) {
    if (!window.confirm("Delete this email permanently?")) return;

    try {
      await orgFetch(`/api/org/quarantine/${id}`, {
        method: "DELETE",
      });

      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert("Failed to delete email.");
    }
  }

  return (
    <Sidebar role="organization_admin">
      <div className="page-header">
        <h1>Quarantine</h1>
        <p>
          Review high-risk phishing emails isolated by organization security
          rules.
        </p>
      </div>

      <div className="card animate-in">
        <div className="card-header">
          <h3>
            <i
              className="fas fa-lock"
              style={{ color: "var(--text-muted)", marginRight: 8 }}
            ></i>
            Quarantined Emails
          </h3>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Sender</th>
                <th>Risk</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {items.length > 0 ? (
                items.map((q) => (
                  <tr key={q.id}>
                    <td className="muted-cell">
                      {new Date(q.timestamp).toLocaleString()}
                    </td>

                    <td>
                      <span className="mono-sm">{q.sender}</span>
                    </td>

                    <td>
                      <span className="badge badge-danger">
                        {q.risk_score}%
                      </span>
                    </td>

                    <td>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => releaseEmail(q.id)}
                      >
                        Release
                      </button>

                      <button
                        className="btn btn-danger btn-sm"
                        style={{ marginLeft: "8px" }}
                        onClick={() => deleteEmail(q.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center" }}>
                    No quarantined emails.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Sidebar>
  );
}