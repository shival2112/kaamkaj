// ApplicationList.jsx — table of the candidate's recent applications.
function ApplicationList({ items, onOpen }) {
  return (
    <div className="d-app-list">
      <div className="d-app-row head">
        <div></div>
        <div>Job</div>
        <div>Stage</div>
        <div>Next step</div>
        <div>Applied</div>
      </div>
      {items.map(a => (
        <div key={a.id} className="d-app-row" onClick={()=>onOpen && onOpen(a)} style={{cursor:'pointer'}}>
          <div className="logo" style={{ background: a.logo.bg }}>{a.logo.text}</div>
          <div>
            <div className="title">{a.title}</div>
            <div className="sub">{a.company} · {a.location} · {a.salary}</div>
          </div>
          <div><span className={`k-chip ${a.stageColor}`}>{a.stage}</span></div>
          <div className="col-next">{a.nextStep}</div>
          <div className="col-applied">{a.applied}</div>
        </div>
      ))}
    </div>
  );
}
Object.assign(window, { ApplicationList });
