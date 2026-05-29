// ProfileBanner.jsx — gradient profile-completion nudge with progress ring.
function ProfileBanner() {
  const pct = dData.user.profileCompletion;
  const C = 2 * Math.PI * 22; // r=22
  const offset = C * (1 - pct/100);
  return (
    <div className="d-profile-banner">
      <div className="progress-ring">
        <svg width="56" height="56">
          <circle cx="28" cy="28" r="22" stroke="rgba(255,255,255,0.25)" strokeWidth="5" fill="none"/>
          <circle cx="28" cy="28" r="22" stroke="#fff" strokeWidth="5" fill="none"
                  strokeLinecap="round" strokeDasharray={C} strokeDashoffset={offset}/>
        </svg>
        <div className="pct">{pct}%</div>
      </div>
      <div style={{flex:1}}>
        <h3>Complete your profile to get noticed</h3>
        <p>Add your work experience and a profile photo. Profiles that are 100% complete get 3× more responses.</p>
      </div>
      <button className="k-btn">Complete profile <Icon.ArrowRight size={14}/></button>
    </div>
  );
}
Object.assign(window, { ProfileBanner });
