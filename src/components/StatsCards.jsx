import { StarIcon, UserIcon, BuildingIcon, CheckIcon } from "./Icons";

export default function StatsCards({ contacts = [] }) {
  const total = contacts.length;
  const favorites = contacts.filter((c) => c.isFavorite).length;
  const workCount = contacts.filter(
    (c) => (c.category || "").toLowerCase() === "work"
  ).length;

  return (
    <section className="stats-grid">
      <article className="stat-card">
        <div className="stat-icon-wrapper blue">
          <UserIcon size={20} />
        </div>
        <div>
          <p className="stat-label">Total Contacts</p>
          <strong className="stat-value">{total}</strong>
          <span className="stat-caption">In your address book</span>
        </div>
      </article>

      <article className="stat-card">
        <div className="stat-icon-wrapper amber">
          <StarIcon filled size={20} />
        </div>
        <div>
          <p className="stat-label">Starred Favorites</p>
          <strong className="stat-value">{favorites}</strong>
          <span className="stat-caption">Quick access contacts</span>
        </div>
      </article>

      <article className="stat-card">
        <div className="stat-icon-wrapper purple">
          <BuildingIcon size={20} />
        </div>
        <div>
          <p className="stat-label">Work & Professional</p>
          <strong className="stat-value">{workCount}</strong>
          <span className="stat-caption">Colleagues and partners</span>
        </div>
      </article>

      <article className="stat-card">
        <div className="stat-icon-wrapper green">
          <CheckIcon size={20} />
        </div>
        <div>
          <p className="stat-label">Storage Status</p>
          <strong className="stat-value online-status">Offline Active</strong>
          <span className="stat-caption">Local browser persistence</span>
        </div>
      </article>
    </section>
  );
}
