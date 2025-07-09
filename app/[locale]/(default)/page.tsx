import Branding from "@/components/blocks/branding";
import CTA from "@/components/blocks/cta";
import BlogSection from "@/components/blocks/blog-section/server";
import FAQ from "@/components/blocks/faq";
import Feature from "@/components/blocks/feature";
import Feature1 from "@/components/blocks/feature1";
import Feature2 from "@/components/blocks/feature2";
import Feature3 from "@/components/blocks/feature3";
import Hero from "@/components/blocks/hero";
import Pricing from "@/components/blocks/pricing";
import Showcase from "@/components/blocks/showcase";
import Stats from "@/components/blocks/stats";
import Testimonial from "@/components/blocks/testimonial";
import SpeechTools from "@/components/blocks/speech-tools";
import { TextToSpeechSection } from "@/types/blocks/text-to-speech";
import { SpeechRecognitionSection } from "@/types/blocks/speech-recognition";
import { getLandingPage } from "@/services/page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  let canonicalUrl = `${process.env.NEXT_PUBLIC_WEB_URL}`;

  if (locale !== "en") {
    canonicalUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/${locale}`;
  }

  return {
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const page = await getLandingPage(locale);

  return (
    <>
      {page.hero && <Hero hero={page.hero} />}
      {/* {page.branding && <Branding section={page.branding} />} */}
      
      {(page.textToSpeech || page.speechRecognition) && (
        <SpeechTools 
          textToSpeech={page.textToSpeech as unknown as TextToSpeechSection}
          speechRecognition={page.speechRecognition as unknown as SpeechRecognitionSection}
        />
      )}
      {page.introduce && <Feature1 section={page.introduce} />}
      {page.benefit && <Feature2 section={page.benefit} />}
      {page.usage && <Feature3 section={page.usage} />}
      {page.feature && <Feature section={page.feature} />}
      {page.showcase && <Showcase section={page.showcase} />}
      {page.stats && <Stats section={page.stats} />}
      {page.pricing && <Pricing pricing={page.pricing} />}
      {page.testimonial && <Testimonial section={page.testimonial} />}
      {page.faq && <FAQ section={page.faq} />}
      
      {/* 动态博客部分 */}
      <BlogSection 
        locale={locale}
        title={locale === 'zh' ? '深入了解语音技术' : 'Learn More About Voice Technology'}
        description={locale === 'zh' 
          ? '探索如何利用AI语音技术为您的业务赋能的技巧、教程和洞察'
          : 'Discover tips, tutorials, and insights on how to leverage AI voice technology for your business'}
        label={locale === 'zh' ? '最新文章' : 'Latest Articles'}
        readMoreText={locale === 'zh' ? '阅读更多' : 'Read More'}
      />
      
      {/* {page.cta && <CTA section={page.cta} />} */}
    </>
  );
}
