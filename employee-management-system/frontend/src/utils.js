export function formatDate(value) {
  if (!value) return '—';
  const [y, m, d] = String(value).slice(0, 10).split('-').map(Number);
  if (!y || !m || !d) return value;
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export const toInputDate = (value) => (value ? String(value).slice(0, 10) : '');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[0-9\s-]{7,15}$/;

export function validate(values, departments) {
  const e = {};
  const v = (k) => String(values[k] ?? '').trim();

  if (!v('name')) e.name = 'Employee name is required';
  else if (v('name').length < 2) e.name = 'Name must be at least 2 characters';

  if (!v('email')) e.email = 'Email address is required';
  else if (!EMAIL_RE.test(v('email'))) e.email = 'Enter a valid email address';

  if (!v('phone')) e.phone = 'Phone number is required';
  else if (!PHONE_RE.test(v('phone'))) e.phone = 'Enter a valid phone number (7-15 digits)';

  if (!v('department')) e.department = 'Please select a department';
  else if (departments.length && !departments.includes(v('department')))
    e.department = 'Select a valid department';

  if (!v('position')) e.position = 'Job position is required';

  if (!v('joining_date')) e.joining_date = 'Joining date is required';

  return e;
}
