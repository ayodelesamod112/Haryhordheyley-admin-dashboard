// import { Navigate, Outlet } from "react-router-dom";
// import { useAuth } from "../Context/AuthContext";

// // Keeps a logged-in admin from seeing Login/Signup again
// const PublicOnlyRoute = () => {
//   const { isAuthenticated, loading } = useAuth();
//   if (loading) return null;
//   return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
// };

// export default PublicOnlyRoute;



import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import Loader from "../Components/UI/Loader";

const ADMIN_ROLES = new Set(["admin", "staff", "super_admin"]);

// Keeps a logged-in person from seeing Login/Signup again —
// sends them to the right home depending on whether they're the admin or a customer
const PublicOnlyRoute = () => {
  const { isAuthenticated, loading, profile } = useAuth();

  if (loading) return <Loader label="Checking your session…" />;
  if (!isAuthenticated) return <Outlet />;

  if (profile?.status === "suspended") return <Outlet />;
  if (profile?.status === "pending") return <Navigate to="/portal" replace />;
  if (ADMIN_ROLES.has(profile?.role)) return <Navigate to="/" replace />;
  return <Navigate to="/portal" replace />;
};

export default PublicOnlyRoute;
