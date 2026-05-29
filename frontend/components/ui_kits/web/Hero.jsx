// Hero.jsx — gradient hero with dual-field search box.
function Hero({ onSearch }) {
  const [q, setQ] = React.useState('Sales Executive');
  const [city, setCity] = React.useState('Mumbai');
  const popular = ['Delivery Jobs', 'Work from Home', 'Freshers', '12th Pass', 'Part-time'];

  const submit = () => onSearch && onSearch({ q, city });

  return (
    <section className="k-hero">
      <div className="k-container k-hero-inner">
        <h1>Find Your Dream Job in India</h1>
        <p>5 Crore+ jobs across 500+ cities. Free to apply. Verified employers only.</p>
        <div className="k-hero-search">
          <div className="field">
            <Icon.Search size={20} stroke={1.7} style={{color:'#9CA3AF'}}/>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Job title, skills, company"/>
          </div>
          <div className="divider"/>
          <div className="field city">
            <Icon.MapPin size={20} stroke={1.7} style={{color:'#9CA3AF'}}/>
            <input value={city} onChange={e=>setCity(e.target.value)} placeholder="City"/>
          </div>
          <button className="k-btn k-btn-primary" onClick={submit}>Search Jobs</button>
        </div>
        <div className="k-popular">
          {popular.map(p => <button key={p} className="pill" onClick={()=>{ setQ(p); submit(); }}>{p}</button>)}
        </div>
      </div>
    </section>
  );
}
Object.assign(window, { Hero });
