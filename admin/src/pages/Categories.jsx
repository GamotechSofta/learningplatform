import { useEffect, useState } from "react";
import ImageUpload from "../components/ImageUpload";
import PageShell from "../components/PageShell";
import {
  createCategory,
  deleteCategory,
  getCategories,
  searchCategories,
  updateCategory,
} from "../services/categoryService";

const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

const getCoursesCount = (cat) =>
  typeof cat.coursesCount === "number" ? cat.coursesCount : cat.courses?.length || 0;

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", thumbnail: "" });

  const resetForm = () => {
    setForm({ name: "", description: "", thumbnail: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (cat) => {
    setForm({
      name: cat.name || "",
      description: cat.description || "",
      thumbnail: cat.thumbnail || "",
    });
    setEditingId(cat._id);
    setShowForm(true);
  };

  const loadCategories = async (query = "") => {
    try {
      setLoading(true);
      const result = query.trim()
        ? await searchCategories(query)
        : await getCategories();
      setCategories(result.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    loadCategories(search);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: form.name,
        slug: slugify(form.name),
        description: form.description,
        thumbnail: form.thumbnail || undefined,
      };
      if (editingId) {
        await updateCategory(editingId, payload);
      } else {
        await createCategory(payload);
      }
      resetForm();
      loadCategories(search);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          `Failed to ${editingId ? "update" : "create"} category`
      );
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await deleteCategory(id);
      loadCategories(search);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete category");
    }
  };

  return (
    <PageShell
      title="Categories"
      breadcrumbs={["Dashboard", "Categories"]}
      action={
        <button
          type="button"
          onClick={() => {
            if (showForm) {
              resetForm();
            } else {
              setEditingId(null);
              setForm({ name: "", description: "", thumbnail: "" });
              setShowForm(true);
            }
          }}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
        >
          {showForm ? "Close" : "+ Add Category"}
        </button>
      }
    >
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search categories (Marketing, SEO, Searching...)"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-lg bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-700">
          Search
        </button>
        {search && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              loadCategories();
            }}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700"
          >
            Clear
          </button>
        )}
      </form>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 w-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-900">
            {editingId ? "Edit Category" : "New Category"}
          </h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <input
              type="text"
              required
              placeholder="Category name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              type="text"
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <div className="sm:col-span-2">
              <ImageUpload
                folder="categories"
                label="Category Thumbnail"
                value={form.thumbnail}
                onChange={(url) => setForm({ ...form, thumbnail: url })}
              />
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-500">
              {editingId ? "Update Category" : "Save Category"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Loading categories...</p>
      ) : (
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((cat) => (
            <div key={cat._id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="h-36 bg-slate-100">
                {cat.thumbnail ? (
                  <img
                    src={cat.thumbnail}
                    alt={cat.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-slate-400">
                    No thumbnail
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-900">{cat.name}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                      {cat.description || "No description"}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => startEdit(cat)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(cat._id)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2 text-xs text-slate-500">
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 font-medium text-blue-700">
                    {getCoursesCount(cat)} {getCoursesCount(cat) === 1 ? "course" : "courses"}
                  </span>
                  <span className="truncate text-slate-400">{cat.slug}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
