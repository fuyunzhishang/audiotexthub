import VoiceCloning from "@/components/blocks/voice-cloning";
import { VoiceCloningSection } from "@/types/blocks/voice-cloning";
import { getLandingPage } from "@/services/page";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.pages.voiceCloning" });
  
  let canonicalUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/voice-cloning`;
  if (locale !== "en") {
    canonicalUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/${locale}/voice-cloning`;
  }
  
  return {
    title: t("title"),
    description: t("description"),
    keywords: t("keywords"),
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function VoiceCloningPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const page = await getLandingPage(locale);
  const t = await getTranslations({ locale, namespace: "metadata.pages.voiceCloning" });
  
  const voiceCloning = page.voiceCloning as unknown as VoiceCloningSection;
  
  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">
          {t("h1")}
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          {t("subtitle")}
        </p>
      </div>
      <VoiceCloning section={voiceCloning} />
    </div>
  );
}