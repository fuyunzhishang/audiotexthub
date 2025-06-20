'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface DigitalHumanDisplayProps {
  avatarId: string;
  isPlaying?: boolean;
  audioUrl?: string;
  className?: string;
}

export function DigitalHumanDisplay({ 
  avatarId, 
  isPlaying = false, 
  audioUrl,
  className 
}: DigitalHumanDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [isLoading, setIsLoading] = useState(true);

  // 简单的数字人渲染逻辑
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置画布尺寸
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // 模拟加载
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    // 简单的动画循环
    let frameCount = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 绘制数字人基础形状
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(canvas.width, canvas.height) * 0.3;
      
      // 头部
      ctx.beginPath();
      ctx.arc(centerX, centerY - radius * 0.3, radius * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = '#f0f0f0';
      ctx.fill();
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // 眼睛
      const eyeY = centerY - radius * 0.4;
      const eyeSpacing = radius * 0.2;
      
      // 左眼
      ctx.beginPath();
      ctx.arc(centerX - eyeSpacing, eyeY, radius * 0.08, 0, Math.PI * 2);
      ctx.fillStyle = '#333';
      ctx.fill();
      
      // 右眼
      ctx.beginPath();
      ctx.arc(centerX + eyeSpacing, eyeY, radius * 0.08, 0, Math.PI * 2);
      ctx.fill();
      
      // 嘴巴（根据播放状态变化）
      ctx.beginPath();
      const mouthY = centerY - radius * 0.1;
      const mouthWidth = radius * 0.3;
      const mouthHeight = isPlaying ? 
        Math.abs(Math.sin(frameCount * 0.1)) * radius * 0.15 : 
        radius * 0.02;
      
      ctx.ellipse(centerX, mouthY, mouthWidth, mouthHeight, 0, 0, Math.PI * 2);
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // 身体
      ctx.beginPath();
      ctx.rect(centerX - radius * 0.5, centerY + radius * 0.3, radius, radius * 0.8);
      ctx.fillStyle = '#e0e0e0';
      ctx.fill();
      ctx.strokeStyle = '#333';
      ctx.stroke();
      
      frameCount++;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [avatarId, isPlaying]);

  return (
    <div className={cn("relative w-full h-full bg-gradient-to-b from-blue-50 to-white rounded-lg overflow-hidden", className)}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">加载数字人...</p>
          </div>
        </div>
      )}
      
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: isLoading ? 'none' : 'block' }}
      />
      
      {/* 状态指示器 */}
      {!isLoading && isPlaying && (
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          正在说话
        </div>
      )}
    </div>
  );
}