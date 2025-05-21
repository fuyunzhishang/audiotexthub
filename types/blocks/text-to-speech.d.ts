import { Image } from "@/types/blocks/base";

export interface VoiceActor {
  id: string;
  name: string;
  avatar: string;
  sampleAudio: string;
  language: string;
}

export interface TextToSpeech {
  name?: string;
  disabled?: boolean;
  title?: string;
  description?: string;
  label?: string;
  icon?: string;
  maxCharacters?: number;
  languages?: string[];
  voiceActors?: VoiceActor[];
}