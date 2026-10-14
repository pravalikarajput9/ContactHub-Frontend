import {
  StarIcon,
  EditIcon,
  TrashIcon,
  MailIcon,
  PhoneIcon,
} from "./Icons";

export default function ContactTable({
  contacts,
  selectedIds = [],
  onToggleSelect,
  onSelectAll,
  onEdit,
  onDelete,
  onToggleFavorite,
  onSelectDetails,
}) {
  const allSelected =
    contacts.length > 0 && selectedIds.length === contacts.length;

  return (
    <div className="table-wrapper">
      <table className="contacts-table">
        <thead>
          <tr>
            <th className="col-checkbox">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onSelectAll}
                aria-label="Select all contacts"
              />
            </th>
            <th className="col-star">Fav</th>
            <th className="col-name">Name</th>
            <th className="col-company">Company / Role</th>
            <th className="col-email">Email</th>
            <th className="col-phone">Phone</th>
            <th className="col-category">Category</th>
            <th className="col-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact) => {
            const isSelected = selectedIds.includes(contact.id);
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
              <tr
                key={contact.id}
                className={`table-row ${isSelected ? "selected-row" : ""}`}
                onClick={() => onSelectDetails(contact)}
              >
                <td
                  className="col-checkbox"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelect(contact.id)}
                    aria-label={`Select ${contact.name}`}
                  />
                </td>

                <td
                  className="col-star"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(contact.id);
                  }}
                >
                  <button
                    type="button"
                    className="fav-star-btn-sm"
                    title={contact.isFavorite ? "Remove favorite" : "Favorite"}
                  >
                    <StarIcon filled={contact.isFavorite} size={15} />
                  </button>
                </td>

                <td className="col-name">
                  <div className="table-avatar-cell">
                    <div
                      className="contact-avatar-sm"
                      style={{
                        backgroundColor: contact.avatarColor || "#6366f1",
                      }}
                    >
                      {initials}
                    </div>
                    <span className="contact-table-name">{contact.name}</span>
                  </div>
                </td>

                <td className="col-company">
                  <div className="table-text-stack">
                    <span className="table-primary-text">
                      {contact.company || "—"}
                    </span>
                    {contact.jobTitle && (
                      <span className="table-sub-text">{contact.jobTitle}</span>
                    )}
                  </div>
                </td>

                <td
                  className="col-email"
                  onClick={(e) => e.stopPropagation()}
                >
                  {contact.email ? (
                    <a
                      href={`mailto:${contact.email}`}
                      className="table-link"
                      title={contact.email}
                    >
                      <MailIcon size={13} />
                      <span>{contact.email}</span>
                    </a>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>

                <td
                  className="col-phone"
                  onClick={(e) => e.stopPropagation()}
                >
                  {contact.phone ? (
                    <a href={`tel:${contact.phone}`} className="table-link">
                      <PhoneIcon size={13} />
                      <span>{contact.phone}</span>
                    </a>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>

                <td className="col-category">
                  <span className={`category-badge ${categoryColorClass}`}>
                    {contact.category || "General"}
                  </span>
                </td>

                <td
                  className="col-actions"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="table-actions-group">
                    <button
                      type="button"
                      className="btn-icon-action"
                      title="Edit"
                      onClick={() => onEdit(contact)}
                    >
                      <EditIcon size={15} />
                    </button>
                    <button
                      type="button"
                      className="btn-icon-action text-danger"
                      title="Delete"
                      onClick={() => onDelete(contact.id)}
                    >
                      <TrashIcon size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
