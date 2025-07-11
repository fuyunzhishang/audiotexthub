"use client";

import { GoogleAnalytics as NextGoogleAnalytics } from "@next/third-parties/google";

export default function GoogleAnalytics() {
  const analyticsId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;
  
  // 在开发环境下，如果没有设置 GA ID，使用一个测试 ID
  if (!analyticsId) {
    if (process.env.NODE_ENV === "development") {
      console.log("⚠️ Google Analytics ID not set. Analytics events will be logged to console only.");
    }
    return null;
  }

  // 允许在开发环境使用 GA（如果设置了 ID）
  // 在开发环境启用 debug_mode
  const debugMode = process.env.NODE_ENV === 'development';
  
  return (
    <>
      <NextGoogleAnalytics gaId={analyticsId} />
      {debugMode && (
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('config', '${analyticsId}', {
                debug_mode: true
              });
            `,
          }}
        />
      )}
    </>
  );
}
