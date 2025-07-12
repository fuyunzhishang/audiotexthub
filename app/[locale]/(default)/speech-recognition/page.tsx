import SpeechRecognition from "@/components/blocks/speech-recognition";
import { SpeechRecognitionSection } from "@/types/blocks/speech-recognition";
import { getLandingPage } from "@/services/page";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.pages.speechRecognition" });
  
  let canonicalUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/speech-recognition`;
  if (locale !== "en") {
    canonicalUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/${locale}/speech-recognition`;
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

export default async function SpeechRecognitionPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const page = await getLandingPage(locale);
  const t = await getTranslations({ locale, namespace: "metadata.pages.speechRecognition" });
  
  // Get speech recognition section from landing page config
  const speechRecognitionSection = page.speechRecognition as unknown as SpeechRecognitionSection;

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
      <SpeechRecognition section={speechRecognitionSection} />
    </div>
  );
}