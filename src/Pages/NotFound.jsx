import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="auth-container">
      <div className="auth-card" style={{ textAlign: "center" }}>
        <span className="eyebrow">404</span>
        <h2>Page not found</h2>
        <p className="auth-subtitle">The page you're looking for doesn't exist.</p>
        <Link to="/" className="btn btn-primary auth-submit" style={{ display: "flex" }}>
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
