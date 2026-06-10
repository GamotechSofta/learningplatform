import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageShell from "../components/PageShell";
import { deleteCourse, getCourses } from "../services/courseService";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCourses = async () => {
    try {
      setLoading(true);
      const result = await getCourses();
      setCourses(result.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this course?")) return;
    try {
      await deleteCourse(id);
      loadCourses();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete course");
    }
  };

  return (
    <PageShell
      title="Courses"
      breadcrumbs={["Dashboard", "Courses"]}
      action={
        <Link
          to="/courses/upload"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
        >
          + Add New Course
        </Link>
      }
    >
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Loading courses...</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
              <tr>
                <th className="px-5 py-3 font-medium">Course</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Level</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-500">
                    No courses yet. Create your first course.
                  </td>
                </tr>
              ) : (
                courses.map((course) => (
                  <tr key={course._id} className="border-b border-slate-100 last:border-0">
                    <td className="px-5 py-4 font-medium text-slate-800">{course.title}</td>
                    <td className="px-5 py-4 text-slate-600">{course.category?.name || "—"}</td>
                    <td className="px-5 py-4 capitalize text-slate-600">{course.level}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          course.isPublished
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {course.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-5 py-4 space-x-3">
                      <Link
                        to={`/courses/${course._id}/curriculum`}
                        className="text-blue-600 hover:underline"
                      >
                        Curriculum
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(course._id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </PageShell>
  );
}
