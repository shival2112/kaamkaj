// CtaBanner.jsx — the gradient "Post a Job" employer CTA at the bottom of the home page.
function CtaBanner({ onCta }) {
  return (
    <section className="k-section">
      <div className="k-container">
        <div className="k-cta-banner">
          <div>
            <h2>Hiring? Post your first job free.</h2>
            <p>Reach 5 Crore+ verified job seekers across India. Your listing goes live in under 5 minutes — no credit card required.</p>
          </div>
          <button className="k-btn k-btn-xl" onClick={onCta}>
            Post a Job <Icon.ArrowRight size={18} stroke={2.2}/>
          </button>
        </div>
      </div>
    </section>
  );
}
Object.assign(window, { CtaBanner });
