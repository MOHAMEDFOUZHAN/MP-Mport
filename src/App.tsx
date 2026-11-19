import React, { useEffect, useState } from "react";
import { QRProfile } from "./types";
import { fetchProfileBySlug, getCachedProfile, recordProfileVisit } from "./supabase";
import { PublicProfileView } from "./components/PublicProfileView";
import { SuspendedView } from "./components/SuspendedView";
import { NotFoundView } from "./components/NotFoundView";

export const isProfileExpired = (p: QRProfile): boolean => {
  if (!p.expiry_date) return false;
  try {
    const exp = new Date(p.expiry_date);
    exp.setHours(23, 59, 59, 999);
    return Date.now() > exp.getTime();
  } catch {
    return false;
  }
};

export const App: React.FC = () => {
  const [slug, setSlug] = useState<string>("");
  const [profile, setProfile] = useState<QRProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Dynamic favicon cache-buster to ensure Mport emblem is active
    try {
      const existingFavicons = document.querySelectorAll("link[rel*='icon']");
      existingFavicons.forEach((el) => el.remove());

      const icoLink = document.createElement("link");
      icoLink.rel = "icon";
      icoLink.type = "image/x-icon";
      icoLink.href = `/favicon.ico?v=3`;
      document.head.appendChild(icoLink);

      const pngLink = document.createElement("link");
      pngLink.rel = "icon";
      pngLink.type = "image/png";
      pngLink.setAttribute("sizes", "32x32");
      pngLink.href = `/favicon.png?v=3`;
      document.head.appendChild(pngLink);
    } catch {
      // Ignored in non-browser env
    }

    // Extract slug from path (/p/:slug), hash (#/p/:slug), or query (?slug=:slug)
    const extractSlug = (): string => {
      const searchParams = new URLSearchParams(window.location.search);
      const qSlug = searchParams.get("slug") || searchParams.get("p");
      if (qSlug) return qSlug.trim().toLowerCase();

      const path = window.location.pathname;
      if (path.includes("/p/")) {
        const segments = path.split("/p/")[1].split("/");
        if (segments[0]) return segments[0].trim().toLowerCase();
      }

      const hash = window.location.hash;
      if (hash.includes("/p/")) {
        const segments = hash.split("/p/")[1].split("/");
        if (segments[0]) return segments[0].trim().toLowerCase();
      }

      const cleanPath = path.replace(/^\/+|\/+$/g, "");
      if (cleanPath && cleanPath !== "index.html" && !cleanPath.includes(".")) {
        return cleanPath.trim().toLowerCase();
      }

      // Default to the first client profile or hii-copy
      return "hii-copy";
    };

    const currentSlug = extractSlug();
    setSlug(currentSlug);

    async function load() {
      // Instant render from session cache if available (< 50ms)
      const cached = getCachedProfile(currentSlug);
      if (cached) {
        setProfile(cached);
        setLoading(false);
      } else {
        setLoading(true);
      }

      const data = await fetchProfileBySlug(currentSlug);
      if (data) {
        setProfile(data);
        if (data.is_active && !data.is_suspended && !isProfileExpired(data)) {
          recordProfileVisit(data.id);
          // Set document title dynamically
          document.title = `${data.business_name} | Mport`;
        }
      }
      setLoading(false);
    }

    load();
  }, []);

  return (
    <div className="scanner-viewport">
      <div className="scanner-ambient-glow" />

      {loading ? (
        <div className="scanner-skeleton">
          <div
            className="skeleton-box"
            style={{ width: "96px", height: "96px", borderRadius: "28px" }}
          />
          <div
            className="skeleton-box"
            style={{ width: "190px", height: "24px" }}
          />
          <div
            className="skeleton-box"
            style={{ width: "240px", height: "16px" }}
          />
          <div
            className="skeleton-box"
            style={{ width: "100%", height: "48px", marginTop: "12px" }}
          />
          <div
            className="skeleton-box"
            style={{ width: "100%", height: "64px" }}
          />
          <div
            className="skeleton-box"
            style={{ width: "100%", height: "64px" }}
          />
        </div>
      ) : !profile ? (
        <NotFoundView slug={slug} />
      ) : profile.is_suspended || !profile.is_active || isProfileExpired(profile) ? (
        <SuspendedView profile={profile} />
      ) : (
        <PublicProfileView profile={profile} />
      )}
    </div>
  );
};

export default App;

