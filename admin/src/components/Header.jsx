import { useLocation, useNavigate } from "react-router-dom";
import { pageTitles } from "../constants/navigation";
import { useAuth } from "../context/AuthContext";

export default function Header({ onMenuClick }) {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const title =
    pageTitles[pathname] ||
    (pathname.includes("/edit") ? "Edit Course" :
    pathname.includes("/curriculum") ? "Course Curriculum" : "Admin");

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Open menu"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-slate-800">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 py-1 pl-1 pr-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
            {user?.name?.charAt(0)?.toUpperCase() || "A"}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-slate-800">{user?.name || "Admin"}</p>
            <p className="text-xs capitalize text-slate-500">{user?.role || "admin"}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
