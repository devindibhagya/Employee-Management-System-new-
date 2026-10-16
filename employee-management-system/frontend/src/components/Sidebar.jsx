import { NavLink } from 'react-router-dom';
import { IconGrid, IconUsers, IconX } from './Icons.jsx';

export default function Sidebar({ open, onClose }) {
  return (
    <>
      <div className={`scrim ${open ? 'show' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="brand">
          <span className="brand-mark">
            <IconUsers width={20} height={20} />
          </span>
          <div className="brand-text">
            <strong>Employee Management</strong>
            
          </div>
        
        </div>

        <nav className="nav">
          <span className="nav-label">Workspace</span>
          <NavLink to="/employees" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <IconUsers /> Employees
          </NavLink>
          <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <IconGrid /> Dashboard
          </NavLink>
        </nav>

        <div className="sidebar-foot">
          
        </div>
      </aside>
    </>
  );
}
