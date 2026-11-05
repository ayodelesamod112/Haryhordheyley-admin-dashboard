import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Layout/Layout";
import ProtectedRoute from "./Layout/ProtectedRoutes";
import PublicOnlyRoute from "./Layout/PublicOnlyRoute";
import AdminOnlyRoute from "./Layout/AdminOnlyRoute";
import CustomerOnlyRoute from "./Layout/CustomerOnlyRoute";
import CustomerLayout from "./Layout/CustomerLayout";

const Login = lazy(() => import("./Pages/Login"));
const Signup = lazy(() => import("./Pages/Signup"));
const ForgotPassword = lazy(() => import("./Pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./Pages/ResetPassword"));

// Admin pages
const Dashboard = lazy(() => import("./Pages/Dashboard"));
const Customers = lazy(() => import("./Pages/Customers"));
const Services = lazy(() => import("./Pages/Services"));
const Orders = lazy(() => import("./Pages/Orders"));
const Payments = lazy(() => import("./Pages/Payments"));
const Users = lazy(() => import("./Pages/Users"));
const Reports = lazy(() => import("./Pages/Reports"));
const Notifications = lazy(() => import("./Pages/Notifications"));
const AdminMessages = lazy(() => import("./Pages/AdminMessages"));
const Settings = lazy(() => import("./Pages/Settings"));
const Profile = lazy(() => import("./Pages/Profile"));
const Receipt = lazy(() => import("./Pages/Receipt"));

// Customer portal pages
const CustomerDashboard = lazy(() => import("./Pages/Customer/CustomerDashboard"));
const CustomerHome = lazy(() => import("./Pages/Customer/Home"));
const CustomerServices = lazy(() => import("./Pages/Customer/Services"));
const MyOrders = lazy(() => import("./Pages/Customer/MyOrders"));
const MyPayments = lazy(() => import("./Pages/Customer/MyPayments"));
const MyReceipts = lazy(() => import("./Pages/Customer/MyReceipts"));
const CustomerReceipt = lazy(() => import("./Pages/Customer/CustomerReceipt"));
const CustomerMessages = lazy(() => import("./Pages/Customer/Messages"));
const CustomerNotifications = lazy(() => import("./Pages/Customer/Notifications"));
const CustomerAboutUs = lazy(() => import("./Pages/Customer/AboutUs"));
const ContactUs = lazy(() => import("./Pages/Customer/ContactUs"));
const FAQ = lazy(() => import("./Pages/Customer/FAQ"));

const NotFound = lazy(() => import("./Pages/NotFound"));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="route-loading" role="status">Loading page…</div>}>
      <Routes>
        {/* Public — redirects to the right area if already logged in */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* Reset password must work even while "logged in" via the recovery link */}
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Everything below requires SOME account, admin or customer */}
        <Route element={<ProtectedRoute />}>
          {/* Receipts have no sidebar/navbar chrome, for clean printing */}
          <Route element={<AdminOnlyRoute />}>
            <Route path="/orders/:id/receipt" element={<Receipt />} />
          </Route>
          <Route element={<CustomerOnlyRoute />}>
            <Route path="/portal/receipts/:id" element={<CustomerReceipt />} />
          </Route>

          {/* ================= ADMIN AREA ================= */}
          <Route element={<AdminOnlyRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/services" element={<Services />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/users" element={<Users />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/messages" element={<AdminMessages />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Route>

          {/* ================= CUSTOMER PORTAL ================= */}
          <Route element={<CustomerOnlyRoute />}>
            <Route element={<CustomerLayout />}>
              <Route path="/portal" element={<CustomerDashboard />} />
              <Route path="/portal/home" element={<CustomerHome />} />
              <Route path="/portal/services" element={<CustomerServices />} />
              <Route path="/portal/orders" element={<MyOrders />} />
              <Route path="/portal/payments" element={<MyPayments />} />
              <Route path="/portal/receipts" element={<MyReceipts />} />
              <Route path="/portal/messages" element={<CustomerMessages />} />
              <Route path="/portal/notifications" element={<CustomerNotifications />} />
              <Route path="/portal/profile" element={<Profile />} />
              <Route path="/portal/about" element={<CustomerAboutUs />} />
              <Route path="/portal/contact" element={<ContactUs />} />
              <Route path="/portal/faq" element={<FAQ />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
