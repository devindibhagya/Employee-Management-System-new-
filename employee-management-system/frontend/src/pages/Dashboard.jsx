import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { formatDate } from '../utils.js';
import Avatar from '../components/Avatar.jsx';
import HiresChart from '../components/HiresChart.jsx';
import DeptChart from '../components/DeptChart.jsx';
import { IconBuilding, IconPlus, IconTrend, IconUsers } from '../components/Icons.jsx';

function Stat({ icon, label, value, tone }) {
  return (
    <div className={`stat tone-${tone}`}>
      <span className="stat-icon">{icon}</span>
      <div>
        <p className="stat-label">{label}</p>
        <p className="stat-value">{value}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.stats().then(setStats).catch((e) => setError(e.message));
  }, []);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Dashboard</h1>
          <p className="muted">A quick overview of your workforce</p>
        </div>
        <Link to="/employees/new" className="btn btn-primary">
          <IconPlus width={18} height={18} /> Add Employee
        </Link>
      </div>

      {error ? (
        <section className="card"><div className="empty"><h3>Couldn't load stats</h3><p className="muted">{error}</p></div></section>
      ) : !stats ? (
        <div className="stat-grid">
          {[0, 1, 2].map((i) => <div key={i} className="stat sk-block" />)}
        </div>
      ) : (
        <>
          <div className="stat-grid">
            <Stat tone="indigo" icon={<IconUsers />} label="Total employees" value={stats.total} />
            <Stat tone="emerald" icon={<IconTrend />} label="Joined last 90 days" value={stats.recent} />
            <Stat tone="amber" icon={<IconBuilding />} label="Departments" value={stats.departments} />
          </div>

          <div className="dash-grid">
            <section className="card pad">
              <h2 className="card-title">Employees by department</h2>
              <DeptChart data={stats.byDepartment} />
            </section>

            <section className="card pad">
              <h2 className="card-title">Hires per month</h2>
              <HiresChart data={stats.monthly} />
            </section>
          </div>

          <div className="dash-grid single">
            <section className="card pad">
              <h2 className="card-title">Recently added</h2>
              {stats.latest.length === 0 ? (
                <p className="muted">No employees yet.</p>
              ) : (
                <ul className="recent">
                  {stats.latest.map((e) => (
                    <li key={e.id}>
                      <Avatar name={e.name} />
                      <div>
                        <strong>{e.name}</strong>
                        <small>{e.position} · {e.department}</small>
                      </div>
                      <time>{formatDate(e.joining_date)}</time>
                    </li>
                  ))}
                </ul>
              )}
              <Link to="/employees" className="link-more">View all employees →</Link>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
