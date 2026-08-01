import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LuLayoutDashboard, LuHouse, LuWrench, LuShoppingBag, LuCreditCard, LuReceipt,
  LuMessageSquare, LuBell, LuUserRound, LuInfo, LuPhone, LuCircleHelp,
  LuLogOut, LuMenu, LuX, LuSun, LuMoon,
} from "react-icons/lu";
import { useAuth } from "../Context/AuthContext";
import { useCustomerTheme } from "../Context/CustomerThemeContext";
import { supabase } from "../supabase/supabaseClient";
import ConfirmDialog from "../Components/UI/ConfirmDialog";
import Avatar from "../assets/Avatar.png";
import "../Styles/CustomerPortal.css";

const NAV_ITEMS = [
  { to: "/portal", label: "Dashboard", icon: LuLayoutDashboard, end: true },
  { to: "/portal/home", label: "Home", icon: LuHouse },
  { to: "/portal/services", label: "Services", icon: LuWrench },
  { to: "/portal/orders", label: "My Orders", icon: LuShoppingBag },
  { to: "/portal/payments", label: "My Payments", icon: LuCreditCard },
  { to: "/portal/receipts", label: "My Receipts", icon: LuReceipt },
  { to: "/portal/messages", label: "Messages", icon: LuMessageSquare, showBadge: "messages" },
  { to: "/portal/notifications", label: "Notifications", icon: LuBell, showBadge: "notifications" },
  { to: "/portal/profile", label: "My Profile", icon: LuUserRound },
];

const INFO_ITEMS = [
  { to: "/portal/about", label: "About Us", icon: LuInfo },
  { to: "/portal/contact", label: "Contact Us", icon: LuPhone },
  { to: "/portal/faq", label: "FAQ", icon: LuCircleHelp },
];

function CustomerLayout() {
  const { profile, user, signOut } = useAuth();
  const { theme, toggleTheme } = useCustomerTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const displayName = profile?.full_name || user?.email || "there";

  useEffect(() => {
    if (!user) return;

    const loadCounts = async () => {
      const [{ count: msgCount }, { count: notifCount }] = await Promise.all([
        supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("customer_id", user.id)
          .eq("is_read", false)
          .neq("sender_id", user.id),
        supabase
          .from("notifications")
          .select("*", { count: "exact", head: true })
          .eq("recipient_id", user.id)
          .eq("is_read", false),
      ]);
      setUnreadMessages(msgCount || 0);
      setUnreadNotifications(notifCount || 0);
    };

    loadCounts();
  }, [user]);

  const handleConfirmLogout = async () => {
    setLoggingOut(true);
    await signOut();
    setLoggingOut(false);
    setConfirmingLogout(false);
    navigate("/login");
  };

  const badgeCount = (key) => {
    if (key === "messages") return unreadMessages;
    if (key === "notifications") return unreadNotifications;
    return 0;
  };

  return (
    <div className="portal-shell-v2" data-theme={theme}>
      {mobileOpen && <div className="portal-scrim" onClick={() => setMobileOpen(false)} />}

      <aside className={`portal-sidebar ${mobileOpen ? "is-mobile-open" : ""}`}>
        <div className="portal-sidebar-top">
          <div className="portal-brand">
            <img src={Avatar} alt="HARYHORDHEYLEY" className="portal-logo" />
            <span>HARYHORDHEYLEY</span>
            <button type="button" className="portal-theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === "light" ? <LuMoon size={16} /> : <LuSun size={16} />}
            </button>
          </div>
          <button type="button" className="portal-close-mobile" onClick={() => setMobileOpen(false)} aria-label="Close menu">
            <LuX size={20} />
          </button>

          <nav className="portal-sidebar-nav">
            <p className="portal-menu-label">MY ACCOUNT</p>
            {NAV_ITEMS.map(({ to, label, icon: Icon, end, showBadge }) => {
              const count = showBadge ? badgeCount(showBadge) : 0;
              return (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => `portal-nav-link ${isActive ? "active" : ""}`}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                  {count > 0 && <span className="portal-nav-badge">{count}</span>}
                </NavLink>
              );
            })}

            <p className="portal-menu-label">COMPANY</p>
            {INFO_ITEMS.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `portal-nav-link ${isActive ? "active" : ""}`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="portal-sidebar-bottom">
          <div className="portal-profile-card">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={displayName} className="portal-avatar-img" />
            ) : (
              <div className="portal-avatar-fallback">{displayName.charAt(0).toUpperCase()}</div>
            )}
            <div className="portal-user-info">
              <p className="portal-user-name">{displayName}</p>
              <p className="portal-user-role">Customer</p>
            </div>
          </div>
          <button type="button" className="portal-logout-btn" onClick={() => setConfirmingLogout(true)}>
            <LuLogOut size={16} /> <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="portal-main-v2">
        <header className="portal-topbar">
          <button type="button" className="portal-menu-toggle" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <LuMenu size={20} />
          </button>
          <span className="portal-topbar-title">Customer Portal</span>
        </header>

        <main className="portal-content">
          <Outlet />
        </main>
      </div>

      {confirmingLogout && (
        <ConfirmDialog
          title="Log out?"
          message="Are you sure you want to log out?"
          confirmLabel="Log out"
          onConfirm={handleConfirmLogout}
          onCancel={() => setConfirmingLogout(false)}
          loading={loggingOut}
        />
      )}
    </div>
  );
}

export default CustomerLayout;