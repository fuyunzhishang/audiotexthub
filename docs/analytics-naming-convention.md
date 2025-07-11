# Google Analytics 事件命名规范

## 命名格式

事件名称遵循以下格式：
```
页面名称_业务范围_功能名称_事件类型
```

### 示例
- `tts_synthesis_generate_click` - TTS页面的语音合成生成按钮点击
- `home_hero_cta_click` - 首页主横幅CTA按钮点击
- `account_signup_button_click` - 账户注册按钮点击

## 命名规则

### 1. 页面名称（Page Name）
表示事件发生的页面或模块：
- `tts` - 文本转语音页面
- `sr` - 语音识别页面
- `voice_clone` - 声音克隆页面
- `home` - 首页
- `account` - 账户相关页面
- `waitlist` - 等待列表相关
- `nav` - 导航相关
- `perf` - 性能监控
- `error` - 错误追踪

### 2. 业务范围（Business Scope）
表示具体的业务功能模块：
- `synthesis` - 语音合成
- `audio` - 音频播放控制
- `voice` - 语音选择
- `language` - 语言相关
- `settings` - 设置相关
- `upload` - 上传功能
- `recognition` - 识别功能
- `signup/signin` - 登录注册
- `hero` - 主横幅区域
- `header/footer` - 页头页脚

### 3. 功能名称（Feature Name）
表示具体的功能点：
- `generate` - 生成
- `play/pause` - 播放/暂停
- `download` - 下载
- `selector` - 选择器
- `button` - 按钮
- `dialog` - 对话框
- `tab` - 标签页
- `card` - 卡片
- `link` - 链接

### 4. 事件类型（Event Type）
表示用户的具体行为：
- `click` - 点击
- `view` - 查看/展示
- `change` - 改变/切换
- `select` - 选择
- `submit` - 提交
- `success` - 成功
- `error/fail` - 错误/失败
- `start` - 开始
- `complete` - 完成
- `open/close` - 打开/关闭
- `input` - 输入
- `drop` - 拖放
- `time` - 时间记录

## 事件参数规范

每个事件应包含以下基础参数：

### 必需参数
- `category` - 事件分类（如：TTS, SR, Account）
- `label` - 事件标签（描述具体内容）
- `scene` - 场景（使用 GA_SCENES 枚举）

### 可选参数
- `value` - 数值（如：耗时、金额等）
- `feature` - 功能特征
- `action` - 具体动作
- `context` - 上下文信息
- 其他业务相关参数

## 示例代码

```typescript
// 点击TTS生成按钮
trackEvent(GA_EVENTS.TTS_SYNTHESIS_GENERATE_CLICK, {
  category: 'TTS',
  label: 'generate_button',
  scene: GA_SCENES.TTS_PAGE,
  voice_id: selectedVoice.id,
  text_length: text.length
});

// 语音选择
trackEvent(GA_EVENTS.TTS_VOICE_ITEM_SELECT, {
  category: 'TTS',
  label: voiceName,
  scene: showTabs ? GA_SCENES.TTS_PAGE : GA_SCENES.HOMEPAGE,
  voice_id: voice.id,
  voice_provider: voice.provider,
  voice_language: voice.language
});

// 性能监控
trackPerformance(GA_EVENTS.PERF_TTS_GENERATION_TIME, duration, {
  provider: voice.provider,
  voice_id: voice.id,
  text_length: text.length
});

// 错误追踪
trackEvent(GA_EVENTS.ERROR_TTS_GENERATION_FAIL, {
  category: 'Error',
  label: error.message,
  scene: GA_SCENES.TTS_PAGE,
  error_code: error.code,
  voice_id: selectedVoice?.id
});
```

## 注意事项

1. **保持一致性**：同类事件使用相同的命名模式
2. **避免重复**：检查是否已有类似事件定义
3. **语义清晰**：事件名称应能清楚表达其含义
4. **全小写**：使用下划线分隔，不使用驼峰命名
5. **避免过长**：控制在合理长度内，保持可读性

## 事件分析建议

1. **转化漏斗**：通过 `_start`, `_submit`, `_success` 系列事件构建漏斗
2. **错误监控**：通过 `_error`, `_fail` 事件监控系统健康
3. **性能分析**：通过 `_time` 事件监控性能指标
4. **用户路径**：通过 `_click`, `_view` 事件分析用户行为路径