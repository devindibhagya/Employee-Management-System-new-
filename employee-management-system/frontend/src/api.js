const BASE = import.meta.env.VITE_API_URL || '/api';

export class ApiError extends Error {
  constructor(message, status, errors = {}) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch {
    throw new ApiError('Cannot reach the server. Is the backend running?', 0);
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(body.message || 'Something went wrong', res.status, body.errors);
  return body;
}

export const api = {
  list: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== '' && v != null)
    ).toString();
    return request(`/employees${qs ? `?${qs}` : ''}`);
  },
  get: (id) => request(`/employees/${id}`),
  create: (data) => request('/employees', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/employees/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => request(`/employees/${id}`, { method: 'DELETE' }),
  departments: () => request('/employees/meta/departments'),
  stats: () => request('/employees/meta/stats'),
};
