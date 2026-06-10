import { useEffect, useState } from "react";
import { getCategories } from "../services/categoryService";
import { getCourses } from "../services/courseService";
import { getUsers } from "../services/userService";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    categories: 0,
    courses: 0,
    students: 0,
    instructors: 0,
    users: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [categoriesRes, coursesRes, users] = await Promise.all([
          getCategories(),
          getCourses(),
          user.role === "admin" ? getUsers() : Promise.resolve([]),
        ]);

        const students = users.filter((u) => u.role === "student").length;
        const instructors = users.filter((u) => u.role === "instructor").length;

        setStats({
          categories: categoriesRes.count || categoriesRes.data?.length || 0,
          courses: coursesRes.count || coursesRes.data?.length || 0,
          students,
          instructors,
          users: users.length,
        });
      } catch {
        // keep defaults on error
      }
    };

    loadStats();
  }, [user.role]);

  const cards = [
    { label: "Total Categories", value: stats.categories, color: "bg-cyan-500" },
    { label: "Total Courses", value: stats.courses, color: "bg-blue-500" },
    { label: "Total Students", value: stats.students, color: "bg-emerald-500" },
    { label: "Instructors", value: stats.instructors, color: "bg-violet-500" },
    { label: "Total Users", value: stats.users, color: "bg-amber-500" },
  ];

  return (
    <div>
      <p className="mb-6 text-sm text-slate-600">
        Welcome back, {user?.name}. You are logged in as <span className="capitalize">{user?.role}</span>.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">{stat.label}</p>
              <span className={`h-2.5 w-2.5 rounded-full ${stat.color}`} />
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
