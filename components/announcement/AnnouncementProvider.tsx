"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { LocalizedAnnouncement } from '@/models/announcement';
import { useLocale } from 'next-intl';

interface AnnouncementContextType {
  announcements: LocalizedAnnouncement[];
  unreadAnnouncements: LocalizedAnnouncement[];
  readAnnouncementIds: string[];
  markAsRead: (id: string) => void;
  refreshAnnouncements: () => Promise<void>;
  isLoading: boolean;
}

const AnnouncementContext = createContext<AnnouncementContextType | undefined>(undefined);

const STORAGE_KEY = 'readAnnouncements';
const REFRESH_INTERVAL = 30000; // 30 seconds

export function AnnouncementProvider({ children }: { children: React.ReactNode }) {
  const [announcements, setAnnouncements] = useState<LocalizedAnnouncement[]>([]);
  const [readAnnouncementIds, setReadAnnouncementIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const locale = useLocale();

  // Load read announcements from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setReadAnnouncementIds(JSON.parse(stored));
      } catch (error) {
        console.error('Error parsing read announcements:', error);
      }
    }
  }, []);

  // Fetch announcements from API
  const fetchAnnouncements = useCallback(async () => {
    try {
      const response = await fetch(`/api/announcements/active?locale=${locale}`);
      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data.announcements || []);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setIsLoading(false);
    }
  }, [locale]);

  // Refresh announcements
  const refreshAnnouncements = useCallback(async () => {
    setIsLoading(true);
    await fetchAnnouncements();
  }, [fetchAnnouncements]);

  // Initial fetch and periodic refresh
  useEffect(() => {
    fetchAnnouncements();
    
    const interval = setInterval(fetchAnnouncements, REFRESH_INTERVAL);
    
    return () => clearInterval(interval);
  }, [fetchAnnouncements]);

  // Mark announcement as read
  const markAsRead = useCallback((id: string) => {
    setReadAnnouncementIds(prev => {
      if (prev.includes(id)) return prev;
      
      const updated = [...prev, id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Calculate unread announcements
  const unreadAnnouncements = announcements.filter(
    announcement => !readAnnouncementIds.includes(announcement.uuid)
  );

  const value: AnnouncementContextType = {
    announcements,
    unreadAnnouncements,
    readAnnouncementIds,
    markAsRead,
    refreshAnnouncements,
    isLoading
  };

  return (
    <AnnouncementContext.Provider value={value}>
      {children}
    </AnnouncementContext.Provider>
  );
}

export function useAnnouncements() {
  const context = useContext(AnnouncementContext);
  if (!context) {
    throw new Error('useAnnouncements must be used within AnnouncementProvider');
  }
  return context;
}