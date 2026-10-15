```jsx
import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API_URL =
  "https://contacthub-backend-production.up.railway.app/api/v1";

const CONTACTS_KEY = "contacthub_contacts";

function readContacts(email) {
  try {
    const saved = JSON.parse(localStorage.getItem(CONTACTS_KEY) || "{}");
    return Array.isArray(saved[email]) ? saved[email] : [];
  } catch {
    return [];
  }
}

function saveContacts(email, contacts) {
  const saved = JSON.parse(localStorage.getItem(CONTACTS_KEY) || "{}");
  saved[email] = contacts;
  localStorage.setItem(CONTACTS_KEY, JSON.stringify(saved));
}

export default function App() {
  const [mode, setMode] = useState("login");
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("contacthub_user")) || null;
    } catch {
      return null;
    }
  });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactAddress, setContactAddress] = useState("");
  const [contactNotes, setContactNotes] = useState("");

  useEffect(() => {
    if (user?.email) {
      setContacts(readContacts(user.email));
    } else {
      setContacts([]);
    }
  }, [user?.email]);

  function updateContacts(nextContacts) {
    setContacts(nextContacts);
    if (user?.email) {
      saveContacts(user.email, nextContacts);
    }
  }

  async function submitAuth(event) {
    event.preventDefault();
    setMessage("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password.trim()) {
      setMessage("Please enter your email and password.");
      return;
    }

    if (mode === "register" && !name.trim()) {
      setMessage("Please enter your name.");
      return;
    }

    if (mode === "register" && password.length < 6) {
      setMessage("Password must contain at least 6 characters.");
      return;
    }

    setBusy(true);

    try {
      const endpoint = mode === "register" ? "register" : "login";

      const response = await fetch(`${API_URL}/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...(mode === "register" ? { name: name.trim() } : {}),
          email: cleanEmail,
          password,
        }),
      });

      const result = await response.text();

      if (!response.ok) {
        throw new Error(result || `${mode} failed. Please try again.`);
      }

      const account = {
        name: mode === "register" ? name.trim() : cleanEmail.split("@")[0],
        email: cleanEmail,
      };

      sessionStorage.setItem("contacthub_user", JSON.stringify(account));
      setUser(account);
      setPassword("");
      setMessage("");
    } catch (error) {
      console.error("Authentication error:", error);

      if (error instanceof TypeError) {
        setMessage(
          "Cannot connect to the backend. Check your Railway deployment and browser console."
        );
      } else {
        setMessage(error.message || "Something went wrong.");
      }
    } finally {
      setBusy(false);
    }
  }

  function logout() {
    sessionStorage.removeItem("contacthub_user");
    setUser(null);
    setName("");
    setEmail("");
    setPassword("");
    setMessage("");
    setSearch("");
  }

  function addContact(event) {
    event.preventDefault();

    if (!contactName.trim() || !contactPhone.trim()) {
      setMessage("Please enter the contact name and phone number.");
      return;
    }

    const newContact = {
      id: `${Date.now()}-${Math.random()}`,
      name: contactName.trim(),
      email: contactEmail.trim(),
      phone: contactPhone.trim(),
      address: contactAddress.trim(),
      notes: contactNotes.trim(),
    };

    updateContacts([newContact, ...contacts]);

    setContactName("");
    setContactEmail("");
    setContactPhone("");
    setContactAddress("");
    setContactNotes("");
    setMessage("Contact added successfully!");
  }

  function deleteContact(id) {
    updateContacts(contacts.filter((contact) => contact.id !== id));
    setMessage("Contact deleted.");
  }

  const filteredContacts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return contacts.filter((contact) =>
      [
        contact.name,
        contact.email,
        contact.phone,
        contact.address,
        contact.notes,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [contacts, search]);

  if (user) {
    return (
      <main className="app-shell">
        <header className="topbar">
          <a className="brand" href="#home">
            <span className="brand-icon">C</span>
            ContactHub
          </a>

          <div className="user-menu">
            <span className="user-email">{user.email}</span>
            <button className="button button-outline" onClick={logout}>
              Logout
            </button>
          </div>
        </header>

        <section className="dashboard">
          <div className="welcome">
            <div>
              <p className="eyebrow">YOUR PERSONAL CONTACT MANAGER</p>
              <h1>Welcome, {user.name}!</h1>
              <p className="muted">
                Keep your important contacts organized in one place.
              </p>
            </div>

            <div className="stat-card">
              <span className="stat-number">{contacts.length}</span>
              <span className="muted">Total contacts</span>
            </div>
          </div>

          {message && (
            <div className="notice" role="status">
              {message}
              <button
                className="notice-close"
                onClick={() => setMessage("")}
                aria-label="Dismiss message"
              >
                ×
              </button>
            </div>
          )}

          <div className="dashboard-grid">
            <section className="panel">
              <h2>Add a contact</h2>
              <p className="muted">Enter the details below.</p>

              <form onSubmit={addContact} className="contact-form">
                <label>
                  Full name *
                  <input
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    required
                  />
                </label>

                <label>
                  Email
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="name@example.com"
                  />
                </label>

                <label>
                  Phone number *
                  <input
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="Enter phone number"
                    required
                  />
                </label>

                <label>
                  Address
                  <input
                    value={contactAddress}
                    onChange={(e) => setContactAddress(e.target.value)}
                    placeholder="City or full address"
                  />
                </label>

                <label>
                  Notes
                  <textarea
                    value={contactNotes}
                    onChange={(e) => setContactNotes(e.target.value)}
                    placeholder="Additional information"
                    rows={3}
                  />
                </label>

                <button className="button button-primary" type="submit">
                  + Add contact
                </button>
              </form>
            </section>

            <section className="panel contacts-panel">
              <div className="contacts-heading">
                <div>
                  <h2>Your contacts</h2>
                  <p className="muted">
                    {filteredContacts.length} contact
                    {filteredContacts.length === 1 ? "" : "s"} found
                  </p>
                </div>
              </div>

              <input
                className="search-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, email, phone..."
                aria-label="Search contacts"
              />

              {filteredContacts.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">◎</div>
                  <h3>
                    {contacts.length === 0
                      ? "No contacts yet"
                      : "No matching contacts"}
                  </h3>
                  <p className="muted">
                    {contacts.length === 0
                      ? "Add your first contact using the form."
                      : "Try another search term."}
                  </p>
                </div>
              ) : (
                <div className="contact-list">
                  {filteredContacts.map((contact) => (
                    <article className="contact-card" key={contact.id}>
                      <div className="avatar">
                        {contact.name.charAt(0).toUpperCase()}
                      </div>

                      <div className="contact-details">
                        <h3>{contact.name}</h3>
                        {contact.email && <p>{contact.email}</p>}
                        <p>{contact.phone}</p>
                        {contact.address && (
                          <p className="muted">{contact.address}</p>
                        )}
                        {contact.notes && (
                          <p className="contact-notes">{contact.notes}</p>
                        )}
                      </div>

                      <button
                        className="button button-delete"
                        onClick={() => deleteContact(contact.id)}
                        aria-label={`Delete ${contact.name}`}
                      >
                        Delete
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>

          <p className="footer-note">
            ContactHub · Your contacts, organized.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-shell">
      <section className="auth-intro">
        <a className="brand brand-light" href="#home">
          <span className="brand-icon">C</span>
          ContactHub
        </a>

        <div className="intro-content">
          <p className="eyebrow">EVERY CONNECTION MATTERS</p>
          <h1>Your contacts.<br />One simple hub.</h1>
          <p>
            Organize your people, keep important details close, and make every
            connection easier to manage.
          </p>

          <div className="feature-list">
            <div><span>✓</span> Simple contact organization</div>
            <div><span>✓</span> Quick contact search</div>
            <div><span>✓</span> Easy account access</div>
          </div>
        </div>

        <p className="intro-footer">ContactHub · Stay connected.</p>
      </section>

      <section className="auth-side">
        <div className="auth-card">
          <div className="mobile-brand">
            <span className="brand-icon">C</span> ContactHub
          </div>

          <p className="eyebrow">
            {mode === "login" ? "WELCOME BACK" : "GET STARTED"}
          </p>

          <h2>
            {mode === "login" ? "Sign in to ContactHub" : "Create your account"}
          </h2>

          <p className="muted">
            {mode === "login"
              ? "Enter your details to continue."
              : "Fill in your details to get started."}
          </p>

          {message && (
            <div className="notice" role="alert">
              {message}
            </div>
          )}

          <form className="auth-form" onSubmit={submitAuth}>
            {mode === "register" && (
              <label>
                Full name
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  required
                />
              </label>
            )}

            <label>
              Email address
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                minLength={mode === "register" ? 6 : undefined}
                required
              />
            </label>

            <button
              className="button button-primary auth-submit"
              type="submit"
              disabled={busy}
            >
              {busy
                ? "Please wait..."
                : mode === "login"
                  ? "Sign in"
                  : "Create account"}
            </button>
          </form>

          <p className="auth-switch">
            {mode === "login"
              ? "Don't have an account?"
              : "Already have an account?"}{" "}
            <button
              className="text-button"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setMessage("");
              }}
            >
              {mode === "login" ? "Create account" : "Sign in"}
            </button>
          </p>
        </div>
      </section>
    </main>
  );
}
```
