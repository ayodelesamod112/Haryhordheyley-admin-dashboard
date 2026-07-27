import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Layout/Layout";
import ProtectedRoute from "./Layout/ProtectedRoutes";
import PublicOnlyRoute from "./Layout/PublicOnlyRoute";
import AdminOnlyRoute from "./Layout/AdminOnlyRoute";
import CustomerOnlyRoute from "./Layout/CustomerOnlyRoute";
import CustomerLayout from "./Layout/CustomerLayout";

import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import ForgotPassword from "./Pages/ForgotPassword";
import ResetPassword from "./Pages/ResetPassword";

// Admin pages
import Dashboard from "./Pages/Dashboard";
import Customers from "./Pages/Customers";
import Services from "./Pages/Services";
import Orders from "./Pages/Orders";
import Payments from "./Pages/Payments";
import Users from "./Pages/Users";
import Reports from "./Pages/Reports";
import Notifications from "./Pages/Notifications";
import AdminMessages from "./Pages/AdminMessages";
import Settings from "./Pages/Settings";
import Profile from "./Pages/Profile";
import Receipt from "./Pages/Receipt";

// Customer portal pages
import CustomerDashboard from "./Pages/Customer/CustomerDashboard";
import CustomerHome from "./Pages/Customer/Home";
import CustomerServices from "./Pages/Customer/Services";
import MyOrders from "./Pages/Customer/MyOrders";
import MyPayments from "./Pages/Customer/MyPayments";
import MyReceipts from "./Pages/Customer/MyReceipts";
import CustomerReceipt from "./Pages/Customer/CustomerReceipt";
import CustomerMessages from "./Pages/Customer/Messages";
import CustomerNotifications from "./Pages/Customer/Notifications";
import CustomerAboutUs from "./Pages/Customer/AboutUs";
import ContactUs from "./Pages/Customer/ContactUs";
import FAQ from "./Pages/Customer/FAQ";

import NotFound from "./Pages/NotFound";

function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}

export default App;