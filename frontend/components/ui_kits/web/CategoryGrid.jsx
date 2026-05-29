// CategoryGrid.jsx — 8 category tiles in a 4-col grid.
function CategoryGrid({ onPick }) {
  const iconFor = (key) => ({
    sales: Icon.TrendingUp, tech: Icon.Code, delivery: Icon.Truck, bpo: Icon.Headphones,
    finance: Icon.Rupee, teaching: Icon.BookOpen, health: Icon.Heart, marketing: Icon.Megaphone,
  })[key];

  return (
    <section className="k-section">
      <div className="k-container">
        <div className="k-section-header">
          <div>
            <h2 className="k-section-title">Browse jobs by category</h2>
            <p className="k-section-sub">Pick a field that fits you — we'll show jobs near you in that category.</p>
          </div>
          <a href="#" className="k-section-link">See all categories <Icon.ChevronRight size={16}/></a>
        </div>
        <div className="k-cat-grid">
          {kData.categories.map(c => {
            const IconC = iconFor(c.key);
            return (
              <button key={c.key} className="k-cat-card" onClick={()=>onPick && onPick(c)}>
                <div className="k-cat-icon" style={{ background: c.color + '26' /* ~15% */ }}>
                  <IconC size={26} stroke={1.8} style={{color: c.color}}/>
                </div>
                <h3 className="k-cat-name">{c.name}</h3>
                <span className="k-cat-count">{c.count}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
Object.assign(window, { CategoryGrid });
