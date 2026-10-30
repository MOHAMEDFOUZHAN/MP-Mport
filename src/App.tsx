import React, { useEffect, useState } from "react";
import { QRProfile } from "./types";
import { fetchProfileBySlug, recordProfileVisit } from "./supabase";
import { PublicProfileView } from "./components/PublicProfileView";
import { SuspendedView } from "./components/SuspendedView";
import { NotFoundView } from "./components/NotFoundView";

export const App: React.FC = () => {
  const [slug, setSlug] = useState<string>("");
  const [profile, setProfile] = useState<QRProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
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
      setLoading(true);
      const data = await fetchProfileBySlug(currentSlug);
      setProfile(data);
      setLoading(false);

      if (data && data.is_active && !data.is_suspended) {
        recordProfileVisit(data.id);
        // Set document title dynamically
        document.title = `${data.business_name} | Maple Connect`;
      }
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
      ) : profile.is_suspended || !profile.is_active ? (
        <SuspendedView profile={profile} />
      ) : (
        <PublicProfileView profile={profile} />
      )}
    </div>
  );
};

export default App;

