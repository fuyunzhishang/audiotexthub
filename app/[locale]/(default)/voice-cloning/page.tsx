import VoiceCloning from "@/components/blocks/voice-cloning";
import { VoiceCloningSection } from "@/types/blocks/voice-cloning";
import { getLandingPage } from "@/services/page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  let canonicalUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/voice-cloning`;
  
  if (locale !== "en") {
    canonicalUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/${locale}/voice-cloning`;
  }
  
  return {
    title: locale === 'zh' ? "AI 声音克隆 - AudioTextHub" : "AI Voice Cloning - AudioTextHub",
    description: locale === 'zh' 
      ? "创建属于您的独特声音，让AI用您的声音说话。支持多语言、多场景应用。"
      : "Create your unique voice and let AI speak with it. Support for multiple languages and scenarios.",
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
  
  const voiceCloning = page.voiceCloning as unknown as VoiceCloningSection;
  
  return (
    <div className="container mx-auto py-8">
      <VoiceCloning section={voiceCloning} />
    </div>
  );
}