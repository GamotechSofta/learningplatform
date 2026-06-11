import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageShell from "../components/PageShell";
import VideoUploadPanel from "../components/VideoUploadPanel";
import BulkVideoUploadPanel from "../components/BulkVideoUploadPanel";
import VideoPlayerModal from "../components/VideoPlayerModal";
import ViewUploadTabs from "../components/ViewUploadTabs";
import { getCategories, getCoursesByCategory } from "../services/categoryService";
import { getLessonsByCourse } from "../services/lessonService";
import { deleteVideo, getVideosByLesson } from "../services/videoService";

export default function Videos() {
  const [activeTab, setActiveTab] = useState("view");
  const [uploadMode, setUploadMode] = useState("single");
  const [categories, setCategories] = useState([]);
  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [videos, setVideos] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [lessonId, setLessonId] = useState("");
  const [viewingVideo, setViewingVideo] = useState(null);
  const [loading, setLoading] = useState({ categories: true, courses: false, lessons: false, videos: false });
  const [error, setError] = useState("");

  const selectedCategory = categories.find((c) => c._id === categoryId);
  const selectedCourse = courses.find((c) => c._id === courseId);
  const selectedLesson = lessons.find((l) => l._id === lessonId);

  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res.data))
      .catch((err) => setError(err.response?.data?.message || "Failed to load categories"))
      .finally(() => setLoading((p) => ({ ...p, categories: false })));
  }, []);

  useEffect(() => {
    if (!categoryId) {
      setCourses([]);
      setCourseId("");
      return;
    }
    setLoading((p) => ({ ...p, courses: true }));
    getCoursesByCategory(categoryId)
      .then((data) => {
        setCourses(data);
        setCourseId(data[0]?._id || "");
      })
      .catch((err) => setError(err.response?.data?.message || "Failed to load courses"))
      .finally(() => setLoading((p) => ({ ...p, courses: false })));
  }, [categoryId]);

  useEffect(() => {
    if (!courseId) {
      setLessons([]);
      setLessonId("");
      return;
    }
    setLoading((p) => ({ ...p, lessons: true }));
    getLessonsByCourse(courseId)
      .then((data) => {
        setLessons(data);
        setLessonId(data[0]?._id || "");
      })
      .catch((err) => setError(err.response?.data?.message || "Failed to load lessons"))
      .finally(() => setLoading((p) => ({ ...p, lessons: false })));
  }, [courseId]);

  const loadVideos = async (id) => {
    if (!id) {
      setVideos([]);
      return;
    }
    setLoading((p) => ({ ...p, videos: true }));
    try {
      const data = await getVideosByLesson(id);
      setVideos(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load videos");
    } finally {
      setLoading((p) => ({ ...p, videos: false }));
    }
  };

  useEffect(() => {
    loadVideos(lessonId);
  }, [lessonId]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this video?")) return;
    try {
      await deleteVideo(id);
      loadVideos(lessonId);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete video");
    }
  };

  const selectorBlock = (
    <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="font-semibold text-slate-900">Select Location</h3>
      <p className="mt-1 text-sm text-slate-500">Category → Course → Lesson</p>

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
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Course</label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              disabled={!categoryId || loading.courses}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50"
            >
              <option value="">{loading.courses ? "Loading..." : "Select course"}</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>{course.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Lesson</label>
            <select
              value={lessonId}
              onChange={(e) => setLessonId(e.target.value)}
              disabled={!courseId || loading.lessons}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50"
            >
              <option value="">{loading.lessons ? "Loading..." : "Select lesson"}</option>
              {lessons.map((lesson) => (
                <option key={lesson._id} value={lesson._id}>{lesson.title}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {selectedLesson && (
        <p className="mt-3 text-xs text-slate-500">
          {selectedCategory?.name} → {selectedCourse?.title} → {selectedLesson.title}
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

      {selectorBlock}

      <ViewUploadTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "view" && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h3 className="font-semibold text-slate-900">View Videos</h3>
            <p className="text-sm text-slate-500">
              {selectedLesson ? `${videos.length} video(s) in ${selectedLesson.title}` : "Select a lesson"}
            </p>
          </div>

          {loading.videos ? (
            <p className="p-5 text-sm text-slate-500">Loading videos...</p>
          ) : !lessonId ? (
            <p className="p-5 text-sm text-slate-500">Select category, course, and lesson to view videos.</p>
          ) : videos.length === 0 ? (
            <div className="p-5">
              <p className="text-sm text-slate-500">No videos yet.</p>
              <button
                type="button"
                onClick={() => setActiveTab("upload")}
                className="mt-2 text-sm text-blue-600 hover:underline"
              >
                Upload your first video
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {videos.map((video, index) => (
                <div key={video._id} className="flex items-center justify-between gap-3 px-5 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-800">
                      <span className="mr-2 text-xs text-slate-400">#{index + 1}</span>
                      {video.title}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {video.duration > 0 && (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                          {+(video.duration / 60).toFixed(1)} min
                        </span>
                      )}
                      <span className={`rounded-full px-2 py-0.5 text-xs ${video.isPublished ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                        {video.isPublished ? "Published" : "Draft"}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-3">
                    <button
                      type="button"
                      onClick={() => setViewingVideo(video)}
                      className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500"
                    >
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(video._id)}
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
        <div className="w-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-semibold text-slate-900">Upload Video</h3>
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                onClick={() => setUploadMode("single")}
                className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                  uploadMode === "single"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Single Video
              </button>
              <button
                type="button"
                onClick={() => setUploadMode("bulk")}
                className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                  uploadMode === "bulk"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Bulk / Folder
              </button>
            </div>
          </div>
          {lessonId ? (
            uploadMode === "single" ? (
              <VideoUploadPanel
                key={lessonId}
                lessonId={lessonId}
                order={videos.length}
                onCreated={() => {
                  loadVideos(lessonId);
                  setActiveTab("view");
                }}
              />
            ) : (
              <BulkVideoUploadPanel
                key={`${lessonId}-bulk`}
                lessonId={lessonId}
                order={videos.length}
                onCreated={() => loadVideos(lessonId)}
              />
            )
          ) : (
            <p className="text-sm text-slate-500">Select a category, course, and lesson first.</p>
          )}
        </div>
      )}

      <VideoPlayerModal video={viewingVideo} onClose={() => setViewingVideo(null)} />
    </PageShell>
  );
}
