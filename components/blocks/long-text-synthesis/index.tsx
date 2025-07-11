"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/icon";
import { useLocale } from "next-intl";
import { trackEvent, GA_EVENTS, GA_SCENES } from "@/utils/analytics";

export default function LongTextSynthesis() {
  const locale = useLocale();

  const features = [
    {
      icon: "RiFileTextFill",
      title: locale === 'zh' ? "超长文本支持" : "Ultra-long Text Support",
      description: locale === 'zh' 
        ? "支持20,000+字符的文本输入，轻松处理长篇文章" 
        : "Support 20,000+ characters input, easily handle long articles"
    },
    {
      icon: "RiTimeFill",
      title: locale === 'zh' ? "批量处理" : "Batch Processing",
      description: locale === 'zh' 
        ? "智能分段处理，保持语音连贯性" 
        : "Smart segmentation processing, maintain voice coherence"
    },
    {
      icon: "RiBookReadFill",
      title: locale === 'zh' ? "多格式支持" : "Multiple Format Support",
      description: locale === 'zh' 
        ? "支持PDF、Word、TXT等多种文档格式" 
        : "Support PDF, Word, TXT and other document formats"
    },
    {
      icon: "RiDownloadCloudFill",
      title: locale === 'zh' ? "一键导出" : "One-click Export",
      description: locale === 'zh' 
        ? "合成完成后可导出为MP3、WAV等格式" 
        : "Export as MP3, WAV and other formats after synthesis"
    }
  ];

  const useCases = [
    {
      title: locale === 'zh' ? "有声书制作" : "Audiobook Production",
      icon: "RiBookOpenFill"
    },
    {
      title: locale === 'zh' ? "课程讲解" : "Course Narration",
      icon: "RiGraduationCapFill"
    },
    {
      title: locale === 'zh' ? "新闻播报" : "News Broadcasting",
      icon: "RiNewspaperFill"
    },
    {
      title: locale === 'zh' ? "文档朗读" : "Document Reading",
      icon: "RiFileListFill"
    }
  ];

  return (
    <Card className="p-8 lg:p-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-4">
            <Icon name="RiMagicFill" className="h-3 w-3 mr-1" />
            {locale === 'zh' ? '即将推出' : 'Coming Soon'}
          </Badge>
          <h3 className="text-2xl font-semibold mb-3">
            {locale === 'zh' ? '长文本语音合成' : 'Long Text Speech Synthesis'}
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {locale === 'zh' 
              ? '突破传统限制，支持20,000+字符的超长文本语音合成。适用于有声书、课程、新闻等长篇内容的语音制作。'
              : 'Break through traditional limits with 20,000+ character support for ultra-long text synthesis. Perfect for audiobooks, courses, news, and other long-form content.'}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {features.map((feature, index) => (
            <div key={index} className="flex gap-4 p-4 rounded-lg bg-muted/50">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon name={feature.icon} className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-1">{feature.title}</h4>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Use Cases */}
        <div className="mb-10">
          <h4 className="text-lg font-semibold text-center mb-6">
            {locale === 'zh' ? '适用场景' : 'Use Cases'}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {useCases.map((useCase, index) => (
              <div key={index} className="text-center p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                <Icon name={useCase.icon} className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">{useCase.title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center space-y-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-8">
          <div className="space-y-2">
            <h4 className="text-lg font-semibold">
              {locale === 'zh' 
                ? '抢先体验长文本语音合成' 
                : 'Early Access to Long Text Synthesis'}
            </h4>
            <p className="text-sm text-muted-foreground">
              {locale === 'zh' 
                ? '加入等待列表，第一时间体验强大的长文本处理能力'
                : 'Join the waitlist to be the first to experience powerful long text processing'}
            </p>
          </div>
          
          <Button 
            size="lg" 
            className="gap-2"
            onClick={() => {
              // 追踪Discord点击
              trackEvent(GA_EVENTS.WAITLIST_LONG_TEXT_JOIN_CLICK, {
                category: 'Waitlist',
                label: 'long_text_discord',
                scene: GA_SCENES.TTS_PAGE,
                feature: 'long_text_synthesis',
                action: 'click',
                tab_context: 'long_text'
              });
              window.open("https://discord.gg/2q8TWknHeW", "_blank");
            }}
          >
            <Icon name="RiDiscordFill" className="h-4 w-4" />
            {locale === 'zh' ? '加入 Discord 等待列表' : 'Join Discord Waitlist'}
          </Button>
          
          <p className="text-xs text-muted-foreground">
            {locale === 'zh' 
              ? '* 免费加入，优先体验新功能'
              : '* Free to join, priority access to new features'}
          </p>
        </div>
      </div>
    </Card>
  );
}