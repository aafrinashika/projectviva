import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import Sidebar from '../components/Sidebar';
import './ReportsPage.css';

export default function ReportsPage() {
  const isOrgUser = localStorage.getItem('phishshield_role') === 'organization_user';
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [months, setMonths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('phishshield_token');

      try {
        const [reportRes, monthlyRes] = await Promise.all([
          fetch('http://127.0.0.1:5000/api/scans/reports', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),

          fetch('http://127.0.0.1:5000/api/scans/reports/monthly', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        if (reportRes.status === 401 || monthlyRes.status === 401) {
          setError('Your session has expired. Please log in again.');
          setLoading(false);
          return;
        }

        const reportData = await reportRes.json();
        const monthlyData = await monthlyRes.json();

        if (!reportRes.ok) {
          setError(reportData.error || 'Could not load report data.');
          setLoading(false);
          return;
        }

        if (!monthlyRes.ok) {
          setError(
            monthlyData.error || 'Could not load monthly report data.'
          );
          setLoading(false);
          return;
        }

        setReport(reportData);
        setMonths(monthlyData.months || []);
      } catch (err) {
        setError(
          'Could not connect to server. Is the backend running?'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  // ------------------------------------------------------------
  // SAFE RATE
  // ------------------------------------------------------------

  const safeRate =
    report && report.totalScans > 0
      ? ((report.safeScans / report.totalScans) * 100).toFixed(1)
      : '0.0';

  // ------------------------------------------------------------
  // RECENT REPORTS (derived from monthly data — no separate
  // "generated reports" endpoint exists on the backend yet)
  // ------------------------------------------------------------

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const now = new Date();
  const currentMonthName = monthNames[now.getMonth()];
  const currentYear = now.getFullYear();

  const recentReports = [...months]
    .map((m, index) => ({ ...m, monthIndex: index }))
    .reverse()
    .map((m) => {
      const isCurrent =
        m.month === currentMonthName && m.year === currentYear;

      return {
        date: `01 ${m.month} ${m.year}`,
        name: `${m.month} ${m.year} Security Report`,
        status: isCurrent ? 'In Progress' : 'Ready',
        monthIndex: m.monthIndex,
      };
    });

  const handleViewReport = (monthIndex) => {
    const el = document.getElementById(`month-row-${monthIndex}`);
    if (!el) return;

    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('row-highlight');
    setTimeout(() => el.classList.remove('row-highlight'), 1500);
  };

  // ------------------------------------------------------------
  // CSV EXPORT
  // ------------------------------------------------------------

  const handleExportCSV = () => {
    if (!report) return;

    const userName =
      localStorage.getItem('phishshield_name') || 'PhishShield User';

    const userEmail =
      localStorage.getItem('phishshield_email') || '';

    const rows = [];

    rows.push(['PHISHSHIELD AI']);
    rows.push(['Email Security Assessment Report']);
    rows.push([]);

    rows.push(['Report Information']);
    rows.push(['Prepared For', userName]);
    rows.push(['Email Address', userEmail]);
    rows.push(['Report Type', 'Email Security Analysis']);
    rows.push([
      'Generated On',
      new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    ]);
    rows.push([
      'Generated At',
      new Date().toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    ]);

    rows.push([]);

    rows.push(['Overall Security Summary']);

    rows.push([
      'Total Scans',
      'Safe Emails',
      'Phishing Emails',
      'Safe Rate (%)',
      'Phishing Rate (%)',
      'Average Risk Score',
    ]);

    rows.push([
      report.totalScans,
      report.safeScans,
      report.phishingScans,
      safeRate,
      report.riskPercentage,
      report.averageRiskScore,
    ]);

    rows.push([]);

    rows.push(['Monthly Security Report']);

    rows.push([
      'Month',
      'Total',
      'Safe',
      'Phishing',
      'Safe Rate (%)',
      'Average Risk Score',
    ]);

    if (months.length > 0) {
      months.forEach((m) => {
        rows.push([
          `${m.month} ${m.year}`,
          m.totalScans,
          m.safeScans,
          m.phishingScans,
          m.safeRate,
          m.averageRiskScore,
        ]);
      });
    } else {
      rows.push(['No monthly data yet']);
    }

    rows.push([]);

    rows.push(['Security Insight']);

    const insight =
      report.phishingScans > 0
        ? `${report.phishingScans} phishing email(s) were detected from ${report.totalScans} analyzed email(s). Continued monitoring of suspicious email activity is recommended.`
        : `No phishing emails were detected across ${report.totalScans} analyzed email(s). Continue monitoring incoming email activity.`;

    rows.push([insight]);

    const csvContent = rows
      .map((row) =>
        row
          .map(
            (cell) =>
              `"${String(cell ?? '').replace(/"/g, '""')}"`
          )
          .join(',')
      )
      .join('\n');

    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `phishshield-security-report-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // ------------------------------------------------------------
  // PROFESSIONAL PDF EXPORT
  // ------------------------------------------------------------

  const handleExportPDF = () => {
    if (!report) return;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const margin = 15;
    const contentWidth = pageWidth - margin * 2;

    // ----------------------------------------------------------
    // COLORS
    // ----------------------------------------------------------

    const primary = [31, 94, 215];
    const primaryDark = [23, 72, 165];

    const dark = [30, 41, 59];
    const muted = [100, 116, 139];

    const success = [5, 122, 94];
    const danger = [220, 38, 38];

    const lightBg = [247, 249, 252];
    const border = [226, 232, 240];

    // ----------------------------------------------------------
    // USER INFORMATION
    // ----------------------------------------------------------

    const userName =
      localStorage.getItem('phishshield_name') ||
      'PhishShield User';

    const userEmail =
      localStorage.getItem('phishshield_email') ||
      '';

    const generatedDate = new Date();

    const generatedOn = generatedDate.toLocaleDateString(
      'en-GB',
      {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }
    );

    const generatedAt = generatedDate.toLocaleTimeString(
      'en-GB',
      {
        hour: '2-digit',
        minute: '2-digit',
      }
    );

    // ----------------------------------------------------------
    // HELPER FUNCTIONS
    // ----------------------------------------------------------

    const setText = (color) => {
      doc.setTextColor(...color);
    };

    const drawSectionTitle = (number, title, y) => {
      doc.setFillColor(...primary);
      doc.roundedRect(
        margin,
        y - 5,
        7,
        7,
        1.5,
        1.5,
        'F'
      );

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      setText([255, 255, 255]);

      doc.text(number, margin + 3.5, y, {
        align: 'center',
      });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      setText(dark);

      doc.text(title, margin + 11, y);

      return y + 9;
    };

    const drawFooter = () => {
      const totalPages = doc.internal.getNumberOfPages();

      for (let page = 1; page <= totalPages; page++) {
        doc.setPage(page);

        doc.setDrawColor(...border);
        doc.setLineWidth(0.3);

        doc.line(
          margin,
          pageHeight - 15,
          pageWidth - margin,
          pageHeight - 15
        );

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        setText(muted);

        doc.text(
          'PhishShield AI • Confidential Security Report',
          margin,
          pageHeight - 9
        );

        doc.text(
          `Page ${page} of ${totalPages}`,
          pageWidth - margin,
          pageHeight - 9,
          {
            align: 'right',
          }
        );
      }
    };

    // ----------------------------------------------------------
    // HEADER
    // ----------------------------------------------------------

    doc.setFillColor(...primary);
    doc.rect(0, 0, pageWidth, 35, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    setText([255, 255, 255]);

    doc.text('PHISHSHIELD AI', margin, 15);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    doc.text(
      'Email Security Assessment Report',
      margin,
      23
    );

    doc.setFontSize(7.5);

    doc.text(
      'AI-powered email header security analysis',
      pageWidth - margin,
      15,
      {
        align: 'right',
      }
    );

    let y = 46;

    // ----------------------------------------------------------
    // REPORT INFORMATION
    // ----------------------------------------------------------

    // ----------------------------------------------------------
// REPORT INFORMATION
// ----------------------------------------------------------
// ----------------------------------------------------------
// REPORT INFORMATION
// ----------------------------------------------------------

doc.setFillColor(...lightBg);
doc.setDrawColor(...border);

const infoHeight = 52;

doc.roundedRect(
  margin,
  y,
  contentWidth,
  infoHeight,
  2.5,
  2.5,
  'FD'
);

// Section heading
doc.setFont('helvetica', 'bold');
doc.setFontSize(9);
setText(primaryDark);

doc.text(
  'REPORT INFORMATION',
  margin + 6,
  y + 8
);

// Prepared For
doc.setFont('helvetica', 'bold');
doc.setFontSize(8);
setText(muted);

doc.text(
  'Prepared For',
  margin + 6,
  y + 17
);

doc.setFont('helvetica', 'normal');
doc.setFontSize(9);
setText(dark);

doc.text(
  userName,
  margin + 6,
  y + 23
);

// Email Address
doc.setFont('helvetica', 'bold');
doc.setFontSize(8);
setText(muted);

doc.text(
  'Email Address',
  margin + 6,
  y + 31
);

doc.setFont('helvetica', 'normal');
doc.setFontSize(9);
setText(dark);

doc.text(
  userEmail || 'Not available',
  margin + 6,
  y + 37
);

// Report Type + Generated
doc.setFont('helvetica', 'bold');
doc.setFontSize(8);
setText(muted);

doc.text(
  'Report Type',
  margin + 105,
  y + 17
);

doc.setFont('helvetica', 'normal');
doc.setFontSize(9);
setText(dark);

doc.text(
  'Email Security Analysis',
  margin + 105,
  y + 23
);

doc.setFont('helvetica', 'bold');
doc.setFontSize(8);
setText(muted);

doc.text(
  'Generated',
  margin + 105,
  y + 31
);

doc.setFont('helvetica', 'normal');
doc.setFontSize(9);
setText(dark);

doc.text(
  `${generatedOn} • ${generatedAt}`,
  margin + 105,
  y + 37
);

y += infoHeight + 12;
    // ----------------------------------------------------------
    // SECTION 01 - OVERALL SECURITY SUMMARY
    // ----------------------------------------------------------

    y = drawSectionTitle(
      '01',
      'Overall Security Summary',
      y
    );

    const summaryItems = [
      {
        label: 'TOTAL SCANS',
        value: report.totalScans,
        color: dark,
      },
      {
        label: 'SAFE EMAILS',
        value: report.safeScans,
        color: success,
      },
      {
        label: 'PHISHING EMAILS',
        value: report.phishingScans,
        color: danger,
      },
      {
        label: 'SAFE RATE',
        value: `${safeRate}%`,
        color: success,
      },
      {
        label: 'PHISHING RATE',
        value: `${report.riskPercentage}%`,
        color: danger,
      },
      {
        label: 'AVERAGE RISK SCORE',
        value: `${report.averageRiskScore}/100`,
        color: dark,
      },
    ];

    const gap = 4;
    const cardWidth =
      (contentWidth - gap * 2) / 3;

    const cardHeight = 24;

    summaryItems.forEach((item, index) => {
      const column = index % 3;
      const row = Math.floor(index / 3);

      const x =
        margin + column * (cardWidth + gap);

      const cardY =
        y + row * (cardHeight + gap);

      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(...border);

      doc.roundedRect(
        x,
        cardY,
        cardWidth,
        cardHeight,
        2,
        2,
        'FD'
      );

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);

      setText(item.color);

      doc.text(
        String(item.value),
        x + 5,
        cardY + 11
      );

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);

      setText(muted);

      doc.text(
        item.label,
        x + 5,
        cardY + 18
      );
    });

    y += cardHeight * 2 + gap + 12;

    // ----------------------------------------------------------
    // SECTION 02 - MONTHLY SECURITY REPORT
    // ----------------------------------------------------------

    y = drawSectionTitle(
      '02',
      'Monthly Security Report',
      y
    );

    const tableX = margin;

    const tableWidth = contentWidth;

    const rowHeight = 8;

    const columnWidths = [
      43,
      24,
      24,
      28,
      30,
      31,
    ];

    const headers = [
      'Month',
      'Total',
      'Safe',
      'Phishing',
      'Safe Rate',
      'Avg. Risk',
    ];

    const drawMonthlyHeader = () => {
      doc.setFillColor(...primary);

      doc.rect(
        tableX,
        y,
        tableWidth,
        rowHeight,
        'F'
      );

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);

      setText([255, 255, 255]);

      let x = tableX + 3;

      headers.forEach((header, index) => {
        doc.text(
          header,
          x,
          y + 5.5
        );

        x += columnWidths[index];
      });

      y += rowHeight;
    };

    drawMonthlyHeader();

    if (months.length > 0) {
      months.forEach((month, index) => {
        if (y > pageHeight - 30) {
          doc.addPage();

          y = 20;

          drawMonthlyHeader();
        }

        if (index % 2 === 1) {
          doc.setFillColor(...lightBg);

          doc.rect(
            tableX,
            y,
            tableWidth,
            rowHeight,
            'F'
          );
        }

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);

        setText(dark);

        const values = [
          `${month.month} ${month.year}`,
          month.totalScans,
          month.safeScans,
          month.phishingScans,
          `${month.safeRate}%`,
          month.averageRiskScore,
        ];

        let x = tableX + 3;

        values.forEach((value, columnIndex) => {
          doc.text(
            String(value),
            x,
            y + 5.5
          );

          x += columnWidths[columnIndex];
        });

        y += rowHeight;
      });
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);

      setText(muted);

      doc.text(
        'No monthly data available yet.',
        tableX + 3,
        y + 5.5
      );

      y += rowHeight;
    }

    y += 12;

    // ----------------------------------------------------------
    // SECTION 03 - SECURITY INSIGHT
    // ----------------------------------------------------------

    y = drawSectionTitle(
      '03',
      'Security Insight',
      y
    );

    const phishingCount =
      Number(report.phishingScans) || 0;

    const totalCount =
      Number(report.totalScans) || 0;

    let insightText = '';

    if (totalCount === 0) {
      insightText =
        'No email scans have been recorded yet. Run an email header analysis to generate security insights.';
    } else if (phishingCount > 0) {
      insightText =
        `${phishingCount} phishing email(s) were detected from ${totalCount} analyzed email(s). Continued monitoring of suspicious email activity is recommended.`;
    } else {
      insightText =
        `No phishing emails were detected across ${totalCount} analyzed email(s). Continue monitoring incoming email activity for potential threats.`;
    }

    doc.setFillColor(...lightBg);
    doc.setDrawColor(...border);

    const insightHeight = 25;

    doc.roundedRect(
      margin,
      y,
      contentWidth,
      insightHeight,
      2.5,
      2.5,
      'FD'
    );

    doc.setFillColor(
      ...(phishingCount > 0
        ? danger
        : success)
    );

    doc.roundedRect(
      margin,
      y,
      3,
      insightHeight,
      1.5,
      1.5,
      'F'
    );

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);

    setText(dark);

    doc.text(
      phishingCount > 0
        ? 'Attention Recommended'
        : 'Security Status',
      margin + 8,
      y + 9
    );

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    setText(muted);

    const wrappedInsight = doc.splitTextToSize(
      insightText,
      contentWidth - 16
    );

    doc.text(
      wrappedInsight,
      margin + 8,
      y + 16
    );

    // ----------------------------------------------------------
    // FOOTER
    // ----------------------------------------------------------

    drawFooter();

    // ----------------------------------------------------------
    // SAVE
    // ----------------------------------------------------------

    doc.save(
      `phishshield-security-report-${new Date()
        .toISOString()
        .slice(0, 10)}.pdf`
    );
  };

  // ------------------------------------------------------------
  // PRINT
  // ------------------------------------------------------------

  const handlePrint = () => {
    window.print();
  };

  // ------------------------------------------------------------
  // RETURN UI
  // ------------------------------------------------------------

  return (
    <Sidebar>

      {/* ======================================================
          PRINT VIEW
      ======================================================= */}

      {report && (
        <div className="print-only">

          <h1>PHISHSHIELD AI</h1>

          <h2>Email Security Assessment Report</h2>

          <p className="print-generated">
            Prepared For:{' '}
            {localStorage.getItem('phishshield_name') ||
              'PhishShield User'}
          </p>

          <p className="print-generated">
            Email:{' '}
            {localStorage.getItem('phishshield_email') || ''}
          </p>

          <p className="print-generated">
            Generated:{' '}
            {new Date().toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>

          <h3>Overall Security Summary</h3>

          <hr />

          <table className="print-table">
            <tbody>

              <tr>
                <td>Total Scans</td>
                <td>{report.totalScans}</td>
              </tr>

              <tr>
                <td>Safe Emails</td>
                <td>{report.safeScans}</td>
              </tr>

              <tr>
                <td>Phishing Emails</td>
                <td>{report.phishingScans}</td>
              </tr>

              <tr>
                <td>Safe Rate</td>
                <td>{safeRate}%</td>
              </tr>

              <tr>
                <td>Phishing Rate</td>
                <td>{report.riskPercentage}%</td>
              </tr>

              <tr>
                <td>Average Risk Score</td>
                <td>{report.averageRiskScore}</td>
              </tr>

            </tbody>
          </table>

          <h3>Monthly Security Report</h3>

          <hr />

          <table className="print-table print-monthly">

            <thead>
              <tr>
                <th>Month</th>
                <th>Total</th>
                <th>Safe</th>
                <th>Phishing</th>
                <th>Safe Rate</th>
                <th>Avg Risk</th>
              </tr>
            </thead>

            <tbody>

              {months.length > 0 ? (
                months.map((month, index) => (
                  <tr key={index}>

                    <td>
                      {month.month} {month.year}
                    </td>

                    <td>
                      {month.totalScans}
                    </td>

                    <td>
                      {month.safeScans}
                    </td>

                    <td>
                      {month.phishingScans}
                    </td>

                    <td>
                      {month.safeRate}%
                    </td>

                    <td>
                      {month.averageRiskScore}
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6}>
                    No monthly data yet
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>
      )}

      {/* ======================================================
          SCREEN VIEW
      ======================================================= */}

      <div className="screen-only">

        <div className="page-header">

          <h1>Security Reports</h1>

          <p>
            View comprehensive email security statistics
            from your scan history.
          </p>

        </div>

        {/* ====================================================
            LOADING
        ===================================================== */}

        {loading ? (

          <div className="card animate-in">

            <div
              className="card-body empty-state"
              style={{
                textAlign: 'center',
                padding: 48,
              }}
            >

              <i
                className="fas fa-spinner fa-spin"
                style={{
                  fontSize: '1.6rem',
                  marginBottom: 8,
                }}
              />

              <p>
                Loading report data...
              </p>

            </div>

          </div>

        ) : error ? (

          /* ==================================================
             ERROR
          =================================================== */

          <div className="card animate-in">

            <div
              className="card-body empty-state"
              style={{
                textAlign: 'center',
                padding: 48,
                color: 'var(--danger)',
              }}
            >

              <i
                className="fas fa-exclamation-triangle"
                style={{
                  fontSize: '1.6rem',
                  marginBottom: 8,
                }}
              />

              <p>{error}</p>

            </div>

          </div>

        ) : (

          <>

            {/* =================================================
                STAT CARDS
            ================================================== */}

            <div className="stat-grid">

              <div className="stat-card animate-in">

                <div className="stat-icon blue">
                  <i className="fas fa-envelope" />
                </div>

                <div className="stat-info">

                  <h3>
                    {report.totalScans.toLocaleString()}
                  </h3>

                  <p>Total Scans</p>

                </div>

              </div>

              <div
                className="stat-card animate-in"
                style={{
                  animationDelay: '0.05s',
                }}
              >

                <div className="stat-icon green">
                  <i className="fas fa-check-circle" />
                </div>

                <div className="stat-info">

                  <h3>
                    {report.safeScans.toLocaleString()}
                  </h3>

                  <p>Safe Emails</p>

                </div>

              </div>

              <div
                className="stat-card animate-in"
                style={{
                  animationDelay: '0.1s',
                }}
              >

                <div className="stat-icon red">
                  <i className="fas fa-shield-virus" />
                </div>

                <div className="stat-info">

                  <h3>
                    {report.phishingScans.toLocaleString()}
                  </h3>

                  <p>Phishing Emails</p>

                </div>

              </div>

              <div
                className="stat-card animate-in"
                style={{
                  animationDelay: '0.15s',
                }}
              >

                <div className="stat-icon yellow">
                  <i className="fas fa-percentage" />
                </div>

                <div className="stat-info">

                  <h3>
                    {report.averageRiskScore}
                  </h3>

                  <p>Avg. Risk Score</p>

                </div>

              </div>

            </div>

            {/* =================================================
                OVERALL SUMMARY
            ================================================== */}

            <div className="card animate-in">

              <div className="card-header">

                <h3>

                  <i
                    className="fas fa-chart-pie"
                    style={{
                      marginRight: 8,
                      color: 'var(--primary)',
                    }}
                  />

                  Overall Summary

                </h3>

              </div>

              <div className="table-wrap">

                <table>

                  <thead>

                    <tr>

                      <th>Period</th>
                      <th>Total</th>
                      <th>Safe</th>
                      <th>Phishing</th>
                      <th>Safe Rate</th>
                      <th>Phishing Rate</th>

                    </tr>

                  </thead>

                  <tbody>

                    <tr>

                      <td>
                        <strong>
                          All time
                        </strong>
                      </td>

                      <td>
                        {report.totalScans.toLocaleString()}
                      </td>

                      <td
                        style={{
                          color: 'var(--success)',
                          fontWeight: 600,
                        }}
                      >
                        {report.safeScans.toLocaleString()}
                      </td>

                      <td
                        style={{
                          color: 'var(--danger)',
                          fontWeight: 600,
                        }}
                      >
                        {report.phishingScans.toLocaleString()}
                      </td>

                      <td>

                        <div className="mini-bar-wrap">

                          <div
                            className="mini-bar success-bar"
                            style={{
                              width: `${safeRate}%`,
                            }}
                          />

                          <span>
                            {safeRate}%
                          </span>

                        </div>

                      </td>

                      <td>

                        <span className="badge badge-danger">
                          {report.riskPercentage}%
                        </span>

                      </td>

                    </tr>

                  </tbody>

                </table>

              </div>

            </div>

            {/* =================================================
                MONTHLY REPORT
            ================================================== */}

            <div className="card animate-in">

              <div className="card-header">

                <h3>

                  <i
                    className="fas fa-calendar-alt"
                    style={{
                      marginRight: 8,
                      color: 'var(--primary)',
                    }}
                  />

                  Monthly Security Report

                </h3>

              </div>

              <div className="table-wrap">

                <table>

                  <thead>

                    <tr>

                      <th>Month</th>
                      <th>Total</th>
                      <th>Safe</th>
                      <th>Phishing</th>
                      <th>Safe Rate</th>
                      <th>Avg. Risk Score</th>

                    </tr>

                  </thead>

                  <tbody>

                    {months.length > 0 ? (

                      months.map((row, index) => (

                        <tr key={index} id={`month-row-${index}`}>

                          <td>
                            <strong>
                              {row.month} {row.year}
                            </strong>
                          </td>

                          <td>
                            {row.totalScans.toLocaleString()}
                          </td>

                          <td
                            style={{
                              color: 'var(--success)',
                              fontWeight: 600,
                            }}
                          >
                            {row.safeScans.toLocaleString()}
                          </td>

                          <td
                            style={{
                              color: 'var(--danger)',
                              fontWeight: 600,
                            }}
                          >
                            {row.phishingScans}
                          </td>

                          <td>

                            <div className="mini-bar-wrap">

                              <div
                                className="mini-bar success-bar"
                                style={{
                                  width: `${row.safeRate}%`,
                                }}
                              />

                              <span>
                                {row.safeRate}%
                              </span>

                            </div>

                          </td>

                          <td>

                            <span className="badge badge-safe">
                              {row.averageRiskScore}
                            </span>

                          </td>

                        </tr>

                      ))

                    ) : (

                      <tr>

                        <td
                          colSpan={6}
                          style={{
                            textAlign: 'center',
                            padding: 24,
                            color: 'var(--text-muted)',
                          }}
                        >

                          No scans yet - run some analyses
                          to see monthly trends.

                        </td>

                      </tr>

                    )}

                  </tbody>

                </table>

              </div>

            </div>

            {/* =================================================
                EXPORT OPTIONS
            ================================================== */}

            <div
              className="reports-bottom animate-in"
              style={{
                animationDelay: '0.15s',
              }}
            >

              <div className="card">

                <div className="card-header">

                  <h3>

                    <i
                      className="fas fa-download"
                      style={{
                        marginRight: 8,
                        color: 'var(--success)',
                      }}
                    />

                    Export Options

                  </h3>

                </div>

                <div className="card-body export-buttons">

                  <button
                    className="btn export-btn export-pdf"
                    onClick={handleExportPDF}
                  >

                    <i className="fas fa-file-pdf" />

                    {' '}
                    Download PDF

                  </button>

                  <button
                    className="btn export-btn export-csv"
                    onClick={handleExportCSV}
                  >

                    <i className="fas fa-file-csv" />

                    {' '}
                    Export CSV

                  </button>

                  <button
                    className="btn export-btn export-print"
                    onClick={handlePrint}
                  >

                    <i className="fas fa-print" />

                    {' '}
                    Print Report

                  </button>

                </div>

              </div>

              <div className="card">

                <div className="card-header">

                  <h3>

                    <i
                      className="fas fa-file-alt"
                      style={{
                        marginRight: 8,
                        color: 'var(--primary)',
                      }}
                    />

                    Recent Reports

                  </h3>

                </div>

                <div className="table-wrap">

                  <table>

                    <thead>

                      <tr>

                        <th>Date</th>
                        <th>Report Name</th>
                        <th>Status</th>
                        <th>Action</th>

                      </tr>

                    </thead>

                    <tbody>

                      {recentReports.length > 0 ? (

                        recentReports.map((r, i) => (

                          <tr key={i}>

                            <td>{r.date}</td>

                            <td>{r.name}</td>

                            <td>

                              <span
                                className={`badge ${
                                  r.status === 'Ready'
                                    ? 'badge-safe'
                                    : 'badge-warning'
                                }`}
                              >
                                {r.status}
                              </span>

                            </td>

                            <td>

                              <button
                                className="btn btn-outline"
                                style={{ padding: '4px 12px' }}
                                onClick={() =>
                                  handleViewReport(r.monthIndex)
                                }
                              >

                                <i className="fas fa-eye" />
                                {' '}
                                View

                              </button>

                            </td>

                          </tr>

                        ))

                      ) : (

                        <tr>

                          <td
                            colSpan={4}
                            style={{
                              textAlign: 'center',
                              padding: 24,
                              color: 'var(--text-muted)',
                            }}
                          >

                            No reports generated yet.

                          </td>

                        </tr>

                      )}

                    </tbody>

                  </table>

                </div>

              </div>

            </div>

          </>

        )}

      </div>

      {/* ======================================================
          BACK TO DASHBOARD
      ======================================================= */}

      <div
        className="screen-only"
        style={{
          textAlign: 'center',
          marginTop: 8,
        }}
      >

        <button
          className="btn btn-outline"
          onClick={() => navigate('/dashboard')}
        >

          <i className="fas fa-home" />

          {' '}
          Back to Dashboard

        </button>

      </div>

    </Sidebar>
  );
}