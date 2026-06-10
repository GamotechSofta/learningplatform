import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageShell from "../components/PageShell";
import VideoUploadPanel from "../components/VideoUploadPanel";
import { getCourseById } from "../services/courseService";
import { createLesson, deleteLesson, getLessonsByCourse } from "../services/lessonService";
import { deleteVideo, getVideosByLesson } from "../services/videoService";

export default function CourseCurriculum() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [videosByLesson, setVideosByLesson] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lessonForm, setLessonForm] = useState({ title: "", order: 0 });
  const [openLessonId, setOpenLessonId] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [courseData, lessonsData] = await Promise.all([
        getCourseById(courseId),
        getLessonsByCourse(courseId),
      ]);
      setCourse(courseData);
      setLessons(lessonsData);

      const videoEntries = await Promise.all(
        lessonsData.map(async (lesson) => {
          const videos = await getVideosByLesson(lesson._id);
          return [lesson._id, videos];
        })
      );
      setVideosByLesson(Object.fromEntries(videoEntries));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load curriculum");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [courseId]);

  const handleAddLesson = async (e) => {
    e.preventDefault();
    try {
      await createLesson({ ...lessonForm, course: courseId, order: lessons.length });
      setLessonForm({ title: "", order: 0 });
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create lesson");
    }
  };

  if (loading) {
    return <p className="text-sm text-slate-500">Loading curriculum...</p>;
  }

  return (
    <PageShell
      title="Course Curriculum"
      breadcrumbs={["Dashboard", "Courses", course?.title || "Curriculum"]}
      action={
        <Link to="/courses" className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
          Back to Courses
        </Link>
      }
    >
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="font-semibold text-slate-900">Add Lesson</h3>
        <form onSubmit={handleAddLesson} className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            required
            placeholder="Lesson title"
            value={lessonForm.title}
            onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500">
            Add Lesson
          </button>
        </form>
      </div>

      <div className="space-y-6">
        {lessons.map((lesson) => {
          const lessonVideos = videosByLesson[lesson._id] || [];
          const isOpen = openLessonId === lesson._id;
          return (
            <div key={lesson._id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">{lesson.title}</h3>
                <button
                  type="button"
                  onClick={async () => {
                    if (!window.confirm("Delete this lesson?")) return;
                    await deleteLesson(lesson._id);
                    loadData();
                  }}
                  className="text-sm text-red-600 hover:underline"
                >
                  Delete Lesson
                </button>
              </div>

              <ul className="mt-3 space-y-2">
                {lessonVideos.length === 0 ? (
                  <li className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-500">No videos yet.</li>
                ) : (
                  lessonVideos.map((video) => (
                    <li key={video._id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                      <span>{video.title}</span>
                      <button
                        type="button"
                        onClick={async () => {
                          await deleteVideo(video._id);
                          loadData();
                        }}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </li>
                  ))
                )}
              </ul>

              <div className="mt-4">
                {isOpen ? (
                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="text-sm font-medium text-slate-800">Add Video</h4>
                      <button
                        type="button"
                        onClick={() => setOpenLessonId(null)}
                        className="text-xs text-slate-500 hover:underline"
                      >
                        Close
                      </button>
                    </div>
                    <VideoUploadPanel
                      lessonId={lesson._id}
                      order={lessonVideos.length}
                      onCreated={() => {
                        loadData();
                        setOpenLessonId(null);
                      }}
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setOpenLessonId(lesson._id)}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    + Add Video
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}
