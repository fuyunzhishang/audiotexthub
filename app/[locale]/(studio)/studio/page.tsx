'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { DigitalHumanSidebar } from '@/components/digital-human/sidebar';
import { Workspace } from '@/components/digital-human/workspace';
import { AvatarsManagement } from '@/components/digital-human/avatars-management';
import { History } from '@/components/digital-human/history';
import { digitalHumanAvatars } from '@/components/digital-human/avatars';
import type { DigitalHumanVideo } from '@/types/digital-human';

export default function DigitalHumanStudio() {
  const t = useTranslations();
  const [text, setText] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(digitalHumanAvatars[0]?.id || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideos, setGeneratedVideos] = useState<DigitalHumanVideo[]>([]);
  const [activeTab, setActiveTab] = useState('workspace');

  const maxLength = 2000;

  const getPageTitle = () => {
    const titles: Record<string, { title: string; description: string }> = {
      workspace: { title: t('digital_human.workspace.title'), description: t('digital_human.workspace.description') },
      avatars: { title: t('digital_human.avatars.title'), description: t('digital_human.avatars.description') },
      voice: { title: t('digital_human.voice.title'), description: t('digital_human.voice.description') },
      templates: { title: t('digital_human.templates.title'), description: t('digital_human.templates.description') },
      background: { title: t('digital_human.background.title'), description: t('digital_human.background.description') },
      history: { title: t('digital_human.history.title'), description: t('digital_human.history.description') },
      settings: { title: t('digital_human.settings.title'), description: t('digital_human.settings.description') }
    };
    return titles[activeTab] || titles.workspace;
  };

  const handleGenerate = async () => {
    if (!text.trim()) return;
    
    setIsGenerating(true);
    // TODO: 实现视频生成逻辑
    setTimeout(() => {
      const selectedHuman = digitalHumanAvatars.find(h => h.id === selectedAvatar);
      const newVideo: DigitalHumanVideo = {
        id: Date.now().toString(),
        text: text.substring(0, 50) + '...',
        textFull: text,
        avatarId: selectedAvatar,
        avatarName: selectedHuman?.name || '未知',
        status: 'completed',
        createdAt: new Date(),
        videoUrl: '#'
      };
      setGeneratedVideos([newVideo, ...generatedVideos]);
      setIsGenerating(false);
    }, 3000);
  };

  return (
    <>
      {/* 左侧菜单 */}
      <DigitalHumanSidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
      />
      
      {/* 主内容区 */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* 顶部标题栏 */}
        <div className="px-6 py-4 border-b bg-background">
          <h1 className="text-2xl font-bold">{getPageTitle().title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {getPageTitle().description}
          </p>
        </div>
        
        {/* 内容区 */}
        <div className="flex-1 overflow-auto">
          <div className="container max-w-7xl mx-auto p-6">
            {activeTab === 'workspace' && (
              <Workspace
                text={text}
                setText={setText}
                selectedAvatar={selectedAvatar}
                setSelectedAvatar={setSelectedAvatar}
                isGenerating={isGenerating}
                onGenerate={handleGenerate}
                generatedVideos={generatedVideos}
                maxLength={maxLength}
              />
            )}
            
            {activeTab === 'avatars' && (
              <AvatarsManagement />
            )}
            
            {activeTab === 'voice' && (
              <div className="text-center py-16">
                <h2 className="text-2xl font-semibold mb-4">{t('digital_human.voice.title')}</h2>
                <p className="text-muted-foreground">{t('digital_human.voice.description')}</p>
              </div>
            )}
            
            {activeTab === 'templates' && (
              <div className="text-center py-16">
                <h2 className="text-2xl font-semibold mb-4">{t('digital_human.templates.title')}</h2>
                <p className="text-muted-foreground">{t('digital_human.templates.description')}</p>
              </div>
            )}
            
            {activeTab === 'background' && (
              <div className="text-center py-16">
                <h2 className="text-2xl font-semibold mb-4">{t('digital_human.background.title')}</h2>
                <p className="text-muted-foreground">{t('digital_human.background.description')}</p>
              </div>
            )}
            
            {activeTab === 'history' && (
              <History />
            )}
            
            {activeTab === 'settings' && (
              <div className="text-center py-16">
                <h2 className="text-2xl font-semibold mb-4">{t('digital_human.settings.title')}</h2>
                <p className="text-muted-foreground">{t('digital_human.settings.description')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}