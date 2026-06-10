import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell";
import LessonDetailModal from "../components/LessonDetailModal";
import ViewUploadTabs from "../components/ViewUploadTabs";
import { getCategories, getCoursesByCategory } from "../services/categoryService";
import { createLesson, deleteLesson, getLessonWithVideos, getLessonsByCourse } from "../services/lessonService";

export default function Lessons() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("view");
  const [categories, setCategories] = useState([]);
  const [courses, setCourses] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [lessons, setLessons] = useState([]);
  const [viewingLesson, setViewingLesson] = useState(null);
  const [loading, setLoading] = useState({ categories: true, courses: false, lessons: false });
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    isFree: false,
    isPublished: false,
  });

  const selectedCategory = categories.find((c) => c._id === categoryId);
  const selectedCourse = courses.find((c) => c._id === selectedCourseId);

  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res.data))
      .catch((err) => setError(err.response?.data?.message || "Failed to load categories"))
      .finally(() => setLoading((p) => ({ ...p, categories: false })));
  }, []);

  useEffect(() => {
    if (!categoryId) {
      setCourses([]);
      setSelectedCourseId("");
      return;
    }

    setLoading((p) => ({ ...p, courses: true }));
    getCoursesByCategory(categoryId)
      .then((data) => {
        setCourses(data);
        setSelectedCourseId(data[0]?._id || "");
      })
      .catch((err) => setError(err.response?.data?.message || "Failed to load courses"))
      .finally(() => setLoading((p) => ({ ...p, courses: false })));
  }, [categoryId]);

  const loadLessons = async (courseId) => {
    if (!courseId) {
      setLessons([]);
      return;
    }
    try {
      setLoading((p) => ({ ...p, lessons: true }));
      const data = await getLessonsByCourse(courseId);
      setLessons(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load lessons");
    } finally {
      setLoading((p) => ({ ...p, lessons: false }));
    }
  };

  useEffect(() => {
    if (selectedCourseId) {
      loadLessons(selectedCourseId);
    }
  }, [selectedCourseId]);

  const handleViewLesson = async (lessonId) => {
    try {
      setLoadingDetail(true);
      const lesson = await getLessonWithVideos(lessonId);
      setViewingLesson(lesson);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load lesson details");
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCourseId) return;

    setSubmitting(true);
    setError("");
    try {
      await createLesson({
        course: selectedCourseId,
        title: form.title,
        description: form.description,
        order: lessons.length,
        isFree: form.isFree,
        isPublished: form.isPublished,
      });
      setForm({ title: "", description: "", isFree: false, isPublished: false });
      loadLessons(selectedCourseId);
      setActiveTab("view");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create lesson");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this lesson?")) return;
    try {
      await deleteLesson(id);
      loadLessons(selectedCourseId);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete lesson");
    }
  };

  const locationSelector = (
    <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="font-semibold text-slate-900">Select Location</h3>
      <p className="mt-1 text-sm text-slate-500">Category → Course</p>

      {loading.categories ? (
        <p className="mt-4 text-sm text-slate-500">Loading categories...</p>
      ) : categories.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">
          No categories found.{" "}
          <Link to="/categories" className="text-blue-600 hover:underline">
            Create a category first
          </Link>
        </p>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Select category</option>
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
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              disabled={!categoryId || loading.courses}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50"
            >
              <option value="">
                {loading.courses ? "Loading..." : "Select course"}
              </option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.title}
                </option>
              ))}
            </select>
            {categoryId && !loading.courses && courses.length === 0 && (
              <p className="mt-1 text-xs text-slate-500">
                <Link to="/courses/upload" className="text-blue-600 hover:underline">
                  Add a course
                </Link>{" "}
                in {selectedCategory?.name}
              </p>
            )}
          </div>
        </div>
      )}

      {selectedCourse && (
        <p className="mt-3 text-xs text-slate-500">
          {selectedCategory?.name} → {selectedCourse.title} · {lessons.length} lesson
          {lessons.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );

  return (
    <PageShell>
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {locationSelector}

      <ViewUploadTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "view" && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h3 className="font-semibold text-slate-900">View Lessons</h3>
            <p className="text-sm text-slate-500">
              {selectedCourse ? `Lessons in ${selectedCourse.title}` : "Select a course"}
            </p>
          </div>

          {loading.lessons ? (
            <p className="p-5 text-sm text-slate-500">Loading lessons...</p>
          ) : !selectedCourseId ? (
            <p className="p-5 text-sm text-slate-500">Select a category and course to view lessons.</p>
          ) : lessons.length === 0 ? (
            <div className="p-5">
              <p className="text-sm text-slate-500">No lessons yet.</p>
              <button
                type="button"
                onClick={() => setActiveTab("upload")}
                className="mt-2 text-sm text-blue-600 hover:underline"
              >
                Add your first lesson
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {lessons.map((lesson, index) => (
                <div key={lesson._id} className="flex items-center justify-between gap-3 px-5 py-4">
                  <div>
                    <p className="font-medium text-slate-800">
                      <span className="mr-2 text-xs text-slate-400">#{index + 1}</span>
                      {lesson.title}
                    </p>
                    {lesson.description && (
                      <p className="mt-1 line-clamp-1 text-sm text-slate-500">{lesson.description}</p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {lesson.isFree && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">Free</span>
                      )}
                      <span className={`rounded-full px-2 py-0.5 text-xs ${lesson.isPublished ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                        {lesson.isPublished ? "Published" : "Draft"}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-3">
                    <button
                      type="button"
                      disabled={loadingDetail}
                      onClick={() => handleViewLesson(lesson._id)}
                      className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500 disabled:opacity-60"
                    >
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(lesson._id)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "upload" && (
        <form onSubmit={handleSubmit} className="max-w-2xl rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-900">Add Lesson</h3>
          <p className="mt-1 text-sm text-slate-500">
            Add a lesson to {selectedCourse?.title || "selected course"}
          </p>

          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Lesson Title</label>
              <input
                type="text"
                required
                disabled={!selectedCourseId}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Introduction"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
              <textarea
                rows={3}
                disabled={!selectedCourseId}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="What this lesson covers"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50"
              />
            </div>

            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  disabled={!selectedCourseId}
                  checked={form.isFree}
                  onChange={(e) => setForm({ ...form, isFree: e.target.checked })}
                />
                Free preview lesson
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  disabled={!selectedCourseId}
                  checked={form.isPublished}
                  onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                />
                Published
              </label>
            </div>

            <button
              type="submit"
              disabled={!selectedCourseId || submitting}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-60"
            >
              {submitting ? "Adding..." : "Add Lesson"}
            </button>
          </div>
        </form>
      )}

      <LessonDetailModal
        lesson={viewingLesson}
        courseTitle={selectedCourse?.title}
        onClose={() => setViewingLesson(null)}
        onViewVideos={() => {
          setViewingLesson(null);
          navigate("/videos");
        }}
      />
    </PageShell>
  );
}
