

import { useState } from "react";
import "../Styles/Login.css";
import { Link, useNavigate } from "react-router-dom";
import { LuEye, LuEyeOff } from "react-icons/lu";
import { useAuth } from "../Context/AuthContext";
import AuthSidePanel from "../Components/AuthSidePanel";
import Avatar from "../assets/Avatar.png";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: signInError } = await signIn({ email, password });

    if (signInError) {
      setError(signInError.message || "Invalid email or password. Please try again.");
      setLoading(false);
      return;
    }

    navigate("/");
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <AuthSidePanel />

        <div className="auth-form-panel">
          <img src={Avatar} alt="HARYHORDHEYLEY" className="auth-logo" />
          <form onSubmit={handleLogin}>
            <span className="eyebrow">Admin access</span>
            <h2>Welcome back</h2>
            <p className="auth-subtitle">Log in to manage HARYHORDHEYLEY Smart Tech Digital Service.</p>

            {error && <p className="auth-error">{error}</p>}

            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <div className="password-field">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <LuEyeOff size={17} /> : <LuEye size={17} />}
                </button>
              </div>
            </div>

            <div className="auth-row">
              <Link to="/forgot-password" className="auth-link">
                Forgotten password?
              </Link>
            </div>

            <button className="btn btn-primary auth-submit" type="submit" disabled={loading}>
              {loading ? "Logging in…" : "Login"}
            </button>
          </form>

          <p className="auth-footer">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;