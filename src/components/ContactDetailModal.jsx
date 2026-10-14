import { useState } from "react";
import {
  StarIcon,
  PhoneIcon,
  MailIcon,
  MapPinIcon,
  BuildingIcon,
  EditIcon,
  TrashIcon,
  CopyIcon,
  CheckIcon,
} from "./Icons";

export default function ContactDetailModal({
  contact,
  onClose,
  onEdit,
  onDelete,
  onToggleFavorite,
}) {
  const [copiedField, setCopiedField] = useState(null);

  if (!contact) return null;

  function copyText(text, fieldName) {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 1500);
  }

  const initials = (contact.name || "?")
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const formattedDate = contact.updatedAt
    ? new Date(contact.updatedAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container detail-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="detail-modal-header">
          <div
            className="detail-avatar"
            style={{ backgroundColor: contact.avatarColor || "#6366f1" }}
          >
            {initials}
          </div>

          <div className="detail-header-actions">
            <button
              type="button"
              className={`fav-star-btn ${contact.isFavorite ? "active" : ""}`}
              onClick={() => onToggleFavorite(contact.id)}
              title={contact.isFavorite ? "Remove favorite" : "Add to favorites"}
            >
              <StarIcon filled={contact.isFavorite} size={20} />
            </button>
            <button
              type="button"
              className="modal-close-btn"
              onClick={onClose}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>

        <div className="detail-profile-hero">
          <h2 className="detail-name">{contact.name}</h2>
          {(contact.jobTitle || contact.company) && (
            <p className="detail-role">
              {contact.jobTitle}
              {contact.jobTitle && contact.company ? " • " : ""}
              {contact.company && <span>{contact.company}</span>}
            </p>
          )}

          <div className="detail-tags-row">
            <span className="category-badge badge-work">
              {contact.category || "General"}
            </span>
            {Array.isArray(contact.tags) &&
              contact.tags.map((tag, i) => (
                <span key={i} className="tag-pill">
                  #{tag}
                </span>
              ))}
          </div>
        </div>

        {/* Quick action bar */}
        <div className="detail-quick-actions">
          {contact.email && (
            <a
              href={`mailto:${contact.email}`}
              className="detail-action-tile"
              title="Send email"
            >
              <div className="tile-icon blue">
                <MailIcon size={18} />
              </div>
              <span>Email</span>
            </a>
          )}

          {contact.phone && (
            <a
              href={`tel:${contact.phone}`}
              className="detail-action-tile"
              title="Call phone"
            >
              <div className="tile-icon green">
                <PhoneIcon size={18} />
              </div>
              <span>Call</span>
            </a>
          )}

          {contact.address && (
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(
                contact.address
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="detail-action-tile"
              title="Open in Maps"
            >
              <div className="tile-icon amber">
                <MapPinIcon size={18} />
              </div>
              <span>Map</span>
            </a>
          )}
        </div>

        <div className="detail-section-list">
          {contact.email && (
            <div className="detail-item">
              <div className="detail-item-icon">
                <MailIcon size={16} />
              </div>
              <div className="detail-item-content">
                <span className="detail-item-label">Email Address</span>
                <span className="detail-item-value">{contact.email}</span>
              </div>
              <button
                type="button"
                className="btn-copy-field"
                onClick={() => copyText(contact.email, "email")}
                title="Copy email"
              >
                {copiedField === "email" ? (
                  <CheckIcon size={14} className="text-green" />
                ) : (
                  <CopyIcon size={14} />
                )}
              </button>
            </div>
          )}

          {contact.phone && (
            <div className="detail-item">
              <div className="detail-item-icon">
                <PhoneIcon size={16} />
              </div>
              <div className="detail-item-content">
                <span className="detail-item-label">Phone Number</span>
                <span className="detail-item-value">{contact.phone}</span>
              </div>
              <button
                type="button"
                className="btn-copy-field"
                onClick={() => copyText(contact.phone, "phone")}
                title="Copy phone"
              >
                {copiedField === "phone" ? (
                  <CheckIcon size={14} className="text-green" />
                ) : (
                  <CopyIcon size={14} />
                )}
              </button>
            </div>
          )}

          {contact.company && (
            <div className="detail-item">
              <div className="detail-item-icon">
                <BuildingIcon size={16} />
              </div>
              <div className="detail-item-content">
                <span className="detail-item-label">Company / Title</span>
                <span className="detail-item-value">
                  {contact.company}
                  {contact.jobTitle ? ` — ${contact.jobTitle}` : ""}
                </span>
              </div>
            </div>
          )}

          {contact.address && (
            <div className="detail-item">
              <div className="detail-item-icon">
                <MapPinIcon size={16} />
              </div>
              <div className="detail-item-content">
                <span className="detail-item-label">Address</span>
                <span className="detail-item-value">{contact.address}</span>
              </div>
              <button
                type="button"
                className="btn-copy-field"
                onClick={() => copyText(contact.address, "address")}
                title="Copy address"
              >
                {copiedField === "address" ? (
                  <CheckIcon size={14} className="text-green" />
                ) : (
                  <CopyIcon size={14} />
                )}
              </button>
            </div>
          )}

          {contact.notes && (
            <div className="detail-notes-card">
              <span className="detail-item-label">Notes</span>
              <p className="detail-notes-text">{contact.notes}</p>
            </div>
          )}

          {formattedDate && (
            <p className="detail-meta-footer">Last updated: {formattedDate}</p>
          )}
        </div>

        <div className="detail-modal-footer">
          <button
            type="button"
            className="btn btn-outline text-danger"
            onClick={() => {
              onDelete(contact.id);
              onClose();
            }}
          >
            <TrashIcon size={14} />
            <span>Delete</span>
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              onClose();
              onEdit(contact);
            }}
          >
            <EditIcon size={14} />
            <span>Edit Contact</span>
          </button>
        </div>
      </div>
    </div>
  );
}
