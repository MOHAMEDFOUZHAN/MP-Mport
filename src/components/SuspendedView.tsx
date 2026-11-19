import React from "react";
import { AlertTriangle, Phone, MessageSquare } from "lucide-react";
import { QRProfile } from "../types";

interface SuspendedViewProps {
  profile: QRProfile;
}

export const SuspendedView: React.FC<SuspendedViewProps> = ({ profile }) => {
  const adminContact = profile.admin_contact || profile.client_phone || "+91 63691 11820";
  const cleanPhone = adminContact.replace(/[^0-9+]/g, "");

  const waUrl = cleanPhone
    ? `https://wa.me/${cleanPhone.replace(/^\+/, "")}?text=${encodeURIComponent(
        `Hello, I would like to inquire about activating the profile for ${profile.business_name} (${profile.slug}).`
      )}`
    : "";

  return (
    <div className="scanner-suspended-box">
      <div className="suspended-icon-circle">
        <AlertTriangle size={32} />
      </div>

      <span className="suspended-badge">Subscription Notice</span>

      <h2 className="suspended-title">Page Temporarily Inactive</h2>

      <p className="suspended-desc">
        {profile.inactive_message ||
          `The digital QR profile for ${profile.business_name} is temporarily inactive pending annual subscription renewal.`}
      </p>

      {waUrl ? (
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-suspended-contact"
        >
          <MessageSquare size={18} />
          Contact Support on WhatsApp
        </a>
      ) : cleanPhone ? (
        <a href={`tel:${cleanPhone}`} className="btn-suspended-contact">
          <Phone size={18} />
          Call Support ({adminContact})
        </a>
      ) : (
        <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
          Please contact support to renew your service.
        </div>
      )}
    </div>
  );
};

