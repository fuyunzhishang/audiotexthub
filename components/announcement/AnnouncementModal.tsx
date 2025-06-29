"use client";

import React, { useEffect, useState } from 'react';
import { useAnnouncements } from './AnnouncementProvider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslations } from 'next-intl';

export function AnnouncementModal() {
  const { unreadAnnouncements, markAsRead } = useAnnouncements();
  const [isOpen, setIsOpen] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState<typeof unreadAnnouncements[0] | null>(null);
  const [hasShownAnnouncement, setHasShownAnnouncement] = useState(false);
  const t = useTranslations('announcement');

  useEffect(() => {
    // Only show the latest unread announcement once
    if (unreadAnnouncements.length > 0 && !isOpen && !hasShownAnnouncement) {
      // Get the latest announcement (first one since they're ordered by priority and created_at)
      const latestAnnouncement = unreadAnnouncements[0];
      
      setCurrentAnnouncement(latestAnnouncement);
      setIsOpen(true);
      setHasShownAnnouncement(true);
    }
  }, [unreadAnnouncements, isOpen, hasShownAnnouncement]);

  const handleClose = () => {
    // 点击"稍后再看"时也标记为已读，避免再次弹出
    if (currentAnnouncement) {
      markAsRead(currentAnnouncement.uuid);
    }
    setIsOpen(false);
  };

  const handleMarkAsRead = () => {
    if (currentAnnouncement) {
      markAsRead(currentAnnouncement.uuid);
      setIsOpen(false);
    }
  };

  if (!currentAnnouncement) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-3 h-3 rounded-full",
              currentAnnouncement.type === 'error' && "bg-red-500",
              currentAnnouncement.type === 'warning' && "bg-yellow-500",
              currentAnnouncement.type === 'success' && "bg-green-500",
              currentAnnouncement.type === 'info' && "bg-blue-500"
            )} />
            <DialogTitle className="text-xl">
              {currentAnnouncement.title}
            </DialogTitle>
            <Badge variant={
              currentAnnouncement.type === 'error' ? 'destructive' :
              currentAnnouncement.type === 'warning' ? 'secondary' :
              currentAnnouncement.type === 'success' ? 'default' :
              'outline'
            }>
              {t(`type_labels.${currentAnnouncement.type}`)}
            </Badge>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            {t('publish_time')}：{new Date(currentAnnouncement.created_at).toLocaleString()}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[400px] mt-4">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap">{currentAnnouncement.content}</p>
          </div>
        </ScrollArea>
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={handleClose}>
            {t('read_later')}
          </Button>
          <Button onClick={handleMarkAsRead}>
            {t('has_read')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}