import {
  StarIcon,
  PlusIcon,
  DownloadIcon,
  UserIcon,
  BuildingIcon,
  LogOutIcon,
  MoonIcon,
  SunIcon,
  SparklesIcon,
} from "./Icons";

const CATEGORIES = [
  { id: "all", label: "All Contacts", icon: UserIcon },
  { id: "favorites", label: "Favorites", icon: StarIcon },
  { id: "Work", label: "Work", icon: BuildingIcon },
  { id: "Personal", label: "Personal", icon: UserIcon },
  { id: "Family", label: "Family", icon: SparklesIcon },
  { id: "Client", label: "Clients", icon: BuildingIcon },
];

export default function Sidebar({
  user,
  contacts = [],
  activeCategory,
  onSelectCategory,
  onOpenAddModal,
  onOpenBackupModal,
  onLogout,
  theme,
  onToggleTheme,
}) {
  function getCountForCategory(catId) {
    if (catId === "all") return contacts.length;
    if (catId === "favorites") {
      return contacts.filter((c) => c.isFavorite).length;
    }
    return contacts.filter(
      (c) => (c.category || "").toLowerCase() === catId.toLowerCase()
    ).length;
  }

  const userInitial = (user.name || user.email || "U")
    .charAt(0)
    .toUpperCase();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-mark small">C</div>
        <div className="brand-title-wrap">
          <span className="brand-title">ContactHub</span>
          <span className="brand-offline-tag">Offline App</span>
        </div>
      </div>

      <div className="sidebar-action-wrap">
        <button
          type="button"
          className="btn-sidebar-add"
          onClick={onOpenAddModal}
        >
          <PlusIcon size={16} />
          <span>New Contact</span>
        </button>
      </div>

      <div className="sidebar-nav-section">
        <p className="nav-heading">ORGANIZATION</p>
        <nav className="nav-menu">
          {CATEGORIES.map((cat) => {
            const count = getCountForCategory(cat.id);
            const isSelected = activeCategory === cat.id;
            const Icon = cat.icon;

            return (
              <button
                key={cat.id}
                type="button"
                className={`nav-item ${isSelected ? "selected" : ""}`}
                onClick={() => onSelectCategory(cat.id)}
              >
                <span className="nav-icon">
                  <Icon
                    size={16}
                    filled={cat.id === "favorites" && isSelected}
                  />
                </span>
                <span className="nav-label">{cat.label}</span>
                <span className="nav-count">{count}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="sidebar-nav-section">
        <p className="nav-heading">DATA & BACKUP</p>
        <button
          type="button"
          className="nav-item-secondary"
          onClick={onOpenBackupModal}
        >
          <DownloadIcon size={15} />
          <span>Import & Export Data</span>
        </button>
      </div>

      <div className="sidebar-bottom">
        <div className="profile-container">
          <div
            className="profile-circle"
            style={{ backgroundColor: user.avatarColor || "#6366f1" }}
          >
            {userInitial}
          </div>
          <div className="profile-info">
            <strong title={user.name}>{user.name}</strong>
            <span title={user.email}>{user.email}</span>
          </div>
        </div>

        <div className="sidebar-bottom-actions">
          <button
            type="button"
            className="btn-theme-toggle"
            onClick={onToggleTheme}
            title={
              theme === "dark"
                ? "Switch to Light Mode"
                : "Switch to Dark Mode"
            }
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <SunIcon size={16} /> : <MoonIcon size={16} />}
          </button>
          <button
            type="button"
            className="logout-button"
            onClick={onLogout}
            title="Log out of ContactHub"
            aria-label="Logout"
          >
            <LogOutIcon size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
