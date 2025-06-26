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
export async function getActiveAnnouncements(locale: string = 'en'): Promise<LocalizedAnnouncement[]> {
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
    
    // Check if multilingual fields exist in the data
    const hasMultilingualFields = titleField in announcement || contentField in announcement;
    
    return {
      uuid: announcement.uuid,
      title: hasMultilingualFields ? (announcement[titleField] || announcement.title || '') : announcement.title || '',
      content: hasMultilingualFields ? (announcement[contentField] || announcement.content || '') : announcement.content || '',
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
  
  // First, check if multilingual columns exist by attempting a test query
  const { error: testError } = await supabase
    .from("announcements")
    .select("title_en, content_en, title_zh, content_zh")
    .limit(1);
  
  let dataToInsert: any = {
    title: announcement.title,
    content: announcement.content,
    type: announcement.type,
    priority: announcement.priority,
    is_active: announcement.is_active,
    start_time: announcement.start_time,
    end_time: announcement.end_time
  };
  
  // Only include multilingual fields if the columns exist
  if (!testError || !testError.message.includes('column')) {
    if (announcement.title_zh) dataToInsert.title_zh = announcement.title_zh;
    if (announcement.content_zh) dataToInsert.content_zh = announcement.content_zh;
    if (announcement.title_en) dataToInsert.title_en = announcement.title_en;
    if (announcement.content_en) dataToInsert.content_en = announcement.content_en;
    if (announcement.default_language) dataToInsert.default_language = announcement.default_language;
  } else {
    console.warn("Multilingual columns not found in database, inserting without them");
  }
  
  const { data, error } = await supabase
    .from("announcements")
    .insert(dataToInsert)
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
  
  // First, check if multilingual columns exist by attempting a test query
  const { error: testError } = await supabase
    .from("announcements")
    .select("title_en, content_en, title_zh, content_zh")
    .limit(1);
  
  let dataToUpdate: any = {};
  
  // Always include basic fields if they're in the updates
  if ('title' in updates) dataToUpdate.title = updates.title;
  if ('content' in updates) dataToUpdate.content = updates.content;
  if ('type' in updates) dataToUpdate.type = updates.type;
  if ('priority' in updates) dataToUpdate.priority = updates.priority;
  if ('is_active' in updates) dataToUpdate.is_active = updates.is_active;
  if ('start_time' in updates) dataToUpdate.start_time = updates.start_time;
  if ('end_time' in updates) dataToUpdate.end_time = updates.end_time;
  
  // Only include multilingual fields if the columns exist
  if (!testError || !testError.message.includes('column')) {
    if ('title_zh' in updates) dataToUpdate.title_zh = updates.title_zh;
    if ('content_zh' in updates) dataToUpdate.content_zh = updates.content_zh;
    if ('title_en' in updates) dataToUpdate.title_en = updates.title_en;
    if ('content_en' in updates) dataToUpdate.content_en = updates.content_en;
    if ('default_language' in updates) dataToUpdate.default_language = updates.default_language;
  } else {
    console.warn("Multilingual columns not found in database, updating without them");
  }
  
  const { data, error } = await supabase
    .from("announcements")
    .update(dataToUpdate)
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