import TextToSpeech from "@/components/blocks/text-to-speech";
import { TextToSpeechSection } from "@/types/blocks/text-to-speech";
import { getLandingPage } from "@/services/page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  let canonicalUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/text-to-speech`;

  if (locale !== "en") {
    canonicalUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/${locale}/text-to-speech`;
  }

  return {
    title: "Text to Speech - AudioTextHub",
    description: "Convert text to natural-sounding speech with our AI text-to-speech technology. Support 100+ languages and voices.",
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
  
  // Get text to speech section from landing page config
  const textToSpeechSection = page.textToSpeech as unknown as TextToSpeechSection;

  return (
    <div className="container mx-auto py-8">
      <TextToSpeech section={textToSpeechSection} showTabs={true} />
    </div>
  );
}