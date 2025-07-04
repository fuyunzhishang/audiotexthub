import { createClient, SupabaseClient } from "@supabase/supabase-js";

// 使用单例模式缓存 Supabase 客户端，避免重复创建连接
let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient() {
  // 如果实例已存在，直接返回
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const supabaseUrl = process.env.SUPABASE_URL || "";

  let supabaseKey = process.env.SUPABASE_ANON_KEY || "";
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  }

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase URL or key is not set");
  }

  // 创建并缓存客户端实例
  supabaseInstance = createClient(supabaseUrl, supabaseKey);
  console.log('Supabase client initialized');

  return supabaseInstance;
}
