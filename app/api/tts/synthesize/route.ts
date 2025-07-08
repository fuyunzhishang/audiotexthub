import { NextRequest, NextResponse } from 'next/server';
import { getUserUuid } from '@/services/user';
import { checkTtsUsageLimit, incrementTtsUsage } from '@/models/tts-usage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider = 'microsoft-api', text, voiceId, speed = 1, pitch = 1, volume = 1, format = 'mp3', stylePrompt } = body;

    // 验证必需参数
    if (!text || !voiceId) {
      return NextResponse.json(
        { error: 'Missing required parameters: text and voiceId' },
        { status: 400 }
      );
    }

    // 检查是否使用Google语音（高级语音）
    const isGoogleVoice = provider === 'google' || provider === 'google-genai' || voiceId.includes('google');
    
    let userUuid: string | null = null;
    
    if (isGoogleVoice) {
      // 检查用户登录状态
      try {
        userUuid = await getUserUuid();
        if (!userUuid) {
          return NextResponse.json(
            { error: 'Login required for premium voices' },
            { status: 401 }
          );
        }
        
        // 检查使用限制（每天20次）
        const usageLimit = await checkTtsUsageLimit(userUuid, 'google', 20);
        
        if (!usageLimit.allowed) {
          return NextResponse.json(
            { 
              error: 'Daily usage limit exceeded', 
              message: `You have reached your daily limit of 20 uses for premium voices. Please try again tomorrow.`,
              remaining: 0,
              used: usageLimit.used,
              limit: 20
            },
            { status: 429 }
          );
        }
      } catch (error) {
        return NextResponse.json(
          { error: 'Login required for premium voices' },
          { status: 401 }
        );
      }
    }

    // 从环境变量获取外部TTS API地址
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3099';
    
    // 打印请求详情用于调试
    console.log('TTS API Request:', {
      url: `${apiUrl}/api/tts/synthesize`,
      provider,
      voiceId,
      textLength: text.length,
      speed,
      pitch,
      volume,
      format,
      stylePrompt: stylePrompt || 'none'
    });

    // 调用外部TTS API进行语音合成
    let response;
    try {
      response = await fetch(`${apiUrl}/api/tts/synthesize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider,
          // 对于 Google Gemini，将 stylePrompt 合并到文本中
          text: (stylePrompt && provider === 'google-genai') ? `${stylePrompt}: ${text}` : text,
          voiceId,
          speed,
          pitch,
          volume,
          format
        })
      });
    } catch (fetchError: any) {
      console.error('Failed to connect to TTS API:', fetchError);
      
      // 如果是连接错误，返回更友好的错误信息
      if (fetchError.cause?.code === 'ECONNREFUSED') {
        return NextResponse.json(
          { 
            error: 'TTS service unavailable', 
            message: 'TTS service is temporarily unavailable. Please try again later.'
          },
          { status: 503 }
        );
      }
      
      throw fetchError;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('TTS API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        request: {
          provider,
          voiceId,
          hasStylePrompt: !!stylePrompt,
          textLength: text.length
        }
      });
      
      // 返回更友好的错误信息
      let errorMessage = errorData.message || errorData.error || 'Unknown error';
      
      // 特殊处理 Google API key 错误
      if (errorMessage.includes('Google API key not configured')) {
        errorMessage = 'Google voice service is temporarily unavailable';
      }
      
      return NextResponse.json(
        { 
          error: 'TTS synthesis failed',
          message: errorMessage,
          details: response.status === 500 ? 'The TTS service encountered an internal error. Please try again.' : errorMessage
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // 如果是Google语音且生成成功，增加使用计数
    if (isGoogleVoice && userUuid && response.ok) {
      try {
        const today = new Date().toISOString().split('T')[0];
        await incrementTtsUsage(userUuid, 'google', today);
      } catch (error) {
        console.error('Failed to increment usage count:', error);
        // 不影响返回结果
      }
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in TTS synthesis:', error);
    return NextResponse.json(
      { error: 'Failed to synthesize speech' },
      { status: 500 }
    );
  }
}