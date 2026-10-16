import { useEffect, useRef } from 'react';
import { IconAlert } from './Icons.jsx';

export default function ConfirmModal({ employee, busy, onCancel, onConfirm }) {
  const cancelRef = useRef(null);

  useEffect(() => {
    cancelRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && !busy && onCancel();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [busy, onCancel]);

  return (
    <div className="modal-backdrop" onMouseDown={() => !busy && onCancel()}>
      <div
        className="modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="del-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <span className="modal-icon">
          <IconAlert width={26} height={26} />
        </span>
        <h3 id="del-title">Delete Employee</h3>
        <p>Are you sure you want to delete this employee?</p>
        <p className="modal-name">{employee.name}</p>
        <p className="modal-warn">This action cannot be undone.</p>
        <div className="modal-actions">
          <button ref={cancelRef} className="btn btn-ghost" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={busy}>
            {busy ? <span className="spinner" /> : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
