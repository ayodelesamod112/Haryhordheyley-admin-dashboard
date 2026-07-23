// import Modal from "./Modal";

// function ConfirmDialog({ title = "Are you sure?", message, confirmLabel = "Delete", danger = true, onConfirm, onCancel, loading = false }) {
//   return (
//     <Modal title={title} onClose={onCancel} width="400px">
//       <p className="confirm-message">{message}</p>
//       <div className="confirm-actions">
//         <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={loading}>
//           Cancel
//         </button>
//         <button
//           type="button"
//           className={`btn ${danger ? "btn-danger" : "btn-primary"}`}
//           onClick={onConfirm}
//           disabled={loading}
//         >
//           {loading ? "Working…" : confirmLabel}
//         </button>
//       </div>
//     </Modal>
//   );
// }

// export default ConfirmDialog;

import Modal from "./Modal";

function ConfirmDialog({ title = "Are you sure?", message, confirmLabel = "Delete", danger = true, onConfirm, onCancel, loading = false }) {
  return (
    <Modal title={title} onClose={onCancel} width="400px">
      <p className="confirm-message">{message}</p>
      <div className="confirm-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
        <button
          type="button"
          className={`btn ${danger ? "btn-danger" : "btn-primary"}`}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? "Working…" : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;