"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/icon";
import { useLocale } from "next-intl";
import { trackEvent, GA_EVENTS, GA_SCENES } from "@/utils/analytics";

export default function AIModelVoices() {
  const locale = useLocale();

  const features = [
    {
      icon: "RiSparkling2Fill",
      title: locale === 'zh' ? "100+ AI 音色" : "100+ AI Voices",
      description: locale === 'zh' 
        ? "来自顶级AI模型的多样化音色选择" 
        : "Diverse voice selection from top AI models"
    },
    {
      icon: "RiEmotionHappyFill",
      title: locale === 'zh' ? "智能情感识别" : "Smart Emotion Detection",
      description: locale === 'zh' 
        ? "根据文案内容自动推导合适的情感表达" 
        : "Automatically infer appropriate emotions from text"
    },
    {
      icon: "RiGlobalFill",
      title: locale === 'zh' ? "多语言支持" : "Multi-language Support",
      description: locale === 'zh' 
        ? "支持30+种语言，自动识别并切换" 
        : "Support 30+ languages with auto-detection"
    },
    {
      icon: "RiSettings3Fill",
      title: locale === 'zh' ? "高级控制" : "Advanced Controls",
      description: locale === 'zh' 
        ? "精细调整语速、音调、停顿等参数" 
        : "Fine-tune speed, pitch, pauses and more"
    }
  ];

  const modelProviders = [
    {
      name: "OpenAI",
      voices: locale === 'zh' ? "6 种音色" : "6 Voices",
      icon: "RiOpenaiLine"
    },
    {
      name: "Google",
      voices: locale === 'zh' ? "380+ 种音色" : "380+ Voices",
      icon: "RiGoogleFill"
    },
    {
      name: "Microsoft",
      voices: locale === 'zh' ? "400+ 种音色" : "400+ Voices",
      icon: "RiMicrosoftFill"
    },
    {
      name: "Amazon",
      voices: locale === 'zh' ? "60+ 种音色" : "60+ Voices",
      icon: "RiAmazonFill"
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
            {locale === 'zh' ? 'AI 大模型音色库' : 'AI Model Voice Library'}
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {locale === 'zh' 
              ? '接入全球顶级AI语音模型，提供超过100种高质量音色。根据您的文案自动选择最合适的情感表达，让AI语音更加自然动人。'
              : 'Access top global AI voice models with over 100 high-quality voices. Automatically select the most suitable emotional expression based on your text, making AI speech more natural and engaging.'}
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

        {/* Model Providers */}
        <div className="mb-10">
          <h4 className="text-lg font-semibold text-center mb-6">
            {locale === 'zh' ? '支持的AI模型' : 'Supported AI Models'}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {modelProviders.map((provider, index) => (
              <div key={index} className="text-center p-4 rounded-lg border bg-card">
                <Icon name={provider.icon} className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <h5 className="font-medium text-sm mb-1">{provider.name}</h5>
                <p className="text-xs text-muted-foreground">{provider.voices}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center space-y-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-8">
          <div className="space-y-2">
            <h4 className="text-lg font-semibold">
              {locale === 'zh' 
                ? '加入等待列表，抢先体验' 
                : 'Join Waitlist for Early Access'}
            </h4>
            <p className="text-sm text-muted-foreground">
              {locale === 'zh' 
                ? '成为首批使用AI大模型音色库的用户'
                : 'Be among the first to use the AI Model Voice Library'}
            </p>
          </div>
          
          <Button 
            size="lg" 
            className="gap-2"
            onClick={() => {
              // 追踪Discord点击
              trackEvent(GA_EVENTS.WAITLIST_AI_MODELS_JOIN_CLICK, {
                category: 'Waitlist',
                label: 'ai_models_discord',
                scene: GA_SCENES.TTS_PAGE,
                feature: 'ai_model_voices',
                action: 'click',
                tab_context: '100+_ai_models'
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