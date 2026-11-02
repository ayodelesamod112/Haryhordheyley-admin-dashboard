function EmptyState({ title = "Nothing here yet", message, actionLabel, onAction }) {
  return (
    <div className="empty-state">
      <h4>{title}</h4>
      {message && <p>{message}</p>}
      {actionLabel && onAction && (
        <button type="button" className="btn btn-primary" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export default EmptyState;