"use client";

import { VoiceCard } from "./VoiceCard";

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

interface VoiceGridProps {
  voices: VoiceActor[];
  selectedVoice: VoiceActor | null;
  currentAudio: string | null;
  isPlaying: boolean;
  onSelectVoice: (voice: VoiceActor) => void;
  onPlayAudio: (url: string) => void;
  getFullAudioUrl: (url: string, provider?: string) => string;
  voiceSelectedLabel?: string;
  voicePremiumLabel?: string;
}

export function VoiceGrid({
  voices,
  selectedVoice,
  currentAudio,
  isPlaying,
  onSelectVoice,
  onPlayAudio,
  getFullAudioUrl,
  voiceSelectedLabel,
  voicePremiumLabel,
}: VoiceGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {voices.map((voice) => {
        const fullUrl = getFullAudioUrl(voice.example_voice_url, voice.provider);
        const isCurrentPlaying = currentAudio === fullUrl && isPlaying;
        
        return (
          <VoiceCard
            key={voice.id}
            voice={voice}
            isSelected={selectedVoice?.id === voice.id}
            isPlaying={isCurrentPlaying}
            onSelect={() => onSelectVoice(voice)}
            onPlayToggle={() => onPlayAudio(fullUrl)}
            voiceSelectedLabel={voiceSelectedLabel}
            voicePremiumLabel={voicePremiumLabel}
          />
        );
      })}
    </div>
  );
}