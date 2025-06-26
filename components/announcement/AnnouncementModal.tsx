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

export function AnnouncementModal() {
  const { unreadAnnouncements, markAsRead } = useAnnouncements();
  const [isOpen, setIsOpen] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState<typeof unreadAnnouncements[0] | null>(null);
  const [viewedAnnouncementIds, setViewedAnnouncementIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Show the latest unread announcement that hasn't been viewed in this session
    if (unreadAnnouncements.length > 0 && !isOpen) {
      const unviewedAnnouncement = unreadAnnouncements.find(
        announcement => !viewedAnnouncementIds.has(announcement.uuid)
      );
      
      if (unviewedAnnouncement) {
        setCurrentAnnouncement(unviewedAnnouncement);
        setIsOpen(true);
      }
    }
  }, [unreadAnnouncements, isOpen, viewedAnnouncementIds]);

  const handleClose = () => {
    if (currentAnnouncement) {
      // Mark this announcement as viewed in this session
      setViewedAnnouncementIds(prev => new Set(prev).add(currentAnnouncement.uuid));
    }
    setIsOpen(false);
    setCurrentAnnouncement(null);
  };

  const handleMarkAsRead = () => {
    if (currentAnnouncement) {
      markAsRead(currentAnnouncement.uuid);
      // Also mark as viewed
      setViewedAnnouncementIds(prev => new Set(prev).add(currentAnnouncement.uuid));
      setIsOpen(false);
      setCurrentAnnouncement(null);
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
              {currentAnnouncement.type === 'error' ? '重要' :
               currentAnnouncement.type === 'warning' ? '提醒' :
               currentAnnouncement.type === 'success' ? '成功' :
               '通知'}
            </Badge>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            发布时间：{new Date(currentAnnouncement.created_at).toLocaleString()}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[400px] mt-4">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap">{currentAnnouncement.content}</p>
          </div>
        </ScrollArea>
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={handleClose}>
            稍后再看
          </Button>
          <Button onClick={handleMarkAsRead}>
            已读
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}