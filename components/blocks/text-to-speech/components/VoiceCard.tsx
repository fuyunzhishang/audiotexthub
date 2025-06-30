"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Play, Pause, Crown } from "lucide-react";

// 静态图片引用
const femaleAvatar = "/imgs/female.png";
const maleAvatar = "/imgs/male.png";

interface VoiceActor {
  id: string;
  name: string;
  icon: string;
  gender: string;
  lang: string;
  en_lang: string;
  example_voice_url: string;
  level?: number;
  type?: string;
  provider?: string;
  isPremium?: boolean;
}

interface VoiceCardProps {
  voice: VoiceActor;
  isSelected: boolean;
  isPlaying: boolean;
  onSelect: () => void;
  onPlayToggle: () => void;
  voiceSelectedLabel?: string;
  voicePremiumLabel?: string;
}

export function VoiceCard({
  voice,
  isSelected,
  isPlaying,
  onSelect,
  onPlayToggle,
  voiceSelectedLabel = "Selected",
  voicePremiumLabel = "Premium",
}: VoiceCardProps) {
  return (
    <Card
      className={`relative p-4 transition-all duration-200 cursor-pointer group ${
        isSelected 
          ? 'border-2 border-primary bg-primary/5 shadow-lg' 
          : voice.isPremium
            ? 'hover:border-yellow-400/50 hover:shadow-xl hover:shadow-yellow-100/25 ring-1 ring-yellow-200/30'
            : 'hover:border-primary/50 hover:shadow-lg'
      }`}
      onClick={onSelect}
    >
      {/* 高级语音标识 */}
      {voice.isPremium && (
        <div className="absolute top-2 right-2 z-10">
          <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 text-white p-1.5 rounded-full shadow-lg ring-2 ring-yellow-300/50">
            <Crown className="h-3.5 w-3.5" />
          </div>
        </div>
      )}
      
      <div className="flex flex-col items-center space-y-3">
        <div className="relative">
          <Avatar className="size-12 rounded-full ring-2 ring-input group-hover:ring-primary/50 transition-all">
            <AvatarImage
              src={voice.gender === 'Female' ? femaleAvatar : maleAvatar}
              alt={voice.name}
            />
          </Avatar>
          
          {/* 播放按钮 */}
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onPlayToggle();
            }}
            className="absolute -bottom-1 -right-1 size-7 rounded-full bg-background border shadow-sm hover:shadow-md transition-all"
            title="试听语音"
          >
            {isPlaying ? (
              <Pause className="h-3 w-3" />
            ) : (
              <Play className="h-3 w-3" />
            )}
          </Button>
        </div>
        
        <div className="text-center space-y-1 w-full">
          <p className="font-medium text-sm truncate" title={voice.name}>
            {voice.name}
          </p>
          
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <Badge variant="secondary" className="text-xs">
              {voice.gender}
            </Badge>
            
            {voice.isPremium && (
              <Badge 
                variant="default" 
                className="text-xs font-semibold bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 text-white shadow-md"
              >
                🔥 {voicePremiumLabel}
              </Badge>
            )}
          </div>
        </div>
      </div>
      
      {/* 选中状态指示器 */}
      {isSelected && (
        <div className="absolute inset-0 rounded-lg border-2 border-primary pointer-events-none">
          <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
            {voiceSelectedLabel}
          </div>
        </div>
      )}
    </Card>
  );
}