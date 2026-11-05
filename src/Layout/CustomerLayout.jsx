<<<<<<< HEAD
import { useCallback, useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LuLayoutDashboard, LuWrench, LuShoppingBag, LuCreditCard, LuReceipt,
  LuMessageSquare, LuBell, LuUserRound, LuInfo, LuPhone, LuCircleHelp,
  LuLogOut, LuMenu, LuX, LuChevronDown, LuSun, LuMoon, LuSettings, LuSearch,
=======
import { useCallback, useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LuLayoutDashboard, LuHouse, LuWrench, LuShoppingBag, LuCreditCard, LuReceipt,
  LuMessageSquare, LuBell, LuUserRound, LuInfo, LuPhone, LuCircleHelp,
  LuLogOut, LuMenu, LuX, LuChevronDown, LuSun, LuMoon,
>>>>>>> 571250a4e43d62e8244eb0d1cd44791de90c4f3f
} from "react-icons/lu";
import { useAuth } from "../Context/AuthContext";
import { useToast } from "../Context/ToastContext";
import { useCustomerTheme } from "../Context/CustomerThemeContext";
import { useInactivityLogout } from "../hooks/useInactivityLogout";
import { supabase } from "../supabase/supabaseClient";
import ConfirmDialog from "../Components/UI/ConfirmDialog";
import Avatar from "../assets/Avatar.jpg";
<<<<<<< HEAD
import { CUSTOMER_SERVICE_CATALOG } from "../data/customerServices";
=======
>>>>>>> 571250a4e43d62e8244eb0d1cd44791de90c4f3f
import "../Styles/CustomerPortal.css";

const NAV_ITEMS = [
  { to: "/portal", label: "Dashboard", icon: LuLayoutDashboard, end: true },
  { to: "/portal/services", label: "Services", icon: LuWrench },
  { to: "/portal/orders", label: "My Orders", icon: LuShoppingBag },
  { to: "/portal/payments", label: "My Payments", icon: LuCreditCard },
  { to: "/portal/receipts", label: "My Receipts", icon: LuReceipt },
  { to: "/portal/messages", label: "Messages", icon: LuMessageSquare, showBadge: "messages" },
  { to: "/portal/notifications", label: "Notifications", icon: LuBell, showBadge: "notifications" },
<<<<<<< HEAD
];

const INFO_ITEMS = [
=======
  { to: "/portal/profile", label: "My Profile", icon: LuUserRound },
];

const INFO_ITEMS = [
  { to: "/portal/home", label: "Company Home", icon: LuHouse },
>>>>>>> 571250a4e43d62e8244eb0d1cd44791de90c4f3f
  { to: "/portal/about", label: "About Us", icon: LuInfo },
  { to: "/portal/contact", label: "Contact Us", icon: LuPhone },
  { to: "/portal/faq", label: "FAQ", icon: LuCircleHelp },
];

function CustomerLayout() {
<<<<<<< HEAD
  const { user, signOut } = useAuth();
=======
  const { profile, user, signOut } = useAuth();
>>>>>>> 571250a4e43d62e8244eb0d1cd44791de90c4f3f
  const { showToast } = useToast();
  const { theme, toggleTheme } = useCustomerTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(false);
<<<<<<< HEAD
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [serviceSearch, setServiceSearch] = useState("");
  const [serviceSearchOpen, setServiceSearchOpen] = useState(false);
  const [activeServices, setActiveServices] = useState([]);
=======
>>>>>>> 571250a4e43d62e8244eb0d1cd44791de90c4f3f
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

<<<<<<< HEAD
=======
  const displayName = profile?.full_name || user?.email || "there";
>>>>>>> 571250a4e43d62e8244eb0d1cd44791de90c4f3f
  const isCompanyRoute = INFO_ITEMS.some((item) => item.to === location.pathname);
  const companyExpanded = companyOpen || isCompanyRoute;

  const handleInactivityTimeout = useCallback(async () => {
    await signOut();
    showToast("You were logged out after 15 minutes of inactivity", "error");
    navigate("/login", { replace: true });
  }, [signOut, showToast, navigate]);

  useInactivityLogout(handleInactivityTimeout, 15 * 60 * 1000, Boolean(user?.id));

  useEffect(() => {
<<<<<<< HEAD
    let mounted = true;
    supabase.from("services").select("id, name, price").eq("status", "active").order("name")
      .then(({ data }) => { if (mounted) setActiveServices(data || []); });
    return () => { mounted = false; };
  }, []);

  const serviceSearchOptions = useMemo(() => {
    const saved = new Map(activeServices.map((service) => [service.name.toLowerCase(), service]));
    const catalog = CUSTOMER_SERVICE_CATALOG.map((item) => ({ ...item, ...saved.get(item.name.toLowerCase()) }));
    const extra = activeServices.filter((service) => !CUSTOMER_SERVICE_CATALOG.some((item) => item.name.toLowerCase() === service.name.toLowerCase()));
    return [...catalog, ...extra];
  }, [activeServices]);
  const matchingServices = useMemo(() => {
    const query = serviceSearch.trim().toLowerCase();
    if (!query) return serviceSearchOptions.slice(0, 6);
    return serviceSearchOptions.filter((service) => `${service.name} ${service.category || ""}`.toLowerCase().includes(query)).slice(0, 6);
  }, [serviceSearch, serviceSearchOptions]);

  useEffect(() => {
=======
>>>>>>> 571250a4e43d62e8244eb0d1cd44791de90c4f3f
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

<<<<<<< HEAD
  const openSettings = () => {
    setSettingsOpen(true);
    if (window.matchMedia("(max-width: 900px)").matches) setMobileOpen(true);
  };

  const requestSearchedService = (name) => {
    const query = name.trim();
    if (!query) return;
    setServiceSearchOpen(false);
    setMobileOpen(false);
    navigate(`/portal/orders?service=${encodeURIComponent(query)}`);
  };

  const handleServiceSearch = (event) => {
    event.preventDefault();
    requestSearchedService(serviceSearch);
  };

=======
>>>>>>> 571250a4e43d62e8244eb0d1cd44791de90c4f3f
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
            <span style={{color:"white"}}>HARYHORDHEYLEY</span>
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

            <button
              type="button"
              className="portal-menu-label portal-menu-group-toggle"
              onClick={() => setCompanyOpen((open) => !open)}
              aria-expanded={companyExpanded}
            >
              <span>COMPANY</span>
              <LuChevronDown className={companyExpanded ? "is-open" : ""} size={15} />
            </button>
            {companyExpanded && INFO_ITEMS.map(({ to, label, icon: Icon }) => (
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
<<<<<<< HEAD
          <button type="button" className="portal-settings-toggle" onClick={() => setSettingsOpen((open) => !open)} aria-expanded={settingsOpen}>
            <LuSettings size={18} /><span>Settings</span><LuChevronDown className={settingsOpen ? "is-open" : ""} size={15} />
          </button>
          {settingsOpen && (
            <>
              <NavLink to="/portal/profile" onClick={() => setMobileOpen(false)} className={({ isActive }) => `portal-nav-link portal-settings-link ${isActive ? "active" : ""}`}>
                <LuUserRound size={18} /><span>My Profile</span>
              </NavLink>
              <button type="button" className="portal-theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${theme === "light" ? "dark" : "light"} customer theme`} aria-pressed={theme === "dark"}>
                {theme === "light" ? <LuMoon size={17} /> : <LuSun size={17} />}
                <span>{theme === "light" ? "Dark appearance" : "Light appearance"}</span>
              </button>
            </>
          )}
=======
          <button
            type="button"
            className="portal-theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} customer theme`}
            aria-pressed={theme === "dark"}
          >
            {theme === "light" ? <LuMoon size={17} /> : <LuSun size={17} />}
            <span>Switch to {theme === "light" ? "dark" : "light"} mode</span>
          </button>
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
>>>>>>> 571250a4e43d62e8244eb0d1cd44791de90c4f3f
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
<<<<<<< HEAD
          <div className="portal-global-search-wrap">
            <form className="portal-global-search" onSubmit={handleServiceSearch} role="search">
              <LuSearch size={18} aria-hidden="true" />
              <input
                type="search"
                role="combobox"
                aria-label="Search services"
                aria-autocomplete="list"
                aria-expanded={serviceSearchOpen}
                aria-controls="portal-service-suggestions"
                placeholder="Search services…"
                value={serviceSearch}
                onFocus={() => setServiceSearchOpen(true)}
                onBlur={() => window.setTimeout(() => setServiceSearchOpen(false), 140)}
                onChange={(event) => { setServiceSearch(event.target.value); setServiceSearchOpen(true); }}
              />
            </form>
            {serviceSearchOpen && (
              <div className="portal-search-suggestions" id="portal-service-suggestions" role="listbox">
                {matchingServices.map((service) => (
                  <button key={service.id || service.name} type="button" role="option" className="portal-search-option" onMouseDown={(event) => event.preventDefault()} onClick={() => requestSearchedService(service.name)}>
                    <span>{service.name}</span>
                    {service.price != null && <small>{new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(service.price)}</small>}
                  </button>
                ))}
                {serviceSearch.trim() && matchingServices.length === 0 && (
                  <p className="portal-search-empty">Service not available in the list.</p>
                )}
                {serviceSearch.trim() && (
                  <button type="button" className="portal-search-request" onMouseDown={(event) => event.preventDefault()} onClick={() => requestSearchedService(serviceSearch)}>
                    {matchingServices.length ? `Request “${serviceSearch.trim()}”` : `Send “${serviceSearch.trim()}” as a service request`}
                  </button>
                )}
              </div>
            )}
          </div>
          <button
            type="button"
            className="portal-topbar-theme"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} customer theme`}
            aria-pressed={theme === "dark"}
            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? <LuMoon size={19} /> : <LuSun size={19} />}
          </button>
          <button type="button" className="portal-topbar-settings" onClick={openSettings} aria-label="Open customer settings" title="Settings">
            <LuSettings size={19} />
          </button>
=======
          <span className="portal-topbar-title">Customer Portal</span>
>>>>>>> 571250a4e43d62e8244eb0d1cd44791de90c4f3f
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
