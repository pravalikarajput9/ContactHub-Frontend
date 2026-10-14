import { useState, useRef } from "react";
import { DownloadIcon, UploadIcon, RefreshIcon, CheckIcon } from "./Icons";
import { storageService } from "../services/storageService";

export default function ImportExportModal({
  isOpen,
  onClose,
  ownerEmail,
  contactsCount = 0,
  onContactsImported,
  onResetSample,
}) {
  const [activeTab, setActiveTab] = useState("export");
  const [importPreview, setImportPreview] = useState(null);
  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState("");
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  function handleExportCSV() {
    const csvData = storageService.exportToCSV(ownerEmail);
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `contacthub_contacts_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function handleExportJSON() {
    const jsonData = storageService.exportToJSON(ownerEmail);
    const blob = new Blob([jsonData], {
      type: "application/json;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `contacthub_backup_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function handleFileSelected(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError("");
    setImportSuccess("");
    setImportPreview(null);

    const reader = new FileReader();

    if (file.name.endsWith(".json")) {
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          if (!Array.isArray(parsed)) {
            throw new Error("JSON file must contain an array of contacts.");
          }
          const valid = parsed.filter((c) => c && c.name && c.name.trim());
          if (valid.length === 0) {
            throw new Error("No valid contacts found in this JSON file.");
          }
          setImportPreview({
            format: "json",
            contacts: valid,
            filename: file.name,
          });
        } catch (err) {
          setImportError(err.message || "Failed to parse JSON file.");
        }
      };
      reader.readAsText(file);
    } else {
      // Default treat as CSV
      reader.onload = (event) => {
        try {
          const text = event.target.result;
          const parsed = storageService.parseCSV(text);
          if (parsed.length === 0) {
            throw new Error(
              "No valid contacts detected in this CSV. Make sure it has a header line with 'Name'."
            );
          }
          setImportPreview({
            format: "csv",
            contacts: parsed,
            filename: file.name,
          });
        } catch (err) {
          setImportError(err.message || "Failed to parse CSV file.");
        }
      };
      reader.readAsText(file);
    }
  }

  function handleExecuteImport() {
    if (!importPreview || !importPreview.contacts.length) return;
    try {
      const added = storageService.importContacts(
        importPreview.contacts,
        ownerEmail
      );
      setImportSuccess(`Successfully imported ${added} contact(s)!`);
      setImportPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      onContactsImported();
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setImportError(err.message || "Import failed.");
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container backup-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Data Backup & Sync</h2>
            <p className="modal-subtitle">
              Export your address book to CSV/JSON or import from external files.
            </p>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="backup-tabs">
          <button
            type="button"
            className={`backup-tab ${activeTab === "export" ? "active" : ""}`}
            onClick={() => setActiveTab("export")}
          >
            <DownloadIcon size={16} />
            <span>Export Contacts</span>
          </button>
          <button
            type="button"
            className={`backup-tab ${activeTab === "import" ? "active" : ""}`}
            onClick={() => setActiveTab("import")}
          >
            <UploadIcon size={16} />
            <span>Import Contacts</span>
          </button>
          <button
            type="button"
            className={`backup-tab ${activeTab === "reset" ? "active" : ""}`}
            onClick={() => setActiveTab("reset")}
          >
            <RefreshIcon size={16} />
            <span>Sample Data</span>
          </button>
        </div>

        <div className="backup-modal-body">
          {activeTab === "export" && (
            <div className="tab-pane">
              <p className="pane-lead">
                Export all <strong>{contactsCount}</strong> contacts saved in
                your offline address book.
              </p>

              <div className="export-options-grid">
                <div className="export-card">
                  <div className="export-card-header">
                    <span className="file-pill">CSV</span>
                    <h4>Standard CSV Spreadsheet</h4>
                  </div>
                  <p className="export-desc">
                    Compatible with Microsoft Excel, Google Contacts, Apple
                    Contacts, and Outlook.
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary btn-block"
                    onClick={handleExportCSV}
                    disabled={contactsCount === 0}
                  >
                    <DownloadIcon size={15} />
                    <span>Download .CSV</span>
                  </button>
                </div>

                <div className="export-card">
                  <div className="export-card-header">
                    <span className="file-pill purple">JSON</span>
                    <h4>Complete JSON Backup</h4>
                  </div>
                  <p className="export-desc">
                    Raw structured format preserving all fields, tags, colors, and
                    metadata.
                  </p>
                  <button
                    type="button"
                    className="btn btn-outline btn-block"
                    onClick={handleExportJSON}
                    disabled={contactsCount === 0}
                  >
                    <DownloadIcon size={15} />
                    <span>Download .JSON</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "import" && (
            <div className="tab-pane">
              <p className="pane-lead">
                Upload a <strong>.CSV</strong> or <strong>.JSON</strong> file to
                add multiple contacts at once.
              </p>

              <div
                className="drop-zone"
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadIcon size={32} className="drop-icon" />
                <p className="drop-text">
                  Click to choose a file or drag & drop here
                </p>
                <span className="drop-hint">Supports .csv or .json files</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.json"
                  style={{ display: "none" }}
                  onChange={handleFileSelected}
                />
              </div>

              {importError && (
                <div className="notice error">{importError}</div>
              )}

              {importSuccess && (
                <div className="notice success">
                  <CheckIcon size={16} /> {importSuccess}
                </div>
              )}

              {importPreview && (
                <div className="import-preview-box">
                  <div className="preview-header">
                    <span className="preview-filename">
                      📄 {importPreview.filename}
                    </span>
                    <span className="preview-badge">
                      {importPreview.contacts.length} Contact(s) Detected
                    </span>
                  </div>

                  <ul className="preview-list">
                    {importPreview.contacts.slice(0, 5).map((c, i) => (
                      <li key={i} className="preview-item">
                        <strong>{c.name}</strong>
                        <span>{c.email || c.phone || "No direct phone/email"}</span>
                        {c.company && <em>({c.company})</em>}
                      </li>
                    ))}
                    {importPreview.contacts.length > 5 && (
                      <li className="preview-more">
                        + {importPreview.contacts.length - 5} more contact(s)
                      </li>
                    )}
                  </ul>

                  <button
                    type="button"
                    className="btn btn-primary btn-block mt-3"
                    onClick={handleExecuteImport}
                  >
                    Import {importPreview.contacts.length} Contacts Now
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "reset" && (
            <div className="tab-pane">
              <div className="reset-data-card">
                <h4>Reset Sample Contacts</h4>
                <p>
                  Want to test the app with fresh sample data? You can restore the
                  curated demo contact set (Product managers, engineers,
                  executives) with one click.
                </p>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    if (
                      window.confirm(
                        "Are you sure you want to reset your contacts to the default sample dataset?"
                      )
                    ) {
                      onResetSample();
                      onClose();
                    }
                  }}
                >
                  <RefreshIcon size={15} />
                  <span>Restore Sample Contacts</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
