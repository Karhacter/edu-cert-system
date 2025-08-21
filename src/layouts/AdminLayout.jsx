import { Outlet, NavLink } from "react-router-dom";
import adminService from "../services/adminService";

const AdminLayout = () => {
  const handleLogout = () => {
    adminService.logout();
    window.location.href = "/admin/login";
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <header className="bg-[var(--card-bg)] border-b border-[var(--border-color)]">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <nav className="flex items-center gap-4">
            <NavLink
              to="/admin"
              end
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/admin/register"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              Register
            </NavLink>
            <NavLink
              to="/admin/employees"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              Employees
            </NavLink>
            <NavLink
              to="/admin/organizations"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              Organizations
            </NavLink>
            <NavLink
              to="/admin/lookup"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              Lookup
            </NavLink>
            <button onClick={handleLogout} className="btn btn-outline">
              Logout
            </button>
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
