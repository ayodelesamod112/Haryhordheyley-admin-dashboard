import { useAuth } from "../Context/AuthContext";
import logo from "../assets/logo.png";
import "../Styles/Login.css";

function PendingApproval() {
  const { profile, signOut } = useAuth();

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ display: "block", maxWidth: 440 }}>
        <div className="auth-form-panel" style={{ textAlign: "center" }}>
          <img src={logo} alt="HARYHORDHEYLEY" className="auth-logo" style={{ margin: "0 auto 18px" }} />
          <span className="eyebrow">Account pending</span>
          <h2>Waiting on approval</h2>
          <p className="auth-subtitle">
            Hi {profile?.full_name || "there"} — your account has been created but hasn't been
            approved by an admin yet. Once approved, you'll be able to log in and access the
            dashboard.
          </p>
          <button type="button" className="btn btn-ghost auth-submit" onClick={signOut}>
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}

export default PendingApproval;
