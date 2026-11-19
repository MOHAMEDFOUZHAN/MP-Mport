import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { X, Share2, Check } from "lucide-react";

interface QrModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  slug: string;
}

export const QrModal: React.FC<QrModalProps> = ({
  isOpen,
  onClose,
  title,
  slug,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const url = window.location.href;
      QRCode.toDataURL(url, {
        width: 480,
        margin: 2,
        color: {
          dark: "#5B4C3A",
          light: "#FFFFFF",
        },
      })
        .then((data) => setQrDataUrl(data))
        .catch((err) => console.error("QR Code generation error:", err));
    }
  }, [isOpen, slug]);

  if (!isOpen) return null;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: `Check out ${title} on Mport:`,
          url: window.location.href,
        });
        return;
      } catch {
        // Fallback
      }
    }
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="qr-modal-backdrop" onClick={onClose}>
      <div className="qr-modal-card" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="qr-modal-close-btn"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <h3 style={{ fontSize: "1.15rem", fontWeight: 700, marginTop: "8px" }}>
          {title}
        </h3>
        <p style={{ fontSize: "0.82rem", color: "var(--color-text-muted)", marginTop: "4px" }}>
          Scan with any mobile camera to open this page
        </p>

        {qrDataUrl ? (
          <img src={qrDataUrl} alt={`${title} QR Code`} className="qr-modal-img" />
        ) : (
          <div
            className="qr-modal-img skeleton-box"
            style={{ width: "220px", height: "220px" }}
          />
        )}

        <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
          <button
            type="button"
            onClick={handleShare}
            className="btn-save-contact-primary"
            style={{
              padding: "10px 16px",
              fontSize: "0.88rem",
              background: copied ? "#2E7D32" : undefined,
            }}
          >
            {copied ? <Check size={16} /> : <Share2 size={16} />}
            {copied ? "Link Copied!" : "Share Link"}
          </button>
        </div>
      </div>
    </div>
  );
};

