import { useState, useEffect } from "react";
import { StarIcon } from "./Icons";

const AVATAR_COLORS = [
  "#6366f1", // Indigo
  "#0ea5e9", // Sky
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ec4899", // Pink
  "#8b5cf6", // Purple
  "#14b8a6", // Teal
  "#ef4444", // Red
  "#3b82f6", // Blue
  "#84cc16", // Lime
];

const CATEGORIES = ["Work", "Personal", "Family", "Client", "Other"];

export default function ContactModal({
  isOpen,
  initialData,
  onSave,
  onClose,
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    jobTitle: "",
    category: "Work",
    tags: "",
    address: "",
    notes: "",
    isFavorite: false,
    avatarColor: "#6366f1",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        company: initialData.company || "",
        jobTitle: initialData.jobTitle || "",
        category: initialData.category || "Work",
        tags: Array.isArray(initialData.tags)
          ? initialData.tags.join(", ")
          : initialData.tags || "",
        address: initialData.address || "",
        notes: initialData.notes || "",
        isFavorite: !!initialData.isFavorite,
        avatarColor: initialData.avatarColor || "#6366f1",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        jobTitle: "",
        category: "Work",
        tags: "",
        address: "",
        notes: "",
        isFavorite: false,
        avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") handleSubmit(e);
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, formData]);

  if (!isOpen) return null;

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required.";
    }

    if (
      formData.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
    ) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      ...formData,
      tags: formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    });
  }

  const isEditing = !!initialData?.id;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container contact-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-header">
          <div>
            <h2 id="modal-title" className="modal-title">
              {isEditing ? "Edit Contact" : "Add New Contact"}
            </h2>
            <p className="modal-subtitle">
              {isEditing
                ? "Update this person's information in your address book."
                : "Fill in the details below to add a new contact."}
            </p>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="avatar-color-picker">
            <label className="picker-label">Avatar Badge Color</label>
            <div className="color-swatches">
              {AVATAR_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`color-swatch ${
                    formData.avatarColor === color ? "active" : ""
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, avatarColor: color }))
                  }
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group full-width">
              <label htmlFor="input-name">
                Full Name <span className="req">*</span>
              </label>
              <input
                id="input-name"
                name="name"
                type="text"
                placeholder="e.g. Alex Morgan"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? "input-error" : ""}
                autoFocus
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="input-email">Email Address</label>
              <input
                id="input-email"
                name="email"
                type="email"
                placeholder="alex.morgan@example.com"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? "input-error" : ""}
              />
              {errors.email && (
                <span className="field-error">{errors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="input-phone">Phone Number</label>
              <input
                id="input-phone"
                name="phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="input-company">Company / Organization</label>
              <input
                id="input-company"
                name="company"
                type="text"
                placeholder="Acme Corp"
                value={formData.company}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="input-jobTitle">Job Title / Role</label>
              <input
                id="input-jobTitle"
                name="jobTitle"
                type="text"
                placeholder="Product Director"
                value={formData.jobTitle}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="select-category">Category</label>
              <select
                id="select-category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="select-field"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="input-tags">
                Tags <span className="hint-text">(comma separated)</span>
              </label>
              <input
                id="input-tags"
                name="tags"
                type="text"
                placeholder="VIP, Lead, Austin"
                value={formData.tags}
                onChange={handleChange}
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="input-address">Physical Address</label>
              <input
                id="input-address"
                name="address"
                type="text"
                placeholder="123 Main Street, Suite 400, City, State"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="input-notes">Private Notes</label>
              <textarea
                id="input-notes"
                name="notes"
                rows="3"
                placeholder="Important context, meeting discussions, birthday, reminders..."
                value={formData.notes}
                onChange={handleChange}
              />
            </div>

            <div className="form-group full-width checkbox-row">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isFavorite"
                  checked={formData.isFavorite}
                  onChange={handleChange}
                />
                <StarIcon filled={formData.isFavorite} size={16} />
                <span>Mark as Starred / Favorite Contact</span>
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {isEditing ? "Save Changes" : "Create Contact"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
