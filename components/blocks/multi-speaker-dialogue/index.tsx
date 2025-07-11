"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/icon";
import { useLocale } from "next-intl";
import { trackEvent, GA_EVENTS, GA_SCENES } from "@/utils/analytics";

export default function MultiSpeakerDialogue() {
  const locale = useLocale();

  const features = [
    {
      icon: "RiTeamFill",
      title: locale === 'zh' ? "多角色配音" : "Multi-character Voiceover",
      description: locale === 'zh' 
        ? "支持多个角色使用不同音色进行对话" 
        : "Support multiple characters with different voices"
    },
    {
      icon: "RiChatSmile3Fill",
      title: locale === 'zh' ? "智能对话识别" : "Smart Dialogue Recognition",
      description: locale === 'zh' 
        ? "自动识别对话中的不同角色并分配音色" 
        : "Automatically identify different characters and assign voices"
    },
    {
      icon: "RiMicFill",
      title: locale === 'zh' ? "情感表达" : "Emotional Expression",
      description: locale === 'zh' 
        ? "根据对话内容自动调整语气和情感" 
        : "Automatically adjust tone and emotion based on dialogue"
    },
    {
      icon: "RiMovieFill",
      title: locale === 'zh' ? "场景化配音" : "Scene-based Voiceover",
      description: locale === 'zh' 
        ? "适配不同场景需求，如动画、游戏、有声剧等" 
        : "Adapt to different scenarios like animation, games, audio dramas"
    }
  ];

  const exampleScenarios = [
    {
      title: locale === 'zh' ? "有声剧制作" : "Audio Drama",
      description: locale === 'zh' ? "多角色情感丰富" : "Rich multi-character emotions",
      icon: "RiHeadphoneFill"
    },
    {
      title: locale === 'zh' ? "教育对话" : "Educational Dialogue",
      description: locale === 'zh' ? "师生互动场景" : "Teacher-student interaction",
      icon: "RiBookOpenFill"
    },
    {
      title: locale === 'zh' ? "游戏配音" : "Game Voiceover",
      description: locale === 'zh' ? "NPC对话系统" : "NPC dialogue system",
      icon: "RiGamepadFill"
    },
    {
      title: locale === 'zh' ? "动画配音" : "Animation Dubbing",
      description: locale === 'zh' ? "角色个性鲜明" : "Distinctive character personalities",
      icon: "RiFilmFill"
    }
  ];

  const workflowSteps = [
    {
      step: "1",
      title: locale === 'zh' ? "导入剧本" : "Import Script",
      description: locale === 'zh' ? "上传对话文本或剧本" : "Upload dialogue text or script"
    },
    {
      step: "2",
      title: locale === 'zh' ? "分配角色" : "Assign Roles",
      description: locale === 'zh' ? "为每个角色选择合适的音色" : "Choose suitable voice for each character"
    },
    {
      step: "3",
      title: locale === 'zh' ? "调整情感" : "Adjust Emotions",
      description: locale === 'zh' ? "设置每句对话的情感表达" : "Set emotional expression for each line"
    },
    {
      step: "4",
      title: locale === 'zh' ? "生成导出" : "Generate & Export",
      description: locale === 'zh' ? "一键生成并导出音频文件" : "Generate and export audio files"
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
            {locale === 'zh' ? '多人对话语音合成' : 'Multi-speaker Dialogue Synthesis'}
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {locale === 'zh' 
              ? '为您的故事赋予声音。支持多角色对话场景，每个角色都有独特的音色和情感表达，让对话更加生动真实。'
              : 'Give voice to your stories. Support multi-character dialogue scenarios with unique voices and emotional expressions for each character, making conversations more vivid and realistic.'}
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

        {/* Workflow Steps */}
        <div className="mb-10">
          <h4 className="text-lg font-semibold text-center mb-6">
            {locale === 'zh' ? '简单四步，创建多人对话' : 'Create Multi-speaker Dialogue in 4 Steps'}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {workflowSteps.map((item, index) => (
              <div key={index} className="relative">
                <div className="text-center p-4 rounded-lg border bg-card">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-3 text-sm font-semibold">
                    {item.step}
                  </div>
                  <h5 className="font-medium text-sm mb-1">{item.title}</h5>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
                {index < workflowSteps.length - 1 && (
                  <Icon name="RiArrowRightLine" className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Example Scenarios */}
        <div className="mb-10">
          <h4 className="text-lg font-semibold text-center mb-6">
            {locale === 'zh' ? '应用场景' : 'Application Scenarios'}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {exampleScenarios.map((scenario, index) => (
              <div key={index} className="text-center p-4 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
                <Icon name={scenario.icon} className="h-10 w-10 mx-auto mb-3 text-primary" />
                <h5 className="font-medium text-sm mb-1">{scenario.title}</h5>
                <p className="text-xs text-muted-foreground">{scenario.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center space-y-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-8">
          <div className="space-y-2">
            <h4 className="text-lg font-semibold">
              {locale === 'zh' 
                ? '率先体验多人对话配音' 
                : 'Be First to Try Multi-speaker Dialogue'}
            </h4>
            <p className="text-sm text-muted-foreground">
              {locale === 'zh' 
                ? '加入等待列表，成为首批体验用户'
                : 'Join the waitlist to be among the first users'}
            </p>
          </div>
          
          <Button 
            size="lg" 
            className="gap-2"
            onClick={() => {
              // 追踪Discord点击
              trackEvent(GA_EVENTS.WAITLIST_MULTI_SPEAKER_JOIN_CLICK, {
                category: 'Waitlist',
                label: 'multi_speaker_discord',
                scene: GA_SCENES.TTS_PAGE,
                feature: 'multi_speaker_dialogue',
                action: 'click',
                tab_context: 'multi_speaker'
              });
              window.open("https://discord.gg/2q8TWknHeW", "_blank");
            }}
          >
            <Icon name="RiDiscordFill" className="h-4 w-4" />
            {locale === 'zh' ? '加入 Discord 等待列表' : 'Join Discord Waitlist'}
          </Button>
          
          <p className="text-xs text-muted-foreground">
            {locale === 'zh' 
              ? '* 免费加入，享受专属优惠'
              : '* Free to join, enjoy exclusive benefits'}
          </p>
        </div>
      </div>
    </Card>
  );
}