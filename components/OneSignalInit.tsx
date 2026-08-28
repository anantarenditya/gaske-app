'use client';

import { useEffect } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    OneSignalDeferred: any[];
  }
}

export default function OneSignalInit() {
  useEffect(() => {
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async function(onesignal: any) {
      await onesignal.init({
        appId: "6d4e15c1-1ece-4bf5-92af-524f71b17a98",
        allowLocalhostAsSecureOrigin: true,
      });
    });
  }, []);

  return (
    <Script
      src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
      strategy="afterInteractive"
      async
    />
  );
}