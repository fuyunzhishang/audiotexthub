import { getSupabaseClient } from "@/models/db";

interface TtsUsageLimit {
  id?: number;
  user_uuid: string;
  provider: string;
  usage_date: string;
  usage_count: number;
  created_at?: Date;
  updated_at?: Date;
}

// 获取用户某天的使用次数
export async function getTtsUsageCount(
  user_uuid: string,
  provider: string,
  date: string
): Promise<number> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('tts_usage_limits')
      .select('usage_count')
      .eq('user_uuid', user_uuid)
      .eq('provider', provider)
      .eq('usage_date', date)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      throw error;
    }
    
    return data?.usage_count || 0;
  } catch (error) {
    console.error("Error getting TTS usage count:", error);
    return 0;
  }
}

// 增加使用次数
export async function incrementTtsUsage(
  user_uuid: string,
  provider: string,
  date: string
): Promise<void> {
  try {
    const supabase = getSupabaseClient();
    
    // 先尝试获取现有记录
    const { data: existing } = await supabase
      .from('tts_usage_limits')
      .select('id, usage_count')
      .eq('user_uuid', user_uuid)
      .eq('provider', provider)
      .eq('usage_date', date)
      .single();
    
    if (existing) {
      // 更新现有记录
      const { error } = await supabase
        .from('tts_usage_limits')
        .update({ 
          usage_count: existing.usage_count + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);
      
      if (error) throw error;
    } else {
      // 创建新记录
      const { error } = await supabase
        .from('tts_usage_limits')
        .insert({
          user_uuid,
          provider,
          usage_date: date,
          usage_count: 1
        });
      
      if (error) throw error;
    }
  } catch (error) {
    console.error("Error incrementing TTS usage:", error);
    throw error;
  }
}

// 检查是否超过限制
export async function checkTtsUsageLimit(
  user_uuid: string,
  provider: string,
  limit: number
): Promise<{ allowed: boolean; remaining: number; used: number }> {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  const used = await getTtsUsageCount(user_uuid, provider, today);
  const remaining = Math.max(0, limit - used);
  
  return {
    allowed: used < limit,
    remaining,
    used
  };
}