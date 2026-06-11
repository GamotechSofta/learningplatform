import { useEffect, useMemo, useState } from "react";
import { getCategories } from "../services/categoryService";
import { getCourses, getCoursesVideoCounts } from "../services/courseService";
import { getUsers } from "../services/userService";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    categories: 0,
    courses: 0,
    videos: 0,
    publishedCourses: 0,
    students: 0,
    instructors: 0,
    users: 0,
  });
  const [courseVideos, setCourseVideos] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [categoriesRes, coursesRes, videoCountsRes, users] = await Promise.all([
          getCategories(),
          getCourses(),
          getCoursesVideoCounts(),
          user.role === "admin" ? getUsers() : Promise.resolve([]),
        ]);

        const students = users.filter((u) => u.role === "student").length;
        const instructors = users.filter((u) => u.role === "instructor").length;
        const courses = videoCountsRes.data || [];

        setStats({
          categories: categoriesRes.count || categoriesRes.data?.length || 0,
          courses: coursesRes.count || coursesRes.data?.length || 0,
          videos: videoCountsRes.totalVideos || 0,
          publishedCourses: courses.filter((c) => c.isPublished).length,
          students,
          instructors,
          users: users.length,
        });
        setCourseVideos(courses);
      } catch {
        // keep defaults on error
      } finally {
        setLoadingCourses(false);
      }
    };

    loadStats();
  }, [user.role]);

  const sortedCourseVideos = useMemo(
    () => [...courseVideos].sort((a, b) => b.videosCount - a.videosCount),
    [courseVideos]
  );

  const contentCards = [
    { label: "Categories", value: stats.categories, color: "bg-cyan-500" },
    { label: "Courses", value: stats.courses, color: "bg-blue-500" },
    { label: "Total Videos", value: stats.videos, color: "bg-rose-500" },
    { label: "Published Courses", value: stats.publishedCourses, color: "bg-indigo-500" },
  ];

  const userCards =
    user.role === "admin"
      ? [
          { label: "Students", value: stats.students, color: "bg-emerald-500" },
          { label: "Instructors", value: stats.instructors, color: "bg-violet-500" },
          { label: "Total Users", value: stats.users, color: "bg-amber-500" },
        ]
      : [];

  return (
    <div className="w-full space-y-6">
      <p className="text-sm text-slate-600">
        Welcome back, {user?.name}. You are logged in as{" "}
        <span className="capitalize">{user?.role}</span>.
      </p>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Platform Overview
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {contentCards.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <span className={`h-2.5 w-2.5 rounded-full ${stat.color}`} />
              </div>
              <p className="mt-2 text-3xl font-bold text-slate-900">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {userCards.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Users
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {userCards.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  <span className={`h-2.5 w-2.5 rounded-full ${stat.color}`} />
                </div>
                <p className="mt-2 text-3xl font-bold text-slate-900">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="font-semibold text-slate-900">Videos per Course</h3>
          <p className="text-sm text-slate-500">
            Sorted by video count — highest first
          </p>
        </div>

        {loadingCourses ? (
          <p className="p-5 text-sm text-slate-500">Loading course video counts...</p>
        ) : sortedCourseVideos.length === 0 ? (
          <p className="p-5 text-sm text-slate-500">No courses found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">#</th>
                  <th className="px-5 py-3 font-semibold">Course</th>
                  <th className="px-5 py-3 font-semibold">Category</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 text-right font-semibold">Videos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedCourseVideos.map((course, index) => (
                  <tr key={course._id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 text-slate-400">{index + 1}</td>
                    <td className="px-5 py-4 font-medium text-slate-800">{course.title}</td>
                    <td className="px-5 py-4 text-slate-500">
                      {course.category?.name || "Uncategorized"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          course.isPublished
                            ? "bg-blue-100 text-blue-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {course.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="inline-flex min-w-[4.5rem] justify-center rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
                        {course.videosCount}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
