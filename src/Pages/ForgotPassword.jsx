import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import logo from "../assets/logo.png";
import "../Styles/Login.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const { sendPasswordReset } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error: resetError } = await sendPasswordReset(email);
    setLoading(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setSent(true);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <img src={logo} alt="HARYHORDHEYLEY" className="auth-logo" />
        {sent ? (
          <div>
            <span className="eyebrow">Check your inbox</span>
            <h2>Reset link sent</h2>
            <p className="auth-subtitle">
              We've emailed a password reset link to <strong>{email}</strong>. Follow it to choose a new password.
            </p>
            <Link to="/login" className="btn btn-ghost auth-submit" style={{ marginTop: 20, display: "flex" }}>
              Back to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <span className="eyebrow">Password reset</span>
            <h2>Forgot your password?</h2>
            <p className="auth-subtitle">Enter your email and we'll send you a reset link.</p>

            {error && <p className="auth-error">{error}</p>}

            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <button className="btn btn-primary auth-submit" type="submit" disabled={loading}>
              {loading ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}
        <p className="auth-footer">
          Remembered it? <Link to="/login">Back to login</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
