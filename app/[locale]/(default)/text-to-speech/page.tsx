import TextToSpeech from "@/components/blocks/text-to-speech";
import { TextToSpeechSection } from "@/types/blocks/text-to-speech";
import { getLandingPage } from "@/services/page";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.pages.textToSpeech" });
  
  let canonicalUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/text-to-speech`;
  if (locale !== "en") {
    canonicalUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/${locale}/text-to-speech`;
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

export default async function TextToSpeechPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const page = await getLandingPage(locale);
  const t = await getTranslations({ locale, namespace: "metadata.pages.textToSpeech" });
  
  // Get text to speech section from landing page config
  const textToSpeechSection = page.textToSpeech as unknown as TextToSpeechSection;

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
      <TextToSpeech section={textToSpeechSection} showTabs={true} />
    </div>
  );
}