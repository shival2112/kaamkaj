// CompanyStrip.jsx — horizontal grid of "10 Lakh+ hiring companies".
function CompanyStrip() {
  return (
    <section className="k-section alt">
      <div className="k-container">
        <div className="k-section-header">
          <div>
            <h2 className="k-section-title">10 Lakh+ companies hiring on Kaamkaj</h2>
            <p className="k-section-sub">From kirana stores to India's biggest brands.</p>
          </div>
        </div>
        <div className="k-co-strip">
          {kData.companies.map(c => (
            <div key={c.name} className="k-co-tile" style={{ background: c.bg }}>{c.text}</div>
          ))}
        </div>
      </div>
    </section>
  );
}
Object.assign(window, { CompanyStrip });
