// Sidebar.jsx — left nav for the candidate dashboard.
function Sidebar({ active, onNav }) {
  const candidate = [
    { id: 'dashboard',    label: 'Dashboard',       icon: 'Home' },
    { id: 'applications', label: 'My Applications', icon: 'FileText', count: 24 },
    { id: 'saved',        label: 'Saved Jobs',      icon: 'Bookmark', count: 12 },
    { id: 'profile',      label: 'My Profile',      icon: 'User' },
    { id: 'resume',       label: 'Resume',          icon: 'FileText' },
    { id: 'messages',     label: 'Messages',        icon: 'Send',     count: 3 },
  ];
  const account = [
    { id: 'settings', label: 'Settings', icon: 'Settings' },
    { id: 'logout',   label: 'Logout',   icon: 'LogOut' },
  ];

  const renderLink = (l) => {
    const IconC = Icon[l.icon] || Icon.Home;
    return (
      <button key={l.id} className={`d-nav-link ${active === l.id ? 'active' : ''}`}
              onClick={()=>onNav && onNav(l.id)}>
        <IconC size={18}/>
        <span>{l.label}</span>
        {l.count && <span className="count">{l.count}</span>}
      </button>
    );
  };

  return (
    <aside className="d-sidebar">
      <div className="d-logo">
        <div className="d-logo-mark">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M8 5 L8 19 M8 12 L17 5 M8 12 L18 19" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="d-logo-text">Kaamkaj</span>
      </div>

      <div className="d-user-block">
        <div className="d-avatar" style={{ background: dData.user.avatarBg }}>{dData.user.initials}</div>
        <div style={{minWidth:0}}>
          <div className="d-user-name">{dData.user.name}</div>
          <div className="d-user-role">{dData.user.role}</div>
        </div>
      </div>

      <button className="d-nav-link cta" onClick={()=>onNav && onNav('apply')}>
        <Icon.Plus size={16} stroke={2.4}/>
        <span>Quick Apply</span>
      </button>

      <div className="d-nav-section">For you</div>
      {candidate.map(renderLink)}

      <div className="d-nav-section">Account</div>
      {account.map(renderLink)}

      <div className="d-sidebar-foot">
        <div style={{fontSize:11, color:'var(--text-hint)', padding:'8px 14px'}}>
          Need help? <a href="#" style={{color:'var(--primary)', fontWeight:500}}>Chat with us</a>
        </div>
      </div>
    </aside>
  );
}
Object.assign(window, { Sidebar });
