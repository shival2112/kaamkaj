// JobCard.jsx — the canonical Kaamkaj job listing card.
function jobTypeChipClass(type) {
  return ({
    'Full-time': 'success', 'Part-time': 'warning', 'Work from Home': 'info', 'Internship': 'purple'
  })[type] || 'brand';
}

function JobCard({ job, selected, onSelect, onApply }) {
  const [saved, setSaved] = React.useState(false);
  return (
    <article className={`k-job-card ${selected ? 'selected' : ''}`} onClick={()=>onSelect && onSelect(job)}>
      <div className="k-job-head">
        <div className="k-job-logo" style={{ background: job.logo.bg }}>{job.logo.text}</div>
        <div className="k-job-title-block">
          <h3 className="k-job-title">{job.title}</h3>
          <div className="k-job-company">
            {job.company}
            {job.verified && <span className="v" title="Verified employer"><Icon.Verified size={14} stroke={2.2}/></span>}
          </div>
        </div>
        <button className={`k-bookmark ${saved ? 'active' : ''}`}
                onClick={(e)=>{e.stopPropagation(); setSaved(!saved);}}
                aria-label="Save job">
          {saved ? <Icon.BookmarkFilled size={20}/> : <Icon.Bookmark size={20}/>}
        </button>
      </div>
      <div className="k-meta-row">
        <span className="k-chip"><Icon.MapPin size={12} stroke={2}/>{job.location.split(',')[0]}</span>
        <span className="k-chip"><Icon.Rupee size={12} stroke={2}/>{job.salary.replace('/month','/mo').replace('₹','')}</span>
        <span className={`k-chip ${jobTypeChipClass(job.type)}`}>{job.type}</span>
        <span className="k-chip"><Icon.Briefcase size={12} stroke={2}/>{job.experience}</span>
      </div>
      <div className="k-meta-row">
        {job.skills.slice(0,3).map(s => <span key={s} className="k-chip brand">{s}</span>)}
      </div>
      <div className="k-job-foot">
        <span className="k-job-posted">Posted {job.posted} · {job.applicants} applicants</span>
        <div className="k-job-actions">
          <button className="k-btn k-btn-ghost k-btn-sm" onClick={(e)=>{e.stopPropagation(); setSaved(!saved);}}>
            {saved ? 'Saved' : 'Save'}
          </button>
          <button className="k-btn k-btn-primary k-btn-sm" onClick={(e)=>{e.stopPropagation(); onApply && onApply(job);}}>
            Apply Now
          </button>
        </div>
      </div>
    </article>
  );
}
Object.assign(window, { JobCard, jobTypeChipClass });
