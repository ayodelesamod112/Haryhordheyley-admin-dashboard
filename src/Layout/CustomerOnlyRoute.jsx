import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

// Customers use these routes normally. The admin is also allowed through
// (so the admin can preview the customer portal), just nobody else.
const CustomerOnlyRoute = () => {
  const { profile } = useAuth();

  if (profile?.role !== "customer" && profile?.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default CustomerOnlyRoute;