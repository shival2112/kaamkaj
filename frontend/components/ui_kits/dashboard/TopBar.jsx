// TopBar.jsx — search + notifications + avatar above the main content.
function TopBar() {
  return (
    <div className="d-topbar">
      <div className="d-search">
        <span className="icon"><Icon.Search size={18}/></span>
        <input placeholder="Search jobs, companies, skills…"/>
      </div>
      <div className="d-topbar-actions">
        <button className="d-icon-btn" aria-label="Notifications">
          <Icon.Bell size={18}/>
          <span className="dot"/>
        </button>
        <button className="d-icon-btn" aria-label="Help">
          <Icon.Globe size={18}/>
        </button>
        <div className="d-avatar" style={{ background: dData.user.avatarBg }}>{dData.user.initials}</div>
      </div>
    </div>
  );
}
Object.assign(window, { TopBar });
