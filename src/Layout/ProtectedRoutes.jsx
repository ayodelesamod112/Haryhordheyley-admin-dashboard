import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import Loader from "../Components/UI/Loader";

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: "flex", minHeight: "100svh", alignItems: "center", justifyContent: "center" }}>
        <Loader label="Checking your session…" />
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
