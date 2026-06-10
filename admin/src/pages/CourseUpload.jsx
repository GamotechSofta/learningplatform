import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ImageUpload from "../components/ImageUpload";
import PageShell from "../components/PageShell";
import { useAuth } from "../context/AuthContext";
import { getCategories } from "../services/categoryService";
import { createCourse } from "../services/courseService";

const steps = ["Basic Information", "Pricing", "Curriculum", "Additional Information", "Publish"];

const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default function CourseUpload() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
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
    getCategories().then((res) => setCategories(res.data)).catch(() => {});
  }, []);

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
    setError("");

    if (step < 1) {
      setStep(1);
      return;
    }

    setSubmitting(true);
    try {
      const course = await createCourse({
        title: form.title,
        slug: slugify(form.title),
        description: form.description,
        category: form.category,
        level: form.level,
        thumbnail: form.thumbnail || undefined,
        instructor: user._id,
        pricing: {
          monthly: Number(form.pricing.monthly) || 0,
          yearly: Number(form.pricing.yearly) || 0,
          lifetime: Number(form.pricing.lifetime) || 0,
          currency: form.pricing.currency,
        },
        isPublished: form.isPublished,
      });
      navigate(`/courses/${course._id}/curriculum`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create course");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell title="Course Upload" breadcrumbs={["Dashboard", "Courses", "Add New Course"]}>
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[220px_1fr_280px]">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <ol className="space-y-4">
            {steps.map((label, index) => (
              <li key={label} className="flex items-start gap-3">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    index === step ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {index + 1}
                </span>
                <span className={`pt-0.5 text-sm ${index === step ? "font-semibold text-blue-600" : "text-slate-500"}`}>
                  {label}
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 0 && (
              <>
                <h3 className="text-lg font-semibold text-slate-900">Basic Information</h3>
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
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Course Level</label>
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
              </>
            )}

            {step === 1 && (
              <>
                <h3 className="text-lg font-semibold text-slate-900">Pricing</h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Monthly</label>
                    <input
                      type="number"
                      min="0"
                      value={form.pricing.monthly}
                      onChange={(e) => updatePricing("monthly", e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Yearly</label>
                    <input
                      type="number"
                      min="0"
                      value={form.pricing.yearly}
                      onChange={(e) => updatePricing("yearly", e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Lifetime</label>
                    <input
                      type="number"
                      min="0"
                      value={form.pricing.lifetime}
                      onChange={(e) => updatePricing("lifetime", e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.isPublished}
                    onChange={(e) => updateForm("isPublished", e.target.checked)}
                  />
                  Publish course immediately
                </label>
              </>
            )}

            <div className="flex justify-end gap-3 pt-2">
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Back
                </button>
              )}
              <Link
                to="/courses"
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-60"
              >
                {submitting ? "Saving..." : step === 0 ? "Save & Next" : "Create Course"}
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h4 className="font-semibold text-slate-900">Course Upload Progress</h4>
            <p className="mt-1 text-sm text-slate-500">Step {step + 1} of {steps.length}</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-blue-600" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h4 className="font-semibold text-slate-900">Course Preview</h4>
            <div className="mt-3 overflow-hidden rounded-lg border border-slate-200">
              <div className="h-28 bg-slate-200" />
              <div className="p-3">
                <p className="font-medium text-slate-800">{form.title || "Course Title"}</p>
                <p className="text-xs capitalize text-slate-500">{form.level} · Draft</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
