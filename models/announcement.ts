import { getSupabaseClient } from "./db";

export interface Announcement {
  uuid: string;
  title: string;
  content: string;
  title_zh?: string;
  content_zh?: string;
  title_en?: string;
  content_en?: string;
  default_language?: string;
  type: 'info' | 'warning' | 'success' | 'error';
  priority: number;
  is_active: boolean;
  start_time: string;
  end_time?: string | null;
  created_at: string;
  updated_at: string;
}

export interface LocalizedAnnouncement {
  uuid: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'error';
  priority: number;
  is_active: boolean;
  start_time: string;
  end_time?: string | null;
  created_at: string;
  updated_at: string;
}

// Get active announcements for users (with localization)
export async function getActiveAnnouncements(locale: string = 'zh'): Promise<LocalizedAnnouncement[]> {
  const supabase = getSupabaseClient();
  const now = new Date().toISOString();
  
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .eq("is_active", true)
    .lte("start_time", now)
    .or(`end_time.is.null,end_time.gt.${now}`)
    .order("priority", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching active announcements:", error);
    throw error;
  }

  // Transform to localized announcements
  const localizedData = (data || []).map(announcement => {
    const titleField = locale === 'en' ? 'title_en' : 'title_zh';
    const contentField = locale === 'en' ? 'content_en' : 'content_zh';
    
    return {
      uuid: announcement.uuid,
      title: announcement[titleField] || announcement.title || '',
      content: announcement[contentField] || announcement.content || '',
      type: announcement.type,
      priority: announcement.priority,
      is_active: announcement.is_active,
      start_time: announcement.start_time,
      end_time: announcement.end_time,
      created_at: announcement.created_at,
      updated_at: announcement.updated_at,
    };
  });

  return localizedData;
}

// Get all announcements for admin
export async function getAllAnnouncements(): Promise<Announcement[]> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching all announcements:", error);
    throw error;
  }

  return data || [];
}

// Create new announcement
export async function createAnnouncement(
  announcement: Omit<Announcement, 'uuid' | 'created_at' | 'updated_at'>
): Promise<Announcement> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from("announcements")
    .insert(announcement)
    .select()
    .single();

  if (error) {
    console.error("Error creating announcement:", error);
    throw error;
  }

  return data;
}

// Update announcement
export async function updateAnnouncement(
  uuid: string,
  updates: Partial<Omit<Announcement, 'uuid' | 'created_at' | 'updated_at'>>
): Promise<Announcement> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from("announcements")
    .update(updates)
    .eq("uuid", uuid)
    .select()
    .single();

  if (error) {
    console.error("Error updating announcement:", error);
    throw error;
  }

  return data;
}

// Delete announcement (soft delete by setting is_active to false)
export async function deleteAnnouncement(uuid: string): Promise<void> {
  const supabase = getSupabaseClient();
  
  const { error } = await supabase
    .from("announcements")
    .update({ is_active: false })
    .eq("uuid", uuid);

  if (error) {
    console.error("Error deleting announcement:", error);
    throw error;
  }
}

// Hard delete announcement
export async function hardDeleteAnnouncement(uuid: string): Promise<void> {
  const supabase = getSupabaseClient();
  
  const { error } = await supabase
    .from("announcements")
    .delete()
    .eq("uuid", uuid);

  if (error) {
    console.error("Error hard deleting announcement:", error);
    throw error;
  }
}