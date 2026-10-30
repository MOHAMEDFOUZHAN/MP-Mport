import React, { useState, useMemo } from "react";
import confetti from "canvas-confetti";
import {
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Clock,
  Download,
  Share2,
  QrCode,
  Search,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  ShoppingBag,
  UtensilsCrossed,
  Globe,
  Link as LinkIcon,
  X,
} from "lucide-react";
import { QRProfile, ProfileLink } from "../types";
import { recordLinkClick } from "../supabase";
import {
  WhatsAppIcon,
  InstagramIcon,
  FacebookIcon,
  YouTubeIcon,
  GoogleMapsIcon,
} from "./BrandIcons";
import { QrModal } from "./QrModal";

interface PublicProfileViewProps {
  profile: QRProfile;
}

export const PublicProfileView: React.FC<PublicProfileViewProps> = ({ profile }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [vCardSavedNotice, setVCardSavedNotice] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Phone, email, address normalization
  const rawPhone =
    profile.contact_phone ||
    profile.client_phone ||
    profile.links?.find((l) => l.link_type === "phone")?.url ||
    profile.links?.find((l) => l.link_type === "whatsapp")?.url ||
    "";
  const cleanPhone = rawPhone.replace(/[^0-9+]/g, "");

  const rawEmail =
    profile.contact_email ||
    profile.links?.find((l) => l.link_type === "email")?.url ||
    "";

  const waContactUrl = cleanPhone
    ? `https://wa.me/${cleanPhone.replace(/^\+/, "")}?text=${encodeURIComponent(
        `Hi ${profile.business_name}, I scanned your QR standee and would like to connect!`
      )}`
    : "";

  const mapsUrl = profile.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.address)}`
    : "";

  // 1-Tap Save Contact to Phone (vCard .vcf)
  const handleSaveContact = async () => {
    const vCardLines = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN;CHARSET=UTF-8:${profile.business_name}`,
      `N;CHARSET=UTF-8:;${profile.business_name};;;`,
      `ORG;CHARSET=UTF-8:${profile.business_name}`,
      profile.description
        ? `TITLE;CHARSET=UTF-8:${profile.description.substring(0, 100)}`
        : "",
      cleanPhone ? `TEL;TYPE=WORK,VOICE,PREF:${cleanPhone}` : "",
      rawEmail ? `EMAIL;TYPE=WORK,INTERNET:${rawEmail}` : "",
      profile.address
        ? `ADR;TYPE=WORK;CHARSET=UTF-8:;;${profile.address};;;;`
        : "",
      `URL:${window.location.href}`,
      "NOTE;CHARSET=UTF-8:Connected by Maple Connect - Unit of Maple Pro",
      "END:VCARD",
    ]
      .filter(Boolean)
      .join("\r\n");

    const fileName = `${profile.slug.replace(/[^a-zA-Z0-9_-]/g, "_")}.vcf`;

    // Modern Web Share API with File support
    if (typeof navigator !== "undefined" && navigator.canShare) {
      try {
        const file = new File([vCardLines], fileName, { type: "text/x-vcard" });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: profile.business_name,
          });
          triggerDelightConfetti();
          setVCardSavedNotice(true);
          return;
        }
      } catch (err: any) {
        if (err?.name === "AbortError") return;
      }
    }

    // Direct Blob Download fallback
    const blob = new Blob([vCardLines], { type: "text/x-vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    triggerDelightConfetti();
    setVCardSavedNotice(true);
  };

  const triggerDelightConfetti = () => {
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.7 },
      colors: ["#5B4C3A", "#8A7356", "#C4B39A", "#F4EFE6"],
    });
  };

  // Share profile
  const handleShareProfile = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: profile.business_name,
          text: `Connect with ${profile.business_name}:`,
          url: window.location.href,
        });
        return;
      } catch {
        // Fallback
      }
    }
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink("profile");
    setTimeout(() => setCopiedLink(null), 2500);
  };

  // Copy individual link
  const handleCopyLink = (e: React.MouseEvent, destUrl: string, linkId: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(destUrl);
    setCopiedLink(linkId);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  // Format destination URL
  const formatDestinationUrl = (link: ProfileLink): string => {
    const raw = (link.formatted_url || link.url || "").trim();
    if (/^(javascript|data|vbscript):/i.test(raw)) return "#";

    if (link.link_type === "whatsapp") {
      if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
      const num = raw.replace(/[^0-9]/g, "");
      return `https://wa.me/${num}`;
    }
    if (link.link_type === "phone") {
      if (raw.startsWith("tel:")) return raw;
      return `tel:${raw.replace(/[^0-9+]/g, "")}`;
    }
    if (link.link_type === "email") {
      if (raw.startsWith("mailto:")) return raw;
      return `mailto:${raw}`;
    }
    if (!raw.startsWith("http://") && !raw.startsWith("https://")) {
      return `https://${raw}`;
    }
    return raw;
  };

  // Render appropriate brand icon for each link
  const renderLinkIcon = (link: ProfileLink) => {
    switch (link.link_type) {
      case "whatsapp":
        return <WhatsAppIcon size={22} />;
      case "instagram":
        return <InstagramIcon size={22} />;
      case "facebook":
        return <FacebookIcon size={22} />;
      case "youtube":
        return <YouTubeIcon size={22} />;
      case "google_maps":
        return <GoogleMapsIcon size={22} />;
      case "phone":
        return <Phone size={20} color="#5B4C3A" />;
      case "email":
        return <Mail size={20} color="#5B4C3A" />;
      case "store":
        return <ShoppingBag size={20} color="#5B4C3A" />;
      case "menu":
        return <UtensilsCrossed size={20} color="#5B4C3A" />;
      case "website":
        return <Globe size={20} color="#5B4C3A" />;
      default:
        return <LinkIcon size={20} color="#5B4C3A" />;
    }
  };

  // Available categories
  const categories = useMemo(() => {
    const links = profile.links || [];
    const set = new Set<string>(["all"]);
    if (links.some((l) => l.extra_data?.badge || l.extra_data?.is_featured)) {
      set.add("featured");
    }
    if (
      links.some((l) =>
        ["instagram", "facebook", "youtube", "tiktok", "x", "linkedin"].includes(
          l.link_type
        )
      )
    ) {
      set.add("social");
    }
    if (links.some((l) => ["menu", "store"].includes(l.link_type))) {
      set.add("catalog");
    }
    if (
      links.some((l) =>
        ["whatsapp", "phone", "email", "google_maps"].includes(l.link_type)
      )
    ) {
      set.add("contact");
    }
    return Array.from(set);
  }, [profile.links]);

  // Filtered links list
  const filteredLinks = useMemo(() => {
    let list = (profile.links || []).filter((l) => l.is_enabled !== false);

    if (activeCategory === "featured") {
      list = list.filter((l) => l.extra_data?.badge || l.extra_data?.is_featured);
    } else if (activeCategory === "social") {
      list = list.filter((l) =>
        ["instagram", "facebook", "youtube", "tiktok", "x", "linkedin"].includes(
          l.link_type
        )
      );
    } else if (activeCategory === "catalog") {
      list = list.filter((l) => ["menu", "store"].includes(l.link_type));
    } else if (activeCategory === "contact") {
      list = list.filter((l) =>
        ["whatsapp", "phone", "email", "google_maps"].includes(l.link_type)
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((l) => {
        const title = (l.title || "").toLowerCase();
        const desc = (l.extra_data?.description || "").toLowerCase();
        const url = (l.url || "").toLowerCase();
        return title.includes(q) || desc.includes(q) || url.includes(q);
      });
    }

    return list;
  }, [profile.links, activeCategory, searchQuery]);

  return (
    <div className="scanner-content">
      {/* 1. Optional Announcement Banner */}
      {profile.announcement && (
        <div className="scanner-announcement">
          <Sparkles size={16} />
          <span>{profile.announcement}</span>
        </div>
      )}

      {/* 2. Profile Header */}
      <header className="scanner-header">
        <div className="scanner-avatar-wrap">
          <div className="scanner-avatar-frame">
            {profile.logo_url ? (
              <img
                src={profile.logo_url}
                alt={profile.business_name}
                className="scanner-avatar-img"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = "none";
                }}
              />
            ) : (
              <div className="scanner-avatar-placeholder">
                {(profile.business_name || "M").substring(0, 1).toUpperCase()}
              </div>
            )}
          </div>
          <div className="scanner-verified-dot" title="Verified Business Profile">
            <CheckCircle2 size={16} />
          </div>
        </div>

        <h1 className="scanner-business-name">{profile.business_name}</h1>

        {profile.description && (
          <p className="scanner-bio">{profile.description}</p>
        )}

        {/* Address and Hours Pills */}
        {(profile.address || profile.business_hours) && (
          <div className="scanner-meta-pills">
            {profile.address && (
              <a
                href={mapsUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="scanner-meta-pill"
                title="View in Google Maps"
              >
                <MapPin size={14} />
                <span>{profile.address}</span>
              </a>
            )}
            {profile.business_hours && (
              <div className="scanner-meta-pill" title="Business Hours">
                <Clock size={14} />
                <span>{profile.business_hours}</span>
              </div>
            )}
          </div>
        )}
      </header>

      {/* 3. Primary Action: Save to Phone Contacts (vCard) */}
      {(cleanPhone || rawEmail) && (
        <div className="scanner-save-contact-box">
          <button
            type="button"
            onClick={handleSaveContact}
            className="btn-save-contact-primary"
            title="1-tap to save this business directly into your phone contacts"
          >
            <Download size={18} />
            <span>Save to Phone Contacts</span>
          </button>
        </div>
      )}

      {/* Helper feedback card once contact is saved */}
      {vCardSavedNotice && (
        <div className="contact-notice-card">
          <span>Contact card downloaded! Tap notification to save to your contacts.</span>
          <button type="button" onClick={() => setVCardSavedNotice(false)}>
            ✕
          </button>
        </div>
      )}

      {/* 4. Quick Contact Shortcuts Bar */}
      <div className="scanner-shortcuts-bar">
        {cleanPhone && (
          <a
            href={`tel:${cleanPhone}`}
            className="shortcut-circle-btn"
            title={`Call ${cleanPhone}`}
          >
            <Phone size={20} />
          </a>
        )}

        {waContactUrl && (
          <a
            href={waContactUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shortcut-circle-btn"
            title="Chat on WhatsApp"
          >
            <WhatsAppIcon size={22} />
          </a>
        )}

        {mapsUrl && (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shortcut-circle-btn"
            title="Directions on Google Maps"
          >
            <GoogleMapsIcon size={22} />
          </a>
        )}

        {rawEmail && (
          <a
            href={`mailto:${rawEmail}`}
            className="shortcut-circle-btn"
            title={`Email ${rawEmail}`}
          >
            <Mail size={20} />
          </a>
        )}

        <button
          type="button"
          onClick={handleShareProfile}
          className="shortcut-circle-btn"
          title="Share Profile"
        >
          {copiedLink === "profile" ? (
            <Check size={20} color="#2E7D32" />
          ) : (
            <Share2 size={20} />
          )}
        </button>

        <button
          type="button"
          onClick={() => setIsQrModalOpen(true)}
          className="shortcut-circle-btn"
          title="Show QR Code on screen"
        >
          <QrCode size={20} />
        </button>
      </div>

      {/* 5. In-Page Search & Filter Tabs (if multiple links) */}
      {(profile.links || []).length > 3 && (
        <div style={{ width: "100%", marginBottom: "14px" }}>
          <div className="scanner-search-box">
            <Search size={16} className="scanner-search-icon" />
            <input
              type="text"
              placeholder="Search links, menu, socials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="scanner-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#94A3B8",
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {categories.length > 2 && (
            <div className="scanner-category-tabs">
              {categories.map((cat) => {
                const labels: Record<string, string> = {
                  all: "All",
                  featured: "Featured ⭐",
                  social: "Socials 💬",
                  catalog: "Menu & Store 🛍️",
                  contact: "Contact 📞",
                };
                return (
                  <button
                    key={cat}
                    type="button"
                    className={`category-tab-btn ${activeCategory === cat ? "active" : ""}`}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {labels[cat] || cat}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 6. Interactive Links Stream */}
      <main className="scanner-links-list">
        {filteredLinks.length === 0 ? (
          <div
            style={{
              backgroundColor: "var(--color-card-bg)",
              border: "1px solid var(--color-card-border)",
              borderRadius: "var(--radius-button)",
              padding: "24px 16px",
              textAlign: "center",
              color: "var(--color-text-muted)",
              fontSize: "0.9rem",
            }}
          >
            {searchQuery
              ? `No links matched "${searchQuery}".`
              : "No links published yet. Check back soon!"}
          </div>
        ) : (
          filteredLinks.map((link) => {
            const destUrl = formatDestinationUrl(link);
            const badgeText = link.extra_data?.badge;
            const isFeatured = link.extra_data?.is_featured || Boolean(badgeText);
            const desc = link.extra_data?.description;

            return (
              <a
                key={link.id}
                href={destUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => recordLinkClick(profile.id, link.id)}
                className={`scanner-link-card ${isFeatured ? "is-featured" : ""}`}
              >
                {badgeText && <span className="link-badge">{badgeText}</span>}

                <div className="scanner-link-icon-box">
                  {renderLinkIcon(link)}
                </div>

                <div className="scanner-link-info">
                  <span className="scanner-link-title">{link.title || "Open Link"}</span>
                  <span className="scanner-link-desc">
                    {desc || destUrl.replace(/^https?:\/\//, "")}
                  </span>
                </div>

                <div className="scanner-link-actions-end">
                  <button
                    type="button"
                    className="link-copy-btn"
                    title="Copy Link URL"
                    onClick={(e) => handleCopyLink(e, destUrl, link.id)}
                  >
                    {copiedLink === link.id ? (
                      <Check size={14} color="#2E7D32" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                  <ExternalLink size={16} className="link-chevron-icon" />
                </div>
              </a>
            );
          })
        )}
      </main>

      {/* 7. Footer Branding Attribution with Gill Sans MT for Maple Pro */}
      <footer className="scanner-footer">
        <div className="scanner-attribution">
          <span className="attr-maple-connect">Maple Connect</span>
          <span className="attr-divider">|</span>
          <span className="attr-maple-pro">Unit of Maple Pro</span>
        </div>
        <p className="attr-tagline">One QR. Everything Connected.</p>
      </footer>

      {/* In-Person QR Modal */}
      <QrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        title={profile.business_name}
        slug={profile.slug}
      />
    </div>
  );
};

