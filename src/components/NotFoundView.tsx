import React from "react";
import { HelpCircle, RefreshCw } from "lucide-react";

interface NotFoundViewProps {
  slug: string;
}

export const NotFoundView: React.FC<NotFoundViewProps> = ({ slug }) => {
  return (
    <div className="scanner-suspended-box" style={{ borderColor: "var(--color-card-border)" }}>
      <div
        className="suspended-icon-circle"
        style={{ backgroundColor: "var(--color-bone-white)", color: "var(--color-espresso)" }}
      >
        <HelpCircle size={32} />
      </div>

      <span
        className="suspended-badge"
        style={{ backgroundColor: "var(--color-bone-white)", color: "var(--color-espresso)" }}
      >
        Profile Not Found
      </span>

      <h2 className="suspended-title">Unregistered QR Destination</h2>

      <p className="suspended-desc">
        The scanned QR link <code>/p/{slug || "..."}</code> does not match an active business profile.
      </p>

      <button
        type="button"
        onClick={() => window.location.reload()}
        className="btn-suspended-contact"
        style={{ background: "var(--color-espresso)", width: "auto", margin: "0 auto" }}
      >
        <RefreshCw size={16} />
        Retry Scanning
      </button>
    </div>
  );
};

