// JobDetail.jsx — full job detail view, used as the second "click-thru" screen.
function JobDetail({ job, onBack, onApply }) {
  const [applied, setApplied] = React.useState(false);
  return (
    <section className="k-section">
      <div className="k-container">
        <button className="k-back-link" onClick={onBack} style={{marginBottom:16}}>
          <Icon.ChevronRight size={16} style={{transform:'rotate(180deg)'}}/> Back to jobs
        </button>

        <div className="k-detail-wrap">
          <div className="k-detail-main">
            <div className="k-detail-header">
              <div className="k-job-head" style={{alignItems:'center'}}>
                <div className="k-job-logo" style={{ background: job.logo.bg, width: 56, height: 56, fontSize: 16, borderRadius: 12 }}>{job.logo.text}</div>
                <div className="k-job-title-block">
                  <h1 style={{ fontFamily:'var(--font-heading)', fontWeight:700, fontSize:24, margin:0, color:'var(--text-primary)', lineHeight:1.2 }}>{job.title}</h1>
                  <div className="k-job-company" style={{fontSize:15, marginTop:4}}>
                    {job.company}
                    {job.verified && <span className="v"><Icon.Verified size={15} stroke={2.2}/></span>}
                    <span style={{margin:'0 6px', color:'var(--text-hint)'}}>·</span>
                    <span style={{color:'var(--text-muted)'}}>{job.id}</span>
                  </div>
                </div>
                <button className="k-btn k-btn-ghost k-btn-sm" style={{padding:'8px'}} aria-label="Share">
                  <Icon.Share size={18}/>
                </button>
              </div>

              <div className="k-meta-row" style={{marginTop:14}}>
                <span className={`k-chip ${jobTypeChipClass(job.type)}`}>{job.type}</span>
                <span className="k-chip"><Icon.Clock size={12} stroke={2}/>Posted {job.posted}</span>
                <span className="k-chip"><Icon.Eye size={12} stroke={2}/>{job.applicants} applicants</span>
              </div>

              <div className="k-detail-meta-grid">
                <div className="item">
                  <div className="lbl">Location</div>
                  <div className="val">{job.location}</div>
                </div>
                <div className="item">
                  <div className="lbl">Salary</div>
                  <div className="val">{job.salary}</div>
                </div>
                <div className="item">
                  <div className="lbl">Experience</div>
                  <div className="val">{job.experience}</div>
                </div>
                <div className="item">
                  <div className="lbl">Education</div>
                  <div className="val">12th pass +</div>
                </div>
              </div>
            </div>

            <div className="k-detail-card">
              <h3>Job description</h3>
              <p>We are hiring a <strong>{job.title}</strong> at <strong>{job.company}</strong> to drive sales and customer relationships across {job.location.split(',')[0]}. You'll work directly with branch managers, meet 8–10 customers daily, and own your monthly targets.</p>
              <p>This is a {job.type.toLowerCase()} role. We provide on-the-job training in the first two weeks, plus monthly incentives on top of base pay.</p>
            </div>

            <div className="k-detail-card">
              <h3>Key responsibilities</h3>
              <ul>
                <li>Meet daily customer targets and submit visit reports through the company app</li>
                <li>Explain product features in the language the customer speaks</li>
                <li>Build relationships with shopkeepers and small business owners in your area</li>
                <li>Maintain a clean sales pipeline using the CRM provided</li>
              </ul>
            </div>

            <div className="k-detail-card">
              <h3>What you'll need</h3>
              <ul>
                <li>{job.experience} of relevant experience</li>
                <li>Fluent in Hindi and conversational English</li>
                <li>Own two-wheeler with valid driver's licence</li>
                <li>Smartphone with active internet connection</li>
              </ul>
            </div>

            <div className="k-detail-card">
              <h3>Skills</h3>
              <div className="k-meta-row">
                {job.skills.map(s => <span key={s} className="k-chip brand">{s}</span>)}
                <span className="k-chip brand">Field sales</span>
                <span className="k-chip brand">Negotiation</span>
              </div>
            </div>
          </div>

          <aside className="k-detail-side">
            <div className="k-detail-card" style={{padding:20}}>
              <div style={{fontFamily:'var(--font-heading)', fontWeight:600, fontSize:15, color:'var(--text-primary)'}}>Ready to apply?</div>
              <p style={{fontSize:13, color:'var(--text-muted)', margin:'6px 0 16px'}}>Most candidates hear back within 3 days. We'll send updates on WhatsApp at +91 98xxx xxx10.</p>
              <button className={`k-btn ${applied ? 'k-btn-secondary' : 'k-btn-primary'} k-btn-block k-btn-lg`}
                      disabled={applied}
                      onClick={()=>{ setApplied(true); onApply && onApply(job); }}>
                {applied ? <><Icon.Check size={16}/> Application sent</> : 'Apply Now'}
              </button>
              <button className="k-btn k-btn-secondary k-btn-block" style={{marginTop:8}}>
                <Icon.Bookmark size={16}/> Save for later
              </button>
              <div style={{borderTop:'1px solid var(--border-default)', marginTop:16, paddingTop:16, fontSize:12, color:'var(--text-muted)', display:'flex', flexDirection:'column', gap:6}}>
                <div style={{display:'flex',alignItems:'center',gap:6}}><Icon.Verified size={14} stroke={2} style={{color:'var(--success)'}}/> Verified employer</div>
                <div style={{display:'flex',alignItems:'center',gap:6}}><Icon.Phone size={14} stroke={2}/> Call HR directly after applying</div>
                <div style={{display:'flex',alignItems:'center',gap:6}}><Icon.Mail size={14} stroke={2}/> Free to apply, always</div>
              </div>
            </div>

            <div className="k-detail-card" style={{padding:20}}>
              <div style={{fontFamily:'var(--font-heading)', fontWeight:600, fontSize:15, color:'var(--text-primary)', marginBottom:10}}>About {job.company}</div>
              <p style={{fontSize:13, color:'var(--text-muted)', margin:'0 0 12px', lineHeight:1.5}}>One of India's leading financial services groups. 50,000+ employees across 200+ cities.</p>
              <a href="#" className="k-section-link">View company profile <Icon.ChevronRight size={14}/></a>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
Object.assign(window, { JobDetail });
