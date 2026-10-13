
import { useEffect, useMemo, useState } from "react";
import api from "./api";
import "./App.css";

const emptyContact = {
  name: "",
  email: "",
  phone: "",
  address: "",
  notes: "",
};

function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("contacthubUser")) || null;
    } catch {
      return null;
    }
  });

  const [mode, setMode] = useState("login");
  const [auth, setAuth] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyContact);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  function notify(text, isError = false) {
    setMessage(text);
    setError(isError);
  }

  function changeAuth(event) {
    setAuth({ ...auth, [event.target.name]: event.target.value });
  }

  function changeContact(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function submitAuth(event) {
    event.preventDefault();
    setMessage("");

    if (!auth.email.trim() || !auth.password) {
      notify("Enter your email and password.", true);
      return;
    }

    if (mode === "signup") {
      if (!auth.name.trim()) {
        notify("Enter your name.", true);
        return;
      }
      if (auth.password.length < 6) {
        notify("Password must contain at least 6 characters.", true);
        return;
      }
      if (auth.password !== auth.confirmPassword) {
        notify("Passwords do not match.", true);
        return;
      }
    }

    setBusy(true);
    try {
      const endpoint = mode === "signup"
        ? "/api/v1/register"
        : "/api/v1/login";

      const payload = mode === "signup"
        ? {
            name: auth.name.trim(),
            email: auth.email.trim().toLowerCase(),
            password: auth.password,
          }
        : {
            email: auth.email.trim().toLowerCase(),
            password: auth.password,
          };

      const response = await api.post(endpoint, payload);
      const result = typeof response.data === "string"
        ? response.data
        : response.data?.message || "";

      if (/invalid|failed|error|already exists/i.test(result)) {
        notify(result || "Unable to continue.", true);
        return;
      }

      if (mode === "signup") {
        notify("Account created. Please log in.");
        setMode("login");
        setAuth({
          name: "",
          email: auth.email.trim().toLowerCase(),
          password: "",
          confirmPassword: "",
        });
      } else {
        const loggedInUser = {
          email: auth.email.trim().toLowerCase(),
          name: auth.email.trim().split("@")[0],
        };

        sessionStorage.setItem(
          "contacthubUser",
          JSON.stringify(loggedInUser)
        );
        setUser(loggedInUser);
        notify("");
      }
    } catch (err) {
      notify(
        err.response?.data?.message ||
          (typeof err.response?.data === "string"
            ? err.response.data
            : "Could not connect to the server. Check that Spring Boot is running."),
        true
      );
    } finally {
      setBusy(false);
    }
  }

  async function loadContacts() {
    if (!user?.email) return;

    try {
      const response = await api.get("/api/contacts", {
        params: { ownerEmail: user.email },
      });
      setContacts(response.data);
    } catch {
      notify("Unable to load contacts. Check your backend.", true);
    }
  }

  useEffect(() => {
    if (user?.email) loadContacts();
  }, [user?.email]);

  const visibleContacts = useMemo(() => {
    const query = search.toLowerCase().trim();
    return contacts.filter((contact) =>
      [
        contact.name,
        contact.email,
        contact.phone,
        contact.address,
      ].some((value) => (value || "").toLowerCase().includes(query))
    );
  }, [contacts, search]);

  function openAddForm() {
    setEditingId(null);
    setForm(emptyContact);
    setShowForm(true);
    notify("");
  }

  function openEditForm(contact) {
    setEditingId(contact.id);
    setForm({
      name: contact.name || "",
      email: contact.email || "",
      phone: contact.phone || "",
      address: contact.address || "",
      notes: contact.notes || "",
    });
    setShowForm(true);
    notify("");
  }

  async function saveContact(event) {
    event.preventDefault();

    if (!form.name.trim()) {
      notify("Contact name is required.", true);
      return;
    }

    setBusy(true);
    try {
      const config = {
        params: { ownerEmail: user.email },
      };

      if (editingId !== null) {
        await api.put(`/api/contacts/${editingId}`, form, config);
        notify("Contact updated successfully.");
      } else {
        await api.post("/api/contacts", form, config);
        notify("Contact added successfully.");
      }

      setShowForm(false);
      setForm(emptyContact);
      setEditingId(null);
      await loadContacts();
    } catch (err) {
      notify(
        err.response?.data?.message || "Could not save this contact.",
        true
      );
    } finally {
      setBusy(false);
    }
  }

  async function deleteContact(id) {
    if (!window.confirm("Are you sure you want to delete this contact?")) {
      return;
    }

    try {
      await api.delete(`/api/contacts/${id}`, {
        params: { ownerEmail: user.email },
      });
      setContacts((current) => current.filter((c) => c.id !== id));
      notify("Contact deleted successfully.");
    } catch {
      notify("Unable to delete this contact.", true);
    }
  }

  function logout() {
    sessionStorage.removeItem("contacthubUser");
    setUser(null);
    setContacts([]);
    setSearch("");
    setShowForm(false);
    setMessage("");
    setAuth({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    setMode("login");
  }

  if (!user) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <div className="brand-mark">C</div>
          <div className="brand-name">ContactHub <span>↗</span></div>
          <h1>{mode === "login" ? "Welcome back!" : "Create your account"}</h1>
          <p className="muted">
            {mode === "login"
              ? "Enter your details to access your account."
              : "Join ContactHub to organize your contacts."}
          </p>

          <div className="auth-tabs">
            <button
              className={mode === "login" ? "active" : ""}
              onClick={() => { setMode("login"); notify(""); }}
              type="button"
            >
              Login
            </button>
            <button
              className={mode === "signup" ? "active" : ""}
              onClick={() => { setMode("signup"); notify(""); }}
              type="button"
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={submitAuth} className="auth-form">
            {mode === "signup" && (
              <label>
                Full name
                <input
                  name="name"
                  value={auth.name}
                  onChange={changeAuth}
                  placeholder="Your name"
                  autoComplete="name"
                  required
                />
              </label>
            )}

            <label>
              Email address
              <input
                type="email"
                name="email"
                value={auth.email}
                onChange={changeAuth}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                name="password"
                value={auth.password}
                onChange={changeAuth}
                placeholder="Enter your password"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                required
              />
            </label>

            {mode === "signup" && (
              <label>
                Confirm password
                <input
                  type="password"
                  name="confirmPassword"
                  value={auth.confirmPassword}
                  onChange={changeAuth}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  required
                />
              </label>
            )}

            {message && (
              <p className={error ? "notice error" : "notice success"}>
                {message}
              </p>
            )}

            <button className="primary-button" disabled={busy}>
              {busy
                ? "Please wait..."
                : mode === "login"
                  ? "Login to ContactHub →"
                  : "Create account →"}
            </button>
          </form>

          <p className="auth-switch">
            {mode === "login" ? "Don't have an account?" : "Already registered?"}
            {" "}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                notify("");
              }}
            >
              {mode === "login" ? "Sign up" : "Login"}
            </button>
          </p>

          <p className="footnote">
            By continuing, you agree to use ContactHub responsibly.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="dashboard">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark small">C</div>
          <span>ContactHub</span>
        </div>

        <p className="nav-heading">WORKSPACE</p>
        <button className="nav-item selected" type="button">
          <span>▦</span> Dashboard
        </button>
        <button
          className="nav-item"
          type="button"
          onClick={openAddForm}
        >
          <span>＋</span> Add contact
        </button>

        <div className="sidebar-bottom">
          <div className="profile-circle">
            {(user.name || user.email).charAt(0).toUpperCase()}
          </div>
          <div className="profile-info">
            <strong>{user.name}</strong>
            <span>{user.email}</span>
          </div>
          <button className="logout-button" onClick={logout} type="button">
            ↪
          </button>
        </div>
      </aside>

      <section className="dashboard-main">
        <header className="topbar">
          <div>
            <span className="eyebrow">YOUR WORKSPACE</span>
            <h1>Contacts dashboard</h1>
            <p className="muted">All your important people, in one place.</p>
          </div>
          <button className="outline-button" onClick={logout} type="button">
            Log out
          </button>
        </header>

        {message && (
          <p className={error ? "notice error" : "notice success"}>
            {message}
          </p>
        )}

        <section className="welcome-banner">
          <div>
            <p className="eyebrow">WELCOME TO CONTACTHUB</p>
            <h2>Stay connected, {user.name}.</h2>
            <p>Organize your contacts and find the right person in seconds.</p>
          </div>
          <div className="banner-icon">✳</div>
        </section>

        <section className="stats-grid">
          <article className="stat-card">
            <span className="stat-icon">♙</span>
            <p>Total contacts</p>
            <strong>{contacts.length}</strong>
            <span className="stat-caption">Saved in your workspace</span>
          </article>
          <article className="stat-card">
            <span className="stat-icon">⌕</span>
            <p>Search results</p>
            <strong>{visibleContacts.length}</strong>
            <span className="stat-caption">Matching your search</span>
          </article>
          <article className="stat-card">
            <span className="stat-icon">✓</span>
            <p>Workspace status</p>
            <strong className="online-status">Active</strong>
            <span className="stat-caption">Ready to manage contacts</span>
          </article>
        </section>

        <section className="contacts-section">
          <div className="section-heading">
            <div>
              <h2>Your contacts</h2>
              <p className="muted">Add, search, update, or remove contacts.</p>
            </div>
            <button className="primary-button add-button" onClick={openAddForm}>
              + Add contact
            </button>
          </div>

          <div className="search-box">
            <span>⌕</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, email, phone, or address..."
              aria-label="Search contacts"
            />
          </div>

          {showForm && (
            <form className="contact-form" onSubmit={saveContact}>
              <div className="form-heading">
                <h3>{editingId !== null ? "Edit contact" : "Add a new contact"}</h3>
                <button
                  type="button"
                  className="close-button"
                  onClick={() => setShowForm(false)}
                >
                  ×
                </button>
              </div>

              <div className="form-grid">
                <label>
                  Full name *
                  <input
                    name="name"
                    value={form.name}
                    onChange={changeContact}
                    placeholder="Contact name"
                    required
                  />
                </label>
                <label>
                  Email address
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={changeContact}
                    placeholder="person@example.com"
                  />
                </label>
                <label>
                  Phone number
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={changeContact}
                    placeholder="Phone number"
                  />
                </label>
                <label>
                  Address
                  <input
                    name="address"
                    value={form.address}
                    onChange={changeContact}
                    placeholder="City or address"
                  />
                </label>
                <label className="full-width">
                  Notes
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={changeContact}
                    placeholder="Additional details..."
                    rows="3"
                  />
                </label>
              </div>

              <div className="form-actions">
                <button
                  className="outline-button"
                  type="button"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button className="primary-button" disabled={busy}>
                  {busy ? "Saving..." : editingId !== null ? "Save changes" : "Save contact"}
                </button>
              </div>
            </form>
          )}

          {visibleContacts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">♧</div>
              <h3>{search ? "No matching contacts" : "Your contact list is empty"}</h3>
              <p>
                {search
                  ? "Try another name, email, phone number, or address."
                  : "Add your first contact to start building your address book."}
              </p>
              {!search && (
                <button className="primary-button" onClick={openAddForm}>
                  + Add your first contact
                </button>
              )}
            </div>
          ) : (
            <div className="contact-list">
              {visibleContacts.map((contact) => (
                <article className="contact-card" key={contact.id}>
                  <div className="contact-avatar">
                    {(contact.name || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="contact-details">
                    <h3>{contact.name}</h3>
                    <p>{contact.email || "No email added"}</p>
                    <div className="contact-meta">
                      {contact.phone && <span>☎ {contact.phone}</span>}
                      {contact.address && <span>⌖ {contact.address}</span>}
                    </div>
                    {contact.notes && <p className="contact-notes">{contact.notes}</p>}
                  </div>
                  <div className="contact-actions">
                    <button
                      className="edit-button"
                      onClick={() => openEditForm(contact)}
                      type="button"
                    >
                      Edit
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => deleteContact(contact.id)}
                      type="button"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <footer className="dashboard-footer">
          ContactHub · Your contacts, thoughtfully organized.
        </footer>
      </section>
    </main>
  );
}

export default App;


