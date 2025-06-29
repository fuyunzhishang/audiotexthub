"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Download } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface AudioPlayerProps {
  audioUrl: string;
  voiceName: string;
  voiceFilePrefix: string;
  playLabel: string;
  pauseLabel: string;
  provider?: string;
}

export default function AudioPlayer({ 
  audioUrl, 
  voiceName, 
  voiceFilePrefix,
  playLabel,
  pauseLabel,
  provider 
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 处理音频URL，为谷歌语音的相对路径添加baseURL
  const getFullAudioUrl = (url: string) => {
    // 添加对undefined或空值的检查
    if (!url) {
      console.error('Audio URL is undefined or empty');
      return '';
    }
    
    // 如果是完整URL（包含http或https），直接返回
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // 如果是谷歌相关的provider且是相对路径，添加baseURL
    if ((provider === 'google' || provider === 'google-genai') && url.startsWith('/')) {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
      return `${baseUrl}${url}`;
    }
    
    // 其他情况直接返回原URL
    return url;
  };

  const fullAudioUrl = getFullAudioUrl(audioUrl);

  useEffect(() => {
    // 如果没有有效的音频URL，不创建Audio对象
    if (!fullAudioUrl) {
      console.warn('No valid audio URL provided to AudioPlayer');
      return;
    }

    const audio = new Audio(fullAudioUrl);
    audioRef.current = audio;

    // 设置音频元数据加载完成时的处理
    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
    });

    // 监听时间更新
    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
    });

    // 监听播放结束
    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', () => {});
      audio.removeEventListener('timeupdate', () => {});
      audio.removeEventListener('ended', () => {});
    };
  }, [fullAudioUrl]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSliderChange = (value: number[]) => {
    if (!audioRef.current) return;
    const newTime = value[0];
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = fullAudioUrl;
    a.download = `${voiceFilePrefix}_${voiceName}_${new Date().getTime()}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={togglePlayPause}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
        
        <div className="flex-1 space-y-1">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSliderChange}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={handleDownload}
        >
          <Download className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}