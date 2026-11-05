import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { LuPlus, LuX } from "react-icons/lu";
import { supabase } from "../../supabase/supabaseClient";
import { useAuth } from "../../Context/AuthContext";
import { useToast } from "../../Context/ToastContext";
import Modal from "../../Components/UI/Modal";
import ConfirmDialog from "../../Components/UI/ConfirmDialog";
import StatusBadge from "../../Components/UI/StatusBadge";
import Loader from "../../Components/UI/Loader";
import EmptyState from "../../Components/UI/EmptyState";
import { CUSTOMER_SERVICE_CATALOG } from "../../data/customerServices";
import "../../Styles/CustomerPortal.css";

const STATUS_STEPS = ["pending", "processing", "completed"];

function MyOrders() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [orders, setOrders] = useState([]);
  const [servicesList, setServicesList] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ serviceId: "", requestedService: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const currency = (n) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n || 0);
  const serviceChoices = [...new Set([...CUSTOMER_SERVICE_CATALOG.map((service) => service.name), ...servicesList.map((service) => service.name)])];
  const requestedServiceIsKnown = serviceChoices.some((name) => name.toLowerCase() === form.requestedService.trim().toLowerCase());
  const requestedServiceIsOrderable = servicesList.some((service) => service.name.toLowerCase() === form.requestedService.trim().toLowerCase());

  const loadOrders = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("orders")
      .select("*, services(name, price)")
      .eq("placed_by", user.id)
      .order("created_at", { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    loadOrders();
    const loadServices = async () => {
      setServicesLoading(true);
      const { data, error } = await supabase
        .from("services")
        .select("id, name, price")
        .eq("status", "active")
        .order("name");
      if (!mounted) return;
      setServicesList(data || []);
      setServicesError(error?.message || "");
      setServicesLoading(false);
    };
    loadServices();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    const preselectId = searchParams.get("serviceId");
    const preselectName = searchParams.get("service");
    if (preselectId || preselectName) {
      const match = servicesList.find((service) => service.id === preselectId)
        || servicesList.find((service) => service.name.toLowerCase() === (preselectName || "").toLowerCase());
      setForm((current) => ({
        ...current,
        serviceId: match?.id || preselectId || "",
        requestedService: match?.name || preselectName || current.requestedService,
      }));
      setModalOpen(true);
    }
  }, [searchParams, servicesList]);

  const closeModal = () => {
    setModalOpen(false);
    setFormError("");
    setForm({ serviceId: "", requestedService: "", notes: "" });
    searchParams.delete("serviceId");
    searchParams.delete("service");
    setSearchParams(searchParams, { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.requestedService.trim()) {
      setFormError("Type or select the service you need.");
      return;
    }
    const service = servicesList.find((s) => s.id === form.serviceId)
      || servicesList.find((s) => s.name.toLowerCase() === form.requestedService.trim().toLowerCase());
    setSaving(true);
    setFormError("");

    if (!service) {
      const body = `Custom service request: ${form.requestedService.trim()}${form.notes.trim() ? `\n\nDetails: ${form.notes.trim()}` : ""}`;
      const { error } = await supabase.from("messages").insert({ customer_id: user.id, sender_id: user.id, body });
      setSaving(false);
      if (error) {
        setFormError(error.message);
        return;
      }
      showToast("Service request sent to our team. You can follow up in Messages.");
      closeModal();
      return;
    }

    const { error } = await supabase.from("orders").insert({
      service_id: form.serviceId,
      placed_by: user.id,
      amount: service.price,
      notes: form.notes || null,
      order_status: "pending",
      payment_status: "unpaid",
      order_date: new Date().toISOString().slice(0, 10),
    });

    setSaving(false);

    if (error) {
      setFormError(error.message);
      return;
    }

    showToast("Order placed! We'll get started soon.");
    closeModal();
    loadOrders();
  };

  const handleCancel = async () => {
    setCancelling(true);
    const { error } = await supabase.rpc("cancel_customer_order", { p_order_id: cancelTarget.id });
    setCancelling(false);
    if (error) {
      showToast(error.message, "error");
      return;
    }
    showToast("Order cancelled");
    setCancelTarget(null);
    loadOrders();
  };

  return (
    <div className="portal-page">
      <div className="portal-page-head">
        <span className="eyebrow">Track your orders</span>
        <h1>My Orders</h1>
        <p>Everything you've ordered from us, and where it stands.</p>
      </div>

      <button type="button" className="btn btn-primary" style={{ marginBottom: 20 }} onClick={() => setModalOpen(true)}>
        <LuPlus size={16} /> Place New Order
      </button>

      {loading ? (
        <Loader label="Loading your orders…" />
      ) : orders.length === 0 ? (
        <EmptyState title="No orders yet" message="Place your first order to get started." actionLabel="Browse Services" onAction={() => setModalOpen(true)} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {orders.map((o) => {
            const status = o.order_status || o.status;
            const currentStepIndex = STATUS_STEPS.indexOf(status);
            return (
              <div className="portal-card" key={o.id}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                  <div>
                    <h3 style={{ fontSize: 15, marginBottom: 4 }}>{o.services?.name || "Service"}</h3>
                    <p style={{ fontSize: 13 }}>{currency(o.amount)} · {new Date(o.created_at).toLocaleDateString()}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <StatusBadge status={status} />
                    {status === "pending" && (
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setCancelTarget(o)}>
                        <LuX size={13} /> Cancel
                      </button>
                    )}
                  </div>
                </div>
                {status !== "cancelled" && (
                  <div className="order-status-track">
                    {STATUS_STEPS.map((step, i) => (
                      <span key={step} className={`order-status-step ${i <= currentStepIndex ? "done" : ""}`}>{step}</span>
                    ))}
                  </div>
                )}
                {o.notes && <p style={{ fontSize: 12, marginTop: 10 }}>Note: {o.notes}</p>}
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <Modal title="Place New Order" onClose={closeModal}>
          <form onSubmit={handleSubmit}>
            {formError && <div className="form-error-banner">{formError}</div>}
            <div className="form-field full">
              <label>Service</label>
              <input
                type="text"
                list="customer-service-options"
                value={form.requestedService}
                onChange={(e) => {
                  const requestedService = e.target.value;
                  const match = servicesList.find((s) => s.name.toLowerCase() === requestedService.trim().toLowerCase());
                  setForm({ ...form, requestedService, serviceId: match?.id || "" });
                }}
                placeholder={servicesLoading ? "Loading services..." : "Search or type a service"}
                autoComplete="off"
                required
              />
              <datalist id="customer-service-options">
                {serviceChoices.map((name) => {
                  const savedService = servicesList.find((service) => service.name.toLowerCase() === name.toLowerCase());
                  return <option key={name} value={name} label={savedService ? currency(savedService.price) : "Request from our team"} />;
                })}
              </datalist>
              {form.requestedService.trim() && !requestedServiceIsOrderable && (
                <small className="service-request-hint">
                  {requestedServiceIsKnown
                    ? "This service is listed and can be requested; direct ordering has not been set up yet."
                    : "Service not available in the list. You can still send it as a request to our team."}
                </small>
              )}
              {servicesError && (
                <div className="form-error-banner" role="alert">
                  Could not load services: {servicesError}
                </div>
              )}
            </div>
            <div className="form-field full">
              <label>Notes (optional)</label>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Anything specific we should know?" />
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Sending…" : requestedServiceIsOrderable ? "Place Order" : "Send Service Request"}</button>
            </div>
          </form>
        </Modal>
      )}

      {cancelTarget && (
        <ConfirmDialog
          message="Cancel this order? This can't be undone."
          confirmLabel="Cancel Order"
          onConfirm={handleCancel}
          onCancel={() => setCancelTarget(null)}
          loading={cancelling}
        />
      )}
    </div>
  );
}

export default MyOrders;
