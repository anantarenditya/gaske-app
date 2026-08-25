# 🛵📦 GASKE — Platform Transportasi & Pengiriman Lokal

> **Tagline:** *"Mau ke mana? GASKE."*

GASKE adalah platform lokal yang menghubungkan pelanggan (*customer*) dengan mitra *driver* untuk dua layanan utama:
- 🛵 **GASKE RIDE:** Layanan antar-jemput penumpang menggunakan sepeda motor.
- 📦 **GASKE SEND:** Layanan pengiriman barang atau dokumen cepat.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS, shadcn/ui, Lucide React
- **Backend & Database:** Supabase, PostgreSQL, Supabase Auth, Supabase Realtime, Supabase Storage
- **Map & Geolocation:** Mapbox / Google Maps API (Abstraction Layer)
- **Charts:** Recharts

---

## 📂 Struktur Directory

```text
gaske/
├── app/                  # Route Handlers & App Pages (Next.js App Router)
│   ├── page.tsx          # Landing Page Utama
│   ├── login/            # Authentication Login
│   ├── register/         # Authentication Register Customer
│   ├── customer/         # Dashboard Customer
│   ├── driver/           # Dashboard Driver & Register Driver
│   └── admin/            # Dashboard Admin
├── components/           # Reusable UI & Business Components
├── lib/                  # Business Logic & Integrations
│   ├── supabase/         # Client & Server Supabase Config
│   ├── pricing/          # Simulator & Calculator Tarif GASKE
│   ├── maps/             # Abstraction Layer untuk Map
│   └── utils/            # Helper & Formatting (Rupiah, Date)
├── types/                # TypeScript Interfaces & Enums
├── middleware.ts         # Role-Based Access Control & Route Protection
├── supabase/             # Migration Files & Database Seed
└── .env.local            # Environment Variables (Private)