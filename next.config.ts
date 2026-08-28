import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig = {
  turbopack: {}, // INI DIA KODE PENYELAMATNYA!
};

export default withPWA(nextConfig);