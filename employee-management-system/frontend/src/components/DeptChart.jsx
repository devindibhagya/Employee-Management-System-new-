import { useState } from 'react';

const COLORS = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#6250d6', '#e34948'];

export default function DeptChart({ data }) {
  const [active, setActive] = useState(null);
  const total = data.reduce((sum, d) => sum + d.count, 0);

  if (!total) return <p className="muted">No employees yet.</p>;

  // donut geometry
  const size = 200;
  const r = 78;
  const stroke = 30;
  const c = size / 2;
  const circ = 2 * Math.PI * r;
  const gap = data.length > 1 ? 3 : 0;

  let offset = 0;
  const arcs = data.map((d, i) => {
    const len = (d.count / total) * circ;
    const arc = { ...d, color: COLORS[i % COLORS.length], dash: Math.max(len - gap, 0), offset };
    offset += len;
    return arc;
  });

  const current = active !== null ? arcs[active] : null;

  return (
    <div className="donut-wrap">
      <svg className="donut" viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Employees by department">
        <g transform={`rotate(-90 ${c} ${c})`}>
          {arcs.map((a, i) => (
            <circle
              key={a.department}
              className={`donut-seg ${active !== null && active !== i ? 'dim' : ''}`}
              cx={c}
              cy={c}
              r={r}
              fill="none"
              stroke={a.color}
              strokeWidth={stroke}
              strokeDasharray={`${a.dash} ${circ - a.dash}`}
              strokeDashoffset={-a.offset}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
            />
          ))}
        </g>
        <text className="donut-num" x={c} y={c + 4} textAnchor="middle">
          {current ? current.count : total}
        </text>
        <text className="donut-sub" x={c} y={c + 24} textAnchor="middle">
          {current ? current.department : 'employees'}
        </text>
      </svg>

      <ul className="legend">
        {arcs.map((a, i) => (
          <li
            key={a.department}
            className={active !== null && active !== i ? 'dim' : ''}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
          >
            <span className="swatch" style={{ background: a.color }} />
            <span className="legend-name">{a.department}</span>
            <span className="legend-count">{a.count}</span>
            <span className="legend-pct">{Math.round((a.count / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
