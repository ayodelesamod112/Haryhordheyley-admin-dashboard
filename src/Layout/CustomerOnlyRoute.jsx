import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

const ADMIN_ROLES = new Set(["admin", "staff", "super_admin"]);

// Admin staff can preview the portal; active customer accounts use it normally.
const CustomerOnlyRoute = () => {
  const { profile } = useAuth();

  if (profile?.role !== "customer" && !ADMIN_ROLES.has(profile?.role)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default CustomerOnlyRoute;
