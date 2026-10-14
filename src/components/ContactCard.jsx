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

export default function ContactCard({
  contact,
  onEdit,
  onDelete,
  onToggleFavorite,
  onSelectDetails,
}) {
  const [copiedField, setCopiedField] = useState(null);

  function copyText(e, text, fieldName) {
    e.stopPropagation();
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

  const categoryColorClass = {
    work: "badge-work",
    personal: "badge-personal",
    family: "badge-family",
    client: "badge-client",
  }[(contact.category || "work").toLowerCase()] || "badge-default";

  return (
    <article
      className="contact-card"
      onClick={() => onSelectDetails(contact)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") onSelectDetails(contact);
      }}
    >
      <div className="contact-card-header">
        <div
          className="contact-avatar"
          style={{ backgroundColor: contact.avatarColor || "#6366f1" }}
        >
          {initials}
        </div>

        <div className="contact-header-info">
          <div className="contact-title-row">
            <h3 className="contact-name">{contact.name}</h3>
            <button
              type="button"
              className={`fav-star-btn ${contact.isFavorite ? "active" : ""}`}
              title={contact.isFavorite ? "Remove favorite" : "Add favorite"}
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(contact.id);
              }}
            >
              <StarIcon filled={contact.isFavorite} size={18} />
            </button>
          </div>

          {(contact.jobTitle || contact.company) && (
            <p className="contact-role">
              {contact.jobTitle}
              {contact.jobTitle && contact.company ? " at " : ""}
              {contact.company && (
                <span className="contact-company">{contact.company}</span>
              )}
            </p>
          )}
        </div>
      </div>

      <div className="contact-badges">
        <span className={`category-badge ${categoryColorClass}`}>
          {contact.category || "General"}
        </span>
        {Array.isArray(contact.tags) &&
          contact.tags.map((tag, idx) => (
            <span key={idx} className="tag-pill">
              #{tag}
            </span>
          ))}
      </div>

      <div className="contact-body-info">
        {contact.email && (
          <div className="info-row">
            <MailIcon size={14} className="info-icon" />
            <a
              href={`mailto:${contact.email}`}
              onClick={(e) => e.stopPropagation()}
              className="info-link"
              title={contact.email}
            >
              {contact.email}
            </a>
            <button
              type="button"
              className="copy-btn"
              title="Copy email"
              onClick={(e) => copyText(e, contact.email, "email")}
            >
              {copiedField === "email" ? (
                <CheckIcon size={12} className="text-green" />
              ) : (
                <CopyIcon size={12} />
              )}
            </button>
          </div>
        )}

        {contact.phone && (
          <div className="info-row">
            <PhoneIcon size={14} className="info-icon" />
            <a
              href={`tel:${contact.phone}`}
              onClick={(e) => e.stopPropagation()}
              className="info-link"
            >
              {contact.phone}
            </a>
            <button
              type="button"
              className="copy-btn"
              title="Copy phone"
              onClick={(e) => copyText(e, contact.phone, "phone")}
            >
              {copiedField === "phone" ? (
                <CheckIcon size={12} className="text-green" />
              ) : (
                <CopyIcon size={12} />
              )}
            </button>
          </div>
        )}

        {contact.address && (
          <div className="info-row">
            <MapPinIcon size={14} className="info-icon" />
            <span className="info-text">{contact.address}</span>
          </div>
        )}

        {contact.notes && (
          <p className="contact-card-notes" title={contact.notes}>
            "{contact.notes}"
          </p>
        )}
      </div>

      <div className="contact-card-actions" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="btn-card-action edit"
          onClick={() => onEdit(contact)}
          title="Edit Contact"
        >
          <EditIcon size={14} />
          <span>Edit</span>
        </button>
        <button
          type="button"
          className="btn-card-action delete"
          onClick={() => onDelete(contact.id)}
          title="Delete Contact"
        >
          <TrashIcon size={14} />
          <span>Delete</span>
        </button>
      </div>
    </article>
  );
}
