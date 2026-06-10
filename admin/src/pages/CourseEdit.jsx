import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ImageUpload from "../components/ImageUpload";
import PageShell from "../components/PageShell";
import { getCategories } from "../services/categoryService";
import { getCourseById, updateCourse } from "../services/courseService";

const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default function CourseEdit() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    level: "beginner",
    thumbnail: "",
    pricing: { monthly: "", yearly: "", lifetime: "", currency: "USD" },
    isPublished: false,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [cats, course] = await Promise.all([
          getCategories().then((r) => r.data),
          getCourseById(courseId),
        ]);
        setCategories(cats);
        setForm({
          title: course.title,
          description: course.description,
          category: course.category?._id || course.category || "",
          level: course.level,
          thumbnail: course.thumbnail || "",
          pricing: {
            monthly: course.pricing?.monthly ?? "",
            yearly: course.pricing?.yearly ?? "",
            lifetime: course.pricing?.lifetime ?? "",
            currency: course.pricing?.currency || "USD",
          },
          isPublished: course.isPublished,
        });
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load course");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [courseId]);

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updatePricing = (field, value) => {
    setForm((prev) => ({
      ...prev,
      pricing: { ...prev.pricing, [field]: value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await updateCourse(courseId, {
        title: form.title,
        slug: slugify(form.title),
        description: form.description,
        category: form.category,
        level: form.level,
        thumbnail: form.thumbnail || undefined,
        pricing: {
          monthly: Number(form.pricing.monthly) || 0,
          yearly: Number(form.pricing.yearly) || 0,
          lifetime: Number(form.pricing.lifetime) || 0,
          currency: form.pricing.currency,
        },
        isPublished: form.isPublished,
      });
      navigate("/courses");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update course");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <PageShell><p className="text-sm text-slate-500">Loading course...</p></PageShell>;
  }

  return (
    <PageShell>
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-900">Basic Information</h3>
          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Course Title</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => updateForm("title", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
              <textarea
                rows={4}
                required
                value={form.description}
                onChange={(e) => updateForm("description", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Category</label>
                <select
                  required
                  value={form.category}
                  onChange={(e) => updateForm("category", e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Level</label>
                <select
                  value={form.level}
                  onChange={(e) => updateForm("level", e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
            <ImageUpload
              folder="courses"
              label="Course Thumbnail"
              value={form.thumbnail}
              onChange={(url) => updateForm("thumbnail", url)}
            />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-900">Pricing</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Currency</label>
              <select
                value={form.pricing.currency}
                onChange={(e) => updatePricing("currency", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="INR">INR</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Monthly Price</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.pricing.monthly}
                onChange={(e) => updatePricing("monthly", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Yearly Price</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.pricing.yearly}
                onChange={(e) => updatePricing("yearly", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Lifetime Price</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.pricing.lifetime}
                onChange={(e) => updatePricing("lifetime", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={form.isPublished}
            onChange={(e) => updateForm("isPublished", e.target.checked)}
          />
          Published
        </label>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-60"
          >
            {submitting ? "Saving..." : "Save Changes"}
          </button>
          <Link
            to="/courses"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </PageShell>
  );
}
