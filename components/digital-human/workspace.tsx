'use client';

import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Play, Download, Loader2, Settings } from 'lucide-react';
import { DigitalHumanDisplay } from './display';
import { DigitalHumanSelector } from './selector';
import { digitalHumanAvatars } from './avatars';
import type { DigitalHumanVideo } from '@/types/digital-human';

interface WorkspaceProps {
  text: string;
  setText: (text: string) => void;
  selectedAvatar: string;
  setSelectedAvatar: (id: string) => void;
  isGenerating: boolean;
  onGenerate: () => void;
  generatedVideos: DigitalHumanVideo[];
  maxLength?: number;
}

export function Workspace({
  text,
  setText,
  selectedAvatar,
  setSelectedAvatar,
  isGenerating,
  onGenerate,
  generatedVideos,
  maxLength = 2000
}: WorkspaceProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 左侧主区域 */}
      <div className="lg:col-span-2 space-y-6">
        {/* 数字人预览区 */}
        <Card className="p-6">
          <Label className="text-base font-semibold mb-4 block">数字人预览</Label>
          <div className="aspect-video bg-muted rounded-lg overflow-hidden">
            <DigitalHumanDisplay
              avatarId={selectedAvatar}
              isPlaying={isGenerating}
              className="w-full h-full"
            />
          </div>
        </Card>

        {/* 文本输入区 */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label htmlFor="text-input" className="text-base font-semibold">
                输入文本
              </Label>
              <span className="text-sm text-muted-foreground">
                {text.length} / {maxLength}
              </span>
            </div>
            <Textarea
              id="text-input"
              placeholder="请输入要生成视频的文本内容..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={maxLength}
              rows={8}
              className="resize-none"
            />
            <Button 
              onClick={onGenerate} 
              disabled={!text.trim() || isGenerating}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  生成视频
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>

      {/* 右侧控制面板 */}
      <div className="space-y-6">
        {/* 数字人选择 */}
        <Card className="p-6">
          <Label className="text-base font-semibold mb-4 block">选择数字人</Label>
          <DigitalHumanSelector
            digitalHumans={digitalHumanAvatars}
            selectedId={selectedAvatar}
            onSelect={setSelectedAvatar}
          />
        </Card>

        {/* 语音设置 */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Label className="text-base font-semibold">语音设置</Label>
            <Button size="sm" variant="ghost">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">语音</span>
              <span className="font-medium">
                {digitalHumanAvatars.find(h => h.id === selectedAvatar)?.voiceId || '默认'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">语速</span>
              <span className="font-medium">正常</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">音调</span>
              <span className="font-medium">标准</span>
            </div>
          </div>
        </Card>

        {/* 历史记录 */}
        <Card className="p-6">
          <Label className="text-base font-semibold mb-4 block">生成历史</Label>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {generatedVideos.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">暂无生成记录</p>
            ) : (
              generatedVideos.map((video) => (
                <div key={video.id} className="border rounded-lg p-3 space-y-2">
                  <div className="text-sm font-medium truncate">{video.text}</div>
                  <div className="text-xs text-muted-foreground">
                    {video.avatarName} · {video.createdAt.toLocaleString()}
                  </div>
                  <Button size="sm" variant="outline" className="w-full">
                    <Download className="mr-2 h-3 w-3" />
                    下载
                  </Button>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}