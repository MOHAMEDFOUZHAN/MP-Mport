import { createClient } from "@supabase/supabase-js";
import { QRProfile, ProfileLink } from "./types";

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || "https://toyeaxsrleefnfrznnry.supabase.co";
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "sb_publishable_t7_img-D7_CD7niRcBsS7g_zj2UEyxL";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export async function fetchProfileBySlug(slug: string): Promise<QRProfile | null> {
  const cleanSlug = slug.trim().toLowerCase();
  if (!cleanSlug) return null;

  try {
    // 1. Fetch the QR profile
    const { data: profileData, error: profileErr } = await supabase
      .from("qr_profiles")
      .select("*")
      .eq("slug", cleanSlug)
      .maybeSingle();

    if (profileErr || !profileData) {
      console.warn("Profile fetch result:", profileErr?.message || "Not found");
      return null;
    }

    // 2. Parse theme_config JSON if string or object
    let themeConfig = profileData.theme_config || {};
    if (typeof themeConfig === "string") {
      try {
        themeConfig = JSON.parse(themeConfig);
      } catch {
        themeConfig = {};
      }
    }

    // 3. Fetch active links for this profile
    const { data: linksData } = await supabase
      .from("profile_links")
      .select("*")
      .eq("profile_id", profileData.id)
      .eq("is_enabled", true)
      .order("display_order", { ascending: true });

    const rawLinks = (linksData || []).map((l: any) => {
      let extra = l.extra_data || {};
      if (typeof extra === "string") {
        try {
          extra = JSON.parse(extra);
        } catch {
          extra = {};
        }
      }
      return {
        ...l,
        extra_data: extra,
      } as ProfileLink;
    });

    const profile: QRProfile = {
      id: String(profileData.id),
      user_id: profileData.user_id,
      slug: profileData.slug,
      profile_name: profileData.profile_name || profileData.business_name,
      business_name: profileData.business_name || profileData.profile_name || "Business Profile",
      description: profileData.description || "",
      logo_url: profileData.logo_url,
      theme_config: themeConfig,
      is_active: profileData.is_active ?? true,
      is_suspended: profileData.is_suspended ?? false,
      qr_code_url: profileData.qr_code_url,
      created_at: profileData.created_at,
      updated_at: profileData.updated_at,

      // Convenience mappings
      contact_phone: profileData.contact_phone || themeConfig.contact_phone || "",
      contact_email: profileData.contact_email || themeConfig.contact_email || "",
      address: profileData.address || themeConfig.address || "",
      business_hours: profileData.business_hours || themeConfig.business_hours || "",
      announcement: profileData.announcement || themeConfig.announcement || "",
      client_name: profileData.client_name || themeConfig.client_name || "",
      client_phone: profileData.client_phone || themeConfig.client_phone || "",
      plan_price: profileData.plan_price || themeConfig.plan_price || "499",
      currency: profileData.currency || themeConfig.currency || "₹",
      expiry_date: profileData.expiry_date || themeConfig.expiry_date || "",
      inactive_message: profileData.inactive_message || themeConfig.inactive_message || "",
      admin_contact: profileData.admin_contact || themeConfig.admin_contact || "",
      qr_dark: profileData.qr_dark || themeConfig.qr_dark || "#5B4C3A",
      qr_light: profileData.qr_light || themeConfig.qr_light || "#FFFFFF",

      links: rawLinks,
    };

    return profile;
  } catch (err) {
    console.error("fetchProfileBySlug error:", err);
    return null;
  }
}

export async function recordProfileVisit(profileId: string) {
  try {
    await supabase.from("analytics_events").insert({
      profile_id: profileId,
      event_type: "profile_visit",
      device_type: /Mobile|Android|iPhone|iPad/i.test(navigator.userAgent) ? "mobile" : "desktop",
      user_agent: navigator.userAgent.substring(0, 250),
      referer: document.referrer.substring(0, 250) || "direct_qr",
    });
  } catch {
    // Non-blocking
  }
}

export async function recordLinkClick(profileId: string, linkId: string) {
  try {
    await supabase.from("analytics_events").insert({
      profile_id: profileId,
      link_id: linkId,
      event_type: "link_click",
      device_type: /Mobile|Android|iPhone|iPad/i.test(navigator.userAgent) ? "mobile" : "desktop",
      user_agent: navigator.userAgent.substring(0, 250),
    });
  } catch {
    // Non-blocking
  }
}

