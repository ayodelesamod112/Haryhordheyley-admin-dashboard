// import { useEffect, useRef, useState } from "react";
// import { LuSearch, LuBell, LuMenu, LuSun, LuMoon, LuChevronDown, LuLogOut, LuUserRound } from "react-icons/lu";
// import { useNavigate } from "react-router-dom";
// import { useSearch } from "../Context/SearchContext";
// import { useAuth } from "../Context/AuthContext";
// import { useTheme } from "../Context/ThemeContext";
// import { supabase } from "../supabase/supabaseClient";
// import "../Styles/Navbar.css";

// function Navbar({ onOpenMobileSidebar }) {
//   const { query, setQuery } = useSearch();
//   const { profile, user, signOut } = useAuth();
//   const { theme, toggleTheme } = useTheme();
//   const navigate = useNavigate();

//   const [profileMenuOpen, setProfileMenuOpen] = useState(false);
//   const [notifOpen, setNotifOpen] = useState(false);
//   const [notifications, setNotifications] = useState([]);
//   const profileRef = useRef(null);
//   const notifRef = useRef(null);

//   const displayName = profile?.full_name || user?.email || "Admin";
//   const unreadCount = notifications.filter((n) => !n.is_read).length;

//   useEffect(() => {
//     const onClickOutside = (e) => {
//       if (profileRef.current && !profileRef.current.contains(e.target)) setProfileMenuOpen(false);
//       if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
//     };
//     document.addEventListener("mousedown", onClickOutside);
//     return () => document.removeEventListener("mousedown", onClickOutside);
//   }, []);

//   useEffect(() => {
//     if (!user) return;
//     const loadNotifications = async () => {
//       const { data } = await supabase
//         .from("notifications")
//         .select("*")
//         .eq("recipient_id", user.id)
//         .order("created_at", { ascending: false })
//         .limit(6);
//       setNotifications(data || []);
//     };
//     loadNotifications();
//   }, [user]);

//   return (
//     <header className="custom-navbar">
//       <button type="button" className="navbar-menu-btn" onClick={onOpenMobileSidebar} aria-label="Open menu">
//         <LuMenu size={20} />
//       </button>

//       <div className="search-container">
//         <LuSearch className="search-icon" />
//         <input
//           value={query}
//           onChange={(e) => setQuery(e.target.value)}
//           type="search"
//           placeholder="Search customers, orders, services…"
//           className="search-input"
//         />
//       </div>

//       <div className="navbar-actions">
//         <button type="button" className="icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
//           {theme === "light" ? <LuMoon size={18} /> : <LuSun size={18} />}
//         </button>

//         <div className="dropdown-wrap" ref={notifRef}>
//           <button
//             type="button"
//             className="icon-btn"
//             onClick={() => setNotifOpen((v) => !v)}
//             aria-label="Notifications"
//           >
//             <LuBell size={18} />
//             {unreadCount > 0 && <span className="notif-dot">{unreadCount}</span>}
//           </button>
//           {notifOpen && (
//             <div className="dropdown-panel notif-panel">
//               <div className="dropdown-heading">Notifications</div>
//               {notifications.length === 0 ? (
//                 <p className="dropdown-empty">You're all caught up.</p>
//               ) : (
//                 notifications.map((n) => (
//                   <div key={n.id} className={`notif-item ${n.is_read ? "" : "unread"}`}>
//                     <p className="notif-title">{n.title}</p>
//                     {n.message && <p className="notif-message">{n.message}</p>}
//                   </div>
//                 ))
//               )}
//               <button
//                 type="button"
//                 className="dropdown-view-all"
//                 onClick={() => {
//                   setNotifOpen(false);
//                   navigate("/notifications");
//                 }}
//               >
//                 View all
//               </button>
//             </div>
//           )}
//         </div>

//         <div className="dropdown-wrap" ref={profileRef}>
//           <button type="button" className="profile-trigger" onClick={() => setProfileMenuOpen((v) => !v)}>
//             <div className="avatar-fallback navbar-avatar">{displayName.charAt(0).toUpperCase()}</div>
//             <div className="user-info navbar-user-info">
//               <p className="user-name">{displayName}</p>
//               <p className="user-role">{profile?.role || "Administrator"}</p>
//             </div>
//             <LuChevronDown size={16} />
//           </button>
//           {profileMenuOpen && (
//             <div className="dropdown-panel profile-panel">
//               <button type="button" onClick={() => { setProfileMenuOpen(false); navigate("/profile"); }}>
//                 <LuUserRound size={16} /> View profile
//               </button>
//               <button type="button" className="danger" onClick={signOut}>
//                 <LuLogOut size={16} /> Logout
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </header>
//   );
// }

