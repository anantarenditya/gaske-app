import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig = {
  // kosongkan atau biarkan seperti yang kamu punya
};

export default withPWA(nextConfig);