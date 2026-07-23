



import { NavLink } from "react-router-dom";
import {
  LuLayoutDashboard,
  LuUsers,
  LuWrench,
  LuShoppingCart,
  LuCreditCard,
  LuUserCog,
  LuBell,
  LuSettings,
  LuUserRound,
  LuLogOut,
  LuX,
} from "react-icons/lu";
import { FiBarChart2 } from "react-icons/fi";
import logo from "../assets/logo.png";
import { useAuth } from "../Context/AuthContext";
import "../Styles/Sidebar.css";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LuLayoutDashboard, end: true },
  { to: "/customers", label: "Customers", icon: LuUsers },
  { to: "/services", label: "Services", icon: LuWrench },
  { to: "/orders", label: "Orders", icon: LuShoppingCart },
  { to: "/payments", label: "Payments", icon: LuCreditCard },
  { to: "/users", label: "Users", icon: LuUserCog },
  { to: "/reports", label: "Reports", icon: FiBarChart2 },
  { to: "/notifications", label: "Notifications", icon: LuBell },
  { to: "/settings", label: "Settings", icon: LuSettings },
  { to: "/profile", label: "Profile", icon: LuUserRound },
];

function Sidebar({ collapsed, mobileOpen, onCloseMobile }) {
  const { profile, user, signOut } = useAuth();

  const displayName = profile?.full_name || user?.email || "Admin";

  return (
    <>
      {mobileOpen && <div className="sidebar-scrim" onClick={onCloseMobile} />}
      <aside className={`sidebar ${collapsed ? "is-collapsed" : ""} ${mobileOpen ? "is-mobile-open" : ""}`}>
        <div className="sidebar-top">
          <div className="sidebar-brand">
            <img src={logo} alt="HARYHORDHEYLEY" className="sidebar-logo" />
            {!collapsed && <span className="sidebar-brand-text">HARYHORDHEYLEY</span>}
          </div>
          <button type="button" className="sidebar-close-mobile" onClick={onCloseMobile} aria-label="Close menu">
            <LuX size={20} />
          </button>

          <nav className="sidebar-nav">
            {!collapsed && <p className="menu-label">MAIN MENU</p>}
            {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={onCloseMobile}
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                title={collapsed ? label : undefined}
              >
                <Icon size={18} />
                {!collapsed && <span>{label}</span>}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="sidebar-bottom">
          <div className="profile-card">
            <div className="avatar-fallback">{displayName.charAt(0).toUpperCase()}</div>
            {!collapsed && (
              <div className="user-info">
                <p className="user-name">{displayName}</p>
                <p className="user-role">{profile?.role || "Administrator"}</p>
              </div>
            )}
          </div>
          <button type="button" className="logout-btn" onClick={signOut} title="Logout">
            <LuLogOut size={16} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;