// export default Navbar;

import { useEffect, useRef, useState } from "react";
import { LuSearch, LuBell, LuMenu, LuSun, LuMoon, LuChevronDown, LuLogOut, LuUserRound } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import { useSearch } from "../Context/SearchContext";
import { useAuth } from "../Context/AuthContext";
import { useTheme } from "../Context/ThemeContext";
import { supabase } from "../supabase/supabaseClient";
import ConfirmDialog from "../Components/UI/ConfirmDialog";
import "../Styles/Navbar.css";

function Navbar({ onOpenMobileSidebar }) {
  const { query, setQuery } = useSearch();
  const { profile, user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  const displayName = profile?.full_name || user?.email || "Admin";
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  useEffect(() => {
    const onClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (!user) return;
    const loadNotifications = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("recipient_id", user.id)
        .order("created_at", { ascending: false })
        .limit(6);
      setNotifications(data || []);
    };
    loadNotifications();
  }, [user]);

  const handleConfirmLogout = async () => {
    setLoggingOut(true);
    await signOut();
    setLoggingOut(false);
    setConfirmingLogout(false);
  };

  return (
    <header className="custom-navbar">
      <button type="button" className="navbar-menu-btn" onClick={onOpenMobileSidebar} aria-label="Open menu">
        <LuMenu size={20} />
      </button>

      <div className="search-container">
        <LuSearch className="search-icon" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          type="search"
          placeholder="Search customers, orders, services…"
          className="search-input"
        />
      </div>

      <div className="navbar-actions">
        <button type="button" className="icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === "light" ? <LuMoon size={18} /> : <LuSun size={18} />}
        </button>

        <div className="dropdown-wrap" ref={notifRef}>
          <button
            type="button"
            className="icon-btn"
            onClick={() => setNotifOpen((v) => !v)}
            aria-label="Notifications"
          >
            <LuBell size={18} />
            {unreadCount > 0 && <span className="notif-dot">{unreadCount}</span>}
          </button>
          {notifOpen && (
            <div className="dropdown-panel notif-panel">
              <div className="dropdown-heading">Notifications</div>
              {notifications.length === 0 ? (
                <p className="dropdown-empty">You're all caught up.</p>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className={`notif-item ${n.is_read ? "" : "unread"}`}>
                    <p className="notif-title">{n.title}</p>
                    {n.message && <p className="notif-message">{n.message}</p>}
                  </div>
                ))
              )}
              <button
                type="button"
                className="dropdown-view-all"
                onClick={() => {
                  setNotifOpen(false);
                  navigate("/notifications");
                }}
              >
                View all
              </button>
            </div>
          )}
        </div>

        <div className="dropdown-wrap" ref={profileRef}>
          <button type="button" className="profile-trigger" onClick={() => setProfileMenuOpen((v) => !v)}>
            <div className="avatar-fallback navbar-avatar">{displayName.charAt(0).toUpperCase()}</div>
            <div className="user-info navbar-user-info">
              <p className="user-name">{displayName}</p>
              <p className="user-role">{profile?.role || "Administrator"}</p>
            </div>
            <LuChevronDown size={16} />
          </button>
          {profileMenuOpen && (
            <div className="dropdown-panel profile-panel">
              <button type="button" onClick={() => { setProfileMenuOpen(false); navigate("/profile"); }}>
                <LuUserRound size={16} /> View profile
              </button>
              <button
                type="button"
                className="danger"
                onClick={() => {
                  setProfileMenuOpen(false);
                  setConfirmingLogout(true);
                }}
              >
                <LuLogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {confirmingLogout && (
        <ConfirmDialog
          title="Log out?"
          message="Are you sure you want to log out of your account?"
          confirmLabel="Log out"
          danger={true}
          onConfirm={handleConfirmLogout}
          onCancel={() => setConfirmingLogout(false)}
          loading={loggingOut}
        />
      )}
    </header>
  );
}

export default Navbar;