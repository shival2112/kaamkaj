// Footer.jsx — 5-column dark footer.
function Footer() {
  const cols = [
    {
      title: 'For Job Seekers',
      links: ['Find Jobs', 'Browse Companies', 'Career Resources', 'Resume Builder', 'Job Alerts'],
    },
    {
      title: 'For Employers',
      links: ['Post a Job', 'Pricing', 'Search Candidates', 'Employer Branding', 'Help Centre'],
    },
    {
      title: 'Company',
      links: ['About Us', 'Careers', 'Press', 'Blog', 'Contact'],
    },
    {
      title: 'Legal',
      links: ['Terms of Service', 'Privacy Policy', 'Cookies', 'Trust & Safety'],
    },
  ];

  return (
    <footer className="k-footer">
      <div className="k-container">
        <div className="k-footer-grid">
          <div className="k-footer-col k-footer-brand">
            <div className="k-logo">
              <div className="k-logo-mark">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M8 5 L8 19 M8 12 L17 5 M8 12 L18 19" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="k-logo-text" style={{color:'#fff'}}>Kaamkaj</span>
            </div>
            <p>India's job portal for the rest of us. Built mobile-first for the 5 Crore+ workers who power the country.</p>
            <div className="socials">
              <a href="#" aria-label="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 0 1 1-1h3v-4h-3a5 5 0 0 0-5 5v2.01h-2l-.396 3.98h2.396v8.01Z"/></svg>
              </a>
              <a href="#" aria-label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a href="#" aria-label="LinkedIn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 2h-17A1.5 1.5 0 0 0 2 3.5v17A1.5 1.5 0 0 0 3.5 22h17a1.5 1.5 0 0 0 1.5-1.5v-17A1.5 1.5 0 0 0 20.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 1 1 8.25 6.5 1.78 1.78 0 0 1 6.5 8.25zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93s-1.62.59-1.62 1.97V19h-3v-9h2.9v1.3a3.11 3.11 0 0 1 2.7-1.4c1.55 0 3.4.86 3.4 3.66z"/></svg>
              </a>
              <a href="#" aria-label="YouTube">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.546 15.568V8.432L15.818 12l-6.272 3.568z"/></svg>
              </a>
            </div>
          </div>
          {cols.map(col => (
            <div key={col.title} className="k-footer-col">
              <h4>{col.title}</h4>
              <ul>{col.links.map(l => <li key={l}><a href="#">{l}</a></li>)}</ul>
            </div>
          ))}
        </div>
        <div className="k-footer-bottom">
          <div>© 2026 Kaamkaj Technologies Pvt Ltd. Made with care in Bengaluru.</div>
          <div>Available in Hindi · English · Tamil · Telugu · Bengali · Marathi</div>
        </div>
      </div>
    </footer>
  );
}
Object.assign(window, { Footer });
