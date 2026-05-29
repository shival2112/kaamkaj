// StatCard.jsx — one of the 4 KPI tiles at the top of the dashboard.
function StatCard({ stat }) {
  const IconC = Icon[stat.icon] || Icon.FileText;
  return (
    <div className="d-stat-card">
      <div className="d-stat-top">
        <div className="d-stat-label">{stat.label}</div>
        <div className="d-stat-icon" style={{ background: stat.tint }}>
          <IconC size={22} stroke={2} style={{ color: stat.stroke }}/>
        </div>
      </div>
      <div className="d-stat-value">{stat.value}</div>
      <div className="d-stat-delta">
        <Icon.TrendingUp size={12} stroke={2.4}/> {stat.delta}
      </div>
    </div>
  );
}
Object.assign(window, { StatCard });
