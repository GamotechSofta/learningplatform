import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import EditIcon from "../components/EditIcon";
import PageShell from "../components/PageShell";
import { getCategories } from "../services/categoryService";
import { deleteCourse, getCourses } from "../services/courseService";

const formatPrice = (pricing) => {
  if (!pricing) return "—";
  const symbol = pricing.currency === "USD" ? "$" : pricing.currency === "INR" ? "₹" : `${pricing.currency} `;
  if (pricing.lifetime > 0) return `${symbol}${pricing.lifetime}`;
  if (pricing.yearly > 0) return `${symbol}${pricing.yearly}/yr`;
  if (pricing.monthly > 0) return `${symbol}${pricing.monthly}/mo`;
  return "—";
};

export default function Courses() {
  const [categories, setCategories] = useState([]);
  const [courses, setCourses] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCourses = async () => {
    try {
      setLoading(true);
      const params = categoryId ? { category: categoryId } : {};
      const result = await getCourses(params);
      setCourses(result.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadCourses();
  }, [categoryId]);

  useEffect(() => {
    setCourseId("");
  }, [categoryId]);

  const filteredCourses = useMemo(() => {
    if (!courseId) return courses;
    return courses.filter((course) => course._id === courseId);
  }, [courses, courseId]);

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

      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="font-semibold text-slate-900">Filters</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">All categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Course</label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              disabled={loading || courses.length === 0}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50"
            >
              <option value="">All courses</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {(categoryId || courseId) && (
          <button
            type="button"
            onClick={() => {
              setCategoryId("");
              setCourseId("");
            }}
            className="mt-3 text-sm text-blue-600 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

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
                <th className="px-5 py-3 font-medium">Price</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                    {categoryId || courseId
                      ? "No courses match the selected filters."
                      : "No courses yet. Create your first course."}
                  </td>
                </tr>
              ) : (
                filteredCourses.map((course) => (
                  <tr key={course._id} className="border-b border-slate-100 last:border-0">
                    <td className="px-5 py-4 font-medium text-slate-800">{course.title}</td>
                    <td className="px-5 py-4 text-slate-600">{course.category?.name || "—"}</td>
                    <td className="px-5 py-4 capitalize text-slate-600">{course.level}</td>
                    <td className="px-5 py-4 text-slate-600">{formatPrice(course.pricing)}</td>
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
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Link
                          to={`/courses/${course._id}/edit`}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600"
                          title="Edit course"
                        >
                          <EditIcon />
                        </Link>
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
                      </div>
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
