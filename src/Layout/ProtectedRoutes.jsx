// import { Navigate, Outlet } from "react-router-dom";
// import { useAuth } from "../Context/AuthContext";
// import Loader from "../Components/UI/Loader";

// const ProtectedRoute = () => {
//   const { isAuthenticated, loading } = useAuth();

//   if (loading) {
//     return (
//       <div style={{ display: "flex", minHeight: "100svh", alignItems: "center", justifyContent: "center" }}>
//         <Loader label="Checking your session…" />
//       </div>
//     );
//   }

//   return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
// };

// export default ProtectedRoute;
// import { Navigate, Outlet } from "react-router-dom";
// import { useAuth } from "../Context/AuthContext";
// import Loader from "../Components/UI/Loader";
// import PendingApproval from "../Pages/PendingApproval";

// const ProtectedRoute = () => {
//   const { isAuthenticated, loading, profile } = useAuth();

//   if (loading) {
//     return (
//       <div style={{ display: "flex", minHeight: "100svh", alignItems: "center", justifyContent: "center" }}>
//         <Loader label="Checking your session…" />
//       </div>
//     );
//   }

//   if (!isAuthenticated) {
//     return <Navigate to="/login" replace />;
//   }

//   // Profile hasn't loaded yet (brief moment right after login) — wait rather than flash the wrong screen
//   if (!profile) {
//     return (
//       <div style={{ display: "flex", minHeight: "100svh", alignItems: "center", justifyContent: "center" }}>
//         <Loader label="Loading your account…" />
//       </div>
//     );
//   }

//   if (profile.status === "pending") {
//     return <PendingApproval />;
//   }

//   if (profile.status === "suspended") {
//     return <Navigate to="/login" replace />;
//   }

//   return <Outlet />;
// };

// export default ProtectedRoute;


import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import Loader from "../Components/UI/Loader";

// Just checks that someone is logged in at all. Which pages they can
// actually see beyond that is handled by AdminOnlyRoute / CustomerOnlyRoute.
const ProtectedRoute = () => {
  const { isAuthenticated, loading, profile } = useAuth();

  if (loading) {
    return (
      <div style={{ display: "flex", minHeight: "100svh", alignItems: "center", justifyContent: "center" }}>
        <Loader label="Checking your session…" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Profile hasn't finished loading yet (brief moment right after login)
  if (!profile) {
    return (
      <div style={{ display: "flex", minHeight: "100svh", alignItems: "center", justifyContent: "center" }}>
        <Loader label="Loading your account…" />
      </div>
    );
  }

  if (profile.status === "suspended") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;