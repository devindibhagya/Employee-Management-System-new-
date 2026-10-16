import { IconChevronLeft, IconChevronRight } from './Icons.jsx';

function pageList(page, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, page, page - 1, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out = [];
  sorted.forEach((p, i) => {
    if (i && p - sorted[i - 1] > 1) out.push('…' + p);
    out.push(p);
  });
  return out;
}

export default function Pagination({ page, totalPages, total, limit, onPage }) {
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="pagination">
      <span className="pagination-info">
        Showing {from} to {to} of {total} employee{total === 1 ? '' : 's'}
      </span>
      {totalPages > 1 && (
        <div className="pagination-controls">
          <button className="page-btn" disabled={page === 1} onClick={() => onPage(page - 1)} aria-label="Previous page">
            <IconChevronLeft width={16} height={16} />
          </button>
          {pageList(page, totalPages).map((p) =>
            typeof p === 'string' ? (
              <span key={p} className="page-dots">…</span>
            ) : (
              <button
                key={p}
                className={`page-btn ${p === page ? 'active' : ''}`}
                onClick={() => onPage(p)}
                aria-current={p === page ? 'page' : undefined}
              >
                {p}
              </button>
            )
          )}
          <button
            className="page-btn"
            disabled={page === totalPages}
            onClick={() => onPage(page + 1)}
            aria-label="Next page"
          >
            <IconChevronRight width={16} height={16} />
          </button>
        </div>
      )}
    </div>
  );
}
