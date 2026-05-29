// Navbar.jsx — sticky top nav, white shadow, with hamburger drawer for mobile.
function Navbar({ active = 'jobs', onNav, onPostJob, onLogin }) {
  const [open, setOpen] = React.useState(false);
  const links = [
    { id: 'jobs',      label: 'Find Jobs' },
    { id: 'companies', label: 'Companies' },
    { id: 'employers', label: 'For Employers' },
    { id: 'about',     label: 'About' },
  ];
  return (
    <header className="k-navbar">
      <div className="k-container k-navbar-inner">
        <div style={{display:'flex', alignItems:'center'}}>
          <a href="#" className="k-logo" onClick={(e)=>{e.preventDefault(); onNav && onNav('jobs');}}>
            <div className="k-logo-mark">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M8 5 L8 19 M8 12 L17 5 M8 12 L18 19" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="k-logo-text">Kaamkaj</span>
          </a>
          <nav className="k-nav-links">
            {links.map(l => (
              <a key={l.id} href="#"
                 className={`k-nav-link ${active === l.id ? 'active' : ''}`}
                 onClick={(e)=>{e.preventDefault(); onNav && onNav(l.id);}}>
                {l.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="k-nav-cta">
          <button className="k-btn k-btn-ghost" onClick={onLogin}>Login</button>
          <button className="k-btn k-btn-secondary">Sign Up</button>
          <button className="k-btn k-btn-primary" onClick={onPostJob}>Post a Job</button>
        </div>
      </div>
    </header>
  );
}
Object.assign(window, { Navbar });
