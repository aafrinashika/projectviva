import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import './HistoryPage.css';

export default function HistoryPage() {
  const isOrgUser = localStorage.getItem('phishshield_role') === 'organization_user';
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Sorting
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError('');

      try {
        const token = localStorage.getItem('phishshield_token');

        const response = await fetch(
          'http://127.0.0.1:5000/api/scans/history',
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (response.status === 401) {
          setError('Your session has expired. Please log in again.');
          setLoading(false);
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Could not load scan history.');
          setLoading(false);
          return;
        }

        const mapped = data.scans.map((scan) => ({
          id: scan.id,

          // Keep the original timestamp for sorting
          timestamp: scan.timestamp,

          // Formatted date only for display
          date: new Date(scan.timestamp).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          }),

          sender: scan.analysis_result?.sender || 'Unknown',
          risk: Number(scan.risk_score) || 0,
          status: scan.verdict,
          result: scan.analysis_result
        }));

        setScans(mapped);
      } catch (err) {
        setError('Could not connect to server. Is the backend running?');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // Search + Filter
  const filtered = scans.filter((scan) => {
    const searchText = search.toLowerCase().trim();

    const matchSearch =
      scan.sender.toLowerCase().includes(searchText);

    const matchFilter =
      filter === 'all' || scan.status === filter;

    return matchSearch && matchFilter;
  });

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    let comparison = 0;

    if (sortField === 'date') {
      comparison =
        new Date(a.timestamp).getTime() -
        new Date(b.timestamp).getTime();
    }

    if (sortField === 'risk') {
      comparison = a.risk - b.risk;
    }

    return sortDirection === 'asc'
      ? comparison
      : -comparison;
  });

  // Pagination calculations
  const totalPages = Math.max(
    1,
    Math.ceil(sorted.length / itemsPerPage)
  );

  const startIndex = (currentPage - 1) * itemsPerPage;

  const paginatedScans = sorted.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const startEntry =
    sorted.length === 0 ? 0 : startIndex + 1;

  const endEntry = Math.min(
    startIndex + itemsPerPage,
    sorted.length
  );

  // Sorting handler
  const handleSort = (field) => {
    setCurrentPage(1);

    if (sortField === field) {
      setSortDirection((prev) =>
        prev === 'asc' ? 'desc' : 'asc'
      );
    } else {
      setSortField(field);

      // Default sorting direction
      if (field === 'date') {
        setSortDirection('desc');
      } else if (field === 'risk') {
        setSortDirection('desc');
      }
    }
  };

  // Filter handler
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  // Search handler
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  // Pagination
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const riskColor = (r) =>
    r >= 70
      ? '#e02424'
      : r >= 40
        ? '#c27803'
        : '#057a55';

  const statusBadge = (status) => {
    const map = {
      safe: ['badge-safe', 'Safe'],
      phishing: ['badge-danger', 'Phishing'],
    };

    const [cls, label] =
      map[status] || ['badge-warning', status];

    return (
      <span className={`badge ${cls}`}>
        {label}
      </span>
    );
  };

  const counts = {
    all: scans.length,
    safe: scans.filter(
      (s) => s.status === 'safe'
    ).length,
    phishing: scans.filter(
      (s) => s.status === 'phishing'
    ).length,
  };

  return (
    <Sidebar>
      <div className="page-header">
        <h1>Email History</h1>
        <p>
          Browse and search through all your previous
          analysis results.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        {[
          {
            key: 'all',
            label: 'All',
            color: 'tab-blue'
          },
          {
            key: 'safe',
            label: 'Safe',
            color: 'tab-green'
          },
          {
            key: 'phishing',
            label: 'Phishing',
            color: 'tab-red'
          },
        ].map((t) => (
          <button
            key={t.key}
            className={`filter-tab ${
              filter === t.key
                ? `active ${t.color}`
                : ''
            }`}
            onClick={() =>
              handleFilterChange(t.key)
            }
          >
            {t.label}
            <span className="tab-count">
              {counts[t.key]}
            </span>
          </button>
        ))}
      </div>

      <div className="card animate-in">

        {/* Search */}
        <div
          className="card-header"
          style={{ gap: 12 }}
        >
          <div className="search-wrap">
            <i className="fas fa-search search-icon-f"></i>

            <input
              type="text"
              placeholder="Search by sender email..."
              value={search}
              onChange={handleSearchChange}
              className="search-input"
            />

            {search && (
              <button
                className="search-clear"
                onClick={() => {
                  setSearch('');
                  setCurrentPage(1);
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>

          <span className="result-count">
            {filtered.length} results
          </span>
        </div>

        {/* Table */}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>

                {/* DATE SORT */}
                <th
                  onClick={() => handleSort('date')}
                  style={{
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                  title="Sort by date"
                >
                  Date{' '}
                  <span
                    style={{
                      marginLeft: 5,
                      opacity:
                        sortField === 'date'
                          ? 1
                          : 0.35
                    }}
                  >
                    {sortField === 'date'
                      ? sortDirection === 'asc'
                        ? '↑'
                        : '↓'
                      : '↕'}
                  </span>
                </th>

                <th>Sender</th>

                {/* RISK SORT */}
                <th
                  onClick={() => handleSort('risk')}
                  style={{
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                  title="Sort by risk score"
                >
                  Risk Score{' '}
                  <span
                    style={{
                      marginLeft: 5,
                      opacity:
                        sortField === 'risk'
                          ? 1
                          : 0.35
                    }}
                  >
                    {sortField === 'risk'
                      ? sortDirection === 'asc'
                        ? '↑'
                        : '↓'
                      : '↕'}
                  </span>
                </th>

                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {/* LOADING */}
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="empty-row"
                  >
                    <i className="fas fa-spinner fa-spin"></i>
                    <p>
                      Loading scan history...
                    </p>
                  </td>
                </tr>

              /* ERROR */
              ) : error ? (
                <tr>
                  <td
                    colSpan={6}
                    className="empty-row"
                  >
                    <i className="fas fa-exclamation-triangle"></i>
                    <p>{error}</p>
                  </td>
                </tr>

              /* DATA */
              ) : paginatedScans.length > 0 ? (
                paginatedScans.map((scan, idx) => (
                  <tr key={scan.id}>

                    {/* NUMBER */}
                    <td
                      style={{
                        color: 'var(--text-muted)',
                        fontWeight: 600
                      }}
                    >
                      {startIndex + idx + 1}
                    </td>

                    {/* DATE */}
                    <td
                      style={{
                        color: 'var(--text-muted)'
                      }}
                    >
                      {scan.date}
                    </td>

                    {/* SENDER */}
                    <td>
                      <span className="sender-mono">
                        {scan.sender}
                      </span>
                    </td>

                    {/* RISK */}
                    <td>
                      <div className="risk-cell">

                        <div className="risk-bg">
                          <div
                            className="risk-fg"
                            style={{
                              width: `${scan.risk}%`,
                              background:
                                riskColor(scan.risk)
                            }}
                          ></div>
                        </div>

                        <span
                          style={{
                            color:
                              riskColor(scan.risk),
                            fontWeight: 700,
                            fontSize: '0.88rem',
                            minWidth: 36
                          }}
                        >
                          {scan.risk}%
                        </span>

                      </div>
                    </td>

                    {/* STATUS */}
                    <td>
                      {statusBadge(scan.status)}
                    </td>

                    {/* ACTION */}
                    <td>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() =>
  navigate('/result', {
    state: { ...scan.result, scanId: scan.id }
  })
}

                      >
                        <i className="fas fa-eye"></i>{' '}
                        View
                      </button>
                    </td>

                  </tr>
                ))

              /* EMPTY */
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="empty-row"
                  >
                    <i className="fas fa-inbox"></i>
                    <p>
                      {search || filter !== 'all'
                        ? 'No matching results found'
                        : 'No scan history yet'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {!loading &&
          !error &&
          sorted.length > 0 && (
            <div className="pagination-row">

              <span className="page-info">
                Showing {startEntry}–{endEntry} of{' '}
                {sorted.length} entries
              </span>

              <div
                className="pagination-controls"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >

                {/* PREVIOUS */}
                <button
                  className="pagination-btn"
                  disabled={currentPage === 1}
                  onClick={() =>
                    goToPage(currentPage - 1)
                  }
                  title="Previous page"
                >
                  <i className="fas fa-chevron-left"></i>
                </button>

                {/* PAGE NUMBERS */}
                {Array.from(
                  { length: totalPages },
                  (_, i) => i + 1
                ).map((page) => (
                  <button
                    key={page}
                    className={`pagination-btn ${
                      currentPage === page
                        ? 'active'
                        : ''
                    }`}
                    onClick={() =>
                      goToPage(page)
                    }
                  >
                    {page}
                  </button>
                ))}

                {/* NEXT */}
                <button
                  className="pagination-btn"
                  disabled={
                    currentPage === totalPages
                  }
                  onClick={() =>
                    goToPage(currentPage + 1)
                  }
                  title="Next page"
                >
                  <i className="fas fa-chevron-right"></i>
                </button>

              </div>
            </div>
          )}

      </div>
    </Sidebar>
  );
}