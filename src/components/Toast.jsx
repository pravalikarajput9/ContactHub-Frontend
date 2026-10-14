import { useEffect } from "react";
import { CheckIcon, TrashIcon } from "./Icons";

export default function Toast({ toast, onClose, onUndo }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, toast.duration || 4000);

    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div className={`toast-notification toast-${toast.type || "info"}`}>
      <div className="toast-icon">
        {toast.type === "success" && <CheckIcon size={16} />}
        {toast.type === "delete" && <TrashIcon size={16} />}
        {toast.type === "error" && "!"}
        {(!toast.type || toast.type === "info") && "ℹ"}
      </div>
      <div className="toast-content">
        <p className="toast-message">{toast.message}</p>
      </div>
      {toast.undoAction && (
        <button
          type="button"
          className="toast-undo-btn"
          onClick={() => {
            if (onUndo) onUndo(toast.undoAction);
            onClose();
          }}
        >
          Undo
        </button>
      )}
      <button type="button" className="toast-close-btn" onClick={onClose}>
        ×
      </button>
    </div>
  );
}
