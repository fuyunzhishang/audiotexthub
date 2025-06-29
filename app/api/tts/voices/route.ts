import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider') || 'all';
    const language = searchParams.get('language') || 'all';

    // 从环境变量获取外部TTS API地址
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3099';
    
    let data;
    
    try {
      // 尝试调用外部TTS API获取语音列表
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超时
      
      const response = await fetch(`${apiUrl}/api/tts/voices?provider=${provider}&language=${language}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to fetch voices: ${response.status}`);
      }

      data = await response.json();
    } catch (fetchError) {
      console.error('External API not available:', fetchError instanceof Error ? fetchError.message : String(fetchError));
      throw new Error('TTS service is currently unavailable');
    }
    
    // 处理语音数据，标记Google语音为高级语音
    if (data.data) {
      // 处理Microsoft语音
      if (data.data.microsoft && data.data.microsoft.grouped) {
        Object.keys(data.data.microsoft.grouped).forEach(langCode => {
          data.data.microsoft.grouped[langCode] = data.data.microsoft.grouped[langCode].map((voice: any) => ({
            ...voice,
            isPremium: false,
            provider: 'microsoft'
          }));
        });
      }

      // 处理Microsoft API语音
      if (data.data['microsoft-api'] && data.data['microsoft-api'].grouped) {
        Object.keys(data.data['microsoft-api'].grouped).forEach(langCode => {
          data.data['microsoft-api'].grouped[langCode] = data.data['microsoft-api'].grouped[langCode].map((voice: any) => ({
            ...voice,
            isPremium: false,
            provider: 'microsoft-api'
          }));
        });
      }

      // 处理Google语音 - 标记为高级语音
      if (data.data.google && data.data.google.grouped) {
        Object.keys(data.data.google.grouped).forEach(langCode => {
          data.data.google.grouped[langCode] = data.data.google.grouped[langCode].map((voice: any) => ({
            ...voice,
            isPremium: true, // Google语音标记为高级
            provider: 'google'
          }));
        });
      }

      // 处理Google GenAI语音 - 标记为高级语音
      if (data.data['google-genai'] && data.data['google-genai'].grouped) {
        Object.keys(data.data['google-genai'].grouped).forEach(langCode => {
          data.data['google-genai'].grouped[langCode] = data.data['google-genai'].grouped[langCode].map((voice: any) => ({
            ...voice,
            isPremium: true, // Google GenAI语音标记为高级
            provider: 'google-genai'
          }));
        });
      }
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching voices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch voices' },
      { status: 500 }
    );
  }
}