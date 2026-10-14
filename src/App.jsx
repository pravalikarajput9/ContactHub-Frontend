import { useState, useEffect, useMemo, useCallback } from "react";
import { storageService } from "./services/storageService";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import StatsCards from "./components/StatsCards";
import ContactCard from "./components/ContactCard";
import ContactTable from "./components/ContactTable";
import ContactModal from "./components/ContactModal";
import ContactDetailModal from "./components/ContactDetailModal";
import ImportExportModal from "./components/ImportExportModal";
import AuthPage from "./components/AuthPage";
import Toast from "./components/Toast";
import { PlusIcon, TrashIcon, DownloadIcon, SparklesIcon } from "./components/Icons";
import "./App.css";

export default function App() {
  const [theme, setTheme] = useState(() => storageService.getTheme());
  const [user, setUser] = useState(() => storageService.getActiveUser());
  const [contacts, setContacts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name-asc");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedIds, setSelectedIds] = useState([]);

  // Modals state
  const [modalType, setModalType] = useState(null); // 'add' | 'edit' | 'detail' | 'backup'
  const [activeContact, setActiveContact] = useState(null);

  // Toast state
  const [toast, setToast] = useState(null);

  // Initialize theme
  useEffect(() => {
    storageService.setTheme(theme);
  }, [theme]);

  // Load contacts whenever active user changes
  useEffect(() => {
    if (user?.email) {
      const userContacts = storageService.getContacts(user.email);
      setContacts(userContacts);
      setSelectedIds([]);
    } else {
      setContacts([]);
      setSelectedIds([]);
    }
  }, [user?.email]);

  const showToast = useCallback((message, type = "success", undoAction = null) => {
    setToast({ message, type, undoAction, duration: undoAction ? 6000 : 3500 });
  }, []);

  function handleToggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    storageService.setTheme(nextTheme);
  }

  // Auth Handlers
  function handleLogin(credentials) {
    const loggedIn = storageService.loginUser(credentials);
    setUser(loggedIn);
    showToast(`Welcome back, ${loggedIn.name}!`);
  }

  function handleRegister(data) {
    const newUser = storageService.registerUser(data);
    setUser(newUser);
    showToast(`Account created! Welcome to ContactHub.`);
  }

  function handleGuestLogin() {
    const guest = storageService.loginAsGuest();
    setUser(guest);
    showToast(`Exploring in Demo Mode. Enjoy ContactHub!`, "info");
  }

  function handleLogout() {
    storageService.logoutUser();
    setUser(null);
    setContacts([]);
    setSelectedIds([]);
    showToast("Signed out successfully.", "info");
  }

  // Filtered and Sorted Contacts
  const filteredContacts = useMemo(() => {
    let result = [...contacts];

    // Filter by category
    if (activeCategory === "favorites") {
      result = result.filter((c) => c.isFavorite);
    } else if (activeCategory !== "all") {
      result = result.filter(
        (c) => (c.category || "").toLowerCase() === activeCategory.toLowerCase()
      );
    }

    // Filter by search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter((c) =>
        [
          c.name,
          c.email,
          c.phone,
          c.company,
          c.jobTitle,
          c.address,
          c.notes,
          ...(Array.isArray(c.tags) ? c.tags : []),
        ].some((val) => (val || "").toLowerCase().includes(q))
      );
    }

    // Sort contacts
    result.sort((a, b) => {
      if (sortBy === "name-asc") {
        return (a.name || "").localeCompare(b.name || "");
      }
      if (sortBy === "name-desc") {
        return (b.name || "").localeCompare(a.name || "");
      }
      if (sortBy === "newest") {
        return (
          new Date(b.updatedAt || b.createdAt || 0) -
          new Date(a.updatedAt || a.createdAt || 0)
        );
      }
      if (sortBy === "company") {
        return (a.company || "zzz").localeCompare(b.company || "zzz");
      }
      return 0;
    });

    return result;
  }, [contacts, activeCategory, searchTerm, sortBy]);

  // Contact CRUD Handlers
  function handleSaveContact(formData) {
    try {
      if (activeContact?.id) {
        // Edit existing
        const updated = storageService.updateContact(
          activeContact.id,
          formData,
          user.email
        );
        setContacts((prev) =>
          prev.map((c) => (c.id === updated.id ? updated : c))
        );
        showToast(`Updated contact for "${updated.name}".`);
      } else {
        // Create new
        const created = storageService.createContact(formData, user.email);
        setContacts((prev) => [created, ...prev]);
        showToast(`Added "${created.name}" to your contacts.`);
      }
      setModalType(null);
      setActiveContact(null);
    } catch (err) {
      showToast(err.message || "Failed to save contact.", "error");
    }
  }

  function handleDeleteContact(id) {
    const contactToDelete = contacts.find((c) => c.id === id);
    if (!contactToDelete) return;

    storageService.deleteContact(id, user.email);
    setContacts((prev) => prev.filter((c) => c.id !== id));
    setSelectedIds((prev) => prev.filter((item) => item !== id));

    showToast(
      `Deleted "${contactToDelete.name}".`,
      "delete",
      {
        type: "RESTORE_CONTACT",
        contact: contactToDelete,
      }
    );
  }

  function handleBatchDelete() {
    if (selectedIds.length === 0) return;
    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedIds.length} contact(s)?`
      )
    ) {
      return;
    }

    const backupList = contacts.filter((c) => selectedIds.includes(c.id));
    storageService.batchDeleteContacts(selectedIds, user.email);
    setContacts((prev) => prev.filter((c) => !selectedIds.includes(c.id)));
    setSelectedIds([]);

    showToast(
      `Deleted ${backupList.length} contact(s).`,
      "delete",
      {
        type: "RESTORE_BATCH",
        contacts: backupList,
      }
    );
  }

  function handleUndoAction(action) {
    if (!action) return;
    if (action.type === "RESTORE_CONTACT" && action.contact) {
      const restored = storageService.createContact(action.contact, user.email);
      setContacts((prev) => [restored, ...prev]);
      showToast(`Restored "${restored.name}".`);
    } else if (action.type === "RESTORE_BATCH" && action.contacts) {
      storageService.importContacts(action.contacts, user.email);
      const reloaded = storageService.getContacts(user.email);
      setContacts(reloaded);
      showToast(`Restored ${action.contacts.length} contacts.`);
    }
  }

  function handleToggleFavorite(id) {
    const updated = storageService.toggleFavorite(id, user.email);
    if (updated) {
      setContacts((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isFavorite: updated.isFavorite } : c))
      );
    }
  }

  function handleResetSampleContacts() {
    const resetList = storageService.resetContactsToSample(user.email);
    setContacts(resetList);
    setSelectedIds([]);
    showToast("Restored demo sample contacts.", "info");
  }

  function handleContactsImported() {
    const reloaded = storageService.getContacts(user.email);
    setContacts(reloaded);
    showToast("Contacts imported successfully!");
  }

  // Selection handlers
  function handleToggleSelect(id) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }

  function handleSelectAll() {
    if (selectedIds.length === filteredContacts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredContacts.map((c) => c.id));
    }
  }

  function handleExportSelectedCSV() {
    const selectedContacts = contacts.filter((c) => selectedIds.includes(c.id));
    if (selectedContacts.length === 0) return;

    const headers = ["Name", "Email", "Phone", "Company", "Job Title", "Category", "Address", "Notes"];
    const rows = selectedContacts.map((c) => [
      `"${(c.name || "").replace(/"/g, '""')}"`,
      `"${(c.email || "").replace(/"/g, '""')}"`,
      `"${(c.phone || "").replace(/"/g, '""')}"`,
      `"${(c.company || "").replace(/"/g, '""')}"`,
      `"${(c.jobTitle || "").replace(/"/g, '""')}"`,
      `"${(c.category || "Work").replace(/"/g, '""')}"`,
      `"${(c.address || "").replace(/"/g, '""')}"`,
      `"${(c.notes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `selected_contacts_${selectedIds.length}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Exported ${selectedIds.length} contact(s) to CSV.`);
  }

  // If no user is logged in, show Auth Page
  if (!user) {
    return (
      <AuthPage
        onLogin={handleLogin}
        onRegister={handleRegister}
        onGuestLogin={handleGuestLogin}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />
    );
  }

  return (
    <div className="app-layout">
      <Sidebar
        user={user}
        contacts={contacts}
        activeCategory={activeCategory}
        onSelectCategory={(catId) => {
          setActiveCategory(catId);
          setSelectedIds([]);
        }}
        onOpenAddModal={() => {
          setActiveContact(null);
          setModalType("add");
        }}
        onOpenBackupModal={() => setModalType("backup")}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      <main className="dashboard-main">
        <Navbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          onOpenAddModal={() => {
            setActiveContact(null);
            setModalType("add");
          }}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />

        {/* Welcome & Stats */}
        <div className="dashboard-content">
          <section className="welcome-banner">
            <div>
              <p className="eyebrow">CONTACTHUB • ALL-IN-ONE JAVASCRIPT APP</p>
              <h2>Stay connected, {user.name}.</h2>
              <p>
                Manage your network seamlessly with instant offline local storage. No external servers or database setup required.
              </p>
            </div>
            <div className="banner-icon">
              <SparklesIcon size={38} />
            </div>
          </section>

          <StatsCards contacts={contacts} />

          {/* Section Toolbar / Heading */}
          <section className="contacts-section">
            <div className="section-heading">
              <div className="section-title-wrap">
                <h2>
                  {activeCategory === "all"
                    ? "All Contacts"
                    : activeCategory === "favorites"
                    ? "Starred Favorites"
                    : `${activeCategory} Contacts`}
                </h2>
                <p className="muted">
                  Showing {filteredContacts.length} of {contacts.length} total contacts
                </p>
              </div>

              <div className="section-heading-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setModalType("backup")}
                >
                  <DownloadIcon size={14} />
                  <span>Import / Export</span>
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setActiveContact(null);
                    setModalType("add");
                  }}
                >
                  <PlusIcon size={14} />
                  <span>New Contact</span>
                </button>
              </div>
            </div>

            {/* Batch actions bar when items are selected */}
            {selectedIds.length > 0 && (
              <div className="batch-actions-bar">
                <div className="batch-info">
                  <span className="batch-badge">{selectedIds.length}</span>
                  <span>Contact(s) Selected</span>
                </div>
                <div className="batch-buttons">
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={handleExportSelectedCSV}
                  >
                    <DownloadIcon size={13} />
                    <span>Export Selected</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={handleBatchDelete}
                  >
                    <TrashIcon size={13} />
                    <span>Delete Selected ({selectedIds.length})</span>
                  </button>
                  <button
                    type="button"
                    className="btn-text-sm"
                    onClick={() => setSelectedIds([])}
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            )}

            {/* Contact list or empty state */}
            {filteredContacts.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">⌕</div>
                <h3>
                  {searchTerm
                    ? `No contacts match "${searchTerm}"`
                    : activeCategory === "favorites"
                    ? "No starred contacts yet"
                    : "No contacts in this category"}
                </h3>
                <p>
                  {searchTerm
                    ? "Try adjusting your search terms or clearing filters."
                    : "Click below to add a new contact or import from a file."}
                </p>
                <div className="empty-state-buttons">
                  {searchTerm && (
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => setSearchTerm("")}
                    >
                      Clear Search
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      setActiveContact(null);
                      setModalType("add");
                    }}
                  >
                    <PlusIcon size={14} />
                    <span>Add New Contact</span>
                  </button>
                </div>
              </div>
            ) : viewMode === "grid" ? (
              <div className="contacts-grid">
                {filteredContacts.map((contact) => (
                  <ContactCard
                    key={contact.id}
                    contact={contact}
                    onEdit={(c) => {
                      setActiveContact(c);
                      setModalType("edit");
                    }}
                    onDelete={handleDeleteContact}
                    onToggleFavorite={handleToggleFavorite}
                    onSelectDetails={(c) => {
                      setActiveContact(c);
                      setModalType("detail");
                    }}
                  />
                ))}
              </div>
            ) : (
              <ContactTable
                contacts={filteredContacts}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
                onSelectAll={handleSelectAll}
                onEdit={(c) => {
                  setActiveContact(c);
                  setModalType("edit");
                }}
                onDelete={handleDeleteContact}
                onToggleFavorite={handleToggleFavorite}
                onSelectDetails={(c) => {
                  setActiveContact(c);
                  setModalType("detail");
                }}
              />
            )}
          </section>
        </div>

        <footer className="dashboard-footer">
          ContactHub • High-performance JavaScript Address Book with Offline Local Storage
        </footer>
      </main>

      {/* Modals */}
      <ContactModal
        isOpen={modalType === "add" || modalType === "edit"}
        initialData={activeContact}
        onSave={handleSaveContact}
        onClose={() => {
          setModalType(null);
          setActiveContact(null);
        }}
      />

      <ContactDetailModal
        contact={activeContact}
        onClose={() => {
          setActiveContact(null);
          if (modalType === "detail") setModalType(null);
        }}
        onEdit={(c) => {
          setActiveContact(c);
          setModalType("edit");
        }}
        onDelete={handleDeleteContact}
        onToggleFavorite={handleToggleFavorite}
      />

      <ImportExportModal
        isOpen={modalType === "backup"}
        onClose={() => setModalType(null)}
        ownerEmail={user.email}
        contactsCount={contacts.length}
        onContactsImported={handleContactsImported}
        onResetSample={handleResetSampleContacts}
      />

      {/* Floating Toast Notification */}
      <Toast
        toast={toast}
        onClose={() => setToast(null)}
        onUndo={handleUndoAction}
      />
    </div>
  );
}
