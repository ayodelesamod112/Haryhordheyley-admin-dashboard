import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import logo from "../assets/logo.png";
import "../Styles/Login.css";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const { updatePassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    const { error: updateError } = await updatePassword(password);
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }
    setDone(true);
    setTimeout(() => navigate("/"), 1500);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <img src={logo} alt="HARYHORDHEYLEY" className="auth-logo" />
        {done ? (
          <div>
            <span className="eyebrow">Success</span>
            <h2>Password updated</h2>
            <p className="auth-subtitle">Taking you to your dashboard…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <span className="eyebrow">Set new password</span>
            <h2>Choose a new password</h2>
            <p className="auth-subtitle">
              You've followed a reset link — enter a new password for your account below.
            </p>

            {error && <p className="auth-error">{error}</p>}

            <div className="input-group">
              <label htmlFor="password">New password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="confirmPassword">Confirm new password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button className="btn btn-primary auth-submit" type="submit" disabled={loading}>
              {loading ? "Updating…" : "Update password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;
