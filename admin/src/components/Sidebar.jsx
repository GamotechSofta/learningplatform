import { NavLink } from "react-router-dom";
import { mainNavItems, systemNavItems } from "../constants/navigation";
import NavIcon from "./icons/NavIcons";

function NavItem({ item }) {
  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
          isActive
            ? "bg-blue-600 text-white"
            : "text-slate-300 hover:bg-slate-800 hover:text-white"
        }`
      }
    >
      <NavIcon name={item.icon} className="h-5 w-5 shrink-0" />
      <span>{item.label}</span>
    </NavLink>
  );
}

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {isOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-label="Close sidebar"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen max-h-screen w-64 flex-col overflow-hidden bg-[#0f172a] transition-transform duration-200 lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 shrink-0 items-center gap-2 border-b border-slate-700/50 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
            LP
          </div>
          <span className="text-lg font-semibold text-white">Learning Platform</span>
        </div>

        <nav className="sidebar-nav min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 py-4">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Main
          </p>
          <ul className="space-y-1">
            {mainNavItems.map((item) => (
              <li key={item.path}>
                <NavItem item={item} />
              </li>
            ))}
          </ul>

          <p className="mb-2 mt-6 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            System
          </p>
          <ul className="space-y-1">
            {systemNavItems.map((item) => (
              <li key={item.path}>
                <NavItem item={item} />
              </li>
            ))}
          </ul>
        </nav>

        <div className="shrink-0 border-t border-slate-700/50 p-4">
          <div className="rounded-xl bg-slate-800/80 p-4">
            <p className="text-sm font-semibold text-white">Need Help?</p>
            <p className="mt-1 text-xs text-slate-400">
              Contact support for assistance with your admin panel.
            </p>
            <NavLink
              to="/support"
              className="mt-3 inline-block rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500"
            >
              Go to Support
            </NavLink>
          </div>
        </div>
      </aside>
    </>
  );
}
