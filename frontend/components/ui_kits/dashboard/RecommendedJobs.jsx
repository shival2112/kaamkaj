// RecommendedJobs.jsx — small 3-up grid of recommended openings for the candidate.
function RecommendedJobs({ jobs, onApply }) {
  return (
    <div className="d-rec-grid">
      {jobs.map(j => (
        <article key={j.id} className="d-rec-card">
          <div style={{display:'flex', gap:10, alignItems:'flex-start'}}>
            <div style={{width:40, height:40, borderRadius:8, background:j.logo.bg, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-heading)', fontWeight:700, fontSize:13, flexShrink:0}}>{j.logo.text}</div>
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontFamily:'var(--font-heading)', fontWeight:600, fontSize:15, color:'var(--text-primary)', lineHeight:1.3}}>{j.title}</div>
              <div style={{fontSize:13, color:'var(--text-muted)', marginTop:2, display:'flex', alignItems:'center', gap:4}}>
                {j.company}
                {j.verified && <Icon.Verified size={12} stroke={2.4} style={{color:'var(--success)'}}/>}
              </div>
            </div>
          </div>
          <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
            <span className="k-chip"><Icon.MapPin size={11} stroke={2}/>{j.location}</span>
            <span className="k-chip">{j.salary}</span>
          </div>
          <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
            {j.skills.slice(0,2).map(s => <span key={s} className="k-chip brand">{s}</span>)}
          </div>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', borderTop:'1px solid var(--border-default)', paddingTop:10, marginTop:'auto'}}>
            <span style={{fontSize:11, color:'var(--text-hint)'}}>Posted {j.posted} · {j.applicants} applicants</span>
            <button className="k-btn k-btn-primary" onClick={()=>onApply && onApply(j)}>Apply</button>
          </div>
        </article>
      ))}
    </div>
  );
}
Object.assign(window, { RecommendedJobs });
