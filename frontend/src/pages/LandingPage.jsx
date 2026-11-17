import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="landing-page">
      <section className="hero-section">
        <div>
          <span className="eyebrow">UCU Campus Services</span>
          <h1>Lost and Found made simple.</h1>
          <p>
            Report misplaced items, help others recover their belongings, and keep the process safe, private,
            and efficient across the university campus.
          </p>
          <div className="hero-actions">
            <Link className="primary-button" to="/register">Create account</Link>
            <Link className="secondary-button" to="/login">Login</Link>
          </div>
        </div>
        <div className="hero-card">
          <h3>Campus snapshots</h3>
          <div className="mini-stats">
            <div>
              <strong>1,200+</strong>
              <span>reported items</span>
            </div>
            <div>
              <strong>86%</strong>
              <span>resolved this term</span>
            </div>
          </div>
        </div>
      </section>

      <section className="feature-grid">
        <article className="feature-card">
          <h3>Report quickly</h3>
          <p>Students can log lost or found items with clear descriptions and campus details.</p>
        </article>
        <article className="feature-card">
          <h3>Private claims</h3>
          <p>Ownership evidence is handled securely and only shared with the claimant and authorised admins.</p>
        </article>
        <article className="feature-card">
          <h3>Admin review</h3>
          <p>Only authorised personnel can approve, reject, and confirm item return after collection.</p>
        </article>
      </section>
    </div>
  );
}
