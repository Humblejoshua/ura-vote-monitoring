// ─── Utility Helpers ───
const fmt = (n) => new Intl.NumberFormat('en-UG', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Math.round(n || 0));
const fmtFull = (n) => new Intl.NumberFormat('en-UG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);
const fmtDate = (d) => { if (!d) return '-'; try { return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); } catch { return d; } };
const pct = (a, b) => b > 0 ? ((a / b) * 100).toFixed(1) : '0.0';
const pctColor = (p) => p < 50 ? '#16a34a' : p < 80 ? '#d97706' : '#dc2626';
const pctBadge = (p) => p < 50 ? 'badge-green' : p < 80 ? 'badge-amber' : 'badge-red';
const uid = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

const { useState, useEffect, useCallback, useRef, createContext, useContext, useMemo } = React;

// ─── Chart.js global defaults (TailAdmin palette) ───
const CHART_PALETTE = ['#3C50E0', '#F0950C', '#10B981', '#D34053', '#8A63D2', '#259AE6'];
const chartYFmt = v => v >= 1e9 ? 'UGX ' + (v / 1e9).toFixed(1) + 'B' : v >= 1e6 ? 'UGX ' + (v / 1e6).toFixed(0) + 'M' : 'UGX ' + v;
Chart.defaults.font.family = "'Satoshi', 'Segoe UI', system-ui, sans-serif";
Chart.defaults.font.size = 11;
Chart.defaults.color = '#64748B';
Chart.defaults.borderColor = '#E2E8F0';
Chart.defaults.plugins.legend.labels.usePointStyle = true;
Chart.defaults.plugins.legend.labels.pointStyle = 'circle';
Chart.defaults.plugins.legend.labels.boxWidth = 8;
Chart.defaults.plugins.legend.labels.boxHeight = 8;
Chart.defaults.plugins.tooltip.backgroundColor = '#1C2434';
Chart.defaults.plugins.tooltip.titleColor = '#fff';
Chart.defaults.plugins.tooltip.padding = 10;
Chart.defaults.plugins.tooltip.cornerRadius = 8;
Chart.defaults.plugins.tooltip.boxPadding = 4;
Chart.defaults.plugins.tooltip.callbacks.label = ctx => ` ${ctx.dataset.label}: ${chartYFmt(ctx.raw)}`;

// ─── Data Store (localStorage-backed) ───
const DataStore = {
  getPayments() {
    try { return JSON.parse(localStorage.getItem('uravotes_payments') || '[]'); } catch { return []; }
  },
  savePayments(payments) {
    localStorage.setItem('uravotes_payments', JSON.stringify(payments));
  },
  addPayment(payment) {
    const payments = this.getPayments();
    payments.push(payment);
    this.savePayments(payments);
    return payments;
  },
  deletePayment(id) {
    const payments = this.getPayments().filter(p => p.id !== id);
    this.savePayments(payments);
    return payments;
  },
  getSpentByVoteCode(voteCode) {
    return this.getPayments()
      .filter(p => p.vote_code === voteCode)
      .reduce((sum, p) => sum + (p.amount || 0), 0);
  }
};

// ─── App Context ───
const AppCtx = createContext();
const useApp = () => useContext(AppCtx);

// ─── Toast System ───
function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, []);
  return <div className={`toast toast-${type}`}>{message}</div>;
}

