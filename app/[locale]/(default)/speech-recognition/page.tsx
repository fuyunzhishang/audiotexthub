import SpeechRecognition from "@/components/blocks/speech-recognition";
import { SpeechRecognitionSection } from "@/types/blocks/speech-recognition";
import { getLandingPage } from "@/services/page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  let canonicalUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/speech-recognition`;

  if (locale !== "en") {
    canonicalUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/${locale}/speech-recognition`;
  }

  return {
    title: "Speech Recognition - AudioTextHub",
    description: "Convert speech to text with our advanced AI speech recognition technology. Support multiple languages and dialects.",
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
  
  // Get speech recognition section from landing page config
  const speechRecognitionSection = page.speechRecognition as unknown as SpeechRecognitionSection;

  return (
    <div className="container mx-auto py-8">
      <SpeechRecognition section={speechRecognitionSection} />
    </div>
  );
}