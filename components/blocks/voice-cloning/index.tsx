"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/icon";
import { useLocale } from "next-intl";

interface VoiceCloningSection {
  label?: string;
  description?: string;
  icon?: string;
  disabled?: boolean;
}

interface VoiceCloningProps {
  section?: VoiceCloningSection;
}

export default function VoiceCloning({ section }: VoiceCloningProps) {
  const locale = useLocale();

  const features = [
    {
      icon: "RiUserVoiceFill",
      title: locale === 'zh' ? "个性化声音" : "Personalized Voice",
      description: locale === 'zh' 
        ? "使用您自己的声音或创建独特的AI声音" 
        : "Use your own voice or create unique AI voices"
    },
    {
      icon: "RiGlobalFill",
      title: locale === 'zh' ? "多语言支持" : "Multi-language Support",
      description: locale === 'zh' 
        ? "克隆的声音可以说多种语言" 
        : "Cloned voices can speak multiple languages"
    },
    {
      icon: "RiSpeedUpFill",
      title: locale === 'zh' ? "实时生成" : "Real-time Generation",
      description: locale === 'zh' 
        ? "快速生成高质量的语音内容" 
        : "Generate high-quality speech content quickly"
    },
    {
      icon: "RiShieldCheckFill",
      title: locale === 'zh' ? "安全可靠" : "Safe & Secure",
      description: locale === 'zh' 
        ? "您的声音数据安全加密存储" 
        : "Your voice data is securely encrypted"
    }
  ];

  return (
    <>
      <Card className="p-8 lg:p-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Badge variant="secondary" className="mb-4">
              <Icon name="RiMagicFill" className="h-3 w-3 mr-1" />
              {locale === 'zh' ? '即将推出' : 'Coming Soon'}
            </Badge>
            <h3 className="text-2xl font-semibold mb-3">
              {locale === 'zh' ? 'AI 声音克隆' : 'AI Voice Cloning'}
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {locale === 'zh' 
                ? '创建属于您的独特声音，让AI用您的声音说话。支持多语言、多场景应用。'
                : 'Create your unique voice and let AI speak with it. Support for multiple languages and scenarios.'}
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

          {/* CTA Section */}
          <div className="text-center space-y-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-8">
            <div className="space-y-2">
              <h4 className="text-lg font-semibold">
                {locale === 'zh' 
                  ? '成为首批体验用户' 
                  : 'Be Among the First to Try'}
              </h4>
              <p className="text-sm text-muted-foreground">
                {locale === 'zh' 
                  ? '加入等待列表，抢先体验声音克隆功能'
                  : 'Join the waitlist to get early access to voice cloning'}
              </p>
            </div>
            
            <Button 
              size="lg" 
              className="gap-2"
              onClick={() => window.open("https://discord.gg/2q8TWknHeW", "_blank")}
            >
              <Icon name="RiDiscordFill" className="h-4 w-4" />
              {locale === 'zh' ? '加入 Discord 等待列表' : 'Join Discord Waitlist'}
            </Button>
            
            <p className="text-xs text-muted-foreground">
              {locale === 'zh' 
                ? '* 无需付费，优先体验'
                : '* No payment required, priority access'}
            </p>
          </div>
        </div>
      </Card>
    </>
  );
}