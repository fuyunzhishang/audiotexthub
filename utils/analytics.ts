// Google Analytics 4 事件追踪工具

declare global {
  interface Window {
    gtag?: (
      command: 'event',
      action: string,
      parameters?: {
        event_category?: string;
        event_label?: string;
        value?: number;
        [key: string]: any;
      }
    ) => void;
  }
}

/**
 * 发送自定义事件到 Google Analytics 4
 * @param action - 事件名称
 * @param parameters - 事件参数
 */
export const trackEvent = (
  action: string,
  parameters?: {
    category?: string;
    label?: string;
    value?: number;
    [key: string]: any;
  }
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    const eventParams = parameters ? {
      event_category: parameters.category,
      event_label: parameters.label,
      value: parameters.value,
      ...parameters
    } : undefined;
    
    window.gtag('event', action, eventParams);
    
    // 开发环境下打印日志
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 GA Event:', action, eventParams);
    }
  }
};

// 预定义的事件类型
export const GA_EVENTS = {
  // ========== TTS 功能事件 ==========
  // 核心功能
  TTS_GENERATE_START: 'tts_generate_start',        // 开始生成
  TTS_GENERATE_SUCCESS: 'tts_generate_success',    // 生成成功
  TTS_GENERATE_ERROR: 'tts_generate_error',        // 生成失败
  TTS_PLAY: 'tts_play',                           // 播放音频
  TTS_PAUSE: 'tts_pause',                         // 暂停播放
  TTS_DOWNLOAD: 'tts_download',                   // 下载音频
  
  // 选择器交互
  TTS_VOICE_SELECT: 'tts_voice_select',           // 选择音色
  TTS_LANGUAGE_CHANGE: 'tts_language_change',     // 切换语言
  TTS_PROVIDER_SWITCH: 'tts_provider_switch',     // 切换提供商
  TTS_STYLE_PROMPT_USE: 'tts_style_prompt_use',   // 使用风格提示词
  TTS_SETTINGS_CHANGE: 'tts_settings_change',     // 调整设置
  
  // ========== 语音识别事件 ==========
  SR_FILE_SELECT: 'sr_file_select',               // 选择文件
  SR_UPLOAD_START: 'sr_upload_start',             // 开始上传
  SR_UPLOAD_SUCCESS: 'sr_upload_success',         // 上传成功
  SR_UPLOAD_ERROR: 'sr_upload_error',             // 上传失败
  SR_PROCESS_START: 'sr_process_start',           // 开始处理
  SR_PROCESS_SUCCESS: 'sr_process_success',       // 处理成功
  SR_PROCESS_ERROR: 'sr_process_error',           // 处理失败
  SR_RESULT_COPY: 'sr_result_copy',               // 复制结果
  SR_RESULT_DOWNLOAD: 'sr_result_download',       // 下载结果
  SR_ENGINE_CHANGE: 'sr_engine_change',           // 切换识别引擎
  
  // ========== 用户系统事件 ==========
  USER_SIGN_UP_START: 'user_sign_up_start',       // 开始注册
  USER_SIGN_UP_SUCCESS: 'user_sign_up_success',   // 注册成功
  USER_SIGN_UP_ERROR: 'user_sign_up_error',       // 注册失败
  USER_SIGN_IN_START: 'user_sign_in_start',       // 开始登录
  USER_SIGN_IN_SUCCESS: 'user_sign_in_success',   // 登录成功
  USER_SIGN_IN_ERROR: 'user_sign_in_error',       // 登录失败
  USER_SIGN_OUT: 'user_sign_out',                 // 登出
  USER_PROFILE_UPDATE: 'user_profile_update',     // 更新资料
  
  // ========== Waitlist 事件 ==========
  WAITLIST_MODAL_OPEN: 'waitlist_modal_open',     // 打开弹窗
  WAITLIST_DISCORD_CLICK: 'waitlist_discord_click', // 点击Discord
  WAITLIST_FEATURE_INTEREST: 'waitlist_feature_interest', // 功能兴趣
  
  // ========== 页面交互事件 ==========
  PAGE_TAB_SWITCH: 'page_tab_switch',             // Tab切换
  PAGE_FEATURE_VIEW: 'page_feature_view',         // 查看功能
  PAGE_SCROLL_DEPTH: 'page_scroll_depth',         // 滚动深度
  PAGE_TIME_SPENT: 'page_time_spent',             // 停留时间
  
  // ========== 导航事件 ==========
  NAV_MENU_CLICK: 'nav_menu_click',               // 菜单点击
  NAV_CTA_CLICK: 'nav_cta_click',                 // CTA按钮点击
  NAV_LOCALE_SWITCH: 'nav_locale_switch',         // 语言切换
  NAV_THEME_SWITCH: 'nav_theme_switch',           // 主题切换
  
  // ========== 性能事件 ==========
  PERF_TTS_DURATION: 'perf_tts_duration',         // TTS生成耗时
  PERF_SR_DURATION: 'perf_sr_duration',           // 语音识别耗时
  PERF_PAGE_LOAD: 'perf_page_load',               // 页面加载时间
  
  // ========== 错误事件 ==========
  ERROR_GENERAL: 'error_general',                  // 通用错误
  ERROR_API: 'error_api',                         // API错误
  ERROR_NETWORK: 'error_network',                 // 网络错误
  ERROR_PERMISSION: 'error_permission',           // 权限错误
  ERROR_QUOTA: 'error_quota',                     // 配额错误
};

// 事件场景枚举
export const GA_SCENES = {
  HOMEPAGE: 'homepage',                           // 首页
  TTS_PAGE: 'tts_page',                          // TTS页面
  SR_PAGE: 'sr_page',                            // 语音识别页面
  VOICE_CLONE_PAGE: 'voice_clone_page',          // 声音克隆页面
  PRICING_PAGE: 'pricing_page',                  // 定价页面
  DASHBOARD: 'dashboard',                        // 用户面板
  MODAL: 'modal',                                // 弹窗
  HEADER: 'header',                              // 头部导航
  FOOTER: 'footer',                              // 页脚
};

// 用户类型
export const GA_USER_TYPES = {
  VISITOR: 'visitor',                            // 访客
  FREE_USER: 'free_user',                        // 免费用户
  PAID_USER: 'paid_user',                        // 付费用户
  TRIAL_USER: 'trial_user',                      // 试用用户
};

// 辅助函数：追踪性能
export const trackPerformance = (
  event: string,
  duration: number,
  additionalParams?: Record<string, any>
) => {
  trackEvent(event, {
    category: 'Performance',
    value: Math.round(duration),
    duration_ms: Math.round(duration),
    ...additionalParams
  });
};

// 辅助函数：追踪错误
export const trackError = (
  error: Error | string,
  context?: {
    scene?: string;
    action?: string;
    [key: string]: any;
  }
) => {
  trackEvent(GA_EVENTS.ERROR_GENERAL, {
    category: 'Error',
    label: typeof error === 'string' ? error : error.message,
    error_name: typeof error === 'string' ? 'CustomError' : error.name,
    error_stack: typeof error === 'string' ? '' : error.stack,
    ...context
  });
};

// 辅助函数：追踪用户行为漏斗
export const trackFunnel = (
  step: string,
  funnel: string,
  additionalParams?: Record<string, any>
) => {
  trackEvent(`funnel_${funnel}_${step}`, {
    category: 'Funnel',
    label: funnel,
    funnel_step: step,
    ...additionalParams
  });
};