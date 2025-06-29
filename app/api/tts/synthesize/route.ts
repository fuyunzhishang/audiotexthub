import { NextRequest, NextResponse } from 'next/server';
import { getUserUuid } from '@/services/user';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider = 'microsoft-api', text, voiceId, speed = 1, pitch = 1, volume = 1, format = 'mp3' } = body;

    // 验证必需参数
    if (!text || !voiceId) {
      return NextResponse.json(
        { error: 'Missing required parameters: text and voiceId' },
        { status: 400 }
      );
    }

    // 检查是否使用Google语音（高级语音）
    const isGoogleVoice = provider === 'google' || provider === 'google-genai' || voiceId.includes('google');
    
    if (isGoogleVoice) {
      // 检查用户登录状态
      try {
        const userUuid = await getUserUuid(request);
        if (!userUuid) {
          return NextResponse.json(
            { error: 'Login required for premium voices' },
            { status: 401 }
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
      format
    });

    // 调用外部TTS API进行语音合成
    const response = await fetch(`${apiUrl}/api/tts/synthesize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider,
        text,
        voiceId,
        speed,
        pitch,
        volume,
        format
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('TTS API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(`TTS API error: ${response.status} - ${errorData.error || 'Unknown error'}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in TTS synthesis:', error);
    return NextResponse.json(
      { error: 'Failed to synthesize speech' },
      { status: 500 }
    );
  }
}