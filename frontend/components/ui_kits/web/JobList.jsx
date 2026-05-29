// JobList.jsx — filter-bar + 3-up grid of JobCards (also used in search view).
function JobList({ jobs, title = 'Recommended for you', subtitle, onJob, onApply, showFilters = false, alt = false }) {
  const [activeFilter, setActiveFilter] = React.useState('all');
  const filters = [
    { id: 'all',    label: 'All jobs' },
    { id: 'Full-time', label: 'Full-time' },
    { id: 'Work from Home', label: 'Work from Home' },
    { id: 'Part-time',  label: 'Part-time' },
    { id: 'Internship', label: 'Internship' },
  ];
  const shown = activeFilter === 'all' ? jobs : jobs.filter(j => j.type === activeFilter);

  return (
    <section className={`k-section ${alt ? 'alt' : ''}`}>
      <div className="k-container">
        <div className="k-section-header">
          <div>
            <h2 className="k-section-title">{title}</h2>
            {subtitle && <p className="k-section-sub">{subtitle}</p>}
          </div>
          <a href="#" className="k-section-link">View all jobs <Icon.ChevronRight size={16}/></a>
        </div>
        {showFilters && (
          <div className="k-filter-row">
            {filters.map(f => (
              <button key={f.id}
                      className={`k-filter-chip ${activeFilter === f.id ? 'active' : ''}`}
                      onClick={()=>setActiveFilter(f.id)}>
                {f.label}
              </button>
            ))}
            <button className="k-filter-chip" style={{marginLeft:'auto'}}>
              <Icon.Filter size={14}/> More filters
            </button>
          </div>
        )}
        <div className="k-job-grid">
          {shown.map(j => <JobCard key={j.id} job={j} onSelect={onJob} onApply={onApply}/>)}
        </div>
      </div>
    </section>
  );
}
Object.assign(window, { JobList });
