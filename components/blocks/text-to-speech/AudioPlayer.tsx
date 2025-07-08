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
  autoPlay?: boolean;
  onPlayingChange?: (isPlaying: boolean) => void;
}

export default function AudioPlayer({ 
  audioUrl, 
  voiceName, 
  voiceFilePrefix,
  playLabel,
  pauseLabel,
  provider,
  autoPlay = false,
  onPlayingChange
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

    // 事件处理函数
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      onPlayingChange?.(false);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      onPlayingChange?.(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
      onPlayingChange?.(false);
    };

    // 添加事件监听器
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    // 如果设置了自动播放，等待音频加载后再播放
    if (autoPlay) {
      const playAudio = () => {
        // 停止其他音频
        const allAudioElements = document.querySelectorAll('audio');
        allAudioElements.forEach(otherAudio => {
          if (otherAudio !== audio && !otherAudio.paused) {
            otherAudio.pause();
          }
        });
        
        audio.play().catch(error => {
          console.error('自动播放失败:', error);
        });
      };

      if (audio.readyState >= 3) { // HAVE_FUTURE_DATA
        playAudio();
      } else {
        audio.addEventListener('canplay', playAudio, { once: true });
      }
    }

    return () => {
      // 移除事件监听器
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      
      // 只有在组件真正卸载时才暂停音频
      if (audioRef.current === audio) {
        audio.pause();
      }
    };
  }, [fullAudioUrl]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      // 停止所有其他音频
      const allAudioElements = document.querySelectorAll('audio');
      allAudioElements.forEach(audio => {
        if (audio !== audioRef.current && !audio.paused) {
          audio.pause();
        }
      });
      audioRef.current.play();
    }
  };

  const handleSliderChange = (value: number[]) => {
    if (!audioRef.current) return;
    const newTime = value[0];
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleDownload = async () => {
    try {
      // 先尝试通过 fetch 获取音频文件
      const response = await fetch(fullAudioUrl);
      const blob = await response.blob();
      
      // 创建 blob URL
      const blobUrl = URL.createObjectURL(blob);
      
      // 创建下载链接
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${voiceFilePrefix}_${voiceName}_${new Date().getTime()}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // 清理 blob URL
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('下载失败:', error);
      // 如果 fetch 失败（比如跨域），回退到直接打开链接
      window.open(fullAudioUrl, '_blank');
    }
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