function Loader({ label = "Loading…" }) {
  return (
    <div className="loader-wrap" role="status" aria-live="polite">
      <span className="loader-spinner" />
      <span className="loader-label">{label}</span>
    </div>
  );
}

export default Loader;