import { createRootRoute, Outlet, Link } from "@tanstack/react-router";
import { useAuth } from "../hooks/useAuth";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const { user } = useAuth();

  return (
    <div className="app-layout">
      <nav className="navbar">
        <div className="nav-brand">
          <Link to="/" className="brand-link">
            Task Manager
          </Link>
        </div>

        <div className="nav-links">
          <Link to="/" className="nav-link">
            Home
          </Link>
          <Link to="/tasks" className="nav-link">
            Tasks
          </Link>

          {user ? (
            <>
              <Link to="/profile" className="nav-link">
                Profile
              </Link>
              {user.role === "Admin" && (
                <Link to="/admin" className="nav-link admin-link">
                  Admin
                </Link>
              )}
            </>
          ) : (
            <Link to="/login" className="nav-link">
              Login
            </Link>
          )}
        </div>

        {user && (
          <div className="user-info">
            <span className="user-greeting">Hello, {user.displayName}</span>
            <span className={`user-role role-${user.role.toLowerCase()}`}>
              {user.role}
            </span>
          </div>
        )}
      </nav>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
