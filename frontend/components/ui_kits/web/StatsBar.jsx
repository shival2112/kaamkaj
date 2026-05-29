// StatsBar.jsx — Indian-number style stats strip.
function StatsBar() {
  return (
    <section className="k-stats">
      <div className="k-container k-stats-grid">
        {kData.stats.map(s => (
          <div key={s.label}>
            <div className="num">{s.value}</div>
            <div className="lbl">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
Object.assign(window, { StatsBar });
