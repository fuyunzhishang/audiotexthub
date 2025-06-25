# CLAUDE.md

This file contains project-specific information for Claude.

## API Configuration

### Speech Recognition API
配置语音识别API地址：

```
NEXT_PUBLIC_API_URL=http://localhost:3099
```

API接口信息：
- URL: `/api/speech/recognize`
- Method: POST
- Body: multipart/form-data
  - audio: 音频文件 (wav, mp3, m4a, flv, mp4, wma, 3gp, amr, aac, ogg-opus, flac)
  - engineType: 识别引擎/ (16k_zh, 16k_zh_dialect, 16k_en, 16k_ca)

## Development Commands

Run type checking:
```bash
npx tsc --noEmit
```

### Coding Rules
1. 不要自作聪明瞎写代码，写代码前要先确认方案再执行
2. 不要添加冗余代码，比如各种无关的校验，只做必要的校验
3. 精简代码，如果之前已经有的功能、组件或者函数，可以考虑重构 和 抽象
4. 不要瞎改之前的代码，要先确认改完不会影响其他功能，比如之前的代码有问题，但是现在没有问题，不要瞎改，如果有不确定的可以跟用户确认
5. 不要重复造轮子，比如之前已经有了一个类似的功能，不要重复造轮子
6. 有参考文档，比如接口文档或者官方示例文档，严格按照示例文档写代码，不要自由发挥
7. 打印调试日志要清晰，没一个步骤都要打印正确的上下文信息
8. 不要硬编码可配置信息，要写到环境变量文件.env中
9. 首先要考虑快速简单的完成任务，别搞些复杂的东西