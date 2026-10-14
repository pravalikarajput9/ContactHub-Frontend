import { sampleContacts } from "./mockData";

const USERS_KEY = "contacthub_users_v1";
const ACTIVE_USER_KEY = "contacthub_active_user_v1";
const CONTACTS_PREFIX = "contacthub_contacts_v1_";
const THEME_KEY = "contacthub_theme_v1";

// Helper to safely access localStorage
function getStorage(key, fallback = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (err) {
    console.error("Error reading localStorage:", err);
    return fallback;
  }
}

function setStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error("Error writing to localStorage:", err);
  }
}

export const storageService = {
  // Theme preferences
  getTheme() {
    return localStorage.getItem(THEME_KEY) || "light";
  },

  setTheme(theme) {
    try {
      localStorage.setItem(THEME_KEY, theme);
      if (theme === "dark") {
        document.documentElement.classList.add("dark-mode");
      } else {
        document.documentElement.classList.remove("dark-mode");
      }
    } catch (err) {
      console.error("Theme storage error:", err);
    }
  },

  // User Management
  getActiveUser() {
    return getStorage(ACTIVE_USER_KEY, null);
  },

  setActiveUser(user) {
    if (user) {
      setStorage(ACTIVE_USER_KEY, user);
    } else {
      try {
        localStorage.removeItem(ACTIVE_USER_KEY);
      } catch (err) {
        console.error("Active user remove error:", err);
      }
    }
  },

  getAllUsers() {
    return getStorage(USERS_KEY, []);
  },

  registerUser({ name, email, password, avatarColor = "#5546e8" }) {
    const cleanEmail = email.trim().toLowerCase();
    const users = this.getAllUsers();

    if (users.some((u) => u.email === cleanEmail)) {
      throw new Error("An account with this email address already exists.");
    }

    const newUser = {
      id: "user-" + Date.now(),
      name: name.trim(),
      email: cleanEmail,
      password: btoa(password), // Simple base64 encoding for offline mock security
      avatarColor,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    setStorage(USERS_KEY, users);

    // Seed sample contacts for new users so the dashboard is immediately interactive
    this.seedUserContacts(cleanEmail);

    return {
      name: newUser.name,
      email: newUser.email,
      avatarColor: newUser.avatarColor,
    };
  },

  loginUser({ email, password }) {
    const cleanEmail = email.trim().toLowerCase();
    const users = this.getAllUsers();

    const user = users.find(
      (u) => u.email === cleanEmail && u.password === btoa(password)
    );

    if (!user) {
      throw new Error("Invalid email or password. Please check your credentials.");
    }

    const sessionUser = {
      name: user.name,
      email: user.email,
      avatarColor: user.avatarColor || "#5546e8",
    };

    this.setActiveUser(sessionUser);
    return sessionUser;
  },

  loginAsGuest() {
    const guestUser = {
      name: "Demo Explorer",
      email: "guest@contacthub.local",
      avatarColor: "#10b981",
      isGuest: true,
    };

    // Ensure sample contacts exist for the guest
    const userContactsKey = CONTACTS_PREFIX + guestUser.email;
    if (!localStorage.getItem(userContactsKey)) {
      this.seedUserContacts(guestUser.email);
    }

    this.setActiveUser(guestUser);
    return guestUser;
  },

  logoutUser() {
    this.setActiveUser(null);
  },

  // Contact Storage per User
  seedUserContacts(ownerEmail) {
    const key = CONTACTS_PREFIX + ownerEmail.toLowerCase();
    const cloned = sampleContacts.map((c) => ({
      ...c,
      id: "cnt-" + Math.random().toString(36).substring(2, 9),
      ownerEmail: ownerEmail.toLowerCase(),
    }));
    setStorage(key, cloned);
    return cloned;
  },

  getContacts(ownerEmail) {
    if (!ownerEmail) return [];
    const key = CONTACTS_PREFIX + ownerEmail.toLowerCase();
    const stored = getStorage(key, null);

    if (!stored) {
      return this.seedUserContacts(ownerEmail);
    }
    return stored;
  },

  saveContacts(ownerEmail, contacts) {
    const key = CONTACTS_PREFIX + ownerEmail.toLowerCase();
    setStorage(key, contacts);
  },

  createContact(contactData, ownerEmail) {
    if (!ownerEmail) throw new Error("Owner email is required.");
    if (!contactData.name || !contactData.name.trim()) {
      throw new Error("Contact name is required.");
    }

    const contacts = this.getContacts(ownerEmail);
    const newContact = {
      id: "cnt-" + Date.now().toString(36) + "-" + Math.random().toString(36).substr(2, 5),
      name: contactData.name.trim(),
      email: (contactData.email || "").trim(),
      phone: (contactData.phone || "").trim(),
      company: (contactData.company || "").trim(),
      jobTitle: (contactData.jobTitle || "").trim(),
      category: contactData.category || "Work",
      tags: Array.isArray(contactData.tags)
        ? contactData.tags
        : (contactData.tags || "")
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
      address: (contactData.address || "").trim(),
      notes: (contactData.notes || "").trim(),
      isFavorite: !!contactData.isFavorite,
      avatarColor: contactData.avatarColor || this.getRandomAvatarColor(contactData.name),
      ownerEmail: ownerEmail.toLowerCase(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    contacts.unshift(newContact);
    this.saveContacts(ownerEmail, contacts);
    return newContact;
  },

  updateContact(id, contactData, ownerEmail) {
    if (!ownerEmail) throw new Error("Owner email is required.");
    const contacts = this.getContacts(ownerEmail);
    const index = contacts.findIndex((c) => c.id === id);

    if (index === -1) {
      throw new Error("Contact not found.");
    }

    const updated = {
      ...contacts[index],
      ...contactData,
      name: contactData.name?.trim() || contacts[index].name,
      email: (contactData.email !== undefined ? contactData.email : contacts[index].email).trim(),
      phone: (contactData.phone !== undefined ? contactData.phone : contacts[index].phone).trim(),
      company: (contactData.company !== undefined ? contactData.company : contacts[index].company).trim(),
      jobTitle: (contactData.jobTitle !== undefined ? contactData.jobTitle : contacts[index].jobTitle).trim(),
      category: contactData.category || contacts[index].category || "Work",
      tags: Array.isArray(contactData.tags)
        ? contactData.tags
        : typeof contactData.tags === "string"
        ? contactData.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : contacts[index].tags || [],
      address: (contactData.address !== undefined ? contactData.address : contacts[index].address).trim(),
      notes: (contactData.notes !== undefined ? contactData.notes : contacts[index].notes).trim(),
      isFavorite: contactData.isFavorite !== undefined ? !!contactData.isFavorite : contacts[index].isFavorite,
      avatarColor: contactData.avatarColor || contacts[index].avatarColor,
      updatedAt: new Date().toISOString(),
    };

    contacts[index] = updated;
    this.saveContacts(ownerEmail, contacts);
    return updated;
  },

  deleteContact(id, ownerEmail) {
    const contacts = this.getContacts(ownerEmail);
    const contactToDelete = contacts.find((c) => c.id === id);
    const filtered = contacts.filter((c) => c.id !== id);
    this.saveContacts(ownerEmail, filtered);
    return contactToDelete;
  },

  batchDeleteContacts(ids, ownerEmail) {
    const contacts = this.getContacts(ownerEmail);
    const filtered = contacts.filter((c) => !ids.includes(c.id));
    this.saveContacts(ownerEmail, filtered);
    return filtered;
  },

  toggleFavorite(id, ownerEmail) {
    const contacts = this.getContacts(ownerEmail);
    const target = contacts.find((c) => c.id === id);
    if (target) {
      target.isFavorite = !target.isFavorite;
      target.updatedAt = new Date().toISOString();
      this.saveContacts(ownerEmail, contacts);
    }
    return target;
  },

  resetContactsToSample(ownerEmail) {
    return this.seedUserContacts(ownerEmail);
  },

  getRandomAvatarColor(name = "") {
    const palette = [
      "#6366f1", // Indigo
      "#0ea5e9", // Sky
      "#10b981", // Emerald
      "#f59e0b", // Amber
      "#ec4899", // Pink
      "#8b5cf6", // Purple
      "#14b8a6", // Teal
      "#f43f5e", // Rose
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return palette[Math.abs(hash) % palette.length];
  },

  // Export to CSV
  exportToCSV(ownerEmail) {
    const contacts = this.getContacts(ownerEmail);
    const headers = [
      "Name",
      "Email",
      "Phone",
      "Company",
      "Job Title",
      "Category",
      "Tags",
      "Address",
      "Notes",
      "Favorite",
    ];

    const rows = contacts.map((c) => [
      `"${(c.name || "").replace(/"/g, '""')}"`,
      `"${(c.email || "").replace(/"/g, '""')}"`,
      `"${(c.phone || "").replace(/"/g, '""')}"`,
      `"${(c.company || "").replace(/"/g, '""')}"`,
      `"${(c.jobTitle || "").replace(/"/g, '""')}"`,
      `"${(c.category || "Work").replace(/"/g, '""')}"`,
      `"${(Array.isArray(c.tags) ? c.tags.join("; ") : "").replace(/"/g, '""')}"`,
      `"${(c.address || "").replace(/"/g, '""')}"`,
      `"${(c.notes || "").replace(/"/g, '""')}"`,
      c.isFavorite ? "Yes" : "No",
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    return csvContent;
  },

  // Export to JSON
  exportToJSON(ownerEmail) {
    const contacts = this.getContacts(ownerEmail);
    return JSON.stringify(contacts, null, 2);
  },

  // Parse CSV Import
  parseCSV(text) {
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) return [];

    // Simple robust CSV row splitter supporting quotes
    function splitCSVRow(row) {
      const result = [];
      let current = "";
      let inQuotes = false;

      for (let i = 0; i < row.length; i++) {
        const char = row[i];
        if (char === '"') {
          if (inQuotes && row[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === "," && !inQuotes) {
          result.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    }

    const headers = splitCSVRow(lines[0]).map((h) => h.toLowerCase());
    const contacts = [];

    for (let i = 1; i < lines.length; i++) {
      const values = splitCSVRow(lines[i]);
      if (values.length === 0 || !values.some((v) => v.length > 0)) continue;

      const obj = {};
      headers.forEach((h, idx) => {
        obj[h] = values[idx] || "";
      });

      const name = obj.name || obj["full name"] || values[0] || "";
      if (!name) continue;

      const tags = obj.tags
        ? obj.tags.split(/[;,]/).map((t) => t.trim()).filter(Boolean)
        : [];

      contacts.push({
        name,
        email: obj.email || "",
        phone: obj.phone || obj["phone number"] || "",
        company: obj.company || obj["organization"] || "",
        jobTitle: obj["job title"] || obj.title || obj.role || "",
        category: obj.category || "Work",
        tags,
        address: obj.address || "",
        notes: obj.notes || "",
        isFavorite: /^(yes|true|1)$/i.test(obj.favorite || obj["is favorite"] || ""),
      });
    }

    return contacts;
  },

  importContacts(parsedContacts, ownerEmail) {
    if (!ownerEmail) throw new Error("Owner email is required.");
    const existing = this.getContacts(ownerEmail);
    let addedCount = 0;

    for (const item of parsedContacts) {
      if (!item.name || !item.name.trim()) continue;
      const newContact = {
        id: "cnt-" + Date.now().toString(36) + "-" + Math.random().toString(36).substr(2, 5),
        name: item.name.trim(),
        email: (item.email || "").trim(),
        phone: (item.phone || "").trim(),
        company: (item.company || "").trim(),
        jobTitle: (item.jobTitle || "").trim(),
        category: item.category || "Work",
        tags: Array.isArray(item.tags) ? item.tags : [],
        address: (item.address || "").trim(),
        notes: (item.notes || "").trim(),
        isFavorite: !!item.isFavorite,
        avatarColor: this.getRandomAvatarColor(item.name),
        ownerEmail: ownerEmail.toLowerCase(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      existing.unshift(newContact);
      addedCount++;
    }

    this.saveContacts(ownerEmail, existing);
    return addedCount;
  },
};
