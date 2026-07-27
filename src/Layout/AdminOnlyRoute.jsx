import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

// Only the admin account can get past this point.
// A logged-in customer trying to reach admin pages gets sent to their portal instead.
const AdminOnlyRoute = () => {
  const { profile } = useAuth();

  if (profile?.role !== "admin") {
    return <Navigate to="/portal" replace />;
  }

  return <Outlet />;
};

export default AdminOnlyRoute;