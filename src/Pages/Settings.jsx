import { useEffect, useState } from "react";
import { LuUpload } from "react-icons/lu";
import { supabase } from "../supabase/supabaseClient";
import { useToast } from "../Context/ToastContext";
import { useTheme } from "../Context/ThemeContext";
import Loader from "../Components/UI/Loader";

function Settings() {
  const { showToast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [businessName, setBusinessName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await supabase.from("business_settings").select("*").eq("id", 1).single();
      if (data) {
        setBusinessName(data.business_name || "");
        setLogoUrl(data.logo_url || "");
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase
      .from("business_settings")
      .update({ business_name: businessName, logo_url: logoUrl })
      .eq("id", 1);
    setSaving(false);

    if (error) {
      showToast(error.message, "error");
      return;
    }
    showToast("Settings saved");
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const filePath = `logo-${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("business-assets").upload(filePath, file, { upsert: true });

    if (uploadError) {
      setUploading(false);
      showToast(uploadError.message, "error");
      return;
    }

    const { data } = supabase.storage.from("business-assets").getPublicUrl(filePath);
    setLogoUrl(data.publicUrl);
    setUploading(false);
    showToast("Logo uploaded — remember to Save Changes");
  };

  if (loading) {
    return (
      <div className="page">
        <Loader label="Loading settings…" />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <span className="eyebrow">Configuration</span>
          <h1>Settings</h1>
          <p className="page-subtitle">Business identity and dashboard preferences.</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header"><h2>Business details</h2></div>
          <form className="card-body" onSubmit={handleSave}>
            <div className="form-grid">
              <div className="form-field full">
                <label>Business name</label>
                <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} required />
              </div>
              <div className="form-field full">
                <label>Business logo</label>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  {logoUrl ? (
                    <img src={logoUrl} alt="Business logo" style={{ width: 56, height: 56, borderRadius: 10, objectFit: "cover", border: "1px solid var(--color-border)" }} />
                  ) : (
                    <div style={{ width: 56, height: 56, borderRadius: 10, background: "var(--color-neutral-bg)" }} />
                  )}
                  <label className="btn btn-ghost btn-sm" style={{ cursor: "pointer" }}>
                    <LuUpload size={14} /> {uploading ? "Uploading…" : "Upload new logo"}
                    <input type="file" accept="image/*" hidden onChange={handleLogoUpload} disabled={uploading} />
                  </label>
                </div>
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : "Save Changes"}</button>
            </div>
          </form>
        </div>

        <div className="card">
          <div className="card-header"><h2>Appearance</h2></div>
          <div className="card-body">
            <div className="form-field">
              <label>Theme</label>
              <p style={{ fontSize: 13, marginBottom: 10 }}>Currently using <strong style={{ color: "var(--color-ink)" }}>{theme}</strong> mode.</p>
              <button type="button" className="btn btn-dark" onClick={toggleTheme}>
                Switch to {theme === "light" ? "dark" : "light"} mode
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
