"use client";

import { Card } from "@/components/ui/card";

interface MultilingualBannerProps {
  title?: string;
  description?: string;
}

export function MultilingualBanner({
  title = "✨ Next-Generation AI Multilingual Voice Technology",
  description = "Say goodbye to expensive and time-consuming traditional dubbing. One voice, multiple languages, instant generation. Professional, natural, and consistent voice solutions for your global content.",
}: MultilingualBannerProps) {
  return (
    <Card className="mb-6 p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">
          {title}
        </h3>
        <p className="text-sm text-purple-700 dark:text-purple-300 leading-relaxed">
          {description}
        </p>
      </div>
    </Card>
  );
}