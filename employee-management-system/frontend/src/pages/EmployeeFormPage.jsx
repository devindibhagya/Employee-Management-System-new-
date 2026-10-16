import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { toInputDate, validate } from '../utils.js';
import { useToast } from '../components/Toast.jsx';

const EMPTY = { name: '', email: '', phone: '', department: '', position: '', joining_date: '' };

function Field({ label, name, error, children }) {
  return (
    <div className={`field ${error ? 'has-error' : ''}`}>
      <label htmlFor={name}>
        {label} <span className="req" aria-hidden="true">*</span>
      </label>
      {children}
      {error && (
        <p className="field-error" id={`${name}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default function EmployeeFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();

  const [values, setValues] = useState(EMPTY);
  const [departments, setDepartments] = useState([]);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(isEdit);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.departments().then((r) => setDepartments(r.departments)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    api
      .get(id)
      .then((emp) =>
        setValues({
          name: emp.name,
          email: emp.email,
          phone: emp.phone,
          department: emp.department,
          position: emp.position,
          joining_date: toInputDate(emp.joining_date),
        })
      )
      .catch((err) => setLoadError(err.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const onChange = (e) => {
    const { name, value } = e.target;
    const next = { ...values, [name]: value };
    setValues(next);
    if (touched[name] || errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: validate(next, departments)[name] }));
    }
  };

  const onBlur = (e) => {
    const { name } = e.target;
    setTouched((t) => ({ ...t, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validate(values, departments)[name] }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const found = validate(values, departments);
    setErrors(found);
    setTouched(Object.fromEntries(Object.keys(EMPTY).map((k) => [k, true])));
    if (Object.keys(found).length) {
      document.getElementById(Object.keys(found)[0])?.focus();
      return;
    }

    setSaving(true);
    try {
      if (isEdit) {
        await api.update(id, values);
        toast.success('Employee updated successfully');
      } else {
        await api.create(values);
        toast.success('Employee added successfully');
      }
      navigate('/employees');
    } catch (err) {
      if (err.errors && Object.keys(err.errors).length) {
        setErrors(err.errors);
        document.getElementById(Object.keys(err.errors)[0])?.focus();
      } else {
        toast.error(err.message);
      }
    } finally {
      setSaving(false);
    }
  };

  const bind = (name) => ({
    id: name,
    name,
    value: values[name],
    onChange,
    onBlur,
    'aria-invalid': errors[name] ? 'true' : 'false',
    'aria-describedby': errors[name] ? `${name}-error` : undefined,
  });

  return (
    <div className="page page-narrow">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/employees">Employees</Link>
        <span>/</span>
        <span>{isEdit ? 'Edit Employee' : 'Add Employee'}</span>
      </nav>
      <div className="page-head">
        <div>
          <h1>{isEdit ? 'Edit Employee' : 'Add Employee'}</h1>
          <p className="muted">
            {isEdit ? 'Update the details below and save your changes.' : 'Fill in the details to register a new employee.'}
          </p>
        </div>
      </div>

      <section className="card form-card">
        {loadError ? (
          <div className="empty">
            <h3>Couldn't load this employee</h3>
            <p className="muted">{loadError}</p>
            <Link to="/employees" className="btn btn-ghost">Back to list</Link>
          </div>
        ) : loading ? (
          <div className="skeleton-list" aria-busy="true">
            {Array.from({ length: 4 }).map((_, i) => (
              <div className="skeleton-row" key={i}><span className="sk sk-line" /></div>
            ))}
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate>
            <h2 className="form-title">Employee Information</h2>
            <div className="form-grid">
              <Field label="Employee Name" name="name" error={errors.name}>
                <input type="text" placeholder="e.g. Nimal Perera" autoComplete="off" {...bind('name')} />
              </Field>
              <Field label="Email Address" name="email" error={errors.email}>
                <input type="email" placeholder="name@company.com" autoComplete="off" {...bind('email')} />
              </Field>
              <Field label="Phone Number" name="phone" error={errors.phone}>
                <input type="text" inputMode="tel" placeholder="e.g. 0771234567" autoComplete="off" {...bind('phone')} />
              </Field>
              <Field label="Department" name="department" error={errors.department}>
                <select {...bind('department')}>
                  <option value="">Select department</option>
                  {departments.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </Field>
              <Field label="Job Position" name="position" error={errors.position}>
                <input type="text" placeholder="e.g. Software Engineer" autoComplete="off" {...bind('position')} />
              </Field>
              <Field label="Joining Date" name="joining_date" error={errors.joining_date}>
                <input type="date" {...bind('joining_date')} />
              </Field>
            </div>

            <div className="form-actions">
              <Link to="/employees" className="btn btn-ghost">Cancel</Link>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <span className="spinner" /> : isEdit ? 'Update Employee' : 'Save Employee'}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
