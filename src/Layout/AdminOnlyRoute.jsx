import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

const ADMIN_ROLES = new Set(["admin", "staff", "super_admin"]);

// Route checks improve navigation; database RLS remains the actual security boundary.
const AdminOnlyRoute = () => {
  const { profile } = useAuth();

  if (!ADMIN_ROLES.has(profile?.role)) {
    return <Navigate to="/portal" replace />;
  }

  return <Outlet />;
};

export default AdminOnlyRoute;
