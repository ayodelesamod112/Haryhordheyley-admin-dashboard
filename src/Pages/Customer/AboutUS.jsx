import { LuTarget, LuEye, LuHeart, LuUsers } from "react-icons/lu";
import "../../Styles/CustomerPortal.css";

function AboutUs() {
  return (
    <div className="portal-page">
      <div className="portal-page-head">
        <span className="eyebrow">Who we are</span>
        <h1>About HARYHORDHEYLEY</h1>
        <p>
          HARYHORDHEYLEY Smart Tech Digital Service is dedicated to reliable, honest tech support —
          from repairs and installations to full digital solutions. We treat every job like it matters,
          because it does.
        </p>
      </div>

      <div className="stat-grid" style={{ marginBottom: 30 }}>
        <div className="portal-card">
          <LuTarget size={22} style={{ color: "var(--color-yellow-deep)", marginBottom: 10 }} />
          <h4>Our Mission</h4>
          <p style={{ fontSize: 13 }}>To make quality tech services accessible, fast, and stress-free for everyone.</p>
        </div>
        <div className="portal-card">
          <LuEye size={22} style={{ color: "var(--color-yellow-deep)", marginBottom: 10 }} />
          <h4>Our Vision</h4>
          <p style={{ fontSize: 13 }}>To become the most trusted name in digital services in our community.</p>
        </div>
        <div className="portal-card">
          <LuHeart size={22} style={{ color: "var(--color-yellow-deep)", marginBottom: 10 }} />
          <h4>Our Values</h4>
          <p style={{ fontSize: 13 }}>Honesty, quality, and respect for every customer's time and trust.</p>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card"><LuUsers size={20} className="stat-card-icon" style={{ background: "none" }} /><div className="stat-card-body"><p className="stat-card-label">Happy Customers</p><h3 className="stat-card-value">200+</h3></div></div>
        <div className="stat-card"><div className="stat-card-body"><p className="stat-card-label">Services Offered</p><h3 className="stat-card-value">8+</h3></div></div>
        <div className="stat-card"><div className="stat-card-body"><p className="stat-card-label">Avg. Turnaround</p><h3 className="stat-card-value">48hrs</h3></div></div>
      </div>
    </div>
  );
}

export default AboutUs;