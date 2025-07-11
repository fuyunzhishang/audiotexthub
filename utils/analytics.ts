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
      ...parameters,
      // 在开发环境添加 debug_mode
      ...(process.env.NODE_ENV === 'development' ? { debug_mode: true } : {})
    } : {
      ...(process.env.NODE_ENV === 'development' ? { debug_mode: true } : {})
    };
    
    // 只在 gtag 存在时打印日志
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 GA Event:', action, eventParams);
    }
    
    window.gtag('event', action, eventParams);
  } else if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    // 如果 gtag 不存在，在开发环境提示
    console.log('⚠️ GA not initialized, but would track:', action, parameters);
  }
};

// 预定义的事件类型
// 命名规范：页面名称_业务范围_功能名称_事件类型
export const GA_EVENTS = {
  // ========== TTS 页面事件 ==========
  // 文本转语音核心功能
  TTS_SYNTHESIS_GENERATE_CLICK: 'tts_synthesis_generate_click',           // 点击生成按钮
  TTS_SYNTHESIS_GENERATE_SUCCESS: 'tts_synthesis_generate_success',       // 生成成功
  TTS_SYNTHESIS_GENERATE_ERROR: 'tts_synthesis_generate_error',           // 生成失败
  TTS_AUDIO_PLAY_CLICK: 'tts_audio_play_click',                         // 点击播放
  TTS_AUDIO_PAUSE_CLICK: 'tts_audio_pause_click',                       // 点击暂停
  TTS_AUDIO_DOWNLOAD_CLICK: 'tts_audio_download_click',                 // 点击下载
  
  // 语音选择功能
  TTS_VOICE_SELECTOR_CLICK: 'tts_voice_selector_click',                 // 点击语音选择器
  TTS_VOICE_ITEM_SELECT: 'tts_voice_item_select',                       // 选择语音项
  TTS_VOICE_PREVIEW_PLAY: 'tts_voice_preview_play',                     // 播放语音预览
  
  // 语言和提供商切换
  TTS_LANGUAGE_SELECTOR_CHANGE: 'tts_language_selector_change',         // 语言选择器改变
  TTS_PROVIDER_TAB_SWITCH: 'tts_provider_tab_switch',                   // 提供商标签切换
  
  // 设置功能
  TTS_SETTINGS_DIALOG_OPEN: 'tts_settings_dialog_open',                 // 打开设置对话框
  TTS_SETTINGS_SPEED_CHANGE: 'tts_settings_speed_change',               // 调整语速
  TTS_SETTINGS_PITCH_CHANGE: 'tts_settings_pitch_change',               // 调整音调
  TTS_SETTINGS_VOLUME_CHANGE: 'tts_settings_volume_change',             // 调整音量
  
  // 风格提示词
  TTS_STYLE_PROMPT_INPUT: 'tts_style_prompt_input',                     // 输入风格提示词
  TTS_STYLE_DIMENSION_CLICK: 'tts_style_dimension_click',               // 点击风格维度按钮
  
  // ========== 语音识别页面事件 ==========
  SR_UPLOAD_BUTTON_CLICK: 'sr_upload_button_click',                     // 点击上传按钮
  SR_FILE_DROP: 'sr_file_drop',                                         // 拖放文件
  SR_UPLOAD_START: 'sr_upload_start',                                   // 开始上传
  SR_UPLOAD_SUCCESS: 'sr_upload_success',                               // 上传成功
  SR_UPLOAD_ERROR: 'sr_upload_error',                                   // 上传失败
  SR_RECOGNITION_START: 'sr_recognition_start',                         // 开始识别
  SR_RECOGNITION_SUCCESS: 'sr_recognition_success',                     // 识别成功
  SR_RECOGNITION_ERROR: 'sr_recognition_error',                         // 识别失败
  SR_RESULT_COPY_CLICK: 'sr_result_copy_click',                        // 点击复制结果
  SR_RESULT_DOWNLOAD_CLICK: 'sr_result_download_click',                // 点击下载结果
  SR_ENGINE_SELECTOR_CHANGE: 'sr_engine_selector_change',              // 切换识别引擎
  
  // ========== 声音克隆页面事件 ==========
  VOICE_CLONE_PAGE_VIEW: 'voice_clone_page_view',                      // 页面查看
  VOICE_CLONE_WAITLIST_CLICK: 'voice_clone_waitlist_click',            // 点击等待列表
  VOICE_CLONE_DISCORD_CLICK: 'voice_clone_discord_click',              // 点击Discord链接
  
  // ========== 首页事件 ==========
  HOME_HERO_CTA_CLICK: 'home_hero_cta_click',                          // 点击主CTA按钮
  HOME_FEATURE_CARD_CLICK: 'home_feature_card_click',                  // 点击功能卡片
  HOME_PRICING_VIEW: 'home_pricing_view',                              // 查看定价
  HOME_TESTIMONIAL_VIEW: 'home_testimonial_view',                      // 查看推荐
  
  // ========== 用户账户事件 ==========
  ACCOUNT_SIGNUP_BUTTON_CLICK: 'account_signup_button_click',           // 点击注册按钮
  ACCOUNT_SIGNUP_SUBMIT: 'account_signup_submit',                       // 提交注册
  ACCOUNT_SIGNUP_SUCCESS: 'account_signup_success',                     // 注册成功
  ACCOUNT_SIGNIN_BUTTON_CLICK: 'account_signin_button_click',           // 点击登录按钮
  ACCOUNT_SIGNIN_SUBMIT: 'account_signin_submit',                       // 提交登录
  ACCOUNT_SIGNIN_SUCCESS: 'account_signin_success',                     // 登录成功
  ACCOUNT_SIGNOUT_CLICK: 'account_signout_click',                      // 点击登出
  ACCOUNT_PROFILE_UPDATE_CLICK: 'account_profile_update_click',         // 点击更新资料
  
  // ========== 等待列表事件 ==========
  WAITLIST_AI_MODELS_VIEW: 'waitlist_ai_models_view',                  // 查看AI模型等待列表
  WAITLIST_AI_MODELS_JOIN_CLICK: 'waitlist_ai_models_join_click',      // 点击加入AI模型等待列表
  WAITLIST_LONG_TEXT_VIEW: 'waitlist_long_text_view',                  // 查看长文本等待列表
  WAITLIST_LONG_TEXT_JOIN_CLICK: 'waitlist_long_text_join_click',      // 点击加入长文本等待列表
  WAITLIST_MULTI_SPEAKER_VIEW: 'waitlist_multi_speaker_view',          // 查看多人对话等待列表
  WAITLIST_MULTI_SPEAKER_JOIN_CLICK: 'waitlist_multi_speaker_join_click', // 点击加入多人对话等待列表
  
  // ========== 导航事件 ==========
  NAV_HEADER_MENU_CLICK: 'nav_header_menu_click',                      // 点击头部菜单
  NAV_HEADER_LOGO_CLICK: 'nav_header_logo_click',                      // 点击Logo
  NAV_FOOTER_LINK_CLICK: 'nav_footer_link_click',                      // 点击页脚链接
  NAV_LOCALE_SWITCHER_CLICK: 'nav_locale_switcher_click',              // 点击语言切换器
  NAV_THEME_TOGGLE_CLICK: 'nav_theme_toggle_click',                    // 点击主题切换
  
  // ========== 性能监控事件 ==========
  PERF_TTS_GENERATION_TIME: 'perf_tts_generation_time',                // TTS生成耗时
  PERF_SR_PROCESSING_TIME: 'perf_sr_processing_time',                  // 语音识别处理耗时
  PERF_PAGE_LOAD_TIME: 'perf_page_load_time',                         // 页面加载时间
  PERF_API_RESPONSE_TIME: 'perf_api_response_time',                   // API响应时间
  
  // ========== 错误事件 ==========
  ERROR_TTS_GENERATION_FAIL: 'error_tts_generation_fail',              // TTS生成失败
  ERROR_SR_UPLOAD_FAIL: 'error_sr_upload_fail',                       // 语音识别上传失败
  ERROR_API_REQUEST_FAIL: 'error_api_request_fail',                   // API请求失败
  ERROR_NETWORK_FAIL: 'error_network_fail',                           // 网络错误
  ERROR_PERMISSION_DENIED: 'error_permission_denied',                 // 权限拒绝
  ERROR_QUOTA_EXCEEDED: 'error_quota_exceeded',                       // 配额超限
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
  const params = {
    category: 'Performance',
    value: Math.round(duration),
    duration_ms: Math.round(duration),
    ...additionalParams
  };
  
  if (process.env.NODE_ENV === 'development') {
    console.log('⏱️ Performance Event:', event, `${Math.round(duration)}ms`, additionalParams);
  }
  
  trackEvent(event, params);
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
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error Tracked:', errorMessage, context);
    if (typeof error !== 'string') {
      console.error(error);
    }
  }
  
  // 根据上下文选择合适的错误事件
  const errorEvent = context?.scene === GA_SCENES.TTS_PAGE ? GA_EVENTS.ERROR_TTS_GENERATION_FAIL :
                     context?.scene === GA_SCENES.SR_PAGE ? GA_EVENTS.ERROR_SR_UPLOAD_FAIL :
                     context?.type === 'api' ? GA_EVENTS.ERROR_API_REQUEST_FAIL :
                     context?.type === 'network' ? GA_EVENTS.ERROR_NETWORK_FAIL :
                     GA_EVENTS.ERROR_API_REQUEST_FAIL; // 默认使用 API 错误
  
  trackEvent(errorEvent, {
    category: 'Error',
    label: errorMessage,
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
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Funnel Event:', `${funnel} → ${step}`, additionalParams);
  }
  
  trackEvent(`funnel_${funnel}_${step}`, {
    category: 'Funnel',
    label: funnel,
    funnel_step: step,
    ...additionalParams
  });
};