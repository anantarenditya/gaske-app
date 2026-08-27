import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development", // PWA mati saat development, aktif saat di Vercel
  register: true,
});

const nextConfig = {
  // Tambahkan konfigurasi Next.js lainnya di sini jika ada
};

export default withPWA(nextConfig);