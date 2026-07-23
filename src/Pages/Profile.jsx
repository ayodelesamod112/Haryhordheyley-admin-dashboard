import { useState } from "react";
import { LuCamera } from "react-icons/lu";
import { useAuth } from "../Context/AuthContext";
import { useToast } from "../Context/ToastContext";
import { supabase } from "../supabase/supabaseClient";
import "../Styles/Profile.css";

function Profile() {
  const { user, profile, refreshProfile, updatePassword } = useAuth();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    full_name: profile?.full_name || "",
    phone: profile?.phone || "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [passwordForm, setPasswordForm] = useState({ password: "", confirmPassword: "" });
  const [passwordError, setPasswordError] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const displayName = profile?.full_name || user?.email || "Admin";

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: form.full_name, phone: form.phone })
      .eq("id", user.id);
    setSavingProfile(false);

    if (error) {
      showToast(error.message, "error");
      return;
    }
    await refreshProfile();
    showToast("Profile updated");
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    const filePath = `${user.id}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true });

    if (uploadError) {
      setUploadingAvatar(false);
      showToast(uploadError.message, "error");
      return;
    }

    const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrlData.publicUrl })
      .eq("id", user.id);

    setUploadingAvatar(false);

    if (updateError) {
      showToast(updateError.message, "error");
      return;
    }
    await refreshProfile();
    showToast("Profile picture updated");
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");

    if (passwordForm.password !== passwordForm.confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }
    if (passwordForm.password.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }

    setSavingPassword(true);
    const { error } = await updatePassword(passwordForm.password);
    setSavingPassword(false);

    if (error) {
      setPasswordError(error.message);
      return;
    }
    setPasswordForm({ password: "", confirmPassword: "" });
    showToast("Password changed");
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <span className="eyebrow">Account</span>
          <h1>Profile</h1>
          <p className="page-subtitle">Manage your personal admin account details.</p>
        </div>
      </div>

      <div className="profile-grid">
        <div className="card">
          <div className="card-body profile-avatar-block">
            <div className="profile-avatar-wrap">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={displayName} className="profile-avatar-img" />
              ) : (
                <div className="avatar-fallback profile-avatar-fallback">{displayName.charAt(0).toUpperCase()}</div>
              )}
              <label className="avatar-upload-btn" title="Change photo">
                <LuCamera size={15} />
                <input type="file" accept="image/*" hidden onChange={handleAvatarChange} disabled={uploadingAvatar} />
              </label>
            </div>
            <h3>{displayName}</h3>
            <p style={{ textTransform: "capitalize" }}>{profile?.role || "Administrator"}</p>
            <p style={{ fontSize: 13 }}>{user?.email}</p>
            {uploadingAvatar && <p style={{ fontSize: 12, marginTop: 6 }}>Uploading…</p>}
          </div>
        </div>

        <div className="profile-forms">
          <div className="card">
            <div className="card-header"><h2>Personal details</h2></div>
            <form className="card-body" onSubmit={handleProfileSubmit}>
              <div className="form-grid">
                <div className="form-field">
                  <label>Full name</label>
                  <input type="text" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
                </div>
                <div className="form-field">
                  <label>Phone</label>
                  <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="form-field">
                  <label>Email</label>
                  <input type="email" value={user?.email || ""} disabled />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={savingProfile}>{savingProfile ? "Saving…" : "Save Changes"}</button>
              </div>
            </form>
          </div>

          <div className="card">
            <div className="card-header"><h2>Change password</h2></div>
            <form className="card-body" onSubmit={handlePasswordSubmit}>
              {passwordError && <div className="form-error-banner">{passwordError}</div>}
              <div className="form-grid">
                <div className="form-field">
                  <label>New password</label>
                  <input type="password" value={passwordForm.password} onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })} required />
                </div>
                <div className="form-field">
                  <label>Confirm new password</label>
                  <input type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} required />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-dark" disabled={savingPassword}>{savingPassword ? "Updating…" : "Update Password"}</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
