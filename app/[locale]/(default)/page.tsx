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
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  
  let canonicalUrl = `${process.env.NEXT_PUBLIC_WEB_URL}`;
  if (locale !== "en") {
    canonicalUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/${locale}`;
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

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const page = await getLandingPage(locale);
  const t = await getTranslations({ locale, namespace: "blog.homepage" });

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
        title={t("title")}
        description={t("description")}
        label={t("label")}
        readMoreText={t("readMoreText")}
      />
      
      {/* {page.cta && <CTA section={page.cta} />} */}
    </>
  );
}
