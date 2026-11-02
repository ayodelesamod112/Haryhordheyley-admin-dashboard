function RevenueTrendChart({ data }) {
  // data: [{ label: "Mon", value: 1200 }, ...]
  const width = 640;
  const height = 180;
  const padding = 24;
  const max = Math.max(1, ...data.map((d) => d.value));

  const points = data.map((d, i) => {
    const x = padding + (i * (width - padding * 2)) / Math.max(1, data.length - 1);
    const y = height - padding - (d.value / max) * (height - padding * 2);
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1]?.x || padding} ${height - padding} L ${points[0]?.x || padding} ${height - padding} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height + 24}`} className="revenue-trend-svg" preserveAspectRatio="none" width="100%">
      <defs>
        <linearGradient id="revenueFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-yellow)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--color-yellow)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#revenueFade)" />
      <path d={linePath} fill="none" stroke="var(--color-yellow-deep)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="var(--color-black)" stroke="var(--color-yellow)" strokeWidth="2" />
      ))}
      {points.map((p, i) => (
        <text key={`label-${i}`} x={p.x} y={height + 18} textAnchor="middle" className="revenue-trend-label">
          {p.label}
        </text>
      ))}
    </svg>
  );
}

export default RevenueTrendChart;
