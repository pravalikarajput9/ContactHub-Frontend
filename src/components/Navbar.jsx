import { useRef, useEffect } from "react";
import {
  SearchIcon,
  PlusIcon,
  GridIcon,
  ListIcon,
  SunIcon,
  MoonIcon,
} from "./Icons";

export default function Navbar({
  searchTerm,
  onSearchChange,
  viewMode,
  onViewModeChange,
  sortBy,
  onSortByChange,
  onOpenAddModal,
  theme,
  onToggleTheme,
}) {
  const searchInputRef = useRef(null);

  useEffect(() => {
    function handleKeyDown(e) {
      if (
        e.key === "/" &&
        document.activeElement.tagName !== "INPUT" &&
        document.activeElement.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="topbar">
      <div className="search-container">
        <SearchIcon size={16} className="search-icon" />
        <input
          ref={searchInputRef}
          type="text"
          className="search-input"
          placeholder="Search by name, email, phone, company, or note... (Press '/' to focus)"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search contacts"
        />
        {searchTerm && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={() => onSearchChange("")}
            title="Clear search"
          >
            ×
          </button>
        )}
      </div>

      <div className="topbar-right-controls">
        <div className="sort-selector-wrap">
          <label htmlFor="sort-select" className="sr-only">
            Sort contacts
          </label>
          <select
            id="sort-select"
            className="sort-select"
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
          >
            <option value="name-asc">Name (A → Z)</option>
            <option value="name-desc">Name (Z → A)</option>
            <option value="newest">Recently Updated</option>
            <option value="company">Company</option>
          </select>
        </div>

        <div className="view-mode-toggle">
          <button
            type="button"
            className={`btn-view ${viewMode === "grid" ? "active" : ""}`}
            onClick={() => onViewModeChange("grid")}
            title="Grid view"
            aria-label="Grid view"
          >
            <GridIcon size={16} />
          </button>
          <button
            type="button"
            className={`btn-view ${viewMode === "table" ? "active" : ""}`}
            onClick={() => onViewModeChange("table")}
            title="Table list view"
            aria-label="Table list view"
          >
            <ListIcon size={16} />
          </button>
        </div>

        <button
          type="button"
          className="btn-theme-nav"
          onClick={onToggleTheme}
          title={theme === "dark" ? "Light theme" : "Dark theme"}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <SunIcon size={16} /> : <MoonIcon size={16} />}
        </button>

        <button
          type="button"
          className="btn btn-primary topbar-add-btn"
          onClick={onOpenAddModal}
        >
          <PlusIcon size={15} />
          <span>Add Contact</span>
        </button>
      </div>
    </header>
  );
}
