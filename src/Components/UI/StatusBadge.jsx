const TONE_MAP = {
  active: "success",
  completed: "success",
  paid: "success",
  success: "success",
  approved: "success",
  pending: "warning",
  processing: "warning",
  partial: "warning",
  inactive: "neutral",
  cancelled: "danger",
  failed: "danger",
  unpaid: "danger",
  suspended: "danger",
};

function StatusBadge({ status }) {
  const tone = TONE_MAP[String(status).toLowerCase()] || "neutral";
  const label = String(status).replace(/_/g, " ");
  return <span className={`badge badge-${tone}`}>{label}</span>;
}

export default StatusBadge;