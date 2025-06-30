"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TextToSpeech from "@/components/blocks/text-to-speech";
import SpeechRecognition from "@/components/blocks/speech-recognition";
import { TextToSpeechSection } from "@/types/blocks/text-to-speech";
import { SpeechRecognitionSection } from "@/types/blocks/speech-recognition";
import Icon from "@/components/icon";
import { useLocale } from "next-intl";

interface SpeechToolsProps {
  textToSpeech?: TextToSpeechSection;
  speechRecognition?: SpeechRecognitionSection;
}

export default function SpeechTools({ textToSpeech, speechRecognition }: SpeechToolsProps) {
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState("text-to-speech");

  if (!textToSpeech && !speechRecognition) {
    return null;
  }

  // If only one tool is enabled, show it directly without tabs
  if (textToSpeech && !speechRecognition) {
    return <TextToSpeech section={textToSpeech} />;
  }
  
  if (speechRecognition && !textToSpeech) {
    return <SpeechRecognition section={speechRecognition} />;
  }

  return (
    <section id="speech-tools" className="py-16">
      <div className="container">
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="flex items-center gap-1 text-sm font-semibold text-primary">
            <Icon name="RiVoiceprintFill" className="h-6 w-auto border-primary" />
            {locale === 'zh' ? 'AI语音工具' : 'AI Speech Tools'}
          </div>
          <h2 className="text-center text-3xl font-semibold lg:text-4xl">
            {locale === 'zh' ? '智能语音转换工具' : 'Smart Speech Conversion Tools'}
          </h2>
          <p className="text-center text-muted-foreground lg:text-lg max-w-2xl">
            {locale === 'zh' 
              ? '提供文本转语音和音/视频转文本两大核心功能，让您的内容在文字和语音之间自由转换'
              : 'Providing text-to-speech and audio/video to text features to convert between text and speech seamlessly'}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            {textToSpeech && !textToSpeech.disabled && (
              <TabsTrigger value="text-to-speech" className="flex items-center gap-2">
                <Icon name={textToSpeech.icon || "RiVoiceprintFill"} className="h-4 w-4" />
                {textToSpeech.label || "文本转语音"}
              </TabsTrigger>
            )}
            {speechRecognition && !speechRecognition.disabled && (
              <TabsTrigger value="speech-recognition" className="flex items-center gap-2">
                <Icon name={speechRecognition.icon || "RiMicFill"} className="h-4 w-4" />
                {speechRecognition.label || "音/视频转文本"}
              </TabsTrigger>
            )}
          </TabsList>

          {textToSpeech && !textToSpeech.disabled && (
            <TabsContent value="text-to-speech" className="mt-0">
              <TextToSpeech section={textToSpeech} />
            </TabsContent>
          )}
          
          {speechRecognition && !speechRecognition.disabled && (
            <TabsContent value="speech-recognition" className="mt-0">
              <SpeechRecognition section={speechRecognition} />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </section>
  );
}