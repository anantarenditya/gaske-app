export const playNotificationSound = () => {
  try {
    const audio = new Audio('/sounds/notification.mp3');
    audio.volume = 1.0;
    audio.play().catch((err) => {
      console.warn("Pemutaran audio diblokir oleh kebijakan browser:", err);
    });
  } catch (error) {
    console.error("Gagal memuat file audio:", error);
  }
};