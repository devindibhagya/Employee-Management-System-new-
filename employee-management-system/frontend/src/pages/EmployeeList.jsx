import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { formatDate } from '../utils.js';
import useDebounce from '../hooks/useDebounce.js';
import Avatar from '../components/Avatar.jsx';
import Pagination from '../components/Pagination.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import { useToast } from '../components/Toast.jsx';
import {
  IconArrowDown,
  IconArrowUp,
  IconEdit,
  IconInbox,
  IconPlus,
  IconSearch,
  IconTrash,
  IconX,
} from '../components/Icons.jsx';

const LIMIT = 8;

export default function EmployeeList() {
  const toast = useToast();
  const navigate = useNavigate();
  const searchRef = useRef(null);

  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: LIMIT });
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(1);

  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    api.departments().then((r) => setDepartments(r.departments)).catch(() => {});
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.list({
        search: debouncedSearch,
        department,
        sortBy,
        order,
        page,
        limit: LIMIT,
      });
      setRows(res.data);
      setPagination(res.pagination);
      if (res.data.length === 0 && page > 1) setPage(res.pagination.totalPages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, department, sortBy, order, page]);

  useEffect(() => {
    load();
  }, [load]);

  const changeFilter = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  const toggleSort = (column) => {
    if (sortBy === column) setOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    else {
      setSortBy(column);
      setOrder('asc');
    }
    setPage(1);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await api.remove(toDelete.id);
      toast.success(`${toDelete.name} was deleted`);
      setToDelete(null);
      await load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const hasFilters = debouncedSearch || department !== 'all';
  const clearFilters = () => {
    setSearch('');
    setDepartment('all');
    setPage(1);
  };

  const SortHead = ({ column, children }) => (
    <th aria-sort={sortBy === column ? (order === 'asc' ? 'ascending' : 'descending') : 'none'}>
      <button className={`sort-btn ${sortBy === column ? 'active' : ''}`} onClick={() => toggleSort(column)}>
        {children}
        {sortBy === column && (order === 'asc' ? <IconArrowUp width={14} height={14} /> : <IconArrowDown width={14} height={14} />)}
      </button>
    </th>
  );

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Employees</h1>
          <p className="muted">Manage your employee information</p>
        </div>
        <Link to="/employees/new" className="btn btn-primary">
          <IconPlus width={18} height={18} /> Add Employee
        </Link>
      </div>

      <section className="card">
        <div className="toolbar">
          <label className="search">
            <IconSearch width={18} height={18} />
            <input
              ref={searchRef}
              type="search"
              placeholder="Search by name, email or position…"
              value={search}
              onChange={(e) => changeFilter(setSearch)(e.target.value)}
              aria-label="Search employees"
            />
            {search && (
              <button className="search-clear" onClick={() => changeFilter(setSearch)('')} aria-label="Clear search">
                <IconX width={14} height={14} />
              </button>
            )}
          </label>
          <select
            className="select"
            value={department}
            onChange={(e) => changeFilter(setDepartment)(e.target.value)}
            aria-label="Filter by department"
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {error ? (
          <div className="empty">
            <span className="empty-icon danger"><IconInbox width={30} height={30} /></span>
            <h3>Couldn't load employees</h3>
            <p className="muted">{error}</p>
            <button className="btn btn-ghost" onClick={load}>Try again</button>
          </div>
        ) : loading && rows.length === 0 ? (
          <div className="skeleton-list" aria-busy="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <div className="skeleton-row" key={i}>
                <span className="sk sk-circle" />
                <span className="sk sk-line" />
                <span className="sk sk-line short" />
              </div>
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="empty">
            <span className="empty-icon"><IconInbox width={30} height={30} /></span>
            <h3>{hasFilters ? 'No matching employees' : 'No employees yet'}</h3>
            <p className="muted">
              {hasFilters
                ? 'Try adjusting your search or department filter.'
                : 'Get started by adding your first employee record.'}
            </p>
            {hasFilters ? (
              <button className="btn btn-ghost" onClick={clearFilters}>Clear filters</button>
            ) : (
              <Link to="/employees/new" className="btn btn-primary">
                <IconPlus width={18} height={18} /> Add Employee
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className={`table-wrap ${loading ? 'is-loading' : ''}`}>
              <table className="table">
                <thead>
                  <tr>
                    <SortHead column="name">Name</SortHead>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Department</th>
                    <th>Position</th>
                    <SortHead column="joining_date">Joined</SortHead>
                    <th className="actions-col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((emp) => (
                    <tr key={emp.id}>
                      <td data-label="Name">
                        <div className="person">
                          <Avatar name={emp.name} />
                          <strong>{emp.name}</strong>
                        </div>
                      </td>
                      <td data-label="Email" className="cell-muted">{emp.email}</td>
                      <td data-label="Phone" className="cell-muted">{emp.phone}</td>
                      <td data-label="Department">
                        <span className={`badge dept-${emp.department.toLowerCase().replace(/\s+/g, '-')}`}>
                          {emp.department}
                        </span>
                      </td>
                      <td data-label="Position">{emp.position}</td>
                      <td data-label="Joined" className="cell-muted">{formatDate(emp.joining_date)}</td>
                      <td className="actions-col" data-label="Actions">
                        <div className="row-actions">
                          <button
                            className="icon-action edit"
                            onClick={() => navigate(`/employees/${emp.id}/edit`)}
                            aria-label={`Edit ${emp.name}`}
                            title="Edit"
                          >
                            <IconEdit width={16} height={16} />
                          </button>
                          <button
                            className="icon-action delete"
                            onClick={() => setToDelete(emp)}
                            aria-label={`Delete ${emp.name}`}
                            title="Delete"
                          >
                            <IconTrash width={16} height={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination {...pagination} onPage={setPage} />
          </>
        )}
      </section>

      {toDelete && (
        <ConfirmModal
          employee={toDelete}
          busy={deleting}
          onCancel={() => setToDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}
