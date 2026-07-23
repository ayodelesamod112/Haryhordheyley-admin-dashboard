import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

// Keeps a logged-in admin from seeing Login/Signup again
const PublicOnlyRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
};

export default PublicOnlyRoute;
