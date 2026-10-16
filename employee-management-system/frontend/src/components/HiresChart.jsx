import { useState } from 'react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// the API only returns months that have hires, so fill the gaps with zeros
function fillMonths(data) {
  if (!data.length) return [];
  const counts = Object.fromEntries(data.map((d) => [d.month, d.count]));
  let [y, m] = data[0].month.split('-').map(Number);
  const [endY, endM] = data[data.length - 1].month.split('-').map(Number);
  const out = [];
  while (y < endY || (y === endY && m <= endM)) {
    const key = `${y}-${String(m).padStart(2, '0')}`;
    out.push({ key, label: MONTHS[m - 1], year: y, count: counts[key] || 0 });
    m++;
    if (m > 12) {
      m = 1;
      y++;
    }
  }
  return out.slice(-12);
}

export default function HiresChart({ data }) {
  const [active, setActive] = useState(null);
  const months = fillMonths(data);

  if (!months.length) return <p className="muted">No hiring data yet.</p>;

  const W = 560;
  const H = 240;
  const pad = { top: 16, right: 12, bottom: 34, left: 30 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;

  const maxCount = Math.max(...months.map((m) => m.count));
  const top = Math.max(4, Math.ceil(maxCount / 2) * 2);
  const ticks = [0, top / 2, top];

  const slot = innerW / months.length;
  const barW = Math.min(34, slot * 0.6);
  const y = (v) => pad.top + innerH - (v / top) * innerH;

  return (
    <div className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Employees hired per month">
        {ticks.map((t) => (
          <g key={t}>
            <line className="chart-grid" x1={pad.left} x2={W - pad.right} y1={y(t)} y2={y(t)} />
            <text className="chart-axis" x={pad.left - 8} y={y(t) + 4} textAnchor="end">
              {t}
            </text>
          </g>
        ))}

        {months.map((m, i) => {
          const x = pad.left + slot * i + (slot - barW) / 2;
          const h = (m.count / top) * innerH;
          const showYear = i === 0 || m.label === 'Jan';
          return (
            <g
              key={m.key}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              tabIndex={0}
              aria-label={`${m.label} ${m.year}: ${m.count} hired`}
            >
              <rect x={pad.left + slot * i} y={pad.top} width={slot} height={innerH} fill="transparent" />
              {m.count > 0 && (
                <rect
                  className={`chart-bar ${active === i ? 'hot' : ''}`}
                  x={x}
                  y={y(m.count)}
                  width={barW}
                  height={h}
                  rx="4"
                />
              )}
              {m.count > 0 && (
                <text className="chart-value" x={x + barW / 2} y={y(m.count) - 6} textAnchor="middle">
                  {m.count}
                </text>
              )}
              <text className="chart-axis" x={x + barW / 2} y={H - 16} textAnchor="middle">
                {m.label}
              </text>
              {showYear && (
                <text className="chart-axis chart-year" x={x + barW / 2} y={H - 3} textAnchor="middle">
                  {m.year}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {active !== null && (
        <div
          className="chart-tip"
          style={{ left: `${((pad.left + slot * active + slot / 2) / W) * 100}%` }}
        >
          <strong>{months[active].label} {months[active].year}</strong>
          <span>{months[active].count} hired</span>
        </div>
      )}
    </div>
  );
}
