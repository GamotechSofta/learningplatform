import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageShell from "../components/PageShell";
import VideoUploadFields, { getDefaultVideoForm } from "../components/VideoUploadFields";
import { getCourseById } from "../services/courseService";
import { createLesson, deleteLesson, getLessonsByCourse } from "../services/lessonService";
import { createVideo, deleteVideo, getVideosByLesson, uploadVideoFile } from "../services/videoService";

export default function CourseCurriculum() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [videosByLesson, setVideosByLesson] = useState({});
  const [loading, setLoading] = useState(true);
  const [submittingLessonId, setSubmittingLessonId] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [error, setError] = useState("");
  const [lessonForm, setLessonForm] = useState({ title: "", order: 0 });
  const [videoForms, setVideoForms] = useState({});
  const [videoFiles, setVideoFiles] = useState({});

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

  const updateVideoForm = (lessonId, updates) => {
    setVideoForms((prev) => ({
      ...prev,
      [lessonId]: { ...(prev[lessonId] || getDefaultVideoForm()), ...updates },
    }));
  };

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

  const handleAddVideo = async (e, lessonId) => {
    e.preventDefault();
    const form = videoForms[lessonId] || getDefaultVideoForm();
    const uploadMode = form.uploadMode || "file";

    setSubmittingLessonId(lessonId);
    setUploadProgress(0);
    setError("");

    try {
      if (uploadMode === "file") {
        const file = videoFiles[lessonId];
        if (!file) {
          setError("Please select a video file from your device");
          return;
        }

        await uploadVideoFile(
          {
            file,
            lessonId,
            title: form.title,
            description: form.description,
            thumbnail: form.thumbnail,
            duration: form.duration,
            isPublished: form.isPublished,
            order: (videosByLesson[lessonId] || []).length,
          },
          setUploadProgress
        );
        setVideoFiles((prev) => ({ ...prev, [lessonId]: null }));
      } else {
        await createVideo({
          lesson: lessonId,
          title: form.title,
          description: form.description || undefined,
          videoUrl: form.videoUrl,
          thumbnail: form.thumbnail || undefined,
          order: (videosByLesson[lessonId] || []).length,
          duration: Number(form.duration) || 0,
          isPublished: form.isPublished,
        });
      }

      setVideoForms((prev) => ({ ...prev, [lessonId]: getDefaultVideoForm() }));
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload video");
    } finally {
      setSubmittingLessonId(null);
      setUploadProgress(null);
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
        {lessons.map((lesson) => (
          <div key={lesson._id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">{lesson.title}</h3>
              <button
                type="button"
                onClick={async () => {
                  await deleteLesson(lesson._id);
                  loadData();
                }}
                className="text-sm text-red-600 hover:underline"
              >
                Delete Lesson
              </button>
            </div>

            <ul className="mt-3 space-y-2">
              {(videosByLesson[lesson._id] || []).map((video) => (
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
              ))}
            </ul>

            <form onSubmit={(e) => handleAddVideo(e, lesson._id)} className="mt-4 rounded-lg border border-slate-100 bg-slate-50 p-4">
              <h4 className="mb-3 text-sm font-medium text-slate-800">Add Video</h4>
              <VideoUploadFields
                form={videoForms[lesson._id] || getDefaultVideoForm()}
                videoFile={videoFiles[lesson._id]}
                uploadProgress={submittingLessonId === lesson._id ? uploadProgress : null}
                onFormChange={(updates) => updateVideoForm(lesson._id, updates)}
                onFileChange={(file) => setVideoFiles((prev) => ({ ...prev, [lesson._id]: file }))}
              />
              <button
                type="submit"
                disabled={submittingLessonId === lesson._id}
                className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-60"
              >
                {submittingLessonId === lesson._id ? "Uploading..." : "Upload Video"}
              </button>
            </form>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
