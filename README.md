# Maple Connect Scanner Web (React 19 + TypeScript + Vite)

The dedicated, ultra-fast mobile landing page that customers see when scanning any printed QR code.

---

## 🎨 Design & Color Theme
- **Scaffold Background**: Signature Warm Palladian Cream (`#EEE9DF` / `#F7F5F0`)
- **Primary Dominant**: Deep Espresso Clay (`#5B4C3A`)
- **Secondary Accent**: Rich Earth Brown (`#8A7356`)
- **Borders & Soft Panels**: Soft Mushroom Beige (`#C4B39A`) / Warm Putty (`#DED1BA`)
- **Light Surfaces & Button Text**: Gentle Bone White (`#F4EFE6`)
- **High Readability Text**: Dark Charcoal Brown (`#2F261F`)
- **Fonts**: `Raleway` for body/headers, and `Gill Sans MT` for the official "Unit of Maple Pro" footer.

---

## 🚀 Key Features for Scanners
1. **Dynamic Profile Header**: Verified business badge, logo/monogram, business name, bio, Google Maps directions pill, business hours pill.
2. **1-Tap Save to Phone Contacts (vCard)**: Creates an instant `.vcf` contact file or triggers the mobile native Contacts sheet.
3. **Quick Contact Shortcuts Bar**: Instant 1-tap Call 📞, WhatsApp 💬, Maps Directions 📍, Email ✉️, Share Sheet 🔗, and In-Person QR modal 📱.
4. **Interactive Links Stream**: Category tabs (All, Socials, Menu/Catalog, Contact, Featured), live search, link copy buttons, and analytics click logging.
5. **Kill-Switch & Account Protection**: If a shop's subscription is suspended or expired, shows a polite "Page Not Available" screen with direct WhatsApp/phone support button.
6. **Zero Backend Requirement**: Directly queries Supabase Cloud Database (`qr_profiles` + `profile_links`), responding globally in under 300ms.

---

## 📦 How to Host

### Option 1: Vercel (Recommended — Free & 1-Minute Setup)
1. Push this folder to GitHub or install Vercel CLI:
   ```bash
   npm i -g vercel
   vercel
   ```
2. Set Framework Preset: **Vite**
3. Output Directory: **dist**
4. Done! Vercel provides a free global HTTPS URL (e.g., `https://maple-connect.vercel.app` or your custom domain).

### Option 2: Netlify (Free Drag-and-Drop)
1. Run `npm run build` inside `web/`.
2. Go to [app.netlify.com/drop](https://app.netlify.com/drop) and drag the `dist` folder.
3. Your site is live worldwide instantly!

### Option 3: VPS / Shared Hosting (Hostinger / cPanel)
Upload the contents of the `dist/` directory to `public_html/`.

