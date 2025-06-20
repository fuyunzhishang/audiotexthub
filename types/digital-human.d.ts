export interface DigitalHuman {
  id: string;
  name: string;
  nameEn?: string;
  gender: 'male' | 'female';
  style: 'professional' | 'education' | 'service' | 'sales' | 'entertainment';
  description?: string;
  preview: string;
  modelUrl?: string;
  voiceId?: string; // 关联TTS语音ID
  level: 'free' | 'premium' | 'professional';
  tags?: string[];
}

export interface DigitalHumanVideo {
  id: string;
  text: string;
  textFull?: string;
  avatarId: string;
  avatarName: string;
  duration?: number;
  videoUrl?: string;
  audioUrl?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  userId?: string;
}

export interface LipSyncData {
  phonemes: Array<{
    phoneme: string;
    startTime: number;
    endTime: number;
  }>;
  visemes: Array<{
    viseme: string;
    time: number;
    value: number;
  }>;
}

export interface VideoGenerationOptions {
  quality: 'low' | 'medium' | 'high';
  format: 'mp4' | 'webm';
  resolution: '480p' | '720p' | '1080p';
  fps: 24 | 30 | 60;
  background?: string;
  watermark?: boolean;
}