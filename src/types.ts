export interface ProfileLink {
  id: string;
  profile_id?: string;
  title: string;
  url: string;
  formatted_url?: string;
  link_type: string; // 'whatsapp' | 'instagram' | 'facebook' | 'youtube' | 'phone' | 'email' | 'google_maps' | 'store' | 'menu' | 'website' | 'custom'
  icon_key?: string;
  display_order: number;
  is_enabled: boolean;
  extra_data?: {
    badge?: string;
    is_featured?: boolean;
    description?: string;
    [key: string]: any;
  };
  click_count?: number;
  created_at?: string;
}

export interface ThemeConfig {
  theme_id?: string;
  bg_color?: string;
  accent_color?: string;
  button_style?: string; // 'rounded' | 'pill' | 'card' | 'outline'
  font_style?: string; // 'sans' | 'serif' | 'display'
  layout_mode?: string; // 'list' | 'grid'
  dark_mode?: boolean;
  contact_phone?: string;
  contact_email?: string;
  address?: string;
  business_hours?: string;
  announcement?: string;
  client_name?: string;
  client_phone?: string;
  plan_price?: string;
  currency?: string;
  billing_cycle?: string;
  expiry_date?: string;
  inactive_message?: string;
  admin_contact?: string;
  qr_dark?: string;
  qr_light?: string;
  [key: string]: any;
}

export interface QRProfile {
  id: string;
  user_id?: string;
  slug: string;
  profile_name?: string;
  business_name: string;
  description?: string;
  logo_url?: string | null;
  theme_config?: ThemeConfig;
  is_active: boolean;
  is_suspended: boolean;
  qr_code_url?: string;
  created_at?: string;
  updated_at?: string;

  // Flattened convenience getters (from root or theme_config)
  contact_phone?: string;
  contact_email?: string;
  address?: string;
  business_hours?: string;
  announcement?: string;
  client_name?: string;
  client_phone?: string;
  plan_price?: string;
  currency?: string;
  expiry_date?: string;
  inactive_message?: string;
  admin_contact?: string;
  qr_dark?: string;
  qr_light?: string;

  links?: ProfileLink[];
}