// ─── Modal ───
function Modal({ title, children, onClose, wide }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${wide ? 'wide' : ''}`}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Confirm Dialog ───
function Confirm({ message, onConfirm, onCancel }) {
  return (
    <Modal title="Confirm Action" onClose={onCancel}>
      <p style={{ color: '#475569', marginBottom: 20, fontSize: 14, lineHeight: 1.6 }}>{message}</p>
      <div className="modal-footer">
        <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        <button className="btn btn-danger" onClick={onConfirm}>Confirm</button>
      </div>
    </Modal>
  );
}

// ─── Progress Bar ───
function ProgressBar({ spent, total, height = 7 }) {
  const p = total > 0 ? Math.min((spent / total) * 100, 100) : 0;
  return (
    <div className="progress-cell">
      <div className="progress-bar" style={{ height }}>
        <div className="progress-fill" style={{ width: `${p}%`, background: pctColor(p) }} />
      </div>
      <span className="progress-pct" style={{ color: pctColor(p) }}>{pct(spent, total)}%</span>
    </div>
  );
}

// ─── Sidebar ───
function Sidebar({ page, setPage }) {
  const items = [
    { id: 'dashboard', icon: 'fas fa-gauge-high', label: 'Dashboard' },
    { id: 'votes', icon: 'fas fa-vote-yea', label: 'Vote Monitoring' },
    { id: 'payments', icon: 'fas fa-money-bill-wave', label: 'Payments' },
    { id: 'reports', icon: 'fas fa-file-lines', label: 'Reports' },
    { id: 'activity', icon: 'fas fa-clock-rotate-left', label: 'Activity Log' },
  ];
  return (
    <div className="sidebar">
      <div className="sidebar-brand">
        <img src="assets/ura-logo.png" alt="URA" onError={e => { e.target.style.display = 'none'; }} />
        <div className="brand-text">
          <h3>VoteTrack</h3>
          <span>URA Budget Monitoring</span>
        </div>
      </div>
      <div className="sidebar-nav">
        <div className="nav-section">Main Menu</div>
        {items.map(it =>
          <a key={it.id} href="#" className={`nav-link ${page === it.id ? 'active' : ''}`} onClick={e => { e.preventDefault(); setPage(it.id); }}>
            <i className={`fas ${it.icon}`} />{it.label}
          </a>
        )}
        <div className="nav-section">Configuration</div>
        <a href="#" className={`nav-link ${page === 'settings' ? 'active' : ''}`} onClick={e => { e.preventDefault(); setPage('settings'); }}>
          <i className="fas fa-database" />Firebase Sync
        </a>
      </div>
      <div className="sidebar-footer">
        <div>URA VoteTrack v1.1</div>
        <div className="version">Fiscal Year {APP_CONFIG.fiscalYear}</div>
      </div>
    </div>
  );
}

// ─── TopBar ───
function TopBar({ title, subtitle }) {
  return (
    <div className="topbar">
      <div>
        <h2>{title}</h2>
        {subtitle && <div className="topbar-sub">{subtitle}</div>}
      </div>
      <div className="topbar-actions">
        <div className="user-chip">
          <div className="user-avatar">U</div>
          <div>
            <div className="user-name">URA Finance</div>
            <div className="user-role">System User</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// DASHBOARD PAGE
// ═══════════════════════════════════════════
function DashboardPage() {
  const { votes, payments, categories, spentMap, mainVotes } = useApp();
  const chartRef1 = useRef(null);
  const chartRef2 = useRef(null);
  const chartRef3 = useRef(null);
  const chart1 = useRef(null);
  const chart2 = useRef(null);
  const chart3 = useRef(null);

  const stats = useMemo(() => {
    const totalBudget = mainVotes.reduce((s, v) => s + v.initial_budget, 0);
    const totalSpent = mainVotes.reduce((s, v) => s + (spentMap[String(v.vote_code)] || 0), 0);
    const totalBalance = totalBudget - totalSpent;
    const activeVotes = votes.length;
    const overspent = mainVotes.filter(v => (spentMap[String(v.vote_code)] || 0) > v.initial_budget).length;
    const exhausted = mainVotes.filter(v => {
      const spent = spentMap[String(v.vote_code)] || 0;
      return v.initial_budget > 0 && (spent / v.initial_budget) >= 0.8 && spent <= v.initial_budget;
    }).length;
    return { totalBudget, totalSpent, totalBalance, activeVotes, overspent, exhausted };
  }, [votes, payments, spentMap, mainVotes]);

  const catData = useMemo(() => {
    const map = {};
    mainVotes.forEach(v => {
      const key = v.category_letter + ' - ' + v.category_name;
      if (!map[key]) map[key] = { budget: 0, spent: 0, count: 0 };
      map[key].budget += v.initial_budget;
      map[key].spent += spentMap[String(v.vote_code)] || 0;
      map[key].count++;
    });
    return Object.entries(map).map(([k, v]) => ({ name: k, ...v }));
  }, [votes, payments, spentMap, mainVotes]);

  const topVotes = useMemo(() => {
    return [...mainVotes]
      .map(v => ({ ...v, spent: spentMap[String(v.vote_code)] || 0 }))
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 10);
  }, [votes, payments, spentMap, mainVotes]);

  const shortCat = d => d.name.split(' - ')[1].replace(/\b(COSTS|COST|CHARGES|EXPENSES|EXPENDITURE)\b/gi, '').trim() || d.name.split(' - ')[1];

  useEffect(() => {
    if (!chartRef1.current || !catData.length) return;
    if (chart1.current) chart1.current.destroy();
    chart1.current = new Chart(chartRef1.current, {
      type: 'bar',
      data: {
        labels: catData.map(shortCat),
        datasets: [
          { label: 'Budget', data: catData.map(d => d.budget), backgroundColor: 'rgba(60, 80, 224, 0.9)', hoverBackgroundColor: '#3C50E0', borderRadius: 7, borderSkipped: false, maxBarThickness: 34 },
          { label: 'Spent', data: catData.map(d => d.spent), backgroundColor: 'rgba(240, 149, 12, 0.9)', hoverBackgroundColor: '#F0950C', borderRadius: 7, borderSkipped: false, maxBarThickness: 34 }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { padding: 18, font: { size: 11, weight: '600' } } },
          tooltip: { callbacks: { title: items => catData[items[0].dataIndex]?.name || '' } }
        },
        scales: {
          y: { beginAtZero: true, grid: { color: '#EEF2F7', drawBorder: false }, border: { display: false }, ticks: { callback: chartYFmt, font: { size: 10 }, maxTicksLimit: 6 } },
          x: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 11, weight: '600' }, color: '#64748B' } }
        }
      }
    });
  }, [catData]);

  useEffect(() => {
    if (!chartRef2.current || !catData.length) return;
    if (chart2.current) chart2.current.destroy();
    chart2.current = new Chart(chartRef2.current, {
      type: 'doughnut',
      data: {
        labels: catData.map(d => d.name.split(' - ')[1] || d.name),
        datasets: [{ data: catData.map(d => d.budget), backgroundColor: CHART_PALETTE.slice(0, catData.length), borderColor: '#fff', borderWidth: 3, hoverOffset: 10 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: { position: 'bottom', labels: { padding: 14, font: { size: 11 } } },
          tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${chartYFmt(ctx.raw)} (${pct(ctx.raw, catData.reduce((s, d) => s + d.budget, 0))}%)` } }
        }
      }
    });
  }, [catData]);

  useEffect(() => {
    if (!chartRef3.current || !topVotes.length) return;
    if (chart3.current) chart3.current.destroy();
    chart3.current = new Chart(chartRef3.current, {
      type: 'bar',
      data: {
        labels: topVotes.map(v => v.vote_name.substring(0, 22) + (v.vote_name.length > 22 ? '...' : '')),
        datasets: [
          { label: 'Budget', data: topVotes.map(v => v.initial_budget), backgroundColor: 'rgba(60, 80, 224, 0.22)', borderRadius: 5, borderSkipped: false, maxBarThickness: 13 },
          { label: 'Spent', data: topVotes.map(v => v.spent), backgroundColor: 'rgba(60, 80, 224, 0.95)', hoverBackgroundColor: '#3C50E0', borderRadius: 5, borderSkipped: false, maxBarThickness: 13 }
        ]
      },
      options: {
        indexAxis: 'y', responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { padding: 18, font: { size: 11, weight: '600' } } } },
        scales: {
          x: { beginAtZero: true, grid: { color: '#EEF2F7' }, border: { display: false }, ticks: { callback: chartYFmt, font: { size: 10 } } },
          y: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 10, weight: '500' }, color: '#64748B' } }
        }
      }
    });
  }, [topVotes]);

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon icon-blue"><i className="fas fa-vote-yea" /></div>
          <div className="stat-label">Total Votes</div>
          <div className="stat-value" style={{ color: 'var(--primary)' }}>{stats.activeVotes}</div>
          <div className="stat-sub">{mainVotes.length} votes · {votes.length - mainVotes.length} sub-votes</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-purple"><i className="fas fa-coins" /></div>
          <div className="stat-label">Total Budget</div>
          <div className="stat-value">UGX {fmt(stats.totalBudget)}</div>
          <div className="stat-sub">FY {APP_CONFIG.fiscalYear} allocation</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-gold"><i className="fas fa-chart-pie" /></div>
          <div className="stat-label">Total Spent</div>
          <div className="stat-value" style={{ color: 'var(--ura-gold)' }}>UGX {fmt(stats.totalSpent)}</div>
          <div className="stat-sub">
            <span className={parseFloat(pct(stats.totalSpent, stats.totalBudget)) < 50 ? 'trend-up' : 'trend-down'}>
              {pct(stats.totalSpent, stats.totalBudget)}% utilized
            </span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: stats.totalBalance < 0 ? '#fdecef' : '#e7f6ee', color: stats.totalBalance < 0 ? 'var(--danger)' : 'var(--success)' }}>
            <i className="fas fa-wallet" />
          </div>
          <div className="stat-label">Remaining Balance</div>
          <div className="stat-value" style={{ color: stats.totalBalance < 0 ? 'var(--danger)' : 'var(--success)' }}>UGX {fmt(stats.totalBalance)}</div>
          <div className="stat-sub">
            {stats.overspent > 0
              ? <span className="trend-down">{stats.overspent} vote(s) overspent</span>
              : <span className="trend-up">All within budget</span>}
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="card">
          <div className="card-header">
            <div>
              <h3><i className="fas fa-chart-column" style={{ color: 'var(--primary)', marginRight: 8 }} />Budget vs Spent by Category</h3>
              <span className="card-sub">Allocation against actual utilization</span>
            </div>
          </div>
          <div className="chart-container"><canvas ref={chartRef1} /></div>
        </div>
        <div className="card">
          <div className="card-header">
            <div>
              <h3><i className="fas fa-chart-pie" style={{ color: 'var(--primary)', marginRight: 8 }} />Budget Distribution</h3>
              <span className="card-sub">Share of total allocation by category</span>
            </div>
          </div>
          <div className="chart-container"><canvas ref={chartRef2} /></div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="card">
          <div className="card-header">
            <div>
              <h3><i className="fas fa-ranking-star" style={{ color: 'var(--primary)', marginRight: 8 }} />Top 10 Votes by Spending</h3>
              <span className="card-sub">Highest spending votes this fiscal year</span>
            </div>
          </div>
          <div className="chart-container" style={{ height: 320 }}><canvas ref={chartRef3} /></div>
        </div>
        <div className="card">
          <div className="card-header"><h3>Category Summary</h3><span className="card-sub">Budget allocation vs utilization</span></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Category</th><th>Votes</th><th className="num">Budget (UGX)</th><th className="num">Spent (UGX)</th><th className="num">Balance</th><th>Utilization</th></tr></thead>
              <tbody>
                {catData.map(c => (
                  <tr key={c.name}>
                    <td>
                      <span className="badge badge-purple">{c.name.split(' - ')[0]}</span>
                      <span style={{ marginLeft: 8, fontWeight: 600 }}>{c.name.split(' - ')[1]}</span>
                    </td>
                    <td>{c.count}</td>
                    <td className="num">{fmt(c.budget)}</td>
                    <td className="num" style={{ fontWeight: 600 }}>{fmt(c.spent)}</td>
                    <td className="num" style={{ fontWeight: 700, color: c.budget - c.spent < 0 ? 'var(--danger)' : 'var(--success)' }}>{fmt(c.budget - c.spent)}</td>
                    <td><ProgressBar spent={c.spent} total={c.budget} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// VOTES PAGE
// ═══════════════════════════════════════════
function VotesPage() {
  const { votes, payments, categories, spentMap } = useApp();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [detailVote, setDetailVote] = useState(null);

  const enriched = useMemo(() => {
    return votes.map(v => {
      const spent = spentMap[String(v.vote_code)] || 0;
      const balance = v.initial_budget - spent;
      const pctSpent = v.initial_budget > 0 ? (spent / v.initial_budget * 100) : 0;
      let status = 'Active';
      if (balance < 0) status = 'Overspent';
      else if (pctSpent >= 80) status = 'Warning';
      return { ...v, spent, balance, pctSpent, status };
    });
  }, [votes, payments, spentMap]);

  const filtered = useMemo(() => {
    return enriched.filter(v => {
      if (search && !String(v.vote_code).includes(search) && !v.vote_name.toLowerCase().includes(search.toLowerCase()) && !(v.gou_vote && String(v.gou_vote).includes(search))) return false;
      if (catFilter && v.category_letter !== catFilter) return false;
      if (statusFilter && v.status !== statusFilter) return false;
      return true;
    });
  }, [enriched, search, catFilter, statusFilter]);

  return (
    <div>
      <div className="filters-bar">
        <div className="filter-group search-input">
          <label>Search</label>
          <i className="fas fa-magnifying-glass" />
          <input type="text" placeholder="Vote code or name..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 220 }} />
        </div>
        <div className="filter-group">
          <label>Category</label>
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.letter} value={c.letter}>{c.letter} - {c.name}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>Status</label>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Warning">Warning (80%+)</option>
            <option value="Overspent">Overspent</option>
          </select>
        </div>
        <div style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--body)', paddingBottom: 8 }}>
          Showing <strong style={{ color: 'var(--text)' }}>{filtered.length}</strong> of {votes.length} votes
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>GOU-Vote</th>
                <th>Vote Code</th>
                <th>Vote Name</th>
                <th>Category</th>
                <th className="num">Budget (UGX)</th>
                <th className="num">Spent (UGX)</th>
                <th className="num">Balance (UGX)</th>
                <th>Utilization</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={10}>
                  <div className="empty-state">
                    <i className="fas fa-folder-open" />
                    <p>No votes match your filters. Try adjusting your search criteria.</p>
                  </div>
                </td></tr>
              )}
              {filtered.map(v => (
                <tr key={v.vote_code}>
                  <td><span className="badge badge-gray">{v.gou_vote || '-'}</span></td>
                  <td>
                    <span className="badge badge-blue">{v.vote_code}</span>
                    {v.parent_vote != null && <span className="badge badge-purple" style={{ marginLeft: 6 }}>sub</span>}
                  </td>
                  <td style={{ fontWeight: 500, maxWidth: 260 }}>
                    {v.parent_vote != null && <span style={{ color: 'var(--body)', marginRight: 6 }}>└</span>}
                    {v.vote_name}
                  </td>
                  <td><span className="badge badge-purple">{v.category_letter}</span> <span style={{ fontSize: 12, color: 'var(--body)' }}>{v.category_name.substring(0, 15)}</span></td>
                  <td className="num">{fmt(v.initial_budget)}</td>
                  <td className="num" style={{ fontWeight: 600 }}>{fmt(v.spent)}</td>
                  <td className="num" style={{ fontWeight: 700, color: v.balance < 0 ? 'var(--danger)' : 'var(--success)' }}>{fmt(v.balance)}</td>
                  <td><ProgressBar spent={v.spent} total={v.initial_budget} /></td>
                  <td><span className={`badge ${v.status === 'Overspent' ? 'badge-red' : v.status === 'Warning' ? 'badge-amber' : 'badge-green'}`}>{v.status}</span></td>
                  <td><button className="btn btn-secondary btn-sm" onClick={() => setDetailVote(v)} title="View details"><i className="fas fa-eye" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {detailVote && (
        <Modal title={`${detailVote.vote_name}`} onClose={() => setDetailVote(null)} wide>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>GOU-Vote</p>
              <p style={{ fontWeight: 600 }}>{detailVote.gou_vote || 'N/A'} - {detailVote.gou_description || ''}</p>
            </div>
            <div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Internal Vote</p>
              <p style={{ fontWeight: 600 }}>{detailVote.vote_code} - {detailVote.vote_name}</p>
            </div>
            <div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Category</p>
              <p style={{ fontWeight: 600 }}>{detailVote.category_letter} - {detailVote.category_name}</p>
            </div>
            <div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Type</p>
              <p style={{ fontWeight: 600 }}>{detailVote.is_capital ? 'Capital Expenditure' : 'Recurrent Expenditure'}</p>
            </div>
            {detailVote.parent_vote != null && (
              <div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Parent Vote</p>
                <p style={{ fontWeight: 600 }}>{detailVote.parent_vote} - {(votes.find(x => String(x.vote_code) === String(detailVote.parent_vote)) || {}).vote_name || ''}</p>
              </div>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginTop: 20, padding: 16, background: '#f8fafc', borderRadius: 8 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Initial Budget</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary)' }}>UGX {fmt(detailVote.initial_budget)}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Spent</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--ura-gold)' }}>UGX {fmt(detailVote.spent)}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Balance</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: detailVote.balance < 0 ? 'var(--danger)' : 'var(--success)' }}>UGX {fmt(detailVote.balance)}</div>
            </div>
          </div>
          <div style={{ marginTop: 16 }}><ProgressBar spent={detailVote.spent} total={detailVote.initial_budget} height={12} /></div>
        </Modal>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// PAYMENTS PAGE
// ═══════════════════════════════════════════
function PaymentsPage() {
  const { votes, payments, setPayments, spentMap } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [form, setForm] = useState({ vote_code: '', payment_date: '', payment_reference: '', payee: '', description: '', amount: '', entered_by: 'URA Finance' });
  const [search, setSearch] = useState('');
  const [warnOverspend, setWarnOverspend] = useState(null);

  const filtered = useMemo(() => {
    return payments.filter(p => {
      if (search && !p.vote_code.includes(search) && !p.payee.toLowerCase().includes(search.toLowerCase()) && !p.payment_reference.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    }).sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date));
  }, [payments, search]);

  const selectedVote = votes.find(v => String(v.vote_code) === form.vote_code);
  const selectedVoteSpent = spentMap[form.vote_code] || 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.vote_code || !form.payment_date || !form.payment_reference || !form.payee || !form.amount) {
      setToast({ message: 'Please fill all required fields', type: 'error' });
      return;
    }
    const amount = parseFloat(form.amount);
    if (amount <= 0) { setToast({ message: 'Amount must be greater than 0', type: 'error' }); return; }

    const vote = votes.find(v => String(v.vote_code) === form.vote_code);
    if (!vote) { setToast({ message: 'Invalid vote selected', type: 'error' }); return; }

    const currentSpent = spentMap[form.vote_code] || 0;
    const newBalance = vote.initial_budget - currentSpent - amount;

    if (newBalance < 0) {
      setWarnOverspend({ ...form, amount, overspendAmount: Math.abs(newBalance) });
      return;
    }

    savePayment({ ...form, amount });
  };

  const savePayment = (data) => {
    const payment = {
      id: uid(),
      vote_code: data.vote_code,
      vote_name: (votes.find(v => String(v.vote_code) === data.vote_code) || {}).vote_name || '',
      payment_date: data.payment_date,
      payment_reference: data.payment_reference,
      payee: data.payee,
      description: data.description || '',
      amount: parseFloat(data.amount),
      entered_by: data.entered_by || 'URA Finance',
      created_at: new Date().toISOString()
    };

    // Update local cache immediately, then broadcast to Firebase (live for all users)
    const updated = DataStore.addPayment(payment);
    setPayments(updated);
    if (FirebaseAPI.isConfigured()) {
      FirebaseAPI.addPayment(payment);
    }
    setShowForm(false);
    setWarnOverspend(null);
    setForm({ vote_code: '', payment_date: '', payment_reference: '', payee: '', description: '', amount: '', entered_by: 'URA Finance' });
    setToast({ message: `Payment of UGX ${fmt(payment.amount)} recorded for ${payment.vote_code}`, type: 'success' });
  };

  const handleDelete = (id) => {
    const updated = DataStore.deletePayment(id);
    setPayments(updated);
    if (FirebaseAPI.isConfigured()) FirebaseAPI.deletePayment(id);
    setConfirmDel(null);
    setToast({ message: 'Payment deleted', type: 'success' });
  };

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      {confirmDel && <Confirm message="Are you sure you want to delete this payment? This cannot be undone." onConfirm={() => handleDelete(confirmDel)} onCancel={() => setConfirmDel(null)} />}

      <div className="filters-bar">
        <div className="filter-group search-input">
          <label>Search</label>
          <i className="fas fa-magnifying-glass" />
          <input type="text" placeholder="Search payments..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 240 }} />
        </div>
        <div style={{ marginLeft: 'auto', paddingBottom: 4 }}>
          <button className="btn btn-primary" onClick={() => { setShowForm(true); setWarnOverspend(null); }}>
            <i className="fas fa-plus" /> Record Payment
          </button>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Reference</th>
                <th>Vote Code</th>
                <th>Payee</th>
                <th>Description</th>
                <th className="num">Amount (UGX)</th>
                <th>Entered By</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={8}>
                  <div className="empty-state">
                    <i className="fas fa-receipt" />
                    <p>No payments recorded yet. Click <strong>"Record Payment"</strong> to deduct from a vote's budget.</p>
                  </div>
                </td></tr>
              )}
              {filtered.map(p => (
                <tr key={p.id}>
                  <td>{fmtDate(p.payment_date)}</td>
                  <td><span className="badge badge-gray">{p.payment_reference}</span></td>
                  <td><span className="badge badge-blue">{p.vote_code}</span></td>
                  <td style={{ fontWeight: 500 }}>{p.payee}</td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.description}</td>
                  <td className="num" style={{ fontWeight: 700, color: 'var(--danger)' }}>{fmt(p.amount)}</td>
                  <td style={{ fontSize: 12, color: 'var(--body)' }}>{p.entered_by}</td>
                  <td><button className="btn btn-danger btn-sm" onClick={() => setConfirmDel(p.id)} title="Delete payment"><i className="fas fa-trash" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <Modal title="Record Payment" onClose={() => { setShowForm(false); setWarnOverspend(null); }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Vote Code *</label>
              <select value={form.vote_code} onChange={e => setForm({ ...form, vote_code: e.target.value })} required>
                <option value="">Select vote...</option>
                {votes.map(v => <option key={v.vote_code} value={String(v.vote_code)}>{v.vote_code} - {v.vote_name}</option>)}
              </select>
            </div>
            {selectedVote && (
              <div style={{ background: '#f8fafc', padding: 10, borderRadius: 8, marginBottom: 14, fontSize: 12 }}>
                <span style={{ color: 'var(--text-muted)' }}>Budget: </span>
                <strong>UGX {fmt(selectedVote.initial_budget)}</strong>
                <span style={{ margin: '0 8px', color: 'var(--text-muted)' }}>|</span>
                <span style={{ color: 'var(--text-muted)' }}>Spent: </span>
                <strong style={{ color: 'var(--ura-gold)' }}>UGX {fmt(selectedVoteSpent)}</strong>
                <span style={{ margin: '0 8px', color: 'var(--text-muted)' }}>|</span>
                <span style={{ color: 'var(--text-muted)' }}>Balance: </span>
                <strong style={{ color: selectedVote.initial_budget - selectedVoteSpent < 0 ? 'var(--danger)' : 'var(--success)' }}>
                  UGX {fmt(selectedVote.initial_budget - selectedVoteSpent)}
                </strong>
                {selectedVote.parent_vote != null && (
                  <span style={{ marginLeft: 8 }}><span className="badge badge-purple">sub of {selectedVote.parent_vote}</span></span>
                )}
              </div>
            )}
            <div className="form-row">
              <div className="form-group">
                <label>Payment Date *</label>
                <input type="date" value={form.payment_date} onChange={e => setForm({ ...form, payment_date: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Amount (UGX) *</label>
                <input type="number" min="1" step="1" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required placeholder="Enter amount" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Payment Reference *</label>
                <input type="text" value={form.payment_reference} onChange={e => setForm({ ...form, payment_reference: e.target.value })} required placeholder="e.g. VCH-001" />
              </div>
              <div className="form-group">
                <label>Payee / Supplier *</label>
                <input type="text" value={form.payee} onChange={e => setForm({ ...form, payee: e.target.value })} required placeholder="Supplier name" />
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Payment description" />
            </div>
            <div className="form-group">
              <label>Entered By</label>
              <input type="text" value={form.entered_by} onChange={e => setForm({ ...form, entered_by: e.target.value })} />
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setWarnOverspend(null); }}>Cancel</button>
              <button type="submit" className="btn btn-primary"><i className="fas fa-check" /> Record Payment</button>
            </div>
          </form>
        </Modal>
      )}

      {warnOverspend && (
        <Confirm
          message={`This payment of UGX ${fmt(warnOverspend.amount)} to "${warnOverspend.payee}" will OVERSPEND vote ${warnOverspend.vote_code} by UGX ${fmt(warnOverspend.overspendAmount)}. Do you want to proceed?`}
          onConfirm={() => { savePayment(warnOverspend); setWarnOverspend(null); }}
          onCancel={() => setWarnOverspend(null)}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// REPORTS PAGE
// ═══════════════════════════════════════════
function ReportsPage() {
  const { votes, payments, categories, spentMap } = useApp();
  const [reportType, setReportType] = useState('summary');
  const [catFilter, setCatFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const reportVotes = useMemo(() => {
    let list = votes;
    if (catFilter) list = list.filter(v => v.category_letter === catFilter);
    return list.map(v => ({
      ...v,
      spent: spentMap[String(v.vote_code)] || 0,
      balance: v.initial_budget - (spentMap[String(v.vote_code)] || 0)
    }));
  }, [votes, payments, catFilter, spentMap]);

  const reportPayments = useMemo(() => {
    let list = payments;
    if (dateFrom) list = list.filter(p => p.payment_date >= dateFrom);
    if (dateTo) list = list.filter(p => p.payment_date <= dateTo);
    return list.sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date));
  }, [payments, dateFrom, dateTo]);

  const totals = useMemo(() => {
    const mains = reportVotes.filter(v => v.parent_vote == null);
    return {
      budget: mains.reduce((s, v) => s + v.initial_budget, 0),
      spent: mains.reduce((s, v) => s + v.spent, 0),
      balance: mains.reduce((s, v) => s + v.balance, 0),
      paymentTotal: reportPayments.reduce((s, p) => s + p.amount, 0)
    };
  }, [reportVotes, reportPayments]);

  const exportPDF = () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('URA Vote Monitoring System', 14, 18);
    doc.setFontSize(10);
    doc.text(`Report: ${reportType === 'summary' ? 'Vote Summary' : 'Payment Transaction'}`, 14, 26);
    doc.text(`Generated: ${new Date().toLocaleString()} | FY ${APP_CONFIG.fiscalYear}`, 14, 32);

    if (reportType === 'summary') {
      const rows = reportVotes.map(v => [v.gou_vote || '-', String(v.vote_code), v.vote_name.substring(0, 30), v.category_letter, fmt(v.initial_budget), fmt(v.spent), fmt(v.balance)]);
      doc.autoTable({
        startY: 38, head: [['GOU', 'Vote', 'Name', 'Cat', 'Budget', 'Spent', 'Balance']], body: rows,
        theme: 'grid', headStyles: { fillColor: [0, 102, 51] }, fontSize: 8,
        columnStyles: { 4: { halign: 'right' }, 5: { halign: 'right' }, 6: { halign: 'right' } }
      });
      doc.setFontSize(9);
      doc.text(`Total Budget: UGX ${fmt(totals.budget)} | Total Spent: UGX ${fmt(totals.spent)} | Balance: UGX ${fmt(totals.balance)}`, 14, doc.internal.pageSize.height - 15);
    } else {
      const rows = reportPayments.map(p => [fmtDate(p.payment_date), p.payment_reference, p.vote_code, p.payee, fmt(p.amount)]);
      doc.autoTable({
        startY: 38, head: [['Date', 'Ref', 'Vote', 'Payee', 'Amount']], body: rows,
        theme: 'grid', headStyles: { fillColor: [0, 102, 51] }, fontSize: 8,
        columnStyles: { 4: { halign: 'right' } }
      });
    }
    doc.text(`Prepared by: URA VoteTrack`, 14, doc.internal.pageSize.height - 10);
    doc.save(`URA-Report-${reportType}-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const exportCSV = () => {
    let csv = '';
    if (reportType === 'summary') {
      csv = 'GOU-Vote,Vote Code,Vote Name,Category,Initial Budget,Spent,Balance\n';
      reportVotes.forEach(v => { csv += `"${v.gou_vote || ''}",${v.vote_code},"${v.vote_name}","${v.category_letter} - ${v.category_name}",${v.initial_budget},${v.spent},${v.balance}\n`; });
    } else {
      csv = 'Date,Reference,Vote Code,Payee,Description,Amount,Entered By\n';
      reportPayments.forEach(p => { csv += `"${p.payment_date}","${p.payment_reference}","${p.vote_code}","${p.payee}","${p.description}",${p.amount},"${p.entered_by}"\n`; });
    }
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `URA-${reportType}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div>
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="filters-bar">
          <div className="filter-group">
            <label>Report Type</label>
            <select value={reportType} onChange={e => setReportType(e.target.value)}>
              <option value="summary">Vote Summary</option>
              <option value="payments">Payment Transactions</option>
            </select>
          </div>
          {reportType === 'summary' && (
            <div className="filter-group">
              <label>Category</label>
              <select value={catFilter} onChange={e => setCatFilter(e.target.value)}>
                <option value="">All</option>
                {categories.map(c => <option key={c.letter} value={c.letter}>{c.letter} - {c.name}</option>)}
              </select>
            </div>
          )}
          {reportType === 'payments' && (
            <>
              <div className="filter-group">
                <label>From</label>
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
              </div>
              <div className="filter-group">
                <label>To</label>
                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
              </div>
            </>
          )}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <button className="btn btn-danger btn-sm" onClick={exportPDF}><i className="fas fa-file-pdf" /> PDF</button>
            <button className="btn btn-primary btn-sm" onClick={exportCSV}><i className="fas fa-file-csv" /> CSV</button>
            <button className="btn btn-secondary btn-sm" onClick={() => window.print()}><i className="fas fa-print" /> Print</button>
          </div>
        </div>
      </div>

      <div className="card no-print">
        <div style={{ textAlign: 'center', marginBottom: 16, paddingBottom: 12, borderBottom: '2px solid var(--stroke)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 6 }}>
            <img src="assets/ura-logo.png" alt="URA" style={{ width: 32, height: 32 }} onError={e => e.target.style.display = 'none'} />
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Uganda Revenue Authority</h3>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{reportType === 'summary' ? 'Vote Summary Report' : 'Payment Transaction Report'} — FY {APP_CONFIG.fiscalYear}</p>
          <p style={{ fontSize: 11, color: '#94a3b8' }}>Generated: {new Date().toLocaleString()}</p>
        </div>

        {reportType === 'summary' ? (
          <div className="table-wrap">
            <table>
              <thead><tr><th>GOU-Vote</th><th>Vote Code</th><th>Vote Name</th><th>Cat</th><th className="num">Budget</th><th className="num">Spent</th><th className="num">Balance</th><th>Util.</th></tr></thead>
              <tbody>
                {reportVotes.map(v => (
                  <tr key={v.vote_code}>
                    <td><span className="badge badge-gray">{v.gou_vote || '-'}</span></td>
                    <td><span className="badge badge-blue">{v.vote_code}</span></td>
                    <td>{v.vote_name}</td>
                    <td>{v.category_letter}</td>
                    <td className="num">{fmt(v.initial_budget)}</td>
                    <td className="num" style={{ fontWeight: 600 }}>{fmt(v.spent)}</td>
                    <td className="num" style={{ color: v.balance < 0 ? 'var(--danger)' : 'var(--success)', fontWeight: 700 }}>{fmt(v.balance)}</td>
                    <td><ProgressBar spent={v.spent} total={v.initial_budget} /></td>
                  </tr>
                ))}
                <tr style={{ fontWeight: 700, background: '#f0fdf4' }}>
                  <td colSpan={4}>TOTAL</td>
                  <td className="num">{fmt(totals.budget)}</td>
                  <td className="num">{fmt(totals.spent)}</td>
                  <td className="num">{fmt(totals.balance)}</td>
                  <td><ProgressBar spent={totals.spent} total={totals.budget} /></td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Date</th><th>Ref</th><th>Vote</th><th>Payee</th><th>Description</th><th className="num">Amount</th></tr></thead>
              <tbody>
                {reportPayments.length === 0 && (
                  <tr><td colSpan={6}>
                    <div className="empty-state">
                      <i className="fas fa-receipt" />
                      <p>No payments match the selected filters.</p>
                    </div>
                  </td></tr>
                )}
                {reportPayments.map(p => (
                  <tr key={p.id}>
                    <td>{fmtDate(p.payment_date)}</td>
                    <td>{p.payment_reference}</td>
                    <td><span className="badge badge-blue">{p.vote_code}</span></td>
                    <td>{p.payee}</td>
                    <td>{p.description}</td>
                    <td className="num" style={{ fontWeight: 700 }}>{fmt(p.amount)}</td>
                  </tr>
                ))}
                <tr style={{ fontWeight: 700, background: '#f0fdf4' }}>
                  <td colSpan={5}>TOTAL ({reportPayments.length} transactions)</td>
                  <td className="num">UGX {fmt(totals.paymentTotal)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// ACTIVITY LOG PAGE
// ═══════════════════════════════════════════
function ActivityPage() {
  const { payments } = useApp();
  return (
    <div className="card">
      <div className="card-header"><h3>Recent Activity</h3></div>
      {payments.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-clock-rotate-left" />
          <p>No activity recorded yet. Payments will appear here.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Date</th><th>Action</th><th>Details</th><th>User</th></tr></thead>
            <tbody>
              {[...payments].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map(p => (
                <tr key={p.id}>
                  <td style={{ fontSize: 12 }}>{fmtDate(p.created_at)}</td>
                  <td><span className="badge badge-green">Payment Recorded</span></td>
                  <td>UGX {fmt(p.amount)} paid to <strong>{p.payee}</strong> for vote <span className="badge badge-blue">{p.vote_code}</span></td>
                  <td style={{ fontSize: 12 }}>{p.entered_by}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// SETTINGS / CONFIG PAGE
// ═══════════════════════════════════════════
function SettingsPage() {
  const [projectId, setProjectId] = useState(APP_CONFIG.firebase.projectId);
  const [apiKey, setApiKey] = useState(APP_CONFIG.firebase.apiKey);
  const [databaseURL, setDatabaseURL] = useState(APP_CONFIG.firebase.databaseURL);
  const [toast, setToast] = useState(null);
  const [testing, setTesting] = useState(false);

  const save = () => {
    APP_CONFIG.firebase = { projectId, apiKey, databaseURL };
    FirebaseAPI.init(APP_CONFIG.firebase);
    localStorage.setItem('uravotes_config', JSON.stringify({ firebase: APP_CONFIG.firebase }));
    setToast({ message: 'Configuration saved. Live sync will start automatically.', type: 'success' });
  };

  const testConnection = async () => {
    APP_CONFIG.firebase = { projectId, apiKey, databaseURL };
    FirebaseAPI.init(APP_CONFIG.firebase);
    setTesting(true);
    const res = await FirebaseAPI.testConnection();
    setTesting(false);
    if (res.ok) setToast({ message: res.message, type: 'success' });
    else setToast({ message: `Error: ${res.message}`, type: 'error' });
  };

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="config-banner">
        <i className="fas fa-cloud-arrow-up" />
        <div className="config-text">
          <h4>Firebase Realtime Sync</h4>
          <p>Connect your Firebase project so all 3 users see payments instantly, on every device. Until connected, payments stay in this browser only (localStorage).</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Firebase Configuration</h3>
        <div className="form-group">
          <label>Project ID</label>
          <input type="text" value={projectId} onChange={e => setProjectId(e.target.value)} placeholder="e.g. ura-votetrack" />
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Find in Firebase Console → Project Settings → General</p>
        </div>
        <div className="form-group">
          <label>API Key</label>
          <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="AIzaSy..." />
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Project Settings → General → Your apps → Web app → apiKey</p>
        </div>
        <div className="form-group">
          <label>Database URL</label>
          <input type="text" value={databaseURL} onChange={e => setDatabaseURL(e.target.value)} placeholder="https://<project-id>-default-rtdb.firebaseio.com" />
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Realtime Database → Data tab → shown at the top of the page</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-primary" onClick={save}><i className="fas fa-save" /> Save Config</button>
          <button className="btn btn-secondary" onClick={testConnection} disabled={testing}><i className="fas fa-plug" /> {testing ? 'Testing...' : 'Test Connection'}</button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Firebase Setup Guide (one-time)</h3>
        <div style={{ fontSize: 13, lineHeight: 1.9, color: 'var(--text-muted)' }}>
          <p><strong>Step 1:</strong> Go to <a href="https://console.firebase.google.com" target="_blank" rel="noopener" style={{ color: 'var(--primary)' }}>console.firebase.google.com</a> and click <strong>Add project</strong></p>
          <p><strong>Step 2:</strong> Add a <strong>Web App</strong> (Project Settings → General → Add app → Web) and copy its config</p>
          <p><strong>Step 3:</strong> Build → <strong>Realtime Database</strong> → Create Database → choose a location → Start</p>
          <p><strong>Step 4:</strong> Authentication → Sign-in method → enable <strong>Anonymous</strong></p>
          <p><strong>Step 5:</strong> Realtime Database → Rules → paste:</p>
          <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, fontFamily: 'monospace', fontSize: 12, margin: '8px 0' }}>
            {"{ \"rules\": { \"payments\": { \".read\": \"auth != null\", \".write\": \"auth != null\" } } }"}
          </div>
          <p><strong>Step 6:</strong> Paste the Project ID, API Key and Database URL above, then click <strong>Test Connection</strong></p>
          <p><strong>Step 7:</strong> Open the app on all 3 devices — payments now sync live between them</p>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>System Info</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
          <div style={{ padding: 14, background: '#f8fafc', borderRadius: 8 }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Version</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>1.1.0</div>
          </div>
          <div style={{ padding: 14, background: '#f8fafc', borderRadius: 8 }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Hosting</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>GitHub Pages</div>
          </div>
          <div style={{ padding: 14, background: '#f8fafc', borderRadius: 8 }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Storage</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Firebase + Local</div>
          </div>
          <div style={{ padding: 14, background: '#f8fafc', borderRadius: 8 }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Cost</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--success)' }}>UGX 0</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// APP ROOT
// ═══════════════════════════════════════════
function App() {
  const [page, setPage] = useState('dashboard');
  const [votes] = useState(BUDGET_DATA);
  const [payments, setPayments] = useState(DataStore.getPayments());
  const [showBanner, setShowBanner] = useState(true);

  const categories = useMemo(() => {
    const map = {};
    votes.forEach(v => {
      if (!map[v.category_letter]) map[v.category_letter] = { letter: v.category_letter, name: v.category_name };
    });
    return Object.values(map);
  }, [votes]);

  const mainVotes = useMemo(() => votes.filter(v => v.parent_vote == null), [votes]);

  // Spent per vote including sub-vote rollups (payments to a sub-vote also count on its parent)
  const spentMap = useMemo(() => {
    const map = {};
    votes.forEach(v => { map[String(v.vote_code)] = 0; });
    payments.forEach(p => {
      const k = String(p.vote_code);
      if (k in map) map[k] += p.amount || 0;
    });
    votes.forEach(v => {
      if (v.parent_vote != null) {
        const parentKey = String(v.parent_vote);
        if (parentKey in map) map[parentKey] += map[String(v.vote_code)] || 0;
      }
    });
    return map;
  }, [votes, payments]);

  // Init Firebase and subscribe to live payment updates
  useEffect(() => {
    const saved = localStorage.getItem('uravotes_config');
    if (saved) {
      try {
        const c = JSON.parse(saved);
        if (c.firebase) APP_CONFIG.firebase = { ...APP_CONFIG.firebase, ...c.firebase };
      } catch {}
    }
    FirebaseAPI.init(APP_CONFIG.firebase);

    // Live sync: all users see new payments instantly
    let unsub = () => {};
    if (FirebaseAPI.isConfigured()) {
      unsub = FirebaseAPI.subscribe(list => {
        if (!list) return;
        const local = DataStore.getPayments();
        // First-time setup: seed an empty remote database with local payments
        if (list.length === 0 && local.length > 0) {
          local.forEach(p => FirebaseAPI.addPayment(p));
          return;
        }
        DataStore.savePayments(list);
        setPayments(list);
      });
    }
    return () => unsub();
  }, []);

  const titles = {
    dashboard: 'Dashboard',
    votes: 'Vote Monitoring',
    payments: 'Payment Management',
    reports: 'Reports & Analytics',
    activity: 'Activity Log',
    settings: 'Firebase Configuration'
  };

  const pages = { dashboard: DashboardPage, votes: VotesPage, payments: PaymentsPage, reports: ReportsPage, activity: ActivityPage, settings: SettingsPage };
  const PageComponent = pages[page] || DashboardPage;

  return (
    <AppCtx.Provider value={{ votes, payments, setPayments, categories, mainVotes, spentMap }}>
      <div className="app-layout">
        <Sidebar page={page} setPage={setPage} />
        <div className="main-content">
          <TopBar title={titles[page] || 'Dashboard'} page={page} setPage={setPage} />
          <div className="page-content">
            {page !== 'settings' && showBanner && !FirebaseAPI.isConfigured() && (
              <div className="config-banner" style={{ marginBottom: 16 }}>
                <i className="fas fa-cloud" />
                <div className="config-text">
                  <h4>Firebase Not Connected</h4>
                  <p>Payments are currently stored in this browser only. <a href="#" onClick={e => { e.preventDefault(); setPage('settings'); }} style={{ color: '#92400e', fontWeight: 600 }}>Connect Firebase</a> to sync live across all users.</p>
                </div>
                <button className="btn-dismiss" onClick={() => setShowBanner(false)}>&times;</button>
              </div>
            )}
            <PageComponent />
          </div>
        </div>
      </div>
    </AppCtx.Provider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
