// import { useState } from "react";
// import { Outlet } from "react-router-dom";
// import Sidebar from "./Sidebar";
// import Navbar from "./Navbar";
// import "../Styles/Layout.css";

// const Layout = () => {
//   const [mobileOpen, setMobileOpen] = useState(false);

//   return (
//     <div className="app-shell">
//       <Sidebar collapsed={false} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
//       <div className="app-main">
//         <Navbar onOpenMobileSidebar={() => setMobileOpen(true)} />
//         <main className="app-content">
//           <Outlet />
//         </main>
//       </div>
//     </div>
//   );
// };

// export default Layout;




import { useCallback, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useAuth } from "../Context/AuthContext";
import { useToast } from "../Context/ToastContext";
import { useInactivityLogout } from "../hooks/useInactivityLogout";
import "../Styles/Layout.css";

const Layout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { signOut } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleInactivityTimeout = useCallback(async () => {
    await signOut();
    showToast("You were logged out after 15 minutes of inactivity", "error");
    navigate("/login");
  }, [signOut, showToast, navigate]);

  useInactivityLogout(handleInactivityTimeout, 15 * 60 * 1000);

  return (
    <div className="app-shell">
      <Sidebar collapsed={false} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className="app-main">
        <Navbar onOpenMobileSidebar={() => setMobileOpen(true)} />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
