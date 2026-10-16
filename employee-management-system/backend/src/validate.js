const DEPARTMENTS = [
  'IT',
  'HR',
  'Finance',
  'Marketing',
  'Sales',
  'Operations',
  'Customer Support',
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[0-9\s-]{7,15}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function validateEmployee(body = {}) {
  const errors = {};
  const data = {
    name: String(body.name ?? '').trim(),
    email: String(body.email ?? '').trim().toLowerCase(),
    phone: String(body.phone ?? '').trim(),
    department: String(body.department ?? '').trim(),
    position: String(body.position ?? '').trim(),
    joining_date: String(body.joining_date ?? '').trim(),
  };

  if (!data.name) errors.name = 'Employee name is required';
  else if (data.name.length < 2) errors.name = 'Name must be at least 2 characters';
  else if (data.name.length > 100) errors.name = 'Name must be 100 characters or fewer';

  if (!data.email) errors.email = 'Email address is required';
  else if (!EMAIL_RE.test(data.email)) errors.email = 'Enter a valid email address';
  else if (data.email.length > 150) errors.email = 'Email must be 150 characters or fewer';

  if (!data.phone) errors.phone = 'Phone number is required';
  else if (!PHONE_RE.test(data.phone)) errors.phone = 'Enter a valid phone number (7-15 digits)';

  if (!data.department) errors.department = 'Department is required';
  else if (!DEPARTMENTS.includes(data.department)) errors.department = 'Select a valid department';

  if (!data.position) errors.position = 'Job position is required';
  else if (data.position.length > 100) errors.position = 'Position must be 100 characters or fewer';

  if (!data.joining_date) errors.joining_date = 'Joining date is required';
  else if (!DATE_RE.test(data.joining_date) || Number.isNaN(Date.parse(data.joining_date)))
    errors.joining_date = 'Enter a valid date';

  return { errors, data };
}

module.exports = { validateEmployee, DEPARTMENTS };